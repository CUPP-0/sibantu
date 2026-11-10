"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Search, ShieldCheck } from "lucide-react";

const currency = (value) => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
}).format(value || 0);

export default function ClaimHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function searchHistory(event) {
    event?.preventDefault();
    setLoading(true);
    setError("");
    const form = event?.currentTarget;
    const fields = form ? new FormData(form) : new FormData();
    const search = new URLSearchParams();
    const name = String(fields.get("name") || "").trim();
    const from = String(fields.get("from") || "");
    const to = String(fields.get("to") || "");
    if (name) search.set("name", name);
    if (from) search.set("from", from);
    if (to) search.set("to", to);
    try {
      const response = await fetch(`/api/admin/claims/history${search.size ? `?${search}` : ""}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Riwayat pengambilan tidak dapat dimuat.");
      setHistory(result.data);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => searchHistory());
  }, []);

  return (
    <div>
      <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]">Catatan cabang</p><h1 className="mt-2 text-[26px] font-bold tracking-[-0.05em]">Riwayat pengambilan bantuan.</h1><p className="mt-2 max-w-[700px] text-[11px] leading-5 text-[#77778a]">Riwayat yang ditampilkan hanya pengambilan bantuan. Catatan reset tetap tersimpan untuk audit, tetapi tidak ditampilkan dalam daftar ini.</p></div>
      {error && <p role="alert" className="mb-4 rounded-xl bg-[#fff3f3] p-3 text-[10px] text-[#a93434]">{error}</p>}
      <section className="overflow-hidden rounded-[17px] border border-[#eae8f0] bg-white">
        <div className="flex items-center gap-3 border-b border-[#f0eef4] px-5 py-4"><span className="flex size-9 items-center justify-center rounded-[11px] bg-[#f3f6d8] text-[#111111]"><ShieldCheck size={17} /></span><div><h2 className="text-[13px] font-bold">Catatan pengambilan</h2><p className="mt-1 text-[10px] text-[#9290a0]">Maksimal 500 pengambilan terbaru sesuai filter.</p></div></div>
        <form onSubmit={searchHistory} className="grid gap-3 border-b border-[#f0eef4] p-4 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_auto] xl:items-end">
          <label className="grid gap-1.5 text-[10px] font-semibold text-[#4f4d60]">Cari nama penerima<div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9290a0]" /><input name="name" maxLength={150} className="form-control pl-9 text-[11px] font-normal" placeholder="Ketik nama warga" /></div></label>
          <label className="grid gap-1.5 text-[10px] font-semibold text-[#4f4d60]">Dari tanggal<div className="relative"><CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9290a0]" /><input name="from" type="date" className="form-control pl-9 text-[11px] font-normal" /></div></label>
          <label className="grid gap-1.5 text-[10px] font-semibold text-[#4f4d60]">Sampai tanggal<div className="relative"><CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9290a0]" /><input name="to" type="date" className="form-control pl-9 text-[11px] font-normal" /></div></label>
          <button disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#111111] px-4 text-[10px] font-semibold text-white hover:bg-[#000000] disabled:opacity-50"><Search size={13} />{loading ? "Mencariâ€¦" : "Cari riwayat"}</button>
        </form>
        {loading && <p className="p-6 text-center text-[11px] text-[#77778a]">Memuat riwayatâ€¦</p>}
        {!loading && !error && !history.length && <p className="p-7 text-center text-[11px] text-[#77778a]">Tidak ada riwayat pengambilan yang cocok dengan pencarian.</p>}
        {!loading && history.length > 0 && <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[10px]">
            <thead className="bg-[#f8f8f5] text-[#9290a0]"><tr><th className="px-4 py-3 font-semibold">Tanggal dan jam</th><th className="px-4 py-3 font-semibold">Penerima / program</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Petugas</th><th className="px-4 py-3 font-semibold">Nilai</th><th className="px-4 py-3 font-semibold">Referensi</th></tr></thead>
            <tbody>{history.map((entry) => <tr key={entry.id} className="border-t border-[#f0eef4]">
              <td className="whitespace-nowrap px-4 py-3">{new Date(entry.occurredAt).toLocaleString("id-ID")}</td>
              <td className="px-4 py-3"><p className="font-semibold text-[#424052]">{entry.beneficiaryName}</p><p className="mt-1 text-[9px] text-[#77778a]">{entry.programName} Â· {entry.regionName}</p></td>
              <td className="px-4 py-3"><span className="rounded-full bg-[#eff8f3] px-2.5 py-1 text-[9px] font-semibold text-[#218755]">Sudah mengambil</span></td>
              <td className="px-4 py-3">{entry.officerName || "â€”"}</td><td className="px-4 py-3">{currency(entry.amount)}</td><td className="px-4 py-3 font-mono text-[8px]">{entry.referenceNumber || "â€”"}</td>
            </tr>)}</tbody>
          </table>
        </div>}
      </section>
    </div>
  );
}
