import { requireRole } from "@/lib/auth";
import { query } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/http";

const complaintStatuses = new Set([
  "diterima",
  "ditinjau",
  "investigasi",
  "menunggu_informasi",
  "selesai",
  "ditolak",
]);
const pageSize = 25;

export async function GET(request) {
  try {
    const access = await requireRole(["super_admin"]);
    if (access.error) return fail(access.error, access.status);

    const { searchParams } = new URL(request.url);
    const requestedPage = Number(searchParams.get("page") || 1);
    const status = searchParams.get("status") || "";
    const search = (searchParams.get("q") || "").trim().slice(0, 100);
    if (!Number.isSafeInteger(requestedPage) || requestedPage < 1) return fail("Nomor halaman tidak valid.", 400);
    if (status && !complaintStatuses.has(status)) return fail("Filter status tidak valid.", 400);

    const conditions = [];
    const values = [];
    if (status) {
      conditions.push("c.status = ?");
      values.push(status);
    }
    if (search) {
      conditions.push("(c.ticket_number LIKE ? OR c.category LIKE ? OR r.name LIKE ?)");
      const searchTerm = `%${search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const [countRows, complaints] = await Promise.all([
      query(
        `SELECT COUNT(*) AS total
         FROM complaints c
         JOIN regions r ON r.id = c.region_id
         ${where}`,
        values,
      ),
      query(
        `SELECT c.id, c.ticket_number AS ticketNumber, c.category, c.description,
          c.status, c.created_at AS createdAt, c.updated_at AS updatedAt, r.name AS regionName
         FROM complaints c
         JOIN regions r ON r.id = c.region_id
         ${where}
         ORDER BY c.created_at DESC, c.id DESC
         LIMIT ? OFFSET ?`,
        [...values, pageSize, (requestedPage - 1) * pageSize],
      ),
    ]);
    const total = Number(countRows[0].total);

    return ok({
      complaints,
      pagination: {
        page: requestedPage,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
