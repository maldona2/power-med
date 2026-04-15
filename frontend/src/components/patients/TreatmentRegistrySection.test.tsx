import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { TreatmentRegistrySection } from './TreatmentRegistrySection';
import * as useTreatmentHistoryModule from '@/hooks/useTreatmentHistory';
import type { TreatmentHistoryResponse } from '@/types/treatments';

// Mock the hook
vi.mock('@/hooks/useTreatmentHistory');

// Helper to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TreatmentRegistrySection', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton when data is loading', () => {
    vi.spyOn(useTreatmentHistoryModule, 'useTreatmentHistory').mockReturnValue({
      treatmentHistory: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });

    renderWithRouter(<TreatmentRegistrySection patientId="patient-123" />);

    // Check for skeleton elements (using class name since Skeleton doesn't have specific text)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error message when fetch fails', () => {
    vi.spyOn(useTreatmentHistoryModule, 'useTreatmentHistory').mockReturnValue({
      treatmentHistory: null,
      loading: false,
      error: new Error('Network error'),
      refetch: mockRefetch,
    });

    renderWithRouter(<TreatmentRegistrySection patientId="patient-123" />);

    expect(
      screen.getByText('Error al cargar el registro de tratamientos')
    ).toBeInTheDocument();
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
  });

  it('calls refetch when retry button is clicked', async () => {
    const user = userEvent.setup();
    vi.spyOn(useTreatmentHistoryModule, 'useTreatmentHistory').mockReturnValue({
      treatmentHistory: null,
      loading: false,
      error: new Error('Network error'),
      refetch: mockRefetch,
    });

    renderWithRouter(<TreatmentRegistrySection patientId="patient-123" />);

    const retryButton = screen.getByText('Reintentar');
    await user.click(retryButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when no treatments exist', () => {
    const emptyResponse: TreatmentHistoryResponse = {
      treatments: [],
    };

    vi.spyOn(useTreatmentHistoryModule, 'useTreatmentHistory').mockReturnValue({
      treatmentHistory: emptyResponse,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithRouter(<TreatmentRegistrySection patientId="patient-123" />);

    expect(screen.getByText('Sin tratamientos aplicados')).toBeInTheDocument();
    expect(screen.getByText('Registro de Tratamientos')).toBeInTheDocument();
  });

  it('renders section header with treatment count badge', () => {
    const mockResponse: TreatmentHistoryResponse = {
      treatments: [
        {
          treatment_id: 't1',
          treatment_name: 'Tratamiento A',
          total_sessions: 3,
          first_application_date: '2024-01-01',
          last_application_date: '2024-01-15',
          status: 'active',
          current_session: 3,
          protocol: null,
          applications: [],
        },
        {
          treatment_id: 't2',
          treatment_name: 'Tratamiento B',
          total_sessions: 1,
          first_application_date: '2024-01-10',
          last_application_date: '2024-01-10',
          status: null,
          current_session: null,
          protocol: null,
          applications: [],
        },
      ],
    };

    vi.spyOn(useTreatmentHistoryModule, 'useTreatmentHistory').mockReturnValue({
      treatmentHistory: mockResponse,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithRouter(<TreatmentRegistrySection patientId="patient-123" />);

    expect(screen.getByText('Registro de Tratamientos')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Count badge
  });

  it('displays treatment names and session counts correctly', () => {
    const mockResponse: TreatmentHistoryResponse = {
      treatments: [
        {
          treatment_id: 't1',
          treatment_name: 'Botox',
          total_sessions: 3,
          first_application_date: '2024-01-01',
          last_application_date: '2024-01-15',
          status: 'active',
          current_session: 3,
          protocol: null,
          applications: [],
        },
        {
          treatment_id: 't2',
          treatment_name: 'Relleno',
          total_sessions: 1,
          first_application_date: '2024-01-10',
          last_application_date: '2024-01-10',
          status: null,
          current_session: null,
          protocol: null,
          applications: [],
        },
      ],
    };

    vi.spyOn(useTreatmentHistoryModule, 'useTreatmentHistory').mockReturnValue({
      treatmentHistory: mockResponse,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithRouter(<TreatmentRegistrySection patientId="patient-123" />);

    expect(screen.getByText('Botox')).toBeInTheDocument();
    expect(screen.getByText(/3\s+sesión/)).toBeInTheDocument();
    expect(screen.getByText('Relleno')).toBeInTheDocument();
    expect(screen.getByText(/1\s+sesión/)).toBeInTheDocument();
  });

  it('renders status badges with correct colors', () => {
    const mockResponse: TreatmentHistoryResponse = {
      treatments: [
        {
          treatment_id: 't1',
          treatment_name: 'Tratamiento Activo',
          total_sessions: 3,
          first_application_date: '2024-01-01',
          last_application_date: '2024-01-15',
          status: 'active',
          current_session: 3,
          protocol: null,
          applications: [],
        },
        {
          treatment_id: 't2',
          treatment_name: 'Tratamiento Completado',
          total_sessions: 5,
          first_application_date: '2023-12-01',
          last_application_date: '2024-01-01',
          status: 'completed',
          current_session: 5,
          protocol: null,
          applications: [],
        },
      ],
    };

    vi.spyOn(useTreatmentHistoryModule, 'useTreatmentHistory').mockReturnValue({
      treatmentHistory: mockResponse,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithRouter(<TreatmentRegistrySection patientId="patient-123" />);

    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Completado')).toBeInTheDocument();
  });

  it('does not render status badge when status is null', () => {
    const mockResponse: TreatmentHistoryResponse = {
      treatments: [
        {
          treatment_id: 't1',
          treatment_name: 'Tratamiento Sin Estado',
          total_sessions: 2,
          first_application_date: '2024-01-01',
          last_application_date: '2024-01-15',
          status: null,
          current_session: null,
          protocol: null,
          applications: [],
        },
      ],
    };

    vi.spyOn(useTreatmentHistoryModule, 'useTreatmentHistory').mockReturnValue({
      treatmentHistory: mockResponse,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithRouter(<TreatmentRegistrySection patientId="patient-123" />);

    expect(screen.getByText('Tratamiento Sin Estado')).toBeInTheDocument();
    expect(screen.queryByText('Activo')).not.toBeInTheDocument();
    expect(screen.queryByText('Completado')).not.toBeInTheDocument();
  });
});
