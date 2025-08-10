const { google } = require('googleapis');
const path = require('path');

class GoogleCalendarService {
    constructor() {
        this.auth = null;
        this.calendar = null;
    }

    async ensureInitialized() {
        try {
            console.log('Iniciando ensureInitialized');
            console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
            console.log('CALENDAR_ID:', process.env.CALENDAR_ID);
            
            if (!this.auth) {
                this.auth = new google.auth.GoogleAuth({
                    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
                    scopes: ['https://www.googleapis.com/auth/calendar']
                });
                console.log('Auth creada correctamente');
                
                this.calendar = google.calendar({ version: 'v3', auth: this.auth });
                console.log('Cliente de calendar creado correctamente');
            }
            console.log('ensureInitialized completado');
        } catch (error) {
            console.error('Error en ensureInitialized:', error);
            throw error;
        }
    }

    async testConnection() {
        try {
            await this.ensureInitialized();
            const calendar = await this.calendar.calendars.get({
                calendarId: process.env.CALENDAR_ID
            });
            return {
                connected: true,
                calendarId: process.env.CALENDAR_ID,
                nextEventsCount: 0
            };
        } catch (error) {
            console.error('Error en testConnection:', error);
            throw new Error(`Error conectando con Google Calendar: ${error.message}`);
        }
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
        const endDateTime = new Date(startDateTime.getTime() + (15 * 60 * 1000)); // Suma 15 minutos
        return endDateTime.toISOString().split('.')[0];
    }
}

module.exports = GoogleCalendarService;
