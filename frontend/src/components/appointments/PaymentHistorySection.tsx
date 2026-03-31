import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CreditCard, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { usePatientPaymentHistory } from '@/hooks/usePatientPaymentHistory';
import { paymentConfig } from './constants';
import type { PaymentStatus } from '@/types';

interface PaymentHistorySectionProps {
  patientId: string;
}

export function PaymentHistorySection({
  patientId,
}: PaymentHistorySectionProps) {
  const { history, summary, loading, error, refetch } =
    usePatientPaymentHistory(patientId);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Historial de pagos
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border bg-muted/30 p-4 flex items-center gap-3 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <Button variant="outline" size="sm" onClick={refetch}>
            Reintentar
          </Button>
        </div>
      ) : history.length === 0 ? (
        <p className="rounded-lg border bg-muted/30 p-4 text-sm text-center text-muted-foreground">
          Sin historial de pagos
        </p>
      ) : (
        <>
          {summary.unpaid_count > 0 && (
            <div className="rounded-xl border bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 p-3 flex items-center justify-between text-sm">
              <span className="text-amber-900 dark:text-amber-200 font-medium">
                {summary.unpaid_count}{' '}
                {summary.unpaid_count === 1 ? 'turno impago' : 'turnos impagos'}
              </span>
              <span className="tabular-nums font-bold text-amber-900 dark:text-amber-200">
                ${(summary.unpaid_total_cents / 100).toFixed(2)}
              </span>
            </div>
          )}

          <div className="space-y-2">
            {history.map((entry) => {
              const cfg =
                paymentConfig[entry.payment_status as PaymentStatus] ??
                paymentConfig.unpaid;
              const date = format(
                parseISO(entry.scheduled_at),
                "d 'de' MMMM yyyy",
                { locale: es }
              );
              const treatmentNames =
                entry.treatments.length > 0
                  ? entry.treatments.map((t) => t.name).join(', ')
                  : null;

              return (
                <div
                  key={entry.appointment_id}
                  className="rounded-lg border bg-muted/30 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium capitalize">{date}</p>
                    <Badge
                      variant="outline"
                      className={cn('shrink-0 text-xs', cfg.className)}
                    >
                      {cfg.label}
                    </Badge>
                  </div>
                  {treatmentNames && (
                    <p className="text-xs text-muted-foreground truncate">
                      {treatmentNames}
                    </p>
                  )}
                  {entry.total_amount_cents !== null && (
                    <p className="text-sm tabular-nums font-medium">
                      ${(entry.total_amount_cents / 100).toFixed(2)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
