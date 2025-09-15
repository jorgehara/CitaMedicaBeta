async function getGoogleCalendarEvents(startDate, endDate) {
    await this.ensureInitialized();
    try {
        const response = await this.calendar.events.list({
            calendarId: process.env.CALENDAR_ID,
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            singleEvents: true,
            orderBy: 'startTime'
        });

        return response.data.items.map(event => {
            const startDateTime = new Date(event.start.dateTime);
            return {
                googleEventId: event.id,
                clientName: event.summary.replace('Consulta médica - ', ''),
                date: startDateTime.toISOString().split('T')[0],
                time: startDateTime.toTimeString().split(':').slice(0, 2).join(':'),
                status: 'confirmed',
                description: event.description || ''
            };
        });
    } catch (error) {
        console.error('Error al obtener eventos de Google Calendar:', error);
        return [];
    }
}