import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as medicalHistoryService from '../services/medicalHistoryService.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

const createConditionSchema = z.object({
  condition_name: z.string().min(1, 'Condition name is required'),
  diagnosed_date: z.string().optional().nullable().or(z.literal('')),
  notes: z.string().optional().nullable(),
});

const updateConditionSchema = createConditionSchema.partial();

// All routes require authentication and professional role
router.use(authenticate);
router.use(requireRole('professional'));

function getTenantId(req: Request): string {
  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    const err = new Error('Forbidden');
    (err as Error & { statusCode?: number }).statusCode = 403;
    throw err;
  }
  return tenantId;
}

// POST /api/patients/:patientId/conditions
router.post(
  '/:patientId/conditions',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createConditionSchema.safeParse(req.body);
      if (!parsed.success) {
        const err = new Error('Invalid condition data');
        (err as Error & { statusCode?: number }).statusCode = 400;
        return next(err);
      }

      const tenantId = getTenantId(req);
      const { patientId } = req.params;

      const condition = await medicalHistoryService.createCondition(
        tenantId,
        patientId,
        parsed.data
      );

      res.status(201).json(condition);
    } catch (e) {
      next(e);
    }
  }
);

// GET /api/patients/:patientId/conditions
router.get(
  '/:patientId/conditions',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const { patientId } = req.params;

      const conditions = await medicalHistoryService.listConditions(
        tenantId,
        patientId
      );

      res.json(conditions);
    } catch (e) {
      next(e);
    }
  }
);

// PUT /api/patients/:patientId/conditions/:id
router.put(
  '/:patientId/conditions/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateConditionSchema.safeParse(req.body);
      if (!parsed.success) {
        const err = new Error('Invalid condition data');
        (err as Error & { statusCode?: number }).statusCode = 400;
        return next(err);
      }

      const tenantId = getTenantId(req);
      const { patientId, id } = req.params;

      const condition = await medicalHistoryService.updateCondition(
        tenantId,
        patientId,
        id,
        parsed.data
      );

      if (!condition) {
        const err = new Error('Condition not found');
        (err as Error & { statusCode?: number }).statusCode = 404;
        return next(err);
      }

      res.json(condition);
    } catch (e) {
      next(e);
    }
  }
);

// DELETE /api/patients/:patientId/conditions/:id
router.delete(
  '/:patientId/conditions/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const { patientId, id } = req.params;

      const ok = await medicalHistoryService.deleteCondition(
        tenantId,
        patientId,
        id
      );

      if (!ok) {
        const err = new Error('Condition not found');
        (err as Error & { statusCode?: number }).statusCode = 404;
        return next(err);
      }

      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

export default router;
