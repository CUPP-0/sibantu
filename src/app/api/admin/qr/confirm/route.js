import { createHash, randomBytes } from "node:crypto";
import { requireRole } from "@/lib/auth";
import { getRegionScope } from "@/lib/admin-regions";
import { getPool } from "@/lib/db";
import { fail, isSameOriginRequest, ok, serverError } from "@/lib/http";
import { qrTokenSchema } from "@/lib/validation";

export async function POST(request) {
  if (!isSameOriginRequest(request)) return fail("Permintaan tidak valid.", 403);
  const access = await requireRole(["admin_daerah"]);
  if (access.error) return fail(access.error, access.status);
  const parsed = qrTokenSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("QR tidak valid atau tidak dapat dibaca.");
  const regionIds = await getRegionScope(access.user);
  if (!regionIds?.length) return fail("Wilayah kerja akun belum diatur.", 403);

  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
    const [records] = await connection.execute(
      `SELECT qt.id AS qrId, qt.is_active AS isActive, qt.expires_at AS expiresAt,
        bp.id AS beneficiaryProgramId, bp.eligibility_status AS eligibilityStatus,
        bp.verification_status AS verificationStatus,
        b.id AS beneficiaryId, b.name AS beneficiaryName, b.region_id AS regionId,
        b.is_active AS beneficiaryIsActive, p.name AS programName, p.amount
       FROM qr_tokens qt
       JOIN beneficiary_programs bp ON bp.id = qt.beneficiary_program_id
       JOIN beneficiaries b ON b.id = bp.beneficiary_id
       JOIN assistance_programs p ON p.id = bp.program_id
       WHERE qt.token_hash = ?
       FOR UPDATE`,
      [tokenHash],
    );
    const record = records[0];
    if (!record) {
      await connection.rollback();
      return fail("QR tidak ditemukan.", 404);
    }
    if (!regionIds.includes(record.regionId)) {
      await connection.rollback();
      return fail("QR berasal dari luar wilayah cabang Anda.", 403);
    }
    if (!record.beneficiaryIsActive || record.verificationStatus !== "terverifikasi" || record.eligibilityStatus !== "layak") {
      await connection.rollback();
      return fail("Penerima belum memenuhi syarat penyaluran.", 409);
    }
    if (!record.isActive || (record.expiresAt && new Date(record.expiresAt).getTime() <= Date.now())) {
      await connection.rollback();
      return fail("QR sudah digunakan atau kedaluwarsa.", 409);
    }

    const [existing] = await connection.execute(
      "SELECT id, status FROM distributions WHERE beneficiary_program_id = ? FOR UPDATE",
      [record.beneficiaryProgramId],
    );
    if (existing.some((distribution) => distribution.status === "berhasil")) {
      await connection.rollback();
      return fail("Bantuan untuk program ini sudah tercatat tersalurkan.", 409);
    }

    const referenceNumber = `BG-QR-${randomBytes(12).toString("hex").toUpperCase()}`;
    if (existing.length) {
      await connection.execute(
        `UPDATE distributions SET officer_id = ?, amount = ?, distribution_date = CURRENT_TIMESTAMP,
          status = 'berhasil', reference_number = ?, notes = 'Dikonfirmasi melalui verifikasi QR'
         WHERE id = ?`,
        [access.user.id, record.amount || 0, referenceNumber, existing[0].id],
      );
    } else {
      await connection.execute(
        `INSERT INTO distributions
          (beneficiary_program_id, officer_id, amount, distribution_date, status, reference_number, notes)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'berhasil', ?, 'Dikonfirmasi melalui verifikasi QR')`,
        [record.beneficiaryProgramId, access.user.id, record.amount || 0, referenceNumber],
      );
    }
    await connection.execute("UPDATE qr_tokens SET is_active = 0 WHERE id = ?", [record.qrId]);
    await connection.execute(
      "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata) VALUES (?, 'confirm_qr_distribution', 'beneficiary_program', ?, ?)",
      [access.user.id, record.beneficiaryProgramId, JSON.stringify({ referenceNumber, regionId: record.regionId })],
    );
    await connection.commit();
    return ok({ referenceNumber, beneficiaryName: record.beneficiaryName, programName: record.programName });
  } catch (error) {
    await connection.rollback();
    return serverError(error);
  } finally {
    connection.release();
  }
}
