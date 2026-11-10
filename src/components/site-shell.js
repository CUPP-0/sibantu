"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, CircleUserRound, Menu, ShieldCheck, X } from "lucide-react";

const links = [
  ["Beranda", "/"],
  ["Program", "/program"],
  ["Transparansi", "/transparansi"],
  ["Cek bantuan", "/cek-bantuan"],
  ["Pengaduan", "/pengaduan"],
  ["Tentang", "/tentang"],
];

export default function SiteShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Akun tidak dapat dimuat.");
        if (active) setUser(result.data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setSessionChecked(true);
      });
    return () => { active = false; };
  }, []);

  const accountHref = user?.role === "masyarakat" ? "/warga/profil" : "/admin/dashboard";
  const accountLabel = user?.role === "masyarakat" ? "Profil saya" : "Dashboard";

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#eeede9] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="SiBantu beranda">
            <span className="flex size-9 items-center justify-center bg-[#6d4aff] text-white">
              <ShieldCheck size={21} strokeWidth={2} />
            </span>
            <span>
              <span className="block text-[18px] font-bold tracking-[-0.055em] text-[#171717]">si<span className="text-[#6d4aff]">bantu</span></span>
              <span className="block text-[9px] font-medium tracking-[0.14em] text-[#92918b]">TRANSPARANSI BANTUAN</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigasi utama">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className="text-[12px] font-medium text-[#65646b] transition hover:text-[#6d4aff]">{label}</Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <Link href="/lacak-pengaduan" className="text-[12px] font-semibold text-[#49484e] hover:text-[#6d4aff]">Lacak laporan</Link>
            {user ? (
              <Link href={accountHref} className="inline-flex h-10 items-center gap-2 bg-[#171717] px-4 text-[11px] font-semibold text-white transition hover:bg-[#6d4aff]" aria-label={`${accountLabel}: ${user.name}`}>
                <CircleUserRound size={15} /><span>{accountLabel}</span><ArrowUpRight size={13} />
              </Link>
            ) : sessionChecked ? (
              <Link href="/login" className="inline-flex h-10 items-center gap-2 bg-[#171717] px-5 text-[11px] font-semibold text-white transition hover:bg-[#6d4aff]">Masuk akun <ArrowUpRight size={14} /></Link>
            ) : (
              <span className="h-10 w-[116px] animate-pulse bg-[#f2efff]" aria-label="Memeriksa akun" />
            )}
          </div>

          <button className="flex size-10 items-center justify-center border border-[#e9e8e4] text-[#393849] lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Tutup menu" : "Buka menu"} aria-expanded={menuOpen}>
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t border-[#eeede9] bg-white px-5 py-3 lg:hidden" aria-label="Navigasi seluler">
            {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="block border-b border-[#f1f0ec] py-3 text-[13px] font-medium text-[#565568] last:border-0">{label}</Link>)}
            {user ? (
              <Link href={accountHref} onClick={() => setMenuOpen(false)} className="mt-3 flex items-center justify-center gap-2 bg-[#171717] px-4 py-3 text-center text-[13px] font-semibold text-white"><CircleUserRound size={16} /> {accountLabel}</Link>
            ) : sessionChecked ? (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="mt-3 block bg-[#171717] px-4 py-3 text-center text-[13px] font-semibold text-white">Masuk akun</Link>
            ) : null}
          </nav>
        )}
      </header>

      <main className="min-h-[65vh]">{children}</main>

      <footer className="bg-[#111111] text-white">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
          <div>
            <Link href="/" className="flex items-center gap-2 text-[18px] font-bold tracking-[-0.05em] text-white">
              <ShieldCheck size={20} className="text-[#e8f45b]" /> si<span className="text-[#e8f45b]">bantu</span>
            </Link>
            <p className="mt-3 max-w-xs text-[12px] leading-6 text-[#b8b8b8]">Bantuan tepat sasaran, pengawasan lebih transparan.</p>
            <span className="mt-5 inline-flex border border-white/20 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#d0d0d0]">Platform layanan publik</span>
          </div>
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#e8f45b]">Jelajahi</h3>
            <div className="mt-4 grid gap-3 text-[12px] text-[#b8b8b8]">
              <Link href="/program" className="hover:text-white">Program bantuan</Link>
              <Link href="/transparansi" className="hover:text-white">Transparansi</Link>
              <Link href="/tentang" className="hover:text-white">Tentang kami</Link>
            </div>
          </div>
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#e8f45b]">Layanan</h3>
            <div className="mt-4 grid gap-3 text-[12px] text-[#b8b8b8]">
              <Link href="/cek-bantuan" className="hover:text-white">Cek bantuan</Link>
              <Link href="/pengaduan" className="hover:text-white">Kirim pengaduan</Link>
              <Link href="/lacak-pengaduan" className="hover:text-white">Lacak pengaduan</Link>
            </div>
          </div>
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#e8f45b]">Informasi</h3>
            <div className="mt-4 grid gap-3 text-[12px] text-[#b8b8b8]">
              <a href="mailto:layanan@sibantu.id" className="hover:text-white">Kontak layanan</a>
              <Link href="/kebijakan-privasi" className="hover:text-white">Kebijakan privasi</Link>
              <Link href="/syarat-ketentuan" className="hover:text-white">Syarat & ketentuan</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/15">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-2 px-5 py-4 text-[10px] text-[#a8a8a8] sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <span>© 2026 SiBantu. Platform demonstrasi — data yang ditampilkan bersifat simulasi.</span>
            <span>Dirancang untuk transparansi dan perlindungan privasi.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
