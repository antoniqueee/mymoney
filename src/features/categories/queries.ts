import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { CategoriesQueryResult } from "@/features/categories/types";

export async function getCategories(): Promise<CategoriesQueryResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      data: [],
      error: "Sesi Anda telah berakhir. Silakan masuk kembali.",
    };
  }

  const { data, error } = await supabase
    .from("categories")
    .select(
      "id,name,type,color,icon,is_default,is_archived,created_at,updated_at",
    )
    .eq("user_id", user.id)
    .order("is_archived", { ascending: true })
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return {
      data: [],
      error: "Kategori belum dapat dimuat. Coba muat ulang halaman.",
    };
  }

  return { data: data ?? [], error: null };
}
