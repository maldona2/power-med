# Design Document: Appointment Status and Reminders

## Overview

This design implements two key improvements to the appointment system:

1. **Auto-confirmation for doctor-created appointments**: Appointments created by users with the "professional" role will automatically be set to "confirmed" status, eliminating the unnecessary "pending" state for doctor-initiated appointments.

2. **Automated 24-hour email reminder system**: A scheduled job will identify appointments requiring reminders and send professional email notifications to patients 24 hours before their scheduled time.

The design maintains backward compatibility with existing appointments, integrates with the current email infrastructure (Resend), and includes comprehensive tracking and monitoring capabilities.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     Appointment Creation Flow                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ appointmentService│
                    │   .create()      │
                    └──────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │ Check user role   │
                    │ via auth context  │
                    └─────────┬─────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
         role='professional'         role='other'
                │                           │
                ▼                           ▼
        status='confirmed'          status='pending'
                │                           │
                └─────────────┬─────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Insert to DB     │
                    │ Send booked email│
                    │ Trigger cal sync │
                    └──────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                     Reminder System Flow                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Cron Scheduler  │
                    │  (every hour)    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  reminderJob     │
                    │  .sendReminders()│
                    └──────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │ Query appointments│
                    │ 23-25h window     │
                    │ status: confirmed │
                    │   or pending      │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ For each appt:   │
                    │ - Check email    │
                    │ - Check opt-out  │
                    │ - Check sent flag│
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ mailService      │
                    │ .sendReminder()  │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Record delivery  │
                    │ in reminders tbl │
                    └──────────────────┘
```

### Data Flow

1. **Appointment Creation**:
   - API receives appointment creation request
   - Auth middleware provides user context (role)
   - appointmentService checks user role
   - Status set to "confirmed" if role is "professional", otherwise "pending"
   - Appointment inserted into database
   - Confirmation email sent
   - Calendar sync triggered if applicable

2. **Reminder Processing**:
   - Cron job triggers reminderJob every hour
   - Query identifies appointments in 23-25 hour window
   - Filter by status (confirmed/pending) and exclude cancelled/completed/no-show
   - Check reminder_deliveries table to avoid duplicates
   - Check patient opt-out preferences
   - Send email via mailService
   - Record delivery status in reminder_deliveries table
   - Log metrics for monitoring

## Components and Interfaces

### Modified: appointmentService.create()

```typescript
export interface CreateAppointmentInput {
  patient_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  notes?: string | null;
  payment_status?: PaymentStatus;
  treatments?: TreatmentLineItem[];
}

export async function create(
  tenantId: string,
  userId: string,        // NEW: user ID from auth context
  userRole: string,      // NEW: user role from auth context
  input: CreateAppointmentInput
): Promise<AppointmentRow>
```

**Changes**:
- Add `userId` and `userRole` parameters from auth middleware
- Determine initial status based on role:
  - `role === 'professional'` → status = 'confirmed'
  - Otherwise → status = 'pending'
- Trigger calendar sync immediately if status is 'confirmed'

### New: reminderService

```typescript
export interface ReminderDelivery {
  id: string;
  appointment_id: string;
  patient_email: string;
  sent_at: Date;
  status: 'sent' | 'failed' | 'skipped';
  error_message?: string | null;
  retry_count: number;
}

export async function sendReminders(): Promise<{
  sent: number;
  failed: number;
  skipped: number;
}>;

export async function recordDelivery(
  appointmentId: string,
  patientEmail: string,
  status: 'sent' | 'failed' | 'skipped',
  errorMessage?: string
): Promise<void>;

export async function hasReminderBeenSent(
  appointmentId: string
): Promise<boolean>;

export async function checkOptOut(
  patientId: string
): Promise<boolean>;
```

### Modified: mailService

No interface changes needed. The existing `sendAppointmentReminder()` function will be used.

### New: Cron Job Configuration

```typescript
// In index.ts or separate scheduler file
import cron from 'node-cron';
import { sendReminders } from './jobs/reminderJob.js';

