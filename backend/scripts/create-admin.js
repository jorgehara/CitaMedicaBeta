const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno desde el directorio raíz del backend
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/user');

async function createAdminUser() {
    try {
        console.log('Conectando a MongoDB...');
        console.log('URI:', process.env.MONGODB_URI ? 'Configurado ✓' : 'NO CONFIGURADO ❌');

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 5000,
        });

        console.log('✓ Conectado a MongoDB\n');

        // Verificar si ya existe un usuario admin
        const existingAdmin = await User.findOne({ email: 'admin@cita-medica.com' });

        if (existingAdmin) {
            console.log('✓ Usuario admin ya existe:');
            console.log('  Email:', existingAdmin.email);
            console.log('  Nombre:', existingAdmin.nombre);
            console.log('  Rol:', existingAdmin.role);
            console.log('  Activo:', existingAdmin.activo);
            console.log('\nPuedes usar estas credenciales:');
            console.log('  Email: admin@cita-medica.com');
            console.log('  Password: admin123');
        } else {
            console.log('× No existe usuario admin, creando...\n');

            const adminUser = new User({
                nombre: 'Administrador',
                email: 'admin@cita-medica.com',
                password: 'admin123', // Se hasheará automáticamente
                role: 'admin',
                activo: true
            });

            await adminUser.save();

            console.log('✓ Usuario admin creado exitosamente:');
            console.log('  Email:', adminUser.email);
            console.log('  Nombre:', adminUser.nombre);
            console.log('  Rol:', adminUser.role);
            console.log('\nPuedes usar estas credenciales:');
            console.log('  Email: admin@cita-medica.com');
            console.log('  Password: admin123');
        }

        // Listar todos los usuarios
        console.log('\n--- Lista de todos los usuarios ---');
        const allUsers = await User.find({});
        console.log(`Total de usuarios: ${allUsers.length}\n`);

        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.nombre}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Rol: ${user.role}`);
            console.log(`   Activo: ${user.activo ? 'Sí' : 'No'}`);
            console.log('');
        });

    } catch (error) {
        console.error('Error:', error.message);
        if (error.name === 'MongooseServerSelectionError') {
            console.error('\n❌ No se pudo conectar a MongoDB.');
            console.error('Verifica que:');
            console.error('  1. MongoDB esté corriendo');
            console.error('  2. La URI en .env sea correcta');
            console.error('  3. Tengas acceso a la base de datos');
        }
    } finally {
        await mongoose.connection.close();
        console.log('\nConexión cerrada.');
        process.exit(0);
    }
}

// Ejecutar
createAdminUser();
