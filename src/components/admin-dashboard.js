"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight, BadgeAlert, BarChart3, Building2, CalendarDays, CircleDollarSign, ClipboardList, HandHeart, History, MessageSquareWarning,
  LayoutDashboard, LogOut, QrCode, ShieldCheck, Users,
} from "lucide-react";
import MonthlyDistributionChart from "@/components/monthly-distribution-chart";

const statCards = [
  ["beneficiaries", "Penerima aktif", Users, "bg-[#f3f6d8] text-[#111111]"],
  ["activePrograms", "Program aktif", HandHeart, "bg-[#eff8f3] text-[#218755]"],
  ["distributedCount", "Penyaluran berhasil", CircleDollarSign, "bg-[#fff5e9] text-[#c47a23]"],
  ["pendingDistributions", "Menunggu penyaluran", ClipboardList, "bg-[#f1f5ff] text-[#4c68c8]"],
  ["complaints", "Total pengaduan", BadgeAlert, "bg-[#fff3f3] text-[#c04545]"],
];

const roles = { super_admin: "Super Admin", admin_daerah: "Admin Daerah", petugas: "Petugas Penyaluran" };

export default function AdminDashboard({ user }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Dashboard tidak dapat dimuat.");
        setData(result.data);
      })
      .catch((cause) => setError(cause.message));
  }, []);

  async function logout() {
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Tidak dapat keluar.");
      router.replace("/login");
    } catch (cause) {
      setLogoutError(cause.message);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f8f5]">
      <aside className="fixed inset-y-0 left-0 hidden w-[245px] overflow-y-auto border-r border-[#eae8f0] bg-white p-5 lg:block">
        <Link href="/" className="flex items-center gap-2.5"><span className="flex size-9 items-center justify-center rounded-[11px] bg-[#111111] text-white"><ShieldCheck size={19} /></span><span className="text-[15px] font-bold tracking-[-0.04em]">si<span className="text-[#111111]">bantu</span></span></Link>
        <p className="mt-10 px-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#a09eaa]">Menu utama</p>
        <nav className="mt-3 grid gap-1" aria-label="Navigasi admin">
          <Link href="/admin/dashboard" aria-current="page" className="flex items-center gap-3 rounded-xl bg-[#f3f6d8] px-3 py-3 text-[11px] font-semibold text-[#788900]"><LayoutDashboard size={16} /> Dashboard</Link>
        {user.role === "super_admin" && <>
          <Link href="/admin/cabang" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[11px] font-semibold text-[#626073] hover:bg-[#f3f6d8]"><Building2 size={16} /> Admin cabang</Link>
          <Link href="/admin/progres" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[11px] font-semibold text-[#626073] hover:bg-[#f3f6d8]"><BarChart3 size={16} /> Progres penyaluran</Link>
          <Link href="/admin/pengaduan" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[11px] font-semibold text-[#626073] hover:bg-[#f3f6d8]"><MessageSquareWarning size={16} /> Pengaduan</Link>
        </>}
        {user.role === "admin_daerah" && <>
          <Link href="/admin/penerima" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[11px] font-semibold text-[#626073] hover:bg-[#f3f6d8]"><Users size={16} /> Akun warga</Link>
          <Link href="/admin/verifikasi-qr" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[11px] font-semibold text-[#626073] hover:bg-[#f3f6d8]"><QrCode size={16} /> Verifikasi QR</Link>
          <Link href="/admin/riwayat" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[11px] font-semibold text-[#626073] hover:bg-[#f3f6d8]"><History size={16} /> Riwayat pengambilan</Link>
          <Link href="/admin/event" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[11px] font-semibold text-[#626073] hover:bg-[#f3f6d8]"><CalendarDays size={16} /> Jadwal bantuan</Link>
        </>}
        </nav>
        <div className="mt-8 rounded-[14px] border border-[#eae8f0] bg-[#fcfbfd] p-3.5"><span className="text-[9px] font-bold uppercase tracking-wider text-[#9997a4]">Wilayah kerja</span><p className="mt-1.5 text-[11px] font-semibold text-[#484657]">{user.role === "super_admin" ? "Nasional" : "Sesuai penugasan"}</p><p className="mt-1 text-[9px] leading-4 text-[#9290a0]">Akses data dibatasi oleh hak dan wilayah akun.</p></div>
      </aside>
      <div className="lg:pl-[245px]">
        <header className="sticky top-0 z-10 border-b border-[#eae8f0] bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="flex h-[68px] items-center justify-between">
            <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9997a4]">Portal pengelola</p><p className="mt-1 text-[13px] font-bold">Dashboard</p></div>
            <div className="flex items-center gap-3"><span className="hidden text-right sm:block"><span className="block text-[11px] font-semibold">{user.name}</span><span className="block text-[9px] text-[#9290a0]">{roles[user.role] || user.role}</span></span><button onClick={logout} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#eae8f0] px-3 text-[10px] font-semibold text-[#5b596c] hover:border-[#d1c9f4] hover:text-[#111111]"><LogOut size={14} /> Keluar</button></div>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-3 lg:hidden" aria-label="Navigasi admin">
            <Link href="/admin/dashboard" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#d8d0fa] bg-[#f8fbe8] px-3 py-2 text-[10px] font-semibold text-[#788900]"><LayoutDashboard size={13} />Dashboard</Link>
            {user.role === "admin_daerah" ? <>
              <Link href="/admin/penerima" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#eae8f0] px-3 py-2 text-[10px] font-semibold text-[#626073]"><Users size={13} />Akun warga</Link>
              <Link href="/admin/verifikasi-qr" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#eae8f0] px-3 py-2 text-[10px] font-semibold text-[#626073]"><QrCode size={13} />Verifikasi QR</Link>
              <Link href="/admin/riwayat" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#eae8f0] px-3 py-2 text-[10px] font-semibold text-[#626073]"><History size={13} />Riwayat pengambilan</Link>
              <Link href="/admin/event" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#eae8f0] px-3 py-2 text-[10px] font-semibold text-[#626073]"><CalendarDays size={13} />Jadwal bantuan</Link>
            </> : <>
              <Link href="/admin/cabang" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#eae8f0] px-3 py-2 text-[10px] font-semibold text-[#626073]"><Building2 size={13} />Admin cabang</Link>
              <Link href="/admin/progres" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#eae8f0] px-3 py-2 text-[10px] font-semibold text-[#626073]"><BarChart3 size={13} />Progres penyaluran</Link>
              <Link href="/admin/pengaduan" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#eae8f0] px-3 py-2 text-[10px] font-semibold text-[#626073]"><MessageSquareWarning size={13} />Pengaduan</Link>
            </>}
          </nav>
        </header>
        <div className="mx-auto max-w-[1200px] px-5 py-7 sm:px-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]">Ringkasan sistem</p><h1 className="mt-2 text-[26px] font-bold tracking-[-0.05em]">Selamat datang, {user.name.split(" ")[0]}.</h1><p className="mt-1 text-[11px] text-[#77778a]">Berikut ringkasan data yang dapat Anda akses.</p></div><Link href="/" className="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-[#eae8f0] bg-white px-3 text-[10px] font-semibold text-[#555366]">Lihat portal publik <ArrowUpRight size={13} /></Link></div>
          {error && <p role="alert" className="mt-5 rounded-xl border border-[#f1d8d8] bg-white p-4 text-[11px] text-[#a93434]">{error} Pastikan database dan data seed tersedia.</p>}
          {logoutError && <p role="alert" className="mt-5 rounded-xl bg-[#fff3f3] p-3 text-[11px] text-[#a93434]">{logoutError}</p>}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {statCards.map(([key, label, Icon, tone]) => <article key={key} className="rounded-[15px] border border-[#eae8f0] bg-white p-4"><div className="flex items-start justify-between"><span className={`flex size-9 items-center justify-center rounded-[11px] ${tone}`}><Icon size={17} /></span><ArrowUpRight size={14} className="text-[#bbb9c5]" /></div><p className="mt-4 text-[22px] font-bold tracking-[-0.05em]">{data ? new Intl.NumberFormat("id-ID").format(data.stats[key]) : "â€”"}</p><p className="mt-1 text-[10px] text-[#77778a]">{label}</p></article>)}
          </div>
          {user.role === "admin_daerah" ? (
            <section className="mt-5 rounded-[17px] border border-[#eae8f0] bg-white p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#111111]">Statistik cabang</p>
                  <h2 className="mt-1 text-[14px] font-bold">Nominal penyaluran per bulan</h2>
                  <p className="mt-1 text-[10px] text-[#9290a0]">Jumlah penyaluran berhasil di wilayah tugas Anda.</p>
                </div>
                {data?.monthlyDistributions && <div className="rounded-xl bg-[#f8fbe8] px-4 py-2 text-right">
                  <p className="text-[9px] text-[#77778a]">Bulan ini</p>
                  <p className="mt-1 text-[14px] font-bold text-[#788900]">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(data.monthlyDistributions.find((row) => {
                      const now = new Date();
                      return row.month === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
                    })?.amount || 0)}
                  </p>
                </div>}
              </div>
              {data ? (
                <MonthlyDistributionChart
                  data={data.monthlyDistributions}
                  title="Tren nominal 12 bulan"
                  description="Rincian jumlah transaksi dan nominal bantuan yang berhasil disalurkan."
                />
              ) : error ? (
                <p role="alert" className="rounded-xl bg-[#fff3f3] p-4 text-[10px] text-[#a93434]">{error}</p>
              ) : (
                <p className="rounded-xl bg-[#f8f8f5] p-6 text-center text-[10px] text-[#77778a]">Memuat statistik penyaluran bulananâ€¦</p>
              )}
            </section>
          ) : data && <div className="mt-5">
            <MonthlyDistributionChart
              data={data.monthlyDistributions}
              title="Nilai penyaluran per bulan"
              description="Total nominal penyaluran berhasil secara nasional."
            />
          </div>}
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            <section className="rounded-[17px] border border-[#eae8f0] bg-white p-5">
              <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-[11px] bg-[#f3f6d8] text-[#111111]"><Building2 size={17} /></span><div><h2 className="text-[12px] font-bold">Pengelolaan wilayah</h2><p className="mt-1 text-[10px] text-[#9290a0]">Ringkasan hanya mencakup wilayah yang menjadi kewenangan Anda.</p></div></div>
              <div className="mt-5 rounded-[13px] bg-[#f8f8f5] p-4"><div className="flex items-center justify-between text-[10px]"><span className="font-semibold text-[#4f4d60]">Cakupan akun</span><span className="rounded-full bg-white px-2.5 py-1 font-semibold text-[#111111]">{roles[user.role] || user.role}</span></div><p className="mt-3 text-[9px] leading-4 text-[#9290a0]">{user.role === "super_admin" ? "Akses statistik nasional." : "Data dibatasi sesuai penugasan wilayah akun."}</p></div>
            </section>
            <section className="rounded-[17px] border border-[#eae8f0] bg-white p-5">
              <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-[11px] bg-[#fff5e9] text-[#c47a23]"><ClipboardList size={17} /></span><div><h2 className="text-[12px] font-bold">Data demonstrasi</h2><p className="mt-1 text-[10px] text-[#9290a0]">Lingkungan pengujian lokal</p></div></div>
              <p className="mt-4 text-[10px] leading-5 text-[#77778a]">Data yang ditampilkan berasal dari seed simulasi dan bukan data penerima bantuan sesungguhnya. Ganti kredensial demo dan konfigurasi keamanan sebelum deployment.</p>
            </section>
          </div>
          <div className="mt-5 flex items-start gap-2.5 rounded-[13px] border border-[#e8edcc] bg-[#f8fbe8] p-4 text-[10px] leading-5 text-[#525640]"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#111111]" /><p>Fitur pengelolaan penerima, program, dan distribusi hanya boleh dibuka oleh API yang memeriksa autentikasi, peran, serta kewenangan wilayah.</p></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {user.role === "super_admin" ? (
              <>
                <Link href="/admin/cabang" className="rounded-[15px] border border-[#eae8f0] bg-white p-4 transition hover:border-[#d8d0fa]">
                  <Building2 size={18} className="text-[#111111]" /><h2 className="mt-3 text-[12px] font-bold">Kelola akun admin cabang</h2><p className="mt-1 text-[10px] leading-5 text-[#77778a]">Buat akses admin per wilayah dan lihat ringkasan cabang.</p>
                </Link>
                <Link href="/admin/progres" className="rounded-[15px] border border-[#eae8f0] bg-white p-4 transition hover:border-[#d8d0fa]">
                  <BarChart3 size={18} className="text-[#111111]" /><h2 className="mt-3 text-[12px] font-bold">Progres penyaluran per cabang</h2><p className="mt-1 text-[10px] leading-5 text-[#77778a]">Cari cabang untuk melihat progres program dan rincian status penyaluran.</p>
                </Link>
                <Link href="/admin/pengaduan" className="rounded-[15px] border border-[#eae8f0] bg-white p-4 transition hover:border-[#d8d0fa]">
                  <MessageSquareWarning size={18} className="text-[#c04545]" /><h2 className="mt-3 text-[12px] font-bold">Lihat seluruh pengaduan</h2><p className="mt-1 text-[10px] leading-5 text-[#77778a]">Pantau laporan masyarakat dari semua wilayah.</p>
                </Link>
              </>
            ) : user.role === "admin_daerah" ? (
              <>
                <Link href="/admin/penerima" className="rounded-[15px] border border-[#eae8f0] bg-white p-4 transition hover:border-[#d8d0fa]">
                  <Users size={18} className="text-[#111111]" /><h2 className="mt-3 text-[12px] font-bold">Buat akun warga penerima</h2><p className="mt-1 text-[10px] leading-5 text-[#77778a]">Daftarkan penerima, program bantuan, kredensial awal, dan QR unik.</p>
                </Link>
                <Link href="/admin/verifikasi-qr" className="rounded-[15px] border border-[#eae8f0] bg-white p-4 transition hover:border-[#d8d0fa]">
                  <QrCode size={18} className="text-[#218755]" /><h2 className="mt-3 text-[12px] font-bold">Verifikasi QR penyaluran</h2><p className="mt-1 text-[10px] leading-5 text-[#77778a]">Pindai QR dengan kamera cabang, lalu konfirmasi penerimaan bantuan.</p>
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
