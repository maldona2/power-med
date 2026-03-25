import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { PatientPaymentRecord } from '@/types/debtDashboard';

interface Props {
  records: PatientPaymentRecord[];
  loading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

type SortKey = 'patientName' | 'totalDebtCents' | 'paidCents' | 'unpaidCents';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

const statusConfig = {
  paid: { label: 'Pagado', variant: 'secondary' as const },
  unpaid: { label: 'Pendiente', variant: 'destructive' as const },
  partially_paid: { label: 'Parcial', variant: 'default' as const },
};

export function PatientPaymentTable({
  records,
  loading,
  totalCount,
  page,
  pageSize,
  onPageChange,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('patientName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = [...records].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    const cmp =
      typeof aVal === 'string'
        ? aVal.localeCompare(bVal as string)
        : (aVal as number) - (bVal as number);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <TableHead
      className="cursor-pointer select-none"
      onClick={() => handleSort(field)}
    >
      {label} {sortKey === field ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </TableHead>
  );

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <SortHeader label="Paciente" field="patientName" />
            <SortHeader label="Deuda total" field="totalDebtCents" />
            <SortHeader label="Cobrado" field="paidCents" />
            <SortHeader label="Pendiente" field="unpaidCents" />
            <TableHead>Estado</TableHead>
            <TableHead>Último pago</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                No hay registros.
              </TableCell>
            </TableRow>
          )}
          {sorted.map((record) => {
            const status = statusConfig[record.paymentStatus];
            return (
              <TableRow key={record.patientId}>
                <TableCell className="font-medium">
                  {record.patientName}
                </TableCell>
                <TableCell>{formatCurrency(record.totalDebtCents)}</TableCell>
                <TableCell className="text-green-600">
                  {formatCurrency(record.paidCents)}
                </TableCell>
                <TableCell
                  className={record.unpaidCents > 0 ? 'text-destructive' : ''}
                >
                  {formatCurrency(record.unpaidCents)}
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {record.lastPaymentDate
                    ? new Date(record.lastPaymentDate).toLocaleDateString(
                        'es-AR'
                      )
                    : '—'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
