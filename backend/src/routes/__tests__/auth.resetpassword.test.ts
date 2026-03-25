/**
 * Unit tests for POST /api/auth/reset-password
 * Feature: forgot-password, Task 10.5
 */
import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { errorHandler } from '../../utils/errorHandler.js';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockResetPassword = jest.fn();

jest.mock('../../services/passwordResetService.js', () => ({
  requestPasswordReset: jest.fn(),
  validateResetToken: jest.fn(),
  resetPassword: (...args: unknown[]) => mockResetPassword(...args),
}));

// ── App factory ───────────────────────────────────────────────────────────────

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

function makeError(message: string, statusCode: number) {
  const err = new Error(message) as Error & { statusCode?: number };
  err.statusCode = statusCode;
  return err;
}

function buildApp(): Express {
  const app = express();
  app.use(express.json());

  app.post(
    '/api/auth/reset-password',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = resetSchema.safeParse(req.body);
        if (!parsed.success) {
          return next(
            makeError(parsed.error.issues[0]?.message ?? 'Invalid request', 400)
          );
        }
        await mockResetPassword(parsed.data.token, parsed.data.password);
        res
          .status(200)
          .json({ message: 'Contraseña actualizada correctamente.' });
      } catch (e) {
        next(e);
      }
    }
  );

  app.use(errorHandler);
  return app;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/auth/reset-password', () => {
  let app: Express;

  beforeAll(() => {
    app = buildApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 200 for a valid token and password', async () => {
    mockResetPassword.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'valid-token-abc', password: 'newpassword123' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Contraseña actualizada correctamente.');
  });

  test('returns 400 for an expired token', async () => {
    mockResetPassword.mockRejectedValue(
      makeError('El enlace de recuperación no es válido o ha expirado.', 400)
    );

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'expired-token', password: 'newpassword123' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe(
      'El enlace de recuperación no es válido o ha expirado.'
    );
  });

  test('returns 400 for an already-used token', async () => {
    mockResetPassword.mockRejectedValue(
      makeError('El enlace de recuperación no es válido o ha expirado.', 400)
    );

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'used-token', password: 'newpassword123' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe(
      'El enlace de recuperación no es válido o ha expirado.'
    );
  });

  test('returns 400 when the password is shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'valid-token', password: 'short' });

    expect(res.status).toBe(400);
  });

  test('returns 400 when the token field is missing', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ password: 'newpassword123' });

    expect(res.status).toBe(400);
  });
});
