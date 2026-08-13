import { z } from "zod";

const isoDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    return (
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day
    );
  }, "Tanggal tidak valid");

export const positiveMoneyStringSchema = z
  .string()
  .trim()
  .min(1, "Jumlah anggaran wajib diisi")
  .regex(
    /^(?:0|[1-9]\d{0,11})(?:\.\d{1,2})?$/,
    "Gunakan angka dengan maksimal 2 angka desimal (contoh: 150000.50)",
  )
  .refine(
    (value) => !/^0+(?:\.0{1,2})?$/.test(value),
    "Jumlah anggaran harus lebih besar dari nol",
  );

export const budgetSchema = z
  .object({
    category_id: z.string().uuid("Kategori wajib dipilih"),
    period_start: isoDateSchema,
    period_end: isoDateSchema,
    amount: positiveMoneyStringSchema,
  })
  .refine((values) => values.period_end >= values.period_start, {
    path: ["period_end"],
    message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
  });

export const budgetIdSchema = z.string().uuid("Anggaran tidak valid");

export type BudgetFormValues = z.infer<typeof budgetSchema>;
