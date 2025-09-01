const mongoose = require('mongoose');
require('dotenv').config();

console.log('🚀 Iniciando prueba de conexión con timeout...');

async function testConnection() {
    try {
        console.log('📡 Conectando a MongoDB con timeout de 5 segundos...');
        
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
        });
        
        console.log('✅ Conectado exitosamente');
        
        // Probar operación básica
        const Appointment = require('./src/models/appointment');
        const count = await Appointment.countDocuments();
        console.log(`📊 Total de citas: ${count}`);
        
        await mongoose.disconnect();
        console.log('👋 Desconectado');
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    } finally {
        process.exit(0);
    }
}

testConnection();
