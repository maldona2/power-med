import crypto from 'crypto';
import { and, eq, gt } from 'drizzle-orm';
import {
  db,
  appointmentCancellationTokens,
  appointments,
} from '../db/client.js';
import logger from '../utils/logger.js';

const FRONTEND_BASE_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Generates a one-time cancellation token for an appointment.
 * Returns the raw token (to embed in the URL).
 * Stores only the SHA-256 hash in the DB.
 *
 * @param appointmentId - UUID of the appointment
 * @param tenantId      - UUID of the tenant
 * @param expiresInHours - How long the token is valid (default: 168h = 7 days)
 */
export async function createCancellationToken(
  appointmentId: string,
  tenantId: string,
  expiresInHours = 168
): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  await db.insert(appointmentCancellationTokens).values({
    appointmentId,
    tenantId,
    tokenHash,
    expiresAt,
    used: false,
  });

  return rawToken;
}

/**
 * Builds the full cancel URL for a given raw token.
 */
export function buildCancelUrl(rawToken: string): string {
  return `${FRONTEND_BASE_URL}/cancel/${rawToken}`;
}

export interface CancellationTokenPayload {
  appointmentId: string;
  tenantId: string;
}

/**
 * Validates a raw cancellation token and marks it as used (atomic).
 * Returns the appointment and tenant IDs if valid, null otherwise.
 */
export async function validateAndConsumeCancellationToken(
  rawToken: string
): Promise<CancellationTokenPayload | null> {
  const tokenHash = hashToken(rawToken);
  const now = new Date();

  const [record] = await db
    .select()
    .from(appointmentCancellationTokens)
    .where(
      and(
        eq(appointmentCancellationTokens.tokenHash, tokenHash),
        eq(appointmentCancellationTokens.used, false),
        gt(appointmentCancellationTokens.expiresAt, now)
      )
    )
    .limit(1);

  if (!record) {
    return null;
  }

  // Verify the appointment is still cancellable
  const [appt] = await db
    .select({ status: appointments.status })
    .from(appointments)
    .where(eq(appointments.id, record.appointmentId))
    .limit(1);

  if (!appt || appt.status === 'cancelled' || appt.status === 'completed') {
    logger.info(
      { appointmentId: record.appointmentId, status: appt?.status },
      'CancellationToken: appointment not cancellable'
    );
    return null;
  }

  // Mark token as used
  await db
    .update(appointmentCancellationTokens)
    .set({ used: true })
    .where(eq(appointmentCancellationTokens.id, record.id));

  return {
    appointmentId: record.appointmentId,
    tenantId: record.tenantId,
  };
}
