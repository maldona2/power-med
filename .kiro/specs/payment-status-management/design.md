# Design Document: Payment Status Management

## Overview

This feature adds payment status management capabilities to the medical appointment system. The design extends existing appointment detail views (AppointmentDetailPanel and AppointmentDetailSheet) to support interactive payment status updates, and enhances the patient detail page to display comprehensive payment information.

The implementation follows the existing architecture patterns established in AppointmentDetailSheet, which already includes payment status update functionality. This design ensures consistency across all views while maintaining the separation of concerns between UI components, state management, and API interactions.

### Key Design Goals

- Enable payment status updates from the appointment detail panel (list view)
- Display payment information on the patient detail page
- Maintain visual and functional consistency across all views
- Reuse existing payment configuration and API patterns
- Ensure proper error handling and user feedback

## Architecture

### Component Structure

The feature involves modifications to three main areas:

1. **AppointmentDetailPanel** (frontend/src/components/appointments/AppointmentDetailPanel.tsx)
   - Add payment status update functionality similar to AppointmentDetailSheet
   - Display interactive payment status buttons
   - Handle API calls and state updates

2. **TreatmentInfoSection** (frontend/src/components/appointments/TreatmentInfoSection.tsx)
   - Convert from display-only to interactive component
   - Accept callback props for payment status changes
   - Maintain backward compatibility for read-only usage

3. **PatientDetailPage** (frontend/src/pages/PatientDetailPage.tsx)
   - Add payment summary section
   - Display payment status badges in appointments list
   - Calculate and display unpaid appointment metrics

### Data Flow

```
User Action (Click Payment Button)
  ↓
Component State Update (isUpdating = true)
  ↓
API Call (PUT /appointments/:id with payment_status)
  ↓
Success/Error Handling
  ↓
Local State Update (activePayment)
  ↓
Parent Callback (refetch or onStatusChange)
  ↓
UI Update (toast notification)
```

### Shared Configuration

All components will reference a centralized payment configuration object:

```typescript
const paymentConfig: Record<PaymentStatus, { label: string; className: string }> = {
  unpaid: {
    label: 'Impago',
    className: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/80 dark:border-amber-800 dark:text-amber-200',
  },
  paid: {
    label: 'Pagado',
    className: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-200',
  },
  partial: {
    label: 'Parcial',
    className: 'bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-950/80 dark:border-sky-800 dark:text-sky-200',
  },
  refunded: {
    label: 'Reembolsado',
    className: 'bg-neutral-50 border-neutral-200 text-neutral-600 dark:bg-neutral-900/80 dark:border-neutral-700 dark:text-neutral-400',
  },
};
```

This configuration should be extracted to a shared constants file (e.g., `frontend/src/components/appointments/constants.ts`) to ensure consistency.

## Components and Interfaces

### 1. Enhanced TreatmentInfoSection

**Purpose**: Display treatment and payment information with optional interactive payment status controls.

**Props Interface**:
```typescript
interface TreatmentInfoSectionProps {
  treatments: AppointmentTreatmentRow[];
  totalAmountCents: number | null;
  paymentStatus: string;
  // New optional props for interactive mode
  onPaymentChange?: (newStatus: PaymentStatus) => Promise<void>;
  isUpdating?: boolean;
}
```

**Behavior**:
- When `onPaymentChange` is provided: render interactive buttons
- When `onPaymentChange` is undefined: render read-only badge (current behavior)
- Disable all buttons when `isUpdating` is true
- Apply active styling to the currently selected payment status

### 2. Modified AppointmentDetailPanel

**New State**:
```typescript
const [activePayment, setActivePayment] = useState<PaymentStatus>(detail?.payment_status ?? 'unpaid');
const [isUpdating, setIsUpdating] = useState(false);
```

**New Handler**:
```typescript
const handlePaymentChange = async (newPayment: PaymentStatus) => {
  setIsUpdating(true);
  try {
    const { data } = await api.put<Appointment>(
      `/appointments/${detail.id}`,
      { payment_status: newPayment }
    );
    setActivePayment((data.payment_status as PaymentStatus) ?? 'unpaid');
    refetch();
    toast.success('Estado de pago actualizado');
  } catch {
    toast.error('No se pudo actualizar el pago');
  } finally {
    setIsUpdating(false);
  }
};
```

