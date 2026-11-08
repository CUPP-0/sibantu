import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(190).refine(
    (value) => /^\d{16}$/.test(value) || z.email().safeParse(value).success,
    "Masukkan email atau NIK yang valid.",
  ),
  password: z.string().min(1).max(128),
});

export const nikLookupSchema = z.object({
  nik: z.string().trim().regex(/^\d{16}$/, "NIK harus terdiri dari 16 angka."),
});

export const complaintSchema = z.object({
  name: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(6).max(190),
  category: z.enum([
    "Penerima tidak tepat sasaran",
    "Bantuan tidak diterima",
    "Dugaan penerima ganda",
    "Pemotongan bantuan",
    "Penyalahgunaan bantuan",
    "Masalah penyaluran",
    "Lainnya",
  ]),
  regionId: z.coerce.number().int().positive(),
  description: z.string().trim().min(20).max(4000),
  privacyAccepted: z.literal(true),
});

export const branchAdminSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(190),
  password: z.string().min(12).max(128),
  regionId: z.coerce.number().int().positive(),
});

export const citizenAccountSchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(190),
  password: z.string().min(8, "Kata sandi warga minimal 8 karakter.").max(128),
  nik: z.string().regex(/^\d{16}$/, "NIK harus terdiri dari 16 angka."),
  gender: z.enum(["L", "P"]),
  birthDate: z.iso.date(),
  address: z.string().trim().min(5).max(2000),
  phone: z.string().trim().max(30).optional().default(""),
  programId: z.coerce.number().int().positive(),
});

export const beneficiaryProgramAmountSchema = z.object({
  amount: z.coerce.number().finite().min(0).max(9999999999999.99),
});

export const qrTokenSchema = z.object({
  token: z.string().trim().min(32).max(128).regex(/^[A-Za-z0-9_-]+$/),
});

export const citizenClaimQrSchema = z.object({
  token: z.string().trim().min(64).max(256).regex(/^bgc1\.[1-9]\d*\.[1-9]\d*\.[1-9]\d*\.\d+\.[A-Za-z0-9_-]{8,32}\.[A-Za-z0-9_-]{40,50}$/),
});
