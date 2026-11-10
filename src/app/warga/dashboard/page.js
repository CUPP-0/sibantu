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
    <div className="mx-auto max-w-[1100px] px-5 py-10 lg:px-8 lg:py-14">
      <div className="grid gap-8 border-b border-[#e9e8e4] pb-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6d4aff]">Portal warga</p>
          <h1 className="mt-3 text-[34px] font-semibold tracking-[-0.06em] sm:text-[42px]">Halo, {user.name}.</h1>
          <p className="mt-3 max-w-[570px] text-[13px] leading-6 text-[#77767d]">Pilih layanan yang ingin Anda gunakan. Profil akun hanya dapat dilihat dan tidak dapat diedit dari portal.</p>
        </div>
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#5f5d66]"><ShieldCheck size={16} className="text-[#6d4aff]" /> Portal layanan masyarakat</span>
      </div>

      <CitizenEvents />
      <div className="mt-9 grid gap-0 border-y border-[#e9e8e4] md:grid-cols-2 md:divide-x md:divide-[#e9e8e4]">
        <Link href="/cek-bantuan" className="group flex min-h-[175px] flex-col items-start px-0 py-6 md:pr-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6d4aff]">01 / Informasi</span>
          <h2 className="mt-4 text-[19px] font-semibold tracking-[-0.04em]">Cek status bantuan</h2>
          <p className="mt-2 max-w-[390px] text-[11px] leading-5 text-[#77767d]">Lihat status program bantuan yang ditautkan ke akun warga Anda.</p>
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[11px] font-semibold text-[#171717]">Lihat informasi <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
        </Link>
        <Link href="/pengaduan" className="group flex min-h-[175px] flex-col items-start border-t border-[#e9e8e4] px-0 py-6 md:border-t-0 md:pl-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6d4aff]">02 / Sampaikan</span>
          <h2 className="mt-4 text-[19px] font-semibold tracking-[-0.04em]">Kirim pengaduan</h2>
          <p className="mt-2 max-w-[390px] text-[11px] leading-5 text-[#77767d]">Laporkan kendala penyaluran dan simpan nomor tiket untuk melihat tindak lanjut.</p>
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[11px] font-semibold text-[#171717]">Buat pengaduan <ArrowRight size={14} className="transition group-hover:translate-x-1" /><FilePlus2 size={14} /></span>
        </Link>
        <Link href="/lacak-pengaduan" className="group flex min-h-[175px] flex-col items-start border-t border-[#e9e8e4] px-0 py-6 md:pr-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6d4aff]">03 / Pelacakan</span>
          <h2 className="mt-4 text-[19px] font-semibold tracking-[-0.04em]">Lacak pengaduan</h2>
          <p className="mt-2 max-w-[390px] text-[11px] leading-5 text-[#77767d]">Periksa perkembangan laporan menggunakan nomor tiket dan kontak pelapor.</p>
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[11px] font-semibold text-[#171717]">Lacak tiket <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
        </Link>
        <Link href="/transparansi" className="group flex min-h-[175px] flex-col items-start border-t border-[#e9e8e4] px-0 py-6 md:pl-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6d4aff]">04 / Keterbukaan</span>
          <h2 className="mt-4 text-[19px] font-semibold tracking-[-0.04em]">Transparansi penyaluran</h2>
          <p className="mt-2 max-w-[390px] text-[11px] leading-5 text-[#77767d]">Lihat ringkasan penyaluran bantuan sosial dalam bentuk data agregat.</p>
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[11px] font-semibold text-[#171717]">Lihat transparansi <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
        </Link>
      </div>
      <p className="mt-6 border-l-2 border-[#e8f45b] bg-[#f8f8f4] p-4 text-[10px] leading-5 text-[#66665e]">Akun demo tertaut ke satu data penerima simulasi. Statusnya hanya untuk pengujian dan bukan informasi bantuan yang sebenarnya.</p>
    </div>
  );
}
