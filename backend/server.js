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
const errorHandler = require('./src/middleware/errorHandler');

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const qrRoutes = require('./src/routes/qrRoutes');
// Middleware para manejar el QR
app.use('/api', qrRoutes);

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
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
