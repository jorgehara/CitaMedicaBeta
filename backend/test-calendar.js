const googleCalendarService = require('./src/services/googleCalendarService');

async function testGoogleCalendar() {
    console.log('🔍 Probando conexión con Google Calendar...');
    
    try {
        const result = await googleCalendarService.testConnection();
        console.log('✅ Conexión exitosa:', result);
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
    
    // Probar creación de evento de prueba
    console.log('\n🔍 Probando creación de evento...');
    
    const testAppointment = {
        clientName: "Paciente de Prueba",
        socialWork: "INSSSEP",
        phone: "5491168690066",
        email: "test@example.com",
        date: "2025-09-02",
        time: "10:00",
        status: "confirmed"
    };
    
    try {
        const eventId = await googleCalendarService.createCalendarEvent(testAppointment);
        console.log('✅ Evento creado exitosamente con ID:', eventId);
    } catch (error) {
        console.error('❌ Error al crear evento:', error.message);
    }
}

testGoogleCalendar();
