import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FilePlus2, ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth";
import DatabaseSetupNotice from "@/components/database-setup-notice";
import CitizenEvents from "@/components/citizen-events";
import { getDatabaseUnavailableMessage } from "@/lib/http";

export const metadata = { title: "Layanan Warga" };

export default async function CitizenDashboardPage() {
  let user;
  try {
    user = await getSession();
  } catch (error) {
    const message = getDatabaseUnavailableMessage(error);
    if (message) return <DatabaseSetupNotice message={message} />;
    throw error;
  }
  if (!user) redirect("/login");
  if (user.role !== "masyarakat") redirect("/admin/dashboard");

  return (
    <div className="mx-auto max-w-[980px] px-5 py-12 lg:px-8 lg:py-16">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-[#f3f0ff] text-[#6d4aff]"><ShieldCheck size={24} /></span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6d4aff]">Portal warga</p>
          <h1 className="mt-2 text-[30px] font-bold tracking-[-0.05em]">Halo, {user.name}.</h1>
          <p className="mt-2 text-[12px] leading-6 text-[#77778a]">Pilih layanan yang ingin Anda gunakan. Profil akun hanya dapat dilihat dan tidak dapat diedit dari portal.</p>
        </div>
      </div>

      <CitizenEvents />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/cek-bantuan" className="group rounded-[18px] border border-[#eae8f0] bg-white p-5 transition hover:border-[#d8d0fa] hover:shadow-[0_12px_30px_rgba(37,26,77,0.06)]">
          <span className="flex size-10 items-center justify-center rounded-[12px] bg-[#f3f0ff] text-[#6d4aff]"><ShieldCheck size={19} /></span>
          <h2 className="mt-4 text-[15px] font-bold">Informasi cek bantuan</h2>
          <p className="mt-2 text-[11px] leading-5 text-[#77778a]">Lihat status program bantuan yang ditautkan ke akun warga Anda.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#6d4aff]">Lihat informasi <ArrowRight size={14} className="transition group-hover:translate-x-0.5" /></span>
        </Link>
        <Link href="/pengaduan" className="group rounded-[18px] border border-[#eae8f0] bg-white p-5 transition hover:border-[#d8d0fa] hover:shadow-[0_12px_30px_rgba(37,26,77,0.06)]">
          <span className="flex size-10 items-center justify-center rounded-[12px] bg-[#eff8f3] text-[#218755]"><FilePlus2 size={19} /></span>
          <h2 className="mt-4 text-[15px] font-bold">Kirim pengaduan</h2>
          <p className="mt-2 text-[11px] leading-5 text-[#77778a]">Laporkan kendala penyaluran dan simpan nomor tiket untuk melihat tindak lanjut.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#6d4aff]">Buat pengaduan <ArrowRight size={14} className="transition group-hover:translate-x-0.5" /></span>
        </Link>
        <Link href="/lacak-pengaduan" className="group rounded-[18px] border border-[#eae8f0] bg-white p-5 transition hover:border-[#d8d0fa] hover:shadow-[0_12px_30px_rgba(37,26,77,0.06)]">
          <span className="flex size-10 items-center justify-center rounded-[12px] bg-[#fff5e9] text-[#c47a23]"><ArrowRight size={19} /></span>
          <h2 className="mt-4 text-[15px] font-bold">Lacak pengaduan</h2>
          <p className="mt-2 text-[11px] leading-5 text-[#77778a]">Periksa perkembangan laporan menggunakan nomor tiket dan kontak pelapor.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#6d4aff]">Lacak tiket <ArrowRight size={14} className="transition group-hover:translate-x-0.5" /></span>
        </Link>
        <Link href="/transparansi" className="group rounded-[18px] border border-[#eae8f0] bg-white p-5 transition hover:border-[#d8d0fa] hover:shadow-[0_12px_30px_rgba(37,26,77,0.06)]">
          <span className="flex size-10 items-center justify-center rounded-[12px] bg-[#f1f5ff] text-[#4c68c8]"><ShieldCheck size={19} /></span>
          <h2 className="mt-4 text-[15px] font-bold">Transparansi penyaluran</h2>
          <p className="mt-2 text-[11px] leading-5 text-[#77778a]">Lihat ringkasan penyaluran bantuan sosial dalam bentuk data agregat.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#6d4aff]">Lihat transparansi <ArrowRight size={14} className="transition group-hover:translate-x-0.5" /></span>
        </Link>
      </div>
      <p className="mt-6 rounded-[13px] border border-[#e8e3fb] bg-[#f7f5ff] p-4 text-[10px] leading-5 text-[#625b7c]">Akun demo tertaut ke satu data penerima simulasi. Statusnya hanya untuk pengujian dan bukan informasi bantuan yang sebenarnya.</p>
    </div>
  );
}
