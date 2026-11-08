import { randomBytes } from "node:crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { complaintSchema } from "@/lib/validation";
import { encryptPrivateValue, hashIdentifier } from "@/lib/crypto";
import { getPool } from "@/lib/db";
import { fail, isSameOriginRequest, ok, serverError } from "@/lib/http";

export async function POST(request) {
  if (!isSameOriginRequest(request)) return fail("Permintaan tidak valid.", 403);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rate = checkRateLimit(`complaint:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rate.allowed) return fail("Batas pengiriman laporan tercapai. Coba kembali nanti.", 429);

  let connection;
  try {
    const parsed = complaintSchema.safeParse(await request.json());
    if (!parsed.success) return fail("Periksa kembali data laporan yang Anda isi.");
    const { name, contact, category, regionId, description } = parsed.data;
    const pool = getPool();
    connection = await pool.getConnection();
    const [regions] = await connection.execute("SELECT id FROM regions WHERE id = ? LIMIT 1", [regionId]);
    if (!regions.length) return fail("Wilayah yang dipilih tidak ditemukan.", 422);

    const ticket = `BG-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
    await connection.beginTransaction();
    const [result] = await connection.execute(
      "INSERT INTO complaints (ticket_number, category, region_id, description, status) VALUES (?, ?, ?, ?, 'diterima')",
      [ticket, category, regionId, description],
    );
    await connection.execute(
      "INSERT INTO complaint_private_data (complaint_id, reporter_name_encrypted, contact_encrypted, contact_lookup_hash) VALUES (?, ?, ?, ?)",
      [result.insertId, encryptPrivateValue(name), encryptPrivateValue(contact), hashIdentifier(contact)],
    );
    await connection.execute(
      "INSERT INTO complaint_histories (complaint_id, old_status, new_status, notes) VALUES (?, NULL, 'diterima', 'Laporan diterima melalui portal publik')",
      [result.insertId],
    );
    await connection.commit();
    return ok({ ticketNumber: ticket, status: "diterima" }, 201);
  } catch (error) {
    if (connection) await connection.rollback();
    return serverError(error);
  } finally {
    connection?.release();
  }
}
