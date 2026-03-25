import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { PaymentStatistics } from '@/types/debtDashboard';

interface Props {
  data: PaymentStatistics | null;
  loading: boolean;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function PaymentStatisticsCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: 'Total cobrado', value: formatCurrency(data.totalPaidCents) },
    { label: 'Total pendiente', value: formatCurrency(data.totalUnpaidCents) },
    {
      label: 'Tasa de cobro',
      value: `${data.collectionRate.toFixed(1)}%`,
    },
    {
      label: 'Pacientes con deuda',
      value: data.patientsWithBalance.toString(),
    },
    {
      label: 'Deuda promedio',
      value: formatCurrency(data.averageDebtCents),
    },
  ];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-right">
        Actualizado: {new Date(data.lastUpdated).toLocaleTimeString()}
      </p>
    </div>
  );
}
