import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const CLAIM_QR_LIFETIME_SECONDS = 15 * 60;

function claimQrSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    const error = new Error("AUTH_SECRET harus diatur dengan nilai acak minimal 32 karakter di .env.local.");
    error.code = "APP_CONFIG_MISSING";
    throw error;
  }
  return secret;
}

function sign(payload) {
  return createHmac("sha256", claimQrSecret()).update(payload).digest("base64url");
}

export function createCitizenClaimQr(programEnrollmentId, userId, cycleNumber) {
  const expiresAt = Math.floor(Date.now() / 1000) + CLAIM_QR_LIFETIME_SECONDS;
  const payload = `bgc1.${programEnrollmentId}.${userId}.${cycleNumber}.${expiresAt}.${randomBytes(8).toString("base64url")}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyCitizenClaimQr(token) {
  if (typeof token !== "string" || token.length > 256) return null;
  const parts = token.split(".");
  if (parts.length !== 7) return null;
  const [version, enrollmentId, userId, cycleNumber, expiresAt, nonce, providedSignature] = parts;
  if (
    version !== "bgc1"
    || !/^[1-9]\d*$/.test(enrollmentId)
    || !/^[1-9]\d*$/.test(userId)
    || !/^[1-9]\d*$/.test(cycleNumber)
    || !/^\d+$/.test(expiresAt)
    || !/^[A-Za-z0-9_-]{8,32}$/.test(nonce)
    || Number(expiresAt) <= Math.floor(Date.now() / 1000)
  ) return null;

  const payload = parts.slice(0, 6).join(".");
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(providedSignature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  return {
    programEnrollmentId: Number(enrollmentId),
    userId: Number(userId),
    cycleNumber: Number(cycleNumber),
  };
}