// Run every hour at minute 0
cron.schedule('0 * * * *', async () => {
  await sendReminders();
});
```

## Data Models

### Modified: appointments table

No schema changes needed. The existing `status` enum already supports the required values:
- `pending`
- `confirmed`
- `completed`
- `cancelled`

We'll add a new status value for future use:
- `no-show`

### New: reminder_deliveries table

```sql
CREATE TABLE reminder_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  patient_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reminder_deliveries_appointment ON reminder_deliveries(appointment_id);
CREATE INDEX idx_reminder_deliveries_tenant ON reminder_deliveries(tenant_id);
CREATE INDEX idx_reminder_deliveries_sent_at ON reminder_deliveries(sent_at);
CREATE INDEX idx_reminder_deliveries_status ON reminder_deliveries(status);
```

### New: reminder_opt_outs table

```sql
CREATE TABLE reminder_opt_outs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  opted_out_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, patient_id)
);

CREATE INDEX idx_reminder_opt_outs_patient ON reminder_opt_outs(patient_id);
CREATE INDEX idx_reminder_opt_outs_tenant ON reminder_opt_outs(tenant_id);
```

### Drizzle Schema Additions

```typescript
// In backend/src/db/schema.ts

export const reminderDeliveries = pgTable(
  'reminder_deliveries',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    appointmentId: uuid('appointment_id')
      .notNull()
      .references(() => appointments.id, { onDelete: 'cascade' }),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    patientEmail: text('patient_email').notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow(),
    status: text('status', {
      enum: ['sent', 'failed', 'skipped'],
    }).notNull(),
    errorMessage: text('error_message'),
    retryCount: integer('retry_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_reminder_deliveries_appointment').on(table.appointmentId),
    index('idx_reminder_deliveries_tenant').on(table.tenantId),
    index('idx_reminder_deliveries_sent_at').on(table.sentAt),
    index('idx_reminder_deliveries_status').on(table.status),
  ]
);

export const reminderOptOuts = pgTable(
  'reminder_opt_outs',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    optedOutAt: timestamp('opted_out_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_reminder_opt_outs_patient').on(table.patientId),
    index('idx_reminder_opt_outs_tenant').on(table.tenantId),
  ]
);

export type ReminderDelivery = typeof reminderDeliveries.$inferSelect;
export type NewReminderDelivery = typeof reminderDeliveries.$inferInsert;

export type ReminderOptOut = typeof reminderOptOuts.$inferSelect;
export type NewReminderOptOut = typeof reminderOptOuts.$inferInsert;
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:

- **1.2 is covered by 1.1**: Checking user role is the mechanism for 1.1
- **3.4 is covered by 3.3**: Excluding certain statuses is the inverse of including others
- **7.1 is covered by 4.5**: Both test handling of missing email addresses
- **11.5 is covered by 11.3**: Both test that opt-out applies to all reminders

The following properties provide unique validation value:

### Property 1: Doctor-created appointments are auto-confirmed

*For any* appointment created by a user with role='professional', the appointment status should be set to 'confirmed' immediately upon creation.

**Validates: Requirements 1.1, 1.2**

### Property 2: Non-doctor appointments default to pending

*For any* appointment created by a user without role='professional', the appointment status should be set to 'pending' upon creation.

**Validates: Requirements 1.4**

### Property 3: Confirmed appointments skip pending state

*For any* appointment created with status='confirmed', there should never be a record of it having status='pending' in its history.

**Validates: Requirements 1.3**

### Property 4: Confirmed status triggers calendar sync

*For any* appointment that transitions to status='confirmed', a calendar sync operation should be enqueued if the professional has Google Calendar connected.

**Validates: Requirements 1.5**

### Property 5: Valid status transitions from confirmed

*For any* appointment with status='confirmed', transitioning to 'completed', 'cancelled', or 'no-show' should succeed.

**Validates: Requirements 2.2**

### Property 6: Completed appointments can be corrected to cancelled

