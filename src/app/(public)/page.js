import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Eye,
  HandHeart,
  HeartHandshake,
  House,
  LockKeyhole,
  MapPin,
  MoveUpRight,
  Shield,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

const programs = [
  { tag: "BANTUAN PANGAN", title: "Program Sembako", description: "Dukungan pemenuhan kebutuhan pangan bagi keluarga yang memenuhi kriteria.", icon: HandHeart, tone: "purple" },
  { tag: "PERLINDUNGAN SOSIAL", title: "Program Keluarga Harapan", description: "Bantuan bersyarat untuk mendukung kesejahteraan keluarga dan akses layanan dasar.", icon: BadgeCheck, tone: "green" },
  { tag: "PENDIDIKAN", title: "Bantuan Pendidikan", description: "Dukungan pendidikan untuk membuka lebih banyak kesempatan bagi generasi muda.", icon: Sparkles, tone: "orange" },
];

const process = [
  ["01", "Data dicatat", "Penerima didaftarkan sesuai kriteria program."],
  ["02", "Diverifikasi", "Petugas memastikan informasi dan kelayakan."],
  ["03", "Bantuan disalurkan", "Penyaluran dilakukan melalui jadwal resmi."],
  ["04", "Publik mengawasi", "Ringkasan distribusi tersedia secara terbuka."],
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div className="page-grid absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 px-5 pb-16 pt-12 md:pb-24 md:pt-20 lg:grid-cols-[1.03fr_0.97fr] lg:px-8">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e9e5fb] bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#5d48b5] shadow-sm">
              <span className="size-1.5 rounded-full bg-[#6d4aff]" /> Sistem transparansi bantuan sosial
            </div>
            <h1 className="mt-6 max-w-[610px] text-[43px] font-bold leading-[1.08] tracking-[-0.065em] text-[#202033] sm:text-[55px] lg:text-[62px]">
              Pastikan bantuan sosial <span className="text-[#6d4aff]">tepat sasaran.</span>
            </h1>
            <p className="mt-5 max-w-[510px] text-[15px] leading-7 text-[#77778a] sm:text-[16px]">
              SiBantu hadir untuk meningkatkan transparansi dan pengawasan bantuan sosial agar penyaluran bantuan dapat dipantau dengan lebih mudah, aman, dan akuntabel.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/cek-bantuan" className="inline-flex h-[50px] items-center justify-center gap-2 rounded-xl bg-[#6d4aff] px-5 text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(109,74,255,0.2)] transition hover:bg-[#5035c9]">
                Cek status bantuan <ArrowRight size={16} />
              </Link>
              <Link href="/transparansi" className="inline-flex h-[50px] items-center justify-center gap-2 rounded-xl border border-[#eae8f0] bg-white px-5 text-[13px] font-semibold text-[#454457] transition hover:border-[#cfc6f8] hover:text-[#6d4aff]">
                <Eye size={16} /> Lihat transparansi
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] text-[#858395]">
              <span className="inline-flex items-center gap-2"><LockKeyhole size={14} className="text-[#6d4aff]" /> Data pribadi terlindungi</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-[#6d4aff]" /> Informasi terverifikasi</span>
            </div>
          </div>

          <div className="relative mx-auto flex min-h-[390px] w-full max-w-[550px] items-center justify-center sm:min-h-[470px]" aria-hidden="true">
            <div className="absolute left-1/2 top-1/2 size-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4f0ff] sm:size-[390px]" />
            <div className="absolute left-1/2 top-1/2 size-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#d9d0ff] sm:size-[320px]" />
            <div className="absolute left-1/2 top-1/2 size-[170px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#8d72ff] to-[#6241e8] shadow-[0_28px_70px_rgba(109,74,255,0.28)] sm:size-[220px]" />
            <div className="absolute left-1/2 top-1/2 flex size-[116px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[34px] border border-white/25 bg-white/15 text-white backdrop-blur-sm sm:size-[144px]">
              <HeartHandshake size={72} strokeWidth={1.35} className="sm:hidden" />
              <HeartHandshake size={88} strokeWidth={1.25} className="hidden sm:block" />
            </div>
            <div className="absolute left-[8%] top-[17%] flex size-[58px] items-center justify-center rounded-[20px] border border-[#eeeaf7] bg-white text-[#6d4aff] shadow-[0_12px_30px_rgba(46,37,87,0.09)] sm:left-[10%] sm:top-[15%] sm:size-[68px]">
              <House size={27} strokeWidth={1.7} />
            </div>
            <div className="absolute right-[8%] top-[23%] flex size-[54px] items-center justify-center rounded-full border border-[#eeeaf7] bg-white text-[#27875a] shadow-[0_12px_30px_rgba(46,37,87,0.09)] sm:right-[10%] sm:top-[20%] sm:size-[64px]">
              <Shield size={25} strokeWidth={1.7} />
            </div>
            <div className="absolute bottom-[18%] left-[12%] flex size-[54px] items-center justify-center rounded-full border border-[#eeeaf7] bg-white text-[#d98b32] shadow-[0_12px_30px_rgba(46,37,87,0.09)] sm:bottom-[15%] sm:left-[15%] sm:size-[64px]">
              <UsersRound size={25} strokeWidth={1.7} />
            </div>
            <div className="absolute bottom-[17%] right-[9%] flex size-[58px] items-center justify-center rounded-[20px] border border-[#eeeaf7] bg-white text-[#6d4aff] shadow-[0_12px_30px_rgba(46,37,87,0.09)] sm:bottom-[14%] sm:right-[10%] sm:size-[68px]">
              <MapPin size={27} strokeWidth={1.7} />
            </div>
            <div className="absolute bottom-[3%] left-1/2 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-2xl border border-[#ebe8f1] bg-white px-4 py-3 shadow-[0_12px_30px_rgba(46,37,87,0.1)] sm:bottom-[2%]">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#eff8f3] text-[#218755]"><HeartHandshake size={16} /></span>
              <div><p className="text-[10px] font-bold text-[#302d45]">Bersama untuk sesama</p><p className="mt-0.5 text-[9px] text-[#9290a0]">Bantuan yang lebih berarti</p></div>
            </div>
          </div>
        </div>
        <div className="relative border-y border-[#efedf4] bg-white/80">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-5 px-5 py-4 text-[11px] text-[#77778a] lg:px-8">
            <span className="font-semibold text-[#454457]">Dibangun untuk layanan publik yang lebih baik</span>
            <div className="flex flex-wrap gap-x-7 gap-y-2"><span className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-[#6d4aff]" /> Transparan</span><span className="inline-flex items-center gap-2"><LockKeyhole size={14} className="text-[#6d4aff]" /> Menjaga privasi</span><span className="inline-flex items-center gap-2"><Eye size={14} className="text-[#6d4aff]" /> Mudah diawasi</span></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#6d4aff]">Program bantuan</p><h2 className="mt-3 text-[30px] font-bold tracking-[-0.055em] sm:text-[38px]">Kenali program yang tersedia.</h2></div>
          <Link href="/program" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#6d4aff] hover:text-[#5035c9]">Lihat semua program <ArrowRight size={15} /></Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {programs.map(({ tag, title, description, icon: Icon, tone }) => (
            <article key={title} className="rounded-[18px] border border-[#eae8f0] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#d8d0fa] hover:shadow-[0_12px_30px_rgba(37,26,77,0.06)]">
              <span className={`flex size-11 items-center justify-center rounded-[13px] ${tone === "green" ? "bg-[#eff8f3] text-[#22865a]" : tone === "orange" ? "bg-[#fff5e9] text-[#c47a23]" : "bg-[#f3f0ff] text-[#6d4aff]"}`}><Icon size={21} /></span>
              <p className="mt-5 text-[9px] font-bold tracking-[0.14em] text-[#9795a3]">{tag}</p>
              <h3 className="mt-2 text-[17px] font-bold tracking-[-0.03em]">{title}</h3>
              <p className="mt-2 min-h-[48px] text-[12px] leading-6 text-[#77778a]">{description}</p>
              <Link href="/program" className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#6d4aff]">Pelajari program <MoveUpRight size={13} /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#efedf4] bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
          <div className="mx-auto max-w-[590px] text-center"><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#6d4aff]">Bagaimana sistem bekerja</p><h2 className="mt-3 text-[30px] font-bold tracking-[-0.055em] sm:text-[38px]">Dari pendataan hingga pengawasan.</h2><p className="mt-3 text-[13px] leading-6 text-[#77778a]">Setiap tahap penyaluran tercatat agar proses bantuan lebih mudah dipantau.</p></div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {process.map(([number, title, description], index) => (
              <div key={number} className="relative rounded-[16px] border border-[#eae8f0] bg-[#fcfbfd] p-5">
                <div className="flex items-center justify-between"><span className="text-[11px] font-bold text-[#6d4aff]">{number}</span>{index < 3 && <ArrowDownRight className="text-[#c2b9ee] lg:hidden" size={16} />}</div>
                <h3 className="mt-6 text-[14px] font-bold">{title}</h3><p className="mt-2 text-[11px] leading-5 text-[#77778a]">{description}</p>
                {index < 3 && <ArrowRight className="absolute -right-[13px] top-1/2 z-10 hidden rounded-full border border-[#eae8f0] bg-white p-1 text-[#a29cab] lg:block" size={24} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-16 lg:px-8 lg:py-20">
        <div className="relative overflow-hidden rounded-[24px] bg-[#29224c] px-6 py-10 sm:px-10 lg:px-14">
          <div className="absolute -right-8 -top-24 size-64 rounded-full border border-white/10" /><div className="absolute -right-1 top-[-60px] size-48 rounded-full border border-white/10" />
          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div className="max-w-[600px]"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#c6baff]">Mari ikut mengawasi</p><h2 className="mt-3 text-[28px] font-bold leading-tight tracking-[-0.05em] text-white sm:text-[36px]">Transparansi bantuan sosial dimulai dari kita.</h2><p className="mt-3 text-[12px] leading-6 text-[#d3d0e0]">Sampaikan laporan dengan aman atau lihat ringkasan penyaluran bantuan di wilayah Anda.</p></div>
            <div className="flex flex-col gap-3 sm:flex-row"><Link href="/pengaduan" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-[12px] font-bold text-[#3d326e] transition hover:bg-[#f3f0ff]">Buat pengaduan <ArrowUpRight size={15} /></Link><Link href="/transparansi" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 px-4 text-[12px] font-semibold text-white transition hover:bg-white/10">Lihat transparansi <ArrowRight size={15} /></Link></div>
          </div>
        </div>
      </section>
    </>
  );
}
