# Implementation Plan: Patient Medical History

## Overview

This plan implements medical history tracking (conditions, medications, allergies) for the AnamnesIA patient management system. The implementation follows existing patterns: Drizzle ORM with PostgreSQL, Express.js REST API with Zod validation, service layer for business logic, and multi-tenant data isolation.

## Tasks

- [x] 1. Create database schema and migration
  - Add three new tables to schema.ts: medical_conditions, medications, allergies
  - Add relations for the new tables to existing patients and tenants
  - Create migration file to add tables with proper indexes and foreign keys
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 4.1, 4.4_

- [ ] 2. Implement medical history service layer
  - [x] 2.1 Create medicalHistoryService.ts with TypeScript interfaces
    - Define row interfaces for MedicalConditionRow, MedicationRow, AllergyRow
    - Define input interfaces for create operations
    - _Requirements: 1.1, 2.1, 3.1_
  
  - [x] 2.2 Implement medical conditions CRUD operations
    - Implement listConditions, createCondition, updateCondition, deleteCondition
    - Enforce tenant isolation in all queries
    - Order results by created_at DESC
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.2, 6.1, 6.2, 6.3, 6.4_
  
  - [x] 2.3 Implement medications CRUD operations
    - Implement listMedications, createMedication, updateMedication, deleteMedication
    - Enforce tenant isolation in all queries
    - Order results by created_at DESC
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.2, 6.1, 6.2, 6.3, 6.4_
  
  - [x] 2.4 Implement allergies CRUD operations
    - Implement listAllergies, createAllergy, updateAllergy, deleteAllergy
    - Enforce tenant isolation in all queries
    - Order results by allergen_name ASC
    - Default allergy_type to "other" if not specified
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.2, 6.1, 6.2, 6.3, 6.4_

- [ ]* 3. Write property-based tests for service layer
  - [ ]* 3.1 Write property test for field storage integrity
    - **Property 1: Medical history entries store all specified fields**
    - **Validates: Requirements 1.1, 2.1, 3.1**
  
  - [ ]* 3.2 Write property test for tenant isolation
    - **Property 10: Tenant isolation in queries**
    - **Validates: Requirements 4.2, 4.3, 6.5**
  
  - [ ]* 3.3 Write property test for ordering
    - **Property 4-6: Conditions/medications/allergies retrieved in correct order**
    - **Validates: Requirements 1.4, 2.4, 3.4**
  
  - [ ]* 3.4 Write property test for round-trip integrity
    - **Property 18: Round-trip data integrity**
    - **Validates: Requirements 1.1, 2.1, 3.1**
  
  - [ ]* 3.5 Write property test for cascade deletion
    - **Property 11: Cascade deletion of medical history**
    - **Validates: Requirements 4.4**

- [ ] 4. Create API routes for medical conditions
  - [x] 4.1 Create routes/medicalConditions.ts with CRUD endpoints
    - POST /api/patients/:patientId/conditions
    - GET /api/patients/:patientId/conditions
    - PUT /api/patients/:patientId/conditions/:id
    - DELETE /api/patients/:patientId/conditions/:id
    - Apply authenticate and requireRole('professional') middleware
    - _Requirements: 1.1, 1.2, 1.3, 6.1, 6.2, 6.3_
  
  - [x] 4.2 Add Zod validation schemas for conditions
    - Create createConditionSchema with condition_name required
    - Create updateConditionSchema as partial
    - Validate diagnosed_date format if provided
    - _Requirements: 7.1, 7.4, 7.5_
  
  - [x] 4.3 Implement error handling for conditions routes
    - Return 400 for validation errors
    - Return 404 for not found
    - Return 403 for missing tenant_id
    - _Requirements: 4.1, 7.4_

