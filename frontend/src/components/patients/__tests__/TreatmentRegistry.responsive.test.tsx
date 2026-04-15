/**
 * Responsive Design Tests for Treatment Registry Components
 * Feature: treatment-registry-component, Task 9.1
 *
 * Tests verify that responsive styles are properly applied to all treatment
 * registry components for mobile and desktop screens.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TreatmentListItem } from '../TreatmentListItem';
import { TreatmentTimeline } from '../TreatmentTimeline';
import { TreatmentList } from '../TreatmentList';
import type { TreatmentHistoryItem } from '@/types/treatments';

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('Treatment Registry Components - Responsive Design', () => {
  const mockTreatment: TreatmentHistoryItem = {
    treatment_id: 't1',
    treatment_name: 'Botox Facial',
    total_sessions: 3,
    first_application_date: '2024-01-01T10:00:00Z',
    last_application_date: '2024-03-01T10:00:00Z',
    status: 'active',
    current_session: 3,
    protocol: {
      initial_sessions_count: 5,
      initial_frequency_weeks: 4,
      maintenance_frequency_weeks: 12,
      protocol_notes: 'Aplicar en zona frontal',
    },
    applications: [
      {
        id: 'app1',
        appointment_id: 'apt1',
        appointment_date: '2024-01-01T10:00:00Z',
        quantity: 50,
      },
      {
        id: 'app2',
        appointment_id: 'apt2',
        appointment_date: '2024-02-01T10:00:00Z',
        quantity: 50,
      },
      {
        id: 'app3',
        appointment_id: 'apt3',
        appointment_date: '2024-03-01T10:00:00Z',
        quantity: 50,
      },
    ],
  };

  const mockOnApplicationClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TreatmentListItem - Responsive Layout', () => {
    it('should render with responsive flex classes for vertical stacking on mobile', () => {
      const { container } = render(
        <TreatmentListItem
          treatment={mockTreatment}
          onApplicationClick={mockOnApplicationClick}
        />
      );

      // Check for responsive flex classes in summary section
      const summarySection = container.querySelector('.flex.flex-col');
      expect(summarySection).toBeInTheDocument();

      // Verify sm: breakpoint classes exist for horizontal layout on larger screens
      const responsiveContainer = container.querySelector(
        '.sm\\:flex-row, [class*="sm:flex-row"]'
      );
      expect(responsiveContainer).toBeInTheDocument();
    });

    it('should display treatment information with proper spacing', () => {
      render(
        <TreatmentListItem
          treatment={mockTreatment}
          onApplicationClick={mockOnApplicationClick}
        />
      );

      expect(screen.getByText('Botox Facial')).toBeInTheDocument();
      // Text is split across elements, so check for parts
      expect(screen.getByText(/3/)).toBeInTheDocument();
      expect(screen.getByText(/sesión/)).toBeInTheDocument();
    });

    it('should render expand button with proper positioning', () => {
      const { container } = render(
        <TreatmentListItem
          treatment={mockTreatment}
          onApplicationClick={mockOnApplicationClick}
        />
      );

      // Button should have self-end on mobile, self-start on desktop
      const expandButton = container.querySelector('button');
      expect(expandButton).toHaveClass('self-end');
      expect(expandButton?.className).toMatch(/sm:self-start/);
    });
  });

  describe('TreatmentList - Vertical Stacking', () => {
    it('should render treatments in vertical stack with proper spacing', () => {
      const treatments = [mockTreatment];
      const { container } = render(
        <TreatmentList
          treatments={treatments}
          onApplicationClick={mockOnApplicationClick}
        />
      );

      // Check for space-y-2 class for vertical spacing
      const listContainer = container.querySelector('.space-y-2');
      expect(listContainer).toBeInTheDocument();
    });

    it('should sort treatments by most recent first', () => {
      const treatments: TreatmentHistoryItem[] = [
        {
          ...mockTreatment,
          treatment_id: 't1',
          treatment_name: 'Older Treatment',
          first_application_date: '2023-01-01T10:00:00Z',
        },
        {
          ...mockTreatment,
          treatment_id: 't2',
          treatment_name: 'Newer Treatment',
          first_application_date: '2024-01-01T10:00:00Z',
        },
      ];

      render(
        <TreatmentList
          treatments={treatments}
          onApplicationClick={mockOnApplicationClick}
        />
      );

      const treatmentNames = screen.getAllByRole('heading', { level: 4 });
      expect(treatmentNames[0]).toHaveTextContent('Newer Treatment');
      expect(treatmentNames[1]).toHaveTextContent('Older Treatment');
    });
  });

  describe('TreatmentTimeline - Horizontal Scrolling', () => {
    it('should render timeline with horizontal scroll container', () => {
      const { container } = render(
        <BrowserRouter>
          <TreatmentTimeline treatments={[mockTreatment]} />
        </BrowserRouter>
      );

      // Check for overflow-x-auto container for horizontal scrolling
      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('should have minimum width for timeline content to enable scrolling', () => {
      const { container } = render(
        <BrowserRouter>
          <TreatmentTimeline treatments={[mockTreatment]} />
        </BrowserRouter>
      );

      // Timeline content should have min-w-[600px] for horizontal scrolling
      const timelineContent = container.querySelector('.min-w-\\[600px\\]');
      expect(timelineContent).toBeInTheDocument();
    });

    it('should render timeline markers for all applications', () => {
      const { container } = render(
        <BrowserRouter>
          <TreatmentTimeline treatments={[mockTreatment]} />
        </BrowserRouter>
      );

      // Should have 3 markers (one for each application)
      const markers = container.querySelectorAll('.h-4.w-4.rounded-full');
      expect(markers.length).toBe(3);
    });

    it('should display empty state when no applications exist', () => {
      const emptyTreatment: TreatmentHistoryItem = {
        ...mockTreatment,
        applications: [],
      };

      render(
        <BrowserRouter>
          <TreatmentTimeline treatments={[emptyTreatment]} />
        </BrowserRouter>
      );

      expect(
        screen.getByText('No hay aplicaciones para mostrar')
      ).toBeInTheDocument();
    });
  });

  describe('Readability at All Screen Sizes', () => {
    it('should use appropriate text sizes for mobile readability', () => {
      const { container } = render(
        <TreatmentListItem
          treatment={mockTreatment}
          onApplicationClick={mockOnApplicationClick}
        />
      );

      // Treatment name should be text-sm
      const treatmentName = screen.getByText('Botox Facial');
      expect(treatmentName).toHaveClass('text-sm');

      // Session count should be text-xs
      const sessionInfo = container.querySelector('.text-xs');
      expect(sessionInfo).toBeInTheDocument();
    });

    it('should maintain proper spacing and padding on all components', () => {
      const { container } = render(
        <TreatmentListItem
          treatment={mockTreatment}
          onApplicationClick={mockOnApplicationClick}
        />
      );

      // Card should have p-3 padding
      const card = container.querySelector('.p-3');
      expect(card).toBeInTheDocument();

      // Should have gap spacing for flex items
      const flexContainer = container.querySelector('.gap-2');
      expect(flexContainer).toBeInTheDocument();
    });
  });

  describe('Styling Consistency with PatientDetailPanel', () => {
    it('should use consistent border and background styles', () => {
      const { container } = render(
        <TreatmentListItem
          treatment={mockTreatment}
          onApplicationClick={mockOnApplicationClick}
        />
      );

      // Should use rounded-lg border bg-card pattern
      const card = container.querySelector('.rounded-lg.border.bg-card');
      expect(card).toBeInTheDocument();
    });

    it('should use consistent text color classes', () => {
      render(
        <TreatmentListItem
          treatment={mockTreatment}
          onApplicationClick={mockOnApplicationClick}
        />
      );

      // Treatment name should use text-foreground
      const treatmentName = screen.getByText('Botox Facial');
      expect(treatmentName).toHaveClass('text-foreground');
    });

    it('should use consistent spacing scale (space-y pattern)', () => {
      const { container } = render(
        <TreatmentList
          treatments={[mockTreatment]}
          onApplicationClick={mockOnApplicationClick}
        />
      );

      // Should use space-y-2 for consistent vertical spacing
      const listContainer = container.querySelector('.space-y-2');
      expect(listContainer).toBeInTheDocument();
    });
  });
});
