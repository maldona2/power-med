# Implementation Plan: Appointment Status and Reminders

## Overview

This implementation adds two key features: auto-confirmation for doctor-created appointments and automated 24-hour email reminders. The work involves database migrations, service modifications, new reminder infrastructure, and comprehensive testing.

## Tasks

- [ ] 1. Create database migrations for reminder tracking tables
  - [ ] 1.1 Create migration for reminder_deliveries table
    - Add table with fields: id, tenant_id, appointment_id, patient_id, patient_email, sent_at, status, error_message, retry_count
    - Add indexes on appointment_id, tenant_id, sent_at, and status
    - Add foreign key constraints with cascade deletes
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ] 1.2 Create migration for reminder_opt_outs table
    - Add table with fields: id, tenant_id, patient_id, opted_out_at
    - Add unique constraint on (tenant_id, patient_id)
    - Add indexes on patient_id and tenant_id
    - Add foreign key constraints with cascade deletes
    - _Requirements: 11.2, 11.3_
  
  - [ ] 1.3 Add 'no-show' status to appointments enum
    - Alter appointments.status enum to include 'no-show'
    - _Requirements: 2.1_
  
  - [ ] 1.4 Update Drizzle schema definitions
    - Add reminderDeliveries table schema in backend/src/db/schema.ts
    - Add reminderOptOuts table schema in backend/src/db/schema.ts
    - Export TypeScript types for both tables
    - Add relations for new tables
    - _Requirements: 6.5_

- [ ] 2. Modify appointmentService for auto-confirmation
  - [ ] 2.1 Update create() function signature
    - Add userId and userRole parameters to create() function
    - Update CreateAppointmentInput interface if needed
    - _Requirements: 1.1, 1.2_
  
  - [ ] 2.2 Implement role-based status logic
    - Check if userRole === 'professional'
    - Set status to 'confirmed' for professional role, 'pending' otherwise
    - _Requirements: 1.1, 1.4_
  
  - [ ]* 2.3 Write property test for auto-confirmation
    - **Property 1: Doctor-created appointments are auto-confirmed**
    - **Validates: Requirements 1.1, 1.2**
  
  - [ ]* 2.4 Write property test for non-doctor appointments
    - **Property 2: Non-doctor appointments default to pending**
    - **Validates: Requirements 1.4**
  
  - [ ] 2.5 Update appointments route to pass user context
    - Extract userId and userRole from auth middleware in POST /appointments
    - Pass to appointmentService.create()
    - _Requirements: 1.2_
  
  - [ ] 2.6 Trigger calendar sync for confirmed appointments
    - Call enqueueSyncIfConnected() when status is 'confirmed'
    - _Requirements: 1.5_
  
  - [ ]* 2.7 Write property test for calendar sync trigger
    - **Property 4: Confirmed status triggers calendar sync**
    - **Validates: Requirements 1.5**

- [ ] 3. Checkpoint - Verify auto-confirmation works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Create reminderService with core functionality
  - [ ] 4.1 Create backend/src/services/reminderService.ts
    - Define ReminderDelivery interface
    - Export service functions
    - _Requirements: 3.1, 3.5_
  
  - [ ] 4.2 Implement hasReminderBeenSent() function
    - Query reminder_deliveries for appointment_id with status='sent'
    - Return boolean
    - _Requirements: 3.5_
  
  - [ ]* 4.3 Write property test for reminder idempotency
    - **Property 11: Reminder idempotency**
    - **Validates: Requirements 3.5**
  
  - [ ] 4.4 Implement checkOptOut() function
    - Query reminder_opt_outs for patient_id
    - Return boolean
    - _Requirements: 11.3_
  
  - [ ]* 4.5 Write property test for opt-out exclusion
    - **Property 36: Opted-out patients excluded**
    - **Validates: Requirements 11.3, 11.5**
  
  - [ ] 4.6 Implement recordDelivery() function
    - Insert record into reminder_deliveries table
    - Include appointment_id, patient_email, status, error_message, retry_count
    - Handle duplicate records gracefully
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 4.7 Write property test for delivery recording
    - **Property 20: Delivery timestamp recorded**
    - **Validates: Requirements 6.1**
  
  - [ ]* 4.8 Write property test for delivery status
    - **Property 21: Delivery status recorded**
    - **Validates: Requirements 6.2**

