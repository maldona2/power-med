import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import type { Patient } from '@/types';

interface QuickAddPatientDialogProps {
  onPatientCreated: (patient: Patient) => void;
}

export function QuickAddPatientDialog({
  onPatientCreated,
}: QuickAddPatientDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name) return;

    setSubmitting(true);
    try {
      const { data } = await api.post<Patient>('/patients', {
        ...form,
        date_of_birth: '',
        notes: '',
      });
      onPatientCreated(data);
      setForm({ first_name: '', last_name: '', phone: '', email: '' });
      setOpen(false);
    } catch (error) {
      console.error('Error creating patient:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-lg border-dashed"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Crear nuevo paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear nuevo paciente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="first_name"
              value={form.first_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, first_name: e.target.value }))
              }
              placeholder="Juan"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">
              Apellido <span className="text-destructive">*</span>
            </Label>
            <Input
              id="last_name"
              value={form.last_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, last_name: e.target.value }))
              }
              placeholder="Pérez"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="+54 9 11 1234-5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="juan@ejemplo.com"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={submitting || !form.first_name || !form.last_name}
            >
              {submitting ? 'Creando...' : 'Crear paciente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
