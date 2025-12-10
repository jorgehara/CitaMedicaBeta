const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Verificar variables de entorno críticas
console.log('Verificando variables de entorno...');
console.log('Ambiente:', process.env.NODE_ENV || 'desarrollo');

const requiredEnvVars = ['MONGODB_URI', 'PORT', 'CALENDAR_ID', 'GOOGLE_APPLICATION_CREDENTIALS', 'CORS_ORIGINS'];
requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`Error: La variable de entorno ${varName} no está definida`);
    } else {
        console.log(`${varName} ✓`);
    }
});

const appointmentRoutes = require('./src/routes/appointmentRoutes');
const sobreturnoRoutes = require('./src/routes/sobreturnoRoutes');
const authRoutes = require('./src/routes/authRoutes');
const qrRoutes = require('./src/routes/qrRoutes');
const tokenRoutes = require('./src/routes/tokenRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const PORT = process.env.PORT || 3001;
const app = express();

// Configuración de CORS mejorada
const corsOptions = {
    origin: process.env.CORS_ORIGINS && process.env.CORS_ORIGINS !== '*'
        ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
        : [
            'http://localhost:4173',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000',
            'http://localhost:3008',
            'https://micitamedica.me'
        ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'X-API-Key'],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false
};

// Middleware - orden importante
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log de solicitudes entrantes
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No origin'}`);
    next();
});

// Health check endpoint (antes de las rutas específicas)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'appointment-backend',
        version: '1.0.0',
        uptime: process.uptime()
    });
});

// Rutas de autenticación (públicas)
app.use('/api/auth', authRoutes);

// Rutas de tokens (para generar tokens públicos temporales)
app.use('/api/tokens', tokenRoutes);

// Rutas principales (se protegerán con middleware auth después)
app.use('/api/appointments', appointmentRoutes);
app.use('/api/sobreturnos', sobreturnoRoutes);
app.use('/api', qrRoutes);

// Ruta base
app.get('/', (req, res) => {
    res.json({
        message: 'API del Consultorio Médico',
        version: '2.0.0',
        features: ['appointments', 'sobreturnos', 'authentication', 'qr']
    });
});

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    connectTimeoutMS: 30000,
    heartbeatFrequencyMS: 2000,
    maxPoolSize: 10,
    minPoolSize: 2,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error de conexión a MongoDB:', {
    message: err.message,
    code: err.code,
    name: err.name
}));


// Manejo de rutas no encontradas
app.use((req, res, next) => {
    console.log(`404 - Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
