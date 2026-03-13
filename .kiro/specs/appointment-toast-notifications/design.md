# Design Document: Appointment Toast Notifications

## Overview

This feature implements a real-time notification system that monitors today's appointments and displays toast notifications when appointment times arrive. The system uses a custom React hook that continuously checks the current time against scheduled appointments and triggers Sonner toast notifications with patient information and quick navigation actions.

The design follows a reactive architecture where a single monitoring hook manages the notification lifecycle, including time checking, duplicate prevention, and state management. The hook integrates seamlessly with the existing useAppointments hook and Sonner toast library to provide a non-intrusive notification experience.

Key design principles:
- Single responsibility: One hook manages all notification logic
- Efficient polling: Minute-level precision with minimal resource usage
- Stateful tracking: Prevents duplicate notifications for the same appointment
- Declarative integration: Simple hook usage in the main application component

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Root                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  useAppointmentNotifications()                        │  │
│  │  - Fetches today's appointments                       │  │
│  │  - Runs time check interval (every 60 seconds)        │  │
│  │  - Maintains notification tracking state              │  │
│  │  - Triggers toast notifications                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ├──────────────┐                   │
│                           ▼              ▼                   │
│                  ┌─────────────┐  ┌──────────────┐          │
│                  │useAppointments│  │Sonner Toast │          │
│                  │   Hook       │  │   Library    │          │
│                  └─────────────┘  └──────────────┘          │
│                           │              │                   │
│                           ▼              ▼                   │
│                  ┌─────────────┐  ┌──────────────┐          │
│                  │  API Layer  │  │ Toast UI     │          │
│                  └─────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**useAppointmentNotifications Hook**
- Fetches appointments for the current date using useAppointments
- Establishes a setInterval timer that runs every 60 seconds
- Compares current time (hour:minute) against appointment scheduled times
- Maintains a Set of notified appointment IDs to prevent duplicates
- Filters appointments by status (only "scheduled" or "confirmed")
- Triggers toast notifications via Sonner's toast() function
- Resets notification tracking when the date changes
- Cleans up interval on unmount

**Toast Notification Content**
- Displays patient full name (first_name + last_name)
- Shows formatted scheduled time
- Includes "View Patient" action button
- Uses Sonner's action property for navigation
- Auto-dismisses after user interaction or timeout

### Data Flow

```
1. Hook Initialization
   └─> Fetch today's appointments (date filter)
   └─> Initialize empty Set for tracking notified IDs
   └─> Start 60-second interval timer

2. Every 60 Seconds (Interval Tick)
   └─> Get current time (hour:minute)
   └─> Filter appointments:
       ├─> Status is "scheduled" or "confirmed"
       ├─> Scheduled time matches current time (minute precision)
       └─> ID not in notified Set
   └─> For each matching appointment:
       ├─> Add ID to notified Set
       └─> Call toast() with patient info and action button

3. User Clicks "View Patient"
   └─> Navigate to /app/patients/:patient_id
   └─> Toast auto-dismisses

4. Date Change Detection
   └─> Clear notified Set
   └─> Refetch appointments for new date

5. Cleanup
   └─> Clear interval on unmount
```

## Components and Interfaces

### useAppointmentNotifications Hook

**Location:** `frontend/src/hooks/useAppointmentNotifications.ts`

**Interface:**
```typescript
export function useAppointmentNotifications(): void
```

This hook has no return value as it operates purely through side effects (displaying toasts). It should be called once at the application root level.

**Internal State:**
```typescript
// Track which appointments have already triggered notifications
const notifiedAppointmentIds = useRef<Set<string>>(new Set());

// Track the current date to detect day changes
const currentDate = useRef<string>(new Date().toISOString().slice(0, 10));
```

**Dependencies:**
- `useAppointments` hook for fetching appointment data
- `toast` from 'sonner' for displaying notifications
- `useNavigate` from 'react-router-dom' for navigation
- `useEffect` for interval management and cleanup

**Implementation Logic:**

1. **Fetch Today's Appointments**
   - Use useAppointments with date filter set to today
   - Filter by status: include only "scheduled" and "confirmed"

