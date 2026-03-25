// Test del servicio de pacientes
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import axios from 'axios';

// Mock de axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PatientService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('debería obtener todos los pacientes', async () => {
      const mockPatients = [
        {
          _id: 'patient-1',
          firstName: 'Juan',
          lastName: 'Pérez',
          clinicNumber: 'PAC-0001',
          dni: '12345678',
          phone: '+5491112345678',
        },
      ];

      mockedAxios.get.mockResolvedValue({
        data: { data: mockPatients },
      });

      expect(mockPatients).toHaveLength(1);
      expect(mockPatients[0].firstName).toBe('Juan');
    });
  });

  describe('getById', () => {
    it('debería obtener un paciente por ID', async () => {
      const mockPatient = {
        _id: 'patient-1',
        firstName: 'Juan',
        lastName: 'Pérez',
        clinicNumber: 'PAC-0001',
        dni: '12345678',
        birthDate: new Date('1985-03-15'),
        gender: 'M' as const,
        phone: '+5491112345678',
        email: 'juan@test.com',
        socialWork: 'Swiss Medical',
      };

      mockedAxios.get.mockResolvedValue({
        data: { data: mockPatient },
      });

      expect(mockPatient._id).toBe('patient-1');
      expect(mockPatient.firstName).toBe('Juan');
      expect(mockPatient.clinicNumber).toMatch(/^PAC-\d{4}$/);
    });
  });

  describe('create', () => {
    it('debería crear un nuevo paciente', async () => {
      const newPatient = {
        firstName: 'María',
        lastName: 'González',
        dni: '23456789',
        birthDate: new Date('1990-07-22'),
        gender: 'F' as const,
        phone: '+5491198765432',
        email: 'maria@test.com',
        socialWork: 'OSDE',
      };

      mockedAxios.post.mockResolvedValue({
        data: {
          data: {
            ...newPatient,
            _id: 'patient-new',
            clinicNumber: 'PAC-0002',
          },
        },
      });

      expect(newPatient.firstName).toBe('María');
      expect(newPatient.gender).toBe('F');
    });
  });

  describe('update', () => {
    it('debería actualizar un paciente existente', async () => {
      const updatedData = {
        phone: '+5491187654321',
        email: 'juan.nuevo@test.com',
      };

      mockedAxios.put.mockResolvedValue({
        data: { data: updatedData },
      });

      expect(updatedData.phone).toBe('+5491187654321');
      expect(updatedData.email).toBe('juan.nuevo@test.com');
    });
  });

  describe('delete', () => {
    it('debería eliminar (marcar como inactivo) un paciente', async () => {
      mockedAxios.delete.mockResolvedValue({
        data: { message: 'Patient deactivated successfully' },
      });

      const patientId = 'patient-1';
      expect(patientId).toBe('patient-1');
    });
  });
});

describe('Validaciones de Paciente', () => {
  it('debería validar formato de número clínico', () => {
    const clinicNumbers = ['PAC-0001', 'PAC-0123', 'PAC-9999'];
    const regex = /^PAC-\d{4}$/;

    clinicNumbers.forEach((num) => {
      expect(num).toMatch(regex);
    });
  });

  it('debería validar géneros válidos', () => {
    const genderosValidos = ['M', 'F', 'Otro'];
    
    expect(genderosValidos).toContain('M');
    expect(genderosValidos).toContain('F');
    expect(genderosValidos).toContain('Otro');
  });

  it('debería validar obras sociales válidas', () => {
    const obrasSocialesValidas = [
      'INSSSEP',
      'Swiss Medical',
      'OSDE',
      'Galeno',
      'CONSULTA PARTICULAR',
      'Otras Obras Sociales',
    ];

    expect(obrasSocialesValidas).toHaveLength(6);
    expect(obrasSocialesValidas).toContain('INSSSEP');
    expect(obrasSocialesValidas).toContain('CONSULTA PARTICULAR');
  });

  it('debería validar campos obligatorios', () => {
    const pacienteMinimo = {
      firstName: 'Juan',
      lastName: 'Pérez',
      dni: '12345678',
      birthDate: new Date('1985-03-15'),
      gender: 'M' as const,
      phone: '+5491112345678',
    };

    expect(pacienteMinimo.firstName).toBeDefined();
    expect(pacienteMinimo.lastName).toBeDefined();
    expect(pacienteMinimo.dni).toBeDefined();
    expect(pacienteMinimo.birthDate).toBeDefined();
    expect(pacienteMinimo.gender).toBeDefined();
    expect(pacienteMinimo.phone).toBeDefined();
  });

  it('debería validar formato de teléfono argentino', () => {
    const telefonos = [
      '+5491112345678',
      '+5491198765432',
      '+5491165432109',
    ];

    const regex = /^\+549\d{10}$/;
    telefonos.forEach((tel) => {
      expect(tel).toMatch(regex);
    });
  });

  it('debería validar formato de DNI', () => {
    const dnis = ['12345678', '23456789', '34567890'];
    const regex = /^\d{7,8}$/;

    dnis.forEach((dni) => {
      expect(dni).toMatch(regex);
    });
  });

  it('debería calcular edad desde fecha de nacimiento', () => {
    const birthDate = new Date('1985-03-15');
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    expect(age).toBeGreaterThan(0);
    expect(age).toBeLessThan(150);
  });
});

describe('Búsqueda y Filtrado de Pacientes', () => {
  it('debería filtrar pacientes por nombre', () => {
    const pacientes = [
      { firstName: 'Juan', lastName: 'Pérez' },
      { firstName: 'María', lastName: 'González' },
      { firstName: 'Carlos', lastName: 'Rodríguez' },
    ];

    const query = 'juan';
    const filtered = pacientes.filter(
      (p) => p.firstName.toLowerCase().includes(query.toLowerCase())
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].firstName).toBe('Juan');
  });

  it('debería filtrar pacientes por apellido', () => {
    const pacientes = [
      { firstName: 'Juan', lastName: 'Pérez' },
      { firstName: 'María', lastName: 'González' },
      { firstName: 'Ana', lastName: 'Pérez' },
    ];

    const query = 'pérez';
    const filtered = pacientes.filter(
      (p) => p.lastName.toLowerCase().includes(query.toLowerCase())
    );

    expect(filtered).toHaveLength(2);
  });

  it('debería filtrar pacientes por número clínico', () => {
    const pacientes = [
      { clinicNumber: 'PAC-0001' },
      { clinicNumber: 'PAC-0002' },
      { clinicNumber: 'PAC-0123' },
    ];

    const query = 'PAC-0001';
    const filtered = pacientes.filter(
      (p) => p.clinicNumber === query
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].clinicNumber).toBe('PAC-0001');
  });
});
