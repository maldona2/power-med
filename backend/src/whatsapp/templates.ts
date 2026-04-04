/**
 * WhatsApp message templates for patient notifications.
 * All messages are in Spanish (Argentina locale).
 * Plain text only — no HTML.
 */

export interface AppointmentNotificationData {
  patientName: string;
  professionalName: string;
  scheduledAt: Date;
  durationMinutes: number;
  notes?: string | null;
}

function formatDate(date: Date): string {
  return date.toLocaleString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

export function appointmentBookedMessage(
  data: AppointmentNotificationData
): string {
  const date = formatDate(data.scheduledAt);
  return (
    `🏥 *Turno registrado*\n\n` +
    `Hola ${data.patientName}, tu turno ha sido registrado exitosamente.\n\n` +
    `👨‍⚕️ *Profesional:* ${data.professionalName}\n` +
    `📅 *Fecha y hora:* ${date}\n` +
    `⏱ *Duración:* ${data.durationMinutes} min\n` +
    (data.notes ? `📝 *Notas:* ${data.notes}\n` : '') +
    `\nResponde *SI* para confirmar o *CANCELAR* para cancelar el turno.`
  );
}

export function appointmentConfirmedMessage(
  data: AppointmentNotificationData
): string {
  const date = formatDate(data.scheduledAt);
  return (
    `✅ *Turno confirmado*\n\n` +
    `Hola ${data.patientName}, tu turno ha sido confirmado.\n\n` +
    `👨‍⚕️ *Profesional:* ${data.professionalName}\n` +
    `📅 *Fecha y hora:* ${date}\n` +
    `⏱ *Duración:* ${data.durationMinutes} min\n\n` +
    `Te esperamos. Responde *CANCELAR* si necesitas cancelar el turno.`
  );
}

export function appointmentCancelledMessage(
  data: AppointmentNotificationData
): string {
  const date = formatDate(data.scheduledAt);
  return (
    `❌ *Turno cancelado*\n\n` +
    `Hola ${data.patientName}, tu turno ha sido cancelado.\n\n` +
    `👨‍⚕️ *Profesional:* ${data.professionalName}\n` +
    `📅 *Fecha y hora:* ${date}\n\n` +
    `Comunícate con el consultorio para reprogramar tu turno.`
  );
}

export function appointmentReminderMessage(
  data: AppointmentNotificationData
): string {
  const date = formatDate(data.scheduledAt);
  return (
    `🔔 *Recordatorio de turno*\n\n` +
    `Hola ${data.patientName}, te recordamos que tienes un turno mañana.\n\n` +
    `👨‍⚕️ *Profesional:* ${data.professionalName}\n` +
    `📅 *Fecha y hora:* ${date}\n` +
    `⏱ *Duración:* ${data.durationMinutes} min\n\n` +
    `Responde *SI* para confirmar o *CANCELAR* si no puedes asistir.`
  );
}

export function replyConfirmedMessage(professionalName: string): string {
  return (
    `✅ *Turno confirmado*\n\n` +
    `Tu turno con ${professionalName} ha sido confirmado. ¡Te esperamos!`
  );
}

export function replyCancelledMessage(professionalName: string): string {
  return (
    `❌ *Turno cancelado*\n\n` +
    `Tu turno con ${professionalName} ha sido cancelado. ` +
    `Comunícate con el consultorio para reprogramar.`
  );
}
