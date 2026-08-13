# Security and Privacy

Only expose `NEXT_PUBLIC_SUPABASE_URL` and the publishable/anon key to the browser. The service-role key is server-only.

Use Supabase SSR clients, secure cookies, OAuth callback code exchange, session refresh, and middleware protection for dashboard routes.

RLS must be enabled on every personal table. Test select, insert, update, and delete using two different users. Do not rely only on hidden UI or route guards.

Validate amounts, dates, enum values, identifiers, text length, and uploads. Render descriptions safely. Restrict attachments by type and size and use user-scoped storage paths.

Provide CSV/JSON export and deletion guidance. Avoid unnecessary personal information. Never log financial values in production. Review OAuth redirect allowlists, dependency vulnerabilities, production environment variables, and backups before release.
