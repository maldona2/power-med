# Implementation Plan: Patient Debt Management Dashboard

## Overview

This implementation plan breaks down the Patient Debt Management Dashboard feature into discrete coding tasks. The feature adds comprehensive financial analytics and reporting capabilities to the existing healthcare application, including payment tracking, aging reports, payment plans, and export functionality.

The implementation follows the existing architecture patterns: TypeScript backend with Express and Drizzle ORM, React frontend with shadcn/ui components, and multi-tenant data isolation.

## Tasks

- [ ] 1. Set up database schema and migrations
  - [ ] 1.1 Create payment_records table schema
    - Add payment_records table to backend/src/db/schema.ts with all fields (id, tenantId, patientId, appointmentId, amountCents, paymentMethod, paymentDate, notes, timestamps)
    - Add indexes for tenantId, patientId, and paymentDate
    - Add foreign key relationships to tenants, patients, and appointments tables
    - _Requirements: 1.1, 1.3, 8.1, 10.1_
  
  - [ ] 1.2 Create payment_plans table schema
    - Add payment_plans table to backend/src/db/schema.ts with all fields (id, tenantId, patientId, totalAmountCents, installmentAmountCents, frequency, startDate, nextPaymentDate, status, onTimePayments, latePayments, timestamps)
    - Add indexes for tenantId, patientId, and status
    - Add foreign key relationships to tenants and patients tables
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 1.3 Generate and test database migration
    - Create Drizzle migration file for both new tables
    - Test migration runs successfully on development database
    - Verify all indexes and foreign keys are created correctly
    - _Requirements: 1.1, 5.1_

- [ ] 2. Implement backend service layer
  - [ ] 2.1 Create DebtDashboardService class
    - Create backend/src/services/debtDashboardService.ts
    - Implement constructor with database dependency injection
    - Add tenant isolation helper methods
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ] 2.2 Implement calculateStatistics method
    - Query payment_records and appointments tables with tenant filtering
    - Calculate totalPaidCents, totalUnpaidCents, collectionRate
    - Calculate patientsWithBalance and averageDebtCents
    - Support optional date range filtering
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ]* 2.3 Write property test for calculateStatistics
    - **Property 1: Statistics sum consistency**
    - **Validates: Requirements 2.1, 2.2**
    - Test that totalPaidCents + totalUnpaidCents equals total debt across all patients
    - Test that collectionRate = (totalPaidCents / (totalPaidCents + totalUnpaidCents)) * 100
  
  - [ ] 2.4 Implement generateAgingReport method
    - Query unpaid debts and calculate days outstanding
    - Categorize into buckets: 0-30, 31-60, 61-90, 90+ days
    - Calculate totalAmountCents, patientCount, and percentage for each bucket
    - _Requirements: 4.1, 4.2, 4.3, 4.5_
  
  - [ ]* 2.5 Write property test for generateAgingReport
    - **Property 2: Aging bucket completeness**
    - **Validates: Requirements 4.1, 4.2, 4.3**
    - Test that sum of all bucket amounts equals total unpaid debt
    - Test that sum of all bucket patient counts equals total patients with unpaid debt
    - Test that all percentages sum to 100%
  
  - [ ] 2.6 Implement getPaymentPlans method
    - Query payment_plans table with tenant filtering
    - Support optional status filtering
    - Join with patients table to get patient names
    - Calculate completionPercentage based on payments made
    - _Requirements: 5.1, 5.2, 5.4, 5.5_
  
  - [ ]* 2.7 Write property test for payment plan completion calculation
    - **Property 3: Completion percentage bounds**
    - **Validates: Requirements 5.2**
    - Test that completionPercentage is always between 0 and 100
    - Test that completed plans have completionPercentage = 100
  
  - [ ] 2.8 Implement getPaymentHistory method
    - Query payment_records with complex filtering (patientId, date range, payment status, amount range, search)
    - Aggregate payments by patient
    - Calculate totalDebtCents, paidCents, unpaidCents per patient
    - Determine paymentStatus based on paid/unpaid ratio
    - Return paginated results with totalCount
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 2.9 Write property test for payment status classification
    - **Property 4: Payment status consistency**
    - **Validates: Requirements 1.5**
    - Test that status='paid' when unpaidCents = 0
    - Test that status='unpaid' when paidCents = 0
    - Test that status='partially_paid' when both paidCents > 0 and unpaidCents > 0
  
  - [ ] 2.10 Implement getPaymentMethodAnalytics method
    - Query payment_records grouped by paymentMethod
    - Calculate totalAmountCents, transactionCount, averageAmountCents per method
    - Calculate percentage of total for each method
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 2.11 Write unit tests for DebtDashboardService
    - Test multi-tenant isolation (queries only return data for specified tenantId)
    - Test date range filtering
    - Test edge cases (no payments, no patients, empty results)
    - _Requirements: 10.1_

