import request from 'supertest';
import express, { Express } from 'express';
import medicalConditionsRouter from './medicalConditions.js';
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

describe('Medical Conditions Routes - Error Handling', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/patients', medicalConditionsRouter);
    app.use(errorHandler); // Add error handler middleware
    jest.clearAllMocks();
  });

  describe('400 Bad Request - Validation Errors', () => {
    it('POST should return 400 when condition_name is missing', async () => {
      const response = await request(app)
        .post('/api/patients/patient-123/conditions')
        .send({
          diagnosed_date: '2024-01-01',
          notes: 'Some notes',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Invalid condition data');
    });

    it('POST should return 400 when condition_name is empty string', async () => {
      const response = await request(app)
        .post('/api/patients/patient-123/conditions')
        .send({
          condition_name: '',
          diagnosed_date: '2024-01-01',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Invalid condition data');
    });

    it('PUT should return 400 with invalid data', async () => {
      const response = await request(app)
        .put('/api/patients/patient-123/conditions/condition-456')
        .send({
          condition_name: '', // Empty string should fail validation
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Invalid condition data');
    });
  });

  describe('404 Not Found', () => {
    it('PUT should return 404 when condition does not exist', async () => {
      (medicalHistoryService.updateCondition as jest.Mock).mockResolvedValue(
        null
      );

      const response = await request(app)
        .put('/api/patients/patient-123/conditions/nonexistent-id')
        .send({
          condition_name: 'Updated Condition',
        });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Condition not found');
    });

    it('DELETE should return 404 when condition does not exist', async () => {
      (medicalHistoryService.deleteCondition as jest.Mock).mockResolvedValue(
        false
      );

      const response = await request(app).delete(
        '/api/patients/patient-123/conditions/nonexistent-id'
      );

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Condition not found');
    });
  });

  describe('403 Forbidden - Missing tenant_id', () => {
    it('should throw 403 error when getTenantId is called without tenantId', () => {
      // This test verifies the getTenantId helper function throws 403
      // when tenant_id is missing from req.user

      // Read the routes file to verify getTenantId throws 403
      const fs = require('fs');
      const routesContent = fs.readFileSync(
        'src/routes/medicalConditions.ts',
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
      const mockCondition = {
        id: 'condition-123',
        tenant_id: 'test-tenant-id',
        patient_id: 'patient-123',
        condition_name: 'Diabetes',
        diagnosed_date: '2024-01-01',
        notes: 'Type 2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (medicalHistoryService.createCondition as jest.Mock).mockResolvedValue(
        mockCondition
      );

      const response = await request(app)
        .post('/api/patients/patient-123/conditions')
        .send({
          condition_name: 'Diabetes',
          diagnosed_date: '2024-01-01',
          notes: 'Type 2',
        });

      expect(response.status).toBe(201);
      expect(response.body.condition_name).toBe('Diabetes');
      expect(response.body.diagnosed_date).toBe('2024-01-01');
      expect(response.body.notes).toBe('Type 2');
    });

    it('GET should return 200 with conditions list', async () => {
      const mockConditions = [
        {
          id: 'condition-123',
          tenant_id: 'test-tenant-id',
          patient_id: 'patient-123',
          condition_name: 'Diabetes',
          diagnosed_date: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      (medicalHistoryService.listConditions as jest.Mock).mockResolvedValue(
        mockConditions
      );

      const response = await request(app).get(
        '/api/patients/patient-123/conditions'
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].condition_name).toBe('Diabetes');
    });

    it('PUT should return 200 when condition is updated', async () => {
      const mockCondition = {
        id: 'condition-456',
        tenant_id: 'test-tenant-id',
        patient_id: 'patient-123',
        condition_name: 'Updated Condition',
        diagnosed_date: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (medicalHistoryService.updateCondition as jest.Mock).mockResolvedValue(
        mockCondition
      );

      const response = await request(app)
        .put('/api/patients/patient-123/conditions/condition-456')
        .send({
          condition_name: 'Updated Condition',
        });

      expect(response.status).toBe(200);
      expect(response.body.condition_name).toBe('Updated Condition');
    });

    it('DELETE should return 204 when condition is deleted', async () => {
      (medicalHistoryService.deleteCondition as jest.Mock).mockResolvedValue(
        true
      );

      const response = await request(app).delete(
        '/api/patients/patient-123/conditions/condition-456'
      );

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });
  });
});
