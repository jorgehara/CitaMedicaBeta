import type { Appointment, BaseAppointment } from '../types/appointment';

const API_URL = 'http://localhost:3001/api';

export const appointmentService = {
  async getAll(): Promise<Appointment[]> {
    const response = await fetch(`${API_URL}/appointments`);
    if (!response.ok) {
      throw new Error('Error al obtener las citas');
    }
    return response.json();
  },

  async getById(id: string): Promise<Appointment> {
    const response = await fetch(`${API_URL}/appointments/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener la cita');
    }
    return response.json();
  },

  async create(appointment: BaseAppointment): Promise<Appointment> {
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointment),
    });
    if (!response.ok) {
      throw new Error('Error al crear la cita');
    }
    return response.json();
  },

  async update(_id: string, appointment: Partial<BaseAppointment>): Promise<Appointment> {
    const response = await fetch(`${API_URL}/appointments/${_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointment),
    });
    if (!response.ok) {
      throw new Error('Error al actualizar la cita');
    }
    return response.json();
  },

  async delete(_id: string): Promise<void> {
    const response = await fetch(`${API_URL}/appointments/${_id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error al eliminar la cita' }));
      throw new Error(error.message || 'Error al eliminar la cita');
    }
  },

  async updateStatus(_id: string, status: Appointment['status']): Promise<Appointment> {
    return this.update(_id, { status });
  },

  async reschedule(_id: string, date: string, time: string): Promise<Appointment> {
    return this.update(_id, { date, time });
  }
};
