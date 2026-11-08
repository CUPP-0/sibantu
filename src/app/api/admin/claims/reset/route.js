import { requireRole } from "@/lib/auth";
import { getRegionScope } from "@/lib/admin-regions";
import { getPool } from "@/lib/db";
import { fail, isSameOriginRequest, ok, serverError } from "@/lib/http";

export async function POST(request) {
  if (!isSameOriginRequest(request)) return fail("Permintaan tidak valid.", 403);
  const access = await requireRole(["admin_daerah"]);
  if (access.error) return fail(access.error, access.status);
  const regionIds = await getRegionScope(access.user);
  if (!regionIds?.length) return fail("Wilayah kerja akun belum diatur.", 403);

  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const [claims] = await connection.execute(
      `SELECT bc.beneficiary_program_id AS beneficiaryProgramId,
        bc.cycle_number AS cycleNumber, COALESCE(d.amount, bp.assistance_amount, p.amount) AS amount
       FROM beneficiary_claims bc
       JOIN beneficiary_programs bp ON bp.id = bc.beneficiary_program_id
       JOIN beneficiaries b ON b.id = bp.beneficiary_id
       JOIN assistance_programs p ON p.id = bp.program_id
       LEFT JOIN distributions d ON d.beneficiary_program_id = bp.id
       WHERE b.region_id IN (${regionIds.map(() => "?").join(", ")})
         AND bc.status = 'sudah_diambil'
       FOR UPDATE`,
      regionIds,
    );
    for (const claim of claims) {
      await connection.execute(
        `INSERT INTO beneficiary_claim_history
          (beneficiary_program_id, cycle_number, action, officer_id, amount, notes)
         VALUES (?, ?, 'reset', ?, ?, 'Status pengambilan direset oleh admin cabang')`,
        [claim.beneficiaryProgramId, claim.cycleNumber, access.user.id, claim.amount || 0],
      );
    }
    await connection.execute(
      `UPDATE beneficiary_claims bc
       JOIN beneficiary_programs bp ON bp.id = bc.beneficiary_program_id
       JOIN beneficiaries b ON b.id = bp.beneficiary_id
       SET bc.cycle_number = bc.cycle_number + IF(bc.status = 'sudah_diambil', 1, 0),
         bc.status = 'belum_diambil', bc.claimed_at = NULL, bc.claimed_by = NULL
       WHERE b.region_id IN (${regionIds.map(() => "?").join(", ")})`,
      regionIds,
    );
    await connection.execute(
      `UPDATE distributions d
       JOIN beneficiary_programs bp ON bp.id = d.beneficiary_program_id
       JOIN beneficiaries b ON b.id = bp.beneficiary_id
       SET d.status = 'menunggu', d.notes = 'Status pengambilan direset; riwayat klaim tersimpan'
       WHERE b.region_id IN (${regionIds.map(() => "?").join(", ")}) AND d.status = 'berhasil'`,
      regionIds,
    );
    await connection.execute(
      "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata) VALUES (?, 'reset_beneficiary_claims', 'region', ?, ?)",
      [access.user.id, access.user.regionId, JSON.stringify({ resetCount: claims.length })],
    );
    await connection.commit();
    return ok({ resetCount: claims.length });
  } catch (error) {
    await connection.rollback();
    return serverError(error);
  } finally {
    connection.release();
  }
}
