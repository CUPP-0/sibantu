import { randomBytes } from "node:crypto";
import { requireRole } from "@/lib/auth";
import { verifyCitizenClaimQr } from "@/lib/citizen-claim-qr";
import { getRegionScope } from "@/lib/admin-regions";
import { getPool } from "@/lib/db";
import { fail, isSameOriginRequest, ok, serverError } from "@/lib/http";
import { citizenClaimQrSchema } from "@/lib/validation";

export async function POST(request) {
  if (!isSameOriginRequest(request)) return fail("Permintaan tidak valid.", 403);
  const access = await requireRole(["admin_daerah"]);
  if (access.error) return fail(access.error, access.status);
  const parsed = citizenClaimQrSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("QR warga tidak valid atau sudah kedaluwarsa.");
  const token = verifyCitizenClaimQr(parsed.data.token);
  if (!token) return fail("QR warga tidak valid atau sudah kedaluwarsa.", 410);
  const regionIds = await getRegionScope(access.user);
  if (!regionIds?.length) return fail("Wilayah kerja akun belum diatur.", 403);

  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const [records] = await connection.execute(
      `SELECT bc.beneficiary_program_id AS beneficiaryProgramId,
        bc.status AS claimStatus, bc.cycle_number AS cycleNumber,
        bp.eligibility_status AS eligibilityStatus, bp.verification_status AS verificationStatus,
        b.id AS beneficiaryId, b.name AS beneficiaryName, b.region_id AS regionId,
        b.is_active AS beneficiaryIsActive, p.name AS programName, COALESCE(bp.assistance_amount, p.amount) AS amount,
        u.is_active AS citizenIsActive
       FROM beneficiary_claims bc
       JOIN beneficiary_programs bp ON bp.id = bc.beneficiary_program_id
       JOIN beneficiaries b ON b.id = bp.beneficiary_id
       JOIN assistance_programs p ON p.id = bp.program_id
       JOIN citizen_accounts ca ON ca.beneficiary_id = b.id
       JOIN users u ON u.id = ca.user_id
       WHERE bc.beneficiary_program_id = ? AND ca.user_id = ?
       FOR UPDATE`,
      [token.programEnrollmentId, token.userId],
    );
    const record = records[0];
    if (!record) {
      await connection.rollback();
      return fail("QR tidak terdaftar untuk akun warga ini.", 404);
    }
    if (Number(record.cycleNumber) !== token.cycleNumber) {
      await connection.rollback();
      return fail("QR sudah diperbarui. Minta warga menampilkan QR terbaru.", 409);
    }
    if (!regionIds.includes(record.regionId)) {
      await connection.rollback();
      return fail("QR berasal dari luar wilayah cabang Anda.", 403);
    }
    if (!record.citizenIsActive || !record.beneficiaryIsActive) {
      await connection.rollback();
      return fail("Akun penerima tidak aktif.", 409);
    }
    if (record.verificationStatus !== "terverifikasi" || record.eligibilityStatus !== "layak") {
      await connection.rollback();
      return fail("Penerima belum lolos verifikasi untuk program ini.", 409);
    }
    if (record.claimStatus === "sudah_diambil") {
      await connection.rollback();
      return fail("Bantuan untuk program ini sudah diambil.", 409);
    }

    const [distributions] = await connection.execute(
      "SELECT id FROM distributions WHERE beneficiary_program_id = ? FOR UPDATE",
      [record.beneficiaryProgramId],
    );
    const referenceNumber = `BG-CL-${randomBytes(12).toString("hex").toUpperCase()}`;
    if (distributions.length) {
      await connection.execute(
        `UPDATE distributions SET officer_id = ?, amount = ?, distribution_date = CURRENT_TIMESTAMP,
          status = 'berhasil', reference_number = ?, notes = 'Pengambilan dikonfirmasi melalui QR warga'
         WHERE id = ?`,
        [access.user.id, record.amount || 0, referenceNumber, distributions[0].id],
      );
    } else {
      await connection.execute(
        `INSERT INTO distributions
          (beneficiary_program_id, officer_id, amount, distribution_date, status, reference_number, notes)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'berhasil', ?, 'Pengambilan dikonfirmasi melalui QR warga')`,
        [record.beneficiaryProgramId, access.user.id, record.amount || 0, referenceNumber],
      );
    }
    await connection.execute(
      `UPDATE beneficiary_claims SET status = 'sudah_diambil', claimed_at = CURRENT_TIMESTAMP, claimed_by = ?
       WHERE beneficiary_program_id = ?`,
      [access.user.id, record.beneficiaryProgramId],
    );
    await connection.execute(
      `INSERT INTO beneficiary_claim_history
        (beneficiary_program_id, cycle_number, action, officer_id, reference_number, amount, notes)
       VALUES (?, ?, 'diambil', ?, ?, ?, 'Pengambilan dikonfirmasi melalui QR warga')`,
      [record.beneficiaryProgramId, record.cycleNumber, access.user.id, referenceNumber, record.amount || 0],
    );
    await connection.execute(
      "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata) VALUES (?, 'confirm_beneficiary_claim', 'beneficiary_program', ?, ?)",
      [access.user.id, record.beneficiaryProgramId, JSON.stringify({ referenceNumber, regionId: record.regionId, cycleNumber: record.cycleNumber })],
    );
    const [claimedRows] = await connection.execute(
      "SELECT claimed_at AS claimedAt FROM beneficiary_claims WHERE beneficiary_program_id = ?",
      [record.beneficiaryProgramId],
    );
    await connection.commit();
    return ok({
      beneficiaryName: record.beneficiaryName,
      programName: record.programName,
      referenceNumber,
      claimedAt: claimedRows[0].claimedAt,
    });
  } catch (error) {
    await connection.rollback();
    return serverError(error);
  } finally {
    connection.release();
  }
}
