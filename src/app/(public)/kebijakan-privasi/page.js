import PageHeading from "@/components/page-heading";

export const metadata = { title: "Kebijakan Privasi" };

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-[900px] px-5 py-12 lg:px-8 lg:py-16">
      <PageHeading eyebrow="Informasi layanan" title="Kebijakan privasi." description="Ringkasan prinsip perlindungan data pada aplikasi demonstrasi SiBantu." />
      <div className="mt-8 grid gap-5 rounded-[20px] border border-[#eae8f0] bg-white p-6 text-[12px] leading-6 text-[#686779] sm:p-8">
        <section><h2 className="font-bold text-[#202033]">Data yang digunakan</h2><p className="mt-2">Aplikasi hanya memproses data yang dibutuhkan untuk autentikasi, pengelolaan program, penyaluran, dan tindak lanjut pengaduan. Data demo yang disediakan tidak mewakili individu nyata.</p></section>
        <section><h2 className="font-bold text-[#202033]">Perlindungan informasi</h2><p className="mt-2">Kata sandi di-hash, sesi menggunakan cookie HttpOnly, dan kontak pelapor pada laporan baru dienkripsi sebelum disimpan. Statistik publik disajikan dalam bentuk agregat.</p></section>
        <section><h2 className="font-bold text-[#202033]">Penggunaan data produksi</h2><p className="mt-2">Sebelum digunakan untuk data nyata, penyelenggara wajib menyiapkan dasar pemrosesan yang sah, pengamanan kunci enkripsi, retensi data, pengendalian akses, serta prosedur respons insiden.</p></section>
        <section><h2 className="font-bold text-[#202033]">Pengecekan bantuan</h2><p className="mt-2">Halaman cek bantuan mencocokkan NIK dengan data penerima dan menampilkan nama, wilayah, program, nilai, serta status bantuan tanpa meminta login. NIK tidak dikirim kembali atau disimpan oleh fitur pencarian. Pengecekan dibatasi lima kali per jam per alamat IP, tetapi karena NIK saja bukan verifikasi identitas yang kuat, gunakan halaman ini hanya untuk demonstrasi dan jangan memproses data bantuan nyata sebelum perlindungan tambahan diterapkan.</p></section>
      </div>
    </div>
  );
}
