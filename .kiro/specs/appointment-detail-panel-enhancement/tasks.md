# Implementation Plan: Appointment Detail Panel Enhancement

## Overview

This implementation plan breaks down the appointment detail panel enhancement into discrete coding tasks. The feature adds four major sections to the panel: previous sessions history, next appointment recommendations, payment history, and enhanced patient information. The implementation follows a bottom-up approach, starting with backend API endpoints, then React hooks, then UI components, and finally integration.

## Tasks

- [ ] 1. Create backend API endpoint for payment history
  - [ ] 1.1 Implement GET /patients/:id/payment-history endpoint
    - Create route handler in backend/src/routes/patients.ts
    - Implement database query to fetch appointment payment data
    - Return payment history entries and summary in response
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 1.2 Write unit tests for payment history endpoint
    - Test successful data retrieval
    - Test empty payment history case
    - Test invalid patient ID handling
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 2. Create React hooks for data fetching
  - [ ] 2.1 Implement usePatientSessions hook
    - Create hook in frontend/src/hooks/usePatientSessions.ts
    - Implement API call to /patients/:id/sessions
    - Handle loading, error, and data states
    - Support exclude_session_id parameter
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [ ]* 2.2 Write property test for usePatientSessions
    - **Property 3: Current session exclusion**
    - **Validates: Requirements 1.4**
  
  - [ ] 2.3 Implement usePaymentHistory hook
    - Create hook in frontend/src/hooks/usePaymentHistory.ts
    - Implement API call to /patients/:id/payment-history
    - Handle loading, error, and data states
    - Return history array and summary object
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 2.4 Write property test for usePaymentHistory
    - **Property 7: Payment summary accuracy**
    - **Validates: Requirements 3.2**
  
  - [ ]* 2.5 Write unit tests for hooks
    - Test error handling and retry logic
    - Test loading state transitions
    - Test data caching behavior
    - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement PreviousSessionsSection component
  - [ ] 4.1 Create PreviousSessionsSection component
    - Create component in frontend/src/components/appointments/PreviousSessionsSection.tsx
    - Use usePatientSessions hook for data
    - Render sessions in reverse chronological order
    - Display session date, procedures, recommendations
    - Display photos in horizontal scrollable gallery
    - Implement loading skeleton
    - Implement error state with retry button
    - Implement empty state message
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.2, 6.4_
  
  - [ ]* 4.2 Write property test for PreviousSessionsSection
    - **Property 1: Previous sessions chronological ordering**
    - **Validates: Requirements 1.1**
  
  - [ ]* 4.3 Write property test for session data completeness
    - **Property 2: Session data completeness**
    - **Validates: Requirements 1.2, 3.4, 4.1, 4.2, 4.3, 4.4**
  
  - [ ]* 4.4 Write unit tests for PreviousSessionsSection
    - Test empty sessions array rendering
    - Test sessions with and without photos
    - Test error state rendering
    - Test retry button functionality
    - _Requirements: 1.3, 1.5, 6.4_

