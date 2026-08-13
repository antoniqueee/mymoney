# My Money

Personal finance web app for recording income, expenses, balances, budgets, and spending insights.

## Product identity

- Name: My Money
- Audience: one personal user
- Visual direction: blue, calm, trustworthy, minimal
- Brand typeface: Madane (logo and display headings)
- Interface typeface: SF/system stack for readable UI, numbers, tables, and forms
- Deployment target: Vercel Hobby

## Stack

Next.js App Router, TypeScript, Supabase Auth with Google OAuth, Supabase PostgreSQL, Supabase Storage, Tailwind CSS, shadcn/ui, React Hook Form, Zod, Recharts, and Vercel.

## Local setup

1. Install Node.js LTS.
2. Copy `.env.example` to `.env.local` and fill the Supabase values.
3. Install dependencies with `npm install`.
4. Run `npm run dev`.
5. Configure Google OAuth redirect URLs in Supabase and Google Cloud Console.

## Quality gates

Run `npm run lint`, `npm run typecheck`, and `npm run build` before merging or deploying.

## Source of truth

Read `AGENTS.md`, `PRD.md`, `DATABASE.md`, `DEVELOPMENT_RULES.md`, and `SECURITY.md` before implementing features.
