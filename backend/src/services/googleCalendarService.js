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

    async createCalendarEvent(appointment, calendarId, appointmentLabel, defaultDuration) {
        await this.ensureInitialized();
        const targetCalendarId = calendarId || process.env.CALENDAR_ID;
        const label = appointmentLabel || 'Consulta médica';

        // Extraer tipo de consulta y duración desde el campo description si viene del chatbot
        const descriptionParts = appointment.description ? appointment.description.split(' | ') : [];
        const appointmentType = descriptionParts[0] || label;
        const notes = descriptionParts.slice(1).join(' | ');

        // Duración: parsear desde description "(60 min)", sino usar defaultDuration, sino 30 min
        const durationMatch = appointment.description?.match(/\((\d+) min\)/);
        const durationMinutes = durationMatch ? parseInt(durationMatch[1]) : (defaultDuration || 30);

        // Emoji según tipo de consultorio
        const emoji = /odontol/i.test(label) ? '🦷' : /médic/i.test(label) ? '🩺' : '📋';

        try {
            const startTime = new Date(`${appointment.date}T${appointment.time}`);
            const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

            const descriptionLines = [
                `Paciente: ${appointment.clientName}`,
                `Teléfono: ${appointment.phone}`,
                `Obra Social: ${appointment.socialWork}`,
                notes ? `Notas: ${notes}` : null,
                appointment.email ? `Email: ${appointment.email}` : null,
            ].filter(Boolean).join('\n');

            const event = {
                summary: `${emoji} ${appointment.clientName} — ${appointmentType}`,
                description: descriptionLines,
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
                calendarId: targetCalendarId,
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

    async testConnection(calendarId) {
        await this.ensureInitialized();
        const targetCalendarId = calendarId || process.env.CALENDAR_ID;
        try {
            await this.calendar.calendars.get({
                calendarId: targetCalendarId
            });
            return {
                connected: true,
                calendarId: targetCalendarId,
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