- [ ] 5. Update reminderJob with enhanced logic
  - [ ] 5.1 Modify sendReminders() to use reminderService
    - Import hasReminderBeenSent() and checkOptOut()
    - Filter appointments that already have reminders sent
    - Filter appointments for opted-out patients
    - _Requirements: 3.5, 11.3_
  
  - [ ] 5.2 Add reminder window query logic
    - Query appointments scheduled between now+23h and now+25h
    - Filter by status: 'confirmed' or 'pending'
    - Exclude 'cancelled', 'completed', 'no-show'
    - _Requirements: 3.2, 3.3, 3.4, 2.5_
  
  - [ ]* 5.3 Write property test for reminder window selection
    - **Property 9: Reminder window selection**
    - **Validates: Requirements 3.2**
  
  - [ ]* 5.4 Write property test for status filtering
    - **Property 10: Reminder status filtering**
    - **Validates: Requirements 3.3, 3.4**
  
  - [ ]* 5.5 Write property test for pending appointments inclusion
    - **Property 8: Pending appointments are included in reminders**
    - **Validates: Requirements 2.5**
  
  - [ ] 5.6 Implement batch processing with error handling
    - Process appointments in batches of 100
    - Wrap each appointment in try-catch
    - Continue processing on individual failures
    - Log errors but don't stop batch
    - _Requirements: 7.3, 8.2, 8.4_
  
  - [ ]* 5.7 Write property test for batch error handling
    - **Property 24: Batch processing continues after errors**
    - **Validates: Requirements 7.3, 8.4**
  
  - [ ] 5.8 Handle missing email addresses gracefully
    - Skip appointments where patient.email is null
    - Record as 'skipped' with reason 'no email address'
    - Continue with remaining appointments
    - _Requirements: 4.5, 7.1, 7.2, 7.4_
  
  - [ ]* 5.9 Write property test for missing email handling
    - **Property 15: Missing email addresses are handled gracefully**
    - **Validates: Requirements 4.5, 7.1, 7.2**
  
  - [ ] 5.10 Record delivery status after each send
    - Call recordDelivery() with status='sent' on success
    - Call recordDelivery() with status='failed' and error on failure
    - Call recordDelivery() with status='skipped' for missing email
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ] 5.11 Implement retry logic with exponential backoff
    - Retry failed sends up to 3 times
    - Use exponential backoff: 1min, 5min, 15min
    - Update retry_count in delivery record
    - _Requirements: 6.4_
  
  - [ ]* 5.12 Write property test for retry logic
    - **Property 23: Failed sends are retried**
    - **Validates: Requirements 6.4**

- [ ] 6. Checkpoint - Verify reminder job logic
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Update email templates for reminders
  - [ ] 7.1 Verify sendAppointmentReminder() in mailService
    - Check that function exists and has correct signature
    - Verify it accepts patientEmail, context object, appointmentId
    - _Requirements: 4.1_
  
  - [ ] 7.2 Update reminder email template content
    - Include appointment date formatted as "Day, Month Date, Year"
    - Include appointment time in 12-hour format with AM/PM
    - Include professional's name
    - Include patient's first name in greeting
    - _Requirements: 4.2, 4.3, 5.2, 5.3, 5.4_
  
  - [ ]* 7.3 Write property test for email content
    - **Property 13: Email contains appointment details**
    - **Validates: Requirements 4.2, 4.3**
  
  - [ ]* 7.4 Write property test for subject line format
    - **Property 16: Subject line format**
    - **Validates: Requirements 5.1**
  
  - [ ] 7.5 Add unsubscribe link to email template
    - Include unsubscribe URL at bottom of HTML email
    - Link should point to /api/reminders/opt-out/:patientId/:token
    - _Requirements: 11.1_
  
  - [ ]* 7.6 Write property test for unsubscribe link
    - **Property 34: Unsubscribe link present**
    - **Validates: Requirements 11.1**
  
  - [ ] 7.7 Implement timezone formatting
    - Format times in America/Argentina/Buenos_Aires timezone
    - Include timezone abbreviation (ART or GMT-3)
    - Fall back to UTC if timezone unavailable
    - _Requirements: 10.1, 10.2, 10.3, 10.5_
  
  - [ ]* 7.8 Write property test for timezone handling
    - **Property 30: Timezone formatting**
    - **Validates: Requirements 10.1**
  
  - [ ] 7.9 Ensure HTML and plain text versions
    - Verify email includes both HTML and plain text
    - _Requirements: 9.4_
  
  - [ ]* 7.10 Write property test for email format
    - **Property 28: Email dual format**
    - **Validates: Requirements 9.4**

