# Architecture

## Multi-Tenancy

- Every database table has a `tenantId` foreign key.
- All queries MUST filter by `tenantId` to ensure data isolation.
- Never expose data across tenant boundaries.

## Authentication & Authorization

- JWT tokens stored in localStorage with 30-day expiry.
- Two roles: `professional` and `super_admin`.
- Middleware chain: `auth.ts` extracts user from Bearer token → `requireRole.ts` enforces RBAC.
- All protected routes must use authentication middleware.

## Backend Architecture

- Thin route handlers that delegate to service layer.
- All business logic lives in `src/services/`.
- Database schema is single source of truth in `src/db/schema.ts`.
- Use Drizzle ORM for all database operations.
- Background jobs for scheduled tasks (reminders, billing, cleanup).
- Queue-based processing for Google Calendar sync with retry/backoff.

## Frontend Architecture

- React Router with `ProtectedRoute` / `PublicRoute` guards.
- Global auth state managed via `AuthContext`.
- Domain-specific data-fetching hooks in `src/hooks/`.
- shadcn/ui components for consistent UI.
- Zod schemas for form validation and API contracts.
- Path alias `@/` maps to `src/`.

## Data Conventions

- All monetary amounts stored in cents (integers).
- Convert to display currency at presentation layer only.
- Dates stored in UTC, converted to local timezone in UI.
