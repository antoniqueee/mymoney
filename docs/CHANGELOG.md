# Changelog

## Unreleased

### Added

- Responsive landing, Google OAuth login, protected application shell, and logout flow.
- Supabase-backed dashboard, transactions, categories, accounts, budgets, reports, and settings.
- Exact decimal-string money helpers, CSV export, JSON backup, and private receipt attachments.
- Central blue design tokens, reusable asset-backed logo, Madane/SF fonts, and shared UI primitives.
- Loading, empty, error, success, validation, confirmation, and disabled states across data routes.

### Changed

- Upgraded the application foundation to Next.js 16 App Router with strict TypeScript and the Proxy convention.
- Replaced placeholder/client-owned finance logic with typed Server Components, Server Actions, Route Handlers, and PostgreSQL aggregate functions.

### Security

- Added explicit RLS policies, ownership-safe composite foreign keys, archived-reference invariants, and transaction soft-delete enforcement.
- Added a private, user-scoped receipt bucket with file size and MIME restrictions.
- Hardened OAuth redirects, CSV output, session refresh, and response security headers.

Use Keep a Changelog headings: Added, Changed, Fixed, Removed, Security.
