import type { Appointment, BaseAppointment } from '../types/appointment';
import axiosInstance from '../config/axios';
import axios from 'axios';

interface TimeSlot {
  displayTime: string;
  time: string;
  period: 'morning' | 'afternoon';
}

interface AvailableTimesResponse {
  success: boolean;
  data: {
    date: string;
    morning: TimeSlot[];
    afternoon: TimeSlot[];
  };
}

class AppointmentService {
  async getAll({ showHistory = false, date }: { showHistory?: boolean; date?: string } = {}): Promise<Appointment[]> {
    try {
      const params: { showHistory?: boolean; date?: string } = {};
      if (showHistory !== undefined) params.showHistory = showHistory;
      if (date) params.date = date;

      const response = await axiosInstance.get('/appointments', { params });
      const appointments = response.data;
      
      if (showHistory) {
        return appointments;
      } else {
        const filterDate = date ? new Date(date) : new Date();
        filterDate.setHours(0, 0, 0, 0);
        return appointments.filter((appointment: Appointment) => {
          const appointmentDate = new Date(appointment.date);
          appointmentDate.setHours(0, 0, 0, 0);
          return appointmentDate >= filterDate || appointment.status !== 'cancelled';
        });
      }
    } catch (error) {
      console.error('Error al obtener las citas:', error);
      throw new Error('Error al obtener las citas');
    }
  }

  async create(appointmentData: BaseAppointment, isPublic: boolean = false): Promise<Appointment> {
    try {
      const endpoint = isPublic ? '/appointments/public/book' : '/appointments';
      const response = await axiosInstance.post(endpoint, appointmentData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw new Error('Error al crear la cita');
    }
  }

  async update(id: string, update: Partial<BaseAppointment>): Promise<Appointment> {
    try {
      const response = await axiosInstance.put(`/appointments/${id}`, update);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw new Error('Error al actualizar la cita');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/appointments/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw new Error('Error al eliminar la cita');
    }
  }

  async updateStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    return this.update(id, { status });
  }

  async reschedule(id: string, date: string, time: string): Promise<Appointment> {
    return this.update(id, { date, time });
  }

  async updateDescription(id: string, description: string): Promise<Appointment> {
    try {
      console.log(`[DEBUG] Actualizando descripción para cita ${id}`);
      const response = await axiosInstance.patch(`/appointments/${id}/description`, { description });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw new Error('Error al actualizar la descripción');
    }
  }

  async updatePaymentStatus(id: string, isPaid: boolean): Promise<Appointment> {
    try {
      console.log(`[DEBUG] Actualizando estado de pago para cita ${id} a ${isPaid}`);
      const response = await axiosInstance.patch(`/appointments/${id}/payment`, { isPaid });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw new Error('Error al actualizar el estado de pago');
    }
  }

  async getAvailableTimes(date: string, isPublic: boolean = false): Promise<AvailableTimesResponse> {
    try {
      console.log('[DEBUG] Solicitando horarios disponibles para la fecha:', date);
      const endpoint = isPublic ? '/appointments/public/available-times' : '/appointments/available-times';
      const response = await axiosInstance.get(endpoint, {
        params: { date }
      });
      console.log('[DEBUG] Horarios disponibles recibidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('[ERROR] Error al obtener horarios disponibles:', error);
      throw new Error('Error al obtener horarios disponibles');
    }
  }
}

// Crear y exportar una única instancia del servicio y sus funciones auxiliares
export const appointmentService = new AppointmentService();

// Función auxiliar para obtener horarios disponibles
export const getAvailableTimes = (date: string) => appointmentService.getAvailableTimes(date);