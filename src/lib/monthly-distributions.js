import { query } from "@/lib/db";

export async function getMonthlyDistributionStats(regionIds = null) {
  if (regionIds && !regionIds.length) return [];

  const regionFilter = regionIds
    ? `AND b.region_id IN (${regionIds.map(() => "?").join(", ")})`
    : "";
  const monthlyRows = await query(
    `SELECT TO_CHAR(d.distribution_date, 'YYYY-MM') AS month,
      COUNT(*) AS transactions, COALESCE(SUM(d.amount), 0) AS amount
     FROM distributions d
     JOIN beneficiary_programs bp ON bp.id = d.beneficiary_program_id
     JOIN beneficiaries b ON b.id = bp.beneficiary_id
     WHERE d.status = 'berhasil'
       AND d.distribution_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
       AND d.distribution_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
       ${regionFilter}
     GROUP BY TO_CHAR(d.distribution_date, 'YYYY-MM')
     ORDER BY month`,
    regionIds || [],
  );
  const rowsByMonth = new Map(
    monthlyRows.map((row) => [
      row.month,
      { transactions: Number(row.transactions), amount: Number(row.amount) },
    ]),
  );
  const currentMonth = new Date();
  const months = [];

  for (let offset = 11; offset >= 0; offset -= 1) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - offset, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const values = rowsByMonth.get(month) || { transactions: 0, amount: 0 };
    months.push({
      month,
      transactions: values.transactions,
      amount: values.amount,
    });
  }

  return months;
}
