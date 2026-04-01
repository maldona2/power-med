# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Does

Power-Med is a multi-tenant SaaS medical practice management platform for healthcare professionals (therapists, physicians). Core features: appointment scheduling with Google Calendar sync, patient management with full medical history, treatment/session documentation with AWS S3 photo storage, payment tracking with installment plans, appointment reminders via email, and a Mercado Pago subscription billing system (Free/Pro/Gold tiers).

## Commands

### Development (from project root)
```bash
npm run start:dev       # Start PostgreSQL (Docker) + frontend + backend in watch mode
npm run install:all     # Install all dependencies
npm run lint            # Lint both frontend and backend
npm run test            # Run all tests
```

### Backend (from `backend/`)
```bash
npm run dev             # tsx watch mode
npm run db:generate     # Generate Drizzle migration from schema changes
npm run db:migrate      # Apply pending migrations
npm run db:seed         # Seed initial data
npm test                # Jest
npm test -- --testPathPattern=<file>  # Run a single test file
npm run test:coverage   # Jest with coverage
```

### Frontend (from `frontend/`)
```bash
npm run dev             # Vite dev server
npm test                # Vitest
npm run test:ui         # Vitest with browser UI
npx shadcn@latest add <component>  # Add shadcn/ui component
```

### URLs (dev)
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- PostgreSQL: localhost:5432

## Architecture

### Multi-Tenancy & Auth
Every DB table has a `tenantId` FK — all queries must filter by it. Auth is JWT (30-day expiry) stored in localStorage. Two roles: `professional` and `super_admin`. Middleware chain: `auth.ts` extracts user from Bearer token → `requireRole.ts` enforces RBAC.

### Backend Structure
- **`src/app.ts`** — Express setup; register new routes here, `errorHandler` must remain last middleware
- **`src/db/schema.ts`** — Single source of truth for 48 DB tables (Drizzle ORM); modify here, then `db:generate` + `db:migrate`
- **`src/routes/`** — Thin handlers, delegate to services
- **`src/services/`** — All business logic lives here
- **`src/subscriptions/`** — Mercado Pago billing system with `LimitEnforcer` (enforces per-plan appointment limits), `PlanManager`, `UsageTracker`, and `WebhookHandler`
- **`src/workers/calendarSyncWorker.ts`** — Background worker processing the `calendarSyncQueue` table for Google Calendar sync with retry/backoff
- **`src/jobs/`** — Cron jobs (reminders at 9 AM, billing reset on 1st of month, photo cleanup every 30 min)

### Frontend Structure
- **`src/App.tsx`** — React Router setup with `ProtectedRoute` / `PublicRoute` guards
- **`src/contexts/AuthContext.tsx`** — Global auth state (login/logout, user info with tenantId)
- **`src/lib/api.ts`** — Axios instance that attaches `Authorization: Bearer` header automatically
- **`src/hooks/`** — Domain-specific data-fetching hooks (e.g., `useAppointments`, `usePatients`, `usePaymentPlans`)
- **`src/components/ui/`** — shadcn/ui components (Radix primitives + Tailwind); add via `npx shadcn@latest add`
- **`src/schemas/`** — Zod schemas shared across forms and API calls

### Key Integrations
| Integration | Purpose | Key Files |
|---|---|---|
| Google Calendar | Appointment sync via OAuth2 + encrypted tokens | `src/routes/googleCalendar.ts`, `src/workers/calendarSyncWorker.ts` |
| Mercado Pago | Subscription billing (ARS) | `src/subscriptions/` |
| AWS S3 | Session photo storage with presigned URLs | `src/services/sessionPhotoService.ts` |
| SendGrid / Resend | Transactional emails (reminders, password reset) | `src/services/mailService.ts` |

### Amounts & Pricing
All monetary amounts are stored in **cents** (integers). Treatment prices, appointment amounts, and payment records are all cents — convert at the display layer.

### Migrations Workflow
1. Edit `backend/src/db/schema.ts`
2. `npm run db:generate` — creates a new SQL file in `backend/drizzle/`
3. `npm run db:migrate` — applies it
4. Commit both the schema change and the generated migration file

## Environment Variables

Backend requires: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_TOKEN_ENCRYPTION_KEY` (AES-256 hex), `SENDGRID_API_KEY`, `RESEND_API_KEY`, `MERCADO_PAGO_*`, `AWS_*`. See `backend/env.example`.

## Code Style

- Prettier: single quotes, semicolons, 80-char width, 2 spaces, ES5 trailing commas
- TypeScript strict mode; both packages use ES modules (`"type": "module"`)
- Frontend path alias: `@/` maps to `src/` (components, lib, hooks, types)
