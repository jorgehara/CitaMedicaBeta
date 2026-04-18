// Task 3.3: Clinical History service for API communication
import type { ClinicalHistory, BaseClinicalHistory, ClinicalHistorySummary } from '../types/clinicalHistory';
import axiosInstance from '../config/axios';
import axios from 'axios';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class ClinicalHistoryService {
  /**
   * Get all clinical histories (optionally filtered by date range)
   */
  async getAll(startDate?: string, endDate?: string): Promise<ClinicalHistory[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const queryString = params.toString();
      const url = queryString ? `/clinical-histories?${queryString}` : '/clinical-histories';
      
      const response = await axiosInstance.get<ApiResponse<ClinicalHistory[]>>(url);
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('[ClinicalHistoryService] Error fetching all clinical histories:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al obtener historias clínicas');
      }
      throw new Error('Error al obtener historias clínicas');
    }
  }

  /**
   * Get all clinical histories with patient data (for list view)
   */
  async getAllWithPatient(startDate?: string, endDate?: string): Promise<ClinicalHistory[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const queryString = params.toString();
      const url = queryString ? `/clinical-histories?${queryString}` : '/clinical-histories';
      
      const response = await axiosInstance.get<ApiResponse<ClinicalHistory[]>>(url);
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('[ClinicalHistoryService] Error fetching all clinical histories:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al obtener historias clínicas');
      }
      throw new Error('Error al obtener historias clínicas');
    }
  }

  /**
   * Get all clinical histories for a patient
   */
  async getByPatient(patientId: string): Promise<ClinicalHistory[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<ClinicalHistory[]>>(`/clinical-histories/patient/${patientId}`);
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('[ClinicalHistoryService] Error fetching clinical histories:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al obtener historias clínicas');
      }
      throw new Error('Error al obtener historias clínicas');
    }
  }

  /**
   * Get clinical history by ID
   */
  async getById(id: string): Promise<ClinicalHistory> {
    try {
      const response = await axiosInstance.get<ApiResponse<ClinicalHistory>>(`/clinical-histories/${id}`);
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('[ClinicalHistoryService] Error fetching clinical history:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al obtener historia clínica');
      }
      throw new Error('Error al obtener historia clínica');
    }
  }

  /**
   * Get clinical history summaries for a patient (lighter payload for lists)
   */
  async getSummariesByPatient(patientId: string): Promise<ClinicalHistorySummary[]> {
    try {
      // Use the correct endpoint that exists in the backend
      const response = await axiosInstance.get<ApiResponse<ClinicalHistory[]>>(`/patients/${patientId}/clinical-histories`);
      
      // Transform full clinical histories to summaries
      const histories = response.data.data;
      return histories.map(h => ({
        _id: h._id,
        patient: h.patient,
        chiefComplaint: h.chiefComplaint,
        date: h.consultationDate || h.createdAt,
        helkimoAiClassification: h.helkimoIndex?.ai?.classification || 'Sin clasificación',
        helkimoDiClassification: h.helkimoIndex?.di?.classification || 'Sin clasificación',
        diagnosis: h.diagnosis,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
      }));
    } catch (error) {
      if (import.meta.env.DEV) console.error('[ClinicalHistoryService] Error fetching clinical history summaries:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al obtener resumen de historias clínicas');
      }
      throw new Error('Error al obtener resumen de historias clínicas');
    }
  }

  /**
   * Create new clinical history
   */
  async create(historyData: BaseClinicalHistory): Promise<ClinicalHistory> {
    try {
      const response = await axiosInstance.post<ApiResponse<ClinicalHistory>>('/clinical-histories', historyData);
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('[ClinicalHistoryService] Error creating clinical history:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al crear historia clínica');
      }
      throw new Error('Error al crear historia clínica');
    }
  }

  /**
   * Update clinical history
   */
  async update(id: string, updateData: Partial<BaseClinicalHistory>): Promise<ClinicalHistory> {
    try {
      const response = await axiosInstance.put<ApiResponse<ClinicalHistory>>(`/clinical-histories/${id}`, updateData);
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('[ClinicalHistoryService] Error updating clinical history:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al actualizar historia clínica');
      }
      throw new Error('Error al actualizar historia clínica');
    }
  }

  /**
   * Delete clinical history
   */
  async delete(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/clinical-histories/${id}`);
    } catch (error) {
      if (import.meta.env.DEV) console.error('[ClinicalHistoryService] Error deleting clinical history:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al eliminar historia clínica');
      }
      throw new Error('Error al eliminar historia clínica');
    }
  }

  /**
   * Get clinical history by appointment ID
   */
  async getByAppointment(appointmentId: string): Promise<ClinicalHistory | null> {
    try {
      const response = await axiosInstance.get<ApiResponse<ClinicalHistory>>(`/clinical-histories/appointment/${appointmentId}`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // No clinical history for this appointment
      }
      if (import.meta.env.DEV) console.error('[ClinicalHistoryService] Error fetching clinical history by appointment:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al obtener historia clínica de la cita');
      }
      throw new Error('Error al obtener historia clínica de la cita');
    }
  }

  /**
   * Upload attachment to clinical history
   */
  async uploadAttachment(historyId: string, file: File, type: 'photo' | 'xray' | 'document', description?: string): Promise<ClinicalHistory> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (description) {
        formData.append('description', description);
      }

      const response = await axiosInstance.post<ApiResponse<ClinicalHistory>>(
        `/clinical-histories/${historyId}/attachments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('[ClinicalHistoryService] Error uploading attachment:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al subir archivo adjunto');
      }
      throw new Error('Error al subir archivo adjunto');
    }
  }

  /**
   * Delete attachment from clinical history
   */
  async deleteAttachment(historyId: string, attachmentUrl: string): Promise<ClinicalHistory> {
    try {
      const response = await axiosInstance.delete<ApiResponse<ClinicalHistory>>(
        `/clinical-histories/${historyId}/attachments`,
        {
          data: { url: attachmentUrl }
        }
      );
      return response.data.data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('[ClinicalHistoryService] Error deleting attachment:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al eliminar archivo adjunto');
      }
      throw new Error('Error al eliminar archivo adjunto');
    }
  }
}

// Export singleton instance
export const clinicalHistoryService = new ClinicalHistoryService();

// Export default for convenience
export default clinicalHistoryService;
