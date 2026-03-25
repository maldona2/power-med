import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchPaymentHistory } from '@/lib/debtDashboardApi';
import type {
  PatientPaymentRecord,
  PaymentHistoryFilters,
} from '@/types/debtDashboard';

export function usePaymentHistory(filters: PaymentHistoryFilters = {}) {
  const [records, setRecords] = useState<PatientPaymentRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const doFetch = useCallback(async (f: PaymentHistoryFilters) => {
    try {
      const result = await fetchPaymentHistory(f);
      setRecords(result.records);
      setTotalCount(result.totalCount);
      setError(null);
    } catch {
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Debounce search changes
    debounceRef.current = setTimeout(() => {
      doFetch(filtersRef.current);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search,
    filters.patientId,
    filters.paymentStatus,
    filters.startDate,
    filters.endDate,
    filters.minAmount,
    filters.maxAmount,
    filters.page,
    filters.pageSize,
    doFetch,
  ]);

  const refetch = useCallback(() => doFetch(filtersRef.current), [doFetch]);

  return { records, totalCount, loading, error, refetch };
}
