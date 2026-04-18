// EJECUTAR UNA SOLA VEZ en el VPS: node create-clinic-drjorgehara.js
// Crea el Tenant #3 (Dr. Jorge Hara) y su usuario admin.
// Prerrequisito: migrate-to-multitenant.js y create-clinic-odontologa.js ya fueron ejecutados.

require('dotenv').config();
const mongoose = require('mongoose');
const Clinic = require('./src/models/clinic');
const User = require('./src/models/user');

async function createClinic() {
  console.log('Conectando a MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Conectado\n');

  // Verificar que no exista ya
  const existing = await Clinic.findOne({ slug: 'dr-jorgehara' });
  if (existing) {
    console.log('ℹ️  Clinic dr-jorgehara ya existe:', existing._id.toString());
    console.log('   chatbot.apiKey:', existing.chatbot?.apiKey || '(no seteada)');
    console.log('   googleCalendar.calendarId:', existing.googleCalendar?.calendarId || '(no seteada)');
    await mongoose.disconnect();
    return;
  }

  // Crear Tenant #3 — Dr. Jorge Hara
  const clinic = await Clinic.create({
    slug: 'dr-jorgehara',
    name: 'Dr. Jorge Hara',
    subdomain: 'dr-jorgehara',   // debe coincidir con TENANT_SUBDOMAIN en el .env del chatbot
    settings: {
      appointmentDuration: 30,
      workingDays: [1, 2, 3, 4, 5], // Lunes a Viernes (0=Dom, 6=Sáb)
      businessHours: {
        morning:   { start: '08:00', end: '12:00', enabled: true },
        afternoon: { start: '14:00', end: '18:00', enabled: true }
      },
      sobreturnoHours: {
        morning:   { start: '11:00', end: '12:15', enabled: true },
        afternoon: { start: '19:00', end: '20:15', enabled: true }
      },
      appointmentLabel: 'Consulta médica',
    },
    socialWorks: [
      'INSSSEP',
      'Swiss Medical',
      'OSDE',
      'Galeno',
      'CONSULTA PARTICULAR',
      'Otras Obras Sociales'
    ],
    googleCalendar: {
      calendarId: '701534e166df3c40c105a8d7f31bc845da6bae8f661e02b50f33c06618b240a4@group.calendar.google.com',
      credentialsPath: './google.json',  // ruta relativa en el VPS donde corre el chatbot
      connected: true
    },
    chatbot: {
      webhookUrl: null,
      apiKey: null,    // ← COMPLETAR luego con la API key del chatbot y actualizar en .env
      active: false    // ← activar cuando el chatbot esté corriendo y conectado
    },
    active: true
  });

  console.log('✅ Clinic dr-jorgehara creada:', clinic._id.toString());

  // Crear usuario admin para el Dr. Jorge Hara
  // IMPORTANTE: el User model hashea la password automáticamente en pre-save
  const adminUser = await User.create({
    nombre: 'Dr. Jorge Hara',
    email: 'admin@dr-jorgehara.micitamedica.me',
    password: 'CambiarEstaPassword123!',
    role: 'admin',
    clinicId: clinic._id,
    activo: true
  });

  console.log('✅ Admin creado:', adminUser.email);

  console.log('\n📋 PRÓXIMOS PASOS OBLIGATORIOS:');
  console.log('');
  console.log('1. Generar API key para el chatbot y actualizar en MongoDB:');
  console.log('   mongosh micitamedica --eval "db.clinics.updateOne(');
  console.log('     { slug: \'dr-jorgehara\' },');
  console.log('     { $set: { \'chatbot.apiKey\': \'TU_API_KEY_AQUI\', \'chatbot.active\': true } }');
  console.log('   )"');
  console.log('');
  console.log('2. Copiar la misma API key al .env del chatbot:');
  console.log('   CHATBOT_API_KEY=TU_API_KEY_AQUI');
  console.log('');
  console.log('3. Verificar conectividad del tenant:');
  console.log('   curl -H "X-Tenant-Subdomain: dr-jorgehara" \\');
  console.log('        -H "X-API-Key: TU_API_KEY_AQUI" \\');
  console.log('        https://micitamedica.me/api/clinic/config');
  console.log('');
  console.log('4. Cambiar la password del admin en el primer login:');
  console.log('   Email:    admin@dr-jorgehara.micitamedica.me');
  console.log('   Password: CambiarEstaPassword123!');
  console.log('');
  console.log('5. Iniciar el chatbot con PM2:');
  console.log('   pm2 start dist/app.js --name chatbot-drjorgehara && pm2 save');

  await mongoose.disconnect();
}

createClinic().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
