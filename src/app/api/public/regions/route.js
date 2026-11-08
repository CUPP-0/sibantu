import { query } from "@/lib/db";
import { ok, serverError } from "@/lib/http";

export async function GET() {
  try {
    const regions = await query(
      "SELECT id, name, level FROM regions WHERE level IN ('kabupaten','kecamatan','desa') ORDER BY name",
    );
    return ok(regions);
  } catch (error) {
    return serverError(error);
  }
}
