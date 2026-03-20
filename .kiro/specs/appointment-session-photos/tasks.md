# Tasks: Appointment Session Photos

## Task List

- [x] 1. Database schema and migration
  - [x] 1.1 Add `session_photos` table to `backend/src/db/schema.ts` with all columns, indexes, and relations
  - [x] 1.2 Create Drizzle migration file for the `session_photos` table
  - [x] 1.3 Export `sessionPhotos` table and types from `backend/src/db/client.ts`

- [x] 2. AWS S3 utility
  - [x] 2.1 Add AWS S3 environment variables to `.env` and document them
  - [x] 2.2 Create `backend/src/utils/s3.ts` with `generateUploadPresignedUrl`, `generateReadPresignedUrl`, and `deleteObject` functions using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`

- [x] 3. Session photo service
  - [x] 3.1 Create `backend/src/services/sessionPhotoService.ts` with `createUploadUrl`, `confirmUpload`, `listPhotos`, `deletePhoto`, and `deleteStalePhendingPhotos` functions
  - [x] 3.2 Implement tenant isolation in all service functions (filter by `tenant_id`)
  - [x] 3.3 Implement S3 deletion error handling in `deletePhoto` (log error, still delete DB record)

- [x] 4. Session photo routes
  - [x] 4.1 Create `backend/src/routes/sessionPhotos.ts` with POST `/upload-url`, POST `/:photoId/confirm`, GET `/`, and DELETE `/:photoId` endpoints
  - [x] 4.2 Add Zod validation schemas for upload request (file_name, file_size_bytes, mime_type)
  - [x] 4.3 Register the route in `backend/src/app.ts` at `/api/sessions/:sessionId/photos`

- [x] 5. Background cleanup job
  - [x] 5.1 Create `backend/src/jobs/cleanupPendingPhotos.ts` that calls `deleteStalePhendingPhotos` from the service
  - [x] 5.2 Schedule the job to run every 30 minutes in `backend/src/index.ts`

- [x] 6. Backend tests
  - [x] 6.1 Write unit tests for `sessionPhotoService.ts` with mocked DB and S3 (all functions including edge cases)
  - [x] 6.2 Write unit tests for `s3.ts` utility with mocked AWS SDK
  - [x] 6.3 Write unit tests for route validation (invalid mime type, oversized file, missing fields)
  - [x] 6.4 Write property-based tests for `sessionPhotoService.ts` covering Properties 1–14 using fast-check

- [x] 7. Frontend hook
  - [x] 7.1 Create `frontend/src/hooks/useSessionPhotos.ts` with `photos`, `loading`, `uploadPhoto`, `deletePhoto`, and `refetch`
  - [x] 7.2 Implement the two-phase upload in `uploadPhoto`: request presigned URL → PUT to S3 → confirm

- [x] 8. Frontend component
  - [x] 8.1 Create `frontend/src/components/sessions/SessionPhotoGallery.tsx` with photo grid, upload button, and delete controls
  - [x] 8.2 Integrate `SessionPhotoGallery` into `AppointmentDetailPage.tsx` when a session exists

- [x] 9. Frontend types
  - [x] 9.1 Add `SessionPhoto` interface to `frontend/src/types/index.ts`
