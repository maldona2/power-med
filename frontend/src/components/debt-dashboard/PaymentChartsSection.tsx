import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type {
  PaymentStatistics,
  PaymentMethodAnalytics,
} from '@/types/debtDashboard';

interface Props {
  statistics: PaymentStatistics | null;
  paymentMethods: PaymentMethodAnalytics[];
}

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
}

type ChartType = 'pie' | 'bar';

export function PaymentChartsSection({ statistics, paymentMethods }: Props) {
  const [chartType, setChartType] = useState<ChartType>('pie');

  const paidVsUnpaidData = statistics
    ? [
        { name: 'Cobrado', value: statistics.totalPaidCents },
        { name: 'Pendiente', value: statistics.totalUnpaidCents },
      ]
    : [];

  const methodsData = paymentMethods.map((m) => ({
    name: m.paymentMethod,
    value: m.totalAmountCents,
    count: m.transactionCount,
  }));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={chartType === 'pie' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('pie')}
        >
          Torta
        </Button>
        <Button
          variant={chartType === 'bar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChartType('bar')}
        >
          Barras
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cobrado vs Pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={paidVsUnpaidData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {paidVsUnpaidData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              ) : (
                <BarChart data={paidVsUnpaidData}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `$${(v / 100).toFixed(0)}`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="value" fill={COLORS[0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Métodos de pago</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={methodsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {methodsData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              ) : (
                <BarChart data={methodsData}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `$${(v / 100).toFixed(0)}`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="value" fill={COLORS[2]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
