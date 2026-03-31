import { and, count, eq, sql } from 'drizzle-orm';
import { db, reminderDeliveries, reminderOptOuts } from '../db/client.js';

export async function hasReminderBeenSent(
  appointmentId: string
): Promise<boolean> {
  const [row] = await db
    .select({ id: reminderDeliveries.id })
    .from(reminderDeliveries)
    .where(
      and(
        eq(reminderDeliveries.appointmentId, appointmentId),
        eq(reminderDeliveries.status, 'sent')
      )
    )
    .limit(1);
  return !!row;
}

export async function checkOptOut(
  tenantId: string,
  patientId: string
): Promise<boolean> {
  const [row] = await db
    .select({ id: reminderOptOuts.id })
    .from(reminderOptOuts)
    .where(
      and(
        eq(reminderOptOuts.tenantId, tenantId),
        eq(reminderOptOuts.patientId, patientId)
      )
    )
    .limit(1);
  return !!row;
}

export async function recordDelivery(data: {
  tenantId: string;
  appointmentId: string;
  patientId: string;
  patientEmail: string;
  status: 'sent' | 'failed' | 'skipped';
  errorMessage?: string | null;
  retryCount?: number;
}): Promise<void> {
  await db.insert(reminderDeliveries).values({
    tenantId: data.tenantId,
    appointmentId: data.appointmentId,
    patientId: data.patientId,
    patientEmail: data.patientEmail,
    status: data.status,
    errorMessage: data.errorMessage ?? null,
    retryCount: data.retryCount ?? 0,
  });
}

export async function getDailyReminderCount(date: Date): Promise<number> {
  const dateStr = date.toISOString().split('T')[0];
  const [row] = await db
    .select({ total: count() })
    .from(reminderDeliveries)
    .where(
      sql`${reminderDeliveries.sentAt}::date = ${dateStr}::date AND ${reminderDeliveries.status} = 'sent'`
    );
  return row?.total ?? 0;
}

export async function getSuccessRate(
  since: Date
): Promise<{ total: number; sent: number; rate: number }> {
  const [row] = await db
    .select({
      total: count(),
      sent: sql<number>`count(*) filter (where ${reminderDeliveries.status} = 'sent')`,
    })
    .from(reminderDeliveries)
    .where(sql`${reminderDeliveries.sentAt} >= ${since.toISOString()}`);

  const total = row?.total ?? 0;
  const sent = Number(row?.sent ?? 0);
  const rate = total > 0 ? (sent / total) * 100 : 100;
  return { total, sent, rate };
}
