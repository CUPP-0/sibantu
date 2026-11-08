import { requireRole } from "@/lib/auth";
import { getRegionScope } from "@/lib/admin-regions";
import { query } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/http";

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function GET(request) {
  try {
    const access = await requireRole(["admin_daerah"]);
    if (access.error) return fail(access.error, access.status);
    const regionIds = await getRegionScope(access.user);
    if (!regionIds?.length) return fail("Wilayah kerja akun belum diatur.", 403);

    const parameters = new URL(request.url).searchParams;
    const name = parameters.get("name")?.trim() || "";
    const from = parameters.get("from") || "";
    const to = parameters.get("to") || "";
    if (name.length > 150) return fail("Nama pencarian maksimal 150 karakter.", 400);
    if ((from && !isValidDate(from)) || (to && !isValidDate(to))) {
      return fail("Format tanggal harus YYYY-MM-DD.", 400);
    }
    if (from && to && from > to) return fail("Tanggal awal tidak boleh melewati tanggal akhir.", 400);

    const filters = [`b.region_id IN (${regionIds.map(() => "?").join(", ")})`, "h.action = 'diambil'"];
    const values = [...regionIds];
    if (name) {
      filters.push("b.name LIKE ?");
      values.push(`%${name}%`);
    }
    if (from) {
      filters.push("h.occurred_at >= ?");
      values.push(`${from} 00:00:00`);
    }
    if (to) {
      filters.push("h.occurred_at < CAST(? AS DATE) + INTERVAL '1 day'");
      values.push(`${to} 00:00:00`);
    }

    const history = await query(
      `SELECT h.id, h.cycle_number AS cycleNumber, h.action, h.reference_number AS referenceNumber,
        h.amount, h.occurred_at AS occurredAt, h.notes,
        b.name AS beneficiaryName, p.name AS programName, r.name AS regionName,
        u.name AS officerName
       FROM beneficiary_claim_history h
       JOIN beneficiary_programs bp ON bp.id = h.beneficiary_program_id
       JOIN beneficiaries b ON b.id = bp.beneficiary_id
       JOIN assistance_programs p ON p.id = bp.program_id
       JOIN regions r ON r.id = b.region_id
       LEFT JOIN users u ON u.id = h.officer_id
       WHERE ${filters.join(" AND ")}
       ORDER BY h.occurred_at DESC, h.id DESC
       LIMIT 500`,
      values,
    );
    return ok(history.map((entry) => ({
      ...entry,
      amount: Number(entry.amount),
    })));
  } catch (error) {
    return serverError(error);
  }
}
