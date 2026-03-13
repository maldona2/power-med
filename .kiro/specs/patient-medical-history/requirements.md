# Requirements Document

## Introduction

This feature adds simple medical history tracking to the AnamnesIA patient management system. The design prioritizes speed and simplicity for busy doctors who need to quickly record essential patient information during appointments.

The system tracks three core categories: medical conditions, medications, and allergies. All fields except the primary name/title are optional, allowing doctors to add as much or as little detail as needed. The system is designed for future AI voice input where doctors can quickly dictate entries like "Patient has diabetes" or "Allergic to penicillin."

## Glossary

- **Medical_History_System**: The subsystem responsible for storing and managing patient medical records
- **Medical_Condition**: Any diagnosis or health condition (acute or chronic)
- **Medication**: A current or past drug treatment
- **Allergy**: A documented allergic reaction to medications, foods, or other substances
- **Tenant**: An isolated workspace for a single healthcare professional or practice

## Requirements

### Requirement 1: Track Medical Conditions

**User Story:** As a doctor, I want to quickly record patient conditions, so that I can maintain essential medical history without complex data entry.

#### Acceptance Criteria

1. THE Medical_History_System SHALL store medical condition records with condition_name (required), diagnosed_date (optional), and notes (optional)
2. WHEN a condition is created, THE Medical_History_System SHALL associate it with a patient_id and tenant_id
3. THE Medical_History_System SHALL allow multiple conditions per patient
4. WHEN retrieving a patient record, THE Medical_History_System SHALL include all associated conditions ordered by created_at descending
5. THE Medical_History_System SHALL record created_at and updated_at timestamps for each condition

### Requirement 2: Track Medications

**User Story:** As a doctor, I want to quickly record patient medications with minimal required fields, so that I can document treatments without slowing down appointments.

#### Acceptance Criteria

1. THE Medical_History_System SHALL store medication records with medication_name (required), dosage (optional), and notes (optional)
2. WHEN a medication is created, THE Medical_History_System SHALL associate it with a patient_id and tenant_id
3. THE Medical_History_System SHALL allow multiple medications per patient
4. WHEN retrieving a patient record, THE Medical_History_System SHALL include all associated medications ordered by created_at descending
5. THE Medical_History_System SHALL record created_at and updated_at timestamps for each medication

### Requirement 3: Track Allergies

**User Story:** As a doctor, I want to quickly record patient allergies with simple categorization, so that I can document safety concerns efficiently.

#### Acceptance Criteria

1. THE Medical_History_System SHALL store allergy records with allergen_name (required), allergy_type (medication/food/other), and notes (optional)
2. WHEN an allergy is created, THE Medical_History_System SHALL associate it with a patient_id and tenant_id
3. THE Medical_History_System SHALL allow multiple allergies per patient
4. WHEN retrieving a patient record, THE Medical_History_System SHALL include all associated allergies ordered by allergen_name ascending
5. THE Medical_History_System SHALL record created_at and updated_at timestamps for each allergy
6. THE Medical_History_System SHALL default allergy_type to "other" if not specified

### Requirement 4: Maintain Multi-Tenant Data Isolation

**User Story:** As a doctor, I want my patient medical records isolated from other professionals, so that patient privacy is maintained.

#### Acceptance Criteria

1. WHEN creating any medical history entry, THE Medical_History_System SHALL require a valid tenant_id
2. WHEN querying medical history entries, THE Medical_History_System SHALL filter results by tenant_id
3. THE Medical_History_System SHALL prevent access to medical history entries from different tenants
4. WHEN a patient is deleted, THE Medical_History_System SHALL cascade delete all associated medical history entries

### Requirement 5: Integrate with Patient Detail View

**User Story:** As a doctor, I want to view medical history when viewing patient details, so that I have essential information during appointments.

#### Acceptance Criteria

1. WHEN retrieving patient details by patient_id, THE Medical_History_System SHALL include conditions, medications, and allergies
2. THE Medical_History_System SHALL return medical history alongside existing appointment history
3. WHEN no medical history exists for a patient, THE Medical_History_System SHALL return empty arrays for each category

### Requirement 6: Support CRUD Operations for Medical History

**User Story:** As a doctor, I want to create, update, and delete medical history entries, so that I can maintain accurate patient records.

#### Acceptance Criteria

1. THE Medical_History_System SHALL provide create operations for conditions, medications, and allergies
2. THE Medical_History_System SHALL provide update operations for all fields except patient_id and tenant_id
3. THE Medical_History_System SHALL provide delete operations that remove medical history entries by id
4. WHEN updating any medical history entry, THE Medical_History_System SHALL update the updated_at timestamp
5. WHEN performing any operation, THE Medical_History_System SHALL validate tenant_id matches the authenticated user

### Requirement 7: Minimal Field Validation

**User Story:** As a doctor, I want the system to require only essential fields, so that I can quickly add entries without unnecessary form complexity.

#### Acceptance Criteria

1. WHEN creating a condition, THE Medical_History_System SHALL require only condition_name
2. WHEN creating a medication, THE Medical_History_System SHALL require only medication_name
3. WHEN creating an allergy, THE Medical_History_System SHALL require only allergen_name
4. IF the required name field is missing or empty, THEN THE Medical_History_System SHALL return a validation error
5. THE Medical_History_System SHALL accept all optional fields as null or empty strings
