import { brandConfig } from "@/config/brand";
import { createClient } from "@/lib/supabase/server";

export async function getSettingsProfile() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { profile: null, error: "Sesi tidak tersedia." };
  const { data, error } = await supabase.from("profiles").select("id,email,full_name,avatar_url,currency_code,created_at").eq("id", user.id).maybeSingle();
  if (error) return { profile: null, error: error.message };
  return {
    profile: data ?? {
      id: user.id,
      email: user.email ?? "",
      full_name: typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : "",
      avatar_url: typeof user.user_metadata.avatar_url === "string" ? user.user_metadata.avatar_url : null,
      currency_code: brandConfig.defaultCurrency,
      created_at: user.created_at,
    },
    error: null,
  };
}

