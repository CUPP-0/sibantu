import Link from "next/link";

export default function DatabaseSetupNotice({ message }) {
  return (
    <main className="flex min-h-[65vh] items-center justify-center px-5 py-12">
      <section className="w-full max-w-[620px] rounded-[20px] border border-[#eae8f0] bg-white p-6 sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]">Penyiapan aplikasi</p>
        <h1 className="mt-2 text-[24px] font-bold tracking-[-0.05em] text-[#202033]">Database belum siap.</h1>
        <p className="mt-3 text-[12px] leading-6 text-[#77778a]">{message}</p>
        <ol className="mt-5 grid gap-2 text-[11px] leading-5 text-[#5e5c70]">
          <li>1. Buat proyek Supabase dan salin PostgreSQL connection string dari Project Settings â†’ Database.</li>
          <li>2. Jalankan file lengkap <code className="rounded bg-[#f3f6d8] px-1.5 py-0.5 text-[#000000]">database/sibantu-supabase.sql</code> pada Supabase SQL Editor.</li>
          <li>3. Salin <code className="rounded bg-[#f3f6d8] px-1.5 py-0.5 text-[#000000]">.env.example</code> menjadi <code className="rounded bg-[#f3f6d8] px-1.5 py-0.5 text-[#000000]">.env.local</code> dan atur <code className="rounded bg-[#f3f6d8] px-1.5 py-0.5 text-[#000000]">DATABASE_URL</code>.</li>
          <li>4. Mulai ulang server dengan <code className="rounded bg-[#f3f6d8] px-1.5 py-0.5 text-[#000000]">npm run dev</code>.</li>
        </ol>
        <Link href="/" className="mt-6 inline-flex h-10 items-center rounded-xl bg-[#111111] px-4 text-[11px] font-semibold text-white hover:bg-[#000000]">Kembali ke beranda</Link>
      </section>
    </main>
  );
}
