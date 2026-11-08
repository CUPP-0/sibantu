import { requireRole } from "@/lib/auth";
import { getRegionScope } from "@/lib/admin-regions";
import { getPool } from "@/lib/db";
import { fail, isSameOriginRequest, ok, serverError } from "@/lib/http";
import { beneficiaryProgramAmountSchema } from "@/lib/validation";

export async function PATCH(request, { params }) {
  if (!isSameOriginRequest(request)) return fail("Permintaan tidak valid.", 403);
  const access = await requireRole(["admin_daerah"]);
  if (access.error) return fail(access.error, access.status);
  const { programEnrollmentId } = await params;
  if (!/^[1-9]\d*$/.test(programEnrollmentId)) return fail("Data penerima-program tidak valid.", 400);

  const parsed = beneficiaryProgramAmountSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Nominal bantuan tidak valid.");
  const regionIds = await getRegionScope(access.user);
  if (!regionIds?.length) return fail("Wilayah kerja akun belum diatur.", 403);

  const connection = await getPool().getConnection();
  try {
    const [result] = await connection.execute(
      `UPDATE beneficiary_programs bp
       JOIN beneficiaries b ON b.id = bp.beneficiary_id
       SET bp.assistance_amount = ?
       WHERE bp.id = ? AND b.is_active = 1
         AND b.region_id IN (${regionIds.map(() => "?").join(", ")})`,
      [parsed.data.amount, programEnrollmentId, ...regionIds],
    );
    if (!result.affectedRows) return fail("Penerima-program tidak ditemukan di wilayah cabang Anda.", 404);
    return ok({ programEnrollmentId: Number(programEnrollmentId), amount: parsed.data.amount });
  } catch (error) {
    return serverError(error);
  } finally {
    connection.release();
  }
}
