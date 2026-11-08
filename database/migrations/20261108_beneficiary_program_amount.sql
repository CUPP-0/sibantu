USE bansos_guard;

UPDATE beneficiary_programs bp
JOIN assistance_programs p ON p.id = bp.program_id
SET bp.assistance_amount = p.amount
WHERE bp.assistance_amount IS NULL;
