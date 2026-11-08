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

INSERT INTO citizen_accounts (user_id, beneficiary_id, verified_at)
SELECT u.id, b.id, CURRENT_TIMESTAMP
FROM users u
JOIN beneficiaries b ON b.id = 1
WHERE u.email = 'warga@bansosguard.id' AND u.role = 'masyarakat'
ON DUPLICATE KEY UPDATE
  beneficiary_id = VALUES(beneficiary_id),
  verified_at = VALUES(verified_at);
