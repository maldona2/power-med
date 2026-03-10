import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  startOfWeek,
  subWeeks,
  parseISO,
  isSameWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Plus,
  CalendarIcon,
  Clock,
  User,
  FileText,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useAppointments } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { Appointment, Patient } from '@/types';
import type { AppointmentFormData } from '@/hooks/useAppointments';

const statusConfig: Record<
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

const HOUR_HEIGHT = 60;
const START_HOUR = 0;
const END_HOUR = 24;
const HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i
);

const emptyForm: AppointmentFormData = {
  patient_id: '',
  date: null,
  time: '10:00',
  duration_minutes: 60,
  notes: '',
};

export function AppointmentsPage() {
  const {
    appointments,
    loading,
    status,
    setStatus: setStatusFilter,
    refetch,
  } = useAppointments();
  const { patients } = usePatients();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [form, setForm] = useState<AppointmentFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (status !== 'all' && apt.status !== status) return false;
      const aptDate = parseISO(apt.scheduled_at);
      return isSameWeek(aptDate, currentDate, { weekStartsOn: 1 });
    });
  }, [appointments, status, currentDate]);

  const getAppointmentsForDay = (day: Date) => {
    return filteredAppointments.filter((apt) =>
      isSameDay(parseISO(apt.scheduled_at), day)
    );
  };

  const calculatePosition = (apt: Appointment) => {
    const date = parseISO(apt.scheduled_at);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const top =
      (hours - START_HOUR) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
    const height = (apt.duration_minutes / 60) * HOUR_HEIGHT;
    return { top, height: Math.max(height, 24) };
  };

  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const openNewAppointment = (date?: Date) => {
    setSelectedAppointment(null);
    setForm({
      ...emptyForm,
      date: date ?? new Date(),
    });
    setSheetOpen(true);
  };

  const openAppointmentDetails = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setForm({
      patient_id: apt.patient_id,
      date: parseISO(apt.scheduled_at),
      time: format(parseISO(apt.scheduled_at), 'HH:mm'),
      duration_minutes: apt.duration_minutes,
      notes: apt.notes || '',
    });
    setSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.patient_id) {
      toast.error('Selecciona paciente y fecha');
      return;
    }
    setSubmitting(true);
    try {
      const [hours, minutes] = form.time.split(':').map(Number);
      const scheduled = new Date(form.date);
      scheduled.setHours(hours ?? 0, minutes ?? 0, 0, 0);

      const payload = {
        patient_id: form.patient_id,
        scheduled_at: scheduled.toISOString(),
        duration_minutes: form.duration_minutes,
        notes: form.notes || null,
      };

      if (selectedAppointment) {
        await api.put(`/appointments/${selectedAppointment.id}`, payload);
        toast.success('Turno actualizado');
      } else {
        await api.post('/appointments', payload);
        toast.success('Turno creado');
      }
      setSheetOpen(false);
      setForm(emptyForm);
      refetch();
    } catch {
      toast.error(
        selectedAppointment
          ? 'Error al actualizar turno'
          : 'Error al crear turno'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] min-h-0 flex-col overflow-hidden bg-background md:-m-6">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-4 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Turnos</h1>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {filteredAppointments.length} esta semana
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={status}
            onValueChange={(v) => setStatusFilter(v as typeof status)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="confirmed">Confirmados</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => openNewAppointment()}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo turno
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar - Mini Calendar */}
        <aside className="hidden w-72 shrink-0 overflow-hidden border-r p-4 lg:block">
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate ?? undefined}
              onSelect={(date) => {
                setSelectedDate(date ?? null);
                if (date) setCurrentDate(date);
              }}
              className="rounded-lg border"
            />

            {/* Status Legend */}
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Estado de turnos
                </h3>
                <div className="space-y-2">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div
                        className={cn(
                          'h-2.5 w-2.5 rounded-full',
                          config.dotColor
                        )}
                      />
                      <span className="text-sm">{config.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Main Calendar */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Week Navigation */}
          <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoy
              </Button>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={goToPreviousWeek}>
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={goToNextWeek}>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-lg font-medium">
                {format(weekStart, 'MMMM yyyy', { locale: es })}
              </h2>
            </div>
          </div>

          {/* Week Header */}
          <div className="grid shrink-0 grid-cols-[auto_repeat(7,1fr)] border-b">
            <div className="w-16 border-r" />
            {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date());
              const dayAppointments = getAppointmentsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'flex flex-col items-center border-r py-2 last:border-r-0',
                    isToday && 'bg-primary/5'
                  )}
                >
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {format(day, 'EEE', { locale: es })}
                  </span>
                  <span
                    className={cn(
                      'mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                      isToday && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayAppointments.length > 0 && (
                    <span className="mt-1 text-xs text-muted-foreground">
                      {dayAppointments.length} turno
                      {dayAppointments.length !== 1 && 's'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time Grid */}
          <ScrollArea className="min-h-0 flex-1">
            <div
              className="grid w-full min-w-0 grid-cols-[auto_repeat(7,1fr)]"
              style={{ height: HOURS.length * HOUR_HEIGHT }}
            >
              {/* Time Labels */}
              <div className="w-16 border-r">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="relative border-b"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    <span className="absolute top-5 right-3.5 text-xs text-muted-foreground">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {weekDays.map((day) => {
                const isToday = isSameDay(day, new Date());
                const dayAppointments = getAppointmentsForDay(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'relative border-r last:border-r-0',
                      isToday && 'bg-primary/5'
                    )}
                    onClick={() => openNewAppointment(day)}
                  >
                    {/* Hour Lines */}
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="border-b border-dashed border-border/50"
                        style={{ height: HOUR_HEIGHT }}
                      />
                    ))}

                    {/* Current Time Indicator */}
                    {isToday && <CurrentTimeIndicator />}

                    {/* Appointments */}
                    {dayAppointments.map((apt) => {
                      const { top, height } = calculatePosition(apt);
                      const config = statusConfig[apt.status];

                      return (
                        <button
                          key={apt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openAppointmentDetails(apt);
                          }}
                          className={cn(
                            'absolute inset-x-1 cursor-pointer overflow-hidden rounded-md border px-2 py-1 text-left transition-all',
                            config.className
                          )}
                          style={{ top, height }}
                        >
                          <div className="flex items-center gap-1.5">
                            <div
                              className={cn(
                                'h-2 w-2 shrink-0 rounded-full',
                                config.dotColor
                              )}
                            />
                            <span className="truncate text-xs font-medium">
                              {apt.patient_last_name && apt.patient_first_name
                                ? `${apt.patient_last_name}, ${apt.patient_first_name}`
                                : apt.patient_first_name ||
                                  apt.patient_last_name ||
                                  'Sin nombre'}
                            </span>
                          </div>
                          {height >= 40 && (
                            <p className="mt-0.5 truncate text-xs opacity-75">
                              {format(parseISO(apt.scheduled_at), 'HH:mm')} ·{' '}
                              {apt.duration_minutes}min
                            </p>
                          )}
                          {height >= 56 && apt.notes && (
                            <p className="mt-0.5 truncate text-xs opacity-60">
                              {apt.notes}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </main>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="flex w-full flex-col overflow-hidden p-0 sm:max-w-md">
          {selectedAppointment ? (
            <AppointmentDetailSheet
              appointment={selectedAppointment}
              onClose={() => setSheetOpen(false)}
            />
          ) : (
            <NewAppointmentSheet
              form={form}
              setForm={setForm}
              patients={patients}
              submitting={submitting}
              onSubmit={handleSubmit}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CurrentTimeIndicator() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  if (hours < START_HOUR || hours >= END_HOUR) return null;

  const top = (hours - START_HOUR) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;

  return (
    <div
      className="absolute left-0 right-0 z-10 flex items-center"
      style={{ top }}
    >
      <div className="h-2.5 w-2.5 -ml-1 rounded-full bg-destructive" />
      <div className="h-0.5 flex-1 bg-destructive" />
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-36" />
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-72 border-r p-4 lg:block">
          <Skeleton className="h-80 w-full rounded-lg" />
        </aside>
        <main className="flex-1 p-4">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-lg" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function AppointmentDetailSheet({
  appointment,
  onClose,
}: {
  appointment: Appointment;
  onClose: () => void;
}) {
  const [activeStatus, setActiveStatus] = useState(appointment.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const config = statusConfig[activeStatus];
  const patient =
    appointment.patient_last_name && appointment.patient_first_name
      ? `${appointment.patient_last_name}, ${appointment.patient_first_name}`
      : appointment.patient_first_name ||
        appointment.patient_last_name ||
        'Sin nombre';
  const scheduledDate = parseISO(appointment.scheduled_at);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    setActiveStatus(newStatus as Appointment['status']);
    setIsUpdating(false);
  };

  const statusColors: Record<string, { bg: string; border: string }> = {
    pending: { bg: 'bg-amber-50', border: 'border-amber-200' },
    confirmed: { bg: 'bg-sky-50', border: 'border-sky-200' },
    completed: { bg: 'bg-emerald-50', border: 'border-emerald-200' },
    cancelled: { bg: 'bg-neutral-50', border: 'border-neutral-200' },
  };

  const headerStyle = statusColors[activeStatus] || statusColors.pending;

  return (
    <div className="flex h-full flex-col">
      {/* Header with colored accent */}
      <div
        className={cn('border-b px-6 py-6', headerStyle.bg, headerStyle.border)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center',
                  headerStyle.bg,
                  'border',
                  headerStyle.border
                )}
              >
                <User className="h-5 w-5 text-foreground/70" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Paciente
                </p>
                <h2 className="truncate text-lg font-semibold tracking-tight">
                  {patient}
                </h2>
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn('shrink-0 gap-1.5 px-3 py-1', config.className)}
          >
            <span className={cn('h-2 w-2 rounded-full', config.dotColor)} />
            {config.label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-6">
          {/* Date & Time Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="group rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Fecha
                </span>
              </div>
              <p className="mt-2 text-sm font-medium capitalize">
                {format(scheduledDate, 'EEEE', { locale: es })}
              </p>
              <p className="text-lg font-semibold">
                {format(scheduledDate, "d 'de' MMMM", { locale: es })}
              </p>
            </div>
            <div className="group rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Hora
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold tabular-nums">
                {format(scheduledDate, 'HH:mm')}
              </p>
              <p className="text-sm text-muted-foreground">
                {appointment.duration_minutes} minutos
              </p>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Notas
                </span>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <p className="text-sm leading-relaxed">{appointment.notes}</p>
              </div>
            </div>
          )}

          {/* Status Actions */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Cambiar estado
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <Button
                  key={key}
                  variant={activeStatus === key ? 'default' : 'outline'}
                  size="sm"
                  disabled={isUpdating || activeStatus === key}
                  onClick={() => handleStatusChange(key)}
                  className={cn(
                    'h-10 justify-start rounded-lg',
                    activeStatus === key && 'pointer-events-none'
                  )}
                >
                  <span
                    className={cn(
                      'mr-2 h-2.5 w-2.5 rounded-full',
                      activeStatus === key
                        ? 'bg-primary-foreground'
                        : cfg.dotColor
                    )}
                  />
                  {cfg.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t bg-muted/30 p-4">
        <div className="flex gap-3">
          <Button variant="outline" className="h-11 flex-1" onClick={onClose}>
            Cerrar
          </Button>
          <Button className="h-11 flex-1" asChild>
            <Link to={`/app/patients/${appointment.patient_id}`}>
              <User className="mr-2 h-4 w-4" />
              Ver paciente
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function NewAppointmentSheet({
  form,
  setForm,
  patients,
  submitting,
  onSubmit,
}: {
  form: AppointmentFormData;
  setForm: React.Dispatch<React.SetStateAction<AppointmentFormData>>;
  patients: Patient[];
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <SheetHeader className="border-b bg-primary/5 px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/5">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <SheetTitle className="text-xl">Nuevo turno</SheetTitle>
            <p className="text-sm text-muted-foreground">
              Completa los datos para agendar
            </p>
          </div>
        </div>
      </SheetHeader>

      {/* Form */}
      <form onSubmit={onSubmit} className="flex flex-1 flex-col">
        <ScrollArea className="flex-1">
          <div className="space-y-6 p-6">
            {/* Patient Select */}
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-primary" />
                Paciente
              </label>
              <Select
                value={form.patient_id}
                onValueChange={(value) =>
                  setForm((f) => ({ ...f, patient_id: value }))
                }
              >
                <SelectTrigger className="h-12 rounded-lg">
                  <SelectValue placeholder="Selecciona un paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="py-2.5">
                      <span className="font-medium">{p.last_name}</span>,{' '}
                      {p.first_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-sm font-medium">
                <CalendarIcon className="h-4 w-4 text-primary" />
                Fecha
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'h-12 w-full justify-start rounded-lg text-left font-normal',
                      !form.date && 'text-muted-foreground'
                    )}
                    type="button"
                  >
                    {form.date
                      ? format(form.date, "EEEE, d 'de' MMMM yyyy", {
                          locale: es,
                        })
                      : 'Elegir fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.date ?? undefined}
                    onSelect={(d) =>
                      setForm((f) => ({ ...f, date: d ?? null }))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-primary" />
                  Hora
                </label>
                <Input
                  type="time"
                  className="h-12 rounded-lg"
                  value={form.time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, time: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-sm font-medium">Duración</label>
                <Select
                  value={form.duration_minutes.toString()}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, duration_minutes: Number(value) }))
                  }
                >
                  <SelectTrigger className="h-12 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1h 30min</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-primary" />
                Notas{' '}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </label>
              <Input
                className="h-12 rounded-lg"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Motivo de la consulta, observaciones..."
              />
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t bg-muted/30 p-4">
          <Button
            type="submit"
            className="h-12 w-full rounded-lg text-base font-medium"
            disabled={submitting || !form.patient_id || !form.date}
          >
            {submitting ? 'Creando...' : 'Crear turno'}
          </Button>
        </div>
      </form>
    </div>
  );
}
