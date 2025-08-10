const { google } = require('googleapis');

class GoogleCalendarService {
    constructor() {
        this.auth = null;
        this.calendar = null;
    }

    async ensureInitialized() {
        try {
            console.log('Iniciando ensureInitialized');
            if (!this.auth) {
                this.auth = new google.auth.GoogleAuth({
                    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
                    scopes: ['https://www.googleapis.com/auth/calendar']
                });
                this.calendar = google.calendar({ version: 'v3', auth: this.auth });
            }
        } catch (error) {
            console.error('Error en ensureInitialized:', error);
            throw error;
        }
    }

    async createCalendarEvent(appointment) {
        try {
            await this.ensureInitialized();
            
            const startTime = new Date(`${appointment.date}T${appointment.time}`);
            const endTime = new Date(startTime.getTime() + 15 * 60000); // 15 minutos después

            const event = {
                summary: `Consulta médica - ${appointment.clientName}`,
                description: `Paciente: ${appointment.clientName}
Obra Social: ${appointment.socialWork}
Teléfono: ${appointment.phone}
Email: ${appointment.email}`,
                start: {
                    dateTime: startTime.toISOString(),
                    timeZone: 'America/Argentina/Buenos_Aires',
                },
                end: {
                    dateTime: endTime.toISOString(),
                    timeZone: 'America/Argentina/Buenos_Aires',
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: 60 } // solo recordatorio popup
                    ]
                }
            };

            // No agregamos attendees para evitar el error de permisos
            const response = await this.calendar.events.insert({
                calendarId: process.env.CALENDAR_ID,
                resource: event,
                sendUpdates: 'none' // No enviar actualizaciones
            });

            console.log('Evento creado:', response.data);
            return response.data.id;
        } catch (error) {
            console.error('Error detallado al crear evento:', error.response?.data || error);
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
}

module.exports = GoogleCalendarService;
