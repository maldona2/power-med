import { useState, memo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown, ChevronUp, Calendar, Activity } from 'lucide-react';
import { TreatmentHistoryItem } from '@/types/treatments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TreatmentListItemProps {
  treatment: TreatmentHistoryItem;
  onApplicationClick: (appointmentId: string) => void;
}

/**
 * TreatmentListItem Component
 *
 * Displays a single treatment with summary information and expandable session details.
 *
 * Features:
 * - Responsive layout with vertical stacking on mobile (< 640px)
 * - Displays treatment name, session count, and date range
 * - Shows status badge (Active/Completed)
 * - Expandable details section with protocol info and individual applications
 * - Maintains readability at all screen sizes
 * - Memoized to prevent unnecessary re-renders
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.4, 9.5, 10.1
 */
const TreatmentListItemComponent = ({
  treatment,
  onApplicationClick,
}: TreatmentListItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format dates in "DD MMM YYYY" format (e.g., "15 Ene 2024")
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd MMM yyyy', { locale: es });
  };

  const firstDate = formatDate(treatment.first_application_date);
  const lastDate = formatDate(treatment.last_application_date);
  const isSingleApplication = treatment.total_sessions === 1;

  // Status badge configuration
  const getStatusBadge = () => {
    if (treatment.status === 'active') {
      return (
        <Badge
          variant="outline"
          className="shrink-0 gap-1.5 border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400" />
          Activo
        </Badge>
      );
    }
    if (treatment.status === 'completed') {
      return (
        <Badge
          variant="outline"
          className="shrink-0 gap-1.5 border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gray-500 dark:bg-gray-400" />
          Completado
        </Badge>
      );
    }
    return null;
  };

  // Protocol information display
  const getProtocolInfo = () => {
    if (!treatment.protocol) return null;

    const parts = [];

    // Session progress
    if (
      treatment.current_session !== null &&
      treatment.protocol.initial_sessions_count
    ) {
      parts.push(
        `Sesión ${treatment.current_session} de ${treatment.protocol.initial_sessions_count}`
      );
    }

    // Initial frequency
    if (treatment.protocol.initial_frequency_weeks) {
      parts.push(`Cada ${treatment.protocol.initial_frequency_weeks} semanas`);
    }

    // Maintenance frequency (if initial phase is complete)
    if (
      treatment.protocol.maintenance_frequency_weeks &&
      treatment.current_session &&
      treatment.protocol.initial_sessions_count &&
      treatment.current_session > treatment.protocol.initial_sessions_count
    ) {
      parts.push(
        `Mantenimiento: cada ${treatment.protocol.maintenance_frequency_weeks} semanas`
      );
    }

    return parts;
  };

  const protocolInfo = getProtocolInfo();

  return (
    <div className="rounded-lg border bg-card">
      {/* Summary Section - Responsive layout */}
      <div className="p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-medium text-foreground">
                {treatment.treatment_name}
              </h4>
              {getStatusBadge()}
            </div>
            <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
              <span>
                {treatment.total_sessions} sesión
                {treatment.total_sessions !== 1 ? 'es' : ''}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {isSingleApplication ? firstDate : `${firstDate} - ${lastDate}`}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 shrink-0 p-0 self-end sm:self-start"
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Details Section - Vertical stacking on all screens */}
      {isExpanded && (
        <div className="border-t bg-muted/30 p-3 space-y-3">
          {/* Protocol Information */}
          {protocolInfo && protocolInfo.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Protocolo
                </span>
              </div>
              <div className="text-sm text-foreground">
                {protocolInfo.join(' • ')}
              </div>
            </div>
          )}

          {/* Protocol Notes */}
          {treatment.protocol?.protocol_notes && (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Notas del protocolo
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {treatment.protocol.protocol_notes}
              </p>
            </div>
          )}

          {/* Individual Applications - Vertical stacking */}
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Aplicaciones
            </p>
            <div className="space-y-1.5">
              {treatment.applications.map((application) => {
                const appDate = parseISO(application.appointment_date);
                const dateStr = format(appDate, 'dd MMM yyyy', { locale: es });
                const timeStr = format(appDate, 'HH:mm');

                return (
                  <button
                    key={application.id}
                    onClick={() =>
                      onApplicationClick(application.appointment_id)
                    }
                    className={cn(
                      'w-full rounded-md border bg-card p-2 text-left transition-colors',
                      'hover:bg-muted/50 hover:border-primary/50'
                    )}
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{dateStr}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{timeStr}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Cantidad: {application.quantity}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders (Requirement 10.1)
export const TreatmentListItem = memo(TreatmentListItemComponent);
