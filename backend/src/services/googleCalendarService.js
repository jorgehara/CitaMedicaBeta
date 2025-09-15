const { google } = require('googleapis');

class GoogleCalendarService {
    constructor() {
        this.calendar = google.calendar({ version: 'v3' });
        this.auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/calendar'],
        });
        this.client = null;
        this.initialized = false;
    }

    async ensureInitialized() {
        if (!this.initialized) {
            try {
                this.client = await this.auth.getClient();
                google.options({ auth: this.client });
                this.initialized = true;
                console.log('Servicio de Google Calendar inicializado correctamente');
            } catch (error) {
                console.error('Error al inicializar Google Calendar:', error);
                throw error;
            }
        }
    }

    async syncEventsForDate(date) {
        await this.ensureInitialized();
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const response = await this.calendar.events.list({
                calendarId: 'primary',
                timeMin: startOfDay.toISOString(),
                timeMax: endOfDay.toISOString(),
                singleEvents: true,
                orderBy: 'startTime'
            });

            return response.data.items || [];
        } catch (error) {
            console.error('[ERROR] Error al sincronizar eventos con Google Calendar:', error);
            throw error;
        }
    }

    async createCalendarEvent(appointment) {
        await this.ensureInitialized();
        try {
            const startTime = new Date(`${appointment.date}T${appointment.time}`);
            const endTime = new Date(startTime.getTime() + 15 * 60000); // 15 minutos

            const event = {
                summary: `Consulta médica - ${appointment.clientName}`,
                description: `Paciente: ${appointment.clientName}
Obra Social: ${appointment.socialWork}
Teléfono: ${appointment.phone}
Email: ${appointment.email}`,
                start: {
                    dateTime: startTime.toISOString(),
                    timeZone: 'America/Argentina/Buenos_Aires'
                },
                end: {
                    dateTime: endTime.toISOString(),
                    timeZone: 'America/Argentina/Buenos_Aires'
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: 60 }
                    ]
                }
            };

            const response = await this.calendar.events.insert({
                calendarId: process.env.CALENDAR_ID,
                requestBody: event,
            });

            console.log('Evento creado exitosamente:', response.data.id);
            return response.data.id;
        } catch (error) {
            console.error('Error al crear evento:', error.message);
            if (error.errors) {
                console.error('Detalles del error:', error.errors);
            }
            throw error;
        }
    }

    async testConnection() {
        await this.ensureInitialized();
        try {
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

// Exportar el servicio como un singleton
let instance = null;

function getInstance() {
    if (!instance) {
        instance = new GoogleCalendarService();
    }
    return instance;
}

module.exports = getInstance();
