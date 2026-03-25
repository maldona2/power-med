import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchStatistics } from '@/lib/debtDashboardApi';
import type { PaymentStatistics } from '@/types/debtDashboard';

export function useDebtStatistics(startDate?: string, endDate?: string) {
  const [data, setData] = useState<PaymentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    try {
      const result = await fetchStatistics(startDate, endDate);
      setData(result);
      setError(null);
    } catch {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    setLoading(true);
    fetch();
    intervalRef.current = setInterval(fetch, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
