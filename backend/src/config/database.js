const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URI || 'mongodb://admin:Consultorio2025@mongo:27017/consultorio?authSource=admin');
        console.log('MongoDB conectado exitosamente');
    } catch (error) {
        console.error('Error al conectar con MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
