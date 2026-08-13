import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getApplicationOrigin, getSafeNextPath } from "@/features/auth/redirects";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const providerError = request.nextUrl.searchParams.get("error");
  const nextPath = getSafeNextPath(request.nextUrl.searchParams.get("next"));
  const applicationOrigin = getApplicationOrigin(request.nextUrl.origin);

  if (providerError || !code) {
    const errorUrl = new URL("/login", applicationOrigin);
    errorUrl.searchParams.set("error", providerError ? "oauth_cancelled" : "missing_oauth_code");
    return NextResponse.redirect(errorUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const errorUrl = new URL("/login", applicationOrigin);
    errorUrl.searchParams.set("error", "oauth_callback_failed");
    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.redirect(new URL(nextPath, applicationOrigin));
}
