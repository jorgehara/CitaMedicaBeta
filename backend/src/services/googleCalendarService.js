const { google } = require('googleapis');

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

    async createCalendarEvent(appointment) {
        try {
            await this.ensureInitialized();
            
            const startTime = new Date(`${appointment.date}T${appointment.time}`);
            const endTime = new Date(startTime.getTime() + 15 * 60000); // 15 minutos después

            const event = {
                summary: `Consulta médica - ${appointment.clientName}`,
                description: `Paciente: ${appointment.clientName}\nObra Social: ${appointment.socialWork}\nTeléfono: ${appointment.phone}\nEmail: ${appointment.email}`,
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
                        { method: 'email', minutes: 24 * 60 }, // recordatorio 24 horas antes
                        { method: 'popup', minutes: 60 } // recordatorio 1 hora antes
                    ]
                }
            };

            if (appointment.email) {
                event.attendees = [{ email: appointment.email }];
                event.sendUpdates = 'all';
            }

            const response = await this.calendar.events.insert({
                calendarId: process.env.CALENDAR_ID,
                resource: event,
            });

            console.log('Evento creado:', response.data);
            return response.data.id;
        } catch (error) {
            console.error('Error al crear evento:', error);
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
