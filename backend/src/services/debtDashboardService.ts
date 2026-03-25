import { and, eq, gte, lte, sql, isNotNull, inArray } from 'drizzle-orm';
import {
  db,
  appointments,
  patients,
  paymentRecords,
  paymentPlans,
} from '../db/client.js';

export interface PaymentStatistics {
  totalPaidCents: number;
  totalUnpaidCents: number;
  collectionRate: number;
  patientsWithBalance: number;
  averageDebtCents: number;
  lastUpdated: string;
}

export interface AgingBucket {
  range: string;
  minDays: number;
  maxDays: number | null;
  totalAmountCents: number;
  patientCount: number;
  percentage: number;
}

export interface AgingReport {
  buckets: AgingBucket[];
  lastUpdated: string;
}

export interface PaymentPlanWithPatient {
  id: string;
  patientId: string;
  patientName: string;
  totalAmountCents: number;
  installmentAmountCents: number;
  frequency: string;
  startDate: string;
  nextPaymentDate: string | null;
  status: string;
  onTimePayments: number;
  latePayments: number;
  completionPercentage: number;
}

export interface PatientPaymentRecord {
  patientId: string;
  patientName: string;
  totalDebtCents: number;
  paidCents: number;
  unpaidCents: number;
  paymentStatus: 'paid' | 'unpaid' | 'partially_paid';
  lastPaymentDate: string | null;
}

export interface PaymentHistoryFilters {
  patientId?: string;
  startDate?: string;
  endDate?: string;
  paymentStatus?: 'paid' | 'unpaid' | 'partially_paid';
  minAmountCents?: number;
  maxAmountCents?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaymentHistoryResult {
  records: PatientPaymentRecord[];
  totalCount: number;
}

export interface PaymentMethodAnalytics {
  paymentMethod: string;
  totalAmountCents: number;
  transactionCount: number;
  averageAmountCents: number;
  percentage: number;
}

export class DebtDashboardService {
  async calculateStatistics(
    tenantId: string,
    startDate?: string,
    endDate?: string
  ): Promise<PaymentStatistics> {
    const baseConditions = [
      eq(appointments.tenantId, tenantId),
      isNotNull(appointments.totalAmountCents),
    ];
    if (startDate) {
      baseConditions.push(gte(appointments.scheduledAt, new Date(startDate)));
    }
    if (endDate) {
      baseConditions.push(lte(appointments.scheduledAt, new Date(endDate)));
    }

    // Sum paid appointments
    const [paidResult] = await db
      .select({
        totalPaidCents: sql<number>`coalesce(sum(${appointments.totalAmountCents}), 0)`,
      })
      .from(appointments)
      .where(and(...baseConditions, eq(appointments.paymentStatus, 'paid')));

    // Sum unpaid + partial appointments
    const [unpaidResult] = await db
      .select({
        totalUnpaidCents: sql<number>`coalesce(sum(${appointments.totalAmountCents}), 0)`,
      })
      .from(appointments)
      .where(
        and(
          ...baseConditions,
          inArray(appointments.paymentStatus, ['unpaid', 'partial'])
        )
      );

    // Count distinct patients with outstanding balance
    const [patientsWithBalanceResult] = await db
      .select({
        count: sql<number>`count(distinct ${appointments.patientId})`,
      })
      .from(appointments)
      .where(
        and(
          ...baseConditions,
          inArray(appointments.paymentStatus, ['unpaid', 'partial'])
        )
      );

    const totalPaidCents = Number(paidResult?.totalPaidCents ?? 0);
    const totalUnpaidCents = Number(unpaidResult?.totalUnpaidCents ?? 0);
    const patientsWithBalance = Number(patientsWithBalanceResult?.count ?? 0);
    const totalDebtCents = totalPaidCents + totalUnpaidCents;
    const collectionRate =
      totalDebtCents > 0 ? (totalPaidCents / totalDebtCents) * 100 : 0;
    const averageDebtCents =
      patientsWithBalance > 0
        ? Math.round(totalUnpaidCents / patientsWithBalance)
        : 0;

    return {
      totalPaidCents,
      totalUnpaidCents,
      collectionRate: Math.round(collectionRate * 100) / 100,
      patientsWithBalance,
      averageDebtCents,
      lastUpdated: new Date().toISOString(),
    };
  }

  async generateAgingReport(tenantId: string): Promise<AgingReport> {
    const now = new Date();

    // Get unpaid/partial appointments per patient with their oldest date
    const unpaidAppointments = await db
      .select({
        patientId: appointments.patientId,
        scheduledAt: appointments.scheduledAt,
        totalAmountCents: appointments.totalAmountCents,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.tenantId, tenantId),
          isNotNull(appointments.totalAmountCents),
          inArray(appointments.paymentStatus, ['unpaid', 'partial'])
        )
      );

