import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth";
import { getPool, query } from "@/lib/db";
import { branchAdminSchema } from "@/lib/validation";
import { fail, isSameOriginRequest, ok, serverError } from "@/lib/http";

export async function GET() {
  try {
    const access = await requireRole(["super_admin"]);
    if (access.error) return fail(access.error, access.status);
    const branches = await query(
      `SELECT u.id AS adminId, u.name AS adminName, u.email, u.is_active AS isActive,
        u.wilayah_id AS regionId, r.name AS regionName, r.level AS regionLevel
       FROM users u
       JOIN regions r ON r.id = u.wilayah_id
       WHERE u.role = 'admin_daerah'
       ORDER BY r.name, u.name`,
    );

    const data = await Promise.all(branches.map(async (branch) => {
      const regionRows = await query(
        `WITH RECURSIVE region_tree AS (
          SELECT id FROM regions WHERE id = ?
          UNION ALL
          SELECT child.id FROM regions child JOIN region_tree parent ON child.parent_id = parent.id
        )
        SELECT id FROM region_tree`,
        [branch.regionId],
      );
      const regionIds = regionRows.map((row) => row.id);
      if (!regionIds.length) {
        return { ...branch, beneficiaries: 0, programEnrollments: 0, distributions: 0, distributedAmount: 0, pendingDistributions: 0 };
      }

      const [stats] = await query(
        `SELECT
          (SELECT COUNT(*) FROM beneficiaries b WHERE b.is_active = 1 AND b.region_id IN (${regionIds.map(() => "?").join(", ")})) AS beneficiaries,
          (SELECT COUNT(*) FROM beneficiary_programs bp
            JOIN beneficiaries b ON b.id = bp.beneficiary_id
            WHERE b.is_active = 1 AND b.region_id IN (${regionIds.map(() => "?").join(", ")})) AS programEnrollments,
          (SELECT COUNT(*) FROM distributions d
            JOIN beneficiary_programs bp ON bp.id = d.beneficiary_program_id
            JOIN beneficiaries b ON b.id = bp.beneficiary_id
            WHERE b.region_id IN (${regionIds.map(() => "?").join(", ")}) AND d.status = 'berhasil') AS distributions,
          (SELECT COALESCE(SUM(d.amount), 0) FROM distributions d
            JOIN beneficiary_programs bp ON bp.id = d.beneficiary_program_id
            JOIN beneficiaries b ON b.id = bp.beneficiary_id
            WHERE b.region_id IN (${regionIds.map(() => "?").join(", ")}) AND d.status = 'berhasil') AS distributedAmount,
          (SELECT COUNT(*) FROM distributions d
            JOIN beneficiary_programs bp ON bp.id = d.beneficiary_program_id
            JOIN beneficiaries b ON b.id = bp.beneficiary_id
            WHERE b.region_id IN (${regionIds.map(() => "?").join(", ")}) AND d.status = 'menunggu') AS pendingDistributions`,
            [...regionIds, ...regionIds, ...regionIds, ...regionIds, ...regionIds],
      );
      return {
        ...branch,
        isActive: Boolean(branch.isActive),
        beneficiaries: Number(stats.beneficiaries),
            programEnrollments: Number(stats.programEnrollments),
            distributions: Number(stats.distributions),
        distributedAmount: Number(stats.distributedAmount),
        pendingDistributions: Number(stats.pendingDistributions),
      };
    }));

    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request) {
  if (!isSameOriginRequest(request)) return fail("Permintaan tidak valid.", 403);
  const access = await requireRole(["super_admin"]);
  if (access.error) return fail(access.error, access.status);

  try {
    const parsed = branchAdminSchema.safeParse(await request.json());
    if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Data admin cabang belum valid.");
    const { name, email, password, regionId } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 12);
    const connection = await getPool().getConnection();

    try {
      await connection.beginTransaction();
      const [regions] = await connection.execute(
        "SELECT id, name FROM regions WHERE id = ? FOR UPDATE",
        [regionId],
      );
      if (!regions.length) {
        await connection.rollback();
        return fail("Wilayah cabang tidak ditemukan.", 422);
      }
      const [existingAdmins] = await connection.execute(
        "SELECT id FROM users WHERE role = 'admin_daerah' AND wilayah_id = ? AND is_active = 1 LIMIT 1",
        [regionId],
      );
      if (existingAdmins.length) {
        await connection.rollback();
        return fail("Wilayah ini sudah memiliki admin cabang aktif.", 409);
      }

      const [result] = await connection.execute(
        "INSERT INTO users (name, email, password, role, wilayah_id, is_active) VALUES (?, ?, ?, 'admin_daerah', ?, 1)",
        [name, email.toLowerCase(), passwordHash, regionId],
      );
      await connection.execute(
        "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata) VALUES (?, 'create_branch_admin', 'user', ?, ?)",
        [access.user.id, result.insertId, JSON.stringify({ regionId, regionName: regions[0].name })],
      );
      await connection.commit();
      return ok({ id: result.insertId, name, email: email.toLowerCase(), regionName: regions[0].name }, 201);
    } catch (error) {
      await connection.rollback();
      if (error.code === "ER_DUP_ENTRY") return fail("Email sudah digunakan oleh akun lain.", 409);
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    return serverError(error);
  }
}
