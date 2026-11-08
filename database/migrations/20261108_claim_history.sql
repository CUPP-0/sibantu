USE bansosguard;

CREATE TABLE IF NOT EXISTS beneficiary_claims (
  beneficiary_program_id BIGINT UNSIGNED NOT NULL,
  status ENUM('belum_diambil','sudah_diambil') NOT NULL DEFAULT 'belum_diambil',
  cycle_number INT UNSIGNED NOT NULL DEFAULT 1,
  claimed_at DATETIME NULL,
  claimed_by BIGINT UNSIGNED NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (beneficiary_program_id),
  KEY idx_beneficiary_claim_status (status, updated_at),
  CONSTRAINT fk_claim_program FOREIGN KEY (beneficiary_program_id) REFERENCES beneficiary_programs(id) ON DELETE RESTRICT,
  CONSTRAINT fk_claim_user FOREIGN KEY (claimed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS beneficiary_claim_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  beneficiary_program_id BIGINT UNSIGNED NOT NULL,
  cycle_number INT UNSIGNED NOT NULL,
  action ENUM('diambil','reset') NOT NULL,
  officer_id BIGINT UNSIGNED NULL,
  reference_number VARCHAR(80) NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_claim_history_program_cycle (beneficiary_program_id, cycle_number, occurred_at),
  KEY idx_claim_history_date (occurred_at),
  CONSTRAINT fk_claim_history_program FOREIGN KEY (beneficiary_program_id) REFERENCES beneficiary_programs(id) ON DELETE RESTRICT,
  CONSTRAINT fk_claim_history_officer FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO beneficiary_claims
  (beneficiary_program_id, status, claimed_at, claimed_by)
SELECT bp.id,
  CASE WHEN d.status = 'berhasil' THEN 'sudah_diambil' ELSE 'belum_diambil' END,
  CASE WHEN d.status = 'berhasil' THEN d.distribution_date ELSE NULL END,
  CASE WHEN d.status = 'berhasil' THEN d.officer_id ELSE NULL END
FROM beneficiary_programs bp
LEFT JOIN distributions d ON d.beneficiary_program_id = bp.id;

INSERT INTO beneficiary_claim_history
  (beneficiary_program_id, cycle_number, action, officer_id, reference_number, amount, occurred_at, notes)
SELECT bp.id, 1, 'diambil', d.officer_id, d.reference_number, d.amount, d.distribution_date,
  'Riwayat penyaluran sebelumnya sebelum migrasi status pengambilan'
FROM beneficiary_programs bp
JOIN distributions d ON d.beneficiary_program_id = bp.id AND d.status = 'berhasil'
WHERE NOT EXISTS (
  SELECT 1 FROM beneficiary_claim_history h
  WHERE h.beneficiary_program_id = bp.id
    AND h.action = 'diambil'
    AND h.reference_number = d.reference_number
);
