import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth";
import { getRegionScope } from "@/lib/admin-regions";
import { encryptPrivateValue, hashIdentifier } from "@/lib/crypto";
import { getPool, query } from "@/lib/db";
import { fail, isSameOriginRequest, ok, serverError } from "@/lib/http";
import { citizenAccountSchema } from "@/lib/validation";

export async function GET() {
  try {
    const access = await requireRole(["admin_daerah"]);
    if (access.error) return fail(access.error, access.status);
    const regionIds = await getRegionScope(access.user);
    if (!regionIds?.length) return fail("Wilayah kerja akun belum diatur.", 403);

    const beneficiaries = await query(
      `SELECT b.id, b.name, u.email, r.name AS regionName,
        p.id AS programId, p.name AS programName, bp.id AS beneficiaryProgramId,
        bp.verification_status AS verificationStatus,
        bp.assistance_amount AS assistanceAmount,
        d.status AS distributionStatus, bc.status AS claimStatus, bc.claimed_at AS claimedAt
       FROM beneficiaries b
       JOIN citizen_accounts ca ON ca.beneficiary_id = b.id
       JOIN users u ON u.id = ca.user_id
       JOIN regions r ON r.id = b.region_id
       LEFT JOIN beneficiary_programs bp ON bp.beneficiary_id = b.id
       LEFT JOIN assistance_programs p ON p.id = bp.program_id
       LEFT JOIN distributions d ON d.beneficiary_program_id = bp.id
       LEFT JOIN beneficiary_claims bc ON bc.beneficiary_program_id = bp.id
       WHERE b.region_id IN (${regionIds.map(() => "?").join(", ")}) AND b.is_active = 1
       ORDER BY b.created_at DESC
       LIMIT 200`,
      regionIds,
    );
    return ok(beneficiaries);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request) {
  if (!isSameOriginRequest(request)) return fail("Permintaan tidak valid.", 403);
  const access = await requireRole(["admin_daerah"]);
  if (access.error) return fail(access.error, access.status);

  let connection;
  try {
    const parsed = citizenAccountSchema.safeParse(await request.json());
    if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Data warga belum valid.");
    const { name, email, password, nik, gender, birthDate, address, phone, programId } = parsed.data;
    const regionId = access.user.regionId;
    const regionIds = await getRegionScope(access.user);
    if (!regionIds?.length) return fail("Wilayah kerja akun belum diatur.", 403);
    if (!regionId || !regionIds.includes(regionId)) return fail("Wilayah kerja akun belum diatur.", 403);

    const passwordHash = await bcrypt.hash(password, 12);
    const nikHash = hashIdentifier(nik);
    const encryptedNik = encryptPrivateValue(nik);
    const encryptedPhone = phone ? encryptPrivateValue(phone) : null;
    connection = await getPool().getConnection();
    await connection.beginTransaction();

    const [existingEmail] = await connection.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email.toLowerCase()],
    );
    if (existingEmail.length) {
      await connection.rollback();
      return fail("Email sudah digunakan oleh akun lain.", 409);
    }
    const [programs] = await connection.execute(
      "SELECT id, amount, name FROM assistance_programs WHERE id = ? AND status = 'aktif' LIMIT 1",
      [programId],
    );
    if (!programs.length) {
      await connection.rollback();
      return fail("Program bantuan tidak aktif atau tidak ditemukan.", 422);
    }

    const [userResult] = await connection.execute(
      "INSERT INTO users (name, email, password, role, wilayah_id, is_active) VALUES (?, ?, ?, 'masyarakat', ?, 1)",
      [name, email.toLowerCase(), passwordHash, regionId],
    );
    const [beneficiaryResult] = await connection.execute(
      `INSERT INTO beneficiaries
        (nik_encrypted, nik_lookup_hash, name, gender, birth_date, address, phone_encrypted, region_id, verification_status, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'terverifikasi', 1)`,
      [encryptedNik, nikHash, name, gender, birthDate, address, encryptedPhone, regionId],
    );
    await connection.execute(
      "INSERT INTO citizen_accounts (user_id, beneficiary_id, verified_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
      [userResult.insertId, beneficiaryResult.insertId],
    );
    const [programResult] = await connection.execute(
      `INSERT INTO beneficiary_programs
        (beneficiary_id, program_id, assistance_amount, registration_date, eligibility_status, verification_status)
       VALUES (?, ?, ?, CURRENT_DATE(), 'layak', 'terverifikasi')`,
      [beneficiaryResult.insertId, programId, programs[0].amount],
    );
    await connection.execute(
      "INSERT INTO beneficiary_claims (beneficiary_program_id) VALUES (?)",
      [programResult.insertId],
    );
    await connection.execute(
      "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata) VALUES (?, 'create_beneficiary_account', 'beneficiary', ?, ?)",
      [access.user.id, beneficiaryResult.insertId, JSON.stringify({ regionId, programId, userId: userResult.insertId })],
    );
    await connection.commit();

    return ok({
      beneficiary: { id: beneficiaryResult.insertId, name, email: email.toLowerCase(), programName: programs[0].name },
    }, 201);
  } catch (error) {
    if (connection) await connection.rollback();
    if (error.code === "ER_DUP_ENTRY") return fail("NIK atau email sudah terdaftar.", 409);
    return serverError(error);
  } finally {
    connection?.release();
  }
}
