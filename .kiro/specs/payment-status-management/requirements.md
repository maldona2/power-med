# Requirements Document

## Introduction

This feature adds payment status management capabilities to the medical appointment system. Currently, the appointment detail view (AppointmentDetailPanel) displays treatment and payment information but does not allow updating the payment status. Additionally, the patient detail page lacks payment information entirely. This feature will enable users to update payment status from the appointment detail view and display comprehensive payment information on the patient detail page.

## Glossary

- **Appointment_Detail_Panel**: The right-side panel component that displays detailed information about a selected appointment in the list view
- **Appointment_Detail_Sheet**: The modal sheet component that displays appointment information in the calendar view
- **Patient_Detail_Page**: The page that displays comprehensive information about a specific patient, including appointments and medical history
- **Payment_Status**: An enumerated field with values: unpaid, paid, partial, refunded
- **Payment_History**: A collection of appointments with their associated payment information for a specific patient
- **System**: The medical appointment management application

## Requirements

### Requirement 1: Update Payment Status from Appointment Detail Panel

**User Story:** As a clinic administrator, I want to update an appointment's payment status from the appointment detail panel, so that I can mark payments as received without navigating away from the appointments list view.

#### Acceptance Criteria

1. WHEN viewing an appointment in the Appointment_Detail_Panel, THE System SHALL display the current Payment_Status with visual indicators
2. WHEN viewing an appointment in the Appointment_Detail_Panel, THE System SHALL display interactive buttons for each Payment_Status option (unpaid, paid, partial, refunded)
3. WHEN a user clicks a Payment_Status button, THE System SHALL send an API request to update the payment status
4. WHEN the payment status update succeeds, THE System SHALL update the displayed Payment_Status without requiring a page refresh
5. WHEN the payment status update succeeds, THE System SHALL display a success notification to the user
6. WHEN the payment status update fails, THE System SHALL display an error notification and maintain the previous Payment_Status
7. WHILE a payment status update is in progress, THE System SHALL disable all Payment_Status buttons to prevent duplicate requests

### Requirement 2: Display Payment Information on Patient Detail Page

**User Story:** As a clinic administrator, I want to view payment information on the patient detail page, so that I can quickly assess a patient's payment history and outstanding balances.

#### Acceptance Criteria

1. WHEN viewing the Patient_Detail_Page, THE System SHALL display a payment summary section showing total unpaid amount
2. WHEN viewing the Patient_Detail_Page appointments tab, THE System SHALL display the Payment_Status for each appointment in the list
3. WHEN viewing the Patient_Detail_Page appointments tab, THE System SHALL display the total amount for each appointment
4. THE System SHALL use consistent visual styling for Payment_Status indicators across all views (badges with appropriate colors)
5. WHEN an appointment has no associated treatments, THE System SHALL display a total amount of zero
6. WHEN viewing the Patient_Detail_Page, THE System SHALL calculate and display the count of unpaid appointments
7. WHEN viewing the Patient_Detail_Page, THE System SHALL calculate and display the total amount in cents for all unpaid appointments

### Requirement 3: Maintain Consistency with Calendar View

**User Story:** As a clinic administrator, I want payment status management to work consistently across all views, so that I have a uniform experience regardless of which view I'm using.

#### Acceptance Criteria

1. THE Appointment_Detail_Sheet SHALL maintain existing payment status update functionality
2. THE System SHALL use identical payment status update logic in both Appointment_Detail_Panel and Appointment_Detail_Sheet
3. THE System SHALL use consistent visual styling for Payment_Status across Appointment_Detail_Panel, Appointment_Detail_Sheet, and Patient_Detail_Page
4. WHEN a payment status is updated in any view, THE System SHALL reflect the change in all other views displaying the same appointment
5. THE System SHALL use the same payment configuration (labels, colors, icons) across all components

### Requirement 4: Payment Status Visual Design

**User Story:** As a clinic administrator, I want clear visual indicators for payment status, so that I can quickly identify payment states at a glance.

#### Acceptance Criteria

1. THE System SHALL display "unpaid" status with amber/yellow color scheme
2. THE System SHALL display "paid" status with emerald/green color scheme
3. THE System SHALL display "partial" status with sky/blue color scheme
4. THE System SHALL display "refunded" status with neutral/gray color scheme
5. THE System SHALL use badge components for displaying Payment_Status in list views
6. THE System SHALL use button components for interactive Payment_Status selection
7. WHEN a Payment_Status button is active (currently selected), THE System SHALL apply distinct styling to indicate the active state
