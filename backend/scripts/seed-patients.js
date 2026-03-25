/**
 * Script para crear pacientes de PRUEBA con historias clínicas
 * Uso: node scripts/seed-patients.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Patient = require('../src/models/patient');
const ClinicalHistory = require('../src/models/clinicalHistory');
const FollowUp = require('../src/models/followUp');
const Clinic = require('../src/models/clinic');

const testPatients = [
  {
    firstName: 'Juan',
    lastName: 'Pérez',
    dni: '12345678',
    birthDate: new Date('1985-03-15'),
    gender: 'M',
    phone: '+5491112345678',
    email: 'juan.perez@test.com',
    address: 'Av. Rivadavia 1234, CABA',
    socialWork: 'Swiss Medical',
    allergies: 'Penicilina',
    chronicDiseases: 'Hipertensión',
    currentMedications: 'Enalapril 10mg',
  },
  {
    firstName: 'María',
    lastName: 'González',
    dni: '23456789',
    birthDate: new Date('1990-07-22'),
    gender: 'F',
    phone: '+5491198765432',
    email: 'maria.gonzalez@test.com',
    address: 'Calle Mitre 567, Buenos Aires',
    socialWork: 'OSDE',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    dni: '34567890',
    birthDate: new Date('1978-11-08'),
    gender: 'M',
    phone: '+5491165432109',
    email: 'carlos.rodriguez@test.com',
    address: 'Belgrano 890, Capital Federal',
    socialWork: 'CONSULTA PARTICULAR',
    allergies: 'Aspirina',
    chronicDiseases: 'Diabetes tipo 2',
    currentMedications: 'Metformina 500mg',
  },
  {
    firstName: 'Ana',
    lastName: 'Martínez',
    dni: '45678901',
    birthDate: new Date('1995-01-30'),
    gender: 'F',
    phone: '+5491156789012',
    email: 'ana.martinez@test.com',
    address: 'Santa Fe 1234, Palermo',
    socialWork: 'Galeno',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  },
  {
    firstName: 'Luis',
    lastName: 'Fernández',
    dni: '56789012',
    birthDate: new Date('1982-09-12'),
    gender: 'M',
    phone: '+5491145678901',
    email: 'luis.fernandez@test.com',
    address: 'Corrientes 4567, CABA',
    socialWork: 'INSSSEP',
    allergies: 'Sulfa',
    chronicDiseases: '',
    currentMedications: '',
  }
];

// Historias clínicas de ejemplo (campos mínimos para evitar errores de validación)
const clinicalHistoriesData = [
  // Juan Pérez - 3 visitas
  {
    chiefComplaint: 'Dolor en ATM derecha',
    currentIllness: 'Paciente refere dolor articular derecho hace 3 meses, relacionado con estrés.',
    diagnosis: {
      primary: 'Disfunción temporomandibular derecha',
      secondary: ['Bruxismo']
    },
    helkimoIndex: {
      ai: { score: 8 },
      di: { score: 12 }
    },
    treatmentPlan: {
      description: 'Placa de estabilización nocturno, fisioterapia, control en 30 días'
    }
  },
  {
    chiefComplaint: 'Control post-tratamiento',
    currentIllness: 'Paciente refiere mejora del 50% con placa miorelajante.',
    diagnosis: {
      primary: 'Evolución favorable disfunción ATM',
      secondary: []
    },
    helkimoIndex: {
      ai: { score: 3 },
      di: { score: 6 }
    },
    treatmentPlan: {
      description: 'Continuar con placa, control en 60 días'
    }
  },
  // María González - 2 visitas
  {
    chiefComplaint: 'Bruxismo y dolor de cabeza',
    currentIllness: 'Paciente refere cefalea tensional matutina y rechinido nocturno reportado por pareja.',
    diagnosis: {
      primary: 'Bruxismo activo',
      secondary: ['Síndrome de disfunción temporomandibular']
    },
    helkimoIndex: {
      ai: { score: 12 },
      di: { score: 15 }
    },
    treatmentPlan: {
      description: 'Placa de estabilización nocturna, derivación a neurólogo para cefalea, control en 15 días'
    }
  },
  // Carlos Rodríguez - 1 visita
  {
    chiefComplaint: 'Dolor facial y ruidos articulares',
    currentIllness: 'Paciente refere chasquidos en ATM izquierda al masticar y dolor facial difuso.',
    diagnosis: {
      primary: 'Desorden interno de ATM izquierda (DDI)',
      secondary: ['Artritis temporomandibular']
    },
    helkimoIndex: {
      ai: { score: 5 },
      di: { score: 18 }
    },
    treatmentPlan: {
      description: 'Placa de estabilización, medicación antiinflamatoria, control en 7 días'
    }
  },
  // Ana Martínez - 2 visitas
  {
    chiefComplaint: 'Seguimiento ATM',
    currentIllness: 'Paciente en tratamiento por ATM, refiere sentirse bien.',
    diagnosis: {
      primary: 'Paciente asintomática',
      secondary: []
    },
    helkimoIndex: {
      ai: { score: 0 },
      di: { score: 2 }
    },
    treatmentPlan: {
      description: 'Control trimestral'
    }
  },
  // Luis Fernández - 1 visita
  {
    chiefComplaint: 'Primera consulta - dolor ATM',
    currentIllness: 'Paciente refere dolor en región preauricular derecha hace 1 mes, sin traumatismo previo.',
    diagnosis: {
      primary: 'Síndrome de dolor miofascial',
      secondary: ['Bruxismo']
    },
    helkimoIndex: {
      ai: { score: 10 },
      di: { score: 8 }
    },
    treatmentPlan: {
      description: 'Placa blanda, ejercicios de estiramiento, control en 21 días'
    }
  }
];

// Seguimientos de ejemplo (simplificados)
const followUpsData = [
  {
    date: new Date('2026-02-15'),
    evolution: 'Paciente refere mejora significativa. El dolor ATM disminuyó de 8/10 a 4/10.',
    symptomsUpdate: {
      status: 'improved',
      painLevel: 4,
      notes: 'Menos dolor al despertar'
    }
  },
  {
    date: new Date('2026-03-01'),
    evolution: 'Continúa mejorando. Ya no usa medicación para el dolor.',
    symptomsUpdate: {
      status: 'improved',
      painLevel: 2,
      notes: 'Solo molestias leves en días de mucho estrés'
    }
  },
  {
    date: new Date('2026-02-20'),
    evolution: 'Bruxismo persiste según reporte de pareja. Agregar técnica de relajación.',
    symptomsUpdate: {
      status: 'stable',
      painLevel: 6,
      notes: 'Sin cambios significativos'
    }
  },
  {
    date: new Date('2026-03-10'),
    evolution: 'Cefalea desaparecida. Solo refiere fatiga muscular ocasional.',
    symptomsUpdate: {
      status: 'improved',
      painLevel: 3,
      notes: 'Mejora notable con placa'
    }
  }
];

async function seedPatients() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB\n');

    // Obtener clínica principal
    const clinic = await Clinic.findOne({ slug: 'micitamedica' });
    if (!clinic) {
      console.error('✗ No se encontró la clínica dr-kulinka. Ejecutá seed-dev.js primero.');
      process.exit(1);
    }
    console.log(`✓ Clínica: ${clinic.name}\n`);

    // Contadores para números de clínica - buscar el último número existente (global, no por clínica)
    const lastPatient = await Patient.findOne().sort({ clinicNumber: -1 });
    console.log(`→ Ultimo paciente global: ${lastPatient?.clinicNumber || 'ninguno'}`);
    let clinicCounter = 2; // Empezar desde 2 porque PAC-0001 ya existe
    if (lastPatient && lastPatient.clinicNumber) {
      const match = lastPatient.clinicNumber.match(/PAC-(\d+)/);
      if (match) {
        clinicCounter = parseInt(match[1], 10) + 1;
      }
    }
    console.log(`→ Iniciando desde: PAC-${String(clinicCounter).padStart(4, '0')}\n`);

    console.log('=== CREANDO PACIENTES DE PRUEBA ===\n');

    const createdPatients = [];
    let historyIndex = 0;

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
      createdPatients.push(patient);
      console.log(`✓ Paciente: ${patient.firstName} ${patient.lastName} (${clinicNumber})`);

      // Crear historias clínicas para este paciente
      const historiesPerPatient = {
        'Juan Pérez': 3,
        'María González': 2,
        'Carlos Rodríguez': 1,
        'Ana Martínez': 2,
        'Luis Fernández': 1
      };

      const numHistories = historiesPerPatient[`${patient.firstName} ${patient.lastName}`] || 1;

      for (let i = 0; i < numHistories && historyIndex < clinicalHistoriesData.length; i++) {
        const historyData = clinicalHistoriesData[historyIndex];
        historyIndex++;

        // Fechas progresivas para cada visita
        const visitDate = new Date();
        visitDate.setMonth(visitDate.getMonth() - (numHistories - i - 1));

        const history = new ClinicalHistory({
          ...historyData,
          patient: patient._id,
          clinic: clinic._id,
          consultationDate: visitDate,
          createdAt: visitDate,
          updatedAt: visitDate
        });

        await history.save();
        console.log(`  └─ Historia clínica #${i + 1}: ${historyData.chiefComplaint}`);

        // Agregar seguimientos a algunas historias
        if (i > 0) { // A partir de la segunda visita, agregar seguimientos
          const numFollowUps = Math.floor(Math.random() * 2) + 1;
          for (let f = 0; f < numFollowUps; f++) {
            const followUpDate = new Date(visitDate);
            followUpDate.setDate(followUpDate.getDate() + (f * 15) + 7);

            const followUp = new FollowUp({
              ...followUpsData[Math.min(f, followUpsData.length - 1)],
              clinicalHistory: history._id,
              patient: patient._id,
              clinic: clinic._id,
              date: followUpDate,
              createdAt: followUpDate,
              updatedAt: followUpDate
            });

            await followUp.save();
            console.log(`      └─ Seguimiento: ${followUpDate.toLocaleDateString('es-AR')}`);
          }
        }
      }

      console.log('');
    }

    console.log('=== RESUMEN ===');
    console.log(`Total pacientes creados: ${createdPatients.length}`);
    
    // Contar historias clínicas y seguimientos
    const totalHistories = await ClinicalHistory.countDocuments({ clinic: clinic._id });
    const totalFollowUps = await FollowUp.countDocuments({ clinic: clinic._id });
    
    console.log(`Total historias clínicas: ${totalHistories}`);
    console.log(`Total seguimientos: ${totalFollowUps}`);
    console.log('\n✓ Seed completado exitosamente!');

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Conexión cerrada.');
    process.exit(0);
  }
}

seedPatients();
