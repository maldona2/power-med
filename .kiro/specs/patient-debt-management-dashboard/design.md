# Design Document: Patient Debt Management Dashboard

## Overview

The Patient Debt Management Dashboard is a comprehensive financial analytics and reporting feature that enhances the existing healthcare application's payment tracking capabilities. Currently, the system only displays basic payment amounts, which is insufficient for effective accounts receivable management. This feature introduces a full-featured dashboard with organized payment data visualization, statistical analysis, aging reports, payment plan tracking, and export functionality.

The dashboard will be implemented as a new page in the React frontend, backed by new API endpoints that aggregate and analyze payment data from the existing appointments table. The solution leverages the current multi-tenant architecture and integrates seamlessly with existing authentication and authorization mechanisms.

### Key Capabilities

- Organized display of patient payment information with sorting and filtering
- Real-time calculation and visualization of payment statistics
- Interactive charts showing payment trends, distributions, and method analytics
- Aging reports to prioritize collection efforts
- Payment plan tracking with compliance monitoring
- Advanced search and filtering capabilities
- Export functionality for CSV and PDF reports
- Real-time data updates with automatic refresh
- HIPAA-compliant security and access control

## Architecture

### System Components

The feature follows a three-tier architecture consistent with the existing application:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  DebtDashboardPage (React Component)                 │  │
│  │  - PaymentStatistics                                 │  │
│  │  - PaymentCharts                                     │  │
│  │  - AgingReport                                       │  │
│  │  - PaymentPlanTracker                                │  │
│  │  - PatientList with Filters                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/debt-dashboard/* (Express Routes)             │  │
│  │  - GET /statistics                                   │  │
│  │  - GET /aging-report                                 │  │
│  │  - GET /payment-plans                                │  │
│  │  - GET /payment-history                              │  │
│  │  - POST /export                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  DebtDashboardService                                │  │
│  │  - calculateStatistics()                             │  │
│  │  - generateAgingReport()                             │  │
│  │  - getPaymentPlans()                                 │  │
│  │  - exportReport()                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Drizzle ORM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Database Layer                          │
│  - appointments (existing)                                  │
│  - patients (existing)                                      │
│  - payment_plans (new)                                      │
│  - payment_records (new)                                    │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React 19, TypeScript, Vite, shadcn/ui, Recharts (for charts)
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Testing**: Vitest (frontend), Jest + fast-check (backend property tests)
- **Authentication**: JWT-based auth (existing middleware)

### Design Patterns

- **Repository Pattern**: Service layer abstracts database operations
- **Multi-tenancy**: All queries filtered by tenantId from authenticated user
- **Separation of Concerns**: Clear boundaries between routes, services, and data access
- **Caching Strategy**: Client-side caching with 5-second refresh intervals for real-time updates

## Components and Interfaces

### Database Schema Extensions

Two new tables are required to support payment tracking and payment plans:

```typescript
// payment_records table
export const paymentRecords = pgTable(
  'payment_records',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
    appointmentId: uuid('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),
    amountCents: integer('amount_cents').notNull(),
    paymentMethod: text('payment_method', {
      enum: ['cash', 'check', 'credit_card', 'debit_card', 'electronic_transfer']
    }).notNull(),
    paymentDate: timestamp('payment_date', { withTimezone: true }).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_payment_records_tenant').on(table.tenantId),
    index('idx_payment_records_patient').on(table.patientId),
    index('idx_payment_records_date').on(table.paymentDate),
  ]
);

// payment_plans table
export const paymentPlans = pgTable(
  'payment_plans',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
    totalAmountCents: integer('total_amount_cents').notNull(),
    installmentAmountCents: integer('installment_amount_cents').notNull(),
    frequency: text('frequency', {
      enum: ['weekly', 'biweekly', 'monthly']
    }).notNull(),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    nextPaymentDate: timestamp('next_payment_date', { withTimezone: true }).notNull(),
    status: text('status', {
      enum: ['active', 'completed', 'delinquent', 'cancelled']
    }).notNull().default('active'),
    onTimePayments: integer('on_time_payments').notNull().default(0),
    latePayments: integer('late_payments').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_payment_plans_tenant').on(table.tenantId),
    index('idx_payment_plans_patient').on(table.patientId),
    index('idx_payment_plans_status').on(table.status),
  ]
);
```

### API Endpoints

#### GET /api/debt-dashboard/statistics

Returns aggregate payment statistics.

**Query Parameters:**
- `startDate` (optional): ISO 8601 date string
- `endDate` (optional): ISO 8601 date string

**Response:**
```typescript
{
  totalPaidCents: number;
  totalUnpaidCents: number;
  collectionRate: number; // percentage
  patientsWithBalance: number;
  averageDebtCents: number;
  lastUpdated: string; // ISO 8601 timestamp
}
```

#### GET /api/debt-dashboard/aging-report

Returns debt categorized by age.

**Response:**
```typescript
{
  buckets: [
    {
      range: '0-30' | '31-60' | '61-90' | '90+';
      totalAmountCents: number;
      patientCount: number;
      percentage: number;
    }
  ];
  lastUpdated: string;
}
```

#### GET /api/debt-dashboard/payment-plans

Returns all payment plans with progress tracking.

**Query Parameters:**
- `status` (optional): 'active' | 'completed' | 'delinquent' | 'cancelled'

**Response:**
```typescript
{
  plans: [
    {
      id: string;
      patientId: string;
      patientName: string;
      totalAmountCents: number;
      installmentAmountCents: number;
      frequency: string;
      nextPaymentDate: string;
      completionPercentage: number;
      status: string;
      onTimePayments: number;
      latePayments: number;
    }
  ];
}
```

#### GET /api/debt-dashboard/payment-history

Returns detailed payment history with filtering.

**Query Parameters:**
- `patientId` (optional): UUID
- `startDate` (optional): ISO 8601 date string
- `endDate` (optional): ISO 8601 date string
- `paymentStatus` (optional): 'paid' | 'unpaid' | 'partially_paid'
- `minAmount` (optional): number (in cents)
- `maxAmount` (optional): number (in cents)
- `search` (optional): string (patient name or ID)

**Response:**
```typescript
{
  records: [
    {
      patientId: string;
      patientName: string;
      totalDebtCents: number;
      paidCents: number;
      unpaidCents: number;
      paymentStatus: 'paid' | 'unpaid' | 'partially_paid';
      lastPaymentDate: string | null;
      payments: [
        {
          id: string;
          amountCents: number;
          paymentMethod: string;
          paymentDate: string;
          remainingBalanceCents: number;
        }
      ];
    }
  ];
  totalCount: number;
}
```

#### GET /api/debt-dashboard/payment-methods

Returns analytics on payment methods.

**Response:**
```typescript
{
  methods: [
    {
      method: string;
      totalAmountCents: number;
      transactionCount: number;
      averageAmountCents: number;
      percentage: number;
    }
  ];
}
```

#### POST /api/debt-dashboard/export

Generates and returns a report file.

**Request Body:**
```typescript
{
  format: 'csv' | 'pdf';
  reportType: 'statistics' | 'aging' | 'payment-history' | 'payment-plans';
  filters: {
    startDate?: string;
    endDate?: string;
    patientId?: string;
    paymentStatus?: string;
  };
}
```

**Response:**
- Content-Type: `text/csv` or `application/pdf`
- Content-Disposition: `attachment; filename="debt-report-{date}.{ext}"`

### Frontend Components

#### DebtDashboardPage

Main container component that orchestrates the dashboard layout.

```typescript
interface DebtDashboardPageProps {}

export function DebtDashboardPage(): JSX.Element;
```

#### PaymentStatisticsCard

Displays aggregate statistics in card format.

```typescript
interface PaymentStatisticsCardProps {
  statistics: {
    totalPaidCents: number;
    totalUnpaidCents: number;
    collectionRate: number;
    patientsWithBalance: number;
    averageDebtCents: number;
  };
  isLoading: boolean;
}

export function PaymentStatisticsCard(props: PaymentStatisticsCardProps): JSX.Element;
```

#### PaymentChartsSection

Renders interactive charts using Recharts library.

```typescript
interface PaymentChartsSectionProps {
  data: {
    paidVsUnpaid: { paid: number; unpaid: number };
    paymentTrends: Array<{ date: string; amount: number }>;
    debtDistribution: Array<{ range: string; count: number }>;
    paymentMethods: Array<{ method: string; amount: number; percentage: number }>;
  };
  chartType: 'pie' | 'bar' | 'line';
  onChartTypeChange: (type: 'pie' | 'bar' | 'line') => void;
}

export function PaymentChartsSection(props: PaymentChartsSectionProps): JSX.Element;
```

#### AgingReportTable

Displays aging buckets with drill-down capability.

```typescript
interface AgingReportTableProps {
  buckets: Array<{
    range: string;
    totalAmountCents: number;
    patientCount: number;
    percentage: number;
  }>;
  onBucketClick: (range: string) => void;
}

export function AgingReportTable(props: AgingReportTableProps): JSX.Element;
```

#### PaymentPlanList

Shows payment plans with progress indicators.

```typescript
interface PaymentPlanListProps {
  plans: Array<{
    id: string;
    patientName: string;
    totalAmountCents: number;
    completionPercentage: number;
    status: string;
    nextPaymentDate: string;
    onTimePayments: number;
    latePayments: number;
  }>;
  onStatusFilter: (status: string) => void;
}

export function PaymentPlanList(props: PaymentPlanListProps): JSX.Element;
```

#### PatientPaymentTable

Searchable, filterable table of patient payment records.

```typescript
interface PatientPaymentTableProps {
  records: Array<PatientPaymentRecord>;
  filters: PaymentFilters;
  onFilterChange: (filters: PaymentFilters) => void;
  onExport: (format: 'csv' | 'pdf') => void;
  totalCount: number;
}

export function PatientPaymentTable(props: PatientPaymentTableProps): JSX.Element;
```

### Service Layer

#### DebtDashboardService

Backend service handling business logic and data aggregation.

```typescript
class DebtDashboardService {
  constructor(private db: DrizzleDB);

  async calculateStatistics(
    tenantId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<PaymentStatistics>;

  async generateAgingReport(tenantId: string): Promise<AgingReport>;

  async getPaymentPlans(
    tenantId: string,
    status?: PaymentPlanStatus
  ): Promise<PaymentPlan[]>;

  async getPaymentHistory(
    tenantId: string,
    filters: PaymentHistoryFilters
  ): Promise<PaymentHistoryResult>;

  async getPaymentMethodAnalytics(tenantId: string): Promise<PaymentMethodAnalytics>;

  async exportReport(
    tenantId: string,
    format: 'csv' | 'pdf',
    reportType: string,
    filters: any
  ): Promise<Buffer>;
}
```

## Data Models

### TypeScript Types

```typescript
// Payment Record
interface PaymentRecord {
  id: string;
  tenantId: string;
  patientId: string;
  appointmentId: string | null;
  amountCents: number;
  paymentMethod: 'cash' | 'check' | 'credit_card' | 'debit_card' | 'electronic_transfer';
  paymentDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Payment Plan
interface PaymentPlan {
  id: string;
  tenantId: string;
  patientId: string;
  totalAmountCents: number;
  installmentAmountCents: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  startDate: string;
  nextPaymentDate: string;
  status: 'active' | 'completed' | 'delinquent' | 'cancelled';
  onTimePayments: number;
  latePayments: number;
  createdAt: string;
  updatedAt: string;
}

// Payment Statistics
interface PaymentStatistics {
  totalPaidCents: number;
  totalUnpaidCents: number;
  collectionRate: number;
  patientsWithBalance: number;
  averageDebtCents: number;
  lastUpdated: string;
}

// Aging Report
interface AgingReport {
  buckets: Array<{
    range: '0-30' | '31-60' | '61-90' | '90+';
    totalAmountCents: number;
    patientCount: number;
    percentage: number;
  }>;
  lastUpdated: string;
}

// Payment History Filters
interface PaymentHistoryFilters {
  patientId?: string;
  startDate?: string;
  endDate?: string;
  paymentStatus?: 'paid' | 'unpaid' | 'partially_paid';
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

// Patient Payment Record (aggregated view)
interface PatientPaymentRecord {
  patientId: string;
  patientName: string;
  totalDebtCents: number;
  paidCents: number;
  unpaidCents: number;
  paymentStatus: 'paid' | 'unpaid' | 'partially_paid';
  lastPaymentDate: string | null;
  payments: Array<{
    id: string;
    amountCents: number;
    paymentMethod: string;
    paymentDate: string;
    remainingBalanceCents: number;
  }>;
}

// Payment Method Analytics
interface PaymentMethodAnalytics {
  methods: Array<{
    method: string;
    totalAmountCents: number;
    transactionCount: number;
    averageAmountCents: number;
    percentage: number;
  }>;
}
```

### Database Relationships

```
tenants (1) ──< (many) payment_records
tenants (1) ──< (many) payment_plans
patients (1) ──< (many) payment_records
patients (1) ──< (many) payment_plans
appointments (1) ──< (0..1) payment_records
```

### Data Validation

All API inputs will be validated using Zod schemas:

```typescript
const paymentHistoryFiltersSchema = z.object({
  patientId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  paymentStatus: z.enum(['paid', 'unpaid', 'partially_paid']).optional(),
  minAmount: z.number().int().nonnegative().optional(),
  maxAmount: z.number().int().nonnegative().optional(),
  search: z.string().max(100).optional(),
});

const exportRequestSchema = z.object({
  format: z.enum(['csv', 'pdf']),
  reportType: z.enum(['statistics', 'aging', 'payment-history', 'payment-plans']),
  filters: z.record(z.any()).optional(),
});
```

