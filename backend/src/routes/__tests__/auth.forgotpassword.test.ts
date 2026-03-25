/**
 * Unit tests for POST /api/auth/forgot-password
 * Feature: forgot-password, Task 10.4
 */
import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { errorHandler } from '../../utils/errorHandler.js';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockRequestPasswordReset = jest.fn();

jest.mock('../../services/passwordResetService.js', () => ({
  requestPasswordReset: (...args: unknown[]) =>
    mockRequestPasswordReset(...args),
  validateResetToken: jest.fn(),
  resetPassword: jest.fn(),
}));

// ── App factory ───────────────────────────────────────────────────────────────

const emailSchema = z.object({ email: z.string().email() });

function makeError(message: string, statusCode: number) {
  const err = new Error(message) as Error & { statusCode?: number };
  err.statusCode = statusCode;
  return err;
}

function buildApp(): Express {
  const app = express();
  app.use(express.json());

  // High limit so individual tests are never rate-limited.
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
  });

  app.post(
    '/api/auth/forgot-password',
    limiter,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = emailSchema.safeParse(req.body);
        if (!parsed.success) {
          return next(
            makeError(parsed.error.issues[0]?.message ?? 'Invalid request', 400)
          );
        }
        await mockRequestPasswordReset(parsed.data.email);
        res.status(200).json({
          message: 'Si el email está registrado, recibirás un enlace en breve.',
        });
      } catch (e) {
        next(e);
      }
    }
  );

  app.use(errorHandler);
  return app;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/auth/forgot-password', () => {
  let app: Express;

  beforeAll(() => {
    app = buildApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 200 with the generic message for a registered email', async () => {
    mockRequestPasswordReset.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'registered@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      'Si el email está registrado, recibirás un enlace en breve.'
    );
  });

  test('returns 200 with the same generic message for an unregistered email', async () => {
    // Both calls succeed in the same way — the response must be identical so
    // callers cannot infer whether an address is registered.
    mockRequestPasswordReset.mockResolvedValue(undefined);
    const registeredRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'registered@example.com' });

    mockRequestPasswordReset.mockResolvedValue(undefined);
    const unregisteredRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'notfound@example.com' });

    expect(registeredRes.status).toBe(200);
    expect(unregisteredRes.status).toBe(200);
    expect(registeredRes.body).toEqual(unregisteredRes.body);
  });

  test('returns 400 for an invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
  });

  test('returns 400 when the email field is missing', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({});

    expect(res.status).toBe(400);
  });
});