**Integration**:
- Pass `handlePaymentChange` and `isUpdating` to TreatmentInfoSection
- Sync `activePayment` state with detail data on load

### 3. Enhanced PatientDetailPage

**New Computed Values**:
```typescript
// Calculate unpaid appointments metrics
const unpaidAppointments = appointments.filter(a => a.payment_status === 'unpaid');
const unpaidCount = unpaidAppointments.length;
const unpaidTotalCents = unpaidAppointments.reduce((sum, a) => sum + (a.total_amount_cents ?? 0), 0);
```

**New UI Sections**:

1. **Payment Summary Card** (displayed above appointments tab):
```typescript
<Card>
  <CardHeader>
    <CardTitle>Resumen de pagos</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Turnos impagos</span>
        <Badge variant="outline">{unpaidCount}</Badge>
      </div>
      <div className="flex justify-between font-semibold">
        <span>Total adeudado</span>
        <span>${(unpaidTotalCents / 100).toFixed(2)}</span>
      </div>
    </div>
  </CardContent>
</Card>
```

2. **Enhanced Appointments List** (add payment status badge):
```typescript
<div className="flex items-center gap-3">
  <p className="font-medium">{formatDate(a.scheduled_at)}</p>
  <Badge variant={statusConfig[a.status].variant}>
    {statusConfig[a.status].label}
  </Badge>
  <Badge variant="outline" className={paymentConfig[a.payment_status].className}>
    {paymentConfig[a.payment_status].label}
  </Badge>
</div>
```

3. **Display Total Amount**:
```typescript
{a.total_amount_cents !== null && (
  <p className="text-sm text-muted-foreground">
    Total: ${(a.total_amount_cents / 100).toFixed(2)}
  </p>
)}
```

## Data Models

### Existing Types (No Changes Required)

```typescript
export type PaymentStatus = 'unpaid' | 'paid' | 'partial' | 'refunded';

export interface Appointment {
  id: string;
  tenant_id: string;
  patient_id: string;
  scheduled_at: string;
  duration_minutes: number | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: PaymentStatus;
  total_amount_cents: number | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  patient_first_name?: string;
  patient_last_name?: string;
}

export interface AppointmentDetail extends Appointment {
  procedures_performed?: string | null;
  recommendations?: string | null;
  session_id?: string | null;
  treatments?: AppointmentTreatmentRow[];
}
```

### API Contract

**Endpoint**: `PUT /appointments/:id`

**Request Body**:
```typescript
{
  payment_status?: 'unpaid' | 'paid' | 'partial' | 'refunded';
  // other optional fields...
}
```

**Response**: Updated `Appointment` object

**Status Codes**:
- 200: Success
- 400: Invalid payment status
- 404: Appointment not found
- 403: Unauthorized

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Payment status update triggers API call

*For any* payment status button click in AppointmentDetailPanel or AppointmentDetailSheet, the system should send a PUT request to `/appointments/:id` with the selected payment_status value.

**Validates: Requirements 1.3**

### Property 2: Successful payment update reflects in UI

*For any* successful payment status API response, the displayed payment status should update to match the response data without requiring a page refresh, and a success notification should be displayed.

**Validates: Requirements 1.4, 1.5**

### Property 3: Failed payment update preserves state

*For any* failed payment status API call, the system should display an error notification and the displayed payment status should remain unchanged from its previous value.

**Validates: Requirements 1.6**

### Property 4: Payment update prevents concurrent requests

*For any* payment status update in progress, all payment status buttons should be disabled until the API call completes (success or failure).

**Validates: Requirements 1.7**

### Property 5: Unpaid appointments calculation accuracy

*For any* patient with appointments, the displayed unpaid count should equal the number of appointments with payment_status='unpaid', and the displayed unpaid total should equal the sum of total_amount_cents for all unpaid appointments.

