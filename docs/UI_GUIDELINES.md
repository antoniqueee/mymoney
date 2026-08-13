# UI Guidelines

## Brand

My Money is calm, personal, clear, and trustworthy. Use Madane for the wordmark and selected display headings. Use SF/system stack for interface text, forms, tables, and financial numbers.

## Tokens

```text
primary #2563EB | primary-hover #1D4ED8 | navy #0F172A
blue-soft #EFF6FF | background #F8FAFC | surface #FFFFFF
text #0F172A | muted #64748B | border #E2E8F0
income #16A34A | expense #DC2626 | warning #F59E0B
```

Use 14–18px card radius, subtle borders, restrained shadows, and an 8px spacing scale. Never communicate status by color alone.

## Typography

- Brand/headings: Madane.
- UI: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif`.
- Balance values: tabular numerals, semibold/bold, high contrast.

## Components and layout

Buttons require focus, disabled, hover, and loading states. Forms require labels and inline errors. Charts need a textual summary. Desktop uses sidebar plus content; mobile uses top bar plus bottom navigation or drawer. Tables become stacked cards on narrow screens.

## UX states

Every async view must define loading, empty, error, success, and partial-data behavior. Confirm destructive actions and provide undo/toast where practical.
