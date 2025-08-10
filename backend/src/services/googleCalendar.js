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
    }    async createEvent({ summary, description, startTime, endTime, reminderMinutes = 30 }) {
        await this.ensureInitialized();
        try {
            const calendarId = process.env.CALENDAR_ID;
            console.log('Creando evento en calendario:', calendarId);
            console.log('Datos del evento:', { summary, startTime, endTime });
            
            const event = {
                summary,
                description,
                start: {
                    dateTime: new Date(startTime).toISOString(),
                    timeZone: process.env.TIMEZONE || 'America/Argentina/Buenos_Aires'
                },
                end: {
                    dateTime: new Date(endTime).toISOString(),
                    timeZone: process.env.TIMEZONE || 'America/Argentina/Buenos_Aires'
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: reminderMinutes }
                    ]
                }
            };

            const response = await this.calendar.events.insert({
                calendarId: calendarId,
                requestBody: event, // Cambio de 'resource' a 'requestBody' según la documentación actual
            });

            console.log('Evento creado exitosamente:', response.data.id);
            return response.data;
        } catch (error) {
            console.error('Error al crear evento:', error.message);
            if (error.errors) {
                console.error('Detalles del error:', error.errors);
            }
            throw error;
        }
    }

    async updateEvent({ eventId, summary, description, startTime, endTime, reminderMinutes = 30 }) {
        await this.ensureInitialized();
        try {
            const calendarId = process.env.CALENDAR_ID;
            console.log('Actualizando evento:', eventId);
            
            const event = {
                summary,
                description,
                start: {
                    dateTime: new Date(startTime).toISOString(),
                    timeZone: process.env.TIMEZONE || 'America/Argentina/Buenos_Aires'
                },
                end: {
                    dateTime: new Date(endTime).toISOString(),
                    timeZone: process.env.TIMEZONE || 'America/Argentina/Buenos_Aires'
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: reminderMinutes }
                    ]
                }
            };

            const response = await this.calendar.events.update({
                calendarId: calendarId,
                eventId: eventId,
                requestBody: event,
            });

            console.log('Evento actualizado exitosamente');
            return response.data;
        } catch (error) {
            console.error('Error al actualizar evento:', error.message);
            if (error.errors) {
                console.error('Detalles del error:', error.errors);
            }
            throw error;
        }
    }    async deleteEvent(eventId) {
        await this.ensureInitialized();
        try {
            console.log('Eliminando evento:', eventId);            await this.calendar.events.delete({
                calendarId: process.env.CALENDAR_ID,
                eventId: eventId
            });
            console.log('Evento eliminado exitosamente');
        } catch (error) {
            console.error('Error al eliminar evento:', error.message);
            if (error.errors) {
                console.error('Detalles del error:', error.errors);
            }
            throw error;
        }
    }
}

module.exports = GoogleCalendarService;
