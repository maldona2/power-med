import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Treatment } from '@/types';

interface TreatmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment?: Treatment | null;
  onSubmit: (data: {
    name: string;
    price_cents: number;
    initial_frequency_weeks?: number | null;
    initial_sessions_count?: number | null;
    maintenance_frequency_weeks?: number | null;
    protocol_notes?: string | null;
  }) => Promise<void>;
}

export function TreatmentFormDialog({
  open,
  onOpenChange,
  treatment,
  onSubmit,
}: TreatmentFormDialogProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [initialFrequency, setInitialFrequency] = useState('');
  const [initialSessions, setInitialSessions] = useState('');
  const [maintenanceFrequency, setMaintenanceFrequency] = useState('');
  const [protocolNotes, setProtocolNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showProtocol, setShowProtocol] = useState(false);

  useEffect(() => {
    if (treatment) {
      setName(treatment.name);
      setPrice((treatment.price_cents / 100).toString());
      setInitialFrequency(treatment.initial_frequency_weeks?.toString() ?? '');
      setInitialSessions(treatment.initial_sessions_count?.toString() ?? '');
      setMaintenanceFrequency(
        treatment.maintenance_frequency_weeks?.toString() ?? ''
      );
      setProtocolNotes(treatment.protocol_notes ?? '');
      setShowProtocol(
        !!treatment.initial_frequency_weeks ||
          !!treatment.initial_sessions_count ||
          !!treatment.maintenance_frequency_weeks
      );
    } else {
      setName('');
      setPrice('');
      setInitialFrequency('');
      setInitialSessions('');
      setMaintenanceFrequency('');
      setProtocolNotes('');
      setShowProtocol(false);
    }
  }, [treatment, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const cents = Math.round(parseFloat(price || '0') * 100);

    if (!name.trim() || cents < 0) return;

    setSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        price_cents: cents,
        initial_frequency_weeks: initialFrequency
          ? parseInt(initialFrequency, 10)
          : null,
        initial_sessions_count: initialSessions
          ? parseInt(initialSessions, 10)
          : null,
        maintenance_frequency_weeks: maintenanceFrequency
          ? parseInt(maintenanceFrequency, 10)
          : null,
        protocol_notes: protocolNotes || null,
      });

      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setPrice(value);
    }
  }

  function handleNumberChange(
    setter: React.Dispatch<React.SetStateAction<string>>
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (/^\d*$/.test(value) || value === '') {
        setter(value);
      }
    };
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {treatment ? 'Editar tratamiento' : 'Nuevo tratamiento'}
            </DialogTitle>
            <DialogDescription>
              {treatment
                ? 'Modifica el nombre, precio y protocolo del tratamiento.'
                : 'Define un tratamiento con su precio y protocolo por defecto.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej. Depilación láser"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio (moneda local)</Label>
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                value={price}
                onChange={handlePriceChange}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                Se guarda en centavos internamente
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showProtocol"
                checked={showProtocol}
                onChange={(e) => setShowProtocol(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="showProtocol" className="font-normal">
                Configurar protocolo de seguimiento
              </Label>
            </div>

            {showProtocol && (
              <div className="grid gap-4 rounded-lg border p-4">
                <p className="text-sm font-medium">Protocolo de tratamiento</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="initialFrequency">
                      Frecuencia inicial (semanas)
                    </Label>
                    <Input
                      id="initialFrequency"
                      type="text"
                      inputMode="numeric"
                      value={initialFrequency}
                      onChange={handleNumberChange(setInitialFrequency)}
                      placeholder="ej. 4"
                    />
                    <p className="text-xs text-muted-foreground">
                      Cada cuántas semanas al inicio
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initialSessions">Sesiones iniciales</Label>
                    <Input
                      id="initialSessions"
                      type="text"
                      inputMode="numeric"
                      value={initialSessions}
                      onChange={handleNumberChange(setInitialSessions)}
                      placeholder="ej. 3"
                    />
                    <p className="text-xs text-muted-foreground">
                      Cuántas sesiones en fase inicial
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenanceFrequency">
                    Frecuencia mantenimiento (semanas)
                  </Label>
                  <Input
                    id="maintenanceFrequency"
                    type="text"
                    inputMode="numeric"
                    value={maintenanceFrequency}
                    onChange={handleNumberChange(setMaintenanceFrequency)}
                    placeholder="ej. 12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Cada cuántas semanas después de completar las iniciales (ej.
                    12 = trimestral)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="protocolNotes">Notas del protocolo</Label>
                  <Textarea
                    id="protocolNotes"
                    value={protocolNotes}
                    onChange={(e) => setProtocolNotes(e.target.value)}
                    placeholder="Instrucciones especiales para el paciente..."
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={submitting || !name.trim()}>
              {submitting ? 'Guardando...' : treatment ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
