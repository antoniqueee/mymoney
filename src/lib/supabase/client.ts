"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database.types";

function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Konfigurasi publik Supabase belum lengkap.");
  }

  return { url, key };
}

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (browserClient) return browserClient;

  const { url, key } = getPublicSupabaseConfig();
  browserClient = createBrowserClient<Database>(url, key);
  return browserClient;
}
