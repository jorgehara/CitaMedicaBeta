// EJECUTAR UNA SOLA VEZ en producción: node migrate-to-multitenant.js
// Crea el Tenant #1 (Dr. Kulinka) y asigna clinicId a todos los documentos existentes.
// Es seguro re-ejecutar: solo actualiza documentos con clinicId null.

require('dotenv').config();
const mongoose = require('mongoose');
const Clinic = require('./src/models/clinic');
const Appointment = require('./src/models/appointment');
const Sobreturno = require('./src/models/sobreturno');
const User = require('./src/models/user');

async function migrate() {
  console.log('Conectando a MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Conectado\n');

  // 1. Crear o encontrar Tenant #1
  let clinic1 = await Clinic.findOne({ slug: 'micitamedica' });
  if (!clinic1) {
    clinic1 = await Clinic.create({
      slug: 'micitamedica',
      name: 'Consultorio Dr. Kulinka',
      subdomain: null,
      googleCalendar: {
        calendarId: process.env.CALENDAR_ID || null,
        credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || null,
        connected: !!(process.env.CALENDAR_ID)
      },
      chatbot: {
        webhookUrl: 'http://localhost:3008/api/notify-appointment',
        apiKey: process.env.CHATBOT_API_KEY || null,
        active: !!(process.env.CHATBOT_API_KEY)
      }
    });
    console.log('✅ Clinic #1 creada:', clinic1._id.toString());
  } else {
    console.log('ℹ️  Clinic #1 ya existe:', clinic1._id.toString());
  }

  // 2. Asignar clinicId a todos los documentos sin clinicId
  const r1 = await Appointment.updateMany(
    { clinicId: null },
    { $set: { clinicId: clinic1._id } }
  );
  const r2 = await Sobreturno.updateMany(
    { clinicId: null },
    { $set: { clinicId: clinic1._id } }
  );
  const r3 = await User.updateMany(
    { clinicId: null },
    { $set: { clinicId: clinic1._id } }
  );

  console.log(`\n📋 Migración completada:`);
  console.log(`   Appointments migrados:  ${r1.modifiedCount}`);
  console.log(`   Sobreturnos migrados:   ${r2.modifiedCount}`);
  console.log(`   Usuarios migrados:      ${r3.modifiedCount}`);
  console.log(`\n✅ Cliente actual (micitamedica.me) intacto. Ningún comportamiento cambia.`);

  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('❌ Error en migración:', err);
  process.exit(1);
});
