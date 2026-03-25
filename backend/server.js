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
const unavailabilityRoutes = require('./src/routes/unavailabilityRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const clinicalHistoryRoutes = require('./src/routes/clinicalHistoryRoutes');
const followUpRoutes = require('./src/routes/followUpRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const tenantResolver = require('./src/middleware/tenantResolver');

const PORT = process.env.PORT || 3001;
const app = express();

// Configuración de CORS mejorada
const staticAllowedOrigins = process.env.CORS_ORIGINS && process.env.CORS_ORIGINS !== '*'
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : [
        'http://localhost:4173',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://localhost:3008',
        'http://localhost:3009',
        'https://micitamedica.me',
        'https://od-melinavillalba.micitamedica.me'
    ];

const corsOptions = {
    origin: (origin, callback) => {
        // Permitir requests sin origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);

        // Verificar origen exacto en la lista
        if (staticAllowedOrigins.includes(origin)) return callback(null, true);

        // Permitir cualquier subdominio de localhost en desarrollo
        if (/^https?:\/\/[^.]+\.localhost(:\d+)?$/.test(origin)) return callback(null, true);

        // Permitir cualquier subdominio de micitamedica.me en producción
        if (/^https:\/\/[^.]+\.micitamedica\.me$/.test(origin)) return callback(null, true);

        console.warn(`[CORS] Origen bloqueado: ${origin}`);
        callback(new Error(`CORS: origen no permitido: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'X-API-Key', 'X-Tenant-Subdomain'],
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

// Tenant resolver — aplica a todas las rutas /api/* (después del health check)
app.use('/api', tenantResolver);

// Config pública de la clínica — no requiere auth
app.get('/api/clinic/config', (req, res) => {
    res.json({
        success: true,
        data: {
            name: req.clinic.name,
            slug: req.clinic.slug,
            socialWorks: req.clinic.socialWorks,
            settings: req.clinic.settings
        }
    });
});

// Rutas de autenticación (públicas)
app.use('/api/auth', authRoutes);

// Rutas de tokens (para generar tokens públicos temporales)
app.use('/api/tokens', tokenRoutes);

// Rutas principales (se protegerán con middleware auth después)
app.use('/api/appointments', appointmentRoutes);
app.use('/api/sobreturnos', sobreturnoRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/clinical-histories', clinicalHistoryRoutes);
app.use('/api/follow-ups', followUpRoutes);
app.use('/api', unavailabilityRoutes);
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
