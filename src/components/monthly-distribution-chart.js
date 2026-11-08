"use client";

import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const currency = (value) => `Rp ${new Intl.NumberFormat("id-ID").format(value || 0)}`;

export default function MonthlyDistributionChart({ data, title = "Penyaluran bulanan", description }) {
  const chartData = (data || []).map((row) => ({
    ...row,
    label: new Date(`${row.month}-01T00:00:00`).toLocaleDateString("id-ID", {
      month: "short",
      year: "2-digit",
    }),
  }));
  const totalAmount = chartData.reduce((sum, row) => sum + row.amount, 0);
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonth = chartData.find((row) => row.month === currentMonthKey);

  return (
    <section className="rounded-[17px] border border-[#eae8f0] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[12px] font-bold">{title}</h2>
          <p className="mt-1 text-[9px] text-[#9290a0]">{description || "Nilai bantuan yang berhasil disalurkan selama 12 bulan terakhir."}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-[#9290a0]">Bulan ini</p>
          <p className="mt-1 text-[13px] font-bold text-[#424052]">{currency(currentMonth?.amount || 0)}</p>
          <p className="mt-1 text-[8px] text-[#9290a0]">Total 12 bulan: {currency(totalAmount)}</p>
        </div>
      </div>
      {chartData.length ? (
        <div className="mt-4 h-[230px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="#f0eef4" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#9290a0", fontSize: 9 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9290a0", fontSize: 9 }} tickFormatter={(value) => `${Math.round(value / 1_000_000)} jt`} />
              <Tooltip
                formatter={(value, _name, item) => [currency(value), `${item.payload.transactions} penyaluran`]}
                contentStyle={{ borderRadius: 12, borderColor: "#eae8f0", fontSize: 10 }}
              />
              <Bar dataKey="amount" name="Nilai penyaluran" fill="#6d4aff" radius={[5, 5, 0, 0]} maxBarSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="py-12 text-center text-[10px] text-[#9290a0]">Belum ada data bulanan.</p>}
    </section>
  );
}
