import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PaymentHistoryFilters } from '@/types/debtDashboard';

interface Props {
  filters: PaymentHistoryFilters;
  totalCount: number;
  onChange: (filters: PaymentHistoryFilters) => void;
}

export function PaymentFilters({ filters, totalCount, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar paciente..."
          value={filters.search ?? ''}
          onChange={(e) =>
            onChange({ ...filters, search: e.target.value, page: 1 })
          }
          className="max-w-xs"
        />
        <Select
          value={filters.paymentStatus ?? 'all'}
          onValueChange={(v) =>
            onChange({
              ...filters,
              paymentStatus:
                v === 'all'
                  ? undefined
                  : (v as PaymentHistoryFilters['paymentStatus']),
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado de pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
            <SelectItem value="unpaid">Pendiente</SelectItem>
            <SelectItem value="partially_paid">Parcialmente pagado</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Monto mín."
          value={filters.minAmount ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              minAmount: e.target.value
                ? Number(e.target.value) * 100
                : undefined,
              page: 1,
            })
          }
          className="w-32"
        />
        <Input
          type="number"
          placeholder="Monto máx."
          value={filters.maxAmount !== undefined ? filters.maxAmount / 100 : ''}
          onChange={(e) =>
            onChange({
              ...filters,
              maxAmount: e.target.value
                ? Number(e.target.value) * 100
                : undefined,
              page: 1,
            })
          }
          className="w-32"
        />
      </div>
      <p className="text-sm text-muted-foreground">{totalCount} registros</p>
    </div>
  );
}