2. **Time Checking Interval**
   - Run every 60 seconds (60000ms)
   - Extract current hour and minute
   - Compare against each appointment's scheduled_at time
   - Ignore seconds for comparison (minute-level precision)

3. **Notification Triggering**
   - Check if appointment ID is already in notifiedAppointmentIds Set
   - If not notified and time matches:
     - Add ID to Set
     - Call toast() with notification content

4. **Date Change Handling**
   - On each interval tick, check if date has changed
   - If changed: clear notifiedAppointmentIds Set and update currentDate ref
   - This ensures notifications reset for the new day

5. **Cleanup**
   - Clear interval when component unmounts
   - Prevent memory leaks

### Toast Notification Structure

**Toast Content:**
```typescript
toast("Appointment Time", {
  description: `${patient_first_name} ${patient_last_name} - ${formattedTime}`,
  action: {
    label: "View Patient",
    onClick: () => navigate(`/app/patients/${patient_id}`)
  }
});
```

**Formatting:**
- Time format: "h:mm a" (e.g., "2:30 PM")
- Patient name: Full name with space between first and last
- Toast remains visible until dismissed or timeout (Sonner default behavior)

### Integration Point

**Location:** Main application component (e.g., `App.tsx` or layout component)

**Usage:**
```typescript
import { useAppointmentNotifications } from '@/hooks/useAppointmentNotifications';

function App() {
  useAppointmentNotifications(); // Call once at root level
  
  return (
    // ... rest of application
  );
}
```

## Data Models

### Appointment (Existing Type)

```typescript
interface Appointment {
  id: string;
  scheduled_at: string; // ISO 8601 datetime string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status?: PaymentStatus;
  total_amount_cents?: number | null;
  duration_minutes: number;
  notes: string | null;
  patient_id: string;
  tenant_id: string;
  patient_first_name?: string;
  patient_last_name?: string;
}
```

**Relevant Fields for Notifications:**
- `id`: Unique identifier for tracking notified appointments
- `scheduled_at`: ISO 8601 string parsed to extract hour and minute
- `status`: Filter to include only "scheduled" or "confirmed"
- `patient_id`: Used for navigation to patient detail page
- `patient_first_name`, `patient_last_name`: Displayed in toast notification

### Time Comparison Logic

**Current Time Extraction:**
```typescript
const now = new Date();
const currentHour = now.getHours();
const currentMinute = now.getMinutes();
```

**Appointment Time Extraction:**
```typescript
const appointmentTime = new Date(appointment.scheduled_at);
const appointmentHour = appointmentTime.getHours();
const appointmentMinute = appointmentTime.getMinutes();
```

**Matching Logic:**
```typescript
const isTimeMatch = 
  currentHour === appointmentHour && 
  currentMinute === appointmentMinute;
```

**Date Comparison:**
```typescript
const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
```

### Notification Tracking State

**Structure:**
```typescript
Set<string> // Set of appointment IDs that have been notified
```

**Operations:**
- `has(id)`: Check if appointment has been notified
- `add(id)`: Mark appointment as notified
- `clear()`: Reset all notifications (on date change)

**Lifecycle:**
- Initialized as empty Set on mount
- Grows throughout the day as appointments trigger
- Cleared when date changes to new day
- Persists in memory only (not persisted to storage)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:

- **4.2 is redundant with 4.1**: Both specify status filtering, just from opposite perspectives. Testing that only "scheduled" and "confirmed" trigger notifications inherently tests that other statuses don't.
- **5.2 is redundant with 1.3 and 5.1**: This is a specific example of the general time-matching property.
- **5.3 is redundant with 1.4**: Both specify that each appointment should only trigger once.
- **6.2 is redundant with 1.1**: Both specify filtering to today's appointments only.

The following properties provide unique validation value and will be included:

### Property 1: Today's Appointments Only

*For any* set of appointments spanning multiple dates, the notification monitor should only consider appointments where the date portion of scheduled_at matches the current date.

**Validates: Requirements 1.1**

### Property 2: Time Match Triggers Notification

*For any* appointment with status "scheduled" or "confirmed", when the current time's hour and minute match the appointment's scheduled_at hour and minute, a notification should be triggered for that appointment.

