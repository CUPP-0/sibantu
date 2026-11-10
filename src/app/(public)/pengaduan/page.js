"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, ShieldCheck } from "lucide-react";
import PageHeading from "@/components/page-heading";

const categories = [
  "Penerima tidak tepat sasaran",
  "Bantuan tidak diterima",
  "Dugaan penerima ganda",
  "Pemotongan bantuan",
  "Penyalahgunaan bantuan",
  "Masalah penyaluran",
  "Lainnya",
];

export default function ComplaintPage() {
  const [regions, setRegions] = useState([]);
  const [regionError, setRegionError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState("");

  useEffect(() => {
    fetch("/api/public/regions")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Wilayah belum tersedia.");
        setRegions(result.data);
      })
      .catch((cause) => setRegionError(cause.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      contact: formData.get("contact"),
      category: formData.get("category"),
      regionId: formData.get("regionId"),
      description: formData.get("description"),
      privacyAccepted: formData.get("privacyAccepted") === "on",
    };
    try {
      const response = await fetch("/api/public/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Pengaduan tidak dapat dikirim.");
      setTicket(result.data.ticketNumber);
      form.reset();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (ticket) {
    return (
      <div className="mx-auto max-w-[720px] px-5 py-16">
        <div className="rounded-[22px] border border-[#eae8f0] bg-white p-7 text-center sm:p-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#eff8f3] text-[#218755]"><CheckCircle2 size={29} /></span>
          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#218755]">Laporan diterima</p>
          <h1 className="mt-2 text-[28px] font-bold tracking-[-0.05em]">Terima kasih telah melapor.</h1>
          <p className="mt-2 text-[12px] text-[#77778a]">Simpan nomor tiket ini untuk memantau perkembangan pengaduan.</p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-xl bg-[#f8fbe8] px-5 py-3"><span className="font-mono text-[17px] font-bold tracking-wider text-[#000000]">{ticket}</span><button onClick={() => navigator.clipboard.writeText(ticket)} className="text-[#111111]" aria-label="Salin nomor tiket"><Copy size={16} /></button></div>
          <div className="mt-6"><Link href="/lacak-pengaduan" className="text-[12px] font-semibold text-[#111111]">Lacak status pengaduan â†’</Link></div>
          <p className="mt-5 text-[10px] leading-5 text-[#9290a0]">Data kontak disimpan terenkripsi dan hanya digunakan untuk tindak lanjut laporan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-12 lg:px-8 lg:py-16">
      <PageHeading eyebrow="Suara masyarakat" title="Sampaikan pengaduan." description="Laporkan masalah penyaluran bantuan sosial. Laporan akan ditindaklanjuti oleh petugas yang berwenang." />
      <div className="mt-8 grid items-start gap-5 lg:grid-cols-[1fr_0.65fr]">
        <form onSubmit={handleSubmit} className="grid gap-4 rounded-[20px] border border-[#eae8f0] bg-white p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[11px] font-semibold text-[#4f4d60]">Nama pelapor<input name="name" required maxLength={120} className="form-control mt-1 text-[12px] font-normal" placeholder="Nama Anda" /></label>
            <label className="grid gap-1.5 text-[11px] font-semibold text-[#4f4d60]">Nomor telepon atau email<input name="contact" required maxLength={190} className="form-control mt-1 text-[12px] font-normal" placeholder="Kontak untuk tindak lanjut" /></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[11px] font-semibold text-[#4f4d60]">Kategori pengaduan<select name="category" required className="form-control mt-1 text-[12px] font-normal">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label className="grid gap-1.5 text-[11px] font-semibold text-[#4f4d60]">Wilayah kejadian<select name="regionId" required defaultValue="" className="form-control mt-1 text-[12px] font-normal"><option value="" disabled>Pilih wilayah</option>{regions.map((region) => <option key={region.id} value={region.id}>{region.name} â€” {region.level}</option>)}</select>{regionError && <span className="mt-1 text-[10px] font-normal text-[#b23b3b]">{regionError}</span>}</label>
          </div>
          <label className="grid gap-1.5 text-[11px] font-semibold text-[#4f4d60]">Ceritakan kejadian<textarea name="description" required minLength={20} maxLength={4000} rows={5} className="form-control mt-1 resize-y text-[12px] font-normal" placeholder="Jelaskan apa yang terjadi, kapan, dan informasi lain yang membantu tindak lanjut." /></label>
          <label className="flex items-start gap-2.5 text-[10px] leading-5 text-[#77778a]"><input name="privacyAccepted" type="checkbox" required className="mt-1 accent-[#111111]" /><span>Saya menyetujui data yang saya berikan digunakan untuk penanganan laporan sesuai <Link href="/kebijakan-privasi" className="font-semibold text-[#111111]">kebijakan privasi</Link>.</span></label>
          {error && <p role="alert" className="rounded-xl bg-[#fff3f3] px-4 py-3 text-[11px] text-[#a93434]">{error}</p>}
          <button type="submit" disabled={submitting || !regions.length} className="h-11 rounded-xl bg-[#111111] px-5 text-[12px] font-semibold text-white transition hover:bg-[#000000] disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Mengirim laporanâ€¦" : "Kirim pengaduan"}</button>
        </form>
        <aside className="rounded-[20px] bg-[#f5f2ff] p-6">
          <ShieldCheck size={23} className="text-[#111111]" /><h2 className="mt-4 text-[16px] font-bold">Laporan Anda bersifat rahasia.</h2>
          <ul className="mt-3 grid gap-3 text-[11px] leading-5 text-[#6c6880]"><li>â€¢ Informasi identitas pelapor dienkripsi.</li><li>â€¢ Nomor tiket digunakan untuk pelacakan.</li><li>â€¢ Identitas Anda tidak ditampilkan kepada publik.</li></ul>
          <div className="mt-5 border-t border-[#e6e1f4] pt-4"><p className="text-[10px] leading-5 text-[#77738a]">Untuk keadaan darurat, gunakan kanal layanan resmi pemerintah di wilayah Anda.</p></div>
          <Link href="/lacak-pengaduan" className="mt-4 inline-block text-[11px] font-semibold text-[#111111]">Sudah punya tiket? Lacak laporan â†’</Link>
        </aside>
      </div>
    </div>
  );
}
