console.log('Iniciando script...');

const mongoose = require('mongoose');
console.log('Mongoose importado');

require('dotenv').config();
console.log('Variables de entorno cargadas');

console.log('MONGODB_URI configurado:', !!process.env.MONGODB_URI);

async function test() {
    console.log('Función test iniciada');
    
    try {
        console.log('Antes de conectar...');
        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('Después de conectar');
        
        await mongoose.disconnect();
        console.log('Desconectado');
        
    } catch (error) {
        console.log('Error capturado:', error.message);
    }
    
    console.log('Saliendo...');
    process.exit(0);
}

console.log('Llamando a test()...');
test();
console.log('test() llamada');