- [ ] 3. Checkpoint - Ensure service layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement backend API routes
  - [ ] 4.1 Create debt-dashboard routes file
    - Create backend/src/routes/debtDashboard.ts
    - Set up Express router with authentication middleware
    - Add tenant extraction from authenticated user
    - _Requirements: 10.1, 10.2_
  
  - [ ] 4.2 Implement GET /api/debt-dashboard/statistics endpoint
    - Add route handler with optional startDate/endDate query params
    - Validate query parameters using Zod schema
    - Call debtDashboardService.calculateStatistics
    - Return JSON response with statistics and lastUpdated timestamp
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ] 4.3 Implement GET /api/debt-dashboard/aging-report endpoint
    - Add route handler
    - Call debtDashboardService.generateAgingReport
    - Return JSON response with buckets and lastUpdated timestamp
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 4.4 Implement GET /api/debt-dashboard/payment-plans endpoint
    - Add route handler with optional status query param
    - Validate status parameter
    - Call debtDashboardService.getPaymentPlans
    - Return JSON response with plans array
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 4.5 Implement GET /api/debt-dashboard/payment-history endpoint
    - Add route handler with multiple query params (patientId, startDate, endDate, paymentStatus, minAmount, maxAmount, search)
    - Validate all query parameters using Zod schema
    - Call debtDashboardService.getPaymentHistory
    - Return JSON response with records array and totalCount
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ] 4.6 Implement GET /api/debt-dashboard/payment-methods endpoint
    - Add route handler
    - Call debtDashboardService.getPaymentMethodAnalytics
    - Return JSON response with methods array
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 4.7 Implement POST /api/debt-dashboard/export endpoint
    - Add route handler accepting format, reportType, and filters in request body
    - Validate request body using Zod schema
    - Call debtDashboardService.exportReport
    - Set appropriate Content-Type and Content-Disposition headers
    - Return file buffer as response
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 4.8 Register debt-dashboard routes in app.ts
    - Import debtDashboard router
    - Mount router at /api/debt-dashboard path
    - Ensure authentication middleware is applied
    - _Requirements: 10.1_
  
  - [ ]* 4.9 Write integration tests for API endpoints
    - Test authentication requirement (401 without token)
    - Test tenant isolation (cannot access other tenant's data)
    - Test input validation (400 for invalid parameters)
    - Test successful responses (200 with correct data structure)
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 5. Implement export functionality
  - [ ] 5.1 Create CSV export utility
    - Create backend/src/utils/csvExporter.ts
    - Implement function to convert statistics data to CSV format
    - Implement function to convert aging report to CSV format
    - Implement function to convert payment history to CSV format
    - Implement function to convert payment plans to CSV format
    - _Requirements: 7.1, 7.3, 7.4_
  
  - [ ] 5.2 Create PDF export utility
    - Create backend/src/utils/pdfExporter.ts
    - Implement function to generate PDF from statistics data
    - Implement function to generate PDF from aging report
    - Implement function to generate PDF from payment history
    - Implement function to generate PDF from payment plans
    - Include proper formatting, headers, and footers
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [ ] 5.3 Implement exportReport method in DebtDashboardService
    - Accept format (csv/pdf), reportType, and filters
    - Fetch appropriate data based on reportType
    - Call CSV or PDF exporter based on format
    - Return buffer with generated file
    - Generate filename with export date and report type
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 5.4 Write unit tests for export utilities
    - Test CSV generation produces valid CSV format
    - Test PDF generation produces valid PDF file
    - Test filename generation includes date and report type
    - Test filtered data is correctly included in exports
    - _Requirements: 7.3, 7.4, 7.5_

- [ ] 6. Checkpoint - Ensure backend implementation is complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Create frontend TypeScript types and API client
  - [ ] 7.1 Define TypeScript interfaces
    - Create frontend/src/types/debtDashboard.ts
    - Define PaymentRecord, PaymentPlan, PaymentStatistics, AgingReport, PatientPaymentRecord, PaymentMethodAnalytics interfaces
    - Define PaymentHistoryFilters, ExportRequest types
    - _Requirements: 1.1, 1.3, 2.1, 4.1, 5.1, 8.1_
  
  - [ ] 7.2 Create API client functions
    - Create frontend/src/lib/debtDashboardApi.ts
    - Implement fetchStatistics(startDate?, endDate?)
    - Implement fetchAgingReport()
    - Implement fetchPaymentPlans(status?)
    - Implement fetchPaymentHistory(filters)
    - Implement fetchPaymentMethodAnalytics()
    - Implement exportReport(format, reportType, filters)
    - Add proper error handling and type safety
    - _Requirements: 1.1, 2.1, 4.1, 5.1, 7.1, 7.2, 8.1_

- [ ] 8. Create custom React hooks for data fetching
  - [ ] 8.1 Create useDebtStatistics hook
    - Create frontend/src/hooks/useDebtStatistics.ts
    - Implement hook with optional date range parameters
    - Handle loading, error, and data states
    - Implement auto-refresh every 5 seconds
    - _Requirements: 2.1, 9.1, 9.2, 9.4_
  
  - [ ] 8.2 Create useAgingReport hook
    - Create frontend/src/hooks/useAgingReport.ts
    - Implement hook with auto-refresh
    - Handle loading, error, and data states
    - _Requirements: 4.1, 9.1, 9.2, 9.4_
  
  - [ ] 8.3 Create usePaymentPlans hook
    - Create frontend/src/hooks/usePaymentPlans.ts
    - Implement hook with optional status filter
    - Handle loading, error, and data states
    - Implement auto-refresh every 5 seconds
    - _Requirements: 5.1, 9.1, 9.2, 9.4_
  
  - [ ] 8.4 Create usePaymentHistory hook
    - Create frontend/src/hooks/usePaymentHistory.ts
    - Implement hook with filters parameter
    - Handle loading, error, and data states
    - Implement debounced search to avoid excessive API calls
    - _Requirements: 1.1, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 9.1, 9.2_
  
  - [ ] 8.5 Create usePaymentMethodAnalytics hook
    - Create frontend/src/hooks/usePaymentMethodAnalytics.ts
    - Implement hook with auto-refresh
    - Handle loading, error, and data states
    - _Requirements: 8.1, 9.1, 9.2, 9.4_

- [ ] 9. Implement frontend UI components - Statistics and Charts
  - [ ] 9.1 Create PaymentStatisticsCard component
    - Create frontend/src/components/debt-dashboard/PaymentStatisticsCard.tsx
    - Display totalPaidCents, totalUnpaidCents, collectionRate, patientsWithBalance, averageDebtCents
    - Format currency values properly (cents to dollars)
    - Show loading skeleton when data is loading
    - Display lastUpdated timestamp
    - Use shadcn/ui Card component
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 9.4_
  
  - [ ] 9.2 Create PaymentChartsSection component
    - Create frontend/src/components/debt-dashboard/PaymentChartsSection.tsx
    - Implement chart type toggle (pie, bar, line)
    - Use Recharts library for all visualizations
    - Create PaidVsUnpaidChart sub-component (pie chart)
    - Create PaymentTrendsChart sub-component (line chart)
    - Create DebtDistributionChart sub-component (bar chart)
    - Create PaymentMethodsChart sub-component (pie chart)
    - Add interactive tooltips showing detailed information
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.2_
  
  - [ ]* 9.3 Write unit tests for statistics and chart components
    - Test currency formatting displays correctly
    - Test loading states render skeleton
    - Test chart type toggle changes visualization
    - Test tooltips display on hover
    - _Requirements: 3.4, 3.5_

- [ ] 10. Implement frontend UI components - Aging Report
  - [ ] 10.1 Create AgingReportTable component
    - Create frontend/src/components/debt-dashboard/AgingReportTable.tsx
    - Display aging buckets in table format with columns: Range, Amount, Patient Count, Percentage
    - Highlight 90+ days bucket with warning color
    - Make rows clickable to drill down into patient list
    - Format currency and percentage values
    - Use shadcn/ui Table component
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 10.2 Create AgingReportPatientList component
    - Create frontend/src/components/debt-dashboard/AgingReportPatientList.tsx
    - Display filtered patient list when aging bucket is clicked
    - Show patient name, total debt, days outstanding
    - Implement back button to return to aging report
    - Use shadcn/ui Dialog or Sheet component
    - _Requirements: 4.4_

- [ ] 11. Implement frontend UI components - Payment Plans
  - [ ] 11.1 Create PaymentPlanList component
    - Create frontend/src/components/debt-dashboard/PaymentPlanList.tsx
    - Display payment plans in card or table format
    - Show patient name, total amount, installment amount, frequency, next payment date
    - Display progress bar showing completionPercentage
    - Show on-time vs late payment counts
    - Add status filter dropdown (active, completed, delinquent, cancelled)
    - Highlight delinquent plans with warning indicator
    - Use shadcn/ui Card or Table component
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 11.2 Write unit tests for payment plan components
    - Test progress bar displays correct percentage
    - Test delinquent indicator appears for missed payments
    - Test status filter updates displayed plans
    - _Requirements: 5.2, 5.3_

- [ ] 12. Implement frontend UI components - Payment History Table
  - [ ] 12.1 Create PatientPaymentTable component
    - Create frontend/src/components/debt-dashboard/PatientPaymentTable.tsx
    - Display patient payment records in sortable table
    - Columns: Patient Name, Total Debt, Paid, Unpaid, Status, Last Payment Date
    - Implement sorting by clicking column headers
    - Add visual indicators for payment status (paid=green, unpaid=red, partially_paid=yellow)
    - Make rows expandable to show individual payment transactions
    - Use shadcn/ui Table component with sorting
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 12.2 Create PaymentFilters component
    - Create frontend/src/components/debt-dashboard/PaymentFilters.tsx
    - Add search input for patient name/ID
    - Add payment status dropdown filter (all, paid, unpaid, partially_paid)
    - Add date range picker for filtering by date
    - Add amount range inputs (min/max)
    - Display count of filtered records
    - Use shadcn/ui Input, Select, and DatePicker components
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ] 12.3 Create ExportButton component
    - Create frontend/src/components/debt-dashboard/ExportButton.tsx
    - Add dropdown menu with CSV and PDF options
    - Trigger download when format is selected
    - Show loading indicator during export generation
    - Display success/error toast messages
    - Use shadcn/ui DropdownMenu and Button components
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ]* 12.4 Write unit tests for payment table and filters
    - Test sorting changes row order
    - Test filters update displayed records
    - Test search input filters by patient name
    - Test record count updates with filters
    - _Requirements: 1.4, 6.5, 6.6_