- [ ] 5. Implement NextAppointmentSection component
  - [ ] 5.1 Create calculateNextAppointment utility function
    - Create function in frontend/src/utils/appointmentCalculations.ts
    - Implement date calculation logic based on treatment frequency
    - Handle initial vs maintenance phase logic
    - Return null for treatments without frequency data
    - _Requirements: 2.1, 2.2_
  
  - [ ]* 5.2 Write property test for calculateNextAppointment
    - **Property 4: Next appointment calculation accuracy**
    - **Validates: Requirements 2.1, 2.2**
  
  - [ ] 5.3 Create NextAppointmentSection component
    - Create component in frontend/src/components/appointments/NextAppointmentSection.tsx
    - Use usePatientTreatments hook for data
    - Filter for active treatments only
    - Calculate next appointment for each active treatment
    - Display treatment name and recommended date
    - Hide section when no active treatments
    - Implement loading skeleton
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1_
  
  - [ ]* 5.4 Write property test for multiple treatment recommendations
    - **Property 5: Multiple treatment recommendations**
    - **Validates: Requirements 2.3**
  
  - [ ]* 5.5 Write property test for treatment name display
    - **Property 6: Treatment name in recommendations**
    - **Validates: Requirements 2.5**
  
  - [ ]* 5.6 Write unit tests for NextAppointmentSection
    - Test with no active treatments
    - Test with single active treatment
    - Test with multiple active treatments
    - Test initial vs maintenance phase calculations
    - _Requirements: 2.3, 2.4_

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement PaymentHistorySection component
  - [ ] 7.1 Create PaymentHistorySection component
    - Create component in frontend/src/components/appointments/PaymentHistorySection.tsx
    - Use usePaymentHistory hook for data
    - Display payment summary card with unpaid count and total
    - Display payment history entries in reverse chronological order
    - Display date, procedures, amount, payment status badge for each entry
    - Implement loading skeleton
    - Implement error state with retry button
    - Implement empty state message
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.3, 6.4_
  
  - [ ]* 7.2 Write property test for payment history ordering
    - **Property 8: Payment history chronological ordering**
    - **Validates: Requirements 3.3**
  
  - [ ]* 7.3 Write unit tests for PaymentHistorySection
    - Test empty payment history rendering
    - Test summary card display logic
    - Test payment status badge rendering
    - Test amount formatting (cents to dollars)
    - _Requirements: 3.5_

- [ ] 8. Enhance PatientInfoSection component
  - [ ] 8.1 Update PatientInfoSection to display additional patient data
    - Modify component in frontend/src/components/appointments/PatientInfoSection.tsx
    - Add phone number display (if available)
    - Add email display (if available)
    - Add date of birth display (if available)
    - Add patient notes display (if available)
    - Maintain existing patient name display
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 8.2 Write unit tests for enhanced PatientInfoSection
    - Test with all fields present
    - Test with missing optional fields
    - Test null/undefined handling
    - _Requirements: 4.1, 4.2_

- [ ] 9. Integrate new sections into AppointmentDetailPanel
  - [ ] 9.1 Update AppointmentDetailPanel component
    - Modify component in frontend/src/components/appointments/AppointmentDetailPanel.tsx
    - Import and add PreviousSessionsSection component
    - Import and add NextAppointmentSection component
    - Import and add PaymentHistorySection component
    - Position sections in logical order within ScrollArea
    - Pass required props (patientId, appointmentId, etc.)
    - Ensure all existing sections remain functional
    - _Requirements: 1.1, 2.1, 3.1, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 9.2 Write property test for backward compatibility
    - **Property 10: Backward compatibility**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
  
  - [ ]* 9.3 Write property test for data caching behavior
    - **Property 11: Data caching behavior**
    - **Validates: Requirements 6.5**
  
  - [ ]* 9.4 Write integration tests for AppointmentDetailPanel
    - Test complete panel rendering with all sections
    - Test async data loading for multiple sections
    - Test error recovery in individual sections
    - Test scroll behavior with all sections present
    - _Requirements: 4.5, 6.2, 6.3, 6.4_

- [ ] 10. Add payment status update functionality
  - [ ] 10.1 Implement payment status update in PaymentHistorySection
    - Add payment status update button/dropdown to current appointment
    - Implement API call to update payment status
    - Refresh payment history after successful update
    - Handle update errors with user feedback
    - _Requirements: 3.6_
  
  - [ ]* 10.2 Write property test for payment status update propagation
    - **Property 9: Payment status update propagation**
    - **Validates: Requirements 3.6**
  
  - [ ]* 10.3 Write unit tests for payment status update
    - Test successful status update
    - Test API error handling
    - Test optimistic UI updates
    - _Requirements: 3.6_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript for type safety
- All new components follow existing UI patterns (Card, CardHeader, CardContent, Skeleton)
- Error handling is consistent across all new sections
- Loading states use skeleton loaders matching existing patterns