**Validates: Requirements 1.3, 5.1**

### Property 3: No Duplicate Notifications

*For any* appointment, even if the time-checking logic runs multiple times during the same minute, the notification should only be triggered once per day.

**Validates: Requirements 1.4**

### Property 4: Toast Contains Patient Name

*For any* appointment that triggers a notification, the toast content should include both the patient's first name and last name.

**Validates: Requirements 2.2**

### Property 5: Toast Contains Scheduled Time

*For any* appointment that triggers a notification, the toast content should include the formatted scheduled time.

**Validates: Requirements 2.3**

### Property 6: Multiple Simultaneous Appointments

*For any* set of appointments scheduled at the same hour and minute, each appointment should trigger its own separate notification.

**Validates: Requirements 2.5**

### Property 7: Toast Includes Action Button

*For any* appointment notification, the toast should include an action button with navigation functionality.

**Validates: Requirements 3.1**

### Property 8: Navigation URL Format

*For any* appointment, when the action button is clicked, the navigation should be to the URL path `/app/patients/{patient_id}` where patient_id is the appointment's patient_id.

**Validates: Requirements 3.2, 3.3**

### Property 9: Status Filtering

*For any* set of appointments with various statuses, only appointments with status "scheduled" or "confirmed" should trigger notifications, while appointments with status "cancelled", "completed", "pending", or any other status should not trigger notifications.

**Validates: Requirements 4.1, 4.2**

### Property 10: No Past Appointment Notifications

*For any* appointment whose scheduled_at time is before the current time (past appointment), no notification should be triggered.

**Validates: Requirements 5.4**

## Error Handling

### Time Parsing Errors

**Scenario:** Appointment scheduled_at field contains invalid or malformed datetime string

**Handling:**
- Wrap Date parsing in try-catch block
- Log error with appointment ID for debugging
- Skip the appointment for notification (fail gracefully)
- Continue processing other appointments

**Implementation:**
```typescript
try {
  const appointmentTime = new Date(appointment.scheduled_at);
  if (isNaN(appointmentTime.getTime())) {
    console.error(`Invalid scheduled_at for appointment ${appointment.id}`);
    return; // Skip this appointment
  }
  // ... continue with time comparison
} catch (error) {
  console.error(`Error parsing scheduled_at for appointment ${appointment.id}:`, error);
  return;
}
```

### Missing Patient Information

**Scenario:** Appointment missing patient_first_name or patient_last_name

**Handling:**
- Use fallback display text: "Patient" if both names are missing
- Use available name if only one is missing
- Still trigger notification with available information
- Log warning for data quality monitoring

**Implementation:**
```typescript
const patientName = [
  appointment.patient_first_name,
  appointment.patient_last_name
].filter(Boolean).join(' ') || 'Patient';
```

### Navigation Errors

**Scenario:** Navigation fails or patient_id is missing

**Handling:**
- Check for patient_id before setting up action button
- If missing, omit action button from toast
- Log error for debugging
- Toast still displays with patient information

**Implementation:**
```typescript
const toastOptions: any = {
  description: `${patientName} - ${formattedTime}`
};

if (appointment.patient_id) {
  toastOptions.action = {
    label: "View Patient",
    onClick: () => navigate(`/app/patients/${appointment.patient_id}`)
  };
} else {
  console.warn(`Missing patient_id for appointment ${appointment.id}`);
}

toast("Appointment Time", toastOptions);
```

### API Fetch Errors

**Scenario:** useAppointments hook fails to fetch appointments

**Handling:**
- Hook continues to run with empty appointments array
- No notifications triggered (expected behavior)
- Error handling delegated to useAppointments hook
- Interval continues running for retry on next fetch

### Interval Cleanup Errors

**Scenario:** Component unmounts while interval is running

**Handling:**
- Use useEffect cleanup function to clear interval
- Prevents memory leaks and continued execution
- No error state needed (standard React pattern)

