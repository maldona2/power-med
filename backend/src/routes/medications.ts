import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as medicalHistoryService from '../services/medicalHistoryService.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

const createMedicationSchema = z.object({
  medication_name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const updateMedicationSchema = createMedicationSchema.partial();

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

// POST /api/patients/:patientId/medications
router.post(
  '/:patientId/medications',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createMedicationSchema.safeParse(req.body);
      if (!parsed.success) {
        const err = new Error('Invalid medication data');
        (err as Error & { statusCode?: number }).statusCode = 400;
        return next(err);
      }

      const tenantId = getTenantId(req);
      const { patientId } = req.params;

      const medication = await medicalHistoryService.createMedication(
        tenantId,
        patientId,
        parsed.data
      );

      res.status(201).json(medication);
    } catch (e) {
      next(e);
    }
  }
);

// GET /api/patients/:patientId/medications
router.get(
  '/:patientId/medications',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const { patientId } = req.params;

      const medications = await medicalHistoryService.listMedications(
        tenantId,
        patientId
      );

      res.json(medications);
    } catch (e) {
      next(e);
    }
  }
);

// PUT /api/patients/:patientId/medications/:id
router.put(
  '/:patientId/medications/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateMedicationSchema.safeParse(req.body);
      if (!parsed.success) {
        const err = new Error('Invalid medication data');
        (err as Error & { statusCode?: number }).statusCode = 400;
        return next(err);
      }

      const tenantId = getTenantId(req);
      const { patientId, id } = req.params;

      const medication = await medicalHistoryService.updateMedication(
        tenantId,
        patientId,
        id,
        parsed.data
      );

      if (!medication) {
        const err = new Error('Medication not found');
        (err as Error & { statusCode?: number }).statusCode = 404;
        return next(err);
      }

      res.json(medication);
    } catch (e) {
      next(e);
    }
  }
);

// DELETE /api/patients/:patientId/medications/:id
router.delete(
  '/:patientId/medications/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const { patientId, id } = req.params;

      const ok = await medicalHistoryService.deleteMedication(
        tenantId,
        patientId,
        id
      );

      if (!ok) {
        const err = new Error('Medication not found');
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
