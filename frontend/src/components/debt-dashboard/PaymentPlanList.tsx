import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { PaymentPlan } from '@/types/debtDashboard';

interface Props {
  plans: PaymentPlan[];
  loading: boolean;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

const statusLabels: Record<string, string> = {
  active: 'Activo',
  completed: 'Completado',
  delinquent: 'Moroso',
  cancelled: 'Cancelado',
};

const statusVariants: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  active: 'default',
  completed: 'secondary',
  delinquent: 'destructive',
  cancelled: 'outline',
};

const frequencyLabels: Record<string, string> = {
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
};

export function PaymentPlanList({ plans, loading }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered =
    statusFilter === 'all'
      ? plans
      : plans.filter((p) => p.status === statusFilter);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="completed">Completados</SelectItem>
            <SelectItem value="delinquent">Morosos</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filtered.length} planes
        </span>
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No hay planes de pago.
        </p>
      )}

      <div className="grid gap-3">
        {filtered.map((plan) => (
          <Card
            key={plan.id}
            className={plan.status === 'delinquent' ? 'border-destructive' : ''}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{plan.patientName}</CardTitle>
                <Badge variant={statusVariants[plan.status]}>
                  {statusLabels[plan.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span>{formatCurrency(plan.totalAmountCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cuota:</span>
                <span>
                  {formatCurrency(plan.installmentAmountCents)} —{' '}
                  {frequencyLabels[plan.frequency]}
                </span>
              </div>
              {plan.nextPaymentDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Próximo pago:</span>
                  <span>
                    {new Date(plan.nextPaymentDate).toLocaleDateString('es-AR')}
                  </span>
                </div>
              )}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progreso</span>
                  <span>{plan.completionPercentage}%</span>
                </div>
                <Progress value={plan.completionPercentage} className="h-2" />
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>✓ {plan.onTimePayments} a tiempo</span>
                <span
                  className={plan.latePayments > 0 ? 'text-destructive' : ''}
                >
                  ⚠ {plan.latePayments} tardíos
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
