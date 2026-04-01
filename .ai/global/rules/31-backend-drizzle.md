# Backend - Drizzle ORM

## Schema Management

- `src/db/schema.ts` is the single source of truth for database schema.
- All schema changes must be made in this file first.
- After schema changes, run `npm run db:generate` to create migration files.
- Apply migrations with `npm run db:migrate`.
- Always commit both schema changes and generated migration files together.

## Query Patterns

- Always filter by `tenantId` in queries to enforce multi-tenancy.
- Use Drizzle's query builder for type-safe queries.
- Prefer `db.select()` over raw SQL queries.
- Use transactions for operations that modify multiple tables.
- Handle database errors gracefully with appropriate error messages.

## Migrations

- Never edit generated migration files manually.
- If a migration needs changes, modify the schema and regenerate.
- Test migrations on a development database before applying to production.
- Keep migrations atomic and reversible when possible.
