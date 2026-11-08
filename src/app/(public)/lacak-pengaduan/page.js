"use client";

import { useState } from "react";
import PageHeading from "@/components/page-heading";

const labels = {
  diterima: "Laporan diterima",
  ditinjau: "Sedang ditinjau",
  investigasi: "Dalam investigasi",
  menunggu_informasi: "Menunggu informasi tambahan",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

export default function TrackComplaintPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/public/complaints/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketNumber: formData.get("ticketNumber"), contact: formData.get("contact") }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Laporan tidak dapat ditemukan.");
      setResult(payload.data);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[820px] px-5 py-12 lg:px-8 lg:py-16">
      <PageHeading eyebrow="Pelacakan pengaduan" title="Lihat perkembangan laporan." description="Masukkan nomor tiket dan kontak yang digunakan saat mengirim laporan. Identitas pelapor tidak ditampilkan." />
      <form onSubmit={handleSubmit} className="mt-8 grid gap-4 rounded-[20px] border border-[#eae8f0] bg-white p-5 sm:grid-cols-2 sm:p-7">
        <label className="grid gap-1.5 text-[11px] font-semibold text-[#4f4d60]">Nomor tiket<input name="ticketNumber" required maxLength={24} className="form-control mt-1 font-mono text-[12px] font-normal" placeholder="Contoh: BG-..." /></label>
        <label className="grid gap-1.5 text-[11px] font-semibold text-[#4f4d60]">Kontak pelapor<input name="contact" required maxLength={190} className="form-control mt-1 text-[12px] font-normal" placeholder="Nomor telepon atau email" /></label>
        {error && <p role="alert" className="rounded-xl bg-[#fff3f3] px-4 py-3 text-[11px] text-[#a93434] sm:col-span-2">{error}</p>}
        <button type="submit" disabled={loading} className="h-11 rounded-xl bg-[#6d4aff] text-[12px] font-semibold text-white transition hover:bg-[#5035c9] disabled:opacity-60 sm:col-span-2">{loading ? "Memeriksa…" : "Lacak laporan"}</button>
      </form>
      {result && <section className="mt-5 rounded-[20px] border border-[#eae8f0] bg-white p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-[10px] font-bold uppercase tracking-wider text-[#9290a0]">Nomor tiket</p><p className="mt-1 font-mono text-[14px] font-bold text-[#5035c9]">{result.complaint.ticketNumber}</p></div><span className="w-fit rounded-full bg-[#f3f0ff] px-3 py-1.5 text-[10px] font-bold text-[#6448d8]">{labels[result.complaint.status] || result.complaint.status}</span></div>
        <p className="mt-4 text-[12px] text-[#77778a]">Kategori: {result.complaint.category}</p>
        <div className="mt-5 border-t border-[#f0eef4] pt-4"><h2 className="text-[12px] font-bold">Riwayat tindak lanjut</h2><ol className="mt-4 grid gap-4">{result.history.map((item, index) => <li key={`${item.createdAt}-${index}`} className="flex gap-3"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#6d4aff]" /><div><p className="text-[11px] font-semibold">{labels[item.status] || item.status}</p><p className="mt-1 text-[10px] text-[#77778a]">{item.notes}</p><time className="mt-1 block text-[9px] text-[#9290a0]">{new Date(item.createdAt).toLocaleString("id-ID")}</time></div></li>)}</ol></div>
      </section>}
    </div>
  );
}
