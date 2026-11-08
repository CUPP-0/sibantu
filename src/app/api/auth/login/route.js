import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSessionValue, sessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/auth";
import { hashIdentifier } from "@/lib/crypto";
import { query } from "@/lib/db";
import { fail, isSameOriginRequest, ok, serverError } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export async function POST(request) {
  if (!isSameOriginRequest(request)) return fail("Permintaan tidak valid.", 403);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rate = checkRateLimit(`login:${ip}`, { limit: 8, windowMs: 60_000 });
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, error: "Terlalu banyak percobaan. Coba beberapa saat lagi." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  }

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse({
      identifier: body?.identifier ?? body?.email,
      password: body?.password,
    });
    if (!parsed.success) return fail("Email/NIK atau kata sandi tidak valid.");

    const isNik = /^\d{16}$/.test(parsed.data.identifier);
    const [user] = isNik
      ? await query(
        `SELECT u.id, u.name, u.email, u.password, u.role
         FROM users u
         JOIN citizen_accounts ca ON ca.user_id = u.id
         JOIN beneficiaries b ON b.id = ca.beneficiary_id
         WHERE b.nik_lookup_hash = ? AND b.is_active = 1
           AND ca.verified_at IS NOT NULL AND u.is_active = 1
         LIMIT 1`,
        [hashIdentifier(parsed.data.identifier)],
      )
      : await query(
        "SELECT id, name, email, password, role FROM users WHERE email = ? AND is_active = 1 LIMIT 1",
        [parsed.data.identifier.toLowerCase()],
      );
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
      return fail("Email atau kata sandi tidak sesuai.", 401);
    }

    await query(
      "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address) VALUES (?, 'login', 'user', ?, ?)",
      [user.id, user.id, ip.slice(0, 45)],
    );
    const response = ok({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      createSessionValue(user.id, user.role),
      sessionCookieOptions(),
    );
    return response;
  } catch (error) {
    return serverError(error);
  }
}
