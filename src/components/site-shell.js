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
    return () => {
      active = false;
    };
  }, []);

  const accountHref = user?.role === "masyarakat" ? "/warga/profil" : "/admin/dashboard";
  const accountLabel = user?.role === "masyarakat" ? "Profil saya" : "Dashboard";

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#eae8f0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="SiBantu beranda">
            <span className="flex size-10 items-center justify-center rounded-[13px] bg-[#111111] text-white">
              <ShieldCheck size={23} strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-[17px] font-bold tracking-[-0.04em]">si<span className="text-[#111111]">bantu</span></span>
              <span className="block text-[10px] font-medium tracking-[0.12em] text-[#9290a0]">TRANSPARANSI BANTUAN</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigasi utama">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className="text-[13px] font-medium text-[#686779] transition hover:text-[#111111]">
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <Link href="/lacak-pengaduan" className="text-[13px] font-semibold text-[#49485a] hover:text-[#111111]">
              Lacak laporan
            </Link>
            {user ? (
              <Link href={accountHref} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#111111] px-4 text-[12px] font-semibold text-white transition hover:bg-[#000000]" aria-label={`${accountLabel}: ${user.name}`}>
                <CircleUserRound size={16} /><span>{accountLabel}</span><ArrowUpRight size={14} />
              </Link>
            ) : sessionChecked ? (
              <Link href="/login" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#111111] px-5 text-[13px] font-semibold text-white transition hover:bg-[#000000]">
                Masuk akun <ArrowUpRight size={15} />
              </Link>
            ) : (
              <span className="h-11 w-[126px] animate-pulse rounded-xl bg-[#f3f6d8]" aria-label="Memeriksa akun" />
            )}
          </div>

          <button
            className="flex size-10 items-center justify-center rounded-xl border border-[#eae8f0] text-[#393849] lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t border-[#eae8f0] bg-white px-5 py-3 lg:hidden" aria-label="Navigasi seluler">
            {links.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="block border-b border-[#f2f0f6] py-3 text-sm font-medium text-[#565568] last:border-0">
                {label}
              </Link>
            ))}
            {user ? (
              <Link href={accountHref} onClick={() => setMenuOpen(false)} className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#111111] px-4 py-3 text-center text-sm font-semibold text-white">
                <CircleUserRound size={17} /> {accountLabel}
              </Link>
            ) : sessionChecked ? (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="mt-3 block rounded-xl bg-[#111111] px-4 py-3 text-center text-sm font-semibold text-white">
                Masuk akun
              </Link>
            ) : null}
          </nav>
        )}
      </header>

      <main className="min-h-[65vh]">{children}</main>

      <footer className="border-t border-[#eae8f0] bg-white">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
          <div>
            <Link href="/" className="flex items-center gap-2 text-[16px] font-bold tracking-[-0.04em]">
              <ShieldCheck size={20} className="text-[#111111]" /> bansos<span className="text-[#111111]">guard</span>
            </Link>
            <p className="mt-3 max-w-xs text-[13px] leading-6 text-[#77778a]">Bantuan tepat sasaran, pengawasan lebih transparan.</p>
            <span className="mt-5 inline-flex rounded-full border border-[#eae8f0] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#77778a]">Platform layanan publik</span>
          </div>
          <div>
            <h3 className="text-[13px] font-bold">Jelajahi</h3>
            <div className="mt-4 grid gap-3 text-[13px] text-[#77778a]">
              <Link href="/program" className="hover:text-[#111111]">Program bantuan</Link>
              <Link href="/transparansi" className="hover:text-[#111111]">Transparansi</Link>
              <Link href="/tentang" className="hover:text-[#111111]">Tentang kami</Link>
            </div>
          </div>
          <div>
            <h3 className="text-[13px] font-bold">Layanan</h3>
            <div className="mt-4 grid gap-3 text-[13px] text-[#77778a]">
              <Link href="/cek-bantuan" className="hover:text-[#111111]">Cek bantuan</Link>
              <Link href="/pengaduan" className="hover:text-[#111111]">Kirim pengaduan</Link>
              <Link href="/lacak-pengaduan" className="hover:text-[#111111]">Lacak pengaduan</Link>
            </div>
          </div>
          <div>
            <h3 className="text-[13px] font-bold">Informasi</h3>
            <div className="mt-4 grid gap-3 text-[13px] text-[#77778a]">
              <a href="mailto:layanan@sibantu.id" className="hover:text-[#111111]">Kontak layanan</a>
              <Link href="/kebijakan-privasi" className="hover:text-[#111111]">Kebijakan privasi</Link>
              <Link href="/syarat-ketentuan" className="hover:text-[#111111]">Syarat & ketentuan</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-[#f0eef4]">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-2 px-5 py-4 text-[11px] text-[#9290a0] sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <span>Â© 2026 SiBantu. Platform demonstrasi â€” data yang ditampilkan bersifat simulasi.</span>
            <span>Dirancang untuk transparansi dan perlindungan privasi.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
