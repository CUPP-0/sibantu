# BansosGuard

Platform demonstrasi transparansi bantuan sosial dengan Next.js App Router, JavaScript, Tailwind CSS, Route Handlers, dan MySQL. Antarmuka menggunakan bahasa Indonesia, responsif, dan tidak menampilkan identitas penerima pada halaman publik.

## Fitur yang tersedia

- Homepage publik, daftar program, transparansi distribusi, informasi cek bantuan, pengaduan, pelacakan tiket, dan halaman informasi.
- Statistik publik dan dashboard pengelola membaca data MySQL melalui API.
- Login admin dan warga dengan password bcrypt dan cookie sesi HttpOnly; profil warga hanya-baca.
- Pengecekan status program bantuan publik dengan pencocokan NIK ber-rate-limit; warga juga dapat masuk memakai email atau NIK beserta kata sandi.
- Pengecekan peran dan pembatasan statistik admin daerah ke hierarki wilayah tugas.
- Super admin dapat membuat satu akun admin aktif per wilayah cabang serta mencari cabang untuk melihat progres dan rincian penyaluran per program.
- Super admin dapat melihat semua pengaduan lintas wilayah melalui halaman `/admin/pengaduan`; data kontak dan identitas pelapor tidak ditampilkan dalam daftar.
- Admin cabang mendaftarkan akun warga dengan kata sandi yang ditentukan saat pembuatan; wilayah warga otomatis mengikuti wilayah akun cabang. Warga melihat QR klaim singkat di profil, admin memindainya, dan status/tanggal pengambilan serta riwayat klaim tersimpan. Admin dapat mereset status satu cabang tanpa menghapus riwayat.
- Pengiriman pengaduan dengan data pelapor terenkripsi AES-256-GCM, hash kontak untuk pelacakan tiket, dan pencatatan riwayat dalam transaksi.
- Validasi input dengan Zod, parameterized query, pemeriksaan origin untuk request yang mengubah data, dan pembatasan percobaan berbasis proses.
- Skema MySQL relasional dan seed demonstrasi dengan akun serta data simulasi.

## Persyaratan

- Node.js 20.9 atau lebih baru.
- MySQL 8.0+ (misalnya melalui XAMPP atau Laragon).
- npm.

## Menjalankan secara lokal

1. Jalankan MySQL melalui XAMPP/Laragon dan buka phpMyAdmin.
2. Pilih tab **Import**, impor `database/database.sql`, lalu impor `database/seed.sql`.
   Jika database sudah memakai seed demo versi sebelumnya, pilih database yang digunakan aplikasi di phpMyAdmin (sesuai `DB_NAME`), lalu impor `database/demo-accounts.sql` dan `database/migrations/20261108_citizen_accounts.sql` untuk menautkan akun warga ke penerima simulasi.
   Untuk status pengambilan dan riwayat/reset, impor file baru `database/migrations/20261108_claim_history.sql` pada database yang sama. Untuk menyimpan nominal bantuan per penerima-program, impor `database/migrations/20261108_beneficiary_program_amount.sql` setelahnya. File SQL dasar tidak perlu diubah.
3. Salin `.env.example` menjadi `.env.local`, lalu atur koneksi database.
4. Buat nilai rahasia yang berbeda untuk setiap lingkungan. Contoh PowerShell:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

   Gunakan keluaran sebagai `AUTH_SECRET`, lalu buat keluaran baru yang berbeda untuk `DATA_LOOKUP_SECRET`. Buat kunci enkripsi dengan:

   ```powershell
   [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
   ```

   Gunakan keluaran sebagai `DATA_ENCRYPTION_KEY`. Jangan mengirimkan atau menyimpan kunci produksi di repositori.

5. Pasang dependensi dan jalankan aplikasi:

   ```powershell
   npm install
   npm run dev
   ```

6. Buka `http://localhost:3000`.

### Akun demonstrasi

| Peran | Email | Kata sandi |
|---|---|---|
| Super Admin | `admin@bansosguard.id` | `BansosGuard!2026` |
| Warga | `warga@bansosguard.id` | `WargaGuard!2026` |

Login admin diarahkan ke `/admin/dashboard`; login warga diarahkan ke `/warga/dashboard`. Kedua akun hanya untuk demonstrasi. Ganti kata sandi dan nonaktifkan akun demo sebelum aplikasi dipublikasikan.

## API utama

- `POST /api/auth/login` (email atau NIK untuk warga), `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/public/statistics`, `GET /api/public/programs`, `GET /api/public/distributions`, `GET /api/public/regions`, `POST /api/public/assistance` (pencocokan NIK)
- `POST /api/public/complaints`, `POST /api/public/complaints/track`
- `GET /api/admin/complaints` (khusus super admin; pagination, filter status, dan pencarian)
- `GET /api/admin/dashboard`
- `GET/POST /api/admin/branches`, `GET /api/admin/branches/[branchId]/progress`
- `GET /api/admin/regions`, `GET/POST /api/admin/beneficiaries`
- `GET /api/admin/claims`, `POST /api/admin/claims/verify`, `POST /api/admin/claims/confirm`, `POST /api/admin/claims/reset`, `GET /api/admin/claims/history`
- `POST /api/admin/qr/verify`, `POST /api/admin/qr/confirm` (QR distribusi legacy)

Halaman progres super admin tersedia di `/admin/progres`; daftar pengaduan lintas wilayah ada di `/admin/pengaduan`. Admin cabang mengelola tabel status yang dikelompokkan per program di `/admin/penerima`, membuat penerima lewat modal, lalu mengatur nominal bantuan per penerima-program langsung di tabel. Nilai awal mengikuti nominal program. Admin memindai QR warga di `/admin/verifikasi-qr` dan mencari riwayat pengambilan berdasarkan nama atau rentang tanggal di `/admin/riwayat`. QR profil berlaku 15 menit. Migrasi klaim menyiapkan tabel status/riwayat; migrasi nominal menambahkan kolom nilai bantuan per penerima-program.

Semua query menggunakan placeholder. Endpoint pengelola memeriksa sesi dan peran di server. Pengecekan NIK publik dibatasi lima percobaan per jam per alamat IP, tidak mengembalikan NIK/kontak/QR, dan cocok untuk demonstrasi. Sebelum digunakan dengan data nyata, tambahkan verifikasi identitas yang lebih kuat dan rate limiter terdistribusi.

## Batasan demonstrasi

Integrasi OTP belum dikonfigurasi. Login dengan NIK tetap memerlukan kata sandi akun warga. Pengecekan status menggunakan NIK sebagai faktor pencarian saja, bukan autentikasi identitas yang kuat. Unggah lampiran, pengelolaan program/pengguna lanjutan, ekspor laporan, dan audit UI belum tersedia. Jangan gunakan aplikasi ini untuk memproses data bantuan sosial yang sebenarnya sebelum fitur tersebut, pengujian keamanan, retensi data, pengelolaan kunci, dan infrastruktur produksi disiapkan.

Rate limit saat ini disimpan dalam memori proses dan hanya cocok untuk demonstrasi satu instance. Deployment produksi memerlukan rate limiter terdistribusi, HTTPS, pengelolaan rahasia, backup terenkripsi, pemindaian lampiran, pemantauan, serta pengujian akses dan privasi secara menyeluruh.
