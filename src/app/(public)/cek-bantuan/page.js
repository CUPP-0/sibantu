"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleAlert, LockKeyhole, Search, ShieldCheck } from "lucide-react";
import PageHeading from "@/components/page-heading";

const assistanceStatuses = {
  menunggu_verifikasi: "Menunggu verifikasi",
  tidak_memenuhi_kriteria: "Tidak memenuhi kriteria",
  sudah_disalurkan: "Sudah disalurkan",
  penyaluran_gagal: "Penyaluran gagal",
  penyaluran_ditunda: "Penyaluran ditunda",
  menunggu_penyaluran: "Menunggu penyaluran",
  terverifikasi: "Terverifikasi",
  sedang_diproses: "Sedang diproses",
};

const claimStatuses = {
  sudah_diambil: "Bantuan sudah diambil",
  belum_diambil: "Belum diambil",
};

const formatDate = (value) => new Date(value).toLocaleDateString("id-ID");
const formatAmount = (value) => value === null
  ? "Sesuai ketentuan program"
  : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default function CheckAssistancePage() {
  const [data, setData] = useState(null);
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  async function checkAssistance(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const nik = new FormData(form).get("nik");
    form.reset();
    setState("loading");
    setData(null);
    setError("");

    try {
      const response = await fetch("/api/public/assistance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nik }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Status bantuan belum dapat dimuat.");
      setData(result.data);
      setState("ready");
    } catch (cause) {
      setError(cause.message);
      setState("error");
    }
  }

  return (
    <div className="mx-auto max-w-[1050px] px-5 py-12 lg:px-8 lg:py-16">
      <PageHeading eyebrow="Layanan penerima" title="Cek status bantuan dengan NIK." description="Masukkan NIK yang terdaftar untuk melihat program dan status bantuan. Anda tidak perlu masuk ke akun." />
      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.72fr]">
        <section className="rounded-[20px] border border-[#eae8f0] bg-white p-6 sm:p-8">
          <div className="flex size-11 items-center justify-center rounded-[13px] bg-[#f3f0ff] text-[#6d4aff]"><Search size={21} /></div>
          <h2 className="mt-5 text-[18px] font-bold tracking-[-0.03em]">Cari data bantuan</h2>
          <p className="mt-2 text-[12px] leading-6 text-[#77778a]">NIK digunakan hanya untuk mencocokkan data. Jangan gunakan perangkat umum dan jangan bagikan hasil pencarian Anda.</p>
          <form onSubmit={checkAssistance} className="mt-5 grid gap-3">
            <label className="grid gap-1.5 text-[11px] font-semibold text-[#4f4d60]">
              NIK (16 angka)
              <input name="nik" inputMode="numeric" pattern="[0-9]{16}" minLength={16} maxLength={16} required className="form-control mt-1 text-[12px] font-normal" placeholder="Masukkan 16 angka NIK" autoComplete="off" />
            </label>
            <button disabled={state === "loading"} className="inline-flex h-10 w-fit items-center gap-2 rounded-xl bg-[#6d4aff] px-4 text-[11px] font-semibold text-white hover:bg-[#5035c9] disabled:opacity-60">
              {state === "loading" ? "Memeriksa data…" : "Cek bantuan"} <ArrowRight size={14} />
            </button>
          </form>

          {state === "error" && <div role="alert" className="mt-5 flex gap-2 rounded-[14px] border border-[#f1d8d8] bg-[#fff9f9] p-4 text-[11px] leading-5 text-[#a93434]"><CircleAlert size={16} className="mt-0.5 shrink-0" />{error}</div>}
          {state === "loading" && <div className="mt-5 h-24 animate-pulse rounded-[14px] bg-[#f7f6fa]" />}
          {data && <div className="mt-6 border-t border-[#f0eef4] pt-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-[17px] font-bold tracking-[-0.03em]">Status bantuan {data.beneficiary.name}</h2><p className="mt-1 text-[11px] text-[#77778a]">Wilayah: {data.beneficiary.regionName}</p></div>
              <span className="rounded-full bg-[#eff8f3] px-3 py-1.5 text-[10px] font-semibold capitalize text-[#218755]">{data.beneficiary.verificationStatus.replaceAll("_", " ")}</span>
            </div>
            {!data.assistance.length ? <div className="mt-5 rounded-[14px] bg-[#faf9fc] p-5 text-[11px] leading-5 text-[#77778a]">Data penerima ditemukan, tetapi belum ada program bantuan yang tercatat.</div> : (
              <div className="mt-5 grid gap-3">
                {data.assistance.map((item) => <article key={item.id} className="rounded-[14px] border border-[#eae8f0] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9290a0]">{item.category}</p><h3 className="mt-1 text-[14px] font-bold">{item.programName}</h3></div><span className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${item.status === "sudah_disalurkan" ? "bg-[#eff8f3] text-[#218755]" : "bg-[#f3f0ff] text-[#6448d8]"}`}>{assistanceStatuses[item.status] || item.status}</span></div>
                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#f0eef4] pt-3 text-[10px]">
                    <div><p className="text-[#9290a0]">Periode program</p><p className="mt-1 font-semibold text-[#484657]">{formatDate(item.startDate)} – {formatDate(item.endDate)}</p></div>
                    <div><p className="text-[#9290a0]">Nilai bantuan tercatat</p><p className="mt-1 font-semibold text-[#484657]">{formatAmount(item.amount)}</p></div>
                    <div className="col-span-2"><p className="text-[#9290a0]">Status pengambilan</p><p className="mt-1 font-semibold text-[#484657]">{claimStatuses[item.claimStatus] || "Belum ada catatan pengambilan"}</p></div>
                  </div>
                </article>)}
              </div>
            )}
            <p className="mt-4 text-[9px] leading-4 text-[#9290a0]">Informasi ini hanya untuk penerima. Untuk koreksi data, silakan hubungi petugas pada wilayah kerja Anda.</p>
          </div>}
        </section>
        <aside className="h-fit rounded-[20px] bg-[#29224c] p-6 text-white">
          <ShieldCheck size={24} className="text-[#c6baff]" />
          <h2 className="mt-4 text-[17px] font-bold">Jaga data pribadi Anda</h2>
          <ul className="mt-3 grid gap-3 text-[11px] leading-5 text-[#d3d0e0]">
            <li className="flex gap-2"><LockKeyhole size={13} className="mt-1 shrink-0" />Pengecekan tidak meminta kata sandi akun.</li>
            <li>• Gunakan perangkat pribadi dan tutup halaman setelah selesai.</li>
            <li>• Petugas tidak akan meminta kata sandi Anda.</li>
          </ul>
          <Link href="/pengaduan" className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold text-[#d5ccff] hover:text-white">Butuh bantuan? Buat pengaduan <ArrowRight size={14} /></Link>
        </aside>
      </div>
    </div>
  );
}