**Validates: Requirements 2.1, 2.6, 2.7**

### Property 6: Appointment list displays payment information

*For any* appointment displayed in the Patient_Detail_Page appointments list, the system should display both the payment status badge and the total amount (if treatments exist).

**Validates: Requirements 2.2, 2.3**

### Property 7: Consistent payment configuration

*For any* payment status displayed anywhere in the system (AppointmentDetailPanel, AppointmentDetailSheet, PatientDetailPage), the system should use the same label, color scheme, and styling from the centralized paymentConfig object.

**Validates: Requirements 2.4, 3.3, 3.5**

### Property 8: Payment status update logic consistency

*For any* payment status update operation, both AppointmentDetailPanel and AppointmentDetailSheet should use identical API call patterns, error handling, and state management logic.

**Validates: Requirements 3.2**

### Property 9: Cross-view data synchronization

*For any* payment status update that succeeds, all views displaying the same appointment should reflect the updated payment status after their next data fetch.

**Validates: Requirements 3.4**

### Property 10: Active payment button styling

*For any* payment status button that matches the current appointment's payment_status, the button should display with active/selected styling distinct from inactive buttons.

**Validates: Requirements 4.7**

## Error Handling

### API Error Scenarios

1. **Network Failure**
   - Display: "No se pudo actualizar el pago"
   - Action: Maintain previous payment status
   - Recovery: User can retry by clicking button again

2. **Invalid Payment Status (400)**
   - Display: "Estado de pago inválido"
   - Action: Maintain previous payment status
   - Prevention: TypeScript types prevent invalid values

3. **Appointment Not Found (404)**
   - Display: "Turno no encontrado"
   - Action: Maintain previous payment status
   - Recovery: Refresh page or navigate back

4. **Unauthorized (403)**
   - Display: "No autorizado"
   - Action: Maintain previous payment status
   - Recovery: Re-authenticate

### UI Error States

1. **Missing Appointment Data**
   - Condition: `detail` is null in AppointmentDetailPanel
   - Display: Existing "No se pudo cargar el turno" message
   - Action: Show retry button

2. **Missing Payment Status**
   - Condition: `payment_status` is undefined
   - Fallback: Default to 'unpaid'
   - Display: Show unpaid badge/button

3. **Zero or Null Total Amount**
   - Condition: `total_amount_cents` is null or 0
   - Display: "$0.00"
   - Behavior: Still allow payment status updates

### Loading States

1. **During Payment Update**
   - Disable all payment status buttons
   - Show loading state on clicked button (optional)
   - Prevent form submission or navigation

2. **During Initial Load**
   - Use existing skeleton/loading states
   - Don't render payment buttons until data loads

## Testing Strategy

### Unit Testing

Use Vitest for component and logic testing:

1. **TreatmentInfoSection Component**
   - Test read-only mode (no onPaymentChange prop)
   - Test interactive mode (with onPaymentChange prop)
   - Test button disabled state when isUpdating=true
   - Test active button styling
   - Test all four payment status options render

2. **AppointmentDetailPanel Payment Logic**
   - Test handlePaymentChange success path
   - Test handlePaymentChange error path
   - Test state updates (activePayment, isUpdating)
   - Test toast notifications

3. **PatientDetailPage Calculations**
   - Test unpaid appointments filtering
   - Test unpaid count calculation
   - Test unpaid total calculation
   - Test zero appointments edge case
   - Test appointments with null total_amount_cents

4. **Payment Configuration**
   - Test all payment statuses have required config
   - Test config structure (label, className)
   - Test config is exported and importable

### Property-Based Testing

Use fast-check library for property-based tests (minimum 100 iterations each):

1. **Property Test: Payment Update API Call**
   ```typescript
   // Feature: payment-status-management, Property 1: Payment status update triggers API call
   fc.assert(
     fc.asyncProperty(
       fc.constantFrom('unpaid', 'paid', 'partial', 'refunded'),
       async (paymentStatus) => {
         // Given: A payment status button click
         // When: User clicks the button
         // Then: API call should be made with correct payment_status
       }
     ),
     { numRuns: 100 }
   );
   ```

