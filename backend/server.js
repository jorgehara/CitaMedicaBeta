const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

// Rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 peticiones por ventana por IP
});

// Verificar variables de entorno críticas
console.log('Verificando variables de entorno...');
console.log('Ambiente:', process.env.NODE_ENV || 'desarrollo');

const requiredEnvVars = ['MONGODB_URI', 'PORT', 'CALENDAR_ID', 'GOOGLE_APPLICATION_CREDENTIALS', 'CORS_ORIGINS', 'JWT_SECRET'];
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
const errorHandler = require('./src/middleware/errorHandler');

const PORT = process.env.PORT || 3001;
const app = express();

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'appointment-backend',
        version: '1.0.0'
    });
});

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [],
    credentials: true,
}));

// Ruta base
app.get('/', (req, res) => {
    res.json({ message: 'API del Consultorio Médico' });
});
app.use(express.json());

// Aplicar rate limiting a todas las rutas
app.use(limiter);

// Rutas de autenticación
app.use('/api/auth', authRoutes);

const qrRoutes = require('./src/routes/qrRoutes');
// Middleware para manejar el QR
app.use('/api', qrRoutes);

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

// Middleware para logging de requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rutas
app.use('/api', appointmentRoutes);
app.use('/api/sobreturnos', sobreturnoRoutes);

// Ruta de prueba
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

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
