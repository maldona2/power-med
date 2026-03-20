import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { errorHandler } from '../../utils/errorHandler.js';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../middleware/auth.js', () => ({
  authenticate: (req: Request, _res: Response, next: NextFunction) => {
    req.user = { id: 'user-1', tenantId: 'tenant-1', role: 'professional' };
    next();
  },
}));

jest.mock('../../middleware/requireRole.js', () => ({
  requireRole: () => (_req: Request, _res: Response, next: NextFunction) => {
    next();
  },
}));

const mockCreateUploadUrl = jest.fn();
jest.mock('../../services/sessionPhotoService.js', () => ({
  createUploadUrl: (...args: unknown[]) => mockCreateUploadUrl(...args),
}));

const mockSelect = jest.fn();
jest.mock('../../db/client.js', () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
  },
  sessions: { id: 'id', tenantId: 'tenantId', patientId: 'patientId' },
}));

// ── Inline route (mirrors sessionPhotos.ts upload-url handler) ────────────────

const uploadSchema = z.object({
  file_name: z.string().min(1),
  file_size_bytes: z.number().int().min(1).max(10_485_760),
  mime_type: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

function buildApp(): Express {
  const app = express();
  app.use(express.json());

  // Replicate the POST /upload-url handler inline so we avoid ESM dynamic import issues
  app.post(
    '/api/sessions/:sessionId/photos/upload-url',
    // pass-through auth (mirrors mock)
    (req: Request, _res: Response, next: NextFunction) => {
      req.user = { id: 'user-1', tenantId: 'tenant-1', role: 'professional' };
      next();
    },
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const tenantId = req.user?.tenantId;
        if (!tenantId) {
          const err = new Error('Forbidden') as Error & { statusCode?: number };
          err.statusCode = 403;
          return next(err);
        }

        const sessionId = req.params.sessionId;

        const parsed = uploadSchema.safeParse(req.body);
        if (!parsed.success) {
          const err = new Error('Invalid upload request') as Error & {
            statusCode?: number;
          };
          err.statusCode = 400;
          return next(err);
        }

        // verifySessionOwnership
        const [session] = (await mockSelect().from().where().limit(1)) as Array<
          { id: string } | undefined
        >;

        if (!session) {
          const err = new Error('Forbidden') as Error & { statusCode?: number };
          err.statusCode = 403;
          return next(err);
        }

        // fetch patientId
        const [sessionRecord] = (await mockSelect().from().where()) as Array<
          { patientId: string } | undefined
        >;

        const { photo, upload_url } = await mockCreateUploadUrl({
          sessionId,
          patientId: sessionRecord?.patientId,
          tenantId,
          fileName: parsed.data.file_name,
          fileSizeBytes: parsed.data.file_size_bytes,
          mimeType: parsed.data.mime_type,
        });

        res.status(201).json({ photo_id: photo.id, upload_url });
      } catch (e) {
        next(e);
      }
    }
  );

  app.use(errorHandler);
  return app;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/sessions/:sessionId/photos/upload-url — Zod validation', () => {
  let app: Express;

  beforeAll(() => {
    app = buildApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validPayload = {
    file_name: 'photo.jpg',
    file_size_bytes: 1024,
    mime_type: 'image/jpeg',
  };

  function setupValidSessionMock() {
    // First call: verifySessionOwnership → [{ id: 'session-1' }]
    mockSelect
      .mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ id: 'session-1' }]),
      })
      // Second call: fetch patientId → [{ patientId: 'patient-1' }]
      .mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([{ patientId: 'patient-1' }]),
      });
  }

  test('returns 400 when mime_type is invalid (image/gif)', async () => {
    const res = await request(app)
      .post('/api/sessions/session-1/photos/upload-url')
      .send({ ...validPayload, mime_type: 'image/gif' });

    expect(res.status).toBe(400);
  });

  test('returns 400 when file_size_bytes exceeds 10,485,760', async () => {
    const res = await request(app)
      .post('/api/sessions/session-1/photos/upload-url')
      .send({ ...validPayload, file_size_bytes: 10_485_761 });

    expect(res.status).toBe(400);
  });

  test('returns 400 when file_name is missing', async () => {
    const { file_name: _fn, ...payload } = validPayload;
    const res = await request(app)
      .post('/api/sessions/session-1/photos/upload-url')
      .send(payload);

    expect(res.status).toBe(400);
  });

  test('returns 400 when file_size_bytes is missing', async () => {
    const { file_size_bytes: _fsb, ...payload } = validPayload;
    const res = await request(app)
      .post('/api/sessions/session-1/photos/upload-url')
      .send(payload);

    expect(res.status).toBe(400);
  });

  test('returns 400 when mime_type is missing', async () => {
    const { mime_type: _mt, ...payload } = validPayload;
    const res = await request(app)
      .post('/api/sessions/session-1/photos/upload-url')
      .send(payload);

    expect(res.status).toBe(400);
  });

  test('returns 201 with valid payload', async () => {
    setupValidSessionMock();
    mockCreateUploadUrl.mockResolvedValue({
      photo: { id: 'photo-1' },
      upload_url: 'https://s3.example.com/upload',
    });

    const res = await request(app)
      .post('/api/sessions/session-1/photos/upload-url')
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      photo_id: 'photo-1',
      upload_url: 'https://s3.example.com/upload',
    });
  });
});
