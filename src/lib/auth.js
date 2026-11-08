import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

const COOKIE_NAME = "bansosguard_session";
const SESSION_SECONDS = 60 * 60 * 8;

function sessionSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    const error = new Error("AUTH_SECRET harus diatur dengan nilai acak minimal 32 karakter di .env.local.");
    error.code = "APP_CONFIG_MISSING";
    throw error;
  }
  return secret;
}

function signature(payload) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createSessionValue(userId, role) {
  const payload = `${userId}.${role}.${Date.now() + SESSION_SECONDS * 1000}`;
  return `${payload}.${signature(payload)}`;
}

function verifySessionValue(value) {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 4) return null;
  const [userId, role, expiresAt, providedSignature] = parts;
  if (!/^\d+$/.test(userId) || !/^\d+$/.test(expiresAt) || Number(expiresAt) <= Date.now()) return null;
  const payload = `${userId}.${role}.${expiresAt}`;
  const expected = Buffer.from(signature(payload));
  const actual = Buffer.from(providedSignature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  return { userId: Number(userId), role };
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = verifySessionValue(cookieStore.get(COOKIE_NAME)?.value);
  if (!session) return null;

  const rows = await query(
    `SELECT u.id, u.name, u.email, u.role, u.wilayah_id AS regionId, r.name AS regionName
     FROM users u
     LEFT JOIN regions r ON r.id = u.wilayah_id
     WHERE u.id = ? AND u.is_active = 1 LIMIT 1`,
    [session.userId],
  );
  const user = rows[0];
  if (!user || user.role !== session.role) return null;
  return user;
}

export async function requireRole(roles) {
  const user = await getSession();
  if (!user) return { error: "Autentikasi diperlukan.", status: 401 };
  if (!roles.includes(user.role)) return { error: "Anda tidak memiliki akses ke fitur ini.", status: 403 };
  return { user };
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
