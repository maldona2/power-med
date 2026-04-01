import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Clock, Timer, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { statusConfig } from './constants';
import type { AppointmentDetailExtended, Appointment } from '@/types';

export interface AppointmentEditFormData {
  scheduled_date: Date | null;
  scheduled_time: string;
  duration_minutes: number;
  notes: string;
  status: Appointment['status'];
}

interface AppointmentInfoSectionProps {
  appointment: AppointmentDetailExtended;
  isEditMode: boolean;
  formData: AppointmentEditFormData;
  validationErrors: Record<string, string>;
  disabled: boolean;
  onChange: (
    field: keyof AppointmentEditFormData,
    value: AppointmentEditFormData[keyof AppointmentEditFormData]
  ) => void;
}

const STATUS_OPTIONS: { value: Appointment['status']; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'no-show', label: 'No se presentó' },
];

export function AppointmentInfoSection({
  appointment,
  isEditMode,
  formData,
  validationErrors,
  disabled,
  onChange,
}: AppointmentInfoSectionProps) {
  const scheduledDate = parseISO(appointment.scheduled_at);

  if (!isEditMode) {
    return (
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Información del turno
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="capitalize">
              {format(scheduledDate, "EEEE d 'de' MMMM 'de' yyyy", {
                locale: es,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span>{format(scheduledDate, 'HH:mm')}</span>
          </div>
          {appointment.duration_minutes != null && (
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span>{appointment.duration_minutes} min</span>
            </div>
          )}
          {appointment.notes && (
            <div className="flex items-start gap-2 text-sm">
              <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
              <span className="leading-relaxed">{appointment.notes}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Estado:</span>
            <span>
              {statusConfig[appointment.status]?.label ??
                STATUS_OPTIONS.find((o) => o.value === appointment.status)
                  ?.label ??
                appointment.status}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Información del turno
      </h3>

      {/* Date picker */}
      <div className="space-y-1.5">
        <Label htmlFor="scheduled_date">Fecha</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="scheduled_date"
              variant="outline"
              disabled={disabled}
              aria-label="Seleccionar fecha del turno"
              className={cn(
                'w-full justify-start text-left font-normal',
                !formData.scheduled_date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.scheduled_date
                ? format(formData.scheduled_date, "d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })
                : 'Seleccionar fecha'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.scheduled_date ?? undefined}
              onSelect={(date) => onChange('scheduled_date', date ?? null)}
              locale={es}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {validationErrors.scheduled_date && (
          <p className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            {validationErrors.scheduled_date}
          </p>
        )}
      </div>

      {/* Time picker */}
      <div className="space-y-1.5">
        <Label htmlFor="scheduled_time">Hora</Label>
        <Input
          id="scheduled_time"
          type="time"
          value={formData.scheduled_time}
          onChange={(e) => onChange('scheduled_time', e.target.value)}
          disabled={disabled}
          aria-label="Hora del turno"
        />
        {validationErrors.scheduled_time && (
          <p className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            {validationErrors.scheduled_time}
          </p>
        )}
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <Label htmlFor="duration_minutes">Duración (minutos)</Label>
        <Input
          id="duration_minutes"
          type="number"
          min={1}
          max={1440}
          value={formData.duration_minutes}
          onChange={(e) => onChange('duration_minutes', Number(e.target.value))}
          disabled={disabled}
          aria-label="Duración en minutos"
        />
        {validationErrors.duration_minutes && (
          <p className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            {validationErrors.duration_minutes}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label htmlFor="status">Estado</Label>
        <Select
          value={formData.status}
          onValueChange={(v) => onChange('status', v as Appointment['status'])}
          disabled={disabled}
        >
          <SelectTrigger id="status" aria-label="Estado del turno">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {validationErrors.status && (
          <p className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            {validationErrors.status}
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          disabled={disabled}
          placeholder="Notas adicionales..."
          rows={3}
          aria-label="Notas del turno"
        />
      </div>
    </div>
  );
}
