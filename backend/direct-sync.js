// Usar las mismas importaciones que server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Configurar dotenv
dotenv.config();

console.log('🚀 Iniciando sincronización directa...');

// Importar modelos
const Appointment = require('./src/models/appointment');
const Sobreturno = require('./src/models/sobreturno');
const googleCalendarService = require('./src/services/googleCalendarService');

async function syncDatabase() {
    try {
        console.log('📡 Conectando a MongoDB...');
        
        // Usar la misma configuración que server.js
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Obtener estadísticas actuales
        const totalAppointments = await Appointment.countDocuments();
        const totalSobreturnos = await Sobreturno.countDocuments();
        const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
        const pendingSobreturnos = await Sobreturno.countDocuments({ status: 'pending' });

        console.log(`\n📊 ESTADO ACTUAL:`);
        console.log(`📋 Total citas: ${totalAppointments}`);
        console.log(`📋 Total sobreturnos: ${totalSobreturnos}`);
        console.log(`⏳ Citas pendientes: ${pendingAppointments}`);
        console.log(`⏳ Sobreturnos pendientes: ${pendingSobreturnos}`);

        // Actualizar citas pendientes a confirmadas
        if (pendingAppointments > 0) {
            console.log(`\n🔄 Actualizando ${pendingAppointments} citas pendientes...`);
            const appointmentResult = await Appointment.updateMany(
                { status: 'pending' },
                { status: 'confirmed' }
            );
            console.log(`✅ ${appointmentResult.modifiedCount} citas actualizadas a confirmed`);
        }

        // Actualizar sobreturnos pendientes a confirmados
        if (pendingSobreturnos > 0) {
            console.log(`\n🔄 Actualizando ${pendingSobreturnos} sobreturnos pendientes...`);
            const sobreturnoResult = await Sobreturno.updateMany(
                { status: 'pending' },
                { status: 'confirmed' }
            );
            console.log(`✅ ${sobreturnoResult.modifiedCount} sobreturnos actualizados a confirmed`);
        }

        // Verificar estado final
        const finalConfirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
        const finalConfirmedSobreturnos = await Sobreturno.countDocuments({ status: 'confirmed' });

        console.log(`\n📈 ESTADO FINAL:`);
        console.log(`✅ Citas confirmadas: ${finalConfirmedAppointments}`);
        console.log(`✅ Sobreturnos confirmados: ${finalConfirmedSobreturnos}`);

        console.log('\n🎉 Sincronización completada exitosamente!');

    } catch (error) {
        console.error('❌ Error durante la sincronización:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Desconectado de MongoDB');
        process.exit(0);
    }
}

// Ejecutar sincronización
syncDatabase();
