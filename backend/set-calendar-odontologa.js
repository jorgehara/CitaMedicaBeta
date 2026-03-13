require('dotenv').config();
const mongoose = require('mongoose');
const Clinic = require('./src/models/clinic');

const CALENDAR_ID = '27c0d11107877380e2c2f2c8d51a56d15da9f4185c9cd91201d87da3f6b8573b@group.calendar.google.com';

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    const result = await Clinic.findOneAndUpdate(
        { slug: 'od-melinavillalba' },
        {
            $set: {
                'googleCalendar.calendarId': CALENDAR_ID,
                'googleCalendar.connected': true,
                'settings.appointmentLabel': 'Consulta odontológica'
            }
        },
        { new: true }
    );

    if (!result) {
        console.error('Clínica od-melinavillalba no encontrada');
        process.exit(1);
    }

    console.log('✅ Actualizado para:', result.name);
    console.log('   calendarId:', result.googleCalendar.calendarId);
    console.log('   appointmentLabel:', result.settings.appointmentLabel);

    await mongoose.disconnect();
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
