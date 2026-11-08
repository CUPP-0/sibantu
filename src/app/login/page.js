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
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-[430px]">
        <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#77778a] hover:text-[#6d4aff]"><ArrowLeft size={14} /> Kembali ke beranda</Link>
        <section className="mt-5 rounded-[22px] border border-[#eae8f0] bg-white p-6 shadow-[0_16px_48px_rgba(37,26,77,0.06)] sm:p-8">
          <span className="flex size-11 items-center justify-center rounded-[13px] bg-[#6d4aff] text-white"><ShieldCheck size={23} /></span>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6d4aff]">Portal akun</p>
          <h1 className="mt-2 text-[26px] font-bold tracking-[-0.05em]">Masuk ke SiBantu</h1>
          <p className="mt-2 text-[12px] leading-5 text-[#77778a]">Masuk sebagai pengelola atau warga menggunakan akun yang terdaftar.</p>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <label className="grid gap-1.5 text-[11px] font-semibold text-[#4f4d60]">Email atau NIK<input name="identifier" type="text" autoComplete="username" required className="form-control mt-1 text-[12px] font-normal" placeholder="nama@instansi.go.id atau 16 digit NIK" /><span className="font-normal text-[#9290a0]">Admin masuk menggunakan email. Warga dapat menggunakan email atau NIK.</span></label>
            <label className="grid gap-1.5 text-[11px] font-semibold text-[#4f4d60]">Kata sandi<input name="password" type="password" autoComplete="current-password" required className="form-control mt-1 text-[12px] font-normal" placeholder="Masukkan kata sandi" /></label>
            {error && <p role="alert" className="rounded-xl bg-[#fff3f3] px-4 py-3 text-[11px] text-[#a93434]">{error}</p>}
            <button disabled={loading} className="mt-1 h-11 rounded-xl bg-[#6d4aff] text-[12px] font-semibold text-white transition hover:bg-[#5035c9] disabled:opacity-60">{loading ? "Memeriksa akun…" : "Masuk"}</button>
          </form>
          <div className="mt-5 rounded-xl bg-[#faf9fc] p-3.5 text-[10px] leading-5 text-[#77778a]">
            <strong className="text-[#4d4b5e]">Akun demo (setelah seed diimpor)</strong>
            <div className="mt-2 grid gap-2">
              <p><span className="font-semibold text-[#4d4b5e]">Admin:</span> admin@sibantu.id · SiBantu!2026</p>
              <p><span className="font-semibold text-[#4d4b5e]">Warga:</span> warga@sibantu.id · WargaSiBantu!2026</p>
            </div>
          </div>
          <p className="mt-4 text-[9px] leading-4 text-[#a09eaa]">Ganti kata sandi demo dan konfigurasi keamanan sebelum aplikasi digunakan di lingkungan produksi.</p>
        </section>
      </div>
    </main>
  );
}
