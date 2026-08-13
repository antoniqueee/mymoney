import { z } from "zod";

export const currencyCodes = ["IDR", "USD", "SGD"] as const;

export const profilePreferencesSchema = z.object({
  full_name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80, "Nama maksimal 80 karakter"),
  currency_code: z.enum(currencyCodes),
});

export type ProfilePreferencesValues = z.infer<typeof profilePreferencesSchema>;
