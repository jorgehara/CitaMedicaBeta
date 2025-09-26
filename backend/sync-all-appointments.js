const mongoose = require('mongoose');
const Appointment = require('./src/models/appointment');
const Sobreturno = require('./src/models/sobreturno');
const googleCalendarService = require('./src/services/googleCalendarService');
require('dotenv').config();

async function syncAllAppointments() {
    console.log('🚀 Iniciando sincronización de todas las citas...\n');

    // Verificar variables de entorno
    console.log('🔍 Verificando variables de entorno...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Configurado' : '❌ No configurado');
    console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS ? '✅ Configurado' : '❌ No configurado');
    console.log('CALENDAR_ID:', process.env.CALENDAR_ID ? '✅ Configurado' : '❌ No configurado');
    console.log('');

    try {
        // Conectar a MongoDB
        console.log('📡 Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            maxPoolSize: 5,
            minPoolSize: 1,
        });
        console.log('✅ Conectado a MongoDB\n');

        // Sincronizar citas normales
        console.log('📋 Sincronizando citas normales...');
        const appointments = await Appointment.find({});
        console.log(`Encontradas ${appointments.length} citas normales\n`);

        let appointmentsUpdated = 0;
        let appointmentsWithCalendar = 0;

        for (const appointment of appointments) {
            let updated = false;

            // Actualizar estado a confirmed si está pending
            if (appointment.status === 'pending') {
                appointment.status = 'confirmed';
                updated = true;
                console.log(`📝 Cita ${appointment._id} actualizada a confirmed`);
            }

            // Crear evento en Google Calendar si no existe
            if (!appointment.googleEventId && appointment.status === 'confirmed') {
                try {
                    const eventId = await googleCalendarService.createCalendarEvent(appointment);
                    if (eventId) {
                        appointment.googleEventId = eventId;
                        updated = true;
                        appointmentsWithCalendar++;
                        console.log(`📅 Evento de Google Calendar creado para cita ${appointment._id}: ${eventId}`);
                    }
                } catch (calendarError) {
                    console.error(`❌ Error al crear evento para cita ${appointment._id}:`, calendarError.message);
                }
            }

            if (updated) {
                await appointment.save();
                appointmentsUpdated++;
            }
        }

        console.log(`\n✅ Citas normales sincronizadas: ${appointmentsUpdated} actualizadas, ${appointmentsWithCalendar} sincronizadas con Google Calendar\n`);

        // Sincronizar sobreturnos
        console.log('📋 Sincronizando sobreturnos...');
        const sobreturnos = await Sobreturno.find({});
        console.log(`Encontrados ${sobreturnos.length} sobreturnos\n`);

        let sobreturnosUpdated = 0;
        let sobreturnosWithCalendar = 0;

        for (const sobreturno of sobreturnos) {
            let updated = false;

            // Actualizar estado a confirmed si está pending
            if (sobreturno.status === 'pending') {
                sobreturno.status = 'confirmed';
                updated = true;
                console.log(`📝 Sobreturno ${sobreturno._id} actualizado a confirmed`);
            }

            // Crear evento en Google Calendar si no existe
            if (!sobreturno.googleEventId && sobreturno.status === 'confirmed') {
                try {
                    const eventId = await googleCalendarService.createCalendarEvent(sobreturno);
                    if (eventId) {
                        sobreturno.googleEventId = eventId;
                        updated = true;
                        sobreturnosWithCalendar++;
                        console.log(`📅 Evento de Google Calendar creado para sobreturno ${sobreturno._id}: ${eventId}`);
                    }
                } catch (calendarError) {
                    console.error(`❌ Error al crear evento para sobreturno ${sobreturno._id}:`, calendarError.message);
                }
            }

            if (updated) {
                await sobreturno.save();
                sobreturnosUpdated++;
            }
        }

        console.log(`\n✅ Sobreturnos sincronizados: ${sobreturnosUpdated} actualizados, ${sobreturnosWithCalendar} sincronizados con Google Calendar\n`);

        // Resumen final
        console.log('🎉 SINCRONIZACIÓN COMPLETADA');
        console.log('=====================================');
        console.log(`📊 Total de citas normales: ${appointments.length}`);
        console.log(`📊 Total de sobreturnos: ${sobreturnos.length}`);
        console.log(`✅ Citas actualizadas: ${appointmentsUpdated}`);
        console.log(`✅ Sobreturnos actualizados: ${sobreturnosUpdated}`);
        console.log(`📅 Eventos de Google Calendar creados: ${appointmentsWithCalendar + sobreturnosWithCalendar}`);
        console.log('=====================================\n');

        console.log('📋 Verificando resultado final...');
        
        // Verificar resultado final
        const finalAppointments = await Appointment.find({ status: 'confirmed' });
        const finalSobreturnos = await Sobreturno.find({ status: 'confirmed' });
        const appointmentsWithGoogleId = await Appointment.find({ googleEventId: { $exists: true, $ne: null } });
        const sobreturnosWithGoogleId = await Sobreturno.find({ googleEventId: { $exists: true, $ne: null } });

        console.log(`\n📈 ESTADO FINAL:`);
        console.log(`✅ Citas confirmadas: ${finalAppointments.length}`);
        console.log(`✅ Sobreturnos confirmados: ${finalSobreturnos.length}`);
        console.log(`📅 Citas con Google Calendar: ${appointmentsWithGoogleId.length}`);
        console.log(`📅 Sobreturnos con Google Calendar: ${sobreturnosWithGoogleId.length}`);

    } catch (error) {
        console.error('❌ Error durante la sincronización:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Desconectado de MongoDB');
        process.exit(0);
    }
}

// Ejecutar el script
syncAllAppointments().catch(console.error);
