# Implementation Plan: Patient Actions Menu

## Overview

This implementation replaces the hover-only edit button in PatientsPage with a comprehensive actions menu containing View, Edit, and Delete options. The implementation uses existing Radix UI components (DropdownMenu, Dialog) and maintains backward compatibility with existing functionality.

## Tasks

- [x] 1. Create PatientActionsMenu component with dropdown structure
  - Create `frontend/src/components/patients/PatientActionsMenu.tsx`
  - Implement component with DropdownMenu from `@/components/ui/dropdown-menu`
  - Add DropdownMenuTrigger with MoreVertical icon (always visible)
  - Add DropdownMenuContent with three items: View (Eye icon), Edit (Pencil icon), Delete (Trash icon, destructive variant)
  - Implement props interface: `patient: Patient` and `onEdit: (patient: Patient) => void`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.3, 3.3, 4.7, 4.8, 4.9_

- [ ]* 1.1 Write property test for menu structure
  - **Property 1: Menu displays three action options**
  - **Validates: Requirements 1.3**

- [x] 2. Implement View action navigation
  - Add `useNavigate` hook from react-router-dom
  - Implement View menu item click handler to navigate to `/app/patients/{patient.id}`
  - Ensure menu closes after navigation
  - _Requirements: 2.1, 2.2, 2.4_

- [ ]* 2.1 Write property test for View action navigation
  - **Property 2: View action navigates to correct route**
  - **Validates: Requirements 2.1, 2.2**

- [x] 3. Implement Edit action with callback
  - Implement Edit menu item click handler to call `onEdit(patient)`
  - Ensure menu closes after action
  - _Requirements: 3.1, 3.2, 3.4_

- [ ]* 3.1 Write property test for Edit action dialog
  - **Property 3: Edit action opens dialog with patient data**
  - **Validates: Requirements 3.1, 3.2**

- [x] 4. Create DeleteConfirmationDialog component
  - Create `frontend/src/components/patients/DeleteConfirmationDialog.tsx`
  - Implement Dialog component from `@/components/ui/dialog`
  - Add DialogHeader with title and patient name in description
  - Add warning text about permanence of deletion
  - Add DialogFooter with Cancel and Confirm buttons
  - Implement props interface: `open`, `onOpenChange`, `patientName`, `onConfirm`, `loading`
  - Handle loading state with disabled confirm button and loading spinner
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 4.1 Write unit tests for DeleteConfirmationDialog
  - Test dialog displays patient name
  - Test dialog shows warning text
  - Test cancel button closes dialog
  - Test confirm button calls onConfirm callback
  - Test loading state disables confirm button
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 5. Implement Delete action with API integration
  - Add state management for delete dialog: `deleteDialogOpen`, `isDeleting`
  - Implement Delete menu item click handler to open confirmation dialog
  - Implement delete confirmation handler to call DELETE `/patients/:id` using `api` from `@/lib/api`
  - Handle successful deletion: refetch patient list, show success toast, close dialog
  - Handle failed deletion: show error toast with message, keep dialog open
  - Use `toast` from `sonner` for notifications
  - _Requirements: 4.4, 4.5, 4.6_

- [ ]* 5.1 Write property test for successful deletion
  - **Property 5: Successful deletion triggers refetch and toast**
  - **Validates: Requirements 4.4, 4.5**

- [ ]* 5.2 Write property test for failed deletion
  - **Property 6: Failed deletion shows error toast**
  - **Validates: Requirements 4.6**

- [x] 6. Checkpoint - Ensure PatientActionsMenu component is complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Integrate PatientActionsMenu into PatientsPage
  - Open `frontend/src/pages/PatientsPage.tsx`
  - Replace hover-only edit button in actions column with PatientActionsMenu component
  - Pass `patient` and `onEdit` props to PatientActionsMenu
  - Ensure existing edit dialog functionality works with new menu
  - _Requirements: 6.4_

- [ ]* 7.1 Write unit tests for PatientsPage integration
  - Test PatientActionsMenu renders in actions column
  - Test hover-only edit button is removed
  - Test patient name link still works
  - Test table sorting still works
  - Test "Nuevo paciente" button still works
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 8. Implement accessibility features
  - Add descriptive aria-label to menu trigger button including patient name
  - Verify keyboard navigation works (Tab, Enter, Space, Arrow keys, Escape)
  - Ensure focus indicators are visible on all interactive elements
  - Test with keyboard-only navigation
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ]* 8.1 Write property test for aria-label
  - **Property 7: Menu trigger has descriptive aria-label**
  - **Validates: Requirements 5.5, 5.6**

- [ ]* 8.2 Write unit tests for keyboard navigation
  - Test Tab focuses menu trigger
  - Test Enter/Space opens menu
  - Test Arrow keys navigate menu items
  - Test Escape closes menu
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 9. Final checkpoint - Ensure all functionality works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation uses TypeScript and React with existing Radix UI components
- Property tests should use `@fast-check/vitest` with minimum 100 iterations
- All existing PatientsPage functionality must remain intact (backward compatibility)
