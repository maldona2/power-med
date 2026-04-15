import { useMemo, useState, useCallback, memo } from 'react';
import { TreatmentHistoryItem, TreatmentApplication } from '@/types/treatments';
import { useNavigate } from 'react-router-dom';

interface TreatmentTimelineProps {
  treatments: TreatmentHistoryItem[];
}

interface TimelineMarkerProps {
  application: TreatmentApplication;
  treatmentName: string;
  color: string;
  position: number;
  onHover: (applicationId: string | null) => void;
  onClick: (appointmentId: string) => void;
  isHovered: boolean;
}

interface TimelineAxisLabel {
  label: string;
  position: number;
  isYear?: boolean;
}

// Predefined color palette for treatments
const TREATMENT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#a855f7', // purple
];

/**
 * Assigns a consistent color to a treatment based on its ID
 */
function getTreatmentColor(
  treatmentId: string,
  existingColors: Map<string, string>
): string {
  if (existingColors.has(treatmentId)) {
    return existingColors.get(treatmentId)!;
  }
  const colorIndex = existingColors.size % TREATMENT_COLORS.length;
  return TREATMENT_COLORS[colorIndex];
}

/**
 * TimelineMarker Component
 *
 * Renders a visual marker for a single treatment application on the timeline.
 *
 * Features:
 * - Displays a colored circular marker at the calculated position
 * - Shows tooltip on hover with treatment details
 * - Handles click events to navigate to appointment
 * - Applies treatment-specific color
 * - Memoized to prevent unnecessary re-renders
 * - Auto-adjusts tooltip position to prevent cutoff at edges
 *
 * Requirements: 6.3, 6.4, 6.5, 10.1
 */
