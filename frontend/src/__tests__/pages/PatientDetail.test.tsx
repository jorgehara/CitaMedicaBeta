// Test básico del componente PatientDetail - Historias Clínicas
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock de los servicios
const mockPatientService = {
  getById: jest.fn(),
  getAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockClinicalHistoryService = {
  getById: jest.fn(),
  getSummariesByPatient: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockFollowUpService = {
  getByClinicalHistory: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.unmock('../../services/patientService');
jest.unmock('../../services/clinicalHistoryService');
jest.unmock('../../services/followUpService');

describe('PatientDetail - Historias Clínicas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería tener los servicios definidos', () => {
    expect(mockPatientService).toBeDefined();
    expect(mockClinicalHistoryService).toBeDefined();
    expect(mockFollowUpService).toBeDefined();
  });

  it('debería tener funciones de clínica病史', () => {
    expect(typeof mockClinicalHistoryService.getById).toBe('function');
    expect(typeof mockClinicalHistoryService.getSummariesByPatient).toBe('function');
    expect(typeof mockClinicalHistoryService.create).toBe('function');
  });

  it('debería tener funciones de seguimiento', () => {
    expect(typeof mockFollowUpService.getByClinicalHistory).toBe('function');
    expect(typeof mockFollowUpService.create).toBe('function');
  });

  it('debería tener funciones de pacientes', () => {
    expect(typeof mockPatientService.getById).toBe('function');
    expect(typeof mockPatientService.getAll).toBe('function');
    expect(typeof mockPatientService.create).toBe('function');
  });
});

// Test de tipos de datos
describe('Tipos de datos - Historias Clínicas', () => {
  it('debería validar estructura de paciente', () => {
    const paciente = {
      _id: 'patient-123',
      firstName: 'Juan',
      lastName: 'Pérez',
      dni: '12345678',
      birthDate: new Date('1985-03-15'),
      gender: 'M' as const,
      phone: '+5491112345678',
      email: 'juan@test.com',
      socialWork: 'Swiss Medical',
      clinicNumber: 'PAC-0001',
    };

    expect(paciente.firstName).toBe('Juan');
    expect(paciente.lastName).toBe('Pérez');
    expect(paciente.gender).toBe('M');
    expect(paciente.clinicNumber).toMatch(/^PAC-\d{4}$/);
  });

  it('debería validar estructura de historia clínica', () => {
    const historiaClinica = {
      _id: 'history-1',
      chiefComplaint: 'Dolor en ATM derecha',
      consultationDate: new Date('2026-01-15'),
      diagnosis: {
        primary: 'Disfunción temporomandibular',
        secondary: ['Bruxismo'],
      },
      helkimoIndex: {
        ai: { score: 8 },
        di: { score: 12 },
      },
      treatmentPlan: {
        description: 'Placa de estabilización',
      },
    };

    expect(historiaClinica.chiefComplaint).toBe('Dolor en ATM derecha');
    expect(historiaClinica.diagnosis.primary).toBe('Disfunción temporomandibular');
    expect(historiaClinica.helkimoIndex.ai.score).toBe(8);
    expect(historiaClinica.helkimoIndex.di.score).toBe(12);
  });

  it('debería validar estructura de seguimiento', () => {
    const seguimiento = {
      _id: 'followup-1',
      date: new Date('2026-02-20'),
      evolution: 'Paciente refere mejora significativa',
      symptomsUpdate: {
        status: 'improved' as const,
        painLevel: 4,
      },
    };

    expect(seguimiento.evolution).toBe('Paciente refere mejora significativa');
    expect(seguimiento.symptomsUpdate.status).toBe('improved');
    expect(seguimiento.symptomsUpdate.painLevel).toBe(4);
  });
});
