import { query } from "@/lib/db";
import { ok, serverError } from "@/lib/http";

export async function GET() {
  try {
    const [stats] = await query(`
      SELECT
        (SELECT COUNT(*) FROM beneficiaries WHERE is_active = 1) AS beneficiaries,
        (SELECT COUNT(*) FROM assistance_programs WHERE status = 'aktif') AS activePrograms,
        (SELECT COALESCE(SUM(amount), 0) FROM distributions WHERE status = 'berhasil') AS distributed,
        (SELECT COUNT(DISTINCT b.region_id)
          FROM distributions d
          JOIN beneficiary_programs bp ON bp.id = d.beneficiary_program_id
          JOIN beneficiaries b ON b.id = bp.beneficiary_id
          WHERE d.status = 'berhasil') AS regions
    `);
    return ok({
      beneficiaries: Number(stats.beneficiaries),
      activePrograms: Number(stats.activePrograms),
      distributed: Number(stats.distributed),
      regions: Number(stats.regions),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return serverError(error);
  }
}
