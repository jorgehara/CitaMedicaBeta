// EJECUTAR UNA SOLA VEZ: node create-clinic-odontologa.js
// Crea el Tenant #2 (Od. Melina Villalba) y su usuario admin.
// Prerrequisito: migrate-to-multitenant.js ya fue ejecutado.

require('dotenv').config();
const mongoose = require('mongoose');
const Clinic = require('./src/models/clinic');
const User = require('./src/models/user');

async function createClinic() {
  console.log('Conectando a MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Conectado\n');

  // Verificar que no exista ya
  const existing = await Clinic.findOne({ slug: 'od-melinavillalba' });
  if (existing) {
    console.log('ℹ️  Clinic #2 ya existe:', existing._id.toString());
    await mongoose.disconnect();
    return;
  }

  // Crear Tenant #2
  const clinic2 = await Clinic.create({
    slug: 'od-melinavillalba',
    name: 'Od. Melina Villalba',
    subdomain: 'od-melinavillalba',
    settings: {
      appointmentDuration: 30,
      businessHours: {
        morning:   { start: '09:00', end: '12:00', enabled: true },
        afternoon: { start: '15:00', end: '19:00', enabled: true }
      },
      sobreturnoHours: {
        morning:   { start: '12:00', end: '13:00', enabled: true },
        afternoon: { start: '19:00', end: '20:00', enabled: true }
      }
    },
    socialWorks: [
      'OSDE Dental',
      'Swiss Medical Dental',
      'OMINT',
      'Galeno Dental',
      'CONSULTA PARTICULAR',
      'Otras Obras Sociales'
    ],
    googleCalendar: {
      calendarId: null,           // completar cuando esté listo el Calendar
      credentialsPath: null,      // completar con la ruta en el VPS
      connected: false
    },
    chatbot: {
      webhookUrl: 'http://localhost:3009/api/notify-appointment',
      apiKey: null,               // completar con la API key del chatbot duplicado
      active: false               // activar cuando el chatbot esté corriendo
    }
  });

  console.log('✅ Clinic #2 creada:', clinic2._id.toString());

  // Crear usuario admin para la odontóloga
  // IMPORTANTE: el User model hashea la password automáticamente en pre-save
  const adminUser = await User.create({
    nombre: 'Od. Melina Villalba',
    email: 'admin@od-melinavillalba.micitamedica.me',
    password: 'CambiarEstaPassword123!',
    role: 'admin',
    clinicId: clinic2._id,
    activo: true
  });

  console.log('✅ Admin creado:', adminUser.email);
  console.log('\n⚠️  IMPORTANTE: Cambiar la password del admin en el primer login.');
  console.log('   Email:    admin@od-melinavillalba.micitamedica.me');
  console.log('   Password: CambiarEstaPassword123!');
  console.log('\n📋 Próximos pasos:');
  console.log('   1. Configurar Google Calendar y actualizar googleCalendar en la Clinic');
  console.log('   2. Duplicar ANITACHATBOT y actualizar chatbot.apiKey y chatbot.active');
  console.log('   3. Configurar Nginx para el subdominio');

  await mongoose.disconnect();
}

createClinic().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
