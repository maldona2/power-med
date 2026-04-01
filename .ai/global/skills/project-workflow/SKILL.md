---
name: project-workflow
description: Execute common development workflows and commands for Power-Med. Use when tasks involve building, testing, linting, database migrations, or running the development environment.
---

# Project Workflow Runbook

Select commands by goal and run from repository root unless noted otherwise.

## Development Commands

### Start Full Development Environment
```bash
npm run start:dev       # Starts PostgreSQL (Docker) + frontend + backend in watch mode
```

### Install Dependencies
```bash
npm run install:all     # Install all dependencies (root, frontend, backend)
```

## Backend Commands (from `backend/`)

### Development Server
```bash
npm run dev             # Start backend in watch mode with tsx
```

### Database Operations
```bash
npm run db:generate     # Generate Drizzle migration from schema.ts changes
npm run db:migrate      # Apply pending migrations to database
npm run db:seed         # Seed initial data (pricing models, etc.)
```

### Testing
```bash
npm test                                        # Run all Jest tests
npm test -- --testPathPattern=<file>           # Run specific test file
npm run test:coverage                          # Run tests with coverage report
```

## Frontend Commands (from `frontend/`)

### Development Server
```bash
npm run dev             # Start Vite dev server (http://localhost:3000)
```

### Testing
```bash
npm test                # Run Vitest tests
npm run test:ui         # Run Vitest with browser UI
```

### UI Components
```bash
npx shadcn@latest add <component>  # Add new shadcn/ui component
```

## Quality Commands (from root)

```bash
npm run lint            # Lint both frontend and backend
npm run test            # Run all tests (frontend + backend)
```

## Database Migration Workflow

When modifying database schema:

1. Edit `backend/src/db/schema.ts`
2. Run `npm run db:generate` from `backend/` directory
3. Review generated migration in `backend/drizzle/`
4. Run `npm run db:migrate` to apply migration
5. Commit both schema changes and migration file

## Usage Notes

- Always run database commands from the `backend/` directory.
- Frontend and backend can run independently or together via `npm run start:dev`.
- PostgreSQL must be running (via Docker) before starting backend.
- Development URLs: Frontend (3000), Backend API (5001), PostgreSQL (5432).
- Prefer project scripts from `package.json` over ad-hoc commands.