*For any* appointment with status='completed', transitioning to 'cancelled' should succeed.

**Validates: Requirements 2.3**

### Property 7: Terminal statuses prevent further transitions

*For any* appointment with status='cancelled' or 'no-show', attempts to transition to any other status should fail.

**Validates: Requirements 2.4**

### Property 8: Pending appointments are included in reminders

*For any* appointment with status='pending' that falls in the 23-25 hour window, it should be included in the reminder query results.

**Validates: Requirements 2.5**

### Property 9: Reminder window selection

*For any* set of appointments, only those scheduled between 23 and 25 hours in the future should be selected by the reminder job.

**Validates: Requirements 3.2**

### Property 10: Reminder status filtering

*For any* set of appointments, only those with status='confirmed' or status='pending' should be selected by the reminder job.

**Validates: Requirements 3.3, 3.4**

### Property 11: Reminder idempotency

*For any* appointment, at most one reminder delivery record with status='sent' should exist, preventing duplicate reminders.

**Validates: Requirements 3.5**

### Property 12: Email sent to patient address

*For any* appointment with a patient email address, when a reminder is sent, the email should be delivered to that patient's email address.

**Validates: Requirements 4.1**

### Property 13: Email contains appointment details

*For any* appointment reminder email, the content should include the scheduled date, time, and professional's name.

**Validates: Requirements 4.2, 4.3**

### Property 14: Email includes notes when present

*For any* appointment with notes, the reminder email should include those notes in the content.

**Validates: Requirements 4.4**

### Property 15: Missing email addresses are handled gracefully

*For any* appointment where the patient has no email address, the reminder should be skipped with status='skipped' and reason='no email address', and processing should continue.

**Validates: Requirements 4.5, 7.1, 7.2**

### Property 16: Subject line format

*For any* reminder email, the subject line should match the pattern "Recordatorio: turno mañana con [PROFESSIONAL_NAME]".

**Validates: Requirements 5.1**

### Property 17: Email greeting includes patient name

*For any* reminder email, the greeting should include the patient's first name.

**Validates: Requirements 5.2**

### Property 18: Date formatting

*For any* reminder email, the appointment date should be formatted as "Day, Month Date, Year" (e.g., "lunes, 15 de enero de 2024").

**Validates: Requirements 5.3**

### Property 19: Time formatting

*For any* reminder email, the appointment time should be formatted in 12-hour format with AM/PM or 24-hour format based on locale.

**Validates: Requirements 5.4**

### Property 20: Delivery timestamp recorded

*For any* sent reminder, a delivery record should exist with a sent_at timestamp.

**Validates: Requirements 6.1**

### Property 21: Delivery status recorded

*For any* reminder attempt, a delivery record should exist with status='sent', 'failed', or 'skipped'.

**Validates: Requirements 6.2**

### Property 22: Failed sends record error details

*For any* failed reminder send, the delivery record should include an error_message.

**Validates: Requirements 6.3**

### Property 23: Failed sends are retried

*For any* failed reminder send, up to 3 retry attempts should be made with exponential backoff.

**Validates: Requirements 6.4**

### Property 24: Batch processing continues after errors

*For any* batch of appointments, if one appointment fails to send, the remaining appointments in the batch should still be processed.

**Validates: Requirements 7.3, 8.4**

### Property 25: Skipped appointments not marked as sent

*For any* skipped reminder (due to missing email), the delivery record should have status='skipped', not status='sent'.

**Validates: Requirements 7.4**

### Property 26: Skipped appointments not retried in same run

*For any* appointment skipped due to missing email, it should not be retried within the same job execution.

**Validates: Requirements 7.5**

### Property 27: Email headers present

*For any* sent reminder email, it should include From, Reply-To, and Message-ID headers.

**Validates: Requirements 9.3**

### Property 28: Email dual format

*For any* sent reminder email, it should include both HTML and plain text versions.

**Validates: Requirements 9.4**

### Property 29: Rate limiting handled gracefully

