import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import type { MedicalCondition, Medication, Allergy } from '@/types';

type MedicalHistoryType = 'condition' | 'medication' | 'allergy';

interface MedicalHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: MedicalHistoryType;
  item?: MedicalCondition | Medication | Allergy | null;
  onSubmit: (data: any) => Promise<void>;
}

const titles = {
  condition: 'Condición médica',
  medication: 'Medicamento',
  allergy: 'Alergia',
};

const descriptions = {
  condition: 'Registra una condición médica del paciente',
  medication: 'Registra un medicamento que toma el paciente',
  allergy: 'Registra una alergia del paciente',
};

export function MedicalHistoryDialog({
  open,
  onOpenChange,
  type,
  item,
  onSubmit,
}: MedicalHistoryDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (item) {
      setForm(item);
    } else {
      setForm({});
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm({});
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {item ? 'Editar' : 'Agregar'} {titles[type]}
            </DialogTitle>
            <DialogDescription>{descriptions[type]}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {type === 'condition' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="condition_name">Nombre de la condición</Label>
                  <Input
                    id="condition_name"
                    placeholder="Ej: Diabetes tipo 2"
                    value={form.condition_name || ''}
                    onChange={(e) =>
                      setForm({ ...form, condition_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="diagnosed_date">
                    Fecha de diagnóstico (opcional)
                  </Label>
                  <Input
                    id="diagnosed_date"
                    type="date"
                    value={form.diagnosed_date || ''}
                    onChange={(e) =>
                      setForm({ ...form, diagnosed_date: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Información adicional..."
                    className="resize-none"
                    value={form.notes || ''}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </>
            )}

            {type === 'medication' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="medication_name">
                    Nombre del medicamento
                  </Label>
                  <Input
                    id="medication_name"
                    placeholder="Ej: Metformina"
                    value={form.medication_name || ''}
                    onChange={(e) =>
                      setForm({ ...form, medication_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dosage">Dosis (opcional)</Label>
                  <Input
                    id="dosage"
                    placeholder="Ej: 500mg dos veces al día"
                    value={form.dosage || ''}
                    onChange={(e) =>
                      setForm({ ...form, dosage: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Información adicional..."
                    className="resize-none"
                    value={form.notes || ''}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </>
            )}

            {type === 'allergy' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="allergen_name">Nombre del alérgeno</Label>
                  <Input
                    id="allergen_name"
                    placeholder="Ej: Penicilina"
                    value={form.allergen_name || ''}
                    onChange={(e) =>
                      setForm({ ...form, allergen_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="allergy_type">Tipo de alergia</Label>
                  <Select
                    value={form.allergy_type || 'other'}
                    onValueChange={(value) =>
                      setForm({ ...form, allergy_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medication">Medicamento</SelectItem>
                      <SelectItem value="food">Alimento</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Información adicional..."
                    className="resize-none"
                    value={form.notes || ''}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : item ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
