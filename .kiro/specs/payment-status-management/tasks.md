# Implementation Plan: Payment Status Management

## Overview

This implementation adds payment status management capabilities to the medical appointment system. The work involves three main areas: extracting shared payment configuration, enhancing the appointment detail panel with interactive payment status updates, and adding payment information display to the patient detail page. The implementation follows existing patterns from AppointmentDetailSheet and maintains consistency across all views.

## Tasks

- [ ] 1. Create shared payment configuration
  - Create `frontend/src/components/appointments/constants.ts` file
  - Export `PaymentStatus` type and `paymentConfig` object with labels and className for all four payment statuses (unpaid, paid, partial, refunded)
  - Ensure configuration matches design specifications for colors and labels
  - _Requirements: 2.4, 3.3, 3.5, 4.1, 4.2, 4.3, 4.4_

- [ ]* 1.1 Write property test for payment configuration consistency
  - **Property 7: Consistent payment configuration**
  - **Validates: Requirements 2.4, 3.3, 3.5**
  - Test that all payment statuses have required config properties (label, className)
  - Test that config is accessible and properly typed

- [ ] 2. Enhance TreatmentInfoSection component for interactive mode
  - [ ] 2.1 Update TreatmentInfoSection props interface
    - Add optional `onPaymentChange?: (newStatus: PaymentStatus) => Promise<void>` prop
    - Add optional `isUpdating?: boolean` prop
    - Import `PaymentStatus` type and `paymentConfig` from constants
    - _Requirements: 1.1, 1.2, 1.7_

  - [ ] 2.2 Implement conditional rendering logic
    - When `onPaymentChange` is provided, render interactive payment status buttons
    - When `onPaymentChange` is undefined, render read-only badge (preserve existing behavior)
    - Apply active styling to button matching current `paymentStatus`
    - Disable all buttons when `isUpdating` is true
    - _Requirements: 1.1, 1.2, 1.7, 4.7_

  - [ ]* 2.3 Write unit tests for TreatmentInfoSection
    - Test read-only mode renders badge correctly
    - Test interactive mode renders buttons correctly
    - Test buttons are disabled when isUpdating=true
    - Test active button styling
    - Test all four payment status options render

- [ ] 3. Add payment status update functionality to AppointmentDetailPanel
  - [ ] 3.1 Add state management for payment updates
    - Add `activePayment` state initialized from `detail?.payment_status ?? 'unpaid'`
    - Add `isUpdating` state initialized to false
    - Sync `activePayment` when `detail` changes
    - _Requirements: 1.3, 1.4, 1.7_

  - [ ] 3.2 Implement handlePaymentChange function
    - Set `isUpdating` to true at start
    - Make PUT request to `/appointments/${detail.id}` with `payment_status` in body
    - On success: update `activePayment` state, call `refetch()`, show success toast
    - On error: show error toast, maintain previous payment status
    - Set `isUpdating` to false in finally block
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ] 3.3 Wire TreatmentInfoSection with payment update props
    - Pass `onPaymentChange={handlePaymentChange}` to TreatmentInfoSection
    - Pass `isUpdating={isUpdating}` to TreatmentInfoSection
    - Pass `paymentStatus={activePayment}` to TreatmentInfoSection
    - _Requirements: 1.2, 1.3, 1.7_

  - [ ]* 3.4 Write property test for payment update API call
    - **Property 1: Payment status update triggers API call**
    - **Validates: Requirements 1.3**
    - Test that clicking payment button triggers PUT request with correct payment_status

  - [ ]* 3.5 Write property test for successful update UI reflection
    - **Property 2: Successful payment update reflects in UI**
    - **Validates: Requirements 1.4, 1.5**
    - Test that successful API response updates UI and shows success toast

  - [ ]* 3.6 Write property test for failed update state preservation
    - **Property 3: Failed payment update preserves state**
    - **Validates: Requirements 1.6**
    - Test that failed API call shows error toast and preserves previous payment status

  - [ ]* 3.7 Write property test for concurrent request prevention
    - **Property 4: Payment update prevents concurrent requests**
    - **Validates: Requirements 1.7**
    - Test that buttons are disabled during API call

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Add payment information display to PatientDetailPage
  - [ ] 5.1 Import payment configuration and calculate unpaid metrics
    - Import `paymentConfig` from constants
    - Calculate `unpaidAppointments` by filtering appointments where `payment_status === 'unpaid'`
    - Calculate `unpaidCount` as length of unpaidAppointments array
    - Calculate `unpaidTotalCents` by summing `total_amount_cents` of unpaid appointments (handle null values)
    - _Requirements: 2.1, 2.6, 2.7_

  - [ ] 5.2 Add payment summary card above appointments tab
    - Create Card component with "Resumen de pagos" title
    - Display unpaid count with Badge component
    - Display total owed formatted as currency (cents to dollars)
    - _Requirements: 2.1, 2.6, 2.7_

  - [ ] 5.3 Enhance appointments list with payment information
    - Add payment status Badge to each appointment in the list using `paymentConfig` for styling
    - Display total amount for each appointment formatted as currency
    - Handle null `total_amount_cents` by displaying "$0.00"
    - _Requirements: 2.2, 2.3, 2.5_

  - [ ]* 5.4 Write property test for unpaid calculation accuracy
    - **Property 5: Unpaid appointments calculation accuracy**
    - **Validates: Requirements 2.1, 2.6, 2.7**
    - Test that unpaid count and total match filter and reduce operations across various appointment arrays

  - [ ]* 5.5 Write unit tests for PatientDetailPage payment calculations
    - Test unpaid appointments filtering
    - Test unpaid count calculation
    - Test unpaid total calculation with null values
    - Test zero appointments edge case

  - [ ]* 5.6 Write property test for appointment list payment display
    - **Property 6: Appointment list displays payment information**
    - **Validates: Requirements 2.2, 2.3**
    - Test that each appointment displays payment status badge and total amount

- [ ] 6. Verify consistency across all views
  - [ ] 6.1 Update AppointmentDetailSheet to use shared payment configuration
    - Replace inline payment config with import from constants
    - Verify existing payment update functionality still works
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [ ]* 6.2 Write property test for payment update logic consistency
    - **Property 8: Payment status update logic consistency**
    - **Validates: Requirements 3.2**
    - Test that AppointmentDetailPanel and AppointmentDetailSheet use identical API patterns

  - [ ]* 6.3 Write integration test for cross-view data synchronization
    - **Property 9: Cross-view data synchronization**
    - **Validates: Requirements 3.4**
    - Test that payment status updates reflect across all views after refetch

  - [ ]* 6.4 Write property test for active button styling
    - **Property 10: Active payment button styling**
    - **Validates: Requirements 4.7**
    - Test that button matching current payment_status has active styling

- [ ] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests should use fast-check library with minimum 100 iterations
- Unit tests should use Vitest and React Testing Library
- All components should maintain backward compatibility
- Dark mode styling should be tested manually
- Responsive design should be verified on mobile devices
