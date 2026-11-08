"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import { CircleCheck, Clock3, Copy, LogOut, QrCode, RefreshCw, ShieldCheck } from "lucide-react";
import CitizenEvents from "@/components/citizen-events";

const dateTime = (value) => value
  ? new Date(value).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })
  : "—";

export default function CitizenProfile({ user }) {
  const router = useRouter();
  const [beneficiary, setBeneficiary] = useState(null);
  const [assistance, setAssistance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [copiedProgramId, setCopiedProgramId] = useState(null);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    setError("");
    const response = await fetch("/api/citizen/assistance");
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Profil warga tidak dapat dimuat.");
    const items = await Promise.all(result.data.assistance.map(async (item) => ({
      ...item,
      qrDataUrl: item.claimQr
        ? await QRCode.toDataURL(item.claimQr, { width: 240, margin: 2, errorCorrectionLevel: "M" })
        : null,
    })));
    setBeneficiary(result.data.beneficiary);
    setAssistance(items);
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => loadProfile()).catch((cause) => setError(cause.message)).finally(() => setLoading(false));
  }, [loadProfile]);

  async function refreshQr() {
    setRefreshing(true);
    try {
      await loadProfile();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setRefreshing(false);
    }
  }

  async function copyToken(programId, token) {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedProgramId(programId);
    } catch {
      setError("Token tidak dapat disalin. Silakan pilih dan salin token secara manual.");
    }
  }

  async function logout() {
    setLoggingOut(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Anda belum berhasil keluar.");
      router.replace("/login");
      router.refresh();
    } catch (cause) {
      setError(cause.message);
      setLoggingOut(false);
    }
  }

  return (
    <div className="mx-auto max-w-[980px] px-5 py-10 lg:px-8 lg:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-[#f3f0ff] text-[#6d4aff]"><ShieldCheck size={24} /></span>
          <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6d4aff]">Profil warga</p><h1 className="mt-2 text-[26px] font-bold tracking-[-0.05em]">{user.name}</h1><p className="mt-1 text-[11px] text-[#77778a]">{user.email}</p><p className="mt-1 text-[10px] text-[#9290a0]">{beneficiary?.regionName || "Wilayah penerima"} · Profil hanya dapat dilihat</p></div>
        </div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={refreshQr} disabled={refreshing || loading || loggingOut} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#eae8f0] bg-white px-3 text-[10px] font-semibold text-[#555366] hover:border-[#d8d0fa] hover:text-[#6d4aff] disabled:opacity-50"><RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> Perbarui QR</button><button type="button" onClick={logout} disabled={loggingOut} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#f1d8d8] bg-white px-3 text-[10px] font-semibold text-[#a93434] hover:bg-[#fff3f3] disabled:opacity-50"><LogOut size={13} />{loggingOut ? "Keluar…" : "Keluar"}</button></div>
      </div>

      <CitizenEvents />
      <div className="mt-7 flex items-start gap-2.5 rounded-[13px] border border-[#e8e3fb] bg-[#f7f5ff] p-4 text-[10px] leading-5 text-[#625b7c]"><QrCode size={15} className="mt-0.5 shrink-0 text-[#6d4aff]" /><p>Tunjukkan QR program bantuan kepada petugas cabang saat mengambil bantuan. QR berlaku selama 15 menit; gunakan tombol Perbarui QR jika sudah kedaluwarsa. Jangan bagikan QR kepada orang lain.</p></div>
      {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff3f3] p-3 text-[10px] leading-5 text-[#a93434]">{error}</p>}
      {loading && <p className="mt-6 rounded-[17px] border border-[#eae8f0] bg-white p-7 text-center text-[11px] text-[#77778a]">Memuat profil dan QR bantuan…</p>}
      {!loading && !error && !assistance.length && <p className="mt-6 rounded-[17px] border border-[#eae8f0] bg-white p-7 text-center text-[11px] text-[#77778a]">Belum ada program bantuan yang tertaut ke akun ini.</p>}

      <div className="mt-5 grid gap-4">
        {assistance.map((item) => {
          const claimed = item.claimStatus === "sudah_diambil";
          return <section key={item.id} className="rounded-[17px] border border-[#eae8f0] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9290a0]">{item.category}</p><h2 className="mt-1 text-[15px] font-bold">{item.programName}</h2><p className="mt-1 text-[10px] text-[#77778a]">{item.amount === null ? "Nilai sesuai ketentuan program" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.amount)}</p></div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-semibold ${claimed ? "bg-[#eff8f3] text-[#218755]" : "bg-[#fff5e9] text-[#a56817]"}`}>{claimed ? <><CircleCheck size={12} />Sudah mengambil</> : <><Clock3 size={12} />Belum mengambil</>}</span>
            </div>
            {claimed ? <div className="mt-4 rounded-xl bg-[#eff8f3] p-3 text-[10px] leading-5 text-[#456b56]"><p className="font-semibold">Pengambilan tercatat</p><p>{dateTime(item.claimedAt)}</p></div>
              : item.qrDataUrl ? <div className="mt-4 flex flex-col items-center gap-3 rounded-xl bg-[#faf9fc] p-4 sm:flex-row sm:items-center"><Image src={item.qrDataUrl} alt={`QR pengambilan ${item.programName}`} width={150} height={150} unoptimized /><div className="w-full text-center sm:text-left"><p className="text-[11px] font-bold">QR pengambilan bantuan</p><p className="mt-1 max-w-[420px] text-[10px] leading-5 text-[#77778a]">Petugas cabang dapat memindai QR ini atau memasukkan token di bawah secara manual.</p><div className="mt-3 rounded-lg border border-[#eae8f0] bg-white p-3"><p className="text-[9px] font-semibold text-[#77778a]">Token QR manual</p><code className="mt-1 block select-all break-all text-left font-mono text-[10px] leading-5 text-[#393849]">{item.claimQr}</code><button type="button" onClick={() => copyToken(item.id, item.claimQr)} className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[#eae8f0] px-2.5 py-1.5 text-[9px] font-semibold text-[#5b43c3] hover:bg-[#f7f5ff]"><Copy size={11} />{copiedProgramId === item.id ? "Tersalin" : "Salin token"}</button></div></div></div>
                : <p className="mt-4 rounded-xl bg-[#faf9fc] p-3 text-[10px] leading-5 text-[#77778a]">QR belum tersedia karena status kelayakan program belum terverifikasi.</p>}
          </section>;
        })}
      </div>
    </div>
  );
}