*For any* rate limit error from the email provider, the system should catch the error, log it, and mark the delivery as failed for retry.

**Validates: Requirements 9.5**

### Property 30: Timezone formatting

*For any* reminder email, the appointment time should be formatted in the practice's configured timezone (America/Argentina/Buenos_Aires).

**Validates: Requirements 10.1**

### Property 31: Timezone abbreviation included

*For any* reminder email, the formatted time should include a timezone indicator (e.g., "ART" or "GMT-3").

**Validates: Requirements 10.2**

### Property 32: Scheduled time used for formatting

*For any* reminder email, the date and time should be derived from the appointment's scheduled_at field.

**Validates: Requirements 10.3**

### Property 33: UTC fallback indicated

*For any* appointment where timezone information is unavailable, the email should use UTC and indicate "UTC" in the time display.

**Validates: Requirements 10.5**

### Property 34: Unsubscribe link present

*For any* reminder email, the HTML content should include an unsubscribe link.

**Validates: Requirements 11.1**

### Property 35: Opt-out recorded

*For any* patient who clicks the unsubscribe link, an opt-out record should be created in the reminder_opt_outs table.

**Validates: Requirements 11.2**

### Property 36: Opted-out patients excluded

*For any* patient with an active opt-out record, they should be excluded from reminder processing for all their appointments.

**Validates: Requirements 11.3, 11.5**

### Property 37: Opt-in removes opt-out

*For any* patient who re-enables reminders, their opt-out record should be deleted, allowing future reminders.

**Validates: Requirements 11.4**

### Property 38: Daily reminder count tracked

*For any* day, the total number of reminders sent should be tracked and retrievable.

**Validates: Requirements 12.1**

### Property 39: Success rate calculated correctly

*For any* set of delivery records, the success rate should equal (sent / (sent + failed)) * 100.

**Validates: Requirements 12.2**

### Property 40: Skipped reminders counted by reason

*For any* set of skipped reminders, they should be grouped and counted by skip reason.

**Validates: Requirements 12.3**

### Property 41: Low success rate triggers alert

*For any* day where the success rate falls below 95%, an alert should be triggered to administrators.

**Validates: Requirements 12.5**


## Error Handling

### Appointment Creation Errors

**Missing User Context**:
- If user ID or role is not provided in the request context, return 401 Unauthorized
- Log the error with request details for debugging

**Invalid Status Transition**:
- If an update attempts an invalid status transition, return 400 Bad Request with a clear error message
- Example: "Cannot transition from 'cancelled' to 'confirmed'"

**Calendar Sync Failures**:
- Calendar sync errors should not block appointment creation
- Log sync failures and enqueue for retry
- Return success to the user even if sync fails

### Reminder Job Errors

**Database Connection Failures**:
- Log the error with full stack trace
- Exit the job execution gracefully
- Allow the next scheduled run to retry

**Email Service Failures**:
- Catch all email sending errors
- Record delivery status as 'failed' with error message
- Implement exponential backoff for retries (1min, 5min, 15min)
- After 3 failed attempts, mark as permanently failed and alert

**Batch Processing Errors**:
- Wrap each appointment processing in try-catch
- Log individual failures but continue with remaining appointments
- Track error count and alert if error rate exceeds 10%

**Missing Data Errors**:
- If patient record is missing, skip and log
- If professional record is missing, use fallback name "El profesional"
- If timezone is missing, use UTC and indicate in email

### Email Template Errors

**Missing Template Data**:
- Provide sensible defaults for all optional fields
- Never fail email generation due to missing optional data
- Log warnings for missing expected data

**Timezone Conversion Errors**:
- If timezone conversion fails, fall back to UTC
- Log the error with appointment ID
- Include "UTC" indicator in the email

### Opt-Out Errors

**Duplicate Opt-Out**:
- If patient already has an opt-out record, return success (idempotent)
- Update the opted_out_at timestamp to current time

**Missing Patient**:
- If patient ID doesn't exist, return 404 Not Found
- Log the error with the provided patient ID

