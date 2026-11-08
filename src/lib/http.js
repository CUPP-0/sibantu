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
  if (["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "PROTOCOL_CONNECTION_LOST"].includes(error?.code)) {
    return "MySQL belum berjalan atau tidak dapat dijangkau. Jalankan MySQL melalui XAMPP/Laragon, lalu coba lagi.";
  }
  if (error?.code === "ER_ACCESS_DENIED_ERROR") {
    return "MySQL menolak akses. Periksa DB_USER dan DB_PASSWORD di file .env.local.";
  }
  if (error?.code === "ER_BAD_DB_ERROR") {
    return "Database bansosguard belum tersedia. Impor database/database.sql melalui phpMyAdmin.";
  }
  if (error?.code === "ER_NO_SUCH_TABLE") {
    return "Tabel aplikasi belum tersedia. Impor database/database.sql lalu database/seed.sql melalui phpMyAdmin.";
  }
  if (error?.message === "Konfigurasi MySQL belum lengkap. Periksa file .env.local.") {
    return "MySQL belum dikonfigurasi. Salin .env.example menjadi .env.local, isi pengaturan database, lalu mulai ulang aplikasi.";
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