- [ ] 5. Create API routes for medications
  - [x] 5.1 Create routes/medications.ts with CRUD endpoints
    - POST /api/patients/:patientId/medications
    - GET /api/patients/:patientId/medications
    - PUT /api/patients/:patientId/medications/:id
    - DELETE /api/patients/:patientId/medications/:id
    - Apply authenticate and requireRole('professional') middleware
    - _Requirements: 2.1, 2.2, 2.3, 6.1, 6.2, 6.3_
  
  - [x] 5.2 Add Zod validation schemas for medications
    - Create createMedicationSchema with medication_name required
    - Create updateMedicationSchema as partial
    - _Requirements: 7.2, 7.4, 7.5_
  
  - [x] 5.3 Implement error handling for medications routes
    - Return 400 for validation errors
    - Return 404 for not found
    - Return 403 for missing tenant_id
    - _Requirements: 4.1, 7.4_

- [ ] 6. Create API routes for allergies
  - [x] 6.1 Create routes/allergies.ts with CRUD endpoints
    - POST /api/patients/:patientId/allergies
    - GET /api/patients/:patientId/allergies
    - PUT /api/patients/:patientId/allergies/:id
    - DELETE /api/patients/:patientId/allergies/:id
    - Apply authenticate and requireRole('professional') middleware
    - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2, 6.3_
  
  - [x] 6.2 Add Zod validation schemas for allergies
    - Create createAllergySchema with allergen_name required
    - Validate allergy_type enum ('medication', 'food', 'other')
    - Create updateAllergySchema as partial
    - _Requirements: 3.1, 3.6, 7.3, 7.4, 7.5_
  
  - [x] 6.3 Implement error handling for allergies routes
    - Return 400 for validation errors
    - Return 404 for not found
    - Return 403 for missing tenant_id
    - _Requirements: 4.1, 7.4_

- [ ]* 7. Write unit tests for API routes
  - [ ]* 7.1 Write unit tests for conditions endpoints
    - Test creating condition with all fields
    - Test creating condition with only name field
    - Test updating condition
    - Test deleting condition
    - Test validation errors for missing name
    - _Requirements: 1.1, 1.2, 6.1, 6.2, 6.3, 7.1, 7.4_
  
  - [ ]* 7.2 Write unit tests for medications endpoints
    - Test creating medication with all fields
    - Test creating medication with only name field
    - Test updating medication
    - Test deleting medication
    - Test validation errors for missing name
    - _Requirements: 2.1, 2.2, 6.1, 6.2, 6.3, 7.2, 7.4_
  
  - [ ]* 7.3 Write unit tests for allergies endpoints
    - Test creating allergy with all fields
    - Test creating allergy with only name field
    - Test allergy_type defaults to "other"
    - Test updating allergy
    - Test deleting allergy
    - Test validation errors for missing name
    - _Requirements: 3.1, 3.2, 3.6, 6.1, 6.2, 6.3, 7.3, 7.4_

- [ ] 8. Integrate medical history with patient detail endpoint
  - [x] 8.1 Update patientService.getById to fetch medical history
    - Add parallel queries for conditions, medications, allergies
    - Return medical_history object with three arrays
    - Return empty arrays when no medical history exists
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 8.2 Update patient detail response type
    - Add medical_history field to return type
    - Include conditions, medications, allergies arrays
    - _Requirements: 5.1_

- [ ]* 9. Write integration tests for patient detail endpoint
  - [ ]* 9.1 Write test for patient with medical history
    - **Property 12: Patient retrieval includes medical history**
    - **Validates: Requirements 5.1, 5.2**
  
  - [ ]* 9.2 Write test for patient without medical history
    - Verify empty arrays returned for each category
    - **Validates: Requirements 5.3**
  
  - [ ]* 9.3 Write test for cascade deletion
    - Create patient with medical history entries
    - Delete patient and verify all medical history deleted
    - **Property 11: Cascade deletion of medical history**
    - **Validates: Requirements 4.4**

- [ ] 10. Register new routes in main application
  - [x] 10.1 Import and mount medical history routes
    - Import medicalConditions, medications, allergies route modules
    - Mount at /api/patients/:patientId/conditions, /medications, /allergies
    - Ensure routes are registered after authentication middleware
    - _Requirements: 6.1_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Run all unit tests and property-based tests
  - Verify database migrations apply successfully
  - Test all API endpoints manually or with integration tests
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests use fast-check with minimum 100 iterations
- All routes follow existing authentication and authorization patterns
- Database schema follows existing Drizzle ORM patterns with cascade deletion
- Service layer enforces tenant isolation on all operations