**Implementation:**
```typescript
useEffect(() => {
  const intervalId = setInterval(() => {
    // ... notification logic
  }, 60000);

  return () => clearInterval(intervalId);
}, [dependencies]);
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of time matching behavior
- Edge cases (empty appointments, missing data)
- Integration with Sonner toast library
- Date change detection logic
- Interval setup and cleanup

**Property-Based Tests** focus on:
- Universal properties across all appointment data
- Time matching logic with randomized inputs
- Status filtering with various status combinations
- Notification content validation
- Duplicate prevention across multiple runs

### Property-Based Testing Configuration

**Library:** fast-check (for TypeScript/JavaScript)

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with reference to design document property
- Tag format: `Feature: appointment-toast-notifications, Property {number}: {property_text}`

**Example Test Structure:**
```typescript
import fc from 'fast-check';

describe('Appointment Notifications - Property Tests', () => {
  it('Property 1: Today\'s Appointments Only', () => {
    // Feature: appointment-toast-notifications, Property 1: Today's Appointments Only
    fc.assert(
      fc.property(
        fc.array(appointmentArbitrary()),
        (appointments) => {
          const today = new Date().toISOString().slice(0, 10);
          const filtered = filterTodaysAppointments(appointments, today);
          
          // All filtered appointments should be from today
          return filtered.every(apt => 
            apt.scheduled_at.startsWith(today)
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Test Coverage

**Test File:** `frontend/src/hooks/useAppointmentNotifications.test.ts`

**Test Cases:**

1. **Interval Setup**
   - Verify setInterval is called with 60000ms
   - Verify interval is cleared on unmount

2. **Date Change Detection**
   - Mock date change between interval ticks
   - Verify notification tracking state is reset

3. **Time Matching Example**
   - Set current time to 17:00
   - Create appointment at 17:00
   - Verify toast is called

4. **Status Filtering Example**
   - Create appointments with different statuses
   - Verify only "scheduled" and "confirmed" trigger toasts

5. **Missing Patient Data**
   - Create appointment with missing patient names
   - Verify toast still displays with fallback text

6. **Empty Appointments List**
   - Provide empty appointments array
   - Verify no errors and no toasts triggered

7. **Toast Content Structure**
   - Trigger notification
   - Verify toast called with correct title, description, and action

8. **Navigation Action**
   - Mock navigate function
   - Click action button
   - Verify navigate called with correct URL

### Integration Testing

**Test File:** `frontend/src/hooks/useAppointmentNotifications.integration.test.ts`

**Test Cases:**

1. **Full Notification Flow**
   - Render component with hook
   - Mock API to return today's appointments
   - Fast-forward time to appointment time
   - Verify toast appears with correct content

2. **Multiple Appointments**
   - Mock API with multiple appointments at same time
   - Verify multiple toasts appear

3. **Real-time Updates**
   - Start with no appointments
   - Update appointments data
   - Verify notifications trigger for new appointments

### Mock Strategies

**Mocking Time:**
```typescript
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-01-15T17:00:00'));
```

**Mocking useAppointments:**
```typescript
jest.mock('@/hooks/useAppointments', () => ({
  useAppointments: jest.fn()
}));
```

**Mocking Sonner Toast:**
```typescript
jest.mock('sonner', () => ({
  toast: jest.fn()
}));
```

**Mocking Navigation:**
```typescript
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));
```

### Test Data Generators (for Property-Based Tests)

**Appointment Arbitrary:**
```typescript
const appointmentArbitrary = () => fc.record({
  id: fc.uuid(),
  scheduled_at: fc.date().map(d => d.toISOString()),
  status: fc.constantFrom('pending', 'confirmed', 'scheduled', 'completed', 'cancelled'),
  patient_id: fc.uuid(),
  patient_first_name: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
  patient_last_name: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
  duration_minutes: fc.integer({ min: 15, max: 120 }),
  notes: fc.option(fc.string()),
  tenant_id: fc.uuid()
});
```

**Time Arbitrary:**
```typescript
const timeArbitrary = () => fc.record({
  hour: fc.integer({ min: 0, max: 23 }),
  minute: fc.integer({ min: 0, max: 59 })
});
```

### Coverage Goals

- Line coverage: > 90%
- Branch coverage: > 85%
- Property tests: All 10 properties implemented
- Unit tests: All edge cases and examples covered
- Integration tests: Full user flows validated
