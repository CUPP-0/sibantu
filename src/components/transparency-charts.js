"use client";

import { useEffect, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";

const colors = ["#6d4aff", "#a99af7", "#c5bbfa", "#ddd7fc", "#8b77e9"];

function Rupiah({ value }) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value || 0)}`;
}

export default function TransparencyCharts() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/public/distributions").then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Data distribusi tidak tersedia.");
        return result.data;
      }),
      fetch("/api/public/statistics").then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Statistik tidak tersedia.");
        return result.data;
      }),
    ]).then(([distributions, stats]) => setData({ ...distributions, stats }))
      .catch((cause) => setError(cause.message));
  }, []);

  if (error) return <div role="alert" className="rounded-2xl border border-[#f1d8d8] bg-white p-5 text-sm text-[#a93434]">{error} Hubungkan MySQL untuk memuat transparansi dari data aktual.</div>;
  if (!data) return <div className="rounded-2xl border border-[#eae8f0] bg-white p-8 text-center text-sm text-[#77778a]">Memuat data distribusi…</div>;

  const monthData = data.monthly.map((row) => ({
    ...row,
    label: new Date(`${row.month}-01T00:00:00`).toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
  }));
  const total = data.stats.distributed;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Penerima aktif", new Intl.NumberFormat("id-ID").format(data.stats.beneficiaries)],
          ["Total penyaluran tercatat", Rupiah({ value: total })],
          ["Program aktif", new Intl.NumberFormat("id-ID").format(data.stats.activePrograms)],
          ["Wilayah terjangkau", new Intl.NumberFormat("id-ID").format(data.stats.regions)],
        ].map(([label, value]) => <div key={label} className="rounded-[16px] border border-[#eae8f0] bg-white p-4"><p className="text-[11px] text-[#77778a]">{label}</p><p className="mt-2 text-[19px] font-bold tracking-[-0.04em]">{value}</p></div>)}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
        <section className="rounded-[18px] border border-[#eae8f0] bg-white p-5">
          <div><h2 className="text-[14px] font-bold">Tren penyaluran bulanan</h2><p className="mt-1 text-[11px] text-[#9290a0]">Nilai bantuan yang berhasil disalurkan selama 12 bulan terakhir.</p></div>
          {monthData.length ? <div className="mt-5 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthData} margin={{ top: 8, right: 4, left: 0, bottom: 4 }}>
                <CartesianGrid stroke="#f0eef4" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#9290a0", fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9290a0", fontSize: 10 }} tickFormatter={(value) => `${Math.round(value / 1_000_000)} jt`} />
                <Tooltip formatter={(value) => Rupiah({ value })} contentStyle={{ borderRadius: 12, borderColor: "#eae8f0", fontSize: 11 }} />
                <Bar dataKey="amount" fill="#6d4aff" radius={[5, 5, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div> : <p className="py-16 text-center text-sm text-[#9290a0]">Belum ada penyaluran berhasil dalam periode ini.</p>}
        </section>
        <section className="rounded-[18px] border border-[#eae8f0] bg-white p-5">
          <h2 className="text-[14px] font-bold">Distribusi per program</h2><p className="mt-1 text-[11px] text-[#9290a0]">Komposisi penyaluran berdasarkan program.</p>
          {data.byProgram.length ? <>
            <div className="mt-2 h-[190px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.byProgram} dataKey="amount" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3}>{data.byProgram.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={(value) => Rupiah({ value })} contentStyle={{ borderRadius: 12, borderColor: "#eae8f0", fontSize: 11 }} /></PieChart></ResponsiveContainer></div>
            <div className="grid gap-2">{data.byProgram.slice(0, 5).map((program, index) => <div key={program.name} className="flex items-center justify-between gap-3 text-[10px]"><span className="flex items-center gap-2 text-[#656376]"><i className="size-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />{program.name}</span><span className="font-semibold">{Rupiah({ value: program.amount })}</span></div>)}</div>
          </> : <p className="py-16 text-center text-sm text-[#9290a0]">Belum ada data penyaluran.</p>}
        </section>
      </div>
      <section className="mt-4 overflow-hidden rounded-[18px] border border-[#eae8f0] bg-white">
        <div className="border-b border-[#f0eef4] px-5 py-4"><h2 className="text-[14px] font-bold">Ringkasan distribusi per wilayah</h2><p className="mt-1 text-[11px] text-[#9290a0]">Informasi agregat tanpa alamat atau identitas penerima.</p></div>
        {data.byRegion.length ? <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-[11px]"><thead className="bg-[#faf9fc] text-[#9290a0]"><tr><th className="px-5 py-3 font-semibold">Wilayah</th><th className="px-5 py-3 font-semibold">Penyaluran berhasil</th><th className="px-5 py-3 font-semibold">Nilai bantuan</th></tr></thead><tbody>{data.byRegion.map((region) => <tr key={region.name} className="border-t border-[#f3f1f6]"><td className="px-5 py-3.5 font-semibold text-[#464457]">{region.name}</td><td className="px-5 py-3.5 text-[#77778a]">{new Intl.NumberFormat("id-ID").format(region.transactions)} transaksi</td><td className="px-5 py-3.5 font-semibold text-[#464457]">{Rupiah({ value: region.amount })}</td></tr>)}</tbody></table></div> : <p className="p-8 text-center text-sm text-[#9290a0]">Belum ada data per wilayah.</p>}
      </section>
    </>
  );
}
