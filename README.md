# SiBantu

Platform demonstrasi transparansi bantuan sosial dengan Next.js App Router, JavaScript, Tailwind CSS, Route Handlers, dan Supabase Cloud PostgreSQL. Antarmuka menggunakan bahasa Indonesia, responsif, dan tidak menampilkan identitas pribadi penerima pada halaman transparansi publik.

## Fitur yang tersedia

- Homepage publik, daftar program, transparansi distribusi, informasi cek bantuan, pengaduan, pelacakan tiket, dan halaman informasi.
- Statistik publik dan dashboard pengelola membaca data Supabase PostgreSQL melalui API.
- Login admin dan warga dengan password bcrypt dan cookie sesi HttpOnly; koneksi database dilakukan dari server aplikasi ke Supabase, bukan dari browser.
- Pengecekan status program bantuan publik dengan pencocokan NIK ber-rate-limit; warga juga dapat masuk memakai email atau NIK beserta kata sandi.
- Pengecekan peran dan pembatasan statistik admin daerah ke hierarki wilayah tugas.
- Super admin dapat membuat satu akun admin aktif per wilayah cabang serta mencari cabang untuk melihat progres dan rincian penyaluran per program.
- Super admin dapat melihat semua pengaduan lintas wilayah melalui halaman `/admin/pengaduan`; data kontak dan identitas pelapor tidak ditampilkan dalam daftar.
- Admin cabang dapat membuat jadwal pengambilan bantuan; notifikasi hanya muncul bagi warga yang wilayahnya berada dalam cakupan cabang tersebut.
- Jadwal pengambilan yang waktunya sudah lewat dihapus otomatis oleh job pg_cron setiap menit.
- Admin cabang mendaftarkan akun warga dengan kata sandi yang ditentukan saat pembuatan; wilayah warga otomatis mengikuti wilayah akun cabang. Warga melihat QR klaim singkat di profil, admin memindainya, dan status/tanggal pengambilan serta riwayat klaim tersimpan. Admin dapat mereset status satu cabang tanpa menghapus riwayat.
- Pengiriman pengaduan dengan data pelapor terenkripsi AES-256-GCM, hash kontak untuk pelacakan tiket, dan pencatatan riwayat dalam transaksi.
- Validasi input dengan Zod, parameterized query, pemeriksaan origin untuk request yang mengubah data, dan pembatasan percobaan berbasis proses.
- Skema PostgreSQL relasional dan seed demonstrasi dengan akun serta data simulasi.

## Persyaratan

- Node.js 20.9 atau lebih baru.
- Akun Supabase Cloud dan proyek PostgreSQL.
- npm.

## Menjalankan secara lokal

1. Buat proyek Supabase Cloud.
2. Buka **SQL Editor**, lalu jalankan file database `database/sibantu-supabase.sql`. File ini berisi seluruh skema, fungsi trigger, akun demo, dan data simulasi; impor ke database Supabase baru.
3. Buka **Project Settings → Database → Connect**, salin connection string PostgreSQL (Transaction Pooler direkomendasikan), lalu isi `DATABASE_URL` di `.env.local`. Koneksi TLS dan verifikasi sertifikat server aktif secara default.
4. Jika koneksi melaporkan sertifikat Supabase tidak dipercaya, unduh CA certificate database dari pengaturan SSL database proyek Supabase, simpan sebagai file PEM lokal yang tidak di-commit, lalu isi `DATABASE_SSL_CA` dengan path file tersebut di `.env.local`. Jangan menonaktifkan verifikasi sertifikat untuk mengatasi error TLS.
5. Salin `.env.example` menjadi `.env.local` dan lengkapi `DATABASE_URL` serta rahasia aplikasi. Import SQL tersebut menyiapkan database cloud baru; data yang saat ini tersimpan pada MySQL lokal tidak disalin otomatis.
6. Buat nilai rahasia yang berbeda untuk setiap lingkungan. Contoh PowerShell:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

   Gunakan keluaran sebagai `AUTH_SECRET`, lalu buat keluaran baru yang berbeda untuk `DATA_LOOKUP_SECRET`. Buat kunci enkripsi dengan:

   ```powershell
   [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
   ```

   Gunakan keluaran sebagai `DATA_ENCRYPTION_KEY`. Jangan mengirimkan atau menyimpan kunci produksi di repositori.

7. Pasang dependensi dan jalankan aplikasi:

   ```powershell
   npm install
   npm run dev
   ```

8. Buka `http://localhost:3000`.

### Akun demonstrasi

