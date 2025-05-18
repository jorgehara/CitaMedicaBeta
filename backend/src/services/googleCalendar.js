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
                eventId: eventId,
            });
        } catch (error) {
            console.error('Error al eliminar evento de Google Calendar:', error);
            throw error;
        }
    }    async checkAvailability(startTime, endTime, excludeEventId = null) {
        try {
            const calendarId = process.env.CALENDAR_ID;
            
            console.log('Verificando disponibilidad para:', {
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                excludeEventId
            });

            const response = await this.calendar.events.list({
                calendarId: calendarId,
                timeMin: new Date(startTime).toISOString(),
                timeMax: new Date(endTime).toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });

            // Si hay un ID de evento a excluir, filtrarlo de la lista
            const events = excludeEventId 
                ? response.data.items.filter(event => event.id !== excludeEventId)
                : response.data.items;

            const isAvailable = events.length === 0;
            console.log('Eventos encontrados:', events.length);
            console.log('Horario disponible:', isAvailable);

            return isAvailable;
        } catch (error) {
            console.error('Error al verificar disponibilidad:', error);
            throw error;
        }
    }

    isValidAppointmentTime(dateTime) {
        const hour = dateTime.getHours();
        const minutes = dateTime.getMinutes();
        
        // Verificar que los minutos sean múltiplos de 15
        if (minutes % 15 !== 0) {
            return false;
        }

        // Verificar horarios de atención
        const isMorningShift = hour >= 8 && hour < 12;
        const isAfternoonShift = hour >= 16 && hour < 20;
        
        return isMorningShift || isAfternoonShift;
    }

    isWorkingDay(date) {
        const day = date.getDay();
        return day >= 1 && day <= 5; // 1 = Lunes, 5 = Viernes
    }

    getNextWorkingDay(date) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(8, 0, 0, 0); // Comenzar a las 8:00

        // Si es fin de semana, avanzar al próximo lunes
        while (!this.isWorkingDay(nextDay)) {
            nextDay.setDate(nextDay.getDate() + 1);
        }

        return nextDay;
    }

    async getNextAvailableSlot(currentDate) {
        let dateToCheck = new Date(currentDate);
        
        // Intentar los siguientes horarios hasta encontrar uno disponible
        for (let i = 0; i < 50; i++) { // Límite de 50 intentos para evitar bucles infinitos
            console.log('Verificando disponibilidad para slot:', dateToCheck);
            
            // Si es después de las 20:00 o fin de semana, ir al siguiente día hábil
            if (dateToCheck.getHours() >= 20 || !this.isWorkingDay(dateToCheck)) {
                dateToCheck = this.getNextWorkingDay(dateToCheck);
                continue;
            }
            
            // Si es entre 12:00 y 16:00, ir al siguiente turno (16:00)
            if (dateToCheck.getHours() >= 12 && dateToCheck.getHours() < 16) {
                dateToCheck.setHours(16, 0, 0, 0);
                continue;
            }

            // Calcular hora de fin (15 minutos después)
            const endDateTime = new Date(dateToCheck);
            endDateTime.setMinutes(endDateTime.getMinutes() + 15);

            // Verificar si este horario está disponible
            const isAvailable = await this.checkAvailability(dateToCheck, endDateTime);
            
            if (isAvailable) {
                return dateToCheck;
            }

            // Si no está disponible, avanzar 15 minutos
            dateToCheck.setMinutes(dateToCheck.getMinutes() + 15);

            // Si pasamos de las 12:00, saltar a las 16:00
            if (dateToCheck.getHours() >= 12 && dateToCheck.getHours() < 16) {
                dateToCheck.setHours(16, 0, 0, 0);
            }
            
            // Si pasamos de las 20:00, ir al siguiente día
            if (dateToCheck.getHours() >= 20) {
                dateToCheck = this.getNextWorkingDay(dateToCheck);
            }
        }

        // Si no encontramos ningún horario disponible después de 50 intentos
        throw new Error('No se encontraron horarios disponibles en los próximos días');
    }

    calculateEndTime(date, startTime) {
        const [hours, minutes] = startTime.split(':');
        const startDate = new Date(`${date}T${startTime}:00`);
        startDate.setMinutes(startDate.getMinutes() + 15); // Citas de 15 minutos
        return startDate.toISOString().split('.')[0];
    }
}

// Crear y exportar una instancia única del servicio
const calendarService = new GoogleCalendarService();

module.exports = calendarService;
