import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TreatmentTimeline } from './TreatmentTimeline';
import { TreatmentHistoryItem } from '@/types/treatments';

describe('TreatmentTimeline', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };
  const mockTreatments: TreatmentHistoryItem[] = [
    {
      treatment_id: 'treatment-1',
      treatment_name: 'Botox',
      total_sessions: 2,
      first_application_date: '2024-01-15T10:00:00Z',
      last_application_date: '2024-03-15T10:00:00Z',
      status: 'active',
      current_session: 2,
      protocol: null,
      applications: [
        {
          id: 'app-1',
          appointment_id: 'appt-1',
          appointment_date: '2024-01-15T10:00:00Z',
          quantity: 1,
        },
        {
          id: 'app-2',
          appointment_id: 'appt-2',
          appointment_date: '2024-03-15T10:00:00Z',
          quantity: 1,
        },
      ],
    },
    {
      treatment_id: 'treatment-2',
      treatment_name: 'Filler',
      total_sessions: 1,
      first_application_date: '2024-02-10T14:00:00Z',
      last_application_date: '2024-02-10T14:00:00Z',
      status: null,
      current_session: null,
      protocol: null,
      applications: [
        {
          id: 'app-3',
          appointment_id: 'appt-3',
          appointment_date: '2024-02-10T14:00:00Z',
          quantity: 2,
        },
      ],
    },
  ];

  it('renders empty state when no treatments provided', () => {
    renderWithRouter(<TreatmentTimeline treatments={[]} />);
    expect(
      screen.getByText('No hay aplicaciones para mostrar')
    ).toBeInTheDocument();
  });

  it('renders timeline axis with markers', () => {
    const { container } = renderWithRouter(
      <TreatmentTimeline treatments={mockTreatments} />
    );

    // Check that timeline axis is rendered (h-32 to accommodate tooltips)
    const timelineAxis = container.querySelector('.relative.h-32');
    expect(timelineAxis).toBeInTheDocument();

    // Check that horizontal line is rendered
    const horizontalLine = container.querySelector(
      '.absolute.top-12.left-0.right-0'
    );
    expect(horizontalLine).toBeInTheDocument();
  });

  it('renders markers for all applications', () => {
    const { container } = renderWithRouter(
      <TreatmentTimeline treatments={mockTreatments} />
    );

    // Should render 3 markers (2 for Botox, 1 for Filler)
    const markers = container.querySelectorAll(
      '.h-4.w-4.rounded-full.border-2'
    );
    expect(markers).toHaveLength(3);
  });

  it('displays month labels on axis', () => {
    const { container } = renderWithRouter(
      <TreatmentTimeline treatments={mockTreatments} />
    );

    // Should have month labels (Ene, Feb, Mar, etc.)
    const labels = container.querySelectorAll('.text-xs.text-muted-foreground');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('assigns distinct colors to different treatments', () => {
    const { container } = renderWithRouter(
      <TreatmentTimeline treatments={mockTreatments} />
    );

    const markers = container.querySelectorAll(
      '.h-4.w-4.rounded-full.border-2'
    );

    // Get background colors
    const colors = Array.from(markers).map(
      (marker) => (marker as HTMLElement).style.backgroundColor
    );

    // First two markers should have same color (same treatment)
    expect(colors[0]).toBe(colors[1]);

    // Third marker should have different color (different treatment)
    expect(colors[2]).not.toBe(colors[0]);
  });

  it('handles single application correctly', () => {
    const singleTreatment: TreatmentHistoryItem[] = [
      {
        treatment_id: 'treatment-1',
        treatment_name: 'Botox',
        total_sessions: 1,
        first_application_date: '2024-01-15T10:00:00Z',
        last_application_date: '2024-01-15T10:00:00Z',
        status: 'active',
        current_session: 1,
        protocol: null,
        applications: [
          {
            id: 'app-1',
            appointment_id: 'appt-1',
            appointment_date: '2024-01-15T10:00:00Z',
            quantity: 1,
          },
        ],
      },
    ];

    const { container } = renderWithRouter(
      <TreatmentTimeline treatments={singleTreatment} />
    );

    // Should render one marker
    const markers = container.querySelectorAll(
      '.h-4.w-4.rounded-full.border-2'
    );
    expect(markers).toHaveLength(1);
  });

  it('implements horizontal scrolling', () => {
    const { container } = renderWithRouter(
      <TreatmentTimeline treatments={mockTreatments} />
    );

    // Check that overflow-x-auto container is used for horizontal scrolling
    const scrollContainer = container.querySelector('.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();

    // Check that content has minimum width for scrolling
    const timelineContent = container.querySelector('.min-w-\\[600px\\]');
    expect(timelineContent).toBeInTheDocument();
  });

  it('markers have hover effect', () => {
    const { container } = renderWithRouter(
      <TreatmentTimeline treatments={mockTreatments} />
    );

    const markers = container.querySelectorAll(
      '.h-4.w-4.rounded-full.border-2'
    );

    // Check that markers have hover transition class
    markers.forEach((marker) => {
      expect(marker.className).toContain('transition-transform');
      expect(marker.className).toContain('hover:scale-125');
    });
  });

  it('markers are clickable', () => {
    const { container } = renderWithRouter(
      <TreatmentTimeline treatments={mockTreatments} />
    );

    const markerContainers = container.querySelectorAll('.cursor-pointer');

    // Should have 3 clickable marker containers
    expect(markerContainers).toHaveLength(3);
  });
});
