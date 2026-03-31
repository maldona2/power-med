# Requirements Document

## Introduction

This document specifies requirements for improving the appointment status workflow and adding an automated email reminder system. Currently, appointments created by doctors default to "pending" status, which requires an additional confirmation step. This will be streamlined so doctor-created appointments are immediately confirmed. Additionally, the system will send automated email reminders to patients 24 hours before their scheduled appointments to reduce no-shows and improve patient engagement.

## Glossary

- **Appointment_Service**: The backend service responsible for creating and managing appointments
- **Status_Workflow**: The state machine governing appointment status transitions
- **Email_Reminder_Service**: The service responsible for sending appointment reminder emails
- **Doctor_Created_Appointment**: An appointment created by a user with doctor/professional role
- **Reminder_Window**: The 24-hour period before an appointment when reminders should be sent
- **Confirmed_Appointment**: An appointment with status "confirmed" that is ready to occur
- **Email_Template**: The formatted email message sent to patients as a reminder
- **Reminder_Job**: A scheduled background process that checks for appointments requiring reminders

## Requirements

### Requirement 1: Auto-Confirm Doctor-Created Appointments

**User Story:** As a doctor, I want appointments I create to be confirmed immediately, so that I don't need an extra confirmation step for appointments I schedule.

#### Acceptance Criteria

1. WHEN a doctor creates a new appointment, THE Appointment_Service SHALL set the status to "confirmed"
2. THE Appointment_Service SHALL identify doctor-created appointments by checking the user's role
3. WHEN an appointment is created with status "confirmed", THE Status_Workflow SHALL skip the pending state
4. THE Appointment_Service SHALL maintain backward compatibility for appointments created through other channels
5. WHEN an appointment status is set to "confirmed", THE Appointment_Service SHALL trigger calendar sync if enabled

### Requirement 2: Update Existing Status Workflow

**User Story:** As a system administrator, I want the status workflow to reflect the new confirmation logic, so that the system behavior is consistent and predictable.

#### Acceptance Criteria

1. THE Status_Workflow SHALL support the following status values: "confirmed", "completed", "cancelled", "no-show"
2. THE Status_Workflow SHALL allow transitions from "confirmed" to "completed", "cancelled", or "no-show"
3. THE Status_Workflow SHALL allow transitions from "completed" to "cancelled" for corrections
4. THE Status_Workflow SHALL prevent transitions from "cancelled" or "no-show" to other statuses
5. WHERE legacy appointments exist with "pending" status, THE Status_Workflow SHALL treat them as "confirmed" for reminder purposes

### Requirement 3: Identify Appointments Requiring Reminders

**User Story:** As a system, I want to identify which appointments need reminders sent, so that patients receive timely notifications.

#### Acceptance Criteria

1. THE Reminder_Job SHALL run at least once per hour to check for appointments requiring reminders
2. THE Reminder_Job SHALL identify appointments scheduled between 23 and 25 hours in the future
3. THE Reminder_Job SHALL only process appointments with status "confirmed" or "pending"
4. THE Reminder_Job SHALL exclude appointments with status "cancelled", "completed", or "no-show"
5. THE Reminder_Job SHALL track which appointments have already had reminders sent to prevent duplicates

### Requirement 4: Send Email Reminders

**User Story:** As a patient, I want to receive an email reminder 24 hours before my appointment, so that I don't forget my scheduled visit.

#### Acceptance Criteria

1. WHEN an appointment is identified for reminder, THE Email_Reminder_Service SHALL send an email to the patient's email address
2. THE Email_Template SHALL include the appointment date and time in the patient's timezone
3. THE Email_Template SHALL include the doctor's name and practice information
4. THE Email_Template SHALL include appointment location or instructions if available
5. IF the patient does not have an email address, THEN THE Email_Reminder_Service SHALL log the skipped reminder and continue processing

### Requirement 5: Email Template Content

**User Story:** As a patient, I want reminder emails to be clear and professional, so that I have all the information I need for my appointment.

#### Acceptance Criteria

1. THE Email_Template SHALL include a subject line in the format "Reminder: Appointment Tomorrow at [TIME]"
2. THE Email_Template SHALL include a greeting with the patient's first name
3. THE Email_Template SHALL include the appointment date formatted as "Day, Month Date, Year" (e.g., "Monday, January 15, 2024")
4. THE Email_Template SHALL include the appointment time formatted in 12-hour format with AM/PM
5. THE Email_Template SHALL include contact information for rescheduling or cancellation

