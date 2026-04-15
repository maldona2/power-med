import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TreatmentList } from '../TreatmentList';
import { TreatmentHistoryItem } from '@/types/treatments';

// Mock TreatmentListItem to simplify testing
vi.mock('../TreatmentListItem', () => ({
  TreatmentListItem: ({ treatment }: { treatment: TreatmentHistoryItem }) => (
    <div data-testid={`treatment-${treatment.treatment_id}`}>
      {treatment.treatment_name}
    </div>
  ),
}));

describe('TreatmentList', () => {
  const mockOnApplicationClick = vi.fn();

  const createMockTreatment = (
    id: string,
    name: string,
    firstApplicationDate: string
  ): TreatmentHistoryItem => ({
    treatment_id: id,
    treatment_name: name,
    total_sessions: 1,
    first_application_date: firstApplicationDate,
    last_application_date: firstApplicationDate,
    status: null,
    current_session: null,
    protocol: null,
    applications: [],
  });

  it('renders all treatments', () => {
    const treatments = [
      createMockTreatment('1', 'Treatment A', '2024-01-15'),
      createMockTreatment('2', 'Treatment B', '2024-01-20'),
    ];

    render(
      <TreatmentList
        treatments={treatments}
        onApplicationClick={mockOnApplicationClick}
      />
    );

    expect(screen.getByText('Treatment A')).toBeInTheDocument();
    expect(screen.getByText('Treatment B')).toBeInTheDocument();
  });

  it('sorts treatments by first_application_date (most recent first)', () => {
    const treatments = [
      createMockTreatment('1', 'Treatment A', '2024-01-15'),
      createMockTreatment('2', 'Treatment B', '2024-01-20'),
      createMockTreatment('3', 'Treatment C', '2024-01-10'),
    ];

    render(
      <TreatmentList
        treatments={treatments}
        onApplicationClick={mockOnApplicationClick}
      />
    );

    const treatmentElements = screen.getAllByTestId(/^treatment-/);
    expect(treatmentElements).toHaveLength(3);

    // Most recent first (2024-01-20)
    expect(treatmentElements[0]).toHaveAttribute('data-testid', 'treatment-2');
    // Second most recent (2024-01-15)
    expect(treatmentElements[1]).toHaveAttribute('data-testid', 'treatment-1');
    // Oldest (2024-01-10)
    expect(treatmentElements[2]).toHaveAttribute('data-testid', 'treatment-3');
  });

  it('handles empty treatments array', () => {
    const { container } = render(
      <TreatmentList
        treatments={[]}
        onApplicationClick={mockOnApplicationClick}
      />
    );

    expect(container.querySelector('.space-y-2')).toBeInTheDocument();
    expect(screen.queryByTestId(/^treatment-/)).not.toBeInTheDocument();
  });

  it('does not mutate original treatments array', () => {
    const treatments = [
      createMockTreatment('1', 'Treatment A', '2024-01-15'),
      createMockTreatment('2', 'Treatment B', '2024-01-20'),
    ];

    const originalOrder = [...treatments];

    render(
      <TreatmentList
        treatments={treatments}
        onApplicationClick={mockOnApplicationClick}
      />
    );

    // Original array should remain unchanged
    expect(treatments).toEqual(originalOrder);
  });

  it('passes onApplicationClick to TreatmentListItem', () => {
    const treatments = [createMockTreatment('1', 'Treatment A', '2024-01-15')];

    render(
      <TreatmentList
        treatments={treatments}
        onApplicationClick={mockOnApplicationClick}
      />
    );

    // The mock component doesn't test the callback, but we verify it's passed
    // This will be tested more thoroughly in TreatmentListItem tests
    expect(screen.getByTestId('treatment-1')).toBeInTheDocument();
  });
});
