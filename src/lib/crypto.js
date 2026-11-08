import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

function encryptionKey() {
  const value = process.env.DATA_ENCRYPTION_KEY;
  if (!value) {
    const error = new Error("DATA_ENCRYPTION_KEY belum dikonfigurasi di .env.local.");
    error.code = "APP_CONFIG_MISSING";
    throw error;
  }
  const key = Buffer.from(value, "base64");
  if (key.length !== 32) {
    const error = new Error("DATA_ENCRYPTION_KEY harus berupa 32 byte dalam format base64.");
    error.code = "APP_CONFIG_MISSING";
    throw error;
  }
  return key;
}

export function encryptPrivateValue(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64");
}

export function decryptPrivateValue(value) {
  const data = Buffer.from(value, "base64");
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function hashIdentifier(value) {
  const secret = process.env.DATA_LOOKUP_SECRET;
  if (!secret) {
    const error = new Error("DATA_LOOKUP_SECRET belum dikonfigurasi di .env.local.");
    error.code = "APP_CONFIG_MISSING";
    throw error;
  }
  return createHmac("sha256", secret).update(value.trim().toLowerCase()).digest("hex");
}

export function createOpaqueToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}
