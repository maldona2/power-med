import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAgingReport } from '@/lib/debtDashboardApi';
import type { AgingReport } from '@/types/debtDashboard';

export function useAgingReport() {
  const [data, setData] = useState<AgingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    try {
      const result = await fetchAgingReport();
      setData(result);
      setError(null);
    } catch {
      setError('Failed to load aging report');
    } finally {
      setLoading(false);
    }
  }, []);

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
