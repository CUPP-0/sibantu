import { requireRole } from "@/lib/auth";
import { verifyCitizenClaimQr } from "@/lib/citizen-claim-qr";
import { getRegionScope } from "@/lib/admin-regions";
import { query } from "@/lib/db";
import { fail, isSameOriginRequest, ok, serverError } from "@/lib/http";
import { citizenClaimQrSchema } from "@/lib/validation";

export async function POST(request) {
  if (!isSameOriginRequest(request)) return fail("Permintaan tidak valid.", 403);
  try {
    const access = await requireRole(["admin_daerah"]);
    if (access.error) return fail(access.error, access.status);
    const parsed = citizenClaimQrSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return fail("QR warga tidak valid atau sudah kedaluwarsa.");
    const token = verifyCitizenClaimQr(parsed.data.token);
    if (!token) return fail("QR warga tidak valid atau sudah kedaluwarsa.", 410);

    const regionIds = await getRegionScope(access.user);
    if (!regionIds?.length) return fail("Wilayah kerja akun belum diatur.", 403);
    const [record] = await query(
      `SELECT bc.beneficiary_program_id AS beneficiaryProgramId,
        bc.status AS claimStatus, bc.cycle_number AS cycleNumber, bc.claimed_at AS claimedAt,
        bp.eligibility_status AS eligibilityStatus, bp.verification_status AS verificationStatus,
        b.name AS beneficiaryName, b.region_id AS regionId, b.is_active AS beneficiaryIsActive,
        r.name AS regionName, p.name AS programName, COALESCE(bp.assistance_amount, p.amount) AS amount,
        u.is_active AS citizenIsActive
       FROM beneficiary_claims bc
       JOIN beneficiary_programs bp ON bp.id = bc.beneficiary_program_id
       JOIN beneficiaries b ON b.id = bp.beneficiary_id
       JOIN regions r ON r.id = b.region_id
       JOIN assistance_programs p ON p.id = bp.program_id
       JOIN citizen_accounts ca ON ca.beneficiary_id = b.id
       JOIN users u ON u.id = ca.user_id
       WHERE bc.beneficiary_program_id = ? AND ca.user_id = ?
       LIMIT 1`,
      [token.programEnrollmentId, token.userId],
    );
    if (!record) return fail("QR tidak terdaftar untuk akun warga ini.", 404);
    if (Number(record.cycleNumber) !== token.cycleNumber) return fail("QR sudah diperbarui. Minta warga menampilkan QR terbaru.", 409);
    if (!regionIds.includes(record.regionId)) return fail("QR berasal dari luar wilayah cabang Anda.", 403);
    if (!record.citizenIsActive || !record.beneficiaryIsActive) return fail("Akun penerima tidak aktif.", 409);
    if (record.verificationStatus !== "terverifikasi" || record.eligibilityStatus !== "layak") {
      return fail("Penerima belum lolos verifikasi untuk program ini.", 409);
    }
    if (record.claimStatus === "sudah_diambil") return fail("Bantuan untuk program ini sudah diambil.", 409);

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
