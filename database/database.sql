CREATE DATABASE IF NOT EXISTS bansosguard
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE bansosguard;

CREATE TABLE IF NOT EXISTS regions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  parent_id BIGINT UNSIGNED NULL,
  code VARCHAR(32) NOT NULL,
  name VARCHAR(150) NOT NULL,
  level ENUM('provinsi','kabupaten','kecamatan','desa') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_regions_code (code),
  KEY idx_regions_parent_level (parent_id, level),
  CONSTRAINT fk_regions_parent FOREIGN KEY (parent_id) REFERENCES regions(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('super_admin','admin_daerah','petugas','masyarakat') NOT NULL,
  wilayah_id BIGINT UNSIGNED NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_region (role, wilayah_id),
  CONSTRAINT fk_users_region FOREIGN KEY (wilayah_id) REFERENCES regions(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS beneficiaries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nik_encrypted TEXT NOT NULL,
  nik_lookup_hash CHAR(64) NOT NULL,
  no_kk_encrypted TEXT NULL,
  name VARCHAR(150) NOT NULL,
  gender ENUM('L','P') NOT NULL,
  birth_date DATE NOT NULL,
  address TEXT NOT NULL,
  phone_encrypted TEXT NULL,
  region_id BIGINT UNSIGNED NOT NULL,
  verification_status ENUM('menunggu','terverifikasi','ditolak','perlu_pembaruan') NOT NULL DEFAULT 'menunggu',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_beneficiaries_nik_hash (nik_lookup_hash),
  KEY idx_beneficiaries_region_status (region_id, verification_status),
  KEY idx_beneficiaries_name (name),
  CONSTRAINT fk_beneficiaries_region FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS citizen_accounts (
  user_id BIGINT UNSIGNED NOT NULL,
  beneficiary_id BIGINT UNSIGNED NOT NULL,
  verified_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_citizen_accounts_beneficiary (beneficiary_id),
  CONSTRAINT fk_citizen_account_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_citizen_account_beneficiary FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assistance_programs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(80) NOT NULL,
  assistance_type ENUM('tunai','non_tunai','barang','layanan') NOT NULL,
  amount DECIMAL(15,2) NULL,
  quota INT UNSIGNED NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('draft','aktif','selesai','arsip') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_program_status_period (status, start_date, end_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS beneficiary_programs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  beneficiary_id BIGINT UNSIGNED NOT NULL,
  program_id BIGINT UNSIGNED NOT NULL,
  registration_date DATE NOT NULL,
  eligibility_status ENUM('menunggu','layak','tidak_layak') NOT NULL DEFAULT 'menunggu',
  verification_status ENUM('menunggu','terverifikasi','ditolak') NOT NULL DEFAULT 'menunggu',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_beneficiary_program (beneficiary_id, program_id),
  KEY idx_beneficiary_program_status (program_id, verification_status),
  CONSTRAINT fk_bp_beneficiary FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE RESTRICT,
  CONSTRAINT fk_bp_program FOREIGN KEY (program_id) REFERENCES assistance_programs(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS distribution_schedules (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  program_id BIGINT UNSIGNED NOT NULL,
  region_id BIGINT UNSIGNED NOT NULL,
  officer_id BIGINT UNSIGNED NULL,
  scheduled_date DATETIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  status ENUM('dijadwalkan','berlangsung','selesai','ditunda','dibatalkan') NOT NULL DEFAULT 'dijadwalkan',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_schedule_region_date (region_id, scheduled_date),
  CONSTRAINT fk_schedule_program FOREIGN KEY (program_id) REFERENCES assistance_programs(id) ON DELETE RESTRICT,
  CONSTRAINT fk_schedule_region FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE RESTRICT,
  CONSTRAINT fk_schedule_officer FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS distributions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  beneficiary_program_id BIGINT UNSIGNED NOT NULL,
  officer_id BIGINT UNSIGNED NOT NULL,
  schedule_id BIGINT UNSIGNED NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  distribution_date DATETIME NOT NULL,
  status ENUM('dijadwalkan','menunggu','berhasil','gagal','ditunda') NOT NULL DEFAULT 'menunggu',
  reference_number VARCHAR(80) NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_distributions_reference (reference_number),
  UNIQUE KEY uq_distribution_once_per_program (beneficiary_program_id),
  KEY idx_distributions_status_date (status, distribution_date),
  CONSTRAINT fk_distribution_bp FOREIGN KEY (beneficiary_program_id) REFERENCES beneficiary_programs(id) ON DELETE RESTRICT,
  CONSTRAINT fk_distribution_officer FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_distribution_schedule FOREIGN KEY (schedule_id) REFERENCES distribution_schedules(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS qr_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  beneficiary_program_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_qr_token_hash (token_hash),
  KEY idx_qr_program_active (beneficiary_program_id, is_active),
  CONSTRAINT fk_qr_bp FOREIGN KEY (beneficiary_program_id) REFERENCES beneficiary_programs(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS complaints (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ticket_number VARCHAR(24) NOT NULL,
  reporter_id BIGINT UNSIGNED NULL,
  category VARCHAR(80) NOT NULL,
  region_id BIGINT UNSIGNED NOT NULL,
  description TEXT NOT NULL,
  attachment_path VARCHAR(500) NULL,
  status ENUM('diterima','ditinjau','investigasi','menunggu_informasi','selesai','ditolak') NOT NULL DEFAULT 'diterima',
  assigned_to BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_complaints_ticket (ticket_number),
  KEY idx_complaints_region_status (region_id, status, created_at),
  CONSTRAINT fk_complaint_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_complaint_region FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE RESTRICT,
  CONSTRAINT fk_complaint_assignee FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS complaint_histories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  complaint_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  old_status VARCHAR(40) NULL,
  new_status VARCHAR(40) NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_complaint_history (complaint_id, created_at),
  CONSTRAINT fk_complaint_history_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE RESTRICT,
  CONSTRAINT fk_complaint_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS complaint_private_data (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  complaint_id BIGINT UNSIGNED NOT NULL,
  reporter_name_encrypted TEXT NOT NULL,
  contact_encrypted TEXT NOT NULL,
  contact_lookup_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_complaint_private (complaint_id),
  KEY idx_private_contact_hash (contact_lookup_hash),
  CONSTRAINT fk_private_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS otp_verifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_identifier_hash CHAR(64) NOT NULL,
  otp_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_otp_lookup (user_identifier_hash, expires_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80) NULL,
  entity_id BIGINT UNSIGNED NULL,
  metadata JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_user_time (user_id, created_at),
  KEY idx_audit_entity (entity_type, entity_id, created_at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
