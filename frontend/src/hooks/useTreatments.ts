import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { Treatment } from '@/types';

export function useTreatments() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTreatments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Treatment[]>('/treatments');
      setTreatments(data);
    } catch {
      setTreatments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTreatments();
  }, [fetchTreatments]);

  const create = useCallback(
    async (input: { name: string; price_cents: number }) => {
      try {
        const { data } = await api.post<Treatment>('/treatments', input);
        setTreatments((prev) => [...prev, data]);
        toast.success('Tratamiento creado');
        return data;
      } catch (err: unknown) {
        const res =
          err &&
          typeof err === 'object' &&
          'response' in err &&
          (err as { response?: { data?: unknown } }).response?.data;
        const msg =
          res && typeof res === 'object' && res !== null && 'error' in res
            ? (res as { error?: { message?: string } }).error?.message
            : 'Error al crear tratamiento';
        toast.error(msg);
        throw err;
      }
    },
    []
  );

  const update = useCallback(
    async (
      id: string,
      input: Partial<{ name: string; price_cents: number }>
    ) => {
      try {
        const { data } = await api.put<Treatment>(`/treatments/${id}`, input);
        setTreatments((prev) => prev.map((t) => (t.id === id ? data : t)));
        toast.success('Tratamiento actualizado');
        return data;
      } catch (err: unknown) {
        const res =
          err &&
          typeof err === 'object' &&
          'response' in err &&
          (err as { response?: { data?: unknown } }).response?.data;
        const msg =
          res && typeof res === 'object' && res !== null && 'error' in res
            ? (res as { error?: { message?: string } }).error?.message
            : 'Error al actualizar tratamiento';
        toast.error(msg);
        throw err;
      }
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    try {
      await api.delete(`/treatments/${id}`);
      setTreatments((prev) => prev.filter((t) => t.id !== id));
      toast.success('Tratamiento eliminado');
    } catch (err: unknown) {
      const res =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: unknown } }).response?.data;
      const msg =
        res && typeof res === 'object' && res !== null && 'error' in res
          ? (res as { error?: { message?: string } }).error?.message
          : 'Error al eliminar tratamiento';
      toast.error(msg);
      throw err;
    }
  }, []);

  return {
    treatments,
    loading,
    refetch: fetchTreatments,
    create,
    update,
    remove,
  };
}
