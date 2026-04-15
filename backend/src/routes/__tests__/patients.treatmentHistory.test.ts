import request from 'supertest';
import express, { Express } from 'express';
import patientsRoutes from '../patients.js';
import * as patientService from '../../services/patientService.js';

jest.mock('../../services/patientService.js');
jest.mock('../../middleware/auth.js', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = {
      tenantId: 'test-tenant-id',
      id: 'user-123',
      role: 'professional',
    };
    next();
  },
}));
jest.mock('../../middleware/requireRole.js', () => ({
  requireRole: () => (req: any, res: any, next: any) => next(),
}));
jest.mock('../../registration/services/LimitEnforcementService.js', () => ({
  LimitEnforcementService: jest.fn().mockImplementation(() => ({
    canCreatePatient: jest.fn().mockResolvedValue(true),
    incrementPatientCount: jest.fn().mockResolvedValue(undefined),
    decrementPatientCount: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('Patient Routes - Treatment History', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/patients', patientsRoutes);

    // Error handler
    app.use((err: any, req: any, res: any, next: any) => {
      res.status(err.statusCode || 500).json({ error: err.message });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /patients/:id/treatment-history', () => {
    it('should return treatment history for a patient', async () => {
      const mockResponse = {
        treatments: [
          {
            treatment_id: 'treatment-1',
            treatment_name: 'Botox',
            total_sessions: 3,
            first_application_date: '2024-01-15T00:00:00.000Z',
            last_application_date: '2024-03-15T00:00:00.000Z',
            status: 'active' as const,
            current_session: 3,
            protocol: {
              initial_sessions_count: 5,
              initial_frequency_weeks: 4,
              maintenance_frequency_weeks: 12,
              protocol_notes: 'Apply to forehead',
            },
            applications: [
              {
                id: 'app-treat-1',
                appointment_id: 'appt-1',
                appointment_date: '2024-01-15T00:00:00.000Z',
                quantity: 1,
              },
              {
                id: 'app-treat-2',
                appointment_id: 'appt-2',
                appointment_date: '2024-02-15T00:00:00.000Z',
                quantity: 1,
              },
              {
                id: 'app-treat-3',
                appointment_id: 'appt-3',
                appointment_date: '2024-03-15T00:00:00.000Z',
                quantity: 1,
              },
            ],
          },
        ],
      };

      (patientService.getTreatmentHistory as jest.Mock).mockResolvedValue(
        mockResponse
      );

      const response = await request(app).get(
        '/patients/patient-123/treatment-history'
      );

      expect(response.status).toBe(200);
      expect(response.body.treatments).toHaveLength(1);
      expect(response.body.treatments[0].treatment_name).toBe('Botox');
      expect(response.body.treatments[0].total_sessions).toBe(3);
      expect(response.body.treatments[0].status).toBe('active');
      expect(patientService.getTreatmentHistory).toHaveBeenCalledWith(
        'test-tenant-id',
        'patient-123'
      );
    });

    it('should return empty array when patient has no treatments', async () => {
      const mockResponse = {
        treatments: [],
      };

      (patientService.getTreatmentHistory as jest.Mock).mockResolvedValue(
        mockResponse
      );

      const response = await request(app).get(
        '/patients/patient-123/treatment-history'
      );

      expect(response.status).toBe(200);
      expect(response.body.treatments).toEqual([]);
    });

    it('should return 404 when patient does not exist', async () => {
      const error = new Error('Patient not found');
      (error as any).statusCode = 404;
      (patientService.getTreatmentHistory as jest.Mock).mockRejectedValue(
        error
      );

      const response = await request(app).get(
        '/patients/nonexistent/treatment-history'
      );

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Patient not found');
    });

    it('should handle multiple treatments correctly', async () => {
      const mockResponse = {
        treatments: [
          {
            treatment_id: 'treatment-1',
            treatment_name: 'Botox',
            total_sessions: 2,
            first_application_date: '2024-02-01T00:00:00.000Z',
            last_application_date: '2024-03-01T00:00:00.000Z',
            status: 'active' as const,
            current_session: 2,
            protocol: null,
            applications: [],
          },
          {
            treatment_id: 'treatment-2',
            treatment_name: 'Laser Treatment',
            total_sessions: 5,
            first_application_date: '2024-01-01T00:00:00.000Z',
            last_application_date: '2024-01-15T00:00:00.000Z',
            status: 'completed' as const,
            current_session: 5,
            protocol: null,
            applications: [],
          },
        ],
      };

      (patientService.getTreatmentHistory as jest.Mock).mockResolvedValue(
        mockResponse
      );

      const response = await request(app).get(
        '/patients/patient-123/treatment-history'
      );

      expect(response.status).toBe(200);
      expect(response.body.treatments).toHaveLength(2);
      expect(response.body.treatments[0].treatment_name).toBe('Botox');
      expect(response.body.treatments[1].treatment_name).toBe(
        'Laser Treatment'
      );
    });
  });
});
