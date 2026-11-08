import { requireRole } from "@/lib/auth";
import { getRegionScope } from "@/lib/admin-regions";
import { query } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/http";

export async function GET() {
  try {
    const access = await requireRole(["admin_daerah"]);
    if (access.error) return fail(access.error, access.status);
    const regionIds = await getRegionScope(access.user);
    if (!regionIds?.length) return fail("Wilayah kerja akun belum diatur.", 403);

    const claims = await query(
      `SELECT b.id AS beneficiaryId, b.name AS beneficiaryName, u.email,
        r.name AS regionName, bp.id AS beneficiaryProgramId, p.name AS programName,
        bp.verification_status AS verificationStatus, bp.eligibility_status AS eligibilityStatus,
        COALESCE(bc.status, 'belum_diambil') AS claimStatus, bc.claimed_at AS claimedAt,
        COALESCE(d.amount, bp.assistance_amount, p.amount) AS amount
       FROM beneficiaries b
       JOIN citizen_accounts ca ON ca.beneficiary_id = b.id
       JOIN users u ON u.id = ca.user_id
       JOIN regions r ON r.id = b.region_id
       JOIN beneficiary_programs bp ON bp.beneficiary_id = b.id
       JOIN assistance_programs p ON p.id = bp.program_id
       LEFT JOIN beneficiary_claims bc ON bc.beneficiary_program_id = bp.id
       LEFT JOIN distributions d ON d.beneficiary_program_id = bp.id
       WHERE b.region_id IN (${regionIds.map(() => "?").join(", ")}) AND b.is_active = 1
       ORDER BY b.name, p.name
       LIMIT 500`,
      regionIds,
    );
    return ok(claims.map((claim) => ({
      ...claim,
      amount: claim.amount === null ? null : Number(claim.amount),
    })));
  } catch (error) {
    return serverError(error);
  }
}
