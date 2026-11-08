import PageHeading from "@/components/page-heading";
import TransparencyCharts from "@/components/transparency-charts";

export const metadata = { title: "Transparansi" };

export default function TransparencyPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8 lg:py-16">
      <PageHeading eyebrow="Transparansi publik" title="Pantau penyaluran bantuan." description="Ringkasan distribusi bantuan sosial dari catatan sistem. Data ditampilkan dalam bentuk agregat untuk melindungi identitas dan alamat penerima." />
      <div className="mt-8"><TransparencyCharts /></div>
      <div className="mt-5 flex items-start gap-3 rounded-[14px] border border-[#e8e3fb] bg-[#f7f5ff] p-4 text-[11px] leading-5 text-[#5b5477]">
        <span className="mt-0.5 font-bold text-[#6d4aff]">i</span>
        <p>Data publik tidak menampilkan NIK, nomor telepon, nama penerima, maupun alamat rumah. Informasi diperbarui berdasarkan transaksi yang tercatat pada basis data.</p>
      </div>
    </div>
  );
}
