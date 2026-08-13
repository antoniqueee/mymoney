import { z } from "zod";

export const transactionTypes = ["income", "expense"] as const;
export const paymentMethods = [
  "cash",
  "debit_card",
  "credit_card",
  "bank_transfer",
  "e_wallet",
  "other",
] as const;

const moneyInput = z
  .string()
  .trim()
  .min(1, "Jumlah wajib diisi")
  .regex(/^\d{1,12}(?:[.,]\d{1,2})?$/, "Gunakan angka dengan maksimal 2 desimal")
  .refine((value) => {
    const normalized = value.replace(",", ".");
    const [whole, fraction = ""] = normalized.split(".");
    return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0")) > 0n;
  }, "Jumlah harus lebih besar dari nol");

export const transactionFormSchema = z.object({
  type: z.enum(transactionTypes, { message: "Pilih tipe transaksi" }),
  amount: moneyInput,
  category_id: z.string().uuid("Pilih kategori yang valid"),
  account_id: z.string().uuid("Pilih akun yang valid"),
  transaction_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid"),
  payment_method: z.enum(paymentMethods, { message: "Pilih metode pembayaran" }),
  description: z
    .string()
    .trim()
    .max(280, "Deskripsi maksimal 280 karakter"),
});

export const transactionIdSchema = z.string().uuid("ID transaksi tidak valid");

export const transactionFilterSchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  type: z.enum(["all", ...transactionTypes]).default("all"),
  category: z.string().uuid().optional(),
  account: z.string().uuid().optional(),
  search: z.string().trim().max(100).optional(),
  trash: z.enum(["true", "false"]).default("false"),
  page: z.coerce.number().int().min(1).default(1),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
export type TransactionFilters = z.infer<typeof transactionFilterSchema>;
export type PaymentMethod = (typeof paymentMethods)[number];
