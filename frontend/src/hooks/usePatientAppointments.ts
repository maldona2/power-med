import { useState, useEffect } from 'react';
import { fetchPatientAppointments } from '@/lib/debtDashboardApi';
import type { PatientAppointmentDetail } from '@/types/debtDashboard';

export function usePatientAppointments(patientId: string | null) {
  const [data, setData] = useState<PatientAppointmentDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setData([]);
      return;
    }
    setLoading(true);
    setError(null);
    fetchPatientAppointments(patientId)
      .then((result) => setData(result))
      .catch(() => setError('No se pudieron cargar los turnos'))
      .finally(() => setLoading(false));
  }, [patientId]);

  return { data, loading, error };
}
