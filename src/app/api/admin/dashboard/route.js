import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";
import { getMonthlyDistributionStats } from "@/lib/monthly-distributions";
import { fail, ok, serverError } from "@/lib/http";

export async function GET() {
  try {
    const access = await requireRole(["super_admin", "admin_daerah", "petugas"]);
    if (access.error) return fail(access.error, access.status);
    const { user } = access;
    let regionIds = null;
    if (user.role !== "super_admin") {
      if (!user.regionId) return fail("Akun belum memiliki wilayah kerja.", 403);
      const descendants = await query(
        `WITH RECURSIVE region_tree AS (
          SELECT id FROM regions WHERE id = ?
          UNION ALL
          SELECT child.id FROM regions child JOIN region_tree parent ON child.parent_id = parent.id
        )
        SELECT id FROM region_tree`,
        [user.regionId],
      );
      regionIds = descendants.map((region) => region.id);
      if (!regionIds.length) return fail("Wilayah kerja akun tidak ditemukan.", 403);
    }
    const regionFilter = regionIds ? `IN (${regionIds.map(() => "?").join(", ")})` : null;
    const beneficiaryScope = regionFilter ? `b.region_id ${regionFilter}` : "1 = 1";
    const complaintScope = regionFilter ? `c.region_id ${regionFilter}` : "1 = 1";
    const regionParams = regionIds || [];
    const [stats] = await query(
      `SELECT
        (SELECT COUNT(*) FROM beneficiaries b WHERE b.is_active = 1 AND ${beneficiaryScope}) AS beneficiaries,
        (SELECT COUNT(*) FROM assistance_programs WHERE status = 'aktif') AS activePrograms,
        (SELECT COUNT(*) FROM distributions d
          JOIN beneficiary_programs bp ON bp.id = d.beneficiary_program_id
          JOIN beneficiaries b ON b.id = bp.beneficiary_id
          WHERE d.status = 'berhasil' AND ${beneficiaryScope}) AS distributedCount,
        (SELECT COUNT(*) FROM distributions d
          JOIN beneficiary_programs bp ON bp.id = d.beneficiary_program_id
          JOIN beneficiaries b ON b.id = bp.beneficiary_id
          WHERE d.status = 'menunggu' AND ${beneficiaryScope}) AS pendingDistributions,
        (SELECT COUNT(*) FROM complaints c WHERE ${complaintScope}) AS complaints`,
      [...regionParams, ...regionParams, ...regionParams, ...regionParams],
    );
    const monthlyDistributions = await getMonthlyDistributionStats(regionIds);
    return ok({
      user: { name: user.name, role: user.role },
      stats: Object.fromEntries(Object.entries(stats).map(([key, value]) => [key, Number(value)])),
      monthlyDistributions,
    });
  } catch (error) {
    return serverError(error);
  }
}
