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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Patient } from '@/types';
import type { PatientFormData } from '@/hooks/usePatients';

const COUNTRY_CODES = [
  { code: '54', dialCode: '+54' },
  { code: '55', dialCode: '+55' },
  { code: '56', dialCode: '+56' },
  { code: '57', dialCode: '+57' },
  { code: '52', dialCode: '+52' },
  { code: '51', dialCode: '+51' },
  { code: '598', dialCode: '+598' },
  { code: '58', dialCode: '+58' },
  { code: '1', dialCode: '+1' },
  { code: '34', dialCode: '+34' },
];

function splitPhone(stored: string): { countryCode: string; local: string } {
  const digits = stored.replace(/\D/g, '');
  const sorted = [...COUNTRY_CODES].sort(
    (a, b) => b.code.length - a.code.length
  );
  for (const cc of sorted) {
    if (digits.startsWith(cc.code)) {
      return { countryCode: cc.code, local: digits.slice(cc.code.length) };
    }
  }
  return { countryCode: '54', local: digits };
}

interface PatientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
  onSubmit: (data: PatientFormData) => Promise<void>;
}

const emptyForm: PatientFormData = {
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  date_of_birth: '',
  notes: '',
};

export function PatientFormDialog({
  open,
  onOpenChange,
  patient,
  onSubmit,
}: PatientFormDialogProps) {
  const [form, setFormState] = useState(emptyForm);
  const [countryCode, setCountryCode] = useState('54');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (patient) {
      const stored = patient.phone ?? '';
      const { countryCode: cc, local } = stored
        ? splitPhone(stored)
        : { countryCode: '54', local: '' };
      setCountryCode(cc);
      setFormState({
        first_name: patient.first_name,
        last_name: patient.last_name,
        phone: local,
        email: patient.email ?? '',
        date_of_birth: patient.date_of_birth ?? '',
        notes: patient.notes ?? '',
      });
    } else {
      setCountryCode('54');
      setFormState(emptyForm);
    }
  }, [patient, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formattedPhone = form.phone.trim()
        ? `${countryCode}${form.phone.replace(/\D/g, '')}`
        : '';
      await onSubmit({ ...form, phone: formattedPhone });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 max-sm:top-0 max-sm:left-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:max-w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none sm:max-h-[calc(100dvh-2rem)] sm:max-w-lg sm:gap-4 sm:p-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col max-sm:h-full max-sm:overflow-hidden"
        >
          <DialogHeader className="shrink-0 px-4 pt-4 sm:px-0 sm:pt-0">
            <DialogTitle>
              {patient ? 'Editar paciente' : 'Nuevo paciente'}
            </DialogTitle>
            <DialogDescription>
              {patient
                ? 'Modifica los datos del paciente.'
                : 'Completa los datos básicos del paciente.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-4 sm:px-0">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="first_name">Nombre</Label>
                  <Input
                    id="first_name"
                    value={form.first_name}
                    onChange={(e) =>
                      setFormState((f) => ({
                        ...f,
                        first_name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input
                    id="last_name"
                    value={form.last_name}
                    onChange={(e) =>
                      setFormState((f) => ({
                        ...f,
                        last_name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((cc) => (
                        <SelectItem key={cc.code} value={cc.code}>
                          {cc.dialCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setFormState((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="3813000120"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setFormState((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date_of_birth">Fecha de nacimiento</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) =>
                    setFormState((f) => ({
                      ...f,
                      date_of_birth: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) =>
                    setFormState((f) => ({ ...f, notes: e.target.value }))
                  }
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : patient ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
