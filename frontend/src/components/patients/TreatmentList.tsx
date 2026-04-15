import { useMemo, useState, memo } from 'react';
import { TreatmentHistoryItem } from '@/types/treatments';
import { TreatmentListItem } from './TreatmentListItem';
import { Button } from '@/components/ui/button';

interface TreatmentListProps {
  treatments: TreatmentHistoryItem[];
  onApplicationClick: (appointmentId: string) => void;
}

// Pagination threshold (Requirement 10.3)
const PAGINATION_THRESHOLD = 50;
const ITEMS_PER_PAGE = 10;

/**
 * TreatmentList Component
 *
 * Displays a list of all treatments applied to the patient.
 *
 * Features:
 * - Sorts treatments by first application date (most recent first)
 * - Renders each treatment as an expandable TreatmentListItem
 * - Responsive layout with vertical stacking on all screen sizes
 * - Implements pagination for large datasets (> 50 applications)
 * - Memoized to prevent unnecessary re-renders
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 9.1, 9.2, 10.2, 10.3
 */
const TreatmentListComponent = ({
  treatments,
  onApplicationClick,
}: TreatmentListProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Sort treatments by first_application_date (most recent first)
  const sortedTreatments = useMemo(() => {
    return [...treatments].sort((a, b) => {
      const dateA = new Date(a.first_application_date).getTime();
      const dateB = new Date(b.first_application_date).getTime();
      return dateB - dateA; // Descending order (most recent first)
    });
  }, [treatments]);

  // Calculate total applications across all treatments
  const totalApplications = useMemo(() => {
    return sortedTreatments.reduce(
      (sum, treatment) => sum + treatment.applications.length,
      0
    );
  }, [sortedTreatments]);

  // Determine if pagination is needed (Requirement 10.3)
  const needsPagination = totalApplications > PAGINATION_THRESHOLD;

  // Paginate treatments if needed
  const displayedTreatments = useMemo(() => {
    if (!needsPagination) {
      return sortedTreatments;
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedTreatments.slice(startIndex, endIndex);
  }, [sortedTreatments, currentPage, needsPagination]);

  const totalPages = Math.ceil(sortedTreatments.length / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="space-y-2">
      {displayedTreatments.map((treatment) => (
        <TreatmentListItem
          key={treatment.treatment_id}
          treatment={treatment}
          onApplicationClick={onApplicationClick}
        />
      ))}

      {/* Pagination controls */}
      {needsPagination && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={!hasPrevPage}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!hasNextPage}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders (Requirement 10.2)
export const TreatmentList = memo(TreatmentListComponent);
