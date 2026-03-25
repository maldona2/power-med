import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AgingReportPatientList } from './AgingReportPatientList';
import type { AgingBucket, AgingReport } from '@/types/debtDashboard';

interface Props {
  data: AgingReport | null;
  loading: boolean;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function AgingReportTable({ data, loading }: Props) {
  const [selectedBucket, setSelectedBucket] = useState<AgingBucket | null>(
    null
  );

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rango</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="text-right">Pacientes</TableHead>
            <TableHead className="text-right">Porcentaje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.buckets.map((bucket) => (
            <TableRow
              key={bucket.range}
              className={`cursor-pointer hover:bg-muted/50 ${
                bucket.maxDays === null ? 'text-destructive font-medium' : ''
              }`}
              onClick={() => setSelectedBucket(bucket)}
            >
              <TableCell>{bucket.range}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(bucket.totalAmountCents)}
              </TableCell>
              <TableCell className="text-right">
                {bucket.patientCount}
              </TableCell>
              <TableCell className="text-right">
                {bucket.percentage.toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedBucket && (
        <AgingReportPatientList
          bucket={selectedBucket}
          onClose={() => setSelectedBucket(null)}
        />
      )}
    </>
  );
}
