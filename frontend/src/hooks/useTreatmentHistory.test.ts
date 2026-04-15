import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  useTreatmentHistory,
  invalidateTreatmentHistoryCache,
} from './useTreatmentHistory';
import api from '@/lib/api';
import type { TreatmentHistoryResponse } from '@/types/treatments';

// Mock the api module
vi.mock('@/lib/api');

const mockApi = api as any;

describe('useTreatmentHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear cache before each test
    invalidateTreatmentHistoryCache();
  });

  it('should return null when patientId is null', () => {
    const { result } = renderHook(() => useTreatmentHistory(null));

    expect(result.current.treatmentHistory).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch treatment history when patientId is provided', async () => {
    const mockData: TreatmentHistoryResponse = {
      treatments: [
        {
          treatment_id: 'treatment-1',
          treatment_name: 'Laser Treatment',
          total_sessions: 5,
          first_application_date: '2024-01-01T10:00:00Z',
          last_application_date: '2024-01-15T10:00:00Z',
          status: 'active',
          current_session: 5,
          protocol: {
            initial_sessions_count: 10,
            initial_frequency_weeks: 2,
            maintenance_frequency_weeks: 4,
            protocol_notes: 'Test notes',
          },
          applications: [
            {
              id: 'app-1',
              appointment_id: 'apt-1',
              appointment_date: '2024-01-01T10:00:00Z',
              quantity: 1,
            },
          ],
        },
      ],
    };

    mockApi.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useTreatmentHistory('patient-123'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.treatmentHistory).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockApi.get).toHaveBeenCalledWith(
      '/patients/patient-123/treatment-history',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('should handle API errors', async () => {
    const error = new Error('Network error');
    mockApi.get.mockRejectedValue(error);

    const { result } = renderHook(() => useTreatmentHistory('patient-123'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.treatmentHistory).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Network error');
  });

  it('should refetch data when refetch is called', async () => {
    const mockData: TreatmentHistoryResponse = {
      treatments: [],
    };

    mockApi.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useTreatmentHistory('patient-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi.get).toHaveBeenCalledTimes(1);

    // Call refetch - this should clear cache and fetch again
    await result.current.refetch();

    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledTimes(2);
    });
  });

  it('should reset state when patientId changes to null', async () => {
    const mockData: TreatmentHistoryResponse = {
      treatments: [],
    };

    mockApi.get.mockResolvedValue({ data: mockData });

    const { result, rerender } = renderHook(
      ({ patientId }) => useTreatmentHistory(patientId),
      {
        initialProps: { patientId: 'patient-123' },
      }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.treatmentHistory).toEqual(mockData);

    // Change patientId to null
    rerender({ patientId: null });

    expect(result.current.treatmentHistory).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should fetch new data when patientId changes', async () => {
    const mockData1: TreatmentHistoryResponse = {
      treatments: [
        {
          treatment_id: 'treatment-1',
          treatment_name: 'Treatment 1',
          total_sessions: 3,
          first_application_date: '2024-01-01T10:00:00Z',
          last_application_date: '2024-01-10T10:00:00Z',
          status: 'active',
          current_session: 3,
          protocol: null,
          applications: [],
        },
      ],
    };

    const mockData2: TreatmentHistoryResponse = {
      treatments: [
        {
          treatment_id: 'treatment-2',
          treatment_name: 'Treatment 2',
          total_sessions: 5,
          first_application_date: '2024-01-05T10:00:00Z',
          last_application_date: '2024-01-20T10:00:00Z',
          status: 'completed',
          current_session: null,
          protocol: null,
          applications: [],
        },
      ],
    };

    mockApi.get
      .mockResolvedValueOnce({ data: mockData1 })
      .mockResolvedValueOnce({ data: mockData2 });

    const { result, rerender } = renderHook(
      ({ patientId }) => useTreatmentHistory(patientId),
      {
        initialProps: { patientId: 'patient-123' },
      }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.treatmentHistory).toEqual(mockData1);
    expect(mockApi.get).toHaveBeenCalledWith(
      '/patients/patient-123/treatment-history',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    );

    // Change patientId
    rerender({ patientId: 'patient-456' });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.treatmentHistory).toEqual(mockData2);
    expect(mockApi.get).toHaveBeenCalledWith(
      '/patients/patient-456/treatment-history',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    );
  });
});
