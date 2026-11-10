import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, BadgeCheck, BellRing, Check, ChevronRight,
  CircleHelp, FileCheck2, LockKeyhole, ShieldCheck, Sparkles, UsersRound,
} from "lucide-react";

const services = [
  { number: "01", icon: FileCheck2, title: "Cek bantuan", description: "Periksa informasi dan status bantuan yang terhubung dengan data Anda.", href: "/cek-bantuan" },
  { number: "02", icon: BellRing, title: "Jadwal penyaluran", description: "Temukan waktu dan lokasi penyaluran dari program yang tersedia.", href: "/program" },
  { number: "03", icon: CircleHelp, title: "Sampaikan laporan", description: "Kirim pengaduan dan pantau tindak lanjutnya dengan nomor tiket.", href: "/pengaduan" },
];

const steps = [
  ["01", "Data terdaftar", "Informasi penerima dicatat dalam sistem."],
  ["02", "Proses verifikasi", "Petugas memeriksa kelengkapan dan kelayakan."],
  ["03", "Penyaluran bantuan", "Bantuan disalurkan sesuai jadwal program."],
  ["04", "Pengawasan", "Informasi penyaluran dapat dipantau secara transparan."],
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="mx-auto max-w-[1240px] px-5 pb-16 pt-10 sm:px-8 sm:pt-16 lg:px-10 lg:pb-24 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
          <div className="relative z-10">
            <div className="home-enter inline-flex items-center gap-2 rounded-full border border-[#e8e3ff] bg-[#f7f5ff] px-3 py-1.5 text-[10px] font-semibold tracking-[0.02em] text-[#6544d8]">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#8c72f4] opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-[#6d4aff]" />
              </span>
              Layanan bantuan sosial terpadu
            </div>
            <h1 className="home-enter home-delay-1 mt-7 max-w-[650px] text-[46px] font-semibold leading-[1.04] tracking-[-0.065em] text-[#171522] sm:text-[62px] lg:text-[68px]">
              Bantuan lebih tepat. <span className="text-[#6d4aff]">Informasi makin dekat.</span>
            </h1>
            <p className="home-enter home-delay-2 mt-6 max-w-[480px] text-[14px] leading-7 text-[#777581] sm:text-[15px]">
              SiBantu membantu masyarakat mengakses informasi program, memeriksa status bantuan, dan menyampaikan laporan dengan lebih mudah.
            </p>
            <div className="home-enter home-delay-3 mt-8 flex flex-wrap items-center gap-3">
              <Link href="/cek-bantuan" className="group inline-flex h-12 items-center gap-3 rounded-lg bg-[#6d4aff] px-5 text-[12px] font-semibold text-white shadow-[0_8px_20px_rgba(109,74,255,.18)] transition duration-300 hover:-translate-y-1 hover:bg-[#5939df] hover:shadow-[0_12px_24px_rgba(109,74,255,.25)]">
                Periksa bantuan <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link href="/transparansi" className="inline-flex h-12 items-center gap-2 rounded-lg px-4 text-[12px] font-semibold text-[#4f4b60] transition hover:bg-[#f5f2ff] hover:text-[#6d4aff]">
                Lihat transparansi <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="home-enter home-delay-3 mt-9 flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-medium text-[#85828f]">
              <span className="inline-flex items-center gap-2"><LockKeyhole size={14} className="text-[#6d4aff]" /> Privasi terjaga</span>
              <span className="inline-flex items-center gap-2"><BadgeCheck size={14} className="text-[#6d4aff]" /> Data terverifikasi</span>
            </div>
          </div>

          <div className="home-visual relative mx-auto flex min-h-[390px] w-full max-w-[550px] items-center justify-center sm:min-h-[470px]">
            <div className="absolute right-[8%] top-[8%] size-[250px] rounded-full bg-[#f0ecff] sm:size-[330px]" />
            <div className="absolute bottom-[7%] left-[4%] size-[110px] rounded-full bg-[#eff5a4] sm:size-[140px]" />
            <div className="absolute right-[12%] top-[13%] h-[2px] w-16 rotate-[-35deg] bg-[#b5a4ff]" />
            <div className="absolute bottom-[20%] right-[7%] size-3 rounded-full bg-[#e8f45b] ring-4 ring-white" />

            <div className="dashboard-float relative z-10 w-[82%] max-w-[390px] rounded-2xl border border-white bg-white p-5 shadow-[0_24px_70px_rgba(52,39,103,.14)] sm:p-6">
              <div className="flex items-center justify-between border-b border-[#f0eef5] pb-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[#f1edff] text-[#6d4aff]"><ShieldCheck size={17} /></span>
                  <div><p className="text-[11px] font-bold text-[#252333]">Ringkasan SiBantu</p><p className="mt-0.5 text-[9px] text-[#9a97a5]">Portal informasi warga</p></div>
                </div>
                <span className="size-2 rounded-full bg-[#75c99b] ring-4 ring-[#e9f8ef]" />
              </div>
              <div className="mt-5 rounded-xl bg-[#f8f7fc] p-4">
                <div className="flex items-start justify-between">
                  <div><p className="text-[9px] font-medium text-[#8b8897]">Status data penerima</p><p className="mt-2 text-[17px] font-semibold tracking-[-0.04em] text-[#272438]">Terverifikasi</p></div>
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#e9f7ef] text-[#319866]"><Check size={18} /></span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e8e5f1]"><div className="progress-line h-full w-[78%] rounded-full bg-[#8b70f3]" /></div>
                <p className="mt-2 text-[9px] text-[#9996a3]">Contoh tampilan status akun</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#efedf4] p-3">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[#f2efff] text-[#6d4aff]"><FileCheck2 size={14} /></span>
                  <p className="mt-3 text-[10px] font-semibold text-[#373445]">Program bantuan</p>
                  <p className="mt-1 text-[9px] text-[#9693a0]">Informasi program</p>
                </div>
                <div className="rounded-xl border border-[#efedf4] p-3">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[#f4f7d9] text-[#7e861d]"><BellRing size={14} /></span>
                  <p className="mt-3 text-[10px] font-semibold text-[#373445]">Jadwal terbaru</p>
                  <p className="mt-1 text-[9px] text-[#9693a0]">Agenda penyaluran</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-[#6d4aff] px-3.5 py-3 text-white">
                <div><p className="text-[9px] text-white/70">Layanan masyarakat</p><p className="mt-0.5 text-[11px] font-semibold">Semua informasi di satu tempat</p></div>
                <ArrowUpRight size={16} />
              </div>
            </div>
            <div className="notification-float absolute left-0 top-[17%] z-20 flex items-center gap-2.5 rounded-xl border border-[#eeebf5] bg-white px-3 py-2.5 shadow-[0_10px_30px_rgba(52,39,103,.10)] sm:left-[-1%]">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#f2efff] text-[#6d4aff]"><BellRing size={15} /></span>
              <div><p className="text-[9px] font-bold text-[#383548]">Informasi terbarui</p><p className="mt-0.5 text-[8px] text-[#9996a3]">Jadwal dapat dipantau</p></div>
            </div>
            <div className="absolute bottom-[12%] right-0 z-20 flex items-center gap-2 rounded-xl border border-[#eeebf5] bg-white px-3 py-2.5 shadow-[0_10px_30px_rgba(52,39,103,.10)]">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#f3f7d8] text-[#858d20]"><UsersRound size={15} /></span>
              <div><p className="text-[9px] font-bold text-[#383548]">Untuk masyarakat</p><p className="mt-0.5 text-[8px] text-[#9996a3]">Mudah diakses</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#efedf4] bg-[#fbfaff]">
        <div className="mx-auto grid max-w-[1240px] gap-7 px-5 py-8 sm:grid-cols-3 sm:gap-0 sm:px-8 lg:px-10">
          {[
            [ShieldCheck, "Aman", "Data pribadi dijaga dengan akses sesuai kewenangan."],
            [EyeIcon, "Terbuka", "Informasi program dan ringkasan penyaluran dapat dipantau."],
            [UsersRound, "Mudah digunakan", "Layanan disusun agar mudah dipahami berbagai kalangan."],
          ].map(([Icon, title, description], index) => (
            <div key={title} className={`home-enter flex items-start gap-3 ${index ? "sm:border-l sm:border-[#eae7f1] sm:pl-7" : ""} ${index < 2 ? "sm:pr-7" : ""}`}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#6d4aff] shadow-sm"><Icon size={17} /></span>
              <div><h2 className="text-[12px] font-semibold text-[#302d3e]">{title}</h2><p className="mt-1 max-w-[280px] text-[10px] leading-5 text-[#898694]">{description}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6d4aff]">Layanan utama</p><h2 className="mt-3 max-w-[520px] text-[34px] font-semibold leading-[1.08] tracking-[-0.055em] text-[#201e2c] sm:text-[44px]">Yang Anda butuhkan, lebih mudah ditemukan.</h2></div>
          <p className="max-w-[300px] text-[12px] leading-6 text-[#85828f]">Akses layanan SiBantu sesuai kebutuhan Anda, tanpa langkah yang berbelit.</p>
        </div>
        <div className="mt-10 grid border-y border-[#eae8ef] md:grid-cols-3 md:divide-x md:divide-[#eae8ef]">
          {services.map(({ number, icon: Icon, title, description, href }, index) => (
            <Link key={number} href={href} className={`service-card group flex min-h-[220px] flex-col px-1 py-7 transition-colors hover:bg-[#fbfaff] md:px-6 ${index === 0 ? "md:pl-1" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-[0.12em] text-[#aaa7b2]">{number}</span>
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#f2efff] text-[#6d4aff] transition duration-300 group-hover:-translate-y-1 group-hover:bg-[#6d4aff] group-hover:text-white"><Icon size={19} /></span>
              </div>
              <h3 className="mt-7 text-[18px] font-semibold tracking-[-0.04em] text-[#282536]">{title}</h3>
              <p className="mt-2 max-w-[290px] text-[11px] leading-6 text-[#898694]">{description}</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[10px] font-semibold text-[#6d4aff]">Buka layanan <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#f8f7fc] py-20 lg:py-24">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6d4aff]">Alur yang jelas</p>
            <h2 className="mt-3 max-w-[400px] text-[34px] font-semibold leading-[1.08] tracking-[-0.055em] text-[#201e2c] sm:text-[42px]">Setiap tahap punya catatan.</h2>
            <p className="mt-4 max-w-[360px] text-[12px] leading-6 text-[#85828f]">Proses bantuan dirancang agar lebih tertata, mulai dari pendataan hingga pemantauan penyaluran.</p>
            <Link href="/tentang" className="mt-7 inline-flex items-center gap-2 text-[11px] font-semibold text-[#6d4aff] hover:gap-3">Pelajari SiBantu <ArrowRight size={14} /></Link>
          </div>
          <ol className="relative border-l border-[#dcd5f4] pl-7">
            {steps.map(([number, title, description], index) => (
              <li key={number} className="step-item relative pb-8 last:pb-0" style={{ animationDelay: `${index * 140}ms` }}>
                <span className="absolute -left-[34px] top-0 flex size-4 items-center justify-center rounded-full border-[3px] border-[#f8f7fc] bg-[#8b70f3] ring-1 ring-[#c9bdf5]" />
                <span className="text-[9px] font-bold tracking-[0.14em] text-[#8d79d7]">{number}</span>
                <h3 className="mt-1 text-[14px] font-semibold text-[#302d3e]">{title}</h3>
                <p className="mt-1 text-[11px] leading-5 text-[#898694]">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="relative overflow-hidden rounded-2xl bg-[#211b39] px-7 py-10 text-white sm:px-12 sm:py-14">
          <div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
          <div className="absolute -right-5 -top-12 size-52 rounded-full border border-white/10" />
          <div className="relative z-10 max-w-[660px]">
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e8f45b]"><Sparkles size={13} /> Bersama mengawasi bantuan</span>
            <h2 className="mt-4 text-[30px] font-semibold leading-[1.08] tracking-[-0.05em] sm:text-[42px]">Mulai dari informasi yang benar.</h2>
            <p className="mt-3 max-w-[530px] text-[12px] leading-6 text-white/65">Periksa informasi bantuan atau sampaikan laporan melalui layanan SiBantu.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/cek-bantuan" className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#e8f45b] px-4 text-[11px] font-semibold text-[#211b39] transition hover:-translate-y-0.5 hover:bg-white">Cek bantuan <ArrowRight size={14} /></Link>
              <Link href="/pengaduan" className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/25 px-4 text-[11px] font-semibold text-white transition hover:bg-white/10">Buat laporan <ArrowUpRight size={14} /></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function EyeIcon(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>;
}
