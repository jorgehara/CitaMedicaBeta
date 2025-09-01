const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function detailedAppointmentAnalysis() {
    console.log('🔍 Análisis detallado de citas...\n');

    try {
        // Obtener todas las citas
        const appointmentsResponse = await axios.get(`${API_BASE}/appointments`);
        const appointments = appointmentsResponse.data;
        
        console.log('📋 CITAS NORMALES:');
        appointments.forEach((apt, index) => {
            console.log(`${index + 1}. ${JSON.stringify({
                _id: apt._id,
                clientName: apt.clientName,
                date: apt.date,
                time: apt.time,
                status: apt.status,
                isSobreturno: apt.isSobreturno,
                googleEventId: apt.googleEventId
            }, null, 2)}`);
        });

        // Obtener sobreturnos
        const sobreturnosResponse = await axios.get(`${API_BASE}/sobreturnos`);
        const sobreturnos = sobreturnosResponse.data;
        
        console.log('\n🔄 SOBRETURNOS:');
        sobreturnos.forEach((sbt, index) => {
            console.log(`${index + 1}. ${JSON.stringify({
                _id: sbt._id,
                clientName: sbt.clientName,
                date: sbt.date,
                time: sbt.time,
                status: sbt.status,
                isSobreturno: sbt.isSobreturno,
                googleEventId: sbt.googleEventId
            }, null, 2)}`);
        });

        // Verificar fecha de hoy
        const today = new Date().toISOString().split('T')[0];
        console.log(`\n📅 Fecha de hoy: ${today}`);
        
        const appointmentsToday = appointments.filter(apt => apt.date === today);
        const sobreturnosToday = sobreturnos.filter(sbt => sbt.date === today);
        
        console.log(`📊 Citas para hoy: ${appointmentsToday.length}`);
        console.log(`📊 Sobreturnos para hoy: ${sobreturnosToday.length}`);

        // Verificar si las citas normales tienen isSobreturno definido
        const citasNormalesHoy = appointmentsToday.filter(apt => !apt.isSobreturno);
        console.log(`✅ Citas normales (no sobreturnos) para hoy: ${citasNormalesHoy.length}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

detailedAppointmentAnalysis();
