import { requireRole } from "@/lib/auth";
import { createCitizenClaimQr } from "@/lib/citizen-claim-qr";
import { query } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/http";

export async function GET() {
  try {
    const access = await requireRole(["masyarakat"]);
    if (access.error) return fail(access.error, access.status);

    const [beneficiary] = await query(
      `SELECT b.id, b.name, b.verification_status AS verificationStatus, r.name AS regionName
       FROM citizen_accounts ca
       JOIN beneficiaries b ON b.id = ca.beneficiary_id
       JOIN regions r ON r.id = b.region_id
       WHERE ca.user_id = ? AND ca.verified_at IS NOT NULL AND b.is_active = 1
       LIMIT 1`,
      [access.user.id],
    );
    if (!beneficiary) {
      return fail("Data bantuan belum tertaut ke akun warga ini. Hubungi pengelola untuk verifikasi.", 404);
    }

    const assistance = await query(
      `SELECT bp.id, p.name AS programName, p.category,
        p.assistance_type AS assistanceType, p.start_date AS startDate, p.end_date AS endDate,
        bp.eligibility_status AS eligibilityStatus, bp.verification_status AS verificationStatus,
        COALESCE(d.amount, bp.assistance_amount, p.amount) AS amount,
        COALESCE(bc.status, 'belum_diambil') AS claimStatus,
        COALESCE(bc.cycle_number, 1) AS cycleNumber,
        bc.claimed_at AS claimedAt,
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
        claimQr: item.claimStatus === "belum_diambil"
          && item.eligibilityStatus === "layak"
          && item.verificationStatus === "terverifikasi"
          ? createCitizenClaimQr(item.id, access.user.id, item.cycleNumber)
          : null,
      })),
    });
  } catch (error) {
    return serverError(error);
  }
}
