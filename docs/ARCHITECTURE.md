# Architecture

## Chosen architecture

Feature-based Next.js monolith with Supabase as the managed authentication and data platform. Server Components are the default. Client Components are used only for interaction, browser APIs, charts, and form state.

```text
Browser → Next.js App Router → Server Actions/Route Handlers → Supabase Auth/PostgreSQL/Storage
```

## Boundaries

- `app/`: routes, layouts, and HTTP entry points.
- `features/`: domain queries, actions, schemas, and feature UI.
- `components/`: reusable presentation components.
- `lib/supabase/`: browser/server clients and sessions.
- `types/`: generated database and domain types.
- `supabase/migrations/`: versioned schema changes.

## Rules

- Use Server Components by default.
- Validate all mutations with Zod.
- Derive `user_id` from the authenticated session.
- Never use the service role key in browser code.
- Prefer explicit selects over `select *`.
- Use typed domain errors and user-safe error messages.

## Deployment

Vercel builds the Next.js application from Git. Supabase hosts Auth, PostgreSQL, and optional Storage. Keep migrations in the repository and apply them through the Supabase CLI or SQL editor.
