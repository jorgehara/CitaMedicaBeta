/**
 * Script para crear 20 pacientes de PRUEBA para Od. Melina Villalba
 * Uso: node scripts/seed-od-melinavillalba.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Patient = require('../src/models/patient');
const ClinicalHistory = require('../src/models/clinicalHistory');
const FollowUp = require('../src/models/followUp');
const Clinic = require('../src/models/clinic');

// 20 pacientes con datos variados
const testPatients = [
  {
    firstName: 'Sofía',
    lastName: 'Álvarez',
    dni: '40123456',
    birthDate: new Date('1996-03-10'),
    gender: 'F',
    phone: '+5491123456700',
    email: 'sofia.alvarez@test.com',
    address: 'Av. Cabildo 1500, Belgrano',
    socialWork: 'OSDE',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Lucas',
    lastName: 'Domínguez',
    dni: '41234567',
    birthDate: new Date('1994-08-22'),
    gender: 'M',
    phone: '+5491134567801',
    email: 'lucas.dominguez@test.com',
    address: 'Thames 2100, Palermo',
    socialWork: 'Swiss Medical',
    allergies: 'Penicilina',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Camila',
    lastName: 'Fernández',
    dni: '42345678',
    birthDate: new Date('1991-05-15'),
    gender: 'F',
    phone: '+5491145678902',
    email: 'camila.fernandez@test.com',
    address: 'Las Heras 3200, Recoleta',
    socialWork: 'Galeno',
    allergies: '',
    chronicDiseases: 'Asma leve',
    currentMedications: 'Salbutamol PRN',
  },
  {
    firstName: 'Joaquín',
    lastName: 'Miranda',
    dni: '43456789',
    birthDate: new Date('1987-11-30'),
    gender: 'M',
    phone: '+5491156789003',
    email: 'joaquin.miranda@test.com',
    address: 'Av. Santa Fe 4500, Palermo',
    socialWork: 'INSSSEP',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Florencia',
    lastName: 'Castro',
    dni: '44567890',
    birthDate: new Date('1993-02-18'),
    gender: 'F',
    phone: '+5491167890104',
    email: 'florencia.castro@test.com',
    address: 'Av. Rivadavia 6000, Caballito',
    socialWork: 'CONSULTA PARTICULAR',
    allergies: 'Sulfa',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Matías',
    lastName: 'Romero',
    dni: '45678901',
    birthDate: new Date('1989-07-25'),
    gender: 'M',
    phone: '+5491178901205',
    email: 'matias.romero@test.com',
    address: 'Corrientes 5500, Almagro',
    socialWork: 'OSDE',
    allergies: '',
    chronicDiseases: 'Hipertensión',
    currentMedications: 'Enalapril 10mg',
  },
  {
    firstName: 'Agustina',
    lastName: 'Molina',
    dni: '46789012',
    birthDate: new Date('1995-12-08'),
    gender: 'F',
    phone: '+5491189012306',
    email: 'agustina.molina@test.com',
    address: 'Av. Córdoba 2800, Once',
    socialWork: 'Swiss Medical',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Nicolás',
    lastName: 'Ríos',
    dni: '47890123',
    birthDate: new Date('1990-04-12'),
    gender: 'M',
    phone: '+5491190123407',
    email: 'nicolas.rios@test.com',
    address: 'Scalabrini Ortiz 800, Villa Crespo',
    socialWork: 'Galeno',
    allergies: 'Aspirina',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Julieta',
    lastName: 'Suárez',
    dni: '48901234',
    birthDate: new Date('1992-09-20'),
    gender: 'F',
    phone: '+5491101234508',
    email: 'julieta.suarez@test.com',
    address: 'Av. Libertador 5500, Núñez',
    socialWork: 'INSSSEP',
    allergies: '',
    chronicDiseases: 'Diabetes tipo 2',
    currentMedications: 'Metformina 850mg',
  },
  {
    firstName: 'Tomás',
    lastName: 'Pereyra',
    dni: '49012345',
    birthDate: new Date('1988-01-17'),
    gender: 'M',
    phone: '+5491112345609',
    email: 'tomas.pereyra@test.com',
    address: 'Av. del Libertador 2200, Vicente López',
    socialWork: 'CONSULTA PARTICULAR',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Micaela',
    lastName: 'Cabrera',
    dni: '50123456',
    birthDate: new Date('1994-06-28'),
    gender: 'F',
    phone: '+5491123456710',
    email: 'micaela.cabrera@test.com',
    address: 'Monroe 2800, Belgrano',
    socialWork: 'OSDE',
    allergies: 'Penicilina, Sulfa',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Facundo',
    lastName: 'Moreno',
    dni: '51234567',
    birthDate: new Date('1986-10-05'),
    gender: 'M',
    phone: '+5491134567811',
    email: 'facundo.moreno@test.com',
    address: 'Av. Pueyrredón 1800, Recoleta',
    socialWork: 'Swiss Medical',
    allergies: '',
    chronicDiseases: 'Colesterol alto',
    currentMedications: 'Atorvastatina 20mg',
  },
  {
    firstName: 'Valentina',
    lastName: 'Guzmán',
    dni: '52345678',
    birthDate: new Date('1997-03-14'),
    gender: 'F',
    phone: '+5491145678912',
    email: 'valentina.guzman@test.com',
    address: 'Av. Callao 1200, Recoleta',
    socialWork: 'Galeno',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Santiago',
    lastName: 'Vázquez',
    dni: '53456789',
    birthDate: new Date('1991-08-09'),
    gender: 'M',
    phone: '+5491156789013',
    email: 'santiago.vazquez@test.com',
    address: 'Av. Juan B. Justo 3500, Palermo',
    socialWork: 'INSSSEP',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Martina',
    lastName: 'Sosa',
    dni: '54567890',
    birthDate: new Date('1993-11-22'),
    gender: 'F',
    phone: '+5491167890114',
    email: 'martina.sosa@test.com',
    address: 'Av. Córdoba 5200, Chacarita',
    socialWork: 'CONSULTA PARTICULAR',
    allergies: '',
    chronicDiseases: 'Hipotiroidismo',
    currentMedications: 'Levotiroxina 75mcg',
  },
  {
    firstName: 'Ignacio',
    lastName: 'López',
    dni: '55678901',
    birthDate: new Date('1989-04-16'),
    gender: 'M',
    phone: '+5491178901215',
    email: 'ignacio.lopez@test.com',
    address: 'Av. Forest 1500, Chacarita',
    socialWork: 'OSDE',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Candela',
    lastName: 'Vargas',
    dni: '56789012',
    birthDate: new Date('1995-07-11'),
    gender: 'F',
    phone: '+5491189012316',
    email: 'candela.vargas@test.com',
    address: 'Av. Dorrego 2200, Colegiales',
    socialWork: 'Swiss Medical',
    allergies: 'Aspirina',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Bautista',
    lastName: 'Acosta',
    dni: '57890123',
    birthDate: new Date('1990-12-03'),
    gender: 'M',
    phone: '+5491190123417',
    email: 'bautista.acosta@test.com',
    address: 'Av. Triunvirato 3800, Villa Urquiza',
    socialWork: 'Galeno',
    allergies: '',
    chronicDiseases: 'Asma',
    currentMedications: 'Fluticasona inhalada',
  },
  {
    firstName: 'Catalina',
    lastName: 'Paz',
    dni: '58901234',
    birthDate: new Date('1992-05-27'),
    gender: 'F',
    phone: '+5491101234518',
    email: 'catalina.paz@test.com',
    address: 'Av. Elcano 3200, Belgrano',
    socialWork: 'INSSSEP',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Thiago',
    lastName: 'Benítez',
    dni: '59012345',
    birthDate: new Date('1996-09-19'),
    gender: 'M',
    phone: '+5491112345619',
    email: 'thiago.benitez@test.com',
    address: 'Av. Crámer 1800, Belgrano',
    socialWork: 'CONSULTA PARTICULAR',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  },
];

// Pool de historias clínicas (mismas que antes)
const clinicalHistoriesPool = [
  {
    chiefComplaint: 'Dolor en ATM derecha',
    currentIllness: 'Paciente refiere dolor articular derecho hace 3 meses, relacionado con estrés laboral.',
    diagnosis: {
      primary: 'Disfunción temporomandibular derecha',
      secondary: ['Bruxismo nocturno']
    },
    helkimoIndex: { ai: { score: 8 }, di: { score: 12 } },
    treatmentPlan: { description: 'Placa de estabilización nocturna, fisioterapia ATM, control en 30 días' }
  },
  {
    chiefComplaint: 'Bruxismo severo',
    currentIllness: 'Paciente refiere rechinado nocturno con desgaste dental severo. Cefaleas matutinas frecuentes.',
    diagnosis: {
      primary: 'Bruxismo activo severo',
      secondary: ['Desgaste dental', 'Cefalea tensional']
    },
    helkimoIndex: { ai: { score: 15 }, di: { score: 18 } },
    treatmentPlan: { description: 'Placa Michigan, derivación a psicología por estrés, control semanal' }
  },
  {
    chiefComplaint: 'Chasquidos en ATM al abrir boca',
    currentIllness: 'Ruidos articulares bilaterales desde hace 6 meses, sin dolor asociado.',
    diagnosis: {
      primary: 'Desplazamiento discal con reducción bilateral',
      secondary: []
    },
    helkimoIndex: { ai: { score: 3 }, di: { score: 8 } },
    treatmentPlan: { description: 'Ejercicios de movilidad mandibular, placa de reposicionamiento, control en 60 días' }
  },
  {
    chiefComplaint: 'Dolor facial difuso',
    currentIllness: 'Dolor en región maxilar y temporal desde hace 2 meses, empeora al masticar.',
    diagnosis: {
      primary: 'Síndrome de dolor miofascial',
      secondary: ['Bruxismo', 'Tensión muscular cervical']
    },
    helkimoIndex: { ai: { score: 10 }, di: { score: 14 } },
    treatmentPlan: { description: 'Placa blanda, kinesioterapia, relajantes musculares, control en 15 días' }
  },
  {
    chiefComplaint: 'Limitación de apertura bucal',
    currentIllness: 'Apertura bucal reducida a 25mm desde hace 1 mes, post trauma mandibular.',
    diagnosis: {
      primary: 'Trismo post-traumático',
      secondary: ['Contractura muscular']
    },
    helkimoIndex: { ai: { score: 12 }, di: { score: 20 } },
    treatmentPlan: { description: 'Ejercicios de estiramiento progresivo, termoterapia, control cada 7 días' }
  },
  {
    chiefComplaint: 'Control de rutina ATM',
    currentIllness: 'Paciente asintomático, control preventivo.',
    diagnosis: {
      primary: 'Sin hallazgos patológicos',
      secondary: []
    },
    helkimoIndex: { ai: { score: 0 }, di: { score: 0 } },
    treatmentPlan: { description: 'Control semestral, higiene postural, técnicas de relajación' }
  },
  {
    chiefComplaint: 'Dolor ATM bilateral',
    currentIllness: 'Dolor bilateral intenso desde hace 1 semana, relacionado con episodio de ansiedad.',
    diagnosis: {
      primary: 'Artralgia temporomandibular bilateral',
      secondary: ['Trastorno de ansiedad']
    },
    helkimoIndex: { ai: { score: 14 }, di: { score: 16 } },
    treatmentPlan: { description: 'Placa de estabilización, antiinflamatorios, derivación a psiquiatría, control en 7 días' }
  },
  {
    chiefComplaint: 'Luxación ATM recurrente',
    currentIllness: 'Episodios de luxación mandibular al bostezar, desde hace 3 meses.',
    diagnosis: {
      primary: 'Luxación recurrente de ATM',
      secondary: ['Hiperlaxitud ligamentaria']
    },
    helkimoIndex: { ai: { score: 6 }, di: { score: 18 } },
    treatmentPlan: { description: 'Vendaje restrictivo, ejercicios de fortalecimiento, evaluación quirúrgica' }
  },
  {
    chiefComplaint: 'Seguimiento post-tratamiento',
    currentIllness: 'Control evolutivo tras 3 meses de uso de placa. Mejora del 70%.',
    diagnosis: {
      primary: 'Evolución favorable',
      secondary: []
    },
    helkimoIndex: { ai: { score: 2 }, di: { score: 4 } },
    treatmentPlan: { description: 'Continuar con placa, control en 90 días' }
  },
  {
    chiefComplaint: 'Dolor ATM izquierda y cervicalgia',
    currentIllness: 'Dolor unilateral izquierdo con irradiación cervical desde hace 4 meses.',
    diagnosis: {
      primary: 'DTM con componente cervical',
      secondary: ['Cervicalgia tensional', 'Bruxismo']
    },
    helkimoIndex: { ai: { score: 11 }, di: { score: 15 } },
    treatmentPlan: { description: 'Placa de estabilización, kinesio cervical, control en 21 días' }
  },
];

// Pool de seguimientos
const followUpsPool = [
  {
    evolution: 'Paciente refiere mejora significativa. Dolor redujo de 8/10 a 3/10.',
    symptomsUpdate: { status: 'improved', painLevel: 3, notes: 'Mejor tolerancia a la masticación' }
  },
  {
    evolution: 'Sin cambios. Persiste dolor al despertar. Placa ajustada.',
    symptomsUpdate: { status: 'stable', painLevel: 7, notes: 'Continúa bruxismo nocturno' }
  },
  {
    evolution: 'Empeoramiento. Dolor aumentó a 9/10. Se indica medicación.',
    symptomsUpdate: { status: 'worsened', painLevel: 9, notes: 'Posible episodio agudo' }
  },
  {
    evolution: 'Evolución favorable. Sin dolor. Alta terapéutica.',
    symptomsUpdate: { status: 'resolved', painLevel: 0, notes: 'Paciente asintomático' }
  },
  {
    evolution: 'Mejora parcial. Dolor leve ocasional. Continuar tratamiento.',
    symptomsUpdate: { status: 'improved', painLevel: 2, notes: 'Solo molestias con alimentos duros' }
  },
];

async function seedOdMelina() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB\n');

    // Obtener clínica Od. Melina Villalba
    const clinic = await Clinic.findOne({ slug: 'od-melinavillalba' });
    if (!clinic) {
      console.error('✗ No se encontró la clínica od-melinavillalba. Ejecutá seed-dev.js primero.');
      process.exit(1);
    }
    console.log(`✓ Clínica: ${clinic.name}\n`);

    // Obtener el último número clínico
    const lastPatient = await Patient.findOne().sort({ clinicNumber: -1 });
    console.log(`→ Ultimo paciente global: ${lastPatient?.clinicNumber || 'ninguno'}`);
    let clinicCounter = 1;
    if (lastPatient && lastPatient.clinicNumber) {
      const match = lastPatient.clinicNumber.match(/PAC-(\d+)/);
      if (match) {
        clinicCounter = parseInt(match[1], 10) + 1;
      }
    }
    console.log(`→ Iniciando desde: PAC-${String(clinicCounter).padStart(4, '0')}\n`);

    console.log('=== CREANDO 20 PACIENTES PARA OD. MELINA VILLALBA ===\n');

    let totalHistories = 0;
    let totalFollowUps = 0;

    for (const patientData of testPatients) {
      // Generar número de clínica
      const clinicNumber = `PAC-${String(clinicCounter).padStart(4, '0')}`;
      clinicCounter++;

      const patient = new Patient({
        ...patientData,
        clinic: clinic._id,
        clinicNumber,
        activo: true
      });

      await patient.save();
      console.log(`✓ Paciente: ${patient.firstName} ${patient.lastName} (${clinicNumber})`);

      // Generar entre 1 y 4 historias clínicas por paciente
      const numHistories = Math.floor(Math.random() * 4) + 1;

      for (let i = 0; i < numHistories; i++) {
        const historyTemplate = clinicalHistoriesPool[Math.floor(Math.random() * clinicalHistoriesPool.length)];

        const consultationDate = new Date();
        consultationDate.setMonth(consultationDate.getMonth() - (numHistories - i));

        const history = new ClinicalHistory({
          ...historyTemplate,
          patient: patient._id,
          clinic: clinic._id,
          consultationDate: consultationDate,
          createdAt: consultationDate,
          updatedAt: consultationDate
        });

        await history.save();
        totalHistories++;
        console.log(`  └─ Historia #${i + 1}: ${historyTemplate.chiefComplaint}`);

        // Agregar seguimientos
        if (Math.random() > 0.5 && i > 0) {
          const numFollowUps = Math.floor(Math.random() * 3) + 1;
          
          for (let f = 0; f < numFollowUps; f++) {
            const followUpTemplate = followUpsPool[Math.floor(Math.random() * followUpsPool.length)];
            
            const followUpDate = new Date(consultationDate);
            followUpDate.setDate(followUpDate.getDate() + (f * 14) + 7);

            const followUp = new FollowUp({
              ...followUpTemplate,
              clinicalHistory: history._id,
              patient: patient._id,
              clinic: clinic._id,
              date: followUpDate,
              createdAt: followUpDate,
              updatedAt: followUpDate
            });

            await followUp.save();
            totalFollowUps++;
            console.log(`      └─ Seguimiento: ${followUpDate.toLocaleDateString('es-AR')}`);
          }
        }
      }

      console.log('');
    }

    console.log('=== RESUMEN ===');
    console.log(`Total pacientes creados: ${testPatients.length}`);
    console.log(`Total historias clínicas: ${totalHistories}`);
    console.log(`Total seguimientos: ${totalFollowUps}`);
    console.log('\n✓ Seed de 20 pacientes para Od. Melina Villalba completado!');

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Conexión cerrada.');
    process.exit(0);
  }
}

seedOdMelina();