### Requirement 6: Track Reminder Delivery Status

**User Story:** As a system administrator, I want to track which reminders were sent successfully, so that I can monitor system reliability and troubleshoot issues.

#### Acceptance Criteria

1. THE Email_Reminder_Service SHALL record the timestamp when each reminder is sent
2. THE Email_Reminder_Service SHALL record the delivery status (sent, failed, skipped)
3. WHEN an email fails to send, THE Email_Reminder_Service SHALL log the error details
4. THE Email_Reminder_Service SHALL retry failed email sends up to 3 times with exponential backoff
5. THE Email_Reminder_Service SHALL store reminder records in a dedicated database table

### Requirement 7: Handle Missing Patient Email Addresses

**User Story:** As a system, I want to gracefully handle patients without email addresses, so that the reminder process doesn't fail for other patients.

#### Acceptance Criteria

1. WHEN a patient does not have an email address, THE Email_Reminder_Service SHALL skip that appointment
2. THE Email_Reminder_Service SHALL log skipped reminders with the reason "no email address"
3. THE Email_Reminder_Service SHALL continue processing remaining appointments after a skip
4. THE Email_Reminder_Service SHALL not mark skipped appointments as having received reminders
5. WHERE an appointment is skipped due to missing email, THE System SHALL not retry that appointment

### Requirement 8: Reminder Job Scheduling

**User Story:** As a system administrator, I want the reminder job to run reliably and efficiently, so that reminders are sent consistently without performance impact.

#### Acceptance Criteria

1. THE Reminder_Job SHALL run on a fixed schedule every hour
2. THE Reminder_Job SHALL process appointments in batches of 100 to manage memory usage
3. THE Reminder_Job SHALL complete processing within 5 minutes for up to 1000 appointments
4. WHEN the Reminder_Job encounters an error, THE System SHALL log the error and continue with the next batch
5. THE Reminder_Job SHALL use database transactions to ensure reminder tracking consistency

### Requirement 9: Email Service Integration

**User Story:** As a system, I want to use a reliable email service provider, so that reminder emails are delivered successfully.

#### Acceptance Criteria

1. THE Email_Reminder_Service SHALL integrate with an SMTP service or email API provider
2. THE Email_Reminder_Service SHALL use environment variables for email service configuration
3. THE Email_Reminder_Service SHALL include proper email headers (From, Reply-To, Message-ID)
4. THE Email_Reminder_Service SHALL send emails as HTML with a plain text fallback
5. THE Email_Reminder_Service SHALL handle rate limiting from the email provider gracefully

### Requirement 10: Timezone Handling

**User Story:** As a patient, I want appointment times in reminder emails to be in my local timezone, so that I don't get confused about when to arrive.

#### Acceptance Criteria

1. THE Email_Reminder_Service SHALL format appointment times in the practice's configured timezone
2. THE Email_Template SHALL include the timezone abbreviation (e.g., "EST", "PST") with the time
3. WHEN formatting dates and times, THE Email_Reminder_Service SHALL use the appointment's scheduled_at timestamp
4. THE Email_Reminder_Service SHALL handle daylight saving time transitions correctly
5. WHERE timezone information is not available, THE Email_Reminder_Service SHALL use UTC and indicate this in the email

### Requirement 11: Reminder Opt-Out Support

**User Story:** As a patient, I want the ability to opt out of reminder emails, so that I can control the communications I receive.

#### Acceptance Criteria

1. THE Email_Template SHALL include an unsubscribe link at the bottom of the email
2. WHEN a patient clicks the unsubscribe link, THE System SHALL record their opt-out preference
3. THE Reminder_Job SHALL exclude patients who have opted out from reminder processing
4. THE System SHALL provide a way for patients to re-enable reminders through their profile
5. THE System SHALL respect opt-out preferences across all appointment reminders

### Requirement 12: Monitor Reminder System Health

**User Story:** As a system administrator, I want metrics on reminder delivery, so that I can ensure the system is working properly.

#### Acceptance Criteria

1. THE Email_Reminder_Service SHALL track the total number of reminders sent per day
2. THE Email_Reminder_Service SHALL track the success rate of email delivery
3. THE Email_Reminder_Service SHALL track the number of skipped reminders and reasons
4. THE Email_Reminder_Service SHALL expose metrics for monitoring tools
5. WHEN the success rate falls below 95%, THE System SHALL alert administrators

