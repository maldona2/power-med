# Design Document: Patient Actions Menu

## Overview

This feature enhances the PatientsPage by replacing the current hover-only edit button with a comprehensive actions menu. The menu provides three distinct actions (View, Edit, Delete) in a dropdown format, improving discoverability and accessibility of patient management operations.

The design leverages the existing Radix UI DropdownMenu component and Dialog component from the UI library, ensuring consistency with the application's design system. The implementation will be minimal and focused, modifying only the actions column in the PatientsPage table while maintaining all existing functionality.

Key design decisions:
- Use DropdownMenu from Radix UI for the actions menu (already available in the codebase)
- Use Dialog component for delete confirmation (already available)
- Replace the hover-only edit button with an always-visible menu trigger
- Maintain backward compatibility with existing patient name link navigation
- Leverage existing API endpoints (DELETE /patients/:id already exists)

## Architecture

### Component Structure

```
PatientsPage
├── DataTable (existing)
│   └── Table Row
│       └── Actions Column (modified)
│           └── PatientActionsMenu (new component)
│               ├── DropdownMenu
│               │   ├── DropdownMenuTrigger (Button with MoreVertical icon)
│               │   └── DropdownMenuContent
│               │       ├── DropdownMenuItem (View - Eye icon)
│               │       ├── DropdownMenuItem (Edit - Pencil icon)
│               │       └── DropdownMenuItem (Delete - Trash icon, destructive variant)
│               └── DeleteConfirmationDialog (new component)
│                   └── Dialog
│                       ├── DialogContent
│                       ├── DialogHeader (Title + Description)
│                       └── DialogFooter (Cancel + Confirm buttons)
```

### Data Flow

1. **View Action**: Navigate to patient detail page using React Router
2. **Edit Action**: Open existing PatientFormDialog with patient data
3. **Delete Action**: 
   - Open confirmation dialog
   - On confirm: Call DELETE /patients/:id API
   - On success: Refetch patient list, show success toast
   - On error: Show error toast with message


## Components and Interfaces

### PatientActionsMenu Component

A new component that encapsulates the actions menu for a single patient row.

**Props Interface:**
```typescript
interface PatientActionsMenuProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
}
```

**Responsibilities:**
- Render the DropdownMenu with trigger button
- Handle View action (navigation)
- Handle Edit action (call onEdit callback)
- Handle Delete action (show confirmation, call API, handle response)
- Manage delete confirmation dialog state
- Display toast notifications for delete operations

**Implementation Notes:**
- Uses `useNavigate` from react-router-dom for View action
- Uses `DropdownMenu` components from `@/components/ui/dropdown-menu`
- Uses `Dialog` components from `@/components/ui/dialog`
- Uses `toast` from `sonner` for notifications
- Uses `api` from `@/lib/api` for DELETE request
- Accepts `onEdit` callback to trigger existing edit dialog in PatientsPage

### DeleteConfirmationDialog Component

A reusable confirmation dialog for delete operations (can be extracted if needed elsewhere).

**Props Interface:**
```typescript
interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}
```

**Responsibilities:**
- Display patient name in confirmation message
- Show warning about permanence
- Provide Cancel and Confirm actions
- Handle loading state during deletion
- Close on cancel or after successful deletion


## Data Models

### Existing Types (No Changes Required)

**Patient Interface** (from `@/types`):
```typescript
interface Patient {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  appointment_count?: number;
  unpaid_count?: number;
  unpaid_total_cents?: number;
}
```

### API Endpoints

**DELETE /patients/:id**
- Already exists in backend
- Requires authentication and professional role
- Returns 204 No Content on success
- Returns 404 if patient not found
- Validates tenant_id to ensure users can only delete their own patients

### State Management

**Component State:**
- `deleteDialogOpen: boolean` - Controls delete confirmation dialog visibility
- `deletingPatientId: string | null` - Tracks which patient is being deleted
- `isDeleting: boolean` - Loading state during delete operation

**Existing State (PatientsPage):**
- `dialogOpen: boolean` - Edit dialog state (unchanged)
- `editingPatient: Patient | null` - Patient being edited (unchanged)
- `patients: Patient[]` - Patient list from usePatients hook (unchanged)


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Menu displays three action options

For any patient record, when the actions menu trigger button is clicked, the dropdown menu shall display exactly three options: View, Edit, and Delete.

**Validates: Requirements 1.3**

### Property 2: View action navigates to correct route

For any patient with ID `patient_id`, when the View action is selected, the application shall navigate to the route `/app/patients/{patient_id}`.

**Validates: Requirements 2.1, 2.2**

### Property 3: Edit action opens dialog with patient data

For any patient, when the Edit action is selected, the patient edit dialog shall open and be pre-populated with that patient's current information (first_name, last_name, phone, email, date_of_birth, notes).

**Validates: Requirements 3.1, 3.2**

### Property 4: Delete action shows confirmation with patient name

For any patient, when the Delete action is selected, a confirmation dialog shall appear that includes the patient's full name (first_name and last_name).

**Validates: Requirements 4.1, 4.2**

