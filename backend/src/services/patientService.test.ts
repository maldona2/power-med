import * as patientService from './patientService.js';
import * as medicalHistoryService from './medicalHistoryService.js';
import { db } from '../db/client.js';

// Mock the database and medical history service
jest.mock('../db/client.js', () => ({
  db: {
    select: jest.fn(),
  },
  patients: {},
  appointments: {},
  sessions: {},
}));

jest.mock('./medicalHistoryService.js');

describe('patientService.getById', () => {
  const mockTenantId = 'tenant-123';
  const mockPatientId = 'patient-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return patient with medical history when patient exists', async () => {
    // Mock patient data
    const mockPatient = {
      id: mockPatientId,
      tenantId: mockTenantId,
      firstName: 'John',
      lastName: 'Doe',
      phone: '555-1234',
      email: 'john@example.com',
      dateOfBirth: '1980-01-01',
      notes: 'Test notes',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    // Mock medical history data
    const mockConditions = [
      {
        id: 'condition-1',
        tenant_id: mockTenantId,
        patient_id: mockPatientId,
        condition_name: 'Diabetes',
        diagnosed_date: '2023-01-01',
        notes: 'Type 2',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      },
    ];

    const mockMedications = [
      {
        id: 'medication-1',
        tenant_id: mockTenantId,
        patient_id: mockPatientId,
        medication_name: 'Metformin',
        dosage: '500mg twice daily',
        notes: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      },
    ];

    const mockAllergies = [
      {
        id: 'allergy-1',
        tenant_id: mockTenantId,
        patient_id: mockPatientId,
        allergen_name: 'Penicillin',
        allergy_type: 'medication' as const,
        notes: 'Severe reaction',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      },
    ];

    // Mock database queries
    let selectCallCount = 0;
    (db.select as jest.Mock).mockImplementation((fields?: any) => {
      selectCallCount++;
      if (selectCallCount === 1) {
        // First call: patient query
        return {
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([mockPatient]),
            }),
          }),
        };
      } else {
        // Second call: appointments query (inside Promise.all)
        return {
          from: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        };
      }
    });

    // Mock medical history service calls
    (medicalHistoryService.listConditions as jest.Mock).mockResolvedValue(
      mockConditions
    );
    (medicalHistoryService.listMedications as jest.Mock).mockResolvedValue(
      mockMedications
    );
    (medicalHistoryService.listAllergies as jest.Mock).mockResolvedValue(
      mockAllergies
    );

    // Call the function
    const result = await patientService.getById(mockTenantId, mockPatientId);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result?.patient.id).toBe(mockPatientId);
    expect(result?.patient.first_name).toBe('John');
    expect(result?.patient.last_name).toBe('Doe');

    // Verify medical history is included
    expect(result?.medical_history).toBeDefined();
    expect(result?.medical_history.conditions).toEqual(mockConditions);
    expect(result?.medical_history.medications).toEqual(mockMedications);
    expect(result?.medical_history.allergies).toEqual(mockAllergies);

    // Verify service calls were made with correct parameters
    expect(medicalHistoryService.listConditions).toHaveBeenCalledWith(
      mockTenantId,
      mockPatientId
    );
    expect(medicalHistoryService.listMedications).toHaveBeenCalledWith(
      mockTenantId,
      mockPatientId
    );
    expect(medicalHistoryService.listAllergies).toHaveBeenCalledWith(
      mockTenantId,
      mockPatientId
    );
  });

  it('should return empty arrays for medical history when patient has no medical history', async () => {
    // Mock patient data
    const mockPatient = {
      id: mockPatientId,
      tenantId: mockTenantId,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: null,
      email: null,
      dateOfBirth: null,
      notes: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    // Mock database queries
    let selectCallCount = 0;
    (db.select as jest.Mock).mockImplementation((fields?: any) => {
      selectCallCount++;
      if (selectCallCount === 1) {
        // First call: patient query
        return {
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([mockPatient]),
            }),
          }),
        };
      } else {
        // Second call: appointments query
        return {
          from: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        };
      }
    });

    // Mock medical history service calls returning empty arrays
    (medicalHistoryService.listConditions as jest.Mock).mockResolvedValue([]);
    (medicalHistoryService.listMedications as jest.Mock).mockResolvedValue([]);
    (medicalHistoryService.listAllergies as jest.Mock).mockResolvedValue([]);

    // Call the function
    const result = await patientService.getById(mockTenantId, mockPatientId);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result?.medical_history).toBeDefined();
    expect(result?.medical_history.conditions).toEqual([]);
    expect(result?.medical_history.medications).toEqual([]);
    expect(result?.medical_history.allergies).toEqual([]);
  });

  it('should return null when patient does not exist', async () => {
    // Mock database query returning no patient
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    // Call the function
    const result = await patientService.getById(mockTenantId, 'nonexistent-id');

    // Verify the result is null
    expect(result).toBeNull();

    // Verify medical history services were not called
    expect(medicalHistoryService.listConditions).not.toHaveBeenCalled();
    expect(medicalHistoryService.listMedications).not.toHaveBeenCalled();
    expect(medicalHistoryService.listAllergies).not.toHaveBeenCalled();
  });
});
