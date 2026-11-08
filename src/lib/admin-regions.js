import { query } from "@/lib/db";

export async function getRegionScope(user) {
  if (user.role === "super_admin") return null;
  if (!user.regionId) return [];

  const rows = await query(
    `WITH RECURSIVE region_tree AS (
      SELECT id FROM regions WHERE id = ?
      UNION ALL
      SELECT child.id FROM regions child JOIN region_tree parent ON child.parent_id = parent.id
    )
    SELECT id FROM region_tree`,
    [user.regionId],
  );
  return rows.map((row) => row.id);
}

export function placeholders(values) {
  return values.map(() => "?").join(", ");
}
