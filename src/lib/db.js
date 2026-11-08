import { readFileSync } from "node:fs";
import { Pool } from "pg";

const globalForPostgres = globalThis;
const tablesWithId = new Set([
  "audit_logs",
  "beneficiaries",
  "beneficiary_claim_history",
  "beneficiary_programs",
  "complaint_histories",
  "complaint_private_data",
  "complaints",
  "distributions",
  "distribution_schedules",
  "otp_verifications",
  "qr_tokens",
  "regions",
  "users",
]);

function databaseConfigError() {
  const error = new Error(
    "DATABASE_URL belum diatur. Salin connection string PostgreSQL dari Supabase ke .env.local, lalu mulai ulang aplikasi.",
  );
  error.code = "APP_CONFIG_MISSING";
  return error;
}

function parameterize(sql) {
  let position = 0;
  return sql
    .replace(/\bAS\s+([A-Za-z_][A-Za-z0-9_]*)/gi, (match, alias) =>
      /[a-z]/.test(alias) && /[A-Z]/.test(alias) ? `AS "${alias}"` : match)
    .replace(/\?/g, () => `$${++position}`);
}

function addReturningId(sql) {
  const insert = sql.match(/^\s*INSERT\s+INTO\s+([a-z_][a-z0-9_]*)/i);
  if (!insert || !tablesWithId.has(insert[1].toLowerCase()) || /\bRETURNING\b/i.test(sql)) {
    return sql;
  }
  return `${sql.trimEnd()} RETURNING id`;
}

function normalizeDatabaseError(error) {
  if (error.code === "23505") error.code = "ER_DUP_ENTRY";
  throw error;
}

function certificateConfigError(message, cause) {
  const error = new Error(message, { cause });
  error.code = "APP_CONFIG_CA_INVALID";
  return error;
}

function readCertificateAuthority() {
  const caBase64 = process.env.DATABASE_SSL_CA_BASE64?.trim();
  const caValue = process.env.DATABASE_SSL_CA?.trim();
  if (caBase64 && caValue) {
    throw certificateConfigError(
      "Atur hanya satu variabel CA: DATABASE_SSL_CA (path/PEM) atau DATABASE_SSL_CA_BASE64 (base64 PEM).",
    );
  }
  if (!caBase64 && !caValue) return undefined;

  let certificate;
  if (caBase64) {
    certificate = Buffer.from(caBase64, "base64").toString("utf8");
  } else if (caValue.includes("-----BEGIN CERTIFICATE-----")) {
    certificate = caValue;
  } else {
    try {
      const decoded = Buffer.from(caValue, "base64").toString("utf8");
      certificate = decoded.includes("-----BEGIN CERTIFICATE-----")
        ? decoded
        : readFileSync(caValue, "utf8");
    } catch (error) {
      throw certificateConfigError(
        "DATABASE_SSL_CA harus berisi CA PEM, base64 CA PEM, atau path sertifikat yang tersedia di deployment.",
        error,
      );
    }
  }

  if (!certificate.includes("-----BEGIN CERTIFICATE-----")
    || !certificate.includes("-----END CERTIFICATE-----")) {
    throw certificateConfigError(
      "Sertifikat CA tidak valid. Masukkan konten sertifikat PEM atau base64 dari file PEM.",
    );
  }
  return certificate;
}

function postgresConnectionOptions() {
  const connectionString = new URL(process.env.DATABASE_URL);
  connectionString.searchParams.delete("sslmode");
  connectionString.searchParams.delete("sslrootcert");
  const certificate = readCertificateAuthority();

  if (process.env.DATABASE_SSL === "false") {
    if (certificate) {
      throw new Error("Konfigurasi CA memerlukan koneksi TLS; hapus DATABASE_SSL=false.");
    }
    return { connectionString: connectionString.toString(), ssl: false };
  }

  const ssl = { rejectUnauthorized: true };
  if (certificate) ssl.ca = certificate;

  return { connectionString: connectionString.toString(), ssl };
}

async function execute(client, sql, values = []) {
  const statement = addReturningId(parameterize(sql));
  try {
    const result = await client.query(statement, values);
    result.rows.insertId = result.rows[0]?.id;
    result.rows.affectedRows = result.rowCount;
    return [result.rows];
  } catch (error) {
    return normalizeDatabaseError(error);
  }
}

export function getPool() {
  if (!process.env.DATABASE_URL) throw databaseConfigError();

  if (!globalForPostgres.sibantuPostgresPool) {
    const pool = new Pool({
      ...postgresConnectionOptions(),
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
    pool.on("error", (error) => console.error("[database pool]", error));
    pool.getConnection = async () => {
      const client = await pool.connect();
      return {
        execute: (sql, values) => execute(client, sql, values),
        beginTransaction: () => client.query("BEGIN"),
        commit: () => client.query("COMMIT"),
        rollback: () => client.query("ROLLBACK"),
        release: () => client.release(),
      };
    };
    pool.execute = (sql, values) => execute(pool, sql, values);
    globalForPostgres.sibantuPostgresPool = pool;
  }

  return globalForPostgres.sibantuPostgresPool;
}

export async function query(sql, values = []) {
  try {
    const result = await getPool().query(parameterize(sql), values);
    return result.rows;
  } catch (error) {
    return normalizeDatabaseError(error);
  }
}
