import { Eye, HandHeart, ShieldCheck, Target } from "lucide-react";
import PageHeading from "@/components/page-heading";

const principles = [
  { icon: Target, title: "Tepat sasaran", body: "Mendukung proses pendataan dan verifikasi agar bantuan menjangkau warga sesuai kriteria program." },
  { icon: Eye, title: "Terbuka", body: "Menyediakan ringkasan penyaluran yang dapat dipantau tanpa membuka identitas pribadi penerima." },
  { icon: ShieldCheck, title: "Aman", body: "Melindungi informasi sensitif dan membatasi akses sesuai kewenangan pengguna." },
  { icon: HandHeart, title: "Akuntabel", body: "Mencatat proses dan tindak lanjut agar setiap tahapan dapat ditelusuri." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-12 lg:px-8 lg:py-16">
      <PageHeading eyebrow="Tentang BansosGuard" title="Teknologi untuk bantuan yang lebih transparan." description="BansosGuard adalah platform demonstrasi untuk mendukung transparansi, pendataan, pemantauan, dan pengawasan penyaluran bantuan sosial." />
      <section className="mt-8 rounded-[20px] bg-[#29224c] p-6 text-white sm:p-9">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c6baff]">Tujuan kami</p>
        <h2 className="mt-3 max-w-[740px] text-[24px] font-bold leading-tight tracking-[-0.05em] sm:text-[32px]">Bantuan tepat sasaran, pengawasan lebih transparan.</h2>
        <p className="mt-4 max-w-[720px] text-[12px] leading-6 text-[#d3d0e0]">Sistem dirancang untuk membantu pengelola mencatat program dan penyaluran, sekaligus memberi masyarakat akses ke informasi agregat dan kanal pengaduan yang menjaga privasi.</p>
      </section>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {principles.map(({ icon: Icon, title, body }) => <article key={title} className="rounded-[17px] border border-[#eae8f0] bg-white p-5"><span className="flex size-10 items-center justify-center rounded-xl bg-[#f3f0ff] text-[#6d4aff]"><Icon size={19} /></span><h2 className="mt-4 text-[14px] font-bold">{title}</h2><p className="mt-2 text-[11px] leading-5 text-[#77778a]">{body}</p></article>)}
      </div>
      <section className="mt-8 rounded-[18px] border border-[#eae8f0] bg-white p-6">
        <h2 className="text-[16px] font-bold">Bagaimana sistem bekerja</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-2">
          {["Data program dan wilayah dikelola oleh petugas berwenang.", "Penerima diverifikasi sebelum dicatat dalam program.", "Penyaluran bantuan dicatat beserta waktu dan petugas.", "Masyarakat melihat ringkasan publik atau mengirim laporan."].map((item, index) => <li key={item} className="flex gap-3 text-[11px] leading-5 text-[#77778a]"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f3f0ff] text-[10px] font-bold text-[#6d4aff]">{index + 1}</span>{item}</li>)}
        </ol>
      </section>
      <p className="mt-5 text-[10px] leading-5 text-[#9290a0]">BansosGuard merupakan aplikasi demonstrasi dan bukan kanal resmi pemerintah. Data seed yang disertakan adalah data simulasi, bukan data penerima bantuan yang sebenarnya.</p>
    </div>
  );
}
