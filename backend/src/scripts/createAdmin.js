require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

async function createAdminUser() {
    try {
        // Conectar a la base de datos
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Conectado a MongoDB');

        // Verificar si ya existe un usuario admin
        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            console.log('Ya existe un usuario administrador');
            process.exit(0);
        }

        // Crear usuario admin
        const adminUser = await User.create({
            email: process.env.ADMIN_EMAIL || 'admin@micitamedica.me',
            password: process.env.ADMIN_PASSWORD || 'Admin123!',
            role: 'admin'
        });

        console.log('Usuario administrador creado exitosamente:');
        console.log({
            id: adminUser._id,
            email: adminUser.email,
            role: adminUser.role
        });

    } catch (error) {
        console.error('Error al crear usuario administrador:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

createAdminUser();
