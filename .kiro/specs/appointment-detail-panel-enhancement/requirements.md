# Requirements Document

## Introduction

This feature enhances the AppointmentDetailPanel component to become the central hub for doctors during appointments. Currently, doctors need to navigate between AppointmentsPage, AppointmentDetailPanel, and PatientDetailPage to access complete patient information. This enhancement consolidates all relevant patient data into a single, comprehensive, scrollable panel that displays previous sessions, payment information, treatment plans, and next appointment recommendations.

## Glossary

- **AppointmentDetailPanel**: The right-side panel component that displays detailed information about a selected appointment
- **Session**: A completed appointment with documentation including procedures performed, recommendations, and photos
- **Treatment_Plan**: A patient's assigned treatment with session count and frequency information
- **Payment_History**: A chronological record of all payment transactions for a patient's appointments
- **Next_Appointment_Recommendation**: A calculated date suggestion based on the selected treatment plan's recommended frequency

## Requirements

### Requirement 1: Display Previous Sessions History

**User Story:** As a doctor, I want to view all previous sessions with complete information in the appointment detail panel, so that I can review the patient's treatment history without navigating away.

#### Acceptance Criteria

1. WHEN an appointment is selected, THE AppointmentDetailPanel SHALL display all previous sessions for that patient in reverse chronological order
2. FOR EACH previous session, THE AppointmentDetailPanel SHALL display the session date, procedures performed, recommendations, and associated photos
3. WHEN a previous session has no photos, THE AppointmentDetailPanel SHALL display the session without a photo section
4. THE AppointmentDetailPanel SHALL exclude the current session from the previous sessions list
5. WHEN there are no previous sessions, THE AppointmentDetailPanel SHALL display a message indicating no previous history exists

### Requirement 2: Show Next Appointment Recommendation

**User Story:** As a doctor, I want to see the recommended next appointment date based on the treatment plan, so that I can schedule follow-ups appropriately.

#### Acceptance Criteria

1. WHEN a patient has an active treatment plan, THE AppointmentDetailPanel SHALL calculate and display the next recommended appointment date
2. THE Next_Appointment_Recommendation SHALL be calculated based on the treatment plan's recommended frequency and the current appointment date
3. WHEN a patient has multiple active treatment plans, THE AppointmentDetailPanel SHALL display the next recommendation for each treatment plan
4. WHEN a patient has no active treatment plans, THE AppointmentDetailPanel SHALL not display a next appointment recommendation section
5. THE AppointmentDetailPanel SHALL display the treatment name alongside each next appointment recommendation

### Requirement 3: Display Comprehensive Payment Information

**User Story:** As a doctor, I want to view complete payment information for the patient, so that I can understand their payment status and history without leaving the appointment panel.

#### Acceptance Criteria

1. THE AppointmentDetailPanel SHALL display the current appointment's payment status and total amount
2. THE AppointmentDetailPanel SHALL display a summary of unpaid appointments including count and total amount owed
3. THE AppointmentDetailPanel SHALL display the complete payment history for the patient in reverse chronological order
4. FOR EACH payment history entry, THE AppointmentDetailPanel SHALL display the date, appointment reference, amount, and payment status
5. WHEN a patient has no payment history, THE AppointmentDetailPanel SHALL display a message indicating no payment history exists
6. THE AppointmentDetailPanel SHALL allow updating the current appointment's payment status directly from the panel

### Requirement 4: Consolidate Patient Information Access

**User Story:** As a doctor, I want all patient information accessible in one scrollable view, so that I can efficiently review everything during an appointment without navigating between pages.

#### Acceptance Criteria

1. THE AppointmentDetailPanel SHALL display patient contact information including phone, email, and date of birth
2. THE AppointmentDetailPanel SHALL display patient notes if they exist
3. THE AppointmentDetailPanel SHALL display all active treatment plans with session progress
4. THE AppointmentDetailPanel SHALL display medical history including conditions, medications, and allergies
5. THE AppointmentDetailPanel SHALL organize all information sections in a logical, scrollable layout
6. WHEN any information section is empty, THE AppointmentDetailPanel SHALL display an appropriate empty state message

### Requirement 5: Maintain Existing Functionality

**User Story:** As a doctor, I want all current appointment panel features to continue working, so that the enhancement doesn't disrupt my existing workflow.

#### Acceptance Criteria

1. THE AppointmentDetailPanel SHALL continue to display the appointment header with date, time, and patient name
2. THE AppointmentDetailPanel SHALL continue to support session documentation with procedures and recommendations
3. THE AppointmentDetailPanel SHALL continue to support photo upload for the current session
4. THE AppointmentDetailPanel SHALL continue to display treatment information for the current appointment
5. THE AppointmentDetailPanel SHALL continue to display the medical history section for the current patient
6. THE AppointmentDetailPanel SHALL maintain responsive design for mobile and desktop views

### Requirement 6: Performance and Loading States

**User Story:** As a doctor, I want the enhanced panel to load efficiently, so that I can access patient information quickly during appointments.

#### Acceptance Criteria

1. WHEN loading appointment details, THE AppointmentDetailPanel SHALL display loading skeletons for each information section
2. THE AppointmentDetailPanel SHALL load previous sessions data asynchronously without blocking other panel sections
3. THE AppointmentDetailPanel SHALL load payment history data asynchronously without blocking other panel sections
4. WHEN an API request fails, THE AppointmentDetailPanel SHALL display an error message with a retry option for that specific section
5. THE AppointmentDetailPanel SHALL cache loaded data to avoid redundant API calls when the same appointment is reselected
