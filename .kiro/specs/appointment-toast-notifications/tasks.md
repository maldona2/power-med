# Implementation Plan: Appointment Toast Notifications

## Overview

This implementation creates a custom React hook that monitors today's appointments and displays toast notifications when appointment times arrive. The hook uses a 60-second polling interval to check the current time against scheduled appointments, maintains state to prevent duplicate notifications, and integrates with the Sonner toast library to display patient information with quick navigation actions.

## Tasks

- [x] 1. Create the useAppointmentNotifications hook with core structure
  - Create file `frontend/src/hooks/useAppointmentNotifications.ts`
  - Import dependencies: useAppointments, toast from sonner, useNavigate, useEffect, useRef
  - Define the hook function signature with void return type
  - Set up refs for tracking notified appointment IDs (Set) and current date
  - _Requirements: 1.1, 1.4, 1.5, 6.1_

- [x] 2. Implement appointment fetching and filtering logic
  - [x] 2.1 Fetch today's appointments using useAppointments hook
    - Get current date in YYYY-MM-DD format
    - Pass date filter to useAppointments
    - Filter appointments by status ("scheduled" or "confirmed" only)
    - _Requirements: 1.1, 4.1, 4.2, 6.2_
  
  - [ ]* 2.2 Write property test for today's appointments filtering
    - **Property 1: Today's Appointments Only**
    - **Validates: Requirements 1.1**
  
  - [ ]* 2.3 Write property test for status filtering
    - **Property 9: Status Filtering**
    - **Validates: Requirements 4.1, 4.2**

- [x] 3. Implement time-checking interval and notification logic
  - [x] 3.1 Set up 60-second interval with setInterval
    - Create interval that runs every 60000ms
    - Extract current hour and minute from Date object
    - Implement cleanup function to clear interval on unmount
    - _Requirements: 1.2, 6.1_
  
  - [x] 3.2 Implement time matching and notification triggering
    - Parse appointment scheduled_at to extract hour and minute
    - Compare current time with appointment time (minute precision)
    - Check if appointment ID is in notified Set
    - Add appointment ID to Set when notification triggered
    - Handle time parsing errors gracefully with try-catch
    - _Requirements: 1.3, 1.4, 5.1, 5.2_
  
  - [ ]* 3.3 Write property test for time match triggering
    - **Property 2: Time Match Triggers Notification**
    - **Validates: Requirements 1.3, 5.1**
  
  - [ ]* 3.4 Write property test for duplicate prevention
    - **Property 3: No Duplicate Notifications**
    - **Validates: Requirements 1.4**
  
  - [ ]* 3.5 Write property test for past appointments
    - **Property 10: No Past Appointment Notifications**
    - **Validates: Requirements 5.4**

- [x] 4. Implement toast notification content and formatting
  - [x] 4.1 Create toast notification with patient information
    - Format patient name from first_name and last_name
    - Handle missing patient names with fallback text
    - Format scheduled time in "h:mm a" format (e.g., "2:30 PM")
    - Call toast() with title "Appointment Time" and formatted description
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 4.2 Add action button with navigation
    - Add action property to toast with label "View Patient"
    - Implement onClick handler using navigate to /app/patients/:patient_id
    - Handle missing patient_id gracefully (omit action if missing)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 4.3 Write property test for toast content validation
    - **Property 4: Toast Contains Patient Name**
    - **Validates: Requirements 2.2**
  
  - [ ]* 4.4 Write property test for scheduled time in toast
    - **Property 5: Toast Contains Scheduled Time**
    - **Validates: Requirements 2.3**
  
  - [ ]* 4.5 Write property test for action button presence
    - **Property 7: Toast Includes Action Button**
    - **Validates: Requirements 3.1**
  
  - [ ]* 4.6 Write property test for navigation URL format
    - **Property 8: Navigation URL Format**
    - **Validates: Requirements 3.2, 3.3**

- [x] 5. Implement date change detection and state reset
  - [x] 5.1 Add date change detection in interval
    - Compare current date with stored date ref on each interval tick
    - Clear notified Set when date changes
    - Update date ref to new current date
    - _Requirements: 1.5_
  
  - [ ]* 5.2 Write unit tests for date change logic
    - Test that notified Set is cleared on date change
    - Test that date ref is updated correctly
    - Mock date changes using jest.useFakeTimers

- [x] 6. Handle multiple simultaneous appointments
  - [x] 6.1 Ensure loop processes all matching appointments
    - Iterate through all filtered appointments in interval
    - Trigger separate toast for each matching appointment
    - Verify each appointment gets its own notification
    - _Requirements: 2.5_
  
  - [ ]* 6.2 Write property test for multiple simultaneous appointments
    - **Property 6: Multiple Simultaneous Appointments**
    - **Validates: Requirements 2.5**

- [x] 7. Integrate hook at application root level
  - [x] 7.1 Add hook to main application component
    - Import useAppointmentNotifications in App.tsx or AppLayout component
    - Call hook once at root level (no parameters, no return value)
    - Verify Sonner Toaster component is already present in the app
    - _Requirements: 2.1_
  
  - [ ]* 7.2 Write integration test for full notification flow
    - Mock useAppointments to return test appointments
    - Fast-forward time to appointment time
    - Verify toast is called with correct content
    - Verify navigation works when action button clicked

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

