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
  async getAll({ showHistory = false } = {}): Promise<Appointment[]> {
    try {
      const response = await axiosInstance.get('/appointments');
      const appointments = response.data;
      
      if (showHistory) {
        return appointments;
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return appointments.filter((appointment: Appointment) => {
          const appointmentDate = new Date(appointment.date);
          appointmentDate.setHours(0, 0, 0, 0);
          return appointmentDate >= today || appointment.status !== 'cancelled';
        });
      }
    } catch (error) {
      console.error('Error al obtener las citas:', error);
      throw new Error('Error al obtener las citas');
    }
  }

  async create(appointmentData: BaseAppointment): Promise<Appointment> {
    try {
      const response = await axiosInstance.post('/appointments', appointmentData);
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

  async getAvailableTimes(date: string): Promise<AvailableTimesResponse> {
    try {
      console.log('[DEBUG] Solicitando horarios disponibles para la fecha:', date);
      const response = await axiosInstance.get('/appointments/available-times', {
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