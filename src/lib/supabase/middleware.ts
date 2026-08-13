import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database.types";

const protectedPrefixes = [
  "/dashboard",
  "/transactions",
  "/categories",
  "/accounts",
  "/budgets",
  "/reports",
  "/settings",
  "/api/export",
];

const authPrefixes = ["/login", "/register"];

function matchesPrefix(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function redirectPreservingCookies(url: URL, responseWithCookies: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);
  responseWithCookies.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Let the route render its explicit configuration error instead of making
  // every static/public request fail inside middleware.
  if (!url || !key) return NextResponse.next({ request });

  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Do not place logic between client creation and getUser; Supabase relies on
  // this call to refresh an expired session cookie safely.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  if (!user && matchesPrefix(pathname, protectedPrefixes)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return redirectPreservingCookies(loginUrl, supabaseResponse);
  }

  if (user && matchesPrefix(pathname, authPrefixes)) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return redirectPreservingCookies(dashboardUrl, supabaseResponse);
  }

  return supabaseResponse;
}
