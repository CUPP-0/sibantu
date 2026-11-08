import mysql from "mysql2/promise";

const globalForMysql = globalThis;

export function getPool() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    const error = new Error("MySQL belum dikonfigurasi. Salin .env.example menjadi .env.local, isi pengaturan database, lalu mulai ulang aplikasi.");
    error.code = "APP_CONFIG_MISSING";
    throw error;
  }

  if (!globalForMysql.mysqlPool) {
    globalForMysql.mysqlPool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT || 3306),
      user: DB_USER,
      password: DB_PASSWORD || "",
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: "utf8mb4",
      timezone: "Z",
    });
  }

  return globalForMysql.mysqlPool;
}

export async function query(sql, values = []) {
  const [rows] = await getPool().execute(sql, values);
  return rows;
}
