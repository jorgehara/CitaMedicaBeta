const { google } = require('googleapis');
const config = require('../config/googleCalendar');
const { auth } = require('../config/googleCalendar');

class GoogleCalendarService {
    constructor() {
        this.calendar = google.calendar({ version: 'v3', auth });
    }

    async createCalendarEvent(appointment) {
        try {
            // Crear el evento con los datos de la cita
            const event = {
                summary: `Consulta médica - ${appointment.clientName}`,
                description: `Paciente: ${appointment.clientName}
Obra Social: ${appointment.socialWork}
Teléfono: ${appointment.phone}
${appointment.description ? '\nNotas: ' + appointment.description : ''}`,
                start: {
                    dateTime: `${appointment.date}T${appointment.time}:00`,
                    timeZone: config.calendar.timeZone,
                },
                end: {
                    dateTime: this.calculateEndTime(appointment.date, appointment.time),
                    timeZone: config.calendar.timeZone,
                },
                attendees: appointment.email ? [{ email: appointment.email }] : [],
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 }, // recordatorio 24 horas antes
                        { method: 'popup', minutes: 60 }, // recordatorio 1 hora antes
                    ],
                },
            };

            const response = await this.calendar.events.insert({
                calendarId: config.CALENDAR_ID,
                resource: event,
                sendUpdates: 'all', // envía notificaciones a los asistentes
            });

            console.log('Evento creado en Google Calendar:', response.data.htmlLink);
            return response.data.id;
        } catch (error) {
            console.error('Error al crear evento en Google Calendar:', error.message);
            return null;
        }
    }

    calculateEndTime(date, startTime) {
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(startDateTime.getTime() + (60 * 60 * 1000)); // Suma 1 hora
        return endDateTime.toISOString().split('.')[0];
    }
}

module.exports = GoogleCalendarService;
