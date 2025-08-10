const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/consultorio';
        console.log('Intentando conectar a MongoDB en:', mongoUri);
        
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS) || 60000,
            socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS) || 60000,
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 10,
            minPoolSize: 5,
        });
        
        console.log('MongoDB conectado exitosamente');
    } catch (error) {
        console.error('Error al conectar con MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
