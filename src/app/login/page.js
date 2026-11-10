"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: formData.get("identifier"), password: formData.get("password") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Tidak dapat masuk.");
      router.replace(result.data.user.role === "masyarakat" ? "/warga/profil" : "/admin/dashboard");
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
      <section className="hidden bg-[#e8f45b] px-12 py-14 lg:flex lg:flex-col lg:justify-between xl:px-20">
        <Link href="/" className="inline-flex items-center gap-2 text-[18px] font-bold tracking-[-0.05em] text-[#171717]"><ShieldCheck size={22} className="text-[#6d4aff]" /> si<span className="text-[#6d4aff]">bantu</span></Link>
        <div className="max-w-[540px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#555a36]">Portal layanan masyarakat</p>
          <h1 className="mt-5 text-[48px] font-semibold leading-[1.04] tracking-[-0.06em] text-[#171717] xl:text-[60px]">Informasi bantuan, lebih dekat dan mudah diakses.</h1>
          <p className="mt-5 max-w-[420px] text-[13px] leading-7 text-[#555a36]">Masuk untuk melanjutkan ke layanan sesuai akun dan kewenangan Anda.</p>
        </div>
        <p className="text-[10px] text-[#555a36]">Bantuan tepat sasaran. Informasi lebih terbuka.</p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-[420px]">
          <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#77778a] hover:text-[#6d4aff]"><ArrowLeft size={14} /> Kembali ke beranda</Link>
          <div className="mt-9 border-b border-[#e9e8e4] pb-7">
            <span className="flex size-10 items-center justify-center bg-[#f2efff] text-[#6d4aff]"><ShieldCheck size={21} /></span>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6d4aff]">Portal akun</p>
            <h2 className="mt-2 text-[30px] font-semibold tracking-[-0.055em]">Masuk ke SiBantu</h2>
            <p className="mt-2 text-[12px] leading-5 text-[#77778a]">Masuk sebagai pengelola atau warga menggunakan akun yang terdaftar.</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
            <label className="grid gap-1.5 text-[11px] font-semibold text-[#4f4d60]">Email atau NIK<input name="identifier" type="text" autoComplete="username" required className="form-control mt-1 text-[12px] font-normal" placeholder="nama@instansi.go.id atau 16 digit NIK" /><span className="font-normal text-[#9290a0]">Admin masuk menggunakan email. Warga dapat menggunakan email atau NIK.</span></label>
            <label className="grid gap-1.5 text-[11px] font-semibold text-[#4f4d60]">Kata sandi<input name="password" type="password" autoComplete="current-password" required className="form-control mt-1 text-[12px] font-normal" placeholder="Masukkan kata sandi" /></label>
            {error && <p role="alert" className="border-l-2 border-[#c04545] bg-[#fff5f5] px-4 py-3 text-[11px] text-[#a93434]">{error}</p>}
            <button disabled={loading} className="mt-1 h-11 bg-[#171717] text-[12px] font-semibold text-white transition hover:bg-[#6d4aff] disabled:opacity-60">{loading ? "Memeriksa akun…" : "Masuk"}</button>
          </form>
          <div className="mt-6 border-t border-[#e9e8e4] pt-5 text-[10px] leading-5 text-[#77778a]">
            <strong className="text-[#4d4b5e]">Akun demo (setelah seed diimpor)</strong>
            <div className="mt-2 grid gap-2">
              <p><span className="font-semibold text-[#4d4b5e]">Admin:</span> admin@sibantu.id · SiBantu!2026</p>
              <p><span className="font-semibold text-[#4d4b5e]">Warga:</span> warga@sibantu.id · WargaSiBantu!2026</p>
            </div>
          </div>
          <p className="mt-4 text-[9px] leading-4 text-[#a09eaa]">Ganti kata sandi demo dan konfigurasi keamanan sebelum aplikasi digunakan di lingkungan produksi.</p>
        </div>
      </section>
    </main>
  );
}