### Monitoring and Alerting

**Critical Alerts** (immediate notification):
- Email service completely unavailable
- Database connection failures
- Success rate below 95% for 2 consecutive hours

**Warning Alerts** (daily digest):
- Individual appointment reminder failures
- Missing patient email addresses (>10% of appointments)
- Timezone conversion errors

**Metrics to Track**:
- Total reminders sent per hour/day
- Success rate (sent / total attempts)
- Average processing time per batch
- Error rate by error type
- Opt-out rate over time

## Testing Strategy

### Unit Testing

Unit tests will focus on specific examples, edge cases, and error conditions:

**appointmentService.create()**:
- Test appointment creation with professional role returns confirmed status
- Test appointment creation with non-professional role returns pending status
- Test appointment creation without user context throws error
- Test calendar sync is triggered for confirmed appointments
- Test calendar sync is not triggered for pending appointments

**reminderService**:
- Test hasReminderBeenSent() returns true when delivery record exists
- Test hasReminderBeenSent() returns false when no delivery record exists
- Test checkOptOut() returns true when opt-out record exists
- Test checkOptOut() returns false when no opt-out record exists
- Test recordDelivery() creates a delivery record with correct fields
- Test recordDelivery() handles duplicate appointment IDs gracefully

**reminderJob.sendReminders()**:
- Test empty result set returns early without errors
- Test appointments without patient emails are skipped
- Test appointments with opted-out patients are skipped
- Test error in one appointment doesn't stop batch processing
- Test delivery records are created for all processed appointments

**emailTemplates**:
- Test reminderTemplate() includes all required fields
- Test reminderTemplate() formats date correctly
- Test reminderTemplate() formats time correctly
- Test reminderTemplate() includes unsubscribe link
- Test reminderTemplate() handles missing notes gracefully

**Status Workflow**:
- Test transition from confirmed to completed succeeds
- Test transition from confirmed to cancelled succeeds
- Test transition from confirmed to no-show succeeds
- Test transition from completed to cancelled succeeds
- Test transition from cancelled to confirmed fails
- Test transition from no-show to confirmed fails

### Property-Based Testing

Property tests will verify universal properties across all inputs using **fast-check** (JavaScript/TypeScript property-based testing library). Each test will run a minimum of 100 iterations.

**Configuration**:
```typescript
import fc from 'fast-check';

// Run each property test with 100 iterations
const testConfig = { numRuns: 100 };
```

**Property Test Examples**:

```typescript
// Feature: appointment-status-and-reminders, Property 1: Doctor-created appointments are auto-confirmed
fc.assert(
  fc.property(
    fc.record({
      patient_id: fc.uuid(),
      scheduled_at: fc.date(),
      duration_minutes: fc.integer({ min: 15, max: 180 }),
      notes: fc.option(fc.string(), { nil: null }),
    }),
    async (appointmentData) => {
      const result = await appointmentService.create(
        tenantId,
        userId,
        'professional',
        appointmentData
      );
      expect(result.status).toBe('confirmed');
    }
  ),
  testConfig
);

// Feature: appointment-status-and-reminders, Property 9: Reminder window selection
fc.assert(
  fc.property(
    fc.array(
      fc.record({
        id: fc.uuid(),
        scheduled_at: fc.date(),
        status: fc.constantFrom('confirmed', 'pending', 'cancelled', 'completed'),
      })
    ),
    async (appointments) => {
      const now = new Date();
      const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);
      
      const selected = await reminderService.getAppointmentsForReminder();
      
      for (const appt of selected) {
        expect(appt.scheduled_at >= windowStart).toBe(true);
        expect(appt.scheduled_at <= windowEnd).toBe(true);
      }
    }
  ),
  testConfig
);

// Feature: appointment-status-and-reminders, Property 11: Reminder idempotency
fc.assert(
  fc.property(
    fc.uuid(),
    async (appointmentId) => {
      // Send reminder twice
      await reminderService.sendReminder(appointmentId);
      await reminderService.sendReminder(appointmentId);
      
      // Check only one delivery record with status='sent' exists
      const deliveries = await db
        .select()
        .from(reminderDeliveries)
        .where(
          and(
            eq(reminderDeliveries.appointmentId, appointmentId),
            eq(reminderDeliveries.status, 'sent')
          )
        );
      
      expect(deliveries.length).toBeLessThanOrEqual(1);
    }
  ),
  testConfig
);
```

