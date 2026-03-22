// Task 3.2: Patient service for API communication
import type { Patient, BasePatient, PatientSearchResult } from '../types/clinicalHistory';
import axiosInstance from '../config/axios';
import axios from 'axios';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class PatientService {
  /**
   * Get all active patients for the clinic
   */
  async getAll(): Promise<Patient[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Patient[]>>('/patients');
      return response.data.data;
    } catch (error) {
      console.error('[PatientService] Error fetching patients:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al obtener pacientes');
      }
      throw new Error('Error al obtener pacientes');
    }
  }

  /**
   * Get patient by ID
   */
  async getById(id: string): Promise<Patient> {
    try {
      const response = await axiosInstance.get<ApiResponse<Patient>>(`/patients/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('[PatientService] Error fetching patient:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al obtener paciente');
      }
      throw new Error('Error al obtener paciente');
    }
  }

  /**
   * Search patients by name, DNI, or phone
   */
  async search(query: string): Promise<PatientSearchResult[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<PatientSearchResult[]>>('/patients/search', {
        params: { q: query }
      });
      return response.data.data;
    } catch (error) {
      console.error('[PatientService] Error searching patients:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al buscar pacientes');
      }
      throw new Error('Error al buscar pacientes');
    }
  }

  /**
   * Create new patient
   */
  async create(patientData: BasePatient): Promise<Patient> {
    try {
      const response = await axiosInstance.post<ApiResponse<Patient>>('/patients', patientData);
      return response.data.data;
    } catch (error) {
      console.error('[PatientService] Error creating patient:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al crear paciente');
      }
      throw new Error('Error al crear paciente');
    }
  }

  /**
   * Update patient
   */
  async update(id: string, updateData: Partial<BasePatient>): Promise<Patient> {
    try {
      const response = await axiosInstance.put<ApiResponse<Patient>>(`/patients/${id}`, updateData);
      return response.data.data;
    } catch (error) {
      console.error('[PatientService] Error updating patient:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al actualizar paciente');
      }
      throw new Error('Error al actualizar paciente');
    }
  }

  /**
   * Soft delete patient (set isActive = false)
   */
  async delete(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/patients/${id}`);
    } catch (error) {
      console.error('[PatientService] Error deleting patient:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al eliminar paciente');
      }
      throw new Error('Error al eliminar paciente');
    }
  }

  /**
   * Get patient by DNI
   */
  async getByDni(dni: string): Promise<Patient | null> {
    try {
      const response = await axiosInstance.get<ApiResponse<Patient>>('/patients/dni', {
        params: { dni }
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // Patient not found
      }
      console.error('[PatientService] Error fetching patient by DNI:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al buscar paciente por DNI');
      }
      throw new Error('Error al buscar paciente por DNI');
    }
  }

  /**
   * Get patient by clinic number (PAC-XXXX)
   */
  async getByClinicNumber(clinicNumber: string): Promise<Patient | null> {
    try {
      const response = await axiosInstance.get<ApiResponse<Patient>>('/patients/clinic-number', {
        params: { clinicNumber }
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // Patient not found
      }
      console.error('[PatientService] Error fetching patient by clinic number:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al buscar paciente por número de historia');
      }
      throw new Error('Error al buscar paciente por número de historia');
    }
  }
}

// Export singleton instance
export const patientService = new PatientService();

// Export default for convenience
export default patientService;
