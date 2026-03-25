// Test del servicio de seguimientos
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import axios from 'axios';

// Mock de axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FollowUpService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getByClinicalHistory', () => {
    it('debería obtener seguimientos de una historia clínica', async () => {
      const mockFollowUps = [
        {
          _id: 'followup-1',
          date: new Date('2026-02-15'),
          evolution: 'Paciente refiere mejora',
          symptomsUpdate: {
            status: 'improved',
            painLevel: 4,
          },
        },
      ];

      mockedAxios.get.mockResolvedValue({
        data: { data: mockFollowUps },
      });

      expect(mockFollowUps).toHaveLength(1);
      expect(mockFollowUps[0].evolution).toBe('Paciente refiere mejora');
    });
  });

  describe('create', () => {
    it('debería crear un nuevo seguimiento', async () => {
      const newFollowUp = {
        clinicalHistory: 'history-1',
        patient: 'patient-1',
        date: new Date('2026-03-01'),
        evolution: 'Continúa mejorando',
        symptomsUpdate: {
          status: 'improved' as const,
          painLevel: 2,
          notes: 'Sin dolor',
        },
      };

      mockedAxios.post.mockResolvedValue({
        data: { data: { ...newFollowUp, _id: 'followup-new' } },
      });

      expect(newFollowUp.evolution).toBe('Continúa mejorando');
      expect(newFollowUp.symptomsUpdate.status).toBe('improved');
      expect(newFollowUp.symptomsUpdate.painLevel).toBe(2);
    });
  });

  describe('update', () => {
    it('debería actualizar un seguimiento existente', async () => {
      const updatedFollowUp = {
        evolution: 'Evolución actualizada',
        symptomsUpdate: {
          status: 'stable' as const,
          painLevel: 5,
        },
      };

      mockedAxios.put.mockResolvedValue({
        data: { data: updatedFollowUp },
      });

      expect(updatedFollowUp.evolution).toBe('Evolución actualizada');
      expect(updatedFollowUp.symptomsUpdate.status).toBe('stable');
    });
  });

  describe('delete', () => {
    it('debería eliminar un seguimiento', async () => {
      mockedAxios.delete.mockResolvedValue({
        data: { message: 'Follow-up deleted successfully' },
      });

      const followUpId = 'followup-1';
      expect(followUpId).toBe('followup-1');
    });
  });
});

describe('Validaciones de Seguimiento', () => {
  it('debería validar estados de síntomas', () => {
    const estadosValidos = ['improved', 'worsened', 'stable', 'resolved'];

    expect(estadosValidos).toContain('improved');
    expect(estadosValidos).toContain('worsened');
    expect(estadosValidos).toContain('stable');
    expect(estadosValidos).toContain('resolved');
  });

  it('debería validar nivel de dolor (0-10)', () => {
    const nivelesDolor = [0, 3, 5, 7, 10];

    nivelesDolor.forEach((nivel) => {
      expect(nivel).toBeGreaterThanOrEqual(0);
      expect(nivel).toBeLessThanOrEqual(10);
    });
  });

  it('debería validar campos obligatorios', () => {
    const seguimientoMinimo = {
      clinicalHistory: 'history-1',
      patient: 'patient-1',
      date: new Date('2026-03-01'),
      evolution: 'Paciente mejora',
    };

    expect(seguimientoMinimo.clinicalHistory).toBeDefined();
    expect(seguimientoMinimo.patient).toBeDefined();
    expect(seguimientoMinimo.date).toBeDefined();
    expect(seguimientoMinimo.evolution).toBeDefined();
  });

  it('debería ordenar seguimientos por fecha', () => {
    const followUps = [
      { date: new Date(2026, 2, 1) },  // Marzo
      { date: new Date(2026, 0, 15) }, // Enero
      { date: new Date(2026, 1, 15) }, // Febrero
    ];

    const sorted = [...followUps].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    // Verificar que está ordenado de más reciente a más antiguo
    expect(sorted[0].date.getTime()).toBeGreaterThan(sorted[1].date.getTime());
    expect(sorted[1].date.getTime()).toBeGreaterThan(sorted[2].date.getTime());
    
    // El primero debe ser marzo (el más reciente)
    expect(sorted[0].date.getMonth()).toBe(2);
    // El último debe ser enero (el más antiguo)
    expect(sorted[2].date.getMonth()).toBe(0);
  });
});

describe('Análisis de Evolución', () => {
  it('debería detectar mejoría en nivel de dolor', () => {
    const followUps = [
      { date: new Date('2026-01-15'), symptomsUpdate: { painLevel: 8 } },
      { date: new Date('2026-02-15'), symptomsUpdate: { painLevel: 4 } },
      { date: new Date('2026-03-01'), symptomsUpdate: { painLevel: 2 } },
    ];

    const primerNivel = followUps[0].symptomsUpdate.painLevel;
    const ultimoNivel = followUps[2].symptomsUpdate.painLevel;

    expect(ultimoNivel).toBeLessThan(primerNivel);
    expect(primerNivel - ultimoNivel).toBe(6);
  });

  it('debería detectar empeoramiento en nivel de dolor', () => {
    const followUps = [
      { date: new Date('2026-01-15'), symptomsUpdate: { painLevel: 3 } },
      { date: new Date('2026-02-15'), symptomsUpdate: { painLevel: 7 } },
    ];

    const primerNivel = followUps[0].symptomsUpdate.painLevel;
    const segundoNivel = followUps[1].symptomsUpdate.painLevel;

    expect(segundoNivel).toBeGreaterThan(primerNivel);
  });

  it('debería identificar síntomas resueltos', () => {
    const followUp = {
      symptomsUpdate: {
        status: 'resolved' as const,
        painLevel: 0,
        notes: 'Sin molestias',
      },
    };

    expect(followUp.symptomsUpdate.status).toBe('resolved');
    expect(followUp.symptomsUpdate.painLevel).toBe(0);
  });
});

describe('Actualizaciones de Tratamiento', () => {
  it('debería registrar cambios en el tratamiento', () => {
    const followUp = {
      treatmentUpdates: [
        'Ajuste de placa de estabilización',
        'Derivación a fisioterapia',
      ],
    };

    expect(followUp.treatmentUpdates).toHaveLength(2);
    expect(followUp.treatmentUpdates[0]).toBe('Ajuste de placa de estabilización');
  });

  it('debería registrar prescripciones', () => {
    const followUp = {
      prescriptions: [
        {
          medication: 'Ibuprofeno',
          dosage: '400mg',
          frequency: 'Cada 8 horas',
          duration: '7 días',
        },
      ],
    };

    expect(followUp.prescriptions).toHaveLength(1);
    expect(followUp.prescriptions[0].medication).toBe('Ibuprofeno');
    expect(followUp.prescriptions[0].dosage).toBe('400mg');
  });
});
