/**
 * Script de inicialización para entorno de DESARROLLO
 * Crea clínicas y usuarios necesarios para desarrollar localmente
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Clinic = require('../src/models/clinic');
const User = require('../src/models/user');

const clinics = [
    {
        slug: 'dr-kulinka',
        name: 'Dr. Kulinka',
        subdomain: null, // Dominio raíz
        active: true,
        settings: {
            timezone: 'America/Argentina/Buenos_Aires',
            appointmentDuration: 15,
            maxSobreturnos: 10,
            workingDays: [1, 2, 3, 4, 5, 6]
        },
        socialWorks: ['INSSSEP', 'Swiss Medical', 'OSDE', 'Galeno', 'CONSULTA PARTICULAR', 'Otras Obras Sociales']
    },
    {
        slug: 'od-melinavillalba',
        name: 'Od. Melina Villalba',
        subdomain: 'od-melinavillalba',
        active: true,
        settings: {
            timezone: 'America/Argentina/Buenos_Aires',
            appointmentDuration: 15,
            maxSobreturnos: 10,
            workingDays: [1, 2, 3, 4, 5, 6],
            appointmentLabel: 'Consulta odontológica'
        },
        socialWorks: ['INSSSEP', 'Swiss Medical', 'OSDE', 'Galeno', 'CONSULTA PARTICULAR', 'Otras Obras Sociales']
    }
];

const users = [
    {
        nombre: 'Dr. Kulinka',
        email: 'dr-kulinka@citamedica.com',
        password: '123456',
        role: 'admin',
        clinicSlug: 'dr-kulinka'
    },
    {
        nombre: 'Od. Melina Villalba',
        email: 'melina@od-melinavillalba.com',
        password: '123456',
        role: 'admin',
        clinicSlug: 'od-melinavillalba'
    },
    {
        nombre: 'Operador Test',
        email: 'operador@test.com',
        password: '123456',
        role: 'operador',
        clinicSlug: 'od-melinavillalba'
    }
];

async function seed() {
    try {
        console.log('Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Conectado a MongoDB\n');

        // Crear clínicas
        console.log('=== CREANDO CLÍNICAS ===');
        const clinicMap = {};
        
        for (const clinicData of clinics) {
            let clinic = await Clinic.findOne({ slug: clinicData.slug });
            
            if (clinic) {
                console.log(`✓ Clínica ya existe: ${clinic.name} (${clinic.slug})`);
            } else {
                clinic = new Clinic(clinicData);
                await clinic.save();
                console.log(`✓ Clínica creada: ${clinic.name} (${clinic.slug})`);
            }
            
            clinicMap[clinicData.slug] = clinic;
        }

        // Crear usuarios
        console.log('\n=== CREANDO USUARIOS ===');
        
        for (const userData of users) {
            const clinic = clinicMap[userData.clinicSlug];
            const userDataToSave = {
                nombre: userData.nombre,
                email: userData.email,
                password: userData.password,
                role: userData.role,
                clinicId: clinic._id,
                activo: true
            };

            let user = await User.findOne({ email: userData.email });

            if (user) {
                console.log(`✓ Usuario ya existe: ${user.email} (${user.role})`);
                // Actualizar clinicId por las dudas
                if (user.clinicId?.toString() !== clinic._id.toString()) {
                    user.clinicId = clinic._id;
                    await user.save();
                    console.log(`  → Actualizado clinicId a ${clinic.slug}`);
                }
            } else {
                user = new User(userDataToSave);
                await user.save();
                console.log(`✓ Usuario creado: ${user.email} (${user.role}) → Clínica: ${clinic.slug}`);
            }
        }

        console.log('\n=== RESUMEN DE LOGIN ===');
        console.log('Desarrollo local (localhost:5173 sin subdominio):');
        console.log('  Email: dr-kulinka@citamedica.com');
        console.log('  Password: 123456\n');
        console.log('Desarrollo con subdominio (od-melinavillalba.localhost:5173):');
        console.log('  Email: melina@od-melinavillalba.com');
        console.log('  Password: 123456\n');
        console.log('Operador (cualquier subdominio):');
        console.log('  Email: operador@test.com');
        console.log('  Password: 123456');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n✓ Conexión cerrada.');
        process.exit(0);
    }
}

seed();
