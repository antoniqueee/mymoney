# Development Rules

1. Use TypeScript strict mode; avoid `any`.
2. Use App Router and Server Components by default.
3. Keep domain logic in `features/` or server actions.
4. Validate every external input with Zod.
5. Derive the authenticated user on the server.
6. Use RLS as the final authorization boundary.
7. Use decimal-safe money handling; never store money as floating point.
8. Use reusable accessible components.
9. Add migrations for schema changes.
10. Never commit secrets, `.env.local`, or personal exports.
11. Implement one vertical slice at a time: schema, server logic, UI, states, tests.
12. Run lint, typecheck, and build after meaningful changes.
13. Do not change the stack, routes, or data model without approval.
