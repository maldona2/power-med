import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { and, desc, eq } from 'drizzle-orm';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { debtDashboardService } from '../services/debtDashboardService.js';
import { db, appointments } from '../db/client.js';

const router = Router();
const professionalOnly = [authenticate, requireRole('professional')];

function getTenantId(req: Request): string {
  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    const err = new Error('Forbidden');
    (err as Error & { statusCode?: number }).statusCode = 403;
    throw err;
  }
  return tenantId;
}

const dateRangeSchema = z.object({
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
});

const paymentHistoryQuerySchema = z.object({
  patientId: z.string().uuid().optional(),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
  paymentStatus: z.enum(['paid', 'unpaid', 'partially_paid']).optional(),
  minAmount: z.coerce.number().int().min(0).optional(),
  maxAmount: z.coerce.number().int().min(0).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const planStatusSchema = z.object({
  status: z.enum(['active', 'completed', 'delinquent', 'cancelled']).optional(),
});

// GET /api/debt-dashboard/statistics
router.get(
  '/statistics',
  professionalOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const parsed = dateRangeSchema.safeParse(req.query);
      if (!parsed.success) {
        const err = new Error('Invalid query parameters');
        (err as Error & { statusCode?: number }).statusCode = 400;
        return next(err);
      }
      const { startDate, endDate } = parsed.data;
      const statistics = await debtDashboardService.calculateStatistics(
        tenantId,
        startDate,
        endDate
      );
      res.json(statistics);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/debt-dashboard/aging-report
router.get(
  '/aging-report',
  professionalOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const report = await debtDashboardService.generateAgingReport(tenantId);
      res.json(report);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/debt-dashboard/payment-plans
router.get(
  '/payment-plans',
  professionalOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const parsed = planStatusSchema.safeParse(req.query);
      if (!parsed.success) {
        const err = new Error('Invalid query parameters');
        (err as Error & { statusCode?: number }).statusCode = 400;
        return next(err);
      }
      const plans = await debtDashboardService.getPaymentPlans(
        tenantId,
        parsed.data.status
      );
      res.json({ plans });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/debt-dashboard/payment-history
router.get(
  '/payment-history',
  professionalOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const parsed = paymentHistoryQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        const err = new Error('Invalid query parameters');
        (err as Error & { statusCode?: number }).statusCode = 400;
        return next(err);
      }
      const { minAmount, maxAmount, page, pageSize, ...rest } = parsed.data;
      const result = await debtDashboardService.getPaymentHistory(tenantId, {
        ...rest,
        minAmountCents: minAmount,
        maxAmountCents: maxAmount,
        page,
        pageSize,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/debt-dashboard/payment-methods
router.get(
  '/payment-methods',
  professionalOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const methods =
        await debtDashboardService.getPaymentMethodAnalytics(tenantId);
      res.json({ methods });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/debt-dashboard/patient-appointments?patientId=<uuid>
const patientAppointmentsSchema = z.object({
  patientId: z.string().uuid(),
});

router.get(
  '/patient-appointments',
  professionalOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const parsed = patientAppointmentsSchema.safeParse(req.query);
      if (!parsed.success) {
        const err = new Error('patientId is required and must be a valid UUID');
        (err as Error & { statusCode?: number }).statusCode = 400;
        return next(err);
      }
      const { patientId } = parsed.data;
      const rows = await db
        .select({
          id: appointments.id,
          scheduledAt: appointments.scheduledAt,
          status: appointments.status,
          paymentStatus: appointments.paymentStatus,
          totalAmountCents: appointments.totalAmountCents,
          notes: appointments.notes,
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.tenantId, tenantId),
            eq(appointments.patientId, patientId)
          )
        )
        .orderBy(desc(appointments.scheduledAt));
      res.json({ appointments: rows });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
