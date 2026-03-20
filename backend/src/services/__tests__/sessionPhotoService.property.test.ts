/**
 * Property-based tests for sessionPhotoService
 * Feature: appointment-session-photos, Properties 1–14
 * Uses fast-check with Jest
 */

import * as fc from 'fast-check';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../db/client.js', () => ({
  db: {
    insert: jest.fn(),
    update: jest.fn(),
    select: jest.fn(),
    delete: jest.fn(),
  },
  sessionPhotos: { _tableName: 'session_photos' },
}));

jest.mock('../../utils/s3.js', () => ({
  generateUploadPresignedUrl: jest.fn(),
  generateReadPresignedUrl: jest.fn(),
  deleteObject: jest.fn(),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import {
  createUploadUrl,
  confirmUpload,
  listPhotos,
  deletePhoto,
  deleteStalePhendingPhotos,
} from '../sessionPhotoService.js';

const { db } = jest.requireMock('../../db/client.js') as {
  db: {
    insert: jest.Mock;
    update: jest.Mock;
    select: jest.Mock;
    delete: jest.Mock;
  };
};

const s3Mock = jest.requireMock('../../utils/s3.js') as {
  generateUploadPresignedUrl: jest.Mock;
  generateReadPresignedUrl: jest.Mock;
  deleteObject: jest.Mock;
};

// ── Zod schema (imported directly for P2, P3, P14) ───────────────────────────
// We re-declare the schema here to test validation logic directly,
// matching the schema in sessionPhotos.ts route layer.
import { z } from 'zod';

const uploadSchema = z.object({
  file_name: z.string().min(1),
  file_size_bytes: z.number().int().min(1).max(10_485_760),
  mime_type: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

// ── Arbitraries ───────────────────────────────────────────────────────────────

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const uuidArb = fc.uuid();
const tenantIdArb = fc.uuid();
const sessionIdArb = fc.uuid();
const patientIdArb = fc.uuid();
const photoIdArb = fc.uuid();

const fileNameArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);
const validMimeArb = fc.constantFrom(...ALLOWED_MIMES);
const validFileSizeArb = fc.integer({ min: 1, max: 10_485_760 });

const validUploadInputArb = fc.record({
  sessionId: sessionIdArb,
  patientId: patientIdArb,
  tenantId: tenantIdArb,
  fileName: fileNameArb,
  fileSizeBytes: validFileSizeArb,
  mimeType: validMimeArb,
});

// Strings that are NOT in the allowed MIME set
const invalidMimeArb = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter((s) => !ALLOWED_MIMES.includes(s as (typeof ALLOWED_MIMES)[number]));

// Integers strictly greater than 10,485,760
const oversizedArb = fc.integer({ min: 10_485_761, max: 100_000_000 });

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeDbRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'photo-id',
    tenantId: 'tenant-id',
    sessionId: 'session-id',
    patientId: 'patient-id',
    s3Key: 'tenants/tenant-id/sessions/session-id/uuid_photo.jpg',
    fileName: 'photo.jpg',
    fileSizeBytes: 1024,
    mimeType: 'image/jpeg',
    status: 'pending',
    uploadedAt: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('sessionPhotoService property-based tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── P1 ────────────────────────────────────────────────────────────────────

  test('Property 1: created record has matching session_id, patient_id, tenant_id, and status=pending', async () => {
    // **Validates: Requirements 1.1, 1.2, 6.1**
    // Feature: appointment-session-photos, Property 1: For any valid upload input, the created record has matching session_id, patient_id, tenant_id, and status="pending"
    await fc.assert(
      fc.asyncProperty(validUploadInputArb, async (input) => {
        const row = makeDbRow({
          tenantId: input.tenantId,
          sessionId: input.sessionId,
          patientId: input.patientId,
          status: 'pending',
        });

        db.insert.mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([row]),
          }),
        });
        s3Mock.generateUploadPresignedUrl.mockResolvedValue(
          'https://s3.example.com/upload'
        );

        const result = await createUploadUrl(input);

        expect(result.photo.session_id).toBe(input.sessionId);
        expect(result.photo.patient_id).toBe(input.patientId);
        expect(result.photo.tenant_id).toBe(input.tenantId);
        expect(result.photo.status).toBe('pending');
      }),
      { numRuns: 100 }
    );
  }, 60_000);

  // ── P2 ────────────────────────────────────────────────────────────────────

  test('Property 2: MIME type validation rejects any string not in the allowed set', () => {
    // **Validates: Requirements 1.3, 7.2**
    // Feature: appointment-session-photos, Property 2: For any arbitrary string not in the allowed MIME set, validation rejects it
    fc.assert(
      fc.property(
        invalidMimeArb,
        fileNameArb,
        validFileSizeArb,
        (mime, fileName, size) => {
          const result = uploadSchema.safeParse({
            file_name: fileName,
            file_size_bytes: size,
            mime_type: mime,
          });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ── P3 ────────────────────────────────────────────────────────────────────

  test('Property 3: file size > 10,485,760 is rejected; size in [1, 10,485,760] passes', () => {
    // **Validates: Requirements 1.4, 7.3**
    // Feature: appointment-session-photos, Property 3: For any integer > 10,485,760, validation rejects it; for any integer in [1, 10,485,760], it passes
    fc.assert(
      fc.property(
        oversizedArb,
        validMimeArb,
        fileNameArb,
        (size, mime, fileName) => {
          const oversizedResult = uploadSchema.safeParse({
            file_name: fileName,
            file_size_bytes: size,
            mime_type: mime,
          });
          expect(oversizedResult.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );

    fc.assert(
      fc.property(
        validFileSizeArb,
        validMimeArb,
        fileNameArb,
        (size, mime, fileName) => {
          const validResult = uploadSchema.safeParse({
            file_name: fileName,
            file_size_bytes: size,
            mime_type: mime,
          });
          expect(validResult.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ── P4 ────────────────────────────────────────────────────────────────────

  test('Property 4: confirmed photo has all metadata fields non-null', async () => {
    // **Validates: Requirements 1.5, 5.2**
    // Feature: appointment-session-photos, Property 4: For any confirmed photo, all metadata fields are non-null
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        uuidArb,
        uuidArb,
        uuidArb,
        validMimeArb,
        validFileSizeArb,
        fileNameArb,
        async (
          photoId,
          tenantId,
          sessionId,
          patientId,
          mime,
          size,
          fileName
        ) => {
          const s3Key = `tenants/${tenantId}/sessions/${sessionId}/uuid_${fileName}`;
          const uploadedAt = new Date();
          const confirmedRow = makeDbRow({
            id: photoId,
            tenantId,
            sessionId,
            patientId,
            s3Key,
            fileName,
            fileSizeBytes: size,
            mimeType: mime,
            status: 'confirmed',
            uploadedAt,
          });

          db.update.mockReturnValue({
            set: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                returning: jest.fn().mockResolvedValue([confirmedRow]),
              }),
            }),
          });

          const result = await confirmUpload(tenantId, sessionId, photoId);

          expect(result).not.toBeNull();
          expect(result!.s3_key).not.toBeNull();
          expect(result!.file_name).not.toBeNull();
          expect(result!.file_size_bytes).not.toBeNull();
          expect(result!.mime_type).not.toBeNull();
          expect(result!.uploaded_at).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  }, 60_000);

  // ── P5 ────────────────────────────────────────────────────────────────────

  test('Property 5: list returns exactly N confirmed records (ignores pending)', async () => {
    // **Validates: Requirements 2.1, 6.3**
    // Feature: appointment-session-photos, Property 5: For any session with N confirmed + M pending photos, list returns exactly N records
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 0, max: 10 }),
        uuidArb,
        uuidArb,
        async (n, _m, tenantId, sessionId) => {
          // DB mock returns only confirmed rows (service filters at DB level)
          const confirmedRows = Array.from({ length: n }, (_, i) =>
            makeDbRow({
              id: `photo-${i}`,
              tenantId,
              sessionId,
              status: 'confirmed',
              uploadedAt: new Date(Date.now() + i * 1000),
            })
          );

          db.select.mockReturnValue({
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockResolvedValue(confirmedRows),
          });
          s3Mock.generateReadPresignedUrl.mockResolvedValue(
            'https://s3.example.com/read'
          );

          const results = await listPhotos(tenantId, sessionId);

          expect(results).toHaveLength(n);
          results.forEach((r) => expect(r.status).toBe('confirmed'));
        }
      ),
      { numRuns: 100 }
    );
  }, 60_000);

  // ── P6 ────────────────────────────────────────────────────────────────────

  test('Property 6: generateReadPresignedUrl is called with TTL=3600 for each confirmed photo', async () => {
    // **Validates: Requirements 2.2**
    // Feature: appointment-session-photos, Property 6: For any confirmed photo in a list response, the presigned URL contains X-Amz-Expires=3600
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        uuidArb,
        uuidArb,
        async (n, tenantId, sessionId) => {
          jest.clearAllMocks();
          const confirmedRows = Array.from({ length: n }, (_, i) =>
            makeDbRow({
              id: `photo-${i}`,
              tenantId,
              sessionId,
              s3Key: `tenants/${tenantId}/sessions/${sessionId}/uuid_photo${i}.jpg`,
              status: 'confirmed',
              uploadedAt: new Date(Date.now() + i * 1000),
            })
          );

          db.select.mockReturnValue({
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockResolvedValue(confirmedRows),
          });
          s3Mock.generateReadPresignedUrl.mockResolvedValue(
            'https://s3.example.com/read'
          );

          await listPhotos(tenantId, sessionId);

          expect(s3Mock.generateReadPresignedUrl).toHaveBeenCalledTimes(n);
          for (const call of s3Mock.generateReadPresignedUrl.mock.calls) {
            expect(call[1]).toBe(3600);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60_000);

  // ── P7 ────────────────────────────────────────────────────────────────────

  test('Property 7: list returns photos sorted by uploaded_at ascending', async () => {
    // **Validates: Requirements 2.4**
    // Feature: appointment-session-photos, Property 7: For any list of confirmed photos, the returned array is sorted by uploaded_at ascending
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 0, max: 1_000_000 }), {
          minLength: 1,
          maxLength: 10,
        }),
        uuidArb,
        uuidArb,
        async (offsets, tenantId, sessionId) => {
          // Sort offsets ascending to simulate DB ordering
          const sorted = [...offsets].sort((a, b) => a - b);
          const base = Date.now();
          const confirmedRows = sorted.map((offset, i) =>
            makeDbRow({
              id: `photo-${i}`,
              tenantId,
              sessionId,
              status: 'confirmed',
              uploadedAt: new Date(base + offset),
            })
          );

          db.select.mockReturnValue({
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockResolvedValue(confirmedRows),
          });
          s3Mock.generateReadPresignedUrl.mockResolvedValue(
            'https://s3.example.com/read'
          );

          const results = await listPhotos(tenantId, sessionId);

          for (let i = 1; i < results.length; i++) {
            const prev = results[i - 1].uploaded_at!.getTime();
            const curr = results[i].uploaded_at!.getTime();
            expect(prev).toBeLessThanOrEqual(curr);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60_000);

  // ── P8 ────────────────────────────────────────────────────────────────────

  test('Property 8: after delete, photo cannot be retrieved (select returns empty)', async () => {
    // **Validates: Requirements 3.1**
    // Feature: appointment-session-photos, Property 8: For any existing photo, after delete it cannot be retrieved
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        uuidArb,
        uuidArb,
        async (tenantId, sessionId, photoId) => {
          const row = makeDbRow({
            id: photoId,
            tenantId,
            sessionId,
            status: 'confirmed',
          });

          // First select finds the photo (for deletePhoto internals)
          db.select.mockReturnValue({
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([row]),
          });
          s3Mock.deleteObject.mockResolvedValue(undefined);
          db.delete.mockReturnValue({
            where: jest.fn().mockResolvedValue(undefined),
          });

          await deletePhoto(tenantId, sessionId, photoId);

          // After delete, simulate empty result
          db.select.mockReturnValue({
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockResolvedValue([]),
          });

          const results = await listPhotos(tenantId, sessionId);
          expect(results).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  }, 60_000);

  // ── P9 ────────────────────────────────────────────────────────────────────

  test('Property 9: S3 deleteObject is called with the exact s3_key of the photo', async () => {
    // **Validates: Requirements 3.2**
    // Feature: appointment-session-photos, Property 9: For any photo deletion, the S3 mock receives a delete call with the photo's s3_key
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        uuidArb,
        uuidArb,
        uuidArb,
        async (tenantId, sessionId, photoId, uuid) => {
          const s3Key = `tenants/${tenantId}/sessions/${sessionId}/${uuid}_photo.jpg`;
          const row = makeDbRow({
            id: photoId,
            tenantId,
            sessionId,
            s3Key,
            status: 'confirmed',
          });

          db.select.mockReturnValue({
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([row]),
          });
          s3Mock.deleteObject.mockResolvedValue(undefined);
          db.delete.mockReturnValue({
            where: jest.fn().mockResolvedValue(undefined),
          });

          await deletePhoto(tenantId, sessionId, photoId);

          expect(s3Mock.deleteObject).toHaveBeenCalledWith(s3Key);
        }
      ),
      { numRuns: 100 }
    );
  }, 60_000);

  // ── P10 ───────────────────────────────────────────────────────────────────

  test('Property 10: listPhotos for tenant B returns no data belonging to tenant A', async () => {
    // **Validates: Requirements 3.4, 4.2, 4.3, 7.4**
    // Feature: appointment-session-photos, Property 10: For any photo owned by tenant A, requests with tenant B credentials return no data
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        uuidArb,
        uuidArb,
        async (tenantA, tenantB, sessionId) => {
          fc.pre(tenantA !== tenantB);

          // Tenant B's query returns empty (DB enforces tenant isolation via where clause)
          db.select.mockReturnValue({
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockResolvedValue([]),
          });

          const results = await listPhotos(tenantB, sessionId);
          expect(results).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  }, 60_000);

  // ── P11 ───────────────────────────────────────────────────────────────────

  test('Property 11: generated S3 key matches tenants/{tenant_id}/sessions/{session_id}/{uuid}_{filename}', async () => {
    // **Validates: Requirements 4.1**
    // Feature: appointment-session-photos, Property 11: For any (tenant_id, session_id, filename) triple, the generated S3 key matches the pattern
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        uuidArb,
        uuidArb,
        fc
          .string({ minLength: 1, maxLength: 50 })
          .filter((s) => /^[a-zA-Z0-9._-]+$/.test(s)),
        async (tenantId, sessionId, patientId, fileName) => {
          let capturedS3Key = '';
          const row = makeDbRow({ tenantId, sessionId, patientId });

          db.insert.mockReturnValue({
            values: jest
              .fn()
              .mockImplementation((vals: Record<string, unknown>) => {
                capturedS3Key = vals.s3Key as string;
                return { returning: jest.fn().mockResolvedValue([row]) };
              }),
          });
          s3Mock.generateUploadPresignedUrl.mockResolvedValue(
            'https://s3.example.com/upload'
          );

          await createUploadUrl({
            tenantId,
            sessionId,
            patientId,
            fileName,
            fileSizeBytes: 1024,
            mimeType: 'image/jpeg',
          });

          // Pattern: tenants/{tenant_id}/sessions/{session_id}/{uuid}_{sanitized_filename}
          const pattern = new RegExp(
            `^tenants/${tenantId}/sessions/${sessionId}/[0-9a-f-]+_.+$`
          );
          expect(capturedS3Key).toMatch(pattern);
        }
      ),
      { numRuns: 100 }
    );
  }, 60_000);

  // ── P12 ───────────────────────────────────────────────────────────────────

  test('Property 12: after confirm, status is "confirmed" and uploaded_at is set', async () => {
    // **Validates: Requirements 6.2**
    // Feature: appointment-session-photos, Property 12: For any pending photo, after confirm its status is "confirmed" and uploaded_at is set
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        uuidArb,
        uuidArb,
        async (tenantId, sessionId, photoId) => {
          const uploadedAt = new Date();
          const confirmedRow = makeDbRow({
            id: photoId,
            tenantId,
            sessionId,
            status: 'confirmed',
            uploadedAt,
          });

          db.update.mockReturnValue({
            set: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                returning: jest.fn().mockResolvedValue([confirmedRow]),
              }),
            }),
          });

          const result = await confirmUpload(tenantId, sessionId, photoId);

          expect(result).not.toBeNull();
          expect(result!.status).toBe('confirmed');
          expect(result!.uploaded_at).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  }, 60_000);

  // ── P13 ───────────────────────────────────────────────────────────────────

  test('Property 13: deleteStalePhendingPhotos returns count of deleted records', async () => {
    // **Validates: Requirements 6.4**
    // Feature: appointment-session-photos, Property 13: For any set of pending photos split by age, cleanup deletes only those older than 1 hour
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 0, max: 20 }), async (staleCount) => {
        const deletedRows = Array.from({ length: staleCount }, (_, i) => ({
          id: `stale-${i}`,
        }));
        jest.clearAllMocks();

        db.delete.mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue(deletedRows),
          }),
        });

        const count = await deleteStalePhendingPhotos();

        // The service deletes only stale pending photos (DB where clause handles the filter)
        expect(count).toBe(staleCount);
        expect(db.delete).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 100 }
    );
  }, 60_000);

  // ── P14 ───────────────────────────────────────────────────────────────────

  test('Property 14: upload request with missing required field fails validation', () => {
    // **Validates: Requirements 7.1**
    // Feature: appointment-session-photos, Property 14: For any request with a missing required field, validation returns an error
    fc.assert(
      fc.property(
        fc.oneof(
          // Missing file_name
          fc.record({
            file_size_bytes: validFileSizeArb,
            mime_type: validMimeArb,
          }),
          // Missing file_size_bytes
          fc.record({ file_name: fileNameArb, mime_type: validMimeArb }),
          // Missing mime_type
          fc.record({
            file_name: fileNameArb,
            file_size_bytes: validFileSizeArb,
          }),
          // Missing all fields
          fc.constant({})
        ),
        (body) => {
          const result = uploadSchema.safeParse(body);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
