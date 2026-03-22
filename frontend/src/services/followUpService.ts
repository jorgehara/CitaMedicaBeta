// Task 3.4: Follow-Up service for API communication
import type { FollowUp, BaseFollowUp } from '../types/clinicalHistory';
import axiosInstance from '../config/axios';
import axios from 'axios';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class FollowUpService {
  /**
   * Get all follow-ups for a clinical history
   */
  async getByClinicalHistory(clinicalHistoryId: string): Promise<FollowUp[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<FollowUp[]>>(`/follow-ups/clinical-history/${clinicalHistoryId}`);
      return response.data.data;
    } catch (error) {
      console.error('[FollowUpService] Error fetching follow-ups:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al obtener seguimientos');
      }
      throw new Error('Error al obtener seguimientos');
    }
  }

  /**
   * Get follow-up by ID
   */
  async getById(id: string): Promise<FollowUp> {
    try {
      const response = await axiosInstance.get<ApiResponse<FollowUp>>(`/follow-ups/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('[FollowUpService] Error fetching follow-up:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al obtener seguimiento');
      }
      throw new Error('Error al obtener seguimiento');
    }
  }

  /**
   * Create new follow-up
   */
  async create(followUpData: BaseFollowUp): Promise<FollowUp> {
    try {
      const response = await axiosInstance.post<ApiResponse<FollowUp>>('/follow-ups', followUpData);
      return response.data.data;
    } catch (error) {
      console.error('[FollowUpService] Error creating follow-up:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al crear seguimiento');
      }
      throw new Error('Error al crear seguimiento');
    }
  }

  /**
   * Update follow-up
   */
  async update(id: string, updateData: Partial<BaseFollowUp>): Promise<FollowUp> {
    try {
      const response = await axiosInstance.put<ApiResponse<FollowUp>>(`/follow-ups/${id}`, updateData);
      return response.data.data;
    } catch (error) {
      console.error('[FollowUpService] Error updating follow-up:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al actualizar seguimiento');
      }
      throw new Error('Error al actualizar seguimiento');
    }
  }

  /**
   * Delete follow-up
   */
  async delete(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/follow-ups/${id}`);
    } catch (error) {
      console.error('[FollowUpService] Error deleting follow-up:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al eliminar seguimiento');
      }
      throw new Error('Error al eliminar seguimiento');
    }
  }

  /**
   * Upload photo to follow-up
   */
  async uploadPhoto(followUpId: string, file: File, description?: string): Promise<FollowUp> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (description) {
        formData.append('description', description);
      }

      const response = await axiosInstance.post<ApiResponse<FollowUp>>(
        `/follow-ups/${followUpId}/photos`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('[FollowUpService] Error uploading photo:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al subir foto');
      }
      throw new Error('Error al subir foto');
    }
  }

  /**
   * Delete photo from follow-up
   */
  async deletePhoto(followUpId: string, photoUrl: string): Promise<FollowUp> {
    try {
      const response = await axiosInstance.delete<ApiResponse<FollowUp>>(
        `/follow-ups/${followUpId}/photos`,
        {
          data: { url: photoUrl }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('[FollowUpService] Error deleting photo:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al eliminar foto');
      }
      throw new Error('Error al eliminar foto');
    }
  }

  /**
   * Get all follow-ups for a date range (for reports)
   */
  async getByDateRange(startDate: string, endDate: string): Promise<FollowUp[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<FollowUp[]>>('/follow-ups/date-range', {
        params: { startDate, endDate }
      });
      return response.data.data;
    } catch (error) {
      console.error('[FollowUpService] Error fetching follow-ups by date range:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al obtener seguimientos por rango de fechas');
      }
      throw new Error('Error al obtener seguimientos por rango de fechas');
    }
  }
}

// Export singleton instance
export const followUpService = new FollowUpService();

// Export default for convenience
export default followUpService;
