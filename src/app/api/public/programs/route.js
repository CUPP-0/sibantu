import { query } from "@/lib/db";
import { ok, serverError } from "@/lib/http";

export async function GET() {
  try {
    const programs = await query(`
      SELECT p.id, p.name, p.description, p.category, p.assistance_type AS assistanceType,
        p.amount, p.quota, p.start_date AS startDate, p.end_date AS endDate, p.status,
        COUNT(DISTINCT CASE WHEN bp.verification_status = 'terverifikasi' THEN bp.id END) AS recipients
      FROM assistance_programs p
      LEFT JOIN beneficiary_programs bp ON bp.program_id = p.id
      WHERE p.status IN ('aktif', 'selesai')
      GROUP BY p.id
      ORDER BY p.start_date DESC, p.id DESC
    `);
    return ok(programs.map((program) => ({
      ...program,
      amount: program.amount === null ? null : Number(program.amount),
      quota: Number(program.quota),
      recipients: Number(program.recipients),
    })));
  } catch (error) {
    return serverError(error);
  }
}
