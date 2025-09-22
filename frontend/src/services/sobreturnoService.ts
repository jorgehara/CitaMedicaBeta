export const deleteSobreturno = async (id: string) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
export const updateSobreturnoDescription = async (id: string, description: string) => {
  const res = await axios.patch(`${API_URL}/${id}/status`, { description });
  return res.data;
};
import axios from 'axios';
import type { Appointment } from '../types/appointment';

const API_URL = 'https://micitamedica.me/api/sobreturnos';

export const getSobreturnos = async (status?: string): Promise<Appointment[]> => {
  try {
    const params = status ? { status } : {};
    const res = await axios.get(API_URL, { 
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
  const res = await axios.post(API_URL, sobreturno);
  return res.data;
};

export const updateSobreturnoStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
  const res = await axios.patch(`${API_URL}/${id}/status`, { status });
  return res.data;
};
