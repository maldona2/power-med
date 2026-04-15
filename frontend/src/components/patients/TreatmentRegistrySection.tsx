import { useTreatmentHistory } from '@/hooks/useTreatmentHistory';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, AlertCircle } from 'lucide-react';
import { TreatmentList } from './TreatmentList';
import { TreatmentTimeline } from './TreatmentTimeline';

interface TreatmentRegistrySectionProps {
  patientId: string;
}

export function TreatmentRegistrySection({
  patientId,
}: TreatmentRegistrySectionProps) {
  const { treatmentHistory, loading, error, refetch } =
    useTreatmentHistory(patientId);

  // Loading state
  if (loading) {
    return (
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-8 rounded-full" />
        </div>
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="px-4 py-4 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" />
          Registro de Tratamientos
        </p>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
          <AlertCircle className="mb-2 h-7 w-7 text-destructive opacity-40" />
          <p className="text-sm text-muted-foreground">
            Error al cargar el registro de tratamientos
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-xs"
            onClick={() => refetch()}
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const treatments = treatmentHistory?.treatments ?? [];
  const treatmentCount = treatments.length;

  // Empty state
  if (treatmentCount === 0) {
    return (
      <div className="px-4 py-4 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" />
          Registro de Tratamientos
        </p>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
          <Activity className="mb-2 h-7 w-7 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">
            Sin tratamientos aplicados
          </p>
        </div>
      </div>
    );
  }

  // Render treatment list
  return (
    <div className="px-4 py-4 space-y-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" />
          Registro de Tratamientos
          <Badge
            variant="secondary"
            className="ml-1 h-4 min-w-4 rounded-full px-1 text-[10px]"
          >
            {treatmentCount}
          </Badge>
        </p>
      </div>
      <TreatmentList
        treatments={treatments}
        onApplicationClick={(appointmentId) => {
          // Navigation is handled within TreatmentListItem
        }}
      />
      <div className="w-full overflow-hidden">
        <TreatmentTimeline treatments={treatments} />
      </div>
    </div>
  );
}