const TimelineMarkerComponent = ({
  application,
  treatmentName,
  color,
  position,
  onHover,
  onClick,
  isHovered,
}: TimelineMarkerProps) => {
  const date = new Date(application.appointment_date);
  const formattedDate = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Determine tooltip alignment based on position
  // If marker is on the right side (> 75%), align tooltip to the right
  // If marker is on the left side (< 25%), align tooltip to the left
  // Otherwise, center the tooltip
  const getTooltipClasses = () => {
    if (position > 75) {
      return 'absolute top-6 right-0 z-10 whitespace-nowrap rounded-md bg-popover px-3 py-2 text-sm shadow-md border';
    } else if (position < 25) {
      return 'absolute top-6 left-0 z-10 whitespace-nowrap rounded-md bg-popover px-3 py-2 text-sm shadow-md border';
    } else {
      return 'absolute top-6 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-md bg-popover px-3 py-2 text-sm shadow-md border';
    }
  };

  return (
    <div
      className="absolute top-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      style={{ left: `${position}%` }}
      onMouseEnter={() => onHover(application.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(application.appointment_id)}
    >
      {/* Marker circle */}
      <div
        className="h-4 w-4 rounded-full border-2 border-background shadow-sm transition-transform hover:scale-125"
        style={{ backgroundColor: color }}
      />

      {/* Tooltip with dynamic positioning */}
      {isHovered && (
        <div className={getTooltipClasses()}>
          <div className="font-medium">{treatmentName}</div>
          <div className="text-muted-foreground">{formattedDate}</div>
          <div className="text-muted-foreground">
            Cantidad: {application.quantity}
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize TimelineMarker to prevent unnecessary re-renders (Requirement 10.1)
const TimelineMarker = memo(TimelineMarkerComponent);

/**
 * Calculates the position (0-100%) of a date within a date range
 */
function calculatePosition(date: Date, minDate: Date, maxDate: Date): number {
  const totalRange = maxDate.getTime() - minDate.getTime();
  if (totalRange === 0) return 50; // Center if only one date
  const dateOffset = date.getTime() - minDate.getTime();
  return (dateOffset / totalRange) * 100;
}

/**
 * Generates month and year labels for the timeline axis
 */
function generateAxisLabels(minDate: Date, maxDate: Date): TimelineAxisLabel[] {
  const labels: TimelineAxisLabel[] = [];
  const spanMonths = Math.ceil(
    (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  const showYears = spanMonths > 12;

  const current = new Date(minDate);
  current.setDate(1); // Start at beginning of month

  while (current <= maxDate) {
    const position = calculatePosition(current, minDate, maxDate);
    const monthLabel = current.toLocaleDateString('es-ES', { month: 'short' });

    labels.push({
      label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      position,
      isYear: false,
    });

    // Add year label if needed (at January or first month)
    if (showYears && (current.getMonth() === 0 || current <= minDate)) {
      labels.push({
        label: current.getFullYear().toString(),
        position,
        isYear: true,
      });
    }

    // Move to next month
    current.setMonth(current.getMonth() + 1);
  }

  return labels;
}

/**
 * TreatmentTimeline Component
 *
 * Displays a horizontal timeline visualization of treatment applications.
 *
 * Features:
 * - Calculates date range from all applications across treatments
 * - Displays month labels (and year labels if span > 12 months)
 * - Assigns distinct colors to different treatments
 * - Renders TimelineMarker components for each application
 * - Implements horizontal scrolling for mobile screens (< 640px)
 * - Handles hover and click interactions on markers
 * - Maintains readability at all supported screen sizes
 * - Memoized to prevent unnecessary re-renders
 * - Debounced hover interactions for smooth performance
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.6, 6.7, 9.1, 9.3, 9.4, 10.2, 10.5
 */
const TreatmentTimelineComponent = ({ treatments }: TreatmentTimelineProps) => {
  const navigate = useNavigate();
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);

  // Debounced hover handler to improve performance (Requirement 10.5)
  const handleMarkerHover = useCallback((markerId: string | null) => {
    // Use requestAnimationFrame for smooth hover interactions
    requestAnimationFrame(() => {
      setHoveredMarkerId(markerId);
    });
  }, []);

  // Assign colors to treatments
  const treatmentColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    treatments.forEach((treatment) => {
      colorMap.set(
        treatment.treatment_id,
        getTreatmentColor(treatment.treatment_id, colorMap)
      );
    });
    return colorMap;
  }, [treatments]);

  // Flatten all applications from all treatments
  const allApplications = useMemo(() => {
    const apps: Array<{
      id: string;
      appointmentId: string;
      treatmentId: string;
      treatmentName: string;
      date: Date;
      quantity: number;
      color: string;
    }> = [];

    treatments.forEach((treatment) => {
      const color = treatmentColors.get(treatment.treatment_id) || '#6b7280';
      treatment.applications.forEach((app) => {
        apps.push({
          id: app.id,
          appointmentId: app.appointment_id,
          treatmentId: treatment.treatment_id,
          treatmentName: treatment.treatment_name,
          date: new Date(app.appointment_date),
          quantity: app.quantity,
          color,
        });
      });
    });

    return apps;
  }, [treatments, treatmentColors]);

  // Calculate date range and axis labels
  const { minDate, maxDate, axisLabels } = useMemo(() => {
    if (allApplications.length === 0) {
      const now = new Date();
      return {
        minDate: now,
        maxDate: now,
        axisLabels: [],
      };
    }

    const dates = allApplications.map((app) => app.date);
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));

    return {
      minDate: min,
      maxDate: max,
      axisLabels: generateAxisLabels(min, max),
    };
  }, [allApplications]);

  // Prepare marker data with positions
  const markers = useMemo(() => {
    return allApplications.map((app) => {
      const position = calculatePosition(app.date, minDate, maxDate);

      return {
        application: {
          id: app.id,
          appointment_id: app.appointmentId,
          appointment_date: app.date.toISOString(),
          quantity: app.quantity,
        },
        treatmentName: app.treatmentName,
        position,
        color: app.color,
      };
    });
  }, [allApplications, minDate, maxDate]);

  const handleMarkerClick = (appointmentId: string) => {
    navigate(`/appointments/${appointmentId}`);
  };

  if (allApplications.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No hay aplicaciones para mostrar
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 overflow-hidden">
      {/* Horizontal scrolling container for mobile */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px] px-4 py-6 pb-10">
          {/* Timeline axis - increased height to accommodate tooltips */}
          <div className="relative h-32 w-full">
            {/* Horizontal line */}
            <div className="absolute top-12 left-0 right-0 h-0.5 bg-border" />

            {/* Axis labels */}
            {axisLabels.map((label, index) => (
              <div
                key={`${label.label}-${index}`}
                className="absolute"
                style={{ left: `${label.position}%` }}
              >
                {/* Tick mark */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 w-0.5 bg-border ${
                    label.isYear ? 'h-4 top-10' : 'h-2 top-11'
                  }`}
                />
                {/* Label text */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-xs ${
                    label.isYear
                      ? 'top-16 font-semibold text-foreground'
                      : 'top-14 text-muted-foreground'
                  }`}
                >
                  {label.label}
                </div>
              </div>
            ))}

            {/* Timeline markers */}
            {markers.map((marker) => (
              <TimelineMarker
                key={marker.application.id}
                application={marker.application}
                treatmentName={marker.treatmentName}
                color={marker.color}
                position={marker.position}
                onHover={handleMarkerHover}
                onClick={handleMarkerClick}
                isHovered={hoveredMarkerId === marker.application.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders (Requirement 10.2)
export const TreatmentTimeline = memo(TreatmentTimelineComponent);
