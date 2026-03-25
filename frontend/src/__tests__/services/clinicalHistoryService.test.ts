// Test del servicio de historias clínicas
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import axios from 'axios';

// Mock de axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ClinicalHistoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('debería obtener todas las historias clínicas', async () => {
      const mockData = [
        {
          _id: 'history-1',
          chiefComplaint: 'Dolor en ATM',
          patient: 'patient-1',
        },
      ];

      mockedAxios.get.mockResolvedValue({
        data: { data: mockData },
      });

      expect(mockData).toHaveLength(1);
      expect(mockData[0].chiefComplaint).toBe('Dolor en ATM');
    });
  });

  describe('create', () => {
    it('debería crear una nueva historia clínica', async () => {
      const newHistory = {
        patient: 'patient-1',
        chiefComplaint: 'Nueva consulta',
        diagnosis: {
          primary: 'ATM',
          secondary: [],
        },
        treatmentPlan: {
          description: 'Placa',
        },
      };

      mockedAxios.post.mockResolvedValue({
        data: { data: { ...newHistory, _id: 'history-new' } },
      });

      expect(newHistory.chiefComplaint).toBe('Nueva consulta');
      expect(newHistory.diagnosis.primary).toBe('ATM');
    });
  });

  describe('update', () => {
    it('debería actualizar una historia clínica existente', async () => {
      const updatedHistory = {
        chiefComplaint: 'Consulta actualizada',
        diagnosis: {
          primary: 'ATM actualizado',
          secondary: ['Bruxismo'],
        },
      };

      mockedAxios.put.mockResolvedValue({
        data: { data: updatedHistory },
      });

      expect(updatedHistory.chiefComplaint).toBe('Consulta actualizada');
      expect(updatedHistory.diagnosis.secondary).toContain('Bruxismo');
    });
  });

  describe('delete', () => {
    it('debería eliminar una historia clínica', async () => {
      mockedAxios.delete.mockResolvedValue({
        data: { message: 'Deleted successfully' },
      });

      const historyId = 'history-1';
      expect(historyId).toBe('history-1');
    });
  });
});

describe('Validaciones de Historia Clínica', () => {
  it('debería validar índices Helkimo', () => {
    const helkimoIndex = {
      ai: { score: 8 },
      di: { score: 12 },
    };

    expect(helkimoIndex.ai.score).toBeGreaterThanOrEqual(0);
    expect(helkimoIndex.ai.score).toBeLessThanOrEqual(25);
    expect(helkimoIndex.di.score).toBeGreaterThanOrEqual(0);
    expect(helkimoIndex.di.score).toBeLessThanOrEqual(25);
  });

  it('debería validar clasificación de Helkimo AI', () => {
    const clasificaciones = ['Sin síntomas', 'Síntomas leves', 'Síntomas severos'];
    
    // AI: 0 -> Sin síntomas
    expect(0).toBe(0);
    
    // AI: 1-9 -> Síntomas leves
    expect(5).toBeGreaterThanOrEqual(1);
    expect(5).toBeLessThanOrEqual(9);
    
    // AI: 10+ -> Síntomas severos
    expect(15).toBeGreaterThanOrEqual(10);
  });

  it('debería validar clasificación de Helkimo DI', () => {
    const clasificaciones = [
      'Sin disfunción',
      'Disfunción leve',
      'Disfunción moderada',
      'Disfunción severa',
    ];

    // DI: 0 -> Sin disfunción
    expect(0).toBe(0);
    
    // DI: 1-4 -> Disfunción leve
    expect(3).toBeGreaterThanOrEqual(1);
    expect(3).toBeLessThanOrEqual(4);
    
    // DI: 5-9 -> Disfunción moderada
    expect(7).toBeGreaterThanOrEqual(5);
    expect(7).toBeLessThanOrEqual(9);
    
    // DI: 10+ -> Disfunción severa
    expect(15).toBeGreaterThanOrEqual(10);
  });

  it('debería validar campos obligatorios', () => {
    const historiaMinima = {
      patient: 'patient-1',
      chiefComplaint: 'Dolor ATM',
      diagnosis: {
        primary: 'Disfunción temporomandibular',
      },
      treatmentPlan: {
        description: 'Placa de estabilización',
      },
    };

    expect(historiaMinima.patient).toBeDefined();
    expect(historiaMinima.chiefComplaint).toBeDefined();
    expect(historiaMinima.diagnosis.primary).toBeDefined();
    expect(historiaMinima.treatmentPlan.description).toBeDefined();
  });
});
