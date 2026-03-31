import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarClock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePatientTreatments } from '@/hooks/useTreatments';

interface NextAppointmentSectionProps {
  patientId: string;
}

export function NextAppointmentSection({
  patientId,
}: NextAppointmentSectionProps) {
  const { patientTreatments, loading, calculateNextAppointment } =
    usePatientTreatments(patientId);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Próxima cita sugerida
          </span>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const recommendations = patientTreatments
    .filter((pt) => pt.is_active)
    .flatMap((pt) => {
      const nextDate = calculateNextAppointment(pt);
      if (!nextDate) return [];
      return [{ treatment: pt.treatment?.name ?? 'Tratamiento', nextDate }];
    });

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Próxima cita sugerida
        </span>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-2">
        {recommendations.map((rec, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-foreground">{rec.treatment}</span>
            <span className="text-muted-foreground capitalize">
              {format(rec.nextDate, "d 'de' MMMM yyyy", { locale: es })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
