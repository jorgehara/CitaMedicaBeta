/**
 * Script para crear el usuario administrador inicial
 * Ejecutar con: node create-admin.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/user');

// Cargar variables de entorno
dotenv.config();

// Datos del admin por defecto (CAMBIAR EN PRODUCCIÓN)
const defaultAdmin = {
    nombre: 'Administrador',
    email: 'admin@cita-medica.com',
    password: 'admin123', // CAMBIAR ESTO INMEDIATAMENTE DESPUÉS DEL PRIMER LOGIN
    role: 'admin'
};

async function createAdmin() {
    try {
        // Conectar a MongoDB
        console.log('Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 60000,
            socketTimeoutMS: 60000,
        });
        console.log('✓ Conectado a MongoDB');

        // Verificar si ya existe un admin
        const existingAdmin = await User.findOne({ email: defaultAdmin.email });

        if (existingAdmin) {
            console.log('\n⚠️  El usuario administrador ya existe:');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Nombre: ${existingAdmin.nombre}`);
            console.log(`   Role: ${existingAdmin.role}`);
            console.log(`   Activo: ${existingAdmin.activo}`);

            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            return new Promise((resolve) => {
                rl.question('\n¿Desea crear otro usuario administrador? (s/n): ', async (answer) => {
                    rl.close();

                    if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'si') {
                        await createCustomAdmin();
                    } else {
                        console.log('\nOperación cancelada.');
                    }

                    await mongoose.connection.close();
                    console.log('\n✓ Desconectado de MongoDB');
                    process.exit(0);
                    resolve();
                });
            });
        }

        // Crear el admin
        console.log('\nCreando usuario administrador...');
        const admin = new User(defaultAdmin);
        await admin.save();

        console.log('\n✅ Usuario administrador creado exitosamente!\n');
        console.log('📧 Email:', defaultAdmin.email);
        console.log('🔑 Contraseña temporal:', defaultAdmin.password);
        console.log('\n⚠️  IMPORTANTE:');
        console.log('   1. Guarde estas credenciales de forma segura');
        console.log('   2. Cambie la contraseña inmediatamente después del primer login');
        console.log('   3. No comparta estas credenciales\n');

        // Cerrar conexión
        await mongoose.connection.close();
        console.log('✓ Desconectado de MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error al crear administrador:', error.message);
        if (error.code === 11000) {
            console.error('   El email ya está registrado en la base de datos.');
        }
        process.exit(1);
    }
}

async function createCustomAdmin() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const prompt = (question) => {
        return new Promise((resolve) => {
            rl.question(question, resolve);
        });
    };

    try {
        console.log('\n=== Crear nuevo administrador ===\n');

        const nombre = await prompt('Nombre completo: ');
        const email = await prompt('Email: ');
        const password = await prompt('Contraseña (mín. 6 caracteres): ');

        if (!nombre || !email || !password) {
            console.log('\n❌ Todos los campos son obligatorios');
            rl.close();
            return;
        }

        if (password.length < 6) {
            console.log('\n❌ La contraseña debe tener al menos 6 caracteres');
            rl.close();
            return;
        }

        const admin = new User({
            nombre,
            email,
            password,
            role: 'admin'
        });

        await admin.save();

        console.log('\n✅ Administrador creado exitosamente!\n');
        console.log('📧 Email:', email);
        console.log('👤 Nombre:', nombre);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        rl.close();
    }
}

// Ejecutar
createAdmin();