- [ ] 13. Checkpoint - Ensure frontend components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Create main dashboard page and integrate components
  - [ ] 14.1 Create DebtDashboardPage component
    - Create frontend/src/pages/DebtDashboardPage.tsx
    - Set up page layout with responsive grid
    - Integrate PaymentStatisticsCard at top
    - Add tabs or sections for different views (Overview, Aging Report, Payment Plans, Payment History)
    - Implement manual refresh button
    - Display stale data warning when refresh fails
    - Use shadcn/ui Tabs component for navigation
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 9.3, 9.4, 9.5_
  
  - [ ] 14.2 Integrate all data hooks in DebtDashboardPage
    - Use useDebtStatistics hook for statistics section
    - Use useAgingReport hook for aging report section
    - Use usePaymentPlans hook for payment plans section
    - Use usePaymentHistory hook for payment history section
    - Use usePaymentMethodAnalytics hook for charts section
    - Handle loading states across all sections
    - Handle error states with user-friendly messages
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ] 14.3 Add route for DebtDashboardPage
    - Update frontend/src/App.tsx to add route for /debt-dashboard
    - Ensure route is protected (requires authentication)
    - Add navigation link in main menu/sidebar
    - _Requirements: 10.1_
  
  - [ ]* 14.4 Write integration tests for DebtDashboardPage
    - Test page renders all sections
    - Test manual refresh button triggers data reload
    - Test stale data warning appears on error
    - Test navigation between tabs works
    - _Requirements: 9.3, 9.4, 9.5_

