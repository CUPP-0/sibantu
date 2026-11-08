"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import PageHeading from "@/components/page-heading";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua kategori");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/programs")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Program belum dapat dimuat.");
        setPrograms(result.data);
      })
      .catch((cause) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ["Semua kategori", ...new Set(programs.map((program) => program.category))], [programs]);
  const filtered = programs.filter((program) =>
    (category === "Semua kategori" || program.category === category)
    && `${program.name} ${program.description}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8 lg:py-16">
      <PageHeading eyebrow="Program bantuan" title="Program untuk masyarakat." description="Informasi program bantuan yang sedang berjalan. Data penerima disajikan secara agregat untuk menjaga privasi." />
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9290a0]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="form-control pl-10" placeholder="Cari nama atau deskripsi program" />
        </label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="form-control sm:max-w-[230px]" aria-label="Filter kategori program">
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      {loading && <div className="mt-8 rounded-2xl border border-[#eae8f0] bg-white p-8 text-center text-sm text-[#77778a]">Memuat data program…</div>}
      {error && <div role="alert" className="mt-8 rounded-2xl border border-[#f1d8d8] bg-[#fff9f9] p-5 text-sm text-[#a93434]">{error} Pastikan Supabase sudah terhubung dan skema SiBantu sudah diimpor.</div>}
      {!loading && !error && !filtered.length && <div className="mt-8 rounded-2xl border border-dashed border-[#ddd9e8] bg-white p-10 text-center text-sm text-[#77778a]">Belum ada program yang sesuai dengan pencarian Anda.</div>}
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((program) => (
          <article key={program.id} className="rounded-[18px] border border-[#eae8f0] bg-white p-5">
            <div className="flex items-start justify-between gap-3"><span className="rounded-full bg-[#f3f0ff] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#6448d8]">{program.category}</span><span className="rounded-full bg-[#eff8f3] px-2.5 py-1 text-[9px] font-semibold text-[#218755]">{program.status === "aktif" ? "Aktif" : "Selesai"}</span></div>
            <h2 className="mt-5 text-[18px] font-bold tracking-[-0.04em]">{program.name}</h2>
            <p className="mt-2 min-h-[72px] text-[12px] leading-6 text-[#77778a]">{program.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-y border-[#f0eef4] py-3 text-[11px]">
              <div><p className="text-[#9290a0]">Penerima terverifikasi</p><p className="mt-1 font-bold text-[#3d3b4e]">{new Intl.NumberFormat("id-ID").format(program.recipients)}</p></div>
              <div><p className="text-[#9290a0]">Jenis bantuan</p><p className="mt-1 font-bold capitalize text-[#3d3b4e]">{program.assistanceType.replace("_", " ")}</p></div>
              <div><p className="text-[#9290a0]">Periode</p><p className="mt-1 font-semibold text-[#3d3b4e]">{new Date(program.startDate).toLocaleDateString("id-ID")} – {new Date(program.endDate).toLocaleDateString("id-ID")}</p></div>
              <div><p className="text-[#9290a0]">Kuota program</p><p className="mt-1 font-bold text-[#3d3b4e]">{new Intl.NumberFormat("id-ID").format(program.quota)}</p></div>
            </div>
            <Link href="/cek-bantuan" className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#6d4aff]">Informasi pengecekan <ArrowRight size={14} /></Link>
          </article>
        ))}
      </div>
    </div>
  );
}
