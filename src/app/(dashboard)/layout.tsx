import { redirect } from "next/navigation";

import { AppShell, type AppProfile } from "@/components/layout";
import { createClient } from "@/lib/supabase/server";

function metadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value : null;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: storedProfile } = await supabase.from("profiles").select("full_name, email, avatar_url").eq("id", user.id).maybeSingle();
  const metadata = user.user_metadata as Record<string, unknown>;
  const profile: AppProfile = {
    id: user.id,
    name: storedProfile?.full_name ?? metadataString(metadata, "full_name") ?? metadataString(metadata, "name"),
    email: storedProfile?.email ?? user.email ?? null,
    avatarUrl: storedProfile?.avatar_url ?? metadataString(metadata, "avatar_url") ?? metadataString(metadata, "picture"),
  };
  return <AppShell profile={profile}>{children}</AppShell>;
}
