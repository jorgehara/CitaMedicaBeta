const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testAndSyncAppointments() {
    console.log('🔄 Probando conexión con el backend...\n');

    try {
        // 1. Verificar que el backend esté funcionando
        const healthCheck = await axios.get(`${API_BASE}/health`);
        console.log('✅ Backend funcionando:', healthCheck.data);

        // 2. Obtener todas las citas
        console.log('\n📋 Obteniendo todas las citas...');
        const appointmentsResponse = await axios.get(`${API_BASE}/appointments`);
        const appointments = appointmentsResponse.data;
        console.log(`📊 Total de citas encontradas: ${appointments.length}`);

        if (appointments.length > 0) {
            console.log('\n📝 Listado de citas:');
            appointments.forEach((apt, index) => {
                console.log(`${index + 1}. ${apt.clientName} - ${apt.date} ${apt.time} - Status: ${apt.status} - Google ID: ${apt.googleEventId ? '✅' : '❌'}`);
            });
        }

        // 3. Obtener todos los sobreturnos
        console.log('\n🔄 Obteniendo sobreturnos...');
        const sobreturnosResponse = await axios.get(`${API_BASE}/sobreturnos`);
        const sobreturnos = sobreturnosResponse.data;
        console.log(`📊 Total de sobreturnos encontrados: ${sobreturnos.length}`);

        if (sobreturnos.length > 0) {
            console.log('\n📝 Listado de sobreturnos:');
            sobreturnos.forEach((sbt, index) => {
                console.log(`${index + 1}. ${sbt.clientName} - ${sbt.date} ${sbt.time} - Status: ${sbt.status} - Google ID: ${sbt.googleEventId ? '✅' : '❌'}`);
            });
        }

        // 4. Resumen de sincronización con Google Calendar
        const allItems = [...appointments, ...sobreturnos];
        const withGoogleEvents = allItems.filter(item => item.googleEventId);
        const confirmedItems = allItems.filter(item => item.status === 'confirmed');

        console.log('\n📈 RESUMEN:');
        console.log(`📋 Total de citas: ${appointments.length}`);
        console.log(`🔄 Total de sobreturnos: ${sobreturnos.length}`);
        console.log(`✅ Items confirmados: ${confirmedItems.length}`);
        console.log(`📅 Items con Google Calendar: ${withGoogleEvents.length}`);

        if (confirmedItems.length > withGoogleEvents.length) {
            console.log(`\n⚠️  Hay ${confirmedItems.length - withGoogleEvents.length} items confirmados sin sincronizar con Google Calendar`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Detalles:', error.response.data);
        }
    }
}

testAndSyncAppointments();
