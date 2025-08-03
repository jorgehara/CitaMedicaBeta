import axios from 'axios';
import { APPOINTMENT_CONFIG } from '../config/appointment';

const { API_URL } = APPOINTMENT_CONFIG;

async function testBackendConnection() {
    try {
        // Test 1: Verificar que el backend está respondiendo
        console.log('🔍 Verificando conexión con el backend...');
        const healthCheck = await axios.get(`${API_URL}/health`);
        console.log('✅ Backend responde correctamente:', healthCheck.data);

        // Test 2: Verificar endpoint de horarios disponibles
        console.log('\n🔍 Verificando endpoint de horarios disponibles...');
        const today = new Date().toISOString().split('T')[0];
        const availableSlots = await axios.get(`${API_URL}/appointments/available/${today}`);
        console.log('✅ Endpoint de horarios responde:', availableSlots.data);

        // Test 3: Verificar endpoint de citas reservadas
        console.log('\n🔍 Verificando endpoint de citas reservadas...');
        const reservedSlots = await axios.get(`${API_URL}/appointments/reserved/${today}`);
        console.log('✅ Endpoint de reservas responde:', reservedSlots.data);

        return {
            success: true,
            message: 'Todas las verificaciones completadas exitosamente'
        };
    } catch (error: any) {
        console.error('\n❌ Error durante la verificación:', {
            message: error.message,
            endpoint: error.config?.url,
            status: error.response?.status,
            data: error.response?.data
        });

        return {
            success: false,
            message: 'Error durante la verificación',
            error: {
                message: error.message,
                endpoint: error.config?.url,
                status: error.response?.status
            }
        };
    }
}

export async function verifyAppointmentSystem() {
    console.log('🏥 Iniciando verificación del sistema de citas...\n');
    
    // Paso 1: Verificar configuración
    console.log('📋 Verificando configuración...');
    if (!API_URL) {
        console.error('❌ API_URL no está configurada');
        return false;
    }
    console.log('✅ Configuración básica correcta\n');

    // Paso 2: Verificar conexión y endpoints
    const connectionTest = await testBackendConnection();
    if (!connectionTest.success) {
        console.error('❌ Falló la verificación de conexión');
        return false;
    }

    console.log('\n✨ Sistema de citas verificado correctamente');
    return true;
}

// Ejecutar verificación si se llama directamente
if (require.main === module) {
    verifyAppointmentSystem()
        .then(result => {
            if (!result) {
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('Error inesperado:', error);
            process.exit(1);
        });
}
