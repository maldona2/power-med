/**
 * WhatsAppNotificationService - Outbound patient notification channel via WhatsApp.
 *
 * Mirrors the role of mailService.ts but delivers plain-text WhatsApp messages
 * through the Meta Cloud API. All sends are fire-and-forget safe: errors are
 * logged and swallowed so a failed WhatsApp send never breaks an appointment operation.
 *
 * Usage:
 *   const wa = new WhatsAppNotificationService();
 *   void wa.sendAppointmentBooked(patient.phone, notificationData);
 */

import { MetaAPIClient } from './MetaAPIClient.js';
import {
  appointmentBookedMessage,
  appointmentConfirmedMessage,
  appointmentCancelledMessage,
  appointmentReminderMessage,
  type AppointmentNotificationData,
} from '../templates.js';
import logger from '../../utils/logger.js';

export type { AppointmentNotificationData };

const featureEnabled =
  (process.env.FEATURE_WHATSAPP_ENABLED ?? 'true').toLowerCase() !== 'false';

export class WhatsAppNotificationService {
  private readonly client: MetaAPIClient;

  constructor(client = new MetaAPIClient()) {
    this.client = client;
  }

  async sendAppointmentBooked(
    phone: string,
    data: AppointmentNotificationData
  ): Promise<void> {
    await this._send(phone, appointmentBookedMessage(data), 'booked');
  }

  async sendAppointmentConfirmed(
    phone: string,
    data: AppointmentNotificationData
  ): Promise<void> {
    await this._send(phone, appointmentConfirmedMessage(data), 'confirmed');
  }

  async sendAppointmentCancelled(
    phone: string,
    data: AppointmentNotificationData
  ): Promise<void> {
    await this._send(phone, appointmentCancelledMessage(data), 'cancelled');
  }

  async sendAppointmentReminder(
    phone: string,
    data: AppointmentNotificationData
  ): Promise<void> {
    await this._send(phone, appointmentReminderMessage(data), 'reminder');
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  private async _send(
    phone: string,
    text: string,
    type: string
  ): Promise<void> {
    if (!featureEnabled) {
      logger.debug(
        { type },
        'WhatsAppNotificationService: feature disabled, skipping'
      );
      return;
    }

    if (!phone) {
      logger.debug(
        { type },
        'WhatsAppNotificationService: no phone number, skipping'
      );
      return;
    }

    try {
      const result = await this.client.sendTextMessage(phone, text);
      if (!result.success) {
        logger.warn(
          { type, phone, error: result.error },
          'WhatsAppNotificationService: send failed'
        );
      }
    } catch (err) {
      logger.error(
        { err, type, phone },
        'WhatsAppNotificationService: unexpected error'
      );
    }
  }
}

export const whatsAppNotificationService = new WhatsAppNotificationService();
