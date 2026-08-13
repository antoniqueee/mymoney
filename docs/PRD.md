# Product Requirements Document

## Vision

My Money helps one person understand where money comes from, where it goes, and how daily choices affect monthly financial health.

## Goals

- Record a transaction in under 30 seconds.
- Show an accurate current balance.
- Explain spending by category and period.
- Keep financial data private and recoverable.
- Provide a polished responsive experience on desktop and mobile.

## Non-goals for MVP

- Banking synchronization.
- Investment trading or financial advice.
- Multi-user collaboration.
- Payments, transfers, or account aggregation.
- Complex audit history.

## Core user journeys

### First use

User opens the app, signs in with Google, lands on an empty-state dashboard, creates or accepts default categories, and records the opening balance or first transaction.

### Record expense

Dashboard → Add transaction → Expense → amount → category → date → optional account/note → save → balance and charts refresh.

### Review month

Dashboard → choose month → inspect income, expenses, net cash flow, category distribution, and recent transactions → filter or edit an item.

### Export backup

Settings or Reports → choose date range → export CSV/JSON → download file.

## MVP requirements

- Google OAuth login through Supabase Auth.
- Protected dashboard routes.
- Income and expense CRUD.
- User-owned categories with default seed categories.
- Accounts/wallets with opening balance.
- Automatic balance calculation.
- Date, type, category, and text filters.
- Monthly dashboard cards and charts.
- Soft deletion and restore from a trash view, if practical.
- CSV export and JSON backup.
- Responsive light theme with blue design system.

## Acceptance criteria

- A signed-out user cannot read or mutate private data.
- A transaction with amount `0`, negative amount, missing type, or missing category is rejected.
- Amounts render in Indonesian Rupiah without floating-point drift.
- Every mutation updates the visible totals without requiring a full browser refresh.
- Empty, loading, error, and success states exist for every data-heavy screen.
- Mobile layouts remain usable at 360px width.
