const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI no está definido en las variables de entorno');
        }

        console.log('Intentando conectar a MongoDB...');
        
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 60000,
            socketTimeoutMS: 60000,
            authSource: 'admin',
            user: 'Jorge',
            pass: 'JaraJorge*2025*!'
        });

        console.log('MongoDB conectado exitosamente');
    } catch (error) {
        console.error('Error al conectar con MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;