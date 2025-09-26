const mongoose = require('mongoose');
const Appointment = require('./src/models/appointment');
const Sobreturno = require('./src/models/sobreturno');
const googleCalendarService = require('./src/services/googleCalendarService');
require('dotenv').config();

async function importCalendarEvents(date = null) {
    console.log('🚀 Importando eventos desde Google Calendar a MongoDB...');

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        maxPoolSize: 5,
        minPoolSize: 1,
    });
    console.log('✅ Conectado a MongoDB');

    // Usar la fecha actual si no se pasa ninguna
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const isoDate = targetDate.toISOString().split('T')[0];

    // Traer eventos del calendar para ese día
    const events = await googleCalendarService.syncEventsForDate(targetDate);
    console.log(`📅 Eventos encontrados en Google Calendar para ${isoDate}: ${events.length}`);

    let imported = 0;
    for (const event of events) {
        const startTime = new Date(event.start.dateTime);
        const dateStr = startTime.toISOString().split('T')[0];
        const timeStr = startTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        // Buscar si ya existe como cita o sobreturno
        const existsAppointment = await Appointment.findOne({ date: dateStr, time: timeStr });
        const existsSobreturno = await Sobreturno.findOne({ date: dateStr, time: timeStr });
        if (!existsAppointment && !existsSobreturno) {
            // Extraer datos del evento
            let clientName = 'Sin nombre';
            let socialWork = '';
            let phone = '';
            let email = '';
            let description = '';
            if (event.summary) clientName = event.summary.replace('Consulta médica - ', '').trim();
            if (event.description) {
                description = event.description;
                const socialWorkMatch = description.match(/Obra Social: (.*)/);
                if (socialWorkMatch) socialWork = socialWorkMatch[1].split('\n')[0].trim();
                const phoneMatch = description.match(/Tel[eé]fono: (.*)/);
                if (phoneMatch) phone = phoneMatch[1].split('\n')[0].trim();
                const emailMatch = description.match(/Email: (.*)/);
                if (emailMatch) email = emailMatch[1].split('\n')[0].trim();
            }
            const newAppointment = {
                clientName,
                socialWork,
                phone,
                email,
                description,
                date: dateStr,
                time: timeStr,
                status: 'confirmed',
                googleEventId: event.id || undefined
            };
            await Appointment.create(newAppointment);
            imported++;
            console.log(`[IMPORT] Evento importado: ${clientName} - ${dateStr} ${timeStr}`);
        }
    }
    console.log(`\n✅ Importación completada. Eventos importados: ${imported}`);
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
}

// Ejecutar el script
const inputDate = process.argv[2];
importCalendarEvents(inputDate).catch(console.error);
