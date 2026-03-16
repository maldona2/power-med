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
import type { Treatment } from '@/types';

interface TreatmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment?: Treatment | null;
  onSubmit: (data: { name: string; price_cents: number }) => Promise<void>;
}

export function TreatmentFormDialog({
  open,
  onOpenChange,
  treatment,
  onSubmit,
}: TreatmentFormDialogProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (treatment) {
      setName(treatment.name);
      setPrice((treatment.price_cents / 100).toString());
    } else {
      setName('');
      setPrice('');
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
      });

      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    // Permite números y un solo decimal
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setPrice(value);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {treatment ? 'Editar tratamiento' : 'Nuevo tratamiento'}
            </DialogTitle>
            <DialogDescription>
              {treatment
                ? 'Modifica el nombre y precio del tratamiento.'
                : 'Define un tratamiento con su precio por defecto.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej. Consulta general"
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
