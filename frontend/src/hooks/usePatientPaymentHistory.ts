import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { PaymentStatus } from '@/types';

export interface PatientPaymentHistoryEntry {
  appointment_id: string;
  scheduled_at: string;
  payment_status: PaymentStatus;
  total_amount_cents: number | null;
  treatments: Array<{
    name: string;
    quantity: number;
    unit_price_cents: number;
  }>;
}

export interface PatientPaymentHistorySummary {
  unpaid_count: number;
  unpaid_total_cents: number;
}

interface PaymentHistoryResponse {
  history: PatientPaymentHistoryEntry[];
  summary: PatientPaymentHistorySummary;
}

export function usePatientPaymentHistory(patientId: string | undefined) {
  const [history, setHistory] = useState<PatientPaymentHistoryEntry[]>([]);
  const [summary, setSummary] = useState<PatientPaymentHistorySummary>({
    unpaid_count: 0,
    unpaid_total_cents: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(() => {
    if (!patientId) {
      setHistory([]);
      setSummary({ unpaid_count: 0, unpaid_total_cents: 0 });
      return;
    }
    setLoading(true);
    setError(null);
    api
      .get<PaymentHistoryResponse>(`/patients/${patientId}/payment-history`)
      .then(({ data }) => {
        setHistory(data.history);
        setSummary(data.summary);
      })
      .catch(() => {
        setError('No se pudo cargar el historial de pagos');
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, summary, loading, error, refetch: fetchHistory };
}
