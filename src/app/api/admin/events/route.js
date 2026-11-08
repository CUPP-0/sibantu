import { getRegionScope } from "@/lib/admin-regions";
import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";
import { fail, isSameOriginRequest, ok, serverError } from "@/lib/http";
import { distributionEventSchema } from "@/lib/validation";

export async function GET() {
  try {
    const access = await requireRole(["admin_daerah"]);
    if (access.error) return fail(access.error, access.status);
    const regionIds = await getRegionScope(access.user);
    if (!regionIds?.length) return fail("Wilayah kerja akun belum diatur.", 403);

    const events = await query(
      `SELECT e.id, e.title, e.description, e.scheduled_at AS scheduledAt,
        e.location, e.created_at AS createdAt, r.name AS regionName, u.name AS creatorName
       FROM distribution_events e
       JOIN regions r ON r.id = e.region_id
       LEFT JOIN users u ON u.id = e.created_by
       WHERE e.region_id IN (${regionIds.map(() => "?").join(", ")})
         AND e.is_active = 1
       ORDER BY e.scheduled_at ASC
       LIMIT 200`,
      regionIds,
    );
    return ok(events);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request) {
  if (!isSameOriginRequest(request)) return fail("Permintaan tidak valid.", 403);
  try {
    const access = await requireRole(["admin_daerah"]);
    if (access.error) return fail(access.error, access.status);
    const regionIds = await getRegionScope(access.user);
    if (!regionIds?.length || !access.user.regionId) {
      return fail("Wilayah kerja akun belum diatur.", 403);
    }

    const parsed = distributionEventSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message || "Data jadwal penyaluran tidak valid.");
    }
    const scheduledAt = new Date(parsed.data.scheduledAt);
    if (!Number.isFinite(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
      return fail("Tanggal dan waktu acara harus di masa mendatang.");
    }

    const [event] = await query(
      `INSERT INTO distribution_events
        (region_id, created_by, title, description, scheduled_at, location)
       VALUES (?, ?, ?, ?, ?, ?)
       RETURNING id, title, description, scheduled_at AS "scheduledAt", location`,
      [
        access.user.regionId,
        access.user.id,
        parsed.data.title,
        parsed.data.description,
        scheduledAt,
        parsed.data.location,
      ],
    );
    return ok(event, 201);
  } catch (error) {
    return serverError(error);
  }
}
