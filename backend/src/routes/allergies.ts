import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as medicalHistoryService from '../services/medicalHistoryService.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

const createAllergySchema = z.object({
  allergen_name: z.string().min(1, 'Allergen name is required'),
  allergy_type: z.enum(['medication', 'food', 'other']).optional(),
  notes: z.string().optional().nullable(),
});

const updateAllergySchema = createAllergySchema.partial();

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

// POST /api/patients/:patientId/allergies
router.post(
  '/:patientId/allergies',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createAllergySchema.safeParse(req.body);
      if (!parsed.success) {
        const err = new Error('Invalid allergy data');
        (err as Error & { statusCode?: number }).statusCode = 400;
        return next(err);
      }

      const tenantId = getTenantId(req);
      const { patientId } = req.params;

      const allergy = await medicalHistoryService.createAllergy(
        tenantId,
        patientId,
        parsed.data
      );

      res.status(201).json(allergy);
    } catch (e) {
      next(e);
    }
  }
);

// GET /api/patients/:patientId/allergies
router.get(
  '/:patientId/allergies',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const { patientId } = req.params;

      const allergies = await medicalHistoryService.listAllergies(
        tenantId,
        patientId
      );

      res.json(allergies);
    } catch (e) {
      next(e);
    }
  }
);

// PUT /api/patients/:patientId/allergies/:id
router.put(
  '/:patientId/allergies/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateAllergySchema.safeParse(req.body);
      if (!parsed.success) {
        const err = new Error('Invalid allergy data');
        (err as Error & { statusCode?: number }).statusCode = 400;
        return next(err);
      }

      const tenantId = getTenantId(req);
      const { patientId, id } = req.params;

      const allergy = await medicalHistoryService.updateAllergy(
        tenantId,
        patientId,
        id,
        parsed.data
      );

      if (!allergy) {
        const err = new Error('Allergy not found');
        (err as Error & { statusCode?: number }).statusCode = 404;
        return next(err);
      }

      res.json(allergy);
    } catch (e) {
      next(e);
    }
  }
);

// DELETE /api/patients/:patientId/allergies/:id
router.delete(
  '/:patientId/allergies/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const { patientId, id } = req.params;

      const ok = await medicalHistoryService.deleteAllergy(
        tenantId,
        patientId,
        id
      );

      if (!ok) {
        const err = new Error('Allergy not found');
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
