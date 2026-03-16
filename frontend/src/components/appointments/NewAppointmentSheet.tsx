import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CalendarIcon,
  Clock,
  FileText,
  Plus,
  User,
  Syringe,
  Trash2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { QuickAddPatientDialog } from './QuickAddPatientDialog';
import type { AppointmentFormData } from '@/hooks/useAppointments';
import type { Patient, Treatment } from '@/types';

interface NewAppointmentSheetProps {
  form: AppointmentFormData;
  setForm: React.Dispatch<React.SetStateAction<AppointmentFormData>>;
  patients: Patient[];
  treatments: Treatment[];
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onPatientCreated: (patient: Patient) => void;
}

export function NewAppointmentSheet({
  form,
  setForm,
  patients,
  treatments,
  submitting,
  onSubmit,
  onPatientCreated,
}: NewAppointmentSheetProps) {
  const lineItems = form.treatments ?? [];
  const totalCents = lineItems.reduce(
    (sum, t) => sum + t.quantity * t.unit_price_cents,
    0
  );

  const addTreatment = (t: Treatment) => {
    const existing = lineItems.find((i) => i.treatment_id === t.id);
    if (existing) {
      setForm((f) => ({
        ...f,
        treatments: (f.treatments ?? []).map((i) =>
          i.treatment_id === t.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      }));
    } else {
      setForm((f) => ({
        ...f,
        treatments: [
          ...(f.treatments ?? []),
          {
            treatment_id: t.id,
            quantity: 1,
            unit_price_cents: t.price_cents,
          },
        ],
      }));
    }
  };

  const removeLineItem = (treatmentId: string) => {
    setForm((f) => ({
      ...f,
      treatments: (f.treatments ?? []).filter(
        (i) => i.treatment_id !== treatmentId
      ),
    }));
  };

  const updateQuantity = (treatmentId: string, quantity: number) => {
    if (quantity < 1) return;
    setForm((f) => ({
      ...f,
      treatments: (f.treatments ?? []).map((i) =>
        i.treatment_id === treatmentId ? { ...i, quantity } : i
      ),
    }));
  };
  return (
    <div className="flex h-full flex-col">
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

      <form onSubmit={onSubmit} className="flex flex-1 flex-col">
        <ScrollArea className="flex-1">
          <div className="space-y-6 p-6">
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
                <SelectTrigger className="h-12 w-full rounded-lg bg-background">
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
              <QuickAddPatientDialog onPatientCreated={onPatientCreated} />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-primary" />
                  Hora
                </label>
                <Input
                  type="time"
                  className="h-12 rounded-lg bg-background"
                  value={form.time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, time: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-primary" />
                  Duración
                </label>
                <Select
                  value={form.duration_minutes.toString()}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, duration_minutes: Number(value) }))
                  }
                >
                  <SelectTrigger className="h-12 w-full rounded-lg bg-background">
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

            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Syringe className="h-4 w-4 text-primary" />
                Tratamientos{' '}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </label>
              {treatments.length === 0 ? (
                <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
                  Crea tratamientos en tu perfil para agregarlos aquí.
                </p>
              ) : (
                <>
                  <Select
                    onValueChange={(id) => {
                      const t = treatments.find((x) => x.id === id);
                      if (t) addTreatment(t);
                    }}
                    value=""
                  >
                    <SelectTrigger className="h-12 w-full rounded-lg bg-background">
                      <SelectValue placeholder="Agregar tratamiento" />
                    </SelectTrigger>
                    <SelectContent>
                      {treatments.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} — {(t.price_cents / 100).toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {lineItems.length > 0 && (
                    <div className="space-y-2 rounded-lg border p-3">
                      {lineItems.map((item) => {
                        const t = treatments.find(
                          (x) => x.id === item.treatment_id
                        );
                        return (
                          <div
                            key={item.treatment_id}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="text-sm font-medium truncate">
                              {t?.name ?? '—'}
                            </span>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={1}
                                className="h-8 w-16"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(
                                    item.treatment_id,
                                    parseInt(e.target.value, 10) || 1
                                  )
                                }
                              />
                              <span className="w-16 text-right text-sm tabular-nums">
                                {(
                                  (item.quantity * item.unit_price_cents) /
                                  100
                                ).toFixed(2)}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() =>
                                  removeLineItem(item.treatment_id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex justify-between border-t pt-2 font-medium">
                        <span>Total</span>
                        <span className="tabular-nums">
                          {(totalCents / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2.5">
              <label className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-primary" />
                Notas{' '}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </label>
              <Input
                className="h-12 rounded-lg bg-background"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Motivo de la consulta, observaciones..."
              />
            </div>
          </div>
        </ScrollArea>

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
