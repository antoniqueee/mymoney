import { z } from "zod";

export const ACCOUNT_TYPES = ["cash", "bank", "ewallet", "other"] as const;

/**
 * Matches PostgreSQL numeric(14,2) without coercing the value through a
 * JavaScript number. The normalized string is sent directly to Supabase.
 */
export const signedMoneyStringSchema = z
  .string()
  .trim()
  .min(1, "Saldo awal wajib diisi")
  .regex(
    /^-?(?:0|[1-9]\d{0,11})(?:\.\d{1,2})?$/,
    "Gunakan angka dengan maksimal 2 angka desimal (contoh: 150000.50)",
  );

export const accountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama akun minimal 2 karakter")
    .max(64, "Nama akun maksimal 64 karakter"),
  type: z.enum(ACCOUNT_TYPES, {
    required_error: "Jenis akun wajib dipilih",
  }),
  opening_balance: signedMoneyStringSchema,
});

export const accountIdSchema = z.string().uuid("Akun tidak valid");

export type AccountFormValues = z.infer<typeof accountSchema>;
export type AccountType = (typeof ACCOUNT_TYPES)[number];
