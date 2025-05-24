const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Verificar variables de entorno críticas
console.log('Verificando variables de entorno...');
const requiredEnvVars = ['MONGODB_URI', 'PORT', 'CALENDAR_ID', 'GOOGLE_APPLICATION_CREDENTIALS'];
requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`Error: La variable de entorno ${varName} no está definida`);
    } else {
        console.log(`${varName} ✓`);
    }
});

const appointmentRoutes = require('./src/routes/appointmentRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/consultorio', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error de conexión a MongoDB:', err));

// Middleware para logging de requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rutas
app.use('/api', appointmentRoutes);

// Ruta de prueba
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Proxy para el bot en producción
// Configurar proxy para el bot
app.use('/bot', createProxyMiddleware({
    target: process.env.BOT_URL || 'http://localhost:3008',
    changeOrigin: true,
    pathRewrite: {
        '^/bot': ''
    }
}));

// Manejo de rutas no encontradas
app.use((req, res, next) => {
    console.log(`404 - Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