2. **Property Test: Successful Update Reflects in UI**
   ```typescript
   // Feature: payment-status-management, Property 2: Successful payment update reflects in UI
   fc.assert(
     fc.asyncProperty(
       fc.constantFrom('unpaid', 'paid', 'partial', 'refunded'),
       async (newStatus) => {
         // Given: A successful API response with new payment status
         // When: Response is received
         // Then: UI should display new status and show success toast
       }
     ),
     { numRuns: 100 }
   );
   ```

3. **Property Test: Failed Update Preserves State**
   ```typescript
   // Feature: payment-status-management, Property 3: Failed payment update preserves state
   fc.assert(
     fc.asyncProperty(
       fc.constantFrom('unpaid', 'paid', 'partial', 'refunded'),
       fc.constantFrom('unpaid', 'paid', 'partial', 'refunded'),
       async (currentStatus, attemptedStatus) => {
         // Given: Current payment status and attempted change
         // When: API call fails
         // Then: UI should still show currentStatus and display error toast
       }
     ),
     { numRuns: 100 }
   );
   ```

4. **Property Test: Unpaid Calculation Accuracy**
   ```typescript
   // Feature: payment-status-management, Property 5: Unpaid appointments calculation accuracy
   fc.assert(
     fc.property(
       fc.array(fc.record({
         payment_status: fc.constantFrom('unpaid', 'paid', 'partial', 'refunded'),
         total_amount_cents: fc.option(fc.integer({ min: 0, max: 1000000 }), { nil: null })
       })),
       (appointments) => {
         // Given: Array of appointments with various payment statuses
         // When: Calculating unpaid metrics
         // Then: Count and total should match filter and reduce operations
         const unpaid = appointments.filter(a => a.payment_status === 'unpaid');
         const expectedCount = unpaid.length;
         const expectedTotal = unpaid.reduce((sum, a) => sum + (a.total_amount_cents ?? 0), 0);
         // Assert calculated values match expected
       }
     ),
     { numRuns: 100 }
   );
   ```

5. **Property Test: Consistent Configuration Usage**
   ```typescript
   // Feature: payment-status-management, Property 7: Consistent payment configuration
   fc.assert(
     fc.property(
       fc.constantFrom('unpaid', 'paid', 'partial', 'refunded'),
       (paymentStatus) => {
         // Given: A payment status value
         // When: Rendering in any component
         // Then: Should use same config from paymentConfig object
         const config = paymentConfig[paymentStatus];
         // Assert config exists and has required properties
         expect(config).toBeDefined();
         expect(config.label).toBeDefined();
         expect(config.className).toBeDefined();
       }
     ),
     { numRuns: 100 }
   );
   ```

### Integration Testing

1. **End-to-End Payment Update Flow**
   - Navigate to appointments page
   - Select an appointment
   - Click payment status button
   - Verify API call made
   - Verify UI updates
   - Verify toast notification

2. **Cross-View Consistency**
   - Update payment status in AppointmentDetailPanel
   - Navigate to PatientDetailPage
   - Verify payment status reflects change
   - Navigate to calendar view
   - Verify AppointmentDetailSheet shows updated status

3. **Patient Payment Summary**
   - Navigate to patient detail page
   - Verify unpaid count matches appointments
   - Verify unpaid total matches sum
   - Update payment status of one appointment
   - Verify summary updates correctly

### Manual Testing Checklist

- [ ] Payment status buttons render in AppointmentDetailPanel
- [ ] Clicking each payment status button updates the appointment
- [ ] Success toast appears on successful update
- [ ] Error toast appears on failed update
- [ ] Buttons are disabled during update
- [ ] Active button has distinct styling
- [ ] Payment summary appears on patient detail page
- [ ] Unpaid count is accurate
- [ ] Unpaid total is accurate
- [ ] Payment status badges appear in appointments list
- [ ] Total amount displays for each appointment
- [ ] Visual styling is consistent across all views
- [ ] AppointmentDetailSheet payment functionality still works
- [ ] Dark mode styling works correctly
- [ ] Responsive design works on mobile
