import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/http";

export async function GET() {
  try {
    const access = await requireRole(["masyarakat"]);
    if (access.error) return fail(access.error, access.status);

    const events = await query(
      `WITH RECURSIVE event_regions(event_id, region_id) AS (
        SELECT e.id, e.region_id
        FROM distribution_events e
        WHERE e.is_active = 1 AND e.scheduled_at >= CURRENT_TIMESTAMP
        UNION ALL
        SELECT er.event_id, child.id
        FROM event_regions er
        JOIN regions child ON child.parent_id = er.region_id
      )
      SELECT e.id, e.title, e.description, e.scheduled_at AS scheduledAt,
        e.location, r.name AS regionName
      FROM citizen_accounts ca
      JOIN beneficiaries b ON b.id = ca.beneficiary_id
      JOIN event_regions er ON er.region_id = b.region_id
      JOIN distribution_events e ON e.id = er.event_id
      JOIN regions r ON r.id = e.region_id
      WHERE ca.user_id = ? AND ca.verified_at IS NOT NULL AND b.is_active = 1
      ORDER BY e.scheduled_at ASC
      LIMIT 100`,
      [access.user.id],
    );
    return ok(events);
  } catch (error) {
    return serverError(error);
  }
}
