export const deleteSobreturno = async (id: string) => {
  try {
    const res = await axios.delete(`${API_BASE}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return res.data;
  } catch (error) {
    console.error('[ERROR] Error al eliminar sobreturno:', error);
    throw error;
  }
};

export const updateSobreturnoDescription = async (id: string, description: string) => {
  try {
    const res = await axios.patch(`${API_BASE}/${id}/status`, { description }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return res.data;
  } catch (error) {
    console.error('[ERROR] Error al actualizar descripción:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (id: string, isPaid: boolean) => {
  try {
    console.log(`[DEBUG] Enviando petición PATCH a ${API_BASE}/${id}/payment con isPaid=${isPaid}`);
    const res = await axios.patch(`${API_BASE}/${id}/payment`, { isPaid }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!res.data || res.status !== 200) {
      throw new Error('Error al actualizar el estado de pago');
    }
    
    console.log('[DEBUG] Respuesta recibida:', res.data);
    
    // Forzar actualización de la lista después de actualizar el pago
    const updatedSobreturno = res.data;
    if (window.refreshAppointments) {
      window.refreshAppointments();
    }
    
    return updatedSobreturno;
  } catch (error) {
    console.error('[ERROR] Error al actualizar estado de pago:', error);
    throw error;
  }
};
import axios from 'axios';
import type { Appointment } from '../types/appointment';

const API_BASE = 'https://micitamedica.me/api/sobreturnos';

export const getSobreturnos = async (status?: string): Promise<Appointment[]> => {
  try {
    const params = status ? { status } : {};
    const res = await axios.get(API_BASE, { 
      params,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return res.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error al obtener sobreturnos:', error.message);
    }
    throw error;
  }
};

export const createSobreturno = async (sobreturno: Omit<Appointment, '_id'>) => {
  const res = await axios.post(API_BASE, sobreturno);
  return res.data;
};

export const updateSobreturnoStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
  const res = await axios.patch(`${API_BASE}/${id}/status`, { status });
  return res.data;
};
