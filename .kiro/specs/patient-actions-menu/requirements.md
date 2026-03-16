# Requirements Document

## Introduction

This feature enhances the PatientsPage by replacing the current hover-only edit button with a comprehensive actions menu. The menu will provide three distinct actions: view patient details, edit patient information, and delete patient records. This improvement addresses the need for better discoverability and accessibility of patient management actions.

## Glossary

- **Actions_Menu**: A dropdown menu component that displays available actions for a patient record
- **PatientsPage**: The main page displaying the list of all patients in a table format
- **Patient_Record**: A single row in the patients table representing one patient
- **View_Action**: Navigation to the patient detail page to view full patient information
- **Edit_Action**: Opens a dialog to modify patient information
- **Delete_Action**: Removes a patient record from the system after confirmation

## Requirements

### Requirement 1: Actions Menu Display

**User Story:** As a user, I want to see an actions menu button for each patient, so that I can easily access available actions without relying on hover states.

#### Acceptance Criteria

1. THE Actions_Menu SHALL display a menu trigger button in the actions column for each Patient_Record
2. THE Actions_Menu trigger button SHALL be visible at all times without requiring hover interaction
3. WHEN the Actions_Menu trigger button is clicked, THE Actions_Menu SHALL display a dropdown with three options: View, Edit, and Delete
4. THE Actions_Menu SHALL use appropriate icons for each action option
5. THE Actions_Menu SHALL close when an action is selected or when clicking outside the menu

### Requirement 2: View Patient Action

**User Story:** As a user, I want to view patient details from the actions menu, so that I can access patient information through a consistent interface.

#### Acceptance Criteria

1. WHEN the View option is selected from the Actions_Menu, THE PatientsPage SHALL navigate to the patient detail page
2. THE View_Action SHALL navigate to the route `/app/patients/{patient_id}`
3. THE View_Action SHALL use an eye icon to indicate its purpose
4. THE View_Action SHALL be the first option in the Actions_Menu

### Requirement 3: Edit Patient Action

**User Story:** As a user, I want to edit patient information from the actions menu, so that I can modify patient details efficiently.

#### Acceptance Criteria

1. WHEN the Edit option is selected from the Actions_Menu, THE PatientsPage SHALL open the patient edit dialog
2. THE Edit_Action SHALL pre-populate the dialog with the selected patient's current information
3. THE Edit_Action SHALL use a pencil icon to indicate its purpose
4. THE Edit_Action SHALL be the second option in the Actions_Menu
5. WHEN the edit dialog is submitted successfully, THE PatientsPage SHALL refresh the patient list and display a success toast notification

### Requirement 4: Delete Patient Action

**User Story:** As a user, I want to delete patient records from the actions menu, so that I can remove outdated or incorrect patient information.

#### Acceptance Criteria

1. WHEN the Delete option is selected from the Actions_Menu, THE PatientsPage SHALL display a confirmation dialog
2. THE confirmation dialog SHALL clearly state the patient name being deleted
3. THE confirmation dialog SHALL warn about the permanence of the deletion
4. WHEN the user confirms deletion, THE PatientsPage SHALL send a DELETE request to the backend API
5. WHEN deletion succeeds, THE PatientsPage SHALL refresh the patient list and display a success toast notification
6. IF deletion fails, THEN THE PatientsPage SHALL display an error toast notification with the failure reason
7. THE Delete_Action SHALL use a trash icon to indicate its purpose
8. THE Delete_Action SHALL be the third option in the Actions_Menu
9. THE Delete_Action SHALL use destructive styling to indicate the dangerous nature of the action

### Requirement 5: Accessibility and Keyboard Navigation

**User Story:** As a user relying on keyboard navigation, I want to access the actions menu using keyboard controls, so that I can manage patients without a mouse.

#### Acceptance Criteria

1. THE Actions_Menu trigger button SHALL be focusable using keyboard tab navigation
2. WHEN the Actions_Menu trigger button is focused, pressing Enter or Space SHALL open the menu
3. WHEN the Actions_Menu is open, THE Actions_Menu SHALL support arrow key navigation between options
4. WHEN the Actions_Menu is open, pressing Escape SHALL close the menu
5. THE Actions_Menu SHALL include appropriate ARIA labels for screen reader accessibility
6. THE Actions_Menu trigger button SHALL have a descriptive aria-label indicating it opens actions for the specific patient

### Requirement 6: Backward Compatibility

**User Story:** As a developer, I want to ensure the new actions menu doesn't break existing functionality, so that the application remains stable.

#### Acceptance Criteria

1. THE PatientsPage SHALL maintain the existing patient name link functionality for navigation to patient details
2. THE PatientsPage SHALL maintain the existing table sorting and filtering capabilities
3. THE PatientsPage SHALL maintain the existing "Nuevo paciente" button functionality
4. THE Actions_Menu SHALL replace the current hover-only edit button in the actions column
