import { Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AppointmentTreatmentRow } from '@/types';
import type { PaymentStatus } from '@/types';
import { paymentConfig } from './constants';

interface TreatmentInfoSectionProps {
  treatments: AppointmentTreatmentRow[];
  totalAmountCents: number | null;
  paymentStatus: string;
  onPaymentChange?: (newStatus: PaymentStatus) => Promise<void>;
  isUpdating?: boolean;
}

export function TreatmentInfoSection({
  treatments,
  totalAmountCents,
  paymentStatus,
  onPaymentChange,
  isUpdating = false,
}: TreatmentInfoSectionProps) {
  if (treatments.length === 0) return null;

  const cfg =
    paymentConfig[paymentStatus as PaymentStatus] ?? paymentConfig.unpaid;
  const total = (totalAmountCents ?? 0) / 100;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Banknote className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Tratamientos y pago
        </span>
      </div>

      <div className="space-y-2">
        {treatments.map((t) => (
          <div key={t.id} className="flex items-center justify-between text-sm">
            <span className="text-foreground">
              {t.treatment_name}{' '}
              <span className="text-muted-foreground">× {t.quantity}</span>
            </span>
            <span className="tabular-nums font-medium">
              ${((t.quantity * t.unit_price_cents) / 100).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <span className="font-semibold">Total</span>
        <span className="text-lg font-bold tabular-nums">
          ${total.toFixed(2)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Estado de pago</span>
        {onPaymentChange ? (
          <div className="flex flex-wrap gap-1.5">
            {(
              Object.entries(paymentConfig) as [
                PaymentStatus,
                { label: string; className: string },
              ][]
            ).map(([key, config]) => (
              <Button
                key={key}
                variant={paymentStatus === key ? 'default' : 'outline'}
                size="sm"
                disabled={isUpdating || paymentStatus === key}
                onClick={() => onPaymentChange(key)}
                className={cn(
                  'h-8 text-xs',
                  paymentStatus === key && config.className
                )}
              >
                {config.label}
              </Button>
            ))}
          </div>
        ) : (
          <Badge variant="outline" className={cn('gap-1.5', cfg.className)}>
            {cfg.label}
          </Badge>
        )}
      </div>
    </div>
  );
}
