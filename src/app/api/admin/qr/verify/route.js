import { createHash } from "node:crypto";
import { requireRole } from "@/lib/auth";
import { getRegionScope } from "@/lib/admin-regions";
import { query } from "@/lib/db";
import { fail, isSameOriginRequest, ok, serverError } from "@/lib/http";
import { qrTokenSchema } from "@/lib/validation";

export async function POST(request) {
  if (!isSameOriginRequest(request)) return fail("Permintaan tidak valid.", 403);
  try {
    const access = await requireRole(["admin_daerah"]);
    if (access.error) return fail(access.error, access.status);
    const parsed = qrTokenSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return fail("QR tidak valid atau tidak dapat dibaca.");
    const regionIds = await getRegionScope(access.user);
    if (!regionIds?.length) return fail("Wilayah kerja akun belum diatur.", 403);

    const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
    const [record] = await query(
      `SELECT qt.id AS qrId, qt.is_active AS isActive, qt.expires_at AS expiresAt,
        bp.id AS beneficiaryProgramId, bp.eligibility_status AS eligibilityStatus,
        bp.verification_status AS verificationStatus,
        b.name AS beneficiaryName, b.region_id AS regionId, b.is_active AS beneficiaryIsActive,
        r.name AS regionName, p.name AS programName, p.amount,
        d.status AS distributionStatus
       FROM qr_tokens qt
       JOIN beneficiary_programs bp ON bp.id = qt.beneficiary_program_id
       JOIN beneficiaries b ON b.id = bp.beneficiary_id
       JOIN regions r ON r.id = b.region_id
       JOIN assistance_programs p ON p.id = bp.program_id
       LEFT JOIN distributions d ON d.beneficiary_program_id = bp.id
       WHERE qt.token_hash = ?
       LIMIT 1`,
      [tokenHash],
    );
    if (!record) return fail("QR tidak ditemukan.", 404);
    if (!regionIds.includes(record.regionId)) return fail("QR berasal dari luar wilayah cabang Anda.", 403);
    if (!record.beneficiaryIsActive) return fail("Akun penerima sudah tidak aktif.", 409);
    if (record.verificationStatus !== "terverifikasi" || record.eligibilityStatus !== "layak") {
      return fail("Penerima belum lolos verifikasi untuk program ini.", 409);
    }
    if (record.expiresAt && new Date(record.expiresAt).getTime() <= Date.now()) {
      return fail("QR sudah kedaluwarsa. Terbitkan QR baru untuk penerima.", 410);
    }
    if (!record.isActive || record.distributionStatus === "berhasil") {
      return fail("Bantuan untuk program ini sudah pernah dicatat tersalurkan.", 409);
    }
    return ok({
      beneficiaryProgramId: record.beneficiaryProgramId,
      beneficiaryName: record.beneficiaryName,
      regionName: record.regionName,
      programName: record.programName,
      amount: record.amount === null ? null : Number(record.amount),
    });
  } catch (error) {
    return serverError(error);
  }
}
