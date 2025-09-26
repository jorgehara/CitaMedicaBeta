const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI no está definido en las variables de entorno');
        }

        console.log('Intentando conectar a MongoDB...');
        
        // Configuración actualizada de MongoDB para versión 4.0+
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 60000,
            socketTimeoutMS: 60000,
            connectTimeoutMS: 30000,
            heartbeatFrequencyMS: 2000,
            maxPoolSize: 10,
            minPoolSize: 2,
            authSource: 'admin',
            user: 'Jorge',
            pass: 'JaraJorge*2025*!'
        });

        console.log('MongoDB conectado exitosamente');
    } catch (error) {
        console.error('Error al conectar con MongoDB:', {
            message: error.message,
            code: error.code,
            name: error.name
        });
        
        // Esperar antes de salir para dar tiempo a PM2 de registrar el error
        setTimeout(() => {
            process.exit(1);
        }, 1000);
    }
};

module.exports = connectDB;