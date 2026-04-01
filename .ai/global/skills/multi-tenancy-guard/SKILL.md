---
name: multi-tenancy-guard
description: Enforce multi-tenancy data isolation rules. Use when writing database queries, creating new tables, or implementing API endpoints that access tenant data.
---

# Multi-Tenancy Guard

## Critical Rules

Every database operation MUST enforce tenant isolation to prevent data leakage between tenants.

## Database Schema Requirements

### New Tables Must Include tenantId
```typescript
export const myTable = pgTable('my_table', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id')
    .notNull()
    .references(() => tenants.id),
  // ... other columns
});
```

### Exceptions
Only these tables can omit `tenantId`:
- `tenants` (the tenant registry itself)
- `verification_tokens` (pre-registration)
- System-wide configuration tables

## Query Requirements

### Always Filter by tenantId
```typescript
// ✅ CORRECT
const patients = await db
  .select()
  .from(patientsTable)
  .where(eq(patientsTable.tenantId, req.user.tenantId));

// ❌ WRONG - Missing tenantId filter
const patients = await db
  .select()
  .from(patientsTable);
```

### Joins Must Validate tenantId
```typescript
// ✅ CORRECT
const appointments = await db
  .select()
  .from(appointmentsTable)
  .innerJoin(
    patientsTable,
    and(
      eq(appointmentsTable.patientId, patientsTable.id),
      eq(patientsTable.tenantId, req.user.tenantId)
    )
  )
  .where(eq(appointmentsTable.tenantId, req.user.tenantId));
```

### Updates and Deletes
```typescript
// ✅ CORRECT - Filter by both ID and tenantId
await db
  .update(patientsTable)
  .set({ name: 'Updated Name' })
  .where(
    and(
      eq(patientsTable.id, patientId),
      eq(patientsTable.tenantId, req.user.tenantId)
    )
  );

// ❌ WRONG - Only filtering by ID allows cross-tenant updates
await db
  .update(patientsTable)
  .set({ name: 'Updated Name' })
  .where(eq(patientsTable.id, patientId));
```

## API Endpoint Requirements

### Extract tenantId from Authenticated User
```typescript
// Middleware provides req.user with tenantId
router.get('/patients', auth, async (req, res) => {
  const tenantId = req.user.tenantId; // From JWT token
  
  const patients = await db
    .select()
    .from(patientsTable)
    .where(eq(patientsTable.tenantId, tenantId));
  
  res.json(patients);
});
```

### Never Trust Client-Provided tenantId
```typescript
// ❌ WRONG - Client could send any tenantId
const tenantId = req.body.tenantId; // NEVER DO THIS

// ✅ CORRECT - Always use authenticated user's tenantId
const tenantId = req.user.tenantId;
```

## Testing Multi-Tenancy

When writing tests:
1. Create multiple test tenants
2. Verify queries only return data for the correct tenant
3. Test that cross-tenant access is blocked
4. Verify updates/deletes don't affect other tenants

## Code Review Checklist

Before submitting code that touches the database:
- [ ] New tables include `tenantId` column (unless system table)
- [ ] All SELECT queries filter by `tenantId`
- [ ] All UPDATE/DELETE queries filter by `tenantId`
- [ ] Joins validate `tenantId` on both sides
- [ ] API endpoints use `req.user.tenantId`, never client input
- [ ] Tests verify tenant isolation

## Common Pitfalls

1. **Forgetting tenantId in WHERE clause** - Most common mistake
2. **Using client-provided tenantId** - Security vulnerability
3. **Omitting tenantId in joins** - Can leak data across tenants
4. **Raw SQL without tenantId filter** - Bypasses type safety
5. **Cascade deletes without tenantId check** - Can delete wrong tenant's data