### Property 5: Successful deletion triggers refetch and toast

For any patient, when deletion is confirmed and the API returns success (204), the patient list shall be refetched and a success toast notification shall be displayed.

**Validates: Requirements 4.4, 4.5**

### Property 6: Failed deletion shows error toast

For any patient, when deletion is confirmed and the API returns an error, an error toast notification shall be displayed with the failure reason.

**Validates: Requirements 4.6**

### Property 7: Menu trigger has descriptive aria-label

For any patient, the actions menu trigger button shall have an aria-label that includes the patient's name and indicates it opens actions for that specific patient.

**Validates: Requirements 5.5, 5.6**


## Error Handling

### API Error Handling

**DELETE /patients/:id Errors:**
- **404 Not Found**: Display error toast "No se pudo eliminar el paciente: Paciente no encontrado"
- **403 Forbidden**: Display error toast "No tienes permisos para eliminar este paciente"
- **Network Error**: Display error toast "Error de conexión. Por favor, intenta de nuevo"
- **500 Server Error**: Display error toast "Error del servidor. Por favor, intenta más tarde"

**Error Recovery:**
- On delete error, keep the confirmation dialog open so user can retry
- Log errors to console for debugging
- Do not refetch patient list on error (avoid unnecessary API calls)

### UI Error States

**Loading States:**
- Disable confirm button during deletion with loading spinner
- Prevent closing dialog during deletion
- Show loading state in button text: "Eliminando..."

**Validation:**
- No client-side validation needed (delete is a simple operation)
- Backend validates tenant_id and patient existence

### Edge Cases

**Concurrent Operations:**
- If patient is deleted while edit dialog is open, edit will fail gracefully (backend returns 404)
- If patient list is being filtered/sorted during delete, refetch will maintain current filter/sort state

**Empty States:**
- If deleting the last patient, table shows empty state (existing functionality)


## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of menu rendering with icons
- Menu item ordering (View first, Edit second, Delete third)
- Destructive styling on Delete action
- Backward compatibility (existing links and buttons still work)
- Edge cases like empty patient lists

**Property-Based Tests** focus on:
- Universal behaviors that hold for all patients
- Navigation with any patient ID
- Dialog behavior with any patient data
- ARIA labels with any patient name
- API interactions with any patient

### Property-Based Testing Configuration

**Library**: `@fast-check/vitest` (JavaScript/TypeScript property-based testing)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with comment referencing design property
- Tag format: `// Feature: patient-actions-menu, Property {number}: {property_text}`

**Test Organization**:
```
frontend/src/components/patients/__tests__/
├── PatientActionsMenu.test.tsx (unit tests)
└── PatientActionsMenu.properties.test.tsx (property-based tests)
```

### Unit Test Coverage

**PatientActionsMenu Component:**
1. Renders menu trigger button with MoreVertical icon
2. Menu trigger is always visible (no opacity-0 class)
3. Menu contains three items in correct order: View, Edit, Delete
4. View item has Eye icon
5. Edit item has Pencil icon
6. Delete item has Trash icon and destructive variant
7. Clicking View navigates to patient detail page
8. Clicking Edit calls onEdit callback with patient
9. Clicking Delete opens confirmation dialog
10. Confirmation dialog shows patient name
11. Confirmation dialog shows warning text
12. Confirming deletion calls DELETE API
13. Successful deletion shows success toast and refetches
14. Failed deletion shows error toast
15. Cancel button closes confirmation dialog

**Backward Compatibility:**
1. Patient name link still navigates to detail page
2. Table sorting still works
3. Table filtering still works
4. "Nuevo paciente" button still opens create dialog
5. Hover-only edit button is removed

### Property-Based Test Coverage

Each property from the Correctness Properties section must be implemented as a property-based test:

**Property 1**: Generate random patient lists, verify menu always shows 3 options
**Property 2**: Generate random patient IDs, verify navigation route format
**Property 3**: Generate random patient data, verify dialog receives correct data
**Property 4**: Generate random patient names, verify confirmation includes name
**Property 5**: Generate random patients, mock successful API response, verify refetch and toast
**Property 6**: Generate random patients, mock API errors, verify error toast
**Property 7**: Generate random patient names, verify aria-label includes name

### Integration Testing

**Manual Testing Checklist:**
1. Keyboard navigation through menu (Tab, Enter, Arrow keys, Escape)
2. Screen reader announces menu items correctly
3. Delete confirmation prevents accidental deletion
4. Toast notifications appear in correct position
5. Menu closes after action selection
6. Menu closes when clicking outside
7. Multiple patients can be managed in sequence
8. Works on mobile viewport (touch interactions)

### Accessibility Testing

**WCAG 2.1 AA Compliance:**
- Keyboard navigation (all actions accessible via keyboard)
- Focus indicators visible on all interactive elements
- ARIA labels present and descriptive
- Color contrast meets minimum ratios (destructive red for delete)
- Touch targets minimum 44x44px on mobile

Note: While we implement accessibility best practices, full WCAG compliance requires manual testing with assistive technologies and expert review.