| Peran | Email | Kata sandi |
|---|---|---|
| Super Admin | `admin@sibantu.id` | `SiBantu!2026` |
| Warga | `warga@sibantu.id` | `WargaSiBantu!2026` |

Login admin diarahkan ke `/admin/dashboard`; login warga diarahkan ke `/warga/dashboard`. Kedua akun hanya untuk demonstrasi. Ganti kata sandi dan nonaktifkan akun demo sebelum aplikasi dipublikasikan. Data NIK, alamat, dan kontak seed hanyalah placeholder simulasi; buat data warga baru dari akun admin cabang untuk menguji pencarian NIK.

## API utama

- `POST /api/auth/login` (email atau NIK untuk warga), `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/public/statistics`, `GET /api/public/programs`, `GET /api/public/distributions`, `GET /api/public/regions`, `POST /api/public/assistance` (pencocokan NIK)
- `POST /api/public/complaints`, `POST /api/public/complaints/track`
- `GET /api/admin/complaints` (khusus super admin; pagination, filter status, dan pencarian)
- `GET /api/admin/dashboard`
- `GET/POST /api/admin/events` (khusus admin cabang; membuat jadwal untuk wilayah cakupan cabang)
- `GET /api/citizen/events` (notifikasi jadwal sesuai wilayah akun warga)
- `GET/POST /api/admin/branches`, `GET /api/admin/branches/[branchId]/progress`
- `GET /api/admin/regions`, `GET/POST /api/admin/beneficiaries`
- `GET /api/admin/claims`, `POST /api/admin/claims/verify`, `POST /api/admin/claims/confirm`, `POST /api/admin/claims/reset`, `GET /api/admin/claims/history`
- `POST /api/admin/qr/verify`, `POST /api/admin/qr/confirm` (QR distribusi legacy)

Halaman progres super admin tersedia di `/admin/progres`; daftar pengaduan lintas wilayah ada di `/admin/pengaduan`. Admin cabang mengelola tabel status yang dikelompokkan per program di `/admin/penerima`, membuat penerima lewat modal, lalu mengatur nominal bantuan per penerima-program langsung di tabel. Nilai awal mengikuti nominal program. Admin memindai QR warga di `/admin/verifikasi-qr`, mencari riwayat pengambilan berdasarkan nama atau rentang tanggal di `/admin/riwayat`, dan mengumumkan jadwal pengambilan di `/admin/event`. Jadwal hanya ditampilkan pada portal warga yang wilayahnya termasuk cabang pembuat. QR profil berlaku 15 menit.

Jalankan `database/sibantu-supabase.sql` melalui SQL Editor Supabase untuk menyiapkan seluruh skema SiBantu, termasuk tabel jadwal bantuan dan job pg_cron yang menghapus jadwal kedaluwarsa setiap menit. Untuk database yang sebelumnya sudah diimpor, jalankan blok `CREATE EXTENSION ... pg_cron` dan `DO $$ ... cron.schedule ... $$` di bagian akhir file tersebut melalui SQL Editor agar penghapusan otomatis diaktifkan.

Semua query menggunakan placeholder PostgreSQL. Endpoint pengelola memeriksa sesi dan peran di server. Pengecekan NIK publik dibatasi lima percobaan per jam per alamat IP, tidak mengembalikan NIK/kontak/QR, dan cocok untuk demonstrasi. Sebelum digunakan dengan data nyata, tambahkan verifikasi identitas yang lebih kuat dan rate limiter terdistribusi.

## Batasan demonstrasi

Integrasi OTP belum dikonfigurasi. Login dengan NIK tetap memerlukan kata sandi akun warga. Pengecekan status menggunakan NIK sebagai faktor pencarian saja, bukan autentikasi identitas yang kuat. Unggah lampiran, pengelolaan program/pengguna lanjutan, ekspor laporan, dan audit UI belum tersedia. Jangan gunakan aplikasi ini untuk memproses data bantuan sosial yang sebenarnya sebelum fitur tersebut, pengujian keamanan, retensi data, pengelolaan kunci, dan infrastruktur produksi disiapkan. Jangan pernah mengekspos `DATABASE_URL` atau kata sandi database pada variabel `NEXT_PUBLIC_*`.

Rate limit saat ini disimpan dalam memori proses dan hanya cocok untuk demonstrasi satu instance. Deployment produksi memerlukan rate limiter terdistribusi, HTTPS, pengelolaan rahasia, backup terenkripsi, pemindaian lampiran, pemantauan, serta pengujian akses dan privasi secara menyeluruh.
