import { checkRateLimit } from "@/lib/rate-limit";
import { hashIdentifier } from "@/lib/crypto";
import { query } from "@/lib/db";
import { fail, isSameOriginRequest, ok, serverError } from "@/lib/http";
import { nikLookupSchema } from "@/lib/validation";

export async function POST(request) {
  if (!isSameOriginRequest(request)) return fail("Permintaan tidak valid.", 403);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rate = checkRateLimit(`assistance-lookup:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rate.allowed) {
    return fail("Batas pengecekan tercapai. Coba kembali beberapa saat lagi.", 429);
  }

  try {
    const parsed = nikLookupSchema.safeParse(await request.json());
    if (!parsed.success) return fail(parsed.error.issues[0]?.message || "NIK tidak valid.");

    const [beneficiary] = await query(
      `SELECT b.id, b.name, b.verification_status AS verificationStatus, r.name AS regionName
       FROM beneficiaries b
       JOIN regions r ON r.id = b.region_id
       WHERE b.nik_lookup_hash = ? AND b.is_active = 1
       LIMIT 1`,
      [hashIdentifier(parsed.data.nik)],
    );
    if (!beneficiary) return fail("Data bantuan tidak ditemukan. Periksa kembali NIK yang dimasukkan.", 404);

    const assistance = await query(
      `SELECT bp.id, p.name AS programName, p.category,
        p.assistance_type AS assistanceType, p.start_date AS startDate, p.end_date AS endDate,
        bp.eligibility_status AS eligibilityStatus, bp.verification_status AS verificationStatus,
        COALESCE(d.amount, bp.assistance_amount, p.amount) AS amount,
        COALESCE(bc.status, 'belum_diambil') AS claimStatus,
        CASE
          WHEN bp.eligibility_status = 'tidak_layak' OR bp.verification_status = 'ditolak'
            THEN 'tidak_memenuhi_kriteria'
          WHEN bp.verification_status = 'menunggu' OR bp.eligibility_status = 'menunggu'
            THEN 'menunggu_verifikasi'
          WHEN d.status = 'berhasil' THEN 'sudah_disalurkan'
          WHEN d.status = 'gagal' THEN 'penyaluran_gagal'
          WHEN d.status = 'ditunda' THEN 'penyaluran_ditunda'
          WHEN d.status IN ('menunggu', 'dijadwalkan') THEN 'menunggu_penyaluran'
          WHEN bp.verification_status = 'terverifikasi' AND bp.eligibility_status = 'layak'
            THEN 'terverifikasi'
          ELSE 'sedang_diproses'
        END AS status
       FROM beneficiary_programs bp
       JOIN assistance_programs p ON p.id = bp.program_id
       LEFT JOIN distributions d ON d.beneficiary_program_id = bp.id
       LEFT JOIN beneficiary_claims bc ON bc.beneficiary_program_id = bp.id
       WHERE bp.beneficiary_id = ?
       ORDER BY p.start_date DESC, bp.id DESC`,
      [beneficiary.id],
    );

    return ok({
      beneficiary: {
        name: beneficiary.name,
        verificationStatus: beneficiary.verificationStatus,
        regionName: beneficiary.regionName,
      },
      assistance: assistance.map((item) => ({
        ...item,
        amount: item.amount === null ? null : Number(item.amount),
      })),
    });
  } catch (error) {
    return serverError(error);
  }
}
