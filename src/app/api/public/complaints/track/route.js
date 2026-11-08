import { checkRateLimit } from "@/lib/rate-limit";
import { hashIdentifier } from "@/lib/crypto";
import { query } from "@/lib/db";
import { fail, isSameOriginRequest, ok, serverError } from "@/lib/http";
import { z } from "zod";

const trackSchema = z.object({
  ticketNumber: z.string().trim().min(8).max(24),
  contact: z.string().trim().min(6).max(190),
});

export async function POST(request) {
  if (!isSameOriginRequest(request)) return fail("Permintaan tidak valid.", 403);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rate = checkRateLimit(`track:${ip}`, { limit: 10, windowMs: 60 * 60 * 1000 });
  if (!rate.allowed) return fail("Batas percobaan pelacakan tercapai. Coba kembali nanti.", 429);

  try {
    const parsed = trackSchema.safeParse(await request.json());
    if (!parsed.success) return fail("Nomor tiket atau kontak tidak valid.");
    const contactHash = hashIdentifier(parsed.data.contact);
    const rows = await query(
      `SELECT c.ticket_number AS ticketNumber, c.category, c.status, c.created_at AS createdAt
       FROM complaints c
       JOIN complaint_private_data p ON p.complaint_id = c.id
       WHERE c.ticket_number = ? AND p.contact_lookup_hash = ? LIMIT 1`,
      [parsed.data.ticketNumber.toUpperCase(), contactHash],
    );
    if (!rows.length) return fail("Laporan tidak ditemukan. Periksa nomor tiket dan kontak Anda.", 404);
    const history = await query(
      `SELECT new_status AS status, notes, created_at AS createdAt
       FROM complaint_histories
       WHERE complaint_id = (SELECT id FROM complaints WHERE ticket_number = ?)
       ORDER BY created_at ASC`,
      [parsed.data.ticketNumber.toUpperCase()],
    );
    return ok({ complaint: rows[0], history });
  } catch (error) {
    return serverError(error);
  }
}
