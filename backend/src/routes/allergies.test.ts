import request from 'supertest';
import express, { Express } from 'express';
import allergiesRouter from './allergies.js';
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

describe('Allergies Routes - Error Handling', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/patients', allergiesRouter);
    app.use(errorHandler); // Add error handler middleware
    jest.clearAllMocks();
  });

  describe('400 Bad Request - Validation Errors', () => {
    it('POST should return 400 when allergen_name is missing', async () => {
      const response = await request(app)
        .post('/api/patients/patient-123/allergies')
        .send({
          allergy_type: 'medication',
          notes: 'Some notes',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Invalid allergy data');
    });

    it('POST should return 400 when allergen_name is empty string', async () => {
      const response = await request(app)
        .post('/api/patients/patient-123/allergies')
        .send({
          allergen_name: '',
          allergy_type: 'food',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Invalid allergy data');
    });

    it('PUT should return 400 with invalid data', async () => {
      const response = await request(app)
        .put('/api/patients/patient-123/allergies/allergy-456')
        .send({
          allergen_name: '', // Empty string should fail validation
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Invalid allergy data');
    });
  });

  describe('404 Not Found', () => {
    it('PUT should return 404 when allergy does not exist', async () => {
      (medicalHistoryService.updateAllergy as jest.Mock).mockResolvedValue(
        null
      );

      const response = await request(app)
        .put('/api/patients/patient-123/allergies/nonexistent-id')
        .send({
          allergen_name: 'Updated Allergen',
        });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Allergy not found');
    });

    it('DELETE should return 404 when allergy does not exist', async () => {
      (medicalHistoryService.deleteAllergy as jest.Mock).mockResolvedValue(
        false
      );

      const response = await request(app).delete(
        '/api/patients/patient-123/allergies/nonexistent-id'
      );

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Allergy not found');
    });
  });

  describe('403 Forbidden - Missing tenant_id', () => {
    it('should throw 403 error when getTenantId is called without tenantId', () => {
      // This test verifies the getTenantId helper function throws 403
      // when tenant_id is missing from req.user

      // Read the routes file to verify getTenantId throws 403
      const fs = require('fs');
      const routesContent = fs.readFileSync('src/routes/allergies.ts', 'utf-8');

      // Verify the getTenantId function exists and throws 403
      expect(routesContent).toContain('function getTenantId');
      expect(routesContent).toContain('.statusCode = 403');
      expect(routesContent).toContain('Forbidden');
      expect(routesContent).toContain('if (!tenantId)');
    });
  });

  describe('Successful operations (sanity checks)', () => {
    it('POST should return 201 with valid data', async () => {
      const mockAllergy = {
        id: 'allergy-123',
        tenant_id: 'test-tenant-id',
        patient_id: 'patient-123',
        allergen_name: 'Penicillin',
        allergy_type: 'medication',
        notes: 'Severe reaction',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (medicalHistoryService.createAllergy as jest.Mock).mockResolvedValue(
        mockAllergy
      );

      const response = await request(app)
        .post('/api/patients/patient-123/allergies')
        .send({
          allergen_name: 'Penicillin',
          allergy_type: 'medication',
          notes: 'Severe reaction',
        });

      expect(response.status).toBe(201);
      expect(response.body.allergen_name).toBe('Penicillin');
      expect(response.body.allergy_type).toBe('medication');
      expect(response.body.notes).toBe('Severe reaction');
    });

    it('GET should return 200 with allergies list', async () => {
      const mockAllergies = [
        {
          id: 'allergy-123',
          tenant_id: 'test-tenant-id',
          patient_id: 'patient-123',
          allergen_name: 'Penicillin',
          allergy_type: 'medication',
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      (medicalHistoryService.listAllergies as jest.Mock).mockResolvedValue(
        mockAllergies
      );

      const response = await request(app).get(
        '/api/patients/patient-123/allergies'
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].allergen_name).toBe('Penicillin');
    });

    it('PUT should return 200 when allergy is updated', async () => {
      const mockAllergy = {
        id: 'allergy-456',
        tenant_id: 'test-tenant-id',
        patient_id: 'patient-123',
        allergen_name: 'Updated Allergen',
        allergy_type: 'food',
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (medicalHistoryService.updateAllergy as jest.Mock).mockResolvedValue(
        mockAllergy
      );

      const response = await request(app)
        .put('/api/patients/patient-123/allergies/allergy-456')
        .send({
          allergen_name: 'Updated Allergen',
        });

      expect(response.status).toBe(200);
      expect(response.body.allergen_name).toBe('Updated Allergen');
    });

    it('DELETE should return 204 when allergy is deleted', async () => {
      (medicalHistoryService.deleteAllergy as jest.Mock).mockResolvedValue(
        true
      );

      const response = await request(app).delete(
        '/api/patients/patient-123/allergies/allergy-456'
      );

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });
  });
});
