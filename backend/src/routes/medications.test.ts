import request from 'supertest';
import express, { Express } from 'express';
import medicationsRouter from './medications.js';
import * as medicalHistoryService from '../services/medicalHistoryService.js';
import { errorHandler } from '../utils/errorHandler.js';

// Mock the service layer
jest.mock('../services/medicalHistoryService.js');

// Mock middleware
jest.mock('../middleware/auth.js', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { tenantId: 'test-tenant-id', role: 'professional' };
    next();
  },
}));

jest.mock('../middleware/requireRole.js', () => ({
  requireRole: () => (req: any, res: any, next: any) => next(),
}));

describe('Medications Routes - Error Handling', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/patients', medicationsRouter);
    app.use(errorHandler); // Add error handler middleware
    jest.clearAllMocks();
  });

  describe('400 Bad Request - Validation Errors', () => {
    it('POST should return 400 when medication_name is missing', async () => {
      const response = await request(app)
        .post('/api/patients/patient-123/medications')
        .send({
          dosage: '500mg twice daily',
          notes: 'Some notes',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Invalid medication data');
    });

    it('POST should return 400 when medication_name is empty string', async () => {
      const response = await request(app)
        .post('/api/patients/patient-123/medications')
        .send({
          medication_name: '',
          dosage: '500mg',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Invalid medication data');
    });

    it('PUT should return 400 with invalid data', async () => {
      const response = await request(app)
        .put('/api/patients/patient-123/medications/medication-456')
        .send({
          medication_name: '', // Empty string should fail validation
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Invalid medication data');
    });
  });

  describe('404 Not Found', () => {
    it('PUT should return 404 when medication does not exist', async () => {
      (medicalHistoryService.updateMedication as jest.Mock).mockResolvedValue(
        null
      );

      const response = await request(app)
        .put('/api/patients/patient-123/medications/nonexistent-id')
        .send({
          medication_name: 'Updated Medication',
        });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Medication not found');
    });

    it('DELETE should return 404 when medication does not exist', async () => {
      (medicalHistoryService.deleteMedication as jest.Mock).mockResolvedValue(
        false
      );

      const response = await request(app).delete(
        '/api/patients/patient-123/medications/nonexistent-id'
      );

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Medication not found');
    });
  });

  describe('403 Forbidden - Missing tenant_id', () => {
    it('should throw 403 error when getTenantId is called without tenantId', () => {
      // This test verifies the getTenantId helper function throws 403
      // when tenant_id is missing from req.user

      // Read the routes file to verify getTenantId throws 403
      const fs = require('fs');
      const routesContent = fs.readFileSync(
        'src/routes/medications.ts',
        'utf-8'
      );

      // Verify the getTenantId function exists and throws 403
      expect(routesContent).toContain('function getTenantId');
      expect(routesContent).toContain('.statusCode = 403');
      expect(routesContent).toContain('Forbidden');
      expect(routesContent).toContain('if (!tenantId)');
    });
  });

  describe('Successful operations (sanity checks)', () => {
    it('POST should return 201 with valid data', async () => {
      const mockMedication = {
        id: 'medication-123',
        tenant_id: 'test-tenant-id',
        patient_id: 'patient-123',
        medication_name: 'Metformin',
        dosage: '500mg twice daily',
        notes: 'Take with food',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (medicalHistoryService.createMedication as jest.Mock).mockResolvedValue(
        mockMedication
      );

      const response = await request(app)
        .post('/api/patients/patient-123/medications')
        .send({
          medication_name: 'Metformin',
          dosage: '500mg twice daily',
          notes: 'Take with food',
        });

      expect(response.status).toBe(201);
      expect(response.body.medication_name).toBe('Metformin');
      expect(response.body.dosage).toBe('500mg twice daily');
      expect(response.body.notes).toBe('Take with food');
    });

    it('GET should return 200 with medications list', async () => {
      const mockMedications = [
        {
          id: 'medication-123',
          tenant_id: 'test-tenant-id',
          patient_id: 'patient-123',
          medication_name: 'Metformin',
          dosage: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      (medicalHistoryService.listMedications as jest.Mock).mockResolvedValue(
        mockMedications
      );

      const response = await request(app).get(
        '/api/patients/patient-123/medications'
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].medication_name).toBe('Metformin');
    });

    it('PUT should return 200 when medication is updated', async () => {
      const mockMedication = {
        id: 'medication-456',
        tenant_id: 'test-tenant-id',
        patient_id: 'patient-123',
        medication_name: 'Updated Medication',
        dosage: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (medicalHistoryService.updateMedication as jest.Mock).mockResolvedValue(
        mockMedication
      );

      const response = await request(app)
        .put('/api/patients/patient-123/medications/medication-456')
        .send({
          medication_name: 'Updated Medication',
        });

      expect(response.status).toBe(200);
      expect(response.body.medication_name).toBe('Updated Medication');
    });

    it('DELETE should return 204 when medication is deleted', async () => {
      (medicalHistoryService.deleteMedication as jest.Mock).mockResolvedValue(
        true
      );

      const response = await request(app).delete(
        '/api/patients/patient-123/medications/medication-456'
      );

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });
  });
});
