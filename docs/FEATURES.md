# Feature Specification

## Authentication

Google OAuth through Supabase Auth: login, callback, session refresh, logout, protected routes, and profile bootstrap.

## Dashboard

Show selected period, total balance, income, expense, net cash flow, category chart, trend chart, and recent transactions. Include loading, empty, and error states.

## Transactions

Create, read, update, soft-delete, and optionally restore. Fields: type, amount, account, category, date, payment method, description, and optional attachment.

## Categories

Create and archive custom categories. Archived categories remain visible on historical transactions but are unavailable for new entries.

## Accounts

Manage cash, bank, and e-wallet accounts. Show per-account balance and archive state.

## Budgets

Set a category budget for a date range. Show spent, remaining, percentage, warning at 80%, and exceeded state at 100%.

## Reports

Filter by period, type, category, and account. Show totals, trends, rankings, detail, and CSV/JSON export.

## Settings

Profile, currency display, theme preference, data export, deletion guidance, and logout.

## Non-functional requirements

Keyboard accessible controls, WCAG-conscious contrast, responsive layouts at 360px/768px/desktop, Indonesian locale and IDR formatting by default.
