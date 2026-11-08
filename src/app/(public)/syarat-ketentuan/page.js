import PageHeading from "@/components/page-heading";

export const metadata = { title: "Syarat dan Ketentuan" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 py-12 lg:px-8 lg:py-16">
      <PageHeading eyebrow="Informasi layanan" title="Syarat dan ketentuan." description="Ketentuan penggunaan aplikasi demonstrasi BansosGuard." />
      <div className="mt-8 grid gap-5 rounded-[20px] border border-[#eae8f0] bg-white p-6 text-[12px] leading-6 text-[#686779] sm:p-8">
        <section><h2 className="font-bold text-[#202033]">Penggunaan yang bertanggung jawab</h2><p className="mt-2">Gunakan layanan sesuai hukum dan hanya untuk tujuan informasi, pengawasan, serta pengujian yang sah. Jangan mengirim laporan palsu, mengakses akun tanpa izin, atau mengunggah data pribadi pihak lain.</p></section>
        <section><h2 className="font-bold text-[#202033]">Data dan ketersediaan</h2><p className="mt-2">Aplikasi disediakan sebagai demonstrasi. Informasi seed bersifat simulasi dan bukan konfirmasi kelayakan atau penetapan penerima bantuan dari instansi pemerintah.</p></section>
        <section><h2 className="font-bold text-[#202033]">Batasan layanan</h2><p className="mt-2">Fitur yang memerlukan integrasi eksternal, termasuk OTP, pemindaian QR produksi, unggah bukti, dan peta geografis terverifikasi, harus dikonfigurasi dan diuji sebelum dipakai secara operasional.</p></section>
      </div>
    </div>
  );
}
