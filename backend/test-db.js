const mongoose = require('mongoose');
require('dotenv').config();

console.log('🚀 Script iniciado');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'CONFIGURADO' : 'NO CONFIGURADO');

async function test() {
    try {
        console.log('📡 Intentando conectar a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado exitosamente');
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('📋 Colecciones encontradas:', collections.map(c => c.name));
        
        await mongoose.disconnect();
        console.log('👋 Desconectado');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

test();
