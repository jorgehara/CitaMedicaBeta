import type { Appointment } from '../types/appointment';
import axiosInstance from '../config/axios';

const API_BASE = '/sobreturnos';

interface ValidationResponse {
    success: boolean;
    available: boolean;
    message?: string;
}

export const validateSobreturno = async (date: string, sobreturnoNumber: number): Promise<ValidationResponse> => {
    try {
        const response = await axiosInstance.get(`${API_BASE}/validate`, {
            params: { date, sobreturnoNumber }
        });
        return response.data;
    } catch (error) {
        console.error('[ERROR] Error al validar sobreturno:', error);
        throw error;
    }
};

export const deleteSobreturno = async (id: string) => {
    try {
        const res = await axiosInstance.delete(`${API_BASE}/${id}`);
        return res.data;
    } catch (error) {
        console.error('[ERROR] Error al eliminar sobreturno:', error);
        throw error;
    }
};

export const updateSobreturnoDescription = async (id: string, description: string) => {
    try {
        const res = await axiosInstance.patch(`${API_BASE}/${id}/description`, { description });
        return res.data;
    } catch (error) {
        console.error('[ERROR] Error al actualizar descripción:', error);
        throw error;
    }
};

export const updatePaymentStatus = async (id: string, isPaid: boolean) => {
    try {
        console.log(`[DEBUG] Enviando petición PATCH a ${API_BASE}/${id}/payment con isPaid=${isPaid}`);
        const res = await axiosInstance.patch(`${API_BASE}/${id}/payment`, { isPaid });
        
        if (!res.data) {
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

export const getSobreturnos = async (status?: string): Promise<Appointment[]> => {
    try {
        const params = status ? { status } : {};
        const res = await axiosInstance.get(API_BASE, { params });
        return res.data;
    } catch (error) {
        console.error('[ERROR] Error al obtener sobreturnos:', error);
        throw error;
    }
};

export const createSobreturno = async (sobreturno: Omit<Appointment, '_id'>) => {
    try {
        const res = await axiosInstance.post(API_BASE, sobreturno);
        
        if (!res.data) {
            throw new Error('No se recibieron datos del servidor');
        }
        
        return res.data;
    } catch (error: any) {
        console.error('[ERROR] Error al crear sobreturno:', error);
        throw new Error(error.response?.data?.error || 'Error al crear el sobreturno');
    }
};

export const updateSobreturnoStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
        const res = await axiosInstance.patch(`${API_BASE}/${id}/status`, { status });
        return res.data;
    } catch (error) {
        console.error('[ERROR] Error al actualizar estado:', error);
        throw error;
    }
};

export const getSobreturnosByDate = async (date: string) => {
    try {
        const res = await axiosInstance.get(`${API_BASE}/date/${date}`);
        return res.data;
    } catch (error) {
        console.error('[ERROR] Error al obtener sobreturnos por fecha:', error);
        throw error;
    }
};
