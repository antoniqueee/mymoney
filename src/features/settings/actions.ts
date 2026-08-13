"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profilePreferencesSchema, type ProfilePreferencesValues } from "./schema";

export interface SettingsActionResult {
  ok: boolean;
  message: string;
  fieldErrors?: Partial<Record<keyof ProfilePreferencesValues, string[]>>;
}

export async function updatePreferences(values: ProfilePreferencesValues): Promise<SettingsActionResult> {
  const parsed = profilePreferencesSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Periksa kembali preferensi Anda.", fieldErrors: parsed.error.flatten().fieldErrors };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesi berakhir. Silakan masuk kembali." };
  const { error } = await supabase.from("profiles").update({ full_name: parsed.data.full_name, currency_code: parsed.data.currency_code }).eq("id", user.id);
  if (error) return { ok: false, message: "Preferensi gagal disimpan." };
  revalidatePath("/", "layout");
  return { ok: true, message: "Preferensi berhasil disimpan." };
}
