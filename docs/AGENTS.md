# My Money Agent Instructions

You are working on My Money, a single-user personal finance web app.

## Non-negotiable stack

Next.js App Router, TypeScript, Supabase Auth with Google OAuth, Supabase PostgreSQL, Tailwind CSS, shadcn/ui, Recharts, and Vercel. Do not introduce Laravel or a separate backend unless explicitly requested.

## Product constraints

Avoid premature multi-user, team, role, or enterprise features. Privacy, accurate money calculations, backup, and usability matter more than elaborate audit logging.

## Design constraints

Use the blue palette in `UI_GUIDELINES.md`. Use Madane for logo/display headings and SF/system font for UI, numbers, forms, and tables.

## Implementation constraints

- Read the relevant Markdown specification before coding.
- Use server-side Supabase access for protected data.
- Validate with Zod and enforce RLS.
- Never expose service-role credentials.
- Never trust client-provided `user_id`.
- Use decimal-safe money handling.
- Add migrations for schema changes.
- Do not delete existing features without approval.

## Completion report

Report summary, changed files, commands run, test/build result, and remaining risk. Ask before making structural decisions when requirements are ambiguous.
