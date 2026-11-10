import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Eye, LockKeyhole,
  MoveUpRight, ShieldCheck, UsersRound,
} from "lucide-react";

const programs = [
  { tag: "BANTUAN PANGAN", title: "Program Sembako", description: "Dukungan pemenuhan kebutuhan pangan bagi keluarga yang memenuhi kriteria.", tone: "violet" },
  { tag: "PERLINDUNGAN SOSIAL", title: "Program Keluarga Harapan", description: "Bantuan bersyarat untuk mendukung kesejahteraan keluarga dan akses layanan dasar.", tone: "green" },
  { tag: "PENDIDIKAN", title: "Bantuan Pendidikan", description: "Dukungan pendidikan untuk membuka lebih banyak kesempatan bagi generasi muda.", tone: "lime" },
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
      <section className="mx-auto max-w-[1240px] px-4 pt-5 sm:px-6 lg:px-8 lg:pt-8">
        <div className="relative grid min-h-[510px] overflow-hidden rounded-[8px] bg-[#e8f45b] lg:grid-cols-[1fr_0.92fr]">
          <div className="relative z-10 flex flex-col items-start justify-center px-7 py-12 sm:px-12 lg:px-14 lg:py-16">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#4c5510]">
              <span className="size-2 rounded-full bg-[#6d4aff]" /> Sistem transparansi bantuan sosial
            </span>
            <h1 className="mt-7 max-w-[570px] text-[42px] font-semibold leading-[1.04] tracking-[-0.065em] text-[#111111] sm:text-[58px] lg:text-[64px]">
              Bantuan tepat sasaran. <span className="text-[#6d4aff]">Informasi lebih terbuka.</span>
            </h1>
            <p className="mt-6 max-w-[440px] text-[14px] leading-7 text-[#41452a] sm:text-[15px]">
              Pantau informasi program, periksa status bantuan, dan sampaikan laporan dengan cara yang mudah dan aman.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/cek-bantuan" className="inline-flex h-12 items-center gap-2 rounded-[5px] bg-[#111111] px-5 text-[12px] font-semibold text-white transition hover:bg-[#302b45]">
                Cek status bantuan <ArrowRight size={15} />
              </Link>
              <Link href="/transparansi" className="inline-flex h-12 items-center gap-2 rounded-[5px] border border-[#111111]/25 px-5 text-[12px] font-semibold text-[#111111] transition hover:bg-white/40">
                Lihat transparansi <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-medium text-[#555a36]">
              <span className="inline-flex items-center gap-2"><LockKeyhole size={14} /> Data pribadi terlindungi</span>
              <span className="inline-flex items-center gap-2"><BadgeCheck size={14} /> Informasi terverifikasi</span>
            </div>
          </div>
          <div className="relative min-h-[300px] lg:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=85"
              alt="Relawan bekerja bersama dalam kegiatan sosial"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#e8f45b]/35 via-transparent to-black/10" />
            <div className="absolute bottom-6 left-6 max-w-[270px] bg-white px-5 py-4 sm:bottom-9 sm:left-9">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6d4aff]">SiBantu untuk masyarakat</p>
              <p className="mt-2 text-[16px] font-semibold leading-snug tracking-[-0.03em] text-[#171717]">Informasi bantuan dalam satu tempat.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6d4aff]">Tentang layanan</p>
            <h2 className="mt-4 max-w-[350px] text-[32px] font-semibold leading-[1.08] tracking-[-0.055em] sm:text-[40px]">Informasi yang jelas, proses yang dapat dipantau.</h2>
          </div>
          <div className="flex flex-col justify-between gap-6 lg:pt-1">
            <p className="max-w-[660px] text-[14px] leading-7 text-[#69686f]">
              SiBantu mendukung transparansi dan pengawasan bantuan sosial. Masyarakat dapat melihat informasi program, memeriksa status bantuan, serta menyampaikan pengaduan melalui satu layanan yang mudah digunakan.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-[#e9e8e4] pt-5 text-[11px] font-medium text-[#414047]">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-[#6d4aff]" /> Terverifikasi</span>
              <span className="inline-flex items-center gap-2"><Eye size={15} className="text-[#6d4aff]" /> Transparan</span>
              <span className="inline-flex items-center gap-2"><UsersRound size={15} className="text-[#6d4aff]" /> Berorientasi warga</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f6f6f3] py-16 lg:py-20">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6d4aff]">Program bantuan</p><h2 className="mt-3 max-w-[500px] text-[32px] font-semibold leading-tight tracking-[-0.055em] sm:text-[40px]">Kenali program yang tersedia.</h2></div>
            <Link href="/program" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#6d4aff] hover:text-[#4930a6]">Lihat semua program <ArrowRight size={15} /></Link>
          </div>
          <div className="mt-9 grid gap-0 border-y border-[#e4e3df] md:grid-cols-3 md:divide-x md:divide-[#e4e3df]">
            {programs.map(({ tag, title, description, tone }, index) => (
              <article key={title} className="group flex min-h-[220px] flex-col items-start bg-transparent px-0 py-6 md:px-6 md:first:pl-0 md:last:pr-0">
                <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${tone === "green" ? "text-[#25865b]" : tone === "lime" ? "text-[#7c850e]" : "text-[#6d4aff]"}`}>{tag}</span>
                <h3 className="mt-5 text-[19px] font-semibold tracking-[-0.04em]">{title}</h3>
                <p className="mt-2 max-w-[300px] text-[12px] leading-6 text-[#77767d]">{description}</p>
                <Link href="/program" className="mt-auto inline-flex items-center gap-2 pt-5 text-[11px] font-semibold text-[#171717]">Pelajari program <MoveUpRight size={13} className="transition group-hover:translate-x-0.5" /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1240px] items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
        <div className="overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=85"
            alt="Kegiatan pendampingan masyarakat"
            className="h-[300px] w-full object-cover sm:h-[390px]"
            loading="lazy"
          />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6d4aff]">Bagaimana sistem bekerja</p>
          <h2 className="mt-4 max-w-[470px] text-[32px] font-semibold leading-[1.08] tracking-[-0.055em] sm:text-[40px]">Dari pendataan hingga pengawasan.</h2>
          <p className="mt-4 max-w-[460px] text-[13px] leading-7 text-[#77767d]">Setiap tahap penyaluran tercatat agar proses bantuan lebih mudah dipantau oleh pihak yang berwenang dan masyarakat.</p>
          <ol className="mt-8 divide-y divide-[#e9e8e4] border-y border-[#e9e8e4]">
            {process.map(([number, title, description]) => (
              <li key={number} className="grid grid-cols-[38px_1fr] gap-3 py-4">
                <span className="pt-0.5 text-[11px] font-semibold text-[#6d4aff]">{number}</span>
                <div><h3 className="text-[13px] font-semibold">{title}</h3><p className="mt-1 text-[11px] leading-5 text-[#77767d]">{description}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="relative grid overflow-hidden bg-[#171717] text-white md:grid-cols-[1fr_auto] md:items-center">
          <div className="px-7 py-10 sm:px-11 sm:py-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#d9ed49]">Mari ikut mengawasi</p>
            <h2 className="mt-3 max-w-[620px] text-[28px] font-semibold leading-tight tracking-[-0.05em] sm:text-[36px]">Transparansi bantuan sosial dimulai dari kita.</h2>
            <p className="mt-3 max-w-[570px] text-[12px] leading-6 text-[#c4c4c4]">Sampaikan laporan dengan aman atau lihat ringkasan penyaluran bantuan di wilayah Anda.</p>
          </div>
          <div className="flex flex-wrap gap-3 px-7 pb-9 sm:px-11 md:justify-end md:pb-0 md:pr-11">
            <Link href="/pengaduan" className="inline-flex h-11 items-center gap-2 bg-[#e8f45b] px-4 text-[11px] font-semibold text-[#111111] transition hover:bg-white">Buat pengaduan <ArrowUpRight size={14} /></Link>
            <Link href="/transparansi" className="inline-flex h-11 items-center gap-2 border border-white/35 px-4 text-[11px] font-semibold text-white transition hover:bg-white/10">Lihat transparansi <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
