---
name: database-migration
description: Guide for safely creating and applying database migrations using Drizzle ORM. Use when modifying database schema, adding tables, columns, or constraints.
---

# Database Migration Guide

## Safe Migration Workflow

### 1. Modify Schema
- Edit `backend/src/db/schema.ts` only
- Make changes to table definitions, columns, relations, etc.
- Ensure TypeScript types are correct

### 2. Generate Migration
```bash
cd backend
npm run db:generate
```
- This creates a new SQL file in `backend/drizzle/XXXX_description.sql`
- Review the generated SQL carefully

### 3. Review Generated Migration
- Check that the SQL matches your intended changes
- Verify no unintended table drops or data loss
- Ensure foreign key constraints are correct
- Check for proper indexes

### 4. Apply Migration
```bash
npm run db:migrate
```
- Applies pending migrations to the database
- Updates migration tracking table

### 5. Commit Changes
```bash
git add backend/src/db/schema.ts
git add backend/drizzle/XXXX_description.sql
git commit -m "feat(db): add description of schema change"
```

## Important Rules

- **Never edit generated migration files manually** - If changes needed, modify schema and regenerate
- **Always commit schema + migration together** - They must stay in sync
- **Test migrations on dev database first** - Never apply untested migrations to production
- **Keep migrations atomic** - One logical change per migration when possible
- **Multi-tenancy check** - Ensure new tables include `tenantId` column if needed

## Common Migration Patterns

### Adding a New Table
```typescript
export const newTable = pgTable('new_table', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Adding a Column
```typescript
// Add to existing table definition
newColumn: varchar('new_column', { length: 100 }),
```

### Adding an Index
```typescript
// In table definition
}, (table) => ({
  nameIdx: index('name_idx').on(table.name),
}));
```

## Rollback Strategy

- Drizzle doesn't auto-generate rollback migrations
- For critical changes, manually create a down migration
- Keep backups before major schema changes
- Test rollback procedures in development

## Troubleshooting

**Migration fails to apply:**
- Check database connection
- Verify no conflicting schema changes
- Review migration SQL for syntax errors

**Schema out of sync:**
- Regenerate migration from current schema
- Ensure all team members have applied latest migrations
