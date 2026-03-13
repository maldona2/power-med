# Requirements Document

## Introduction

This feature adds real-time toast notifications for appointments scheduled on the current day. When an appointment's scheduled time arrives, a toast notification appears on screen with patient information and a quick action button to navigate directly to the patient's detail page. This enables doctors to be promptly notified when it's time to see a patient and quickly access their medical records.

## Glossary

- **Notification_Monitor**: The system component that tracks current time and compares it against today's appointment schedule
- **Toast_Notification**: A temporary UI element that appears on screen to display appointment alerts
- **Appointment**: A scheduled patient visit with a specific date, time, patient, and duration
- **Patient_Detail_Page**: The page displaying comprehensive patient information and medical records
- **Scheduled_Time**: The exact date and time when an appointment is planned to occur

## Requirements

### Requirement 1: Monitor Today's Appointments

**User Story:** As a doctor, I want the system to continuously monitor today's appointments, so that I can be notified when it's time to see a patient

#### Acceptance Criteria

1. THE Notification_Monitor SHALL retrieve all appointments scheduled for the current date
2. THE Notification_Monitor SHALL check the current time against appointment scheduled times at least once per minute
3. WHEN the current time matches an appointment's Scheduled_Time (within the same hour and minute), THE Notification_Monitor SHALL trigger a notification for that appointment
4. THE Notification_Monitor SHALL track which appointments have already triggered notifications to prevent duplicate alerts
5. WHEN the date changes to a new day, THE Notification_Monitor SHALL reset the notification tracking state

### Requirement 2: Display Toast Notification

**User Story:** As a doctor, I want to see a toast notification when an appointment time arrives, so that I am immediately aware without checking the schedule manually

#### Acceptance Criteria

1. WHEN an appointment notification is triggered, THE Toast_Notification SHALL display on screen using the Sonner toast library
2. THE Toast_Notification SHALL include the patient's first name and last name
3. THE Toast_Notification SHALL include the appointment's Scheduled_Time
4. THE Toast_Notification SHALL remain visible until dismissed by the user or after a reasonable duration
5. WHERE multiple appointments are scheduled at the same time, THE Toast_Notification SHALL display a separate notification for each appointment

### Requirement 3: Navigate to Patient Detail

**User Story:** As a doctor, I want to click a button in the notification to go directly to the patient's detail page, so that I can quickly access their medical records and write notes

#### Acceptance Criteria

1. THE Toast_Notification SHALL include an action button labeled for navigation to the patient details
2. WHEN the action button is clicked, THE System SHALL navigate to the Patient_Detail_Page for that specific patient
3. THE Patient_Detail_Page route SHALL use the format /app/patients/:id where :id is the patient_id from the appointment
4. WHEN navigation occurs, THE Toast_Notification SHALL be dismissed automatically

### Requirement 4: Handle Appointment Status Changes

**User Story:** As a doctor, I want notifications only for relevant appointments, so that I'm not alerted about cancelled or completed appointments

#### Acceptance Criteria

1. THE Notification_Monitor SHALL only trigger notifications for appointments with status "scheduled" or "confirmed"
2. THE Notification_Monitor SHALL exclude appointments with status "cancelled", "completed", or "no-show"
3. WHEN an appointment's status changes after a notification has been triggered, THE System SHALL not retroactively dismiss the notification

### Requirement 5: Handle Time Precision

**User Story:** As a doctor, I want notifications to appear at the exact scheduled time, so that I can maintain an accurate schedule

#### Acceptance Criteria

1. THE Notification_Monitor SHALL compare time at minute-level precision (hour and minute only, ignoring seconds)
2. WHEN the current time is 17:00 and an appointment is scheduled at 17:00, THE Notification_Monitor SHALL trigger the notification
3. THE Notification_Monitor SHALL trigger each appointment notification exactly once per day
4. WHEN the application is loaded after an appointment's Scheduled_Time has passed, THE Notification_Monitor SHALL not trigger a notification for that past appointment

### Requirement 6: Maintain Application Performance

**User Story:** As a user, I want the notification system to run efficiently, so that it doesn't slow down the application

#### Acceptance Criteria

1. THE Notification_Monitor SHALL use efficient time-checking mechanisms that do not cause performance degradation
2. THE Notification_Monitor SHALL only process appointments for the current date
3. WHEN no appointments are scheduled for the current date, THE Notification_Monitor SHALL continue monitoring with minimal resource usage
