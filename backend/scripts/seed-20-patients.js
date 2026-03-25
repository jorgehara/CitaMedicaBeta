/**
 * Script para crear 20 pacientes de PRUEBA con historias clínicas
 * Uso: node scripts/seed-20-patients.js
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
    firstName: 'Roberto',
    lastName: 'Sánchez',
    dni: '20123456',
    birthDate: new Date('1980-05-10'),
    gender: 'M',
    phone: '+5491123456789',
    email: 'roberto.sanchez@test.com',
    address: 'Corrientes 1500, CABA',
    socialWork: 'OSDE',
    allergies: 'Ninguna',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Laura',
    lastName: 'Díaz',
    dni: '21234567',
    birthDate: new Date('1992-08-25'),
    gender: 'F',
    phone: '+5491134567890',
    email: 'laura.diaz@test.com',
    address: 'Santa Fe 2300, Buenos Aires',
    socialWork: 'Swiss Medical',
    allergies: 'Penicilina',
    chronicDiseases: 'Asma',
    currentMedications: 'Salbutamol',
  },
  {
    firstName: 'Diego',
    lastName: 'Torres',
    dni: '22345678',
    birthDate: new Date('1975-12-03'),
    gender: 'M',
    phone: '+5491145678901',
    email: 'diego.torres@test.com',
    address: 'Callao 800, Recoleta',
    socialWork: 'Galeno',
    allergies: '',
    chronicDiseases: 'Hipertensión',
    currentMedications: 'Losartán 50mg',
  },
  {
    firstName: 'Claudia',
    lastName: 'Morales',
    dni: '23456789',
    birthDate: new Date('1988-04-15'),
    gender: 'F',
    phone: '+5491156789012',
    email: 'claudia.morales@test.com',
    address: 'Lavalle 1200, Centro',
    socialWork: 'INSSSEP',
    allergies: 'Sulfa',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Martín',
    lastName: 'Ramírez',
    dni: '24567890',
    birthDate: new Date('1983-11-20'),
    gender: 'M',
    phone: '+5491167890123',
    email: 'martin.ramirez@test.com',
    address: 'Pueyrredón 1500, Belgrano',
    socialWork: 'CONSULTA PARTICULAR',
    allergies: '',
    chronicDiseases: 'Diabetes tipo 1',
    currentMedications: 'Insulina',
  },
  {
    firstName: 'Silvia',
    lastName: 'Castro',
    dni: '25678901',
    birthDate: new Date('1990-02-14'),
    gender: 'F',
    phone: '+5491178901234',
    email: 'silvia.castro@test.com',
    address: 'Acoyte 900, Caballito',
    socialWork: 'OSDE',
    allergies: 'Aspirina',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Fernando',
    lastName: 'Ruiz',
    dni: '26789012',
    birthDate: new Date('1977-09-08'),
    gender: 'M',
    phone: '+5491189012345',
    email: 'fernando.ruiz@test.com',
    address: 'Rivadavia 5000, Flores',
    socialWork: 'Swiss Medical',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Patricia',
    lastName: 'Vega',
    dni: '27890123',
    birthDate: new Date('1985-06-30'),
    gender: 'F',
    phone: '+5491190123456',
    email: 'patricia.vega@test.com',
    address: 'Jujuy 800, San Telmo',
    socialWork: 'Galeno',
    allergies: 'Ninguna',
    chronicDiseases: 'Hipotiroidismo',
    currentMedications: 'Levotiroxina',
  },
  {
    firstName: 'Gustavo',
    lastName: 'Méndez',
    dni: '28901234',
    birthDate: new Date('1981-03-22'),
    gender: 'M',
    phone: '+5491101234567',
    email: 'gustavo.mendez@test.com',
    address: 'Cabildo 2500, Núñez',
    socialWork: 'INSSSEP',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Mónica',
    lastName: 'Silva',
    dni: '29012345',
    birthDate: new Date('1993-07-17'),
    gender: 'F',
    phone: '+5491112345670',
    email: 'monica.silva@test.com',
    address: 'Directorio 1800, Parque Chacabuco',
    socialWork: 'CONSULTA PARTICULAR',
    allergies: 'Penicilina, Sulfa',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Alejandro',
    lastName: 'Rojas',
    dni: '30123456',
    birthDate: new Date('1979-10-05'),
    gender: 'M',
    phone: '+5491123456781',
    email: 'alejandro.rojas@test.com',
    address: 'Monroe 3000, Belgrano',
    socialWork: 'OSDE',
    allergies: '',
    chronicDiseases: 'Hipertensión, Colesterol alto',
    currentMedications: 'Enalapril, Atorvastatina',
  },
  {
    firstName: 'Valeria',
    lastName: 'Ortiz',
    dni: '31234567',
    birthDate: new Date('1987-01-28'),
    gender: 'F',
    phone: '+5491134567892',
    email: 'valeria.ortiz@test.com',
    address: 'Scalabrini Ortiz 1200, Palermo',
    socialWork: 'Swiss Medical',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Ricardo',
    lastName: 'Herrera',
    dni: '32345678',
    birthDate: new Date('1976-12-11'),
    gender: 'M',
    phone: '+5491145678903',
    email: 'ricardo.herrera@test.com',
    address: 'Warnes 2000, Villa Crespo',
    socialWork: 'Galeno',
    allergies: 'Aspirina',
    chronicDiseases: 'Artritis',
    currentMedications: 'Ibuprofeno',
  },
  {
    firstName: 'Gabriela',
    lastName: 'Flores',
    dni: '33456789',
    birthDate: new Date('1991-05-19'),
    gender: 'F',
    phone: '+5491156789014',
    email: 'gabriela.flores@test.com',
    address: 'Córdoba 3500, Almagro',
    socialWork: 'INSSSEP',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Pablo',
    lastName: 'Navarro',
    dni: '34567890',
    birthDate: new Date('1984-08-07'),
    gender: 'M',
    phone: '+5491167890125',
    email: 'pablo.navarro@test.com',
    address: 'Las Heras 2800, Recoleta',
    socialWork: 'CONSULTA PARTICULAR',
    allergies: 'Ninguna',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Andrea',
    lastName: 'Giménez',
    dni: '35678901',
    birthDate: new Date('1989-11-24'),
    gender: 'F',
    phone: '+5491178901236',
    email: 'andrea.gimenez@test.com',
    address: 'Caseros 1500, Boedo',
    socialWork: 'OSDE',
    allergies: '',
    chronicDiseases: 'Migraña crónica',
    currentMedications: 'Topiramato',
  },
  {
    firstName: 'Sebastián',
    lastName: 'Luna',
    dni: '36789012',
    birthDate: new Date('1982-04-02'),
    gender: 'M',
    phone: '+5491189012347',
    email: 'sebastian.luna@test.com',
    address: 'Federico Lacroze 2200, Colegiales',
    socialWork: 'Swiss Medical',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Carolina',
    lastName: 'Benítez',
    dni: '37890123',
    birthDate: new Date('1994-09-16'),
    gender: 'F',
    phone: '+5491190123458',
    email: 'carolina.benitez@test.com',
    address: 'Juan B. Justo 4500, Palermo',
    socialWork: 'Galeno',
    allergies: 'Penicilina',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Marcelo',
    lastName: 'Acosta',
    dni: '38901234',
    birthDate: new Date('1978-06-13'),
    gender: 'M',
    phone: '+5491101234569',
    email: 'marcelo.acosta@test.com',
    address: 'Constitución 1800, San Cristóbal',
    socialWork: 'INSSSEP',
    allergies: '',
    chronicDiseases: 'EPOC',
    currentMedications: 'Broncodilatadores',
  },
  {
    firstName: 'Natalia',
    lastName: 'Paz',
    dni: '39012345',
    birthDate: new Date('1986-02-09'),
    gender: 'F',
    phone: '+5491112345682',
    email: 'natalia.paz@test.com',
    address: 'Defensa 900, San Telmo',
    socialWork: 'CONSULTA PARTICULAR',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  },
];

// Historias clínicas variadas (pool de opciones)
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

// Seguimientos variados (pool de opciones)
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

async function seed20Patients() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB\n');

    // Obtener clínica principal
    const clinic = await Clinic.findOne({ slug: 'micitamedica' });
    if (!clinic) {
      console.error('✗ No se encontró la clínica micitamedica. Ejecutá seed-dev.js primero.');
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

    console.log('=== CREANDO 20 PACIENTES DE PRUEBA ===\n');

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
        // Seleccionar historia clínica aleatoria del pool
        const historyTemplate = clinicalHistoriesPool[Math.floor(Math.random() * clinicalHistoriesPool.length)];

        // Fecha de consulta progresiva (más antiguas primero)
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

        // Agregar seguimientos a algunas historias (50% probabilidad)
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
    console.log('\n✓ Seed de 20 pacientes completado exitosamente!');

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Conexión cerrada.');
    process.exit(0);
  }
}

seed20Patients();