    // Aggregate per patient: sum amounts and find oldest date
    const patientDebtMap = new Map<
      string,
      { totalAmountCents: number; oldestDate: Date }
    >();

    for (const appt of unpaidAppointments) {
      const amount = appt.totalAmountCents ?? 0;
      const date = appt.scheduledAt;
      const existing = patientDebtMap.get(appt.patientId);
      if (!existing) {
        patientDebtMap.set(appt.patientId, {
          totalAmountCents: amount,
          oldestDate: date,
        });
      } else {
        patientDebtMap.set(appt.patientId, {
          totalAmountCents: existing.totalAmountCents + amount,
          oldestDate: date < existing.oldestDate ? date : existing.oldestDate,
        });
      }
    }

    const bucketDefs = [
      { range: '0-30 días', minDays: 0, maxDays: 30 },
      { range: '31-60 días', minDays: 31, maxDays: 60 },
      { range: '61-90 días', minDays: 61, maxDays: 90 },
      { range: '90+ días', minDays: 91, maxDays: null },
    ];

    const buckets = bucketDefs.map((b) => ({
      ...b,
      totalAmountCents: 0,
      patientCount: 0,
    }));

    let totalUnpaid = 0;

    for (const debt of patientDebtMap.values()) {
      const daysOutstanding = Math.floor(
        (now.getTime() - debt.oldestDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      totalUnpaid += debt.totalAmountCents;

      for (const bucket of buckets) {
        const inBucket =
          daysOutstanding >= bucket.minDays &&
          (bucket.maxDays === null || daysOutstanding <= bucket.maxDays);
        if (inBucket) {
          bucket.totalAmountCents += debt.totalAmountCents;
          bucket.patientCount += 1;
          break;
        }
      }
    }

    const result: AgingBucket[] = buckets.map((b) => ({
      range: b.range,
      minDays: b.minDays,
      maxDays: b.maxDays,
      totalAmountCents: b.totalAmountCents,
      patientCount: b.patientCount,
      percentage:
        totalUnpaid > 0
          ? Math.round((b.totalAmountCents / totalUnpaid) * 10000) / 100
          : 0,
    }));

    return {
      buckets: result,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getPaymentPlans(
    tenantId: string,
    status?: string
  ): Promise<PaymentPlanWithPatient[]> {
    const conditions = [eq(paymentPlans.tenantId, tenantId)];
    if (status) {
      conditions.push(
        eq(
          paymentPlans.status,
          status as 'active' | 'completed' | 'delinquent' | 'cancelled'
        )
      );
    }

    const plans = await db
      .select({
        id: paymentPlans.id,
        patientId: paymentPlans.patientId,
        patientFirstName: patients.firstName,
        patientLastName: patients.lastName,
        totalAmountCents: paymentPlans.totalAmountCents,
        installmentAmountCents: paymentPlans.installmentAmountCents,
        frequency: paymentPlans.frequency,
        startDate: paymentPlans.startDate,
        nextPaymentDate: paymentPlans.nextPaymentDate,
        status: paymentPlans.status,
        onTimePayments: paymentPlans.onTimePayments,
        latePayments: paymentPlans.latePayments,
      })
      .from(paymentPlans)
      .innerJoin(patients, eq(paymentPlans.patientId, patients.id))
      .where(and(...conditions));

    return plans.map((plan) => {
      const totalPayments = plan.onTimePayments + plan.latePayments;
      const expectedInstallments =
        plan.installmentAmountCents > 0
          ? Math.ceil(plan.totalAmountCents / plan.installmentAmountCents)
          : 1;
      const completionPercentage =
        plan.status === 'completed'
          ? 100
          : Math.min(
              100,
              Math.round((totalPayments / expectedInstallments) * 100)
            );

      return {
        id: plan.id,
        patientId: plan.patientId,
        patientName: `${plan.patientFirstName} ${plan.patientLastName}`,
        totalAmountCents: plan.totalAmountCents,
        installmentAmountCents: plan.installmentAmountCents,
        frequency: plan.frequency,
        startDate: plan.startDate.toISOString(),
        nextPaymentDate: plan.nextPaymentDate?.toISOString() ?? null,
        status: plan.status,
        onTimePayments: plan.onTimePayments,
        latePayments: plan.latePayments,
        completionPercentage,
      };
    });
  }

  async getPaymentHistory(
    tenantId: string,
    filters: PaymentHistoryFilters = {}
  ): Promise<PaymentHistoryResult> {
    const { page = 1, pageSize = 20 } = filters;

    const conditions = [
      eq(appointments.tenantId, tenantId),
      isNotNull(appointments.totalAmountCents),
    ];
    if (filters.startDate) {
      conditions.push(
        gte(appointments.scheduledAt, new Date(filters.startDate))
      );
    }
    if (filters.endDate) {
      conditions.push(lte(appointments.scheduledAt, new Date(filters.endDate)));
    }

    // Get all relevant appointments
    const apptData = await db
      .select({
        patientId: appointments.patientId,
        totalAmountCents: appointments.totalAmountCents,
        paymentStatus: appointments.paymentStatus,
        scheduledAt: appointments.scheduledAt,
      })
      .from(appointments)
      .where(and(...conditions));

    // Get patient info
    const patientData = await db
      .select({
        id: patients.id,
        firstName: patients.firstName,
        lastName: patients.lastName,
      })
      .from(patients)
      .where(eq(patients.tenantId, tenantId));

    const patientMap = new Map(
      patientData.map((p) => [p.id, `${p.firstName} ${p.lastName}`])
    );

    // Aggregate per patient
    type PatientAgg = {
      paidCents: number;
      unpaidCents: number;
      lastPaidDate: Date | null;
    };
    const patientAgg = new Map<string, PatientAgg>();

    for (const appt of apptData) {
      const amount = appt.totalAmountCents ?? 0;
      const existing = patientAgg.get(appt.patientId) ?? {
        paidCents: 0,
        unpaidCents: 0,
        lastPaidDate: null,
      };

      if (appt.paymentStatus === 'paid') {
        existing.paidCents += amount;
        if (
          !existing.lastPaidDate ||
          appt.scheduledAt > existing.lastPaidDate
        ) {
          existing.lastPaidDate = appt.scheduledAt;
        }
      } else if (
        appt.paymentStatus === 'unpaid' ||
        appt.paymentStatus === 'partial'
      ) {
        existing.unpaidCents += amount;
      }
      // 'refunded' — skip

      patientAgg.set(appt.patientId, existing);
    }

    // Build records
    let records: PatientPaymentRecord[] = [];

    for (const [patientId, agg] of patientAgg.entries()) {
      const { paidCents, unpaidCents, lastPaidDate } = agg;
      const totalDebtCents = paidCents + unpaidCents;
      const patientName = patientMap.get(patientId) ?? 'Desconocido';

      let paymentStatus: 'paid' | 'unpaid' | 'partially_paid';
      if (unpaidCents === 0) {
        paymentStatus = 'paid';
      } else if (paidCents === 0) {
        paymentStatus = 'unpaid';
      } else {
        paymentStatus = 'partially_paid';
      }

      records.push({
        patientId,
        patientName,
        totalDebtCents,
        paidCents,
        unpaidCents,
        paymentStatus,
        lastPaymentDate: lastPaidDate?.toISOString() ?? null,
      });
    }

    // Apply filters
    if (filters.patientId) {
      records = records.filter((r) => r.patientId === filters.patientId);
    }
    if (filters.paymentStatus) {
      records = records.filter(
        (r) => r.paymentStatus === filters.paymentStatus
      );
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      records = records.filter((r) =>
        r.patientName.toLowerCase().includes(search)
      );
    }
    if (filters.minAmountCents !== undefined) {
      records = records.filter(
        (r) => r.totalDebtCents >= filters.minAmountCents!
      );
    }
    if (filters.maxAmountCents !== undefined) {
      records = records.filter(
        (r) => r.totalDebtCents <= filters.maxAmountCents!
      );
    }

    const totalCount = records.length;
    const offset = (page - 1) * pageSize;
    const paginated = records.slice(offset, offset + pageSize);

    return { records: paginated, totalCount };
  }

  async getPaymentMethodAnalytics(
    tenantId: string
  ): Promise<PaymentMethodAnalytics[]> {
    const results = await db
      .select({
        paymentMethod: paymentRecords.paymentMethod,
        totalAmountCents: sql<number>`coalesce(sum(${paymentRecords.amountCents}), 0)`,
        transactionCount: sql<number>`count(*)`,
      })
      .from(paymentRecords)
      .where(eq(paymentRecords.tenantId, tenantId))
      .groupBy(paymentRecords.paymentMethod);

    const grandTotal = results.reduce(
      (sum, r) => sum + Number(r.totalAmountCents),
      0
    );

    return results.map((r) => {
      const total = Number(r.totalAmountCents);
      const count = Number(r.transactionCount);
      return {
        paymentMethod: r.paymentMethod,
        totalAmountCents: total,
        transactionCount: count,
        averageAmountCents: count > 0 ? Math.round(total / count) : 0,
        percentage:
          grandTotal > 0 ? Math.round((total / grandTotal) * 10000) / 100 : 0,
      };
    });
  }
}

export const debtDashboardService = new DebtDashboardService();