**Property Test Coverage**:

Each of the 41 correctness properties will have a corresponding property-based test. Tests will be organized by feature area:

1. **Appointment Creation** (Properties 1-4): Test auto-confirmation logic
2. **Status Workflow** (Properties 5-8): Test valid and invalid transitions
3. **Reminder Selection** (Properties 9-11): Test query filtering and idempotency
4. **Email Delivery** (Properties 12-15): Test email sending and error handling
5. **Email Content** (Properties 16-19): Test template rendering
6. **Delivery Tracking** (Properties 20-26): Test record creation and retry logic
7. **Email Format** (Properties 27-29): Test headers and dual format
8. **Timezone Handling** (Properties 30-33): Test timezone conversion
9. **Opt-Out** (Properties 34-37): Test opt-out workflow
10. **Metrics** (Properties 38-41): Test tracking and alerting

### Integration Testing

Integration tests will verify end-to-end workflows:

**Appointment Creation Flow**:
- Create appointment as doctor → verify status is confirmed → verify calendar sync queued → verify confirmation email sent

**Reminder Flow**:
- Create appointment 24h in future → run reminder job → verify email sent → verify delivery record created → run job again → verify no duplicate email

**Opt-Out Flow**:
- Create appointment → send reminder → patient opts out → create another appointment → run reminder job → verify no email sent

**Status Transition Flow**:
- Create appointment → confirm → complete → verify all transitions succeed and emails sent at appropriate times

### Test Data Generators

For property-based testing, we'll create generators for:

```typescript
// Appointment generator
const appointmentGen = fc.record({
  patient_id: fc.uuid(),
  scheduled_at: fc.date({ min: new Date(), max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }),
  duration_minutes: fc.integer({ min: 15, max: 180 }),
  notes: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
  status: fc.constantFrom('pending', 'confirmed', 'completed', 'cancelled', 'no-show'),
});

// Patient generator
const patientGen = fc.record({
  id: fc.uuid(),
  first_name: fc.string({ minLength: 1, maxLength: 50 }),
  last_name: fc.string({ minLength: 1, maxLength: 50 }),
  email: fc.option(fc.emailAddress(), { nil: null }),
  phone: fc.option(fc.string(), { nil: null }),
});

// User generator
const userGen = fc.record({
  id: fc.uuid(),
  role: fc.constantFrom('professional', 'super_admin'),
  full_name: fc.string({ minLength: 1, maxLength: 100 }),
});

// Delivery record generator
const deliveryGen = fc.record({
  appointment_id: fc.uuid(),
  patient_email: fc.emailAddress(),
  status: fc.constantFrom('sent', 'failed', 'skipped'),
  error_message: fc.option(fc.string(), { nil: null }),
  retry_count: fc.integer({ min: 0, max: 3 }),
});
```

### Test Environment Setup

**Database**:
- Use a separate test database
- Reset schema before each test suite
- Seed with minimal required data (tenant, users, patients)

**Email Service**:
- Mock Resend API in unit tests
- Use Resend test mode in integration tests
- Verify email content without actually sending

**Time Mocking**:
- Use `jest.useFakeTimers()` to control time in tests
- Test reminder window selection with various time offsets
- Test timezone conversions with different dates

### Continuous Integration

**Pre-commit**:
- Run unit tests
- Run linter and type checker

**Pull Request**:
- Run all unit tests
- Run all property-based tests
- Run integration tests
- Check code coverage (target: >80%)

**Post-merge**:
- Run full test suite
- Deploy to staging
- Run smoke tests on staging

