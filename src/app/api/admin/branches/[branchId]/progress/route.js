import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";
import { getMonthlyDistributionStats } from "@/lib/monthly-distributions";
import { fail, ok, serverError } from "@/lib/http";

export async function GET(_request, { params }) {
  const access = await requireRole(["super_admin"]);
  if (access.error) return fail(access.error, access.status);
  const { branchId } = await params;
  if (!/^[1-9]\d*$/.test(branchId)) return fail("Cabang tidak valid.", 400);

  try {
    const branches = await query(
      `SELECT u.id AS adminId, u.name AS adminName, u.email, u.is_active AS isActive,
        u.wilayah_id AS regionId, r.name AS regionName, r.level AS regionLevel
       FROM users u
       JOIN regions r ON r.id = u.wilayah_id
       WHERE u.id = ? AND u.role = 'admin_daerah'
       LIMIT 1`,
      [branchId],
    );
    const branch = branches[0];
    if (!branch) return fail("Admin cabang tidak ditemukan.", 404);

    const regionRows = await query(
      `WITH RECURSIVE region_tree AS (
        SELECT id FROM regions WHERE id = ?
        UNION ALL
        SELECT child.id FROM regions child JOIN region_tree parent ON child.parent_id = parent.id
      )
      SELECT id FROM region_tree`,
      [branch.regionId],
    );
    const regionIds = regionRows.map((region) => region.id);
    const [programs, processes, monthlyDistributions] = await Promise.all([
      query(
      `WITH RECURSIVE region_tree AS (
        SELECT id FROM regions WHERE id = ?
        UNION ALL
        SELECT child.id FROM regions child JOIN region_tree parent ON child.parent_id = parent.id
      )
      SELECT p.id AS programId, p.name AS programName, p.status AS programStatus,
        COUNT(bp.id) AS recipientCount,
        SUM(CASE WHEN d.status = 'berhasil' THEN 1 ELSE 0 END) AS distributedCount,
        SUM(CASE WHEN d.id IS NULL OR d.status IN ('menunggu', 'dijadwalkan') THEN 1 ELSE 0 END) AS pendingCount,
        SUM(CASE WHEN d.status IN ('gagal', 'ditunda') THEN 1 ELSE 0 END) AS issueCount,
        COALESCE(SUM(CASE WHEN d.status = 'berhasil' THEN d.amount ELSE 0 END), 0) AS distributedAmount
       FROM beneficiaries b
       JOIN beneficiary_programs bp ON bp.beneficiary_id = b.id
       JOIN assistance_programs p ON p.id = bp.program_id
       LEFT JOIN distributions d ON d.beneficiary_program_id = bp.id
       WHERE b.is_active = 1 AND b.region_id IN (SELECT id FROM region_tree)
       GROUP BY p.id, p.name, p.status
       ORDER BY p.name`,
      [branch.regionId],
      ),
      query(
      `WITH RECURSIVE region_tree AS (
        SELECT id FROM regions WHERE id = ?
        UNION ALL
        SELECT child.id FROM regions child JOIN region_tree parent ON child.parent_id = parent.id
      )
      SELECT b.name AS beneficiaryName, r.name AS regionName, p.name AS programName,
        COALESCE(d.status, 'menunggu') AS distributionStatus,
        COALESCE(d.amount, bp.assistance_amount, p.amount, 0) AS amount,
        d.distribution_date AS distributionDate, d.reference_number AS referenceNumber
       FROM beneficiaries b
       JOIN beneficiary_programs bp ON bp.beneficiary_id = b.id
       JOIN assistance_programs p ON p.id = bp.program_id
       JOIN regions r ON r.id = b.region_id
       LEFT JOIN distributions d ON d.beneficiary_program_id = bp.id
       WHERE b.is_active = 1 AND b.region_id IN (SELECT id FROM region_tree)
       ORDER BY COALESCE(d.distribution_date, bp.created_at) DESC
       LIMIT 100`,
      [branch.regionId],
      ),
      getMonthlyDistributionStats(regionIds),
    ]);

    return ok({
      branch: { ...branch, isActive: Boolean(branch.isActive) },
      programs: programs.map((program) => ({
        ...program,
        recipientCount: Number(program.recipientCount),
        distributedCount: Number(program.distributedCount),
        pendingCount: Number(program.pendingCount),
        issueCount: Number(program.issueCount),
        distributedAmount: Number(program.distributedAmount),
      })),
      processes: processes.map((process) => ({
        ...process,
        amount: Number(process.amount),
      })),
      monthlyDistributions,
    });
  } catch (error) {
    return serverError(error);
  }
}
