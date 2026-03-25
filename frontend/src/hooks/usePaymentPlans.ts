import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchPaymentPlans } from '@/lib/debtDashboardApi';
import type { PaymentPlan } from '@/types/debtDashboard';

export function usePaymentPlans(status?: string) {
  const [data, setData] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    try {
      const result = await fetchPaymentPlans(status);
      setData(result);
      setError(null);
    } catch {
      setError('Failed to load payment plans');
    } finally {
      setLoading(false);
    }
  }, [status]);

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
