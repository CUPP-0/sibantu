import { NextResponse } from "next/server";

export function ok(data, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function serverError(error) {
  console.error("[api]", error);
  const unavailableMessage = getDatabaseUnavailableMessage(error);
  if (unavailableMessage) return fail(unavailableMessage, 503);
  return fail("Terjadi kesalahan pada server. Coba lagi nanti.", 500);
}

export function getDatabaseUnavailableMessage(error) {
  if (error?.code === "APP_CONFIG_MISSING") {
    return error.message;
  }
  if (error?.code === "APP_CONFIG_CA_INVALID") {
    return error.message;
  }
  if (["SELF_SIGNED_CERT_IN_CHAIN", "UNABLE_TO_VERIFY_LEAF_SIGNATURE", "CERT_HAS_EXPIRED", "DEPTH_ZERO_SELF_SIGNED_CERT"].includes(error?.code)) {
    return "Sertifikat TLS Supabase tidak dapat diverifikasi. Periksa DATABASE_SSL_CA atau DATABASE_SSL_CA_BASE64 di environment Vercel.";
  }
  if (error?.code === "ENOTFOUND") {
    return "Host DATABASE_URL tidak ditemukan di DNS. Salin ulang URI dari Supabase → Connect; jika memakai host Direct connection di Vercel, coba URI Session Pooler atau Transaction Pooler.";
  }
  if (["ECONNREFUSED", "ETIMEDOUT", "ECONNRESET", "ENETUNREACH", "08000", "08006"].includes(error?.code)) {
    return "Supabase PostgreSQL tidak dapat dijangkau. Periksa DATABASE_URL dan koneksi internet, lalu coba lagi.";
  }
  if (error?.code === "28P01") {
    return "Supabase menolak kredensial database. Periksa kata sandi pada DATABASE_URL.";
  }
  if (error?.code === "3D000") {
    return "Database Supabase tidak ditemukan. Periksa nama database pada DATABASE_URL.";
  }
  if (error?.code === "42P01") {
    return "Tabel SiBantu belum tersedia. Impor database/sibantu-supabase.sql melalui SQL Editor Supabase.";
  }
  if (error?.code === "42703") {
    return "Struktur database SiBantu belum terbaru. Jalankan versi terkini database/sibantu-supabase.sql melalui SQL Editor Supabase.";
  }
  return null;
}

export function isSameOriginRequest(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
