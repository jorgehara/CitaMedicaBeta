import type { Appointment, BaseAppointment } from '../types/appointment';
import { mockAppointments } from '../mockData/appointments';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const createAppointment = async (appointmentData: BaseAppointment): Promise<Appointment> => {
  try {
    const response = await axios.post(`${API_URL}/appointments`, appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error al crear la cita:', error);
    throw error;
  }
};

// Flag para usar datos mock - ESTABLECER A FALSE EN PRODUCCIÓN
const USE_MOCK_DATA = false;

// Servicio de citas con datos mock para desarrollo
class MockAppointmentService {
  private appointments: Appointment[];

  constructor() {
    this.appointments = [...mockAppointments];
  }

  async getAll(): Promise<Appointment[]> {
    return Promise.resolve([...this.appointments]);
  }

  async getById(id: string): Promise<Appointment> {
    const appointment = this.appointments.find(a => a._id === id);
    if (!appointment) {
      throw new Error('Cita no encontrada');
    }
    return Promise.resolve({...appointment});
  }

  async create(appointment: BaseAppointment): Promise<Appointment> {
    const newAppointment: Appointment = {
      ...appointment,
      _id: `mock-${Date.now()}`
    };
    this.appointments.push(newAppointment);
    return Promise.resolve({...newAppointment});
  }

  async update(id: string, update: Partial<BaseAppointment>): Promise<Appointment> {
    const index = this.appointments.findIndex(a => a._id === id);
    if (index === -1) {
      throw new Error('Cita no encontrada');
    }
    
    this.appointments[index] = {
      ...this.appointments[index],
      ...update
    };
    
    return Promise.resolve({...this.appointments[index]});
  }

  async delete(id: string): Promise<void> {
    const index = this.appointments.findIndex(a => a._id === id);
    if (index === -1) {
      throw new Error('Cita no encontrada');
    }
    
    this.appointments.splice(index, 1);
    return Promise.resolve();
  }

  async updateStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    return this.update(id, { status });
  }

  async reschedule(id: string, date: string, time: string): Promise<Appointment> {
    return this.update(id, { date, time });
  }
}

// Servicio de citas real para producción
class RealAppointmentService {
  async getAll(): Promise<Appointment[]> {
    const response = await fetch(`${API_URL}/appointments`);
    if (!response.ok) {
      throw new Error('Error al obtener las citas');
    }
    return response.json();
  }

  async getById(id: string): Promise<Appointment> {
    const response = await fetch(`${API_URL}/appointments/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener la cita');
    }
    return response.json();
  }

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
  }

  async update(id: string, appointment: Partial<BaseAppointment>): Promise<Appointment> {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
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
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar la cita');
    }
  }

  async updateStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    return this.update(id, { status });
  }

  async reschedule(id: string, date: string, time: string): Promise<Appointment> {
    return this.update(id, { date, time });
  }
}

// IMPORTANTE: Cambiar USE_MOCK_DATA a false antes de desplegar a producción
export const appointmentService = USE_MOCK_DATA 
  ? new MockAppointmentService()
  : new RealAppointmentService();

export const getAvailableTimes = async (date: string): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_URL}/appointments/available-times`, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    throw error;
  }
};

export const getAppointments = async (showHistory: boolean = false) => {
  try {
    const response = await axios.get(`${API_URL}/appointments`, {
      params: { showHistory }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener las citas:', error);
    throw error;
  }
};
