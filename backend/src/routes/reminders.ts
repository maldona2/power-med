import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db, patients, reminderOptOuts } from '../db/client.js';
import { and, eq } from 'drizzle-orm';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();
const professionalOnly = [authenticate, requireRole('professional')];

const optOutSchema = z.object({
  patient_id: z.string().uuid(),
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

router.post(
  '/opt-out',
  professionalOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = optOutSchema.safeParse(req.body);
      if (!parsed.success) {
        const err = new Error('Invalid request data');
        (err as Error & { statusCode?: number }).statusCode = 400;
        return next(err);
      }

      const tenantId = getTenantId(req);
      const { patient_id } = parsed.data;

      // Verify patient belongs to this tenant
      const [patient] = await db
        .select({ id: patients.id })
        .from(patients)
        .where(
          and(eq(patients.id, patient_id), eq(patients.tenantId, tenantId))
        )
        .limit(1);

      if (!patient) {
        const err = new Error('Patient not found');
        (err as Error & { statusCode?: number }).statusCode = 404;
        return next(err);
      }

      await db
        .insert(reminderOptOuts)
        .values({ tenantId, patientId: patient_id })
        .onConflictDoNothing();

      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  '/opt-out',
  professionalOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = optOutSchema.safeParse(req.body);
      if (!parsed.success) {
        const err = new Error('Invalid request data');
        (err as Error & { statusCode?: number }).statusCode = 400;
        return next(err);
      }

      const tenantId = getTenantId(req);
      const { patient_id } = parsed.data;

      await db
        .delete(reminderOptOuts)
        .where(
          and(
            eq(reminderOptOuts.tenantId, tenantId),
            eq(reminderOptOuts.patientId, patient_id)
          )
        );

      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
