const mongoose = require('mongoose');
const Appointment = require('./src/models/appointment');
const Sobreturno = require('./src/models/sobreturno');
require('dotenv').config();

async function simpleSync() {
    console.log('🚀 Iniciando sincronización simple...');
    
    try {
        console.log('📡 Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        console.log('✅ Conectado a MongoDB');

        // Contar citas actuales
        const appointmentCount = await Appointment.countDocuments();
        const sobreturnoCount = await Sobreturno.countDocuments();
        
        console.log(`📊 Citas encontradas: ${appointmentCount}`);
        console.log(`📊 Sobreturnos encontrados: ${sobreturnoCount}`);

        // Contar citas pendientes
        const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
        const pendingSobreturnos = await Sobreturno.countDocuments({ status: 'pending' });
        
        console.log(`⏳ Citas pendientes: ${pendingAppointments}`);
        console.log(`⏳ Sobreturnos pendientes: ${pendingSobreturnos}`);

        // Actualizar solo las citas pendientes (sin Google Calendar por ahora)
        if (pendingAppointments > 0) {
            const result = await Appointment.updateMany(
                { status: 'pending' },
                { status: 'confirmed' }
            );
            console.log(`✅ ${result.modifiedCount} citas actualizadas a confirmed`);
        }

        if (pendingSobreturnos > 0) {
            const result = await Sobreturno.updateMany(
                { status: 'pending' },
                { status: 'confirmed' }
            );
            console.log(`✅ ${result.modifiedCount} sobreturnos actualizados a confirmed`);
        }

        console.log('🎉 Sincronización completada');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Desconectado de MongoDB');
        process.exit(0);
    }
}

simpleSync();
