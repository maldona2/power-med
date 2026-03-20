import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as sessionPhotoService from '../services/sessionPhotoService.js';
import { db, sessions } from '../db/client.js';
import { and, eq } from 'drizzle-orm';

const router = Router({ mergeParams: true });
const professionalOnly = [authenticate, requireRole('professional')];

const uploadSchema = z.object({
  file_name: z.string().min(1),
  file_size_bytes: z.number().int().min(1).max(10_485_760),
  mime_type: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

function getTenantId(req: Request): string {
  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    const err = new Error('Forbidden');
    (err as Error & { statusCode?: number }).statusCode = 403;
    throw err;
  }
  return tenantId;
}

async function verifySessionOwnership(
  tenantId: string,
  sessionId: string
): Promise<boolean> {
  const [session] = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.tenantId, tenantId)))
    .limit(1);
  return !!session;
}

// POST /upload-url
router.post(
  '/upload-url',
  professionalOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const sessionId = req.params.sessionId;

      const parsed = uploadSchema.safeParse(req.body);
      if (!parsed.success) {
        const err = new Error('Invalid upload request');
        (err as Error & { statusCode?: number }).statusCode = 400;
        return next(err);
      }

      const owned = await verifySessionOwnership(tenantId, sessionId);
      if (!owned) {
        const err = new Error('Forbidden');
        (err as Error & { statusCode?: number }).statusCode = 403;
        return next(err);
      }

      // Derive patient_id from the session record
      const [session] = await db
        .select({ patientId: sessions.patientId })
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);

      const { photo, upload_url } = await sessionPhotoService.createUploadUrl({
        sessionId,
        patientId: session.patientId,
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

// POST /:photoId/confirm
router.post(
  '/:photoId/confirm',
  professionalOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const { sessionId, photoId } = req.params;

      const owned = await verifySessionOwnership(tenantId, sessionId);
      if (!owned) {
        const err = new Error('Forbidden');
        (err as Error & { statusCode?: number }).statusCode = 403;
        return next(err);
      }

      const photo = await sessionPhotoService.confirmUpload(
        tenantId,
        sessionId,
        photoId
      );

      if (!photo) {
        const err = new Error('Photo not found');
        (err as Error & { statusCode?: number }).statusCode = 404;
        return next(err);
      }

      res.json(photo);
    } catch (e) {
      next(e);
    }
  }
);

// GET /
router.get(
  '/',
  professionalOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const { sessionId } = req.params;

      const owned = await verifySessionOwnership(tenantId, sessionId);
      if (!owned) {
        const err = new Error('Forbidden');
        (err as Error & { statusCode?: number }).statusCode = 403;
        return next(err);
      }

      const photos = await sessionPhotoService.listPhotos(tenantId, sessionId);
      res.json(photos);
    } catch (e) {
      next(e);
    }
  }
);

// DELETE /:photoId
router.delete(
  '/:photoId',
  professionalOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const { sessionId, photoId } = req.params;

      const owned = await verifySessionOwnership(tenantId, sessionId);
      if (!owned) {
        const err = new Error('Forbidden');
        (err as Error & { statusCode?: number }).statusCode = 403;
        return next(err);
      }

      await sessionPhotoService.deletePhoto(tenantId, sessionId, photoId);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

export default router;
