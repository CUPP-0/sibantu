import { requireRole } from "@/lib/auth";
import { getRegionScope } from "@/lib/admin-regions";
import { query } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/http";

export async function GET() {
  try {
    const access = await requireRole(["super_admin", "admin_daerah"]);
    if (access.error) return fail(access.error, access.status);
    const regionIds = await getRegionScope(access.user);
    if (regionIds && !regionIds.length) return fail("Wilayah kerja akun belum diatur.", 403);

    const regions = regionIds === null
      ? await query("SELECT id, parent_id AS parentId, name, level FROM regions ORDER BY name")
      : await query(
        `SELECT id, parent_id AS parentId, name, level
         FROM regions WHERE id IN (${regionIds.map(() => "?").join(", ")})
         ORDER BY name`,
        regionIds,
      );
    return ok(regions);
  } catch (error) {
    return serverError(error);
  }
}
