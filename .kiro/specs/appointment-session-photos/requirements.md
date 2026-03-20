# Requirements Document

## Introduction

This feature adds photo upload capability to appointment sessions (medical records) in the AnamnesIA system. Doctors can upload, view, and manage photos directly within a session record to visually track patient progress across appointments. Photos are stored in AWS S3 and referenced in the database, keeping the system performant and storage-efficient.

## Glossary

- **Photo_System**: The subsystem responsible for managing session photo uploads, storage, and retrieval
- **Session**: A medical record associated with a specific appointment, containing procedures performed, recommendations, and clinical notes
- **Session_Photo**: A photo record linked to a session, storing metadata and the S3 reference key
- **S3_Storage**: AWS S3 bucket used as the persistent storage backend for photo files
- **Presigned_URL**: A time-limited, signed AWS S3 URL that grants temporary access to upload or view a specific object
- **Tenant**: An isolated workspace for a single healthcare professional or practice

## Requirements

### Requirement 1: Upload Photos to a Session

**User Story:** As a doctor, I want to upload photos during or after an appointment session, so that I can visually document patient progress over time.

#### Acceptance Criteria

1. WHEN a doctor requests to upload a photo for a session, THE Photo_System SHALL generate a presigned S3 upload URL valid for 5 minutes
2. WHEN a presigned upload URL is generated, THE Photo_System SHALL associate the pending photo record with the session_id, patient_id, and tenant_id
3. THE Photo_System SHALL accept photo files in JPEG, PNG, and WEBP formats only
4. THE Photo_System SHALL enforce a maximum file size of 10 MB per photo
5. WHEN a photo upload is confirmed, THE Photo_System SHALL store the S3 object key, file name, file size in bytes, MIME type, and upload timestamp in the database
6. THE Photo_System SHALL allow multiple photos per session

### Requirement 2: View Photos in a Session

**User Story:** As a doctor, I want to view all photos attached to a session, so that I can review visual records during follow-up appointments.

#### Acceptance Criteria

1. WHEN a doctor requests photos for a session, THE Photo_System SHALL return all confirmed photo records associated with that session_id
2. WHEN returning photo records, THE Photo_System SHALL generate a presigned S3 read URL valid for 60 minutes for each photo
3. WHEN a session has no photos, THE Photo_System SHALL return an empty array
4. THE Photo_System SHALL return photos ordered by uploaded_at ascending

### Requirement 3: Delete a Session Photo

**User Story:** As a doctor, I want to delete a photo from a session, so that I can remove incorrect or irrelevant images.

#### Acceptance Criteria

1. WHEN a doctor requests to delete a photo, THE Photo_System SHALL delete the photo record from the database
2. WHEN a photo record is deleted, THE Photo_System SHALL delete the corresponding object from S3_Storage
3. IF the S3 object deletion fails, THEN THE Photo_System SHALL log the error and still remove the database record to avoid orphaned metadata
4. WHEN deleting a photo, THE Photo_System SHALL verify the photo belongs to the authenticated user's tenant_id before proceeding

### Requirement 4: Maintain Multi-Tenant Data Isolation

**User Story:** As a doctor, I want my session photos isolated from other professionals, so that patient privacy is maintained.

#### Acceptance Criteria

1. WHEN storing a photo, THE Photo_System SHALL scope the S3 object key under a tenant-specific path using the pattern `tenants/{tenant_id}/sessions/{session_id}/{filename}`
2. WHEN querying session photos, THE Photo_System SHALL filter results by tenant_id
3. THE Photo_System SHALL prevent access to photos belonging to a different tenant_id than the authenticated user
4. WHEN a session is deleted, THE Photo_System SHALL cascade delete all associated session photo records

### Requirement 5: Integrate with Session Detail View

**User Story:** As a doctor, I want to see photos when viewing a session record, so that visual and clinical data are available together.

#### Acceptance Criteria

1. WHEN retrieving a session by session_id, THE Photo_System SHALL include the list of confirmed photo records with presigned read URLs
2. THE Photo_System SHALL return photo metadata (id, file_name, file_size_bytes, mime_type, uploaded_at) alongside each presigned URL
3. WHEN no photos exist for a session, THE Photo_System SHALL return an empty photos array within the session response

### Requirement 6: Confirm Photo Upload Completion

**User Story:** As a doctor, I want the system to track which photos have been successfully uploaded, so that incomplete uploads are not shown in the session.

#### Acceptance Criteria

1. WHEN a presigned upload URL is generated, THE Photo_System SHALL create a photo record with status "pending"
2. WHEN the client confirms a successful upload, THE Photo_System SHALL update the photo record status to "confirmed"
3. WHEN retrieving session photos, THE Photo_System SHALL return only photo records with status "confirmed"
4. THE Photo_System SHALL automatically delete photo records with status "pending" that are older than 1 hour

### Requirement 7: Validate Upload Requests

**User Story:** As a doctor, I want the system to validate photo upload requests, so that only valid files are accepted.

#### Acceptance Criteria

1. WHEN a photo upload is requested, THE Photo_System SHALL require file_name, file_size_bytes, and mime_type fields
2. IF the mime_type is not one of image/jpeg, image/png, or image/webp, THEN THE Photo_System SHALL return a validation error
3. IF the file_size_bytes exceeds 10,485,760 bytes (10 MB), THEN THE Photo_System SHALL return a validation error
4. IF the session_id does not belong to the authenticated user's tenant, THEN THE Photo_System SHALL return a 403 Forbidden error
