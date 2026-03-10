import type { AppointmentFormData } from '@/hooks/useAppointments';

export const statusConfig: Record<
  string,
  { label: string; className: string; dotColor: string }
> = {
  pending: {
    label: 'Pendiente',
    className: 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100',
    dotColor: 'bg-amber-500',
  },
  confirmed: {
    label: 'Confirmado',
    className: 'bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-100',
    dotColor: 'bg-sky-500',
  },
  completed: {
    label: 'Completado',
    className:
      'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100',
    dotColor: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Cancelado',
    className:
      'bg-neutral-50 border-neutral-200 text-neutral-500 hover:bg-neutral-100 line-through opacity-60',
    dotColor: 'bg-neutral-400',
  },
};

export const HOUR_HEIGHT = 60;
export const START_HOUR = 0;
export const END_HOUR = 24;
export const HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i
);

export const emptyForm: AppointmentFormData = {
  patient_id: '',
  date: null,
  time: '10:00',
  duration_minutes: 60,
  notes: '',
};
