USE bansosguard;

INSERT INTO regions (id, parent_id, code, name, level) VALUES
(1, NULL, '31', 'DKI Jakarta', 'provinsi'),
(2, 1, '31.71', 'Jakarta Selatan', 'kabupaten'),
(3, 2, '31.71.01', 'Kebayoran Baru', 'kecamatan'),
(4, 3, '31.71.01.1001', 'Gunung', 'desa'),
(5, 3, '31.71.01.1002', 'Kramat Pela', 'desa'),
(6, 2, '31.71.02', 'Pancoran', 'kecamatan'),
(7, 6, '31.71.02.1001', 'Kalibata', 'desa');

INSERT INTO users (id, name, email, password, role, wilayah_id, is_active) VALUES
(1, 'Super Admin Demo', 'admin@bansosguard.id', '$2b$12$IEFUX1zQUyQRNF.TzvJtbeNYAoF2KL35xNx/mK8GAXhj9fiap9Yn6', 'super_admin', NULL, 1),
(2, 'Warga Demo', 'warga@bansosguard.id', '$2b$12$DZ0KwB5OrI03rYPn.ZP3.ut9jK7.FoateFg6xppD/LBhOwKrLA8o2', 'masyarakat', NULL, 1);

INSERT INTO assistance_programs (id, name, description, category, assistance_type, amount, quota, start_date, end_date, status) VALUES
(1, 'Program Sembako', 'Dukungan pemenuhan kebutuhan pangan untuk keluarga yang memenuhi kriteria.', 'Pangan', 'non_tunai', 200000, 1200, '2026-01-01', '2026-12-31', 'aktif'),
(2, 'Program Keluarga Harapan', 'Bantuan bersyarat untuk mendukung kesejahteraan keluarga dan akses layanan dasar.', 'Perlindungan Sosial', 'tunai', 750000, 800, '2026-01-01', '2026-12-31', 'aktif'),
(3, 'Bantuan Pendidikan', 'Dukungan pendidikan bagi peserta didik yang memenuhi persyaratan program.', 'Pendidikan', 'tunai', 500000, 600, '2026-02-01', '2026-11-30', 'aktif'),
(4, 'Bantuan Lansia', 'Dukungan pemenuhan kebutuhan dasar bagi warga lanjut usia.', 'Kesehatan', 'tunai', 300000, 300, '2026-03-01', '2026-12-31', 'aktif');

INSERT INTO beneficiaries (id, nik_encrypted, nik_lookup_hash, name, gender, birth_date, address, region_id, verification_status, is_active) VALUES
(1, 'SIMULATED_ENCRYPTED_DATA', SHA2('demo-nik-1', 256), 'Siti Aminah', 'P', '1984-05-12', 'Alamat simulasi 1', 4, 'terverifikasi', 1),
(2, 'SIMULATED_ENCRYPTED_DATA', SHA2('demo-nik-2', 256), 'Budi Santoso', 'L', '1977-08-03', 'Alamat simulasi 2', 4, 'terverifikasi', 1),
(3, 'SIMULATED_ENCRYPTED_DATA', SHA2('demo-nik-3', 256), 'Rina Lestari', 'P', '1991-02-21', 'Alamat simulasi 3', 5, 'menunggu', 1),
(4, 'SIMULATED_ENCRYPTED_DATA', SHA2('demo-nik-4', 256), 'Agus Pratama', 'L', '1962-11-17', 'Alamat simulasi 4', 7, 'terverifikasi', 1);

INSERT INTO citizen_accounts (user_id, beneficiary_id, verified_at)
SELECT u.id, b.id, CURRENT_TIMESTAMP
FROM users u
JOIN beneficiaries b ON b.id = 1
WHERE u.email = 'warga@bansosguard.id' AND u.role = 'masyarakat'
ON DUPLICATE KEY UPDATE
  beneficiary_id = VALUES(beneficiary_id),
  verified_at = VALUES(verified_at);

INSERT INTO beneficiary_programs (id, beneficiary_id, program_id, registration_date, eligibility_status, verification_status) VALUES
(1, 1, 1, '2026-01-05', 'layak', 'terverifikasi'),
(2, 1, 2, '2026-01-05', 'layak', 'terverifikasi'),
(3, 2, 1, '2026-01-08', 'layak', 'terverifikasi'),
(4, 3, 3, '2026-02-02', 'menunggu', 'menunggu'),
(5, 4, 4, '2026-03-10', 'layak', 'terverifikasi');

INSERT INTO distribution_schedules (id, program_id, region_id, officer_id, scheduled_date, location, status) VALUES
(1, 1, 4, 1, '2026-05-15 09:00:00', 'Kantor Kelurahan Gunung (simulasi)', 'selesai'),
(2, 2, 5, 1, '2026-06-10 09:00:00', 'Balai Warga Kramat Pela (simulasi)', 'dijadwalkan');

INSERT INTO distributions (id, beneficiary_program_id, officer_id, schedule_id, amount, distribution_date, status, reference_number, notes) VALUES
(1, 1, 1, 1, 200000, '2026-05-15 09:30:00', 'berhasil', 'DEMO-TRX-0001', 'Transaksi simulasi'),
(2, 2, 1, 2, 750000, '2026-06-10 09:00:00', 'menunggu', 'DEMO-TRX-0002', 'Data simulasi');

INSERT INTO complaints (id, ticket_number, category, region_id, description, status) VALUES
(1, 'BG-DEMO-0001', 'Bantuan tidak diterima', 4, 'Contoh laporan simulasi untuk demonstrasi sistem.', 'ditinjau');

INSERT INTO complaint_histories (complaint_id, user_id, old_status, new_status, notes) VALUES
(1, 1, NULL, 'diterima', 'Laporan simulasi dibuat'),
(1, 1, 'diterima', 'ditinjau', 'Laporan simulasi sedang ditinjau');

INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata) VALUES
(1, 'seed_demo', 'system', NULL, JSON_OBJECT('source', 'seed.sql', 'note', 'Data simulasi'));