- [ ] 8. Add API endpoints for opt-out functionality
  - [ ] 8.1 Create POST /api/reminders/opt-out endpoint
    - Accept patient_id in request body
    - Validate patient exists
    - Insert record into reminder_opt_outs table
    - Return success response
    - _Requirements: 11.2_
  
  - [ ] 8.2 Create DELETE /api/reminders/opt-out endpoint
    - Accept patient_id in request body
    - Delete record from reminder_opt_outs table
    - Return success response
    - _Requirements: 11.4_
  
  - [ ]* 8.3 Write property test for opt-out recording
    - **Property 35: Opt-out recorded**
    - **Validates: Requirements 11.2**
  
  - [ ]* 8.4 Write property test for opt-in
    - **Property 37: Opt-in removes opt-out**
    - **Validates: Requirements 11.4**
  
  - [ ] 8.5 Add authentication middleware to opt-out endpoints
    - Require valid auth token
    - Verify patient belongs to authenticated user's tenant
    - _Requirements: 11.2, 11.4_

- [ ] 9. Configure cron job scheduling
  - [ ] 9.1 Add cron job to backend/src/index.ts
    - Import node-cron package
    - Schedule sendReminders() to run every hour (0 * * * *)
    - Add error handling and logging
    - _Requirements: 3.1, 8.1_
  
  - [ ] 9.2 Add environment variable for cron schedule
    - Add REMINDER_CRON_SCHEDULE to .env.example
    - Default to '0 * * * *' (every hour)
    - Allow override for testing
    - _Requirements: 8.1_

- [ ] 10. Implement status workflow validation
  - [ ] 10.1 Add status transition validation to appointmentService.update()
    - Allow confirmed → completed, cancelled, no-show
    - Allow completed → cancelled
    - Prevent cancelled → any other status
    - Prevent no-show → any other status
    - Return 400 error for invalid transitions
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [ ]* 10.2 Write property test for valid transitions
    - **Property 5: Valid status transitions from confirmed**
    - **Validates: Requirements 2.2**
  
  - [ ]* 10.3 Write property test for completed to cancelled
    - **Property 6: Completed appointments can be corrected to cancelled**
    - **Validates: Requirements 2.3**
  
  - [ ]* 10.4 Write property test for terminal statuses
    - **Property 7: Terminal statuses prevent further transitions**
    - **Validates: Requirements 2.4**

- [ ] 11. Add monitoring and metrics
  - [ ] 11.1 Create metrics tracking functions in reminderService
    - Implement getDailyReminderCount()
    - Implement getSuccessRate()
    - Implement getSkippedReasonCounts()
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [ ]* 11.2 Write property test for success rate calculation
    - **Property 39: Success rate calculated correctly**
    - **Validates: Requirements 12.2**
  
  - [ ] 11.3 Add alerting for low success rate
    - Check success rate after each job run
    - Log alert if success rate < 95%
    - _Requirements: 12.5_
  
  - [ ]* 11.4 Write property test for alert triggering
    - **Property 41: Low success rate triggers alert**
    - **Validates: Requirements 12.5**
  
  - [ ] 11.5 Add logging for reminder job execution
    - Log start and end of each job run
    - Log total reminders sent, failed, skipped
    - Log processing time
    - _Requirements: 12.1, 12.3_

- [ ] 12. Update frontend types if needed
  - [ ] 12.1 Add 'no-show' to AppointmentStatus type
    - Update frontend/src/types or equivalent
    - _Requirements: 2.1_
  
  - [ ] 12.2 Add reminder opt-out types if exposing to frontend
    - Only if building UI for opt-out management
    - _Requirements: 11.2, 11.4_

- [ ] 13. Integration testing
  - [ ]* 13.1 Write end-to-end test for appointment creation flow
    - Create appointment as doctor → verify status is confirmed → verify calendar sync queued
    - _Requirements: 1.1, 1.5_
  
  - [ ]* 13.2 Write end-to-end test for reminder flow
    - Create appointment 24h in future → run reminder job → verify email sent → verify delivery record created → run job again → verify no duplicate
    - _Requirements: 3.2, 3.5, 4.1, 6.1_
  
  - [ ]* 13.3 Write end-to-end test for opt-out flow
    - Create appointment → send reminder → patient opts out → create another appointment → run reminder job → verify no email sent
    - _Requirements: 11.2, 11.3_
  
  - [ ]* 13.4 Write end-to-end test for status transition flow
    - Create appointment → confirm → complete → verify all transitions succeed
    - _Requirements: 2.2, 2.3_

- [ ] 14. Final checkpoint - Verify all functionality
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The next migration will be 0014_appointment_reminders.sql
- Existing reminderJob.ts will be modified, not created from scratch
- TypeScript is the implementation language for all backend code
