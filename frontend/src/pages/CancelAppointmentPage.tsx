import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/lib/api';

type State = 'loading' | 'success' | 'error';

export function CancelAppointmentPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<State>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setErrorMsg('Link inválido.');
      return;
    }

    api
      .post('/appointments/cancel-by-token', { token })
      .then(() => setState('success'))
      .catch((err) => {
        const msg =
          err?.response?.data?.error ??
          'El link de cancelación no es válido o ya fue utilizado.';
        setErrorMsg(msg);
        setState('error');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm text-center space-y-4">
        {state === 'loading' && (
          <>
            <div className="text-4xl">⏳</div>
            <h1 className="text-xl font-semibold">Cancelando turno...</h1>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="text-4xl">✅</div>
            <h1 className="text-xl font-semibold">Turno cancelado</h1>
            <p className="text-muted-foreground text-sm">
              Tu turno fue cancelado exitosamente. El consultorio fue notificado.
            </p>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="text-4xl">❌</div>
            <h1 className="text-xl font-semibold">No se pudo cancelar</h1>
            <p className="text-muted-foreground text-sm">{errorMsg}</p>
          </>
        )}

        <p className="text-xs text-muted-foreground pt-2">
          Atriax — Sistema de gestión de turnos
        </p>
      </div>
    </div>
  );
}
