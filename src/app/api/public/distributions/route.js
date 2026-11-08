import { query } from "@/lib/db";
import { ok, serverError } from "@/lib/http";

export async function GET() {
  try {
    const [monthly, byProgram, byRegion] = await Promise.all([
      query(`
        SELECT DATE_FORMAT(distribution_date, '%Y-%m') AS month,
          COUNT(*) AS transactions, COALESCE(SUM(amount), 0) AS amount
        FROM distributions
        WHERE status = 'berhasil'
          AND distribution_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(distribution_date, '%Y-%m')
        ORDER BY month
      `),
      query(`
        SELECT p.name, COUNT(d.id) AS transactions, COALESCE(SUM(d.amount), 0) AS amount
        FROM distributions d
        JOIN beneficiary_programs bp ON bp.id = d.beneficiary_program_id
        JOIN assistance_programs p ON p.id = bp.program_id
        WHERE d.status = 'berhasil'
        GROUP BY p.id, p.name
        ORDER BY amount DESC
      `),
      query(`
        SELECT r.name, COUNT(d.id) AS transactions, COALESCE(SUM(d.amount), 0) AS amount
        FROM distributions d
        JOIN beneficiary_programs bp ON bp.id = d.beneficiary_program_id
        JOIN beneficiaries b ON b.id = bp.beneficiary_id
        JOIN regions r ON r.id = b.region_id
        WHERE d.status = 'berhasil'
        GROUP BY r.id, r.name
        ORDER BY amount DESC
        LIMIT 20
      `),
    ]);

    return ok({
      monthly: monthly.map((row) => ({ ...row, transactions: Number(row.transactions), amount: Number(row.amount) })),
      byProgram: byProgram.map((row) => ({ ...row, transactions: Number(row.transactions), amount: Number(row.amount) })),
      byRegion: byRegion.map((row) => ({ ...row, transactions: Number(row.transactions), amount: Number(row.amount) })),
    });
  } catch (error) {
    return serverError(error);
  }
}
