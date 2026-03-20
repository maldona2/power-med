/**
 * Unit tests for sessionPhotoService
 * Feature: appointment-session-photos
 * Uses Jest with mocked DB and S3
 */

// ── Mocks ────────────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

const TENANT_ID = 'tenant-111';
const SESSION_ID = 'session-222';
const PATIENT_ID = 'patient-333';
const PHOTO_ID = 'photo-444';
const S3_KEY = `tenants/${TENANT_ID}/sessions/${SESSION_ID}/uuid_photo.jpg`;

function makeDbRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: PHOTO_ID,
    tenantId: TENANT_ID,
    sessionId: SESSION_ID,
    patientId: PATIENT_ID,
    s3Key: S3_KEY,
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

describe('sessionPhotoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── createUploadUrl ─────────────────────────────────────────────────────────

  describe('createUploadUrl', () => {
    it('inserts a pending record and returns photo with correct fields and upload_url', async () => {
      const row = makeDbRow();
      db.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([row]),
        }),
      });
      s3Mock.generateUploadPresignedUrl.mockResolvedValue(
        'https://s3.example.com/upload'
      );

      const result = await createUploadUrl({
        sessionId: SESSION_ID,
        patientId: PATIENT_ID,
        tenantId: TENANT_ID,
        fileName: 'photo.jpg',
        fileSizeBytes: 1024,
        mimeType: 'image/jpeg',
      });

      expect(db.insert).toHaveBeenCalledTimes(1);
      expect(result.upload_url).toBe('https://s3.example.com/upload');
      expect(result.photo.status).toBe('pending');
      expect(result.photo.session_id).toBe(SESSION_ID);
      expect(result.photo.tenant_id).toBe(TENANT_ID);
      expect(result.photo.patient_id).toBe(PATIENT_ID);
      expect(result.photo.file_name).toBe('photo.jpg');
      expect(result.photo.file_size_bytes).toBe(1024);
      expect(result.photo.mime_type).toBe('image/jpeg');
    });

    it('generates an S3 key matching the tenant/session pattern', async () => {
      const row = makeDbRow();
      let capturedValues: Record<string, unknown> = {};
      db.insert.mockReturnValue({
        values: jest
          .fn()
          .mockImplementation((vals: Record<string, unknown>) => {
            capturedValues = vals;
            return { returning: jest.fn().mockResolvedValue([row]) };
          }),
      });
      s3Mock.generateUploadPresignedUrl.mockResolvedValue(
        'https://s3.example.com/upload'
      );

      await createUploadUrl({
        sessionId: SESSION_ID,
        patientId: PATIENT_ID,
        tenantId: TENANT_ID,
        fileName: 'my photo.jpg',
        fileSizeBytes: 512,
        mimeType: 'image/png',
      });

      const s3Key = capturedValues.s3Key as string;
      expect(s3Key).toMatch(
        new RegExp(
          `^tenants/${TENANT_ID}/sessions/${SESSION_ID}/[a-f0-9-]+_my_photo\\.jpg$`
        )
      );
    });

    it('calls generateUploadPresignedUrl with the correct key and mimeType', async () => {
      const row = makeDbRow();
      let capturedKey = '';
      db.insert.mockReturnValue({
        values: jest
          .fn()
          .mockImplementation((vals: Record<string, unknown>) => {
            capturedKey = vals.s3Key as string;
            return { returning: jest.fn().mockResolvedValue([row]) };
          }),
      });
      s3Mock.generateUploadPresignedUrl.mockResolvedValue(
        'https://s3.example.com/upload'
      );

      await createUploadUrl({
        sessionId: SESSION_ID,
        patientId: PATIENT_ID,
        tenantId: TENANT_ID,
        fileName: 'photo.jpg',
        fileSizeBytes: 1024,
        mimeType: 'image/jpeg',
      });

      expect(s3Mock.generateUploadPresignedUrl).toHaveBeenCalledWith(
        capturedKey,
        'image/jpeg',
        300
      );
    });
  });

  // ── confirmUpload ───────────────────────────────────────────────────────────

  describe('confirmUpload', () => {
    it('updates status to confirmed and sets uploadedAt, returns the updated row', async () => {
      const confirmedRow = makeDbRow({
        status: 'confirmed',
        uploadedAt: new Date(),
      });
      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([confirmedRow]),
          }),
        }),
      });

      const result = await confirmUpload(TENANT_ID, SESSION_ID, PHOTO_ID);

      expect(db.update).toHaveBeenCalledTimes(1);
      expect(result).not.toBeNull();
      expect(result!.status).toBe('confirmed');
      expect(result!.uploaded_at).not.toBeNull();
    });

    it('returns null when photo is not found', async () => {
      db.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await confirmUpload(
        TENANT_ID,
        SESSION_ID,
        'nonexistent-id'
      );

      expect(result).toBeNull();
    });
  });

  // ── listPhotos ──────────────────────────────────────────────────────────────

  describe('listPhotos', () => {
    it('returns confirmed photos with presigned read URLs', async () => {
      const confirmedRow = makeDbRow({
        status: 'confirmed',
        uploadedAt: new Date('2024-01-01T10:00:00Z'),
      });
      db.select.mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([confirmedRow]),
      });
      s3Mock.generateReadPresignedUrl.mockResolvedValue(
        'https://s3.example.com/read'
      );

      const results = await listPhotos(TENANT_ID, SESSION_ID);

      expect(results).toHaveLength(1);
      expect(results[0].presigned_url).toBe('https://s3.example.com/read');
      expect(results[0].status).toBe('confirmed');
    });

    it('generates read presigned URLs with 3600 second TTL', async () => {
      const confirmedRow = makeDbRow({
        status: 'confirmed',
        uploadedAt: new Date(),
      });
      db.select.mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([confirmedRow]),
      });
      s3Mock.generateReadPresignedUrl.mockResolvedValue(
        'https://s3.example.com/read'
      );

      await listPhotos(TENANT_ID, SESSION_ID);

      expect(s3Mock.generateReadPresignedUrl).toHaveBeenCalledWith(
        S3_KEY,
        3600
      );
    });

    it('returns empty array for a session with no photos', async () => {
      db.select.mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([]),
      });

      const results = await listPhotos(TENANT_ID, SESSION_ID);

      expect(results).toEqual([]);
      expect(s3Mock.generateReadPresignedUrl).not.toHaveBeenCalled();
    });

    it('returns multiple photos ordered by uploadedAt', async () => {
      const row1 = makeDbRow({
        id: 'p1',
        status: 'confirmed',
        uploadedAt: new Date('2024-01-01T08:00:00Z'),
      });
      const row2 = makeDbRow({
        id: 'p2',
        status: 'confirmed',
        uploadedAt: new Date('2024-01-01T10:00:00Z'),
      });
      db.select.mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([row1, row2]),
      });
      s3Mock.generateReadPresignedUrl
        .mockResolvedValueOnce('https://s3.example.com/read1')
        .mockResolvedValueOnce('https://s3.example.com/read2');

      const results = await listPhotos(TENANT_ID, SESSION_ID);

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('p1');
      expect(results[1].id).toBe('p2');
    });
  });

  // ── deletePhoto ─────────────────────────────────────────────────────────────

  describe('deletePhoto', () => {
    it('calls S3 deleteObject then removes the DB record', async () => {
      const row = makeDbRow({ status: 'confirmed' });
      db.select.mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([row]),
      });
      s3Mock.deleteObject.mockResolvedValue(undefined);
      db.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      });

      await deletePhoto(TENANT_ID, SESSION_ID, PHOTO_ID);

      expect(s3Mock.deleteObject).toHaveBeenCalledWith(S3_KEY);
      expect(db.delete).toHaveBeenCalledTimes(1);
    });

    it('still deletes the DB record when S3 throws an error', async () => {
      const row = makeDbRow({ status: 'confirmed' });
      db.select.mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([row]),
      });
      s3Mock.deleteObject.mockRejectedValue(new Error('S3 unavailable'));
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      db.delete.mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      });

      await deletePhoto(TENANT_ID, SESSION_ID, PHOTO_ID);

      expect(db.delete).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('does nothing when photo is not found', async () => {
      db.select.mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      });

      await deletePhoto(TENANT_ID, SESSION_ID, 'nonexistent-id');

      expect(s3Mock.deleteObject).not.toHaveBeenCalled();
      expect(db.delete).not.toHaveBeenCalled();
    });
  });

  // ── deleteStalePhendingPhotos ───────────────────────────────────────────────

  describe('deleteStalePhendingPhotos', () => {
    it('returns the count of deleted records', async () => {
      db.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]),
        }),
      });

      const count = await deleteStalePhendingPhotos();

      expect(count).toBe(2);
      expect(db.delete).toHaveBeenCalledTimes(1);
    });

    it('returns 0 when no stale pending photos exist', async () => {
      db.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      const count = await deleteStalePhendingPhotos();

      expect(count).toBe(0);
    });

    it('calls delete with returning to get deleted record ids', async () => {
      const deletedRows = [
        { id: 'stale-1' },
        { id: 'stale-2' },
        { id: 'stale-3' },
      ];
      db.delete.mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(deletedRows),
        }),
      });

      const count = await deleteStalePhendingPhotos();

      expect(count).toBe(3);
    });
  });
});
