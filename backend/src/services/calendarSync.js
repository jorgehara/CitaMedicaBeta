const Appointment = require('../models/appointment');
const googleCalendarService = require('./googleCalendarService');

async function syncWithGoogleCalendar(startDate) {
    try {
        // Obtener eventos de Google Calendar
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30); // Sincronizar 30 días hacia adelante
        
        console.log('[DEBUG] Sincronizando eventos desde', startDate, 'hasta', endDate);
        
        const calendarEvents = await googleCalendarService.events.list({
            calendarId: process.env.CALENDAR_ID,
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            singleEvents: true,
            orderBy: 'startTime'
        });

        const events = calendarEvents.data.items;
        console.log(`[DEBUG] ${events.length} eventos encontrados en Google Calendar`);

        // Procesar cada evento
        for (const event of events) {
            const startDateTime = new Date(event.start.dateTime);
            const eventDate = startDateTime.toISOString().split('T')[0];
            const eventTime = startDateTime.toTimeString().split(':').slice(0, 2).join(':');

            // Verificar si ya existe en la base de datos
            const existingAppointment = await Appointment.findOne({ googleEventId: event.id });
            
            if (!existingAppointment) {
                // Extraer el nombre del paciente del título del evento
                const clientName = event.summary.replace('Consulta médica - ', '');
                
                // Crear nuevo registro en la base de datos
                const newAppointment = new Appointment({
                    clientName,
                    date: eventDate,
                    time: eventTime,
                    status: 'confirmed',
                    googleEventId: event.id,
                    description: event.description || '',
                    socialWork: 'CONSULTA PARTICULAR', // Valor por defecto
                    phone: 'No especificado'
                });

                await newAppointment.save();
                console.log('[DEBUG] Nueva cita sincronizada:', newAppointment);
            }
        }

        console.log('[DEBUG] Sincronización completada');
    } catch (error) {
        console.error('[ERROR] Error en la sincronización:', error);
    }
}

module.exports = syncWithGoogleCalendar;