import { NextResponse } from "next/server";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { query } from "@/lib/db";
import { fail, isSameOriginRequest, ok, serverError } from "@/lib/http";

export async function POST(request) {
  if (!isSameOriginRequest(request)) return fail("Permintaan tidak valid.", 403);
  try {
    const user = await getSession();
    if (user) {
      await query(
        "INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES (?, 'logout', 'user', ?)",
        [user.id, user.id],
      );
    }
    const response = ok({ message: "Anda telah keluar." });
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return serverError(error);
  }
}