- [ ] 15. Implement security and access control
  - [ ] 15.1 Add authentication checks to all API endpoints
    - Verify JWT token is present and valid
    - Extract tenantId from authenticated user
    - Return 401 Unauthorized if authentication fails
    - _Requirements: 10.1_
  
  - [ ] 15.2 Implement audit logging for data access
    - Create logging utility in backend/src/utils/auditLogger.ts
    - Log all API requests with userId, tenantId, endpoint, and timestamp
    - Store logs in database or external logging service
    - _Requirements: 10.2_
  
  - [ ] 15.3 Add permission checks for sensitive operations
    - Implement role-based access control for export functionality
    - Check user permissions before allowing data export
    - Return 403 Forbidden if user lacks permissions
    - _Requirements: 10.3, 10.4_
  
  - [ ] 15.4 Implement auto-logout for inactive users
    - Add inactivity timer in frontend
    - Track user interactions (mouse, keyboard events)
    - Trigger logout after 15 minutes of inactivity
    - Show warning before auto-logout
    - _Requirements: 10.5_
  
  - [ ]* 15.5 Write security tests
    - Test tenant isolation (user cannot access other tenant's data)
    - Test authentication requirement on all endpoints
    - Test audit logs are created for all access
    - Test permission checks prevent unauthorized exports
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 16. Final integration and testing
  - [ ] 16.1 Test end-to-end user flows
    - Test viewing dashboard statistics
    - Test filtering and searching payment history
    - Test drilling down into aging report buckets
    - Test viewing payment plan details
    - Test exporting reports in CSV and PDF formats
    - Test real-time data updates
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1_
  
  - [ ] 16.2 Verify multi-tenant isolation
    - Create test data for multiple tenants
    - Verify each tenant only sees their own data
    - Test switching between tenant accounts
    - _Requirements: 10.1_
  
  - [ ] 16.3 Test performance with large datasets
    - Create test data with 1000+ patients and 10000+ payment records
    - Verify dashboard loads within acceptable time (< 3 seconds)
    - Verify filtering and sorting remain responsive
    - Verify exports complete successfully with large datasets
    - _Requirements: 9.1, 9.2_
  
  - [ ] 16.4 Verify HIPAA compliance requirements
    - Ensure all patient data is encrypted in transit (HTTPS)
    - Verify audit logs capture all data access
    - Test auto-logout functionality
    - Verify exported reports mask sensitive data appropriately
    - _Requirements: 10.1, 10.2, 10.4, 10.5_

- [ ] 17. Final checkpoint - Ensure all tests pass and feature is complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties for critical business logic
- Unit tests validate specific examples and edge cases
- Integration tests verify end-to-end functionality
- The implementation follows existing codebase patterns (Express routes, Drizzle ORM, React hooks, shadcn/ui components)
- All currency values are stored in cents to avoid floating-point precision issues
- Multi-tenant isolation is enforced at the database query level using tenantId filtering
- Real-time updates use client-side polling with 5-second intervals
- Export functionality generates files server-side and streams to client
