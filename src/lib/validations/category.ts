import { z } from "zod";
import { designTokens } from "@/config/theme";

export const CATEGORY_ICON_VALUES = [
  "tag",
  "wallet",
  "briefcase",
  "utensils",
  "shopping-bag",
  "car",
  "home",
  "heart-pulse",
  "graduation-cap",
  "gift",
  "gamepad-2",
  "receipt",
  "plane",
  "piggy-bank",
] as const;

export const DEFAULT_CATEGORY_COLOR = designTokens.rawColors.primary;

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama kategori minimal 2 karakter")
    .max(48, "Nama kategori maksimal 48 karakter"),
  type: z.enum(["income", "expense"], {
    required_error: "Jenis kategori wajib dipilih",
  }),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Warna kategori tidak valid"),
  icon: z.enum(CATEGORY_ICON_VALUES, {
    required_error: "Ikon kategori wajib dipilih",
  }),
});

export const categoryIdSchema = z.string().uuid("Kategori tidak valid");

export type CategoryFormValues = z.infer<typeof categorySchema>;
export type CategoryIcon = (typeof CATEGORY_ICON_VALUES)[number];
