# Guía Backend - CitaMedicaBeta

Documentación detallada de la estructura y patrones del backend para agentes de Claude Code.

---

## 🗺️ MAPA DE NAVEGACIÓN BACKEND

**Usa este mapa para saber DÓNDE buscar según el tipo de cambio solicitado:**

### 🛣️ Cambios de Endpoints / Rutas / URLs
**Buscar en:**
- `src/routes/*.js` - Definición de rutas Express (appointmentRoutes, sobreturnoRoutes, etc.)

**Ejemplos:**
- "Agregar nuevo endpoint" → `routes/appointmentRoutes.js`
- "Cambiar método HTTP de una ruta" → `routes/`
- "Agregar middleware a ruta" → `routes/`

---

### 🧠 Cambios de Lógica de Negocio / Validaciones
**Buscar en:**
- `src/controllers/*.js` - Handlers de requests (appointmentController, sobreturnoController, etc.)

**Ejemplos:**
- "Cambiar validación de campos" → `controllers/appointmentController.js`
- "Modificar cálculo de horarios" → `controllers/sobreturnoController.js`
- "Agregar nueva lógica de negocio" → `controllers/`

---

### 💾 Cambios de Base de Datos / Schemas / Modelos
**Buscar en:**
- `src/models/*.js` - Mongoose schemas (appointment.js, sobreturno.js, user.js)

**Ejemplos:**
- "Agregar campo a la base de datos" → `models/appointment.js`
- "Cambiar validación de schema" → `models/`
- "Modificar enums" → `models/`

---

### 🔌 Cambios de Servicios Externos / Integraciones
**Buscar en:**
- `src/services/*.js` - Lógica de servicios externos (googleCalendarService, etc.)

**Ejemplos:**
- "Modificar integración con Google Calendar" → `services/googleCalendarService.js`
- "Cambiar configuración de Calendar" → `services/`
- "Agregar nuevo servicio externo" → `services/`

---

### 🔐 Cambios de Autenticación / Seguridad / Middleware
**Buscar en:**
- `src/middleware/*.js` - Express middleware (auth.js, flexibleAuth.js, publicTokenAuth.js, etc.)

**Ejemplos:**
- "Cambiar validación de JWT" → `middleware/auth.js`
- "Modificar permisos" → `middleware/flexibleAuth.js`
- "Agregar nuevo middleware" → `middleware/`

---

### ⚙️ Cambios de Configuración / Variables de Entorno
**Buscar en:**
- `server.js` - Entry point y configuración principal
- `.env` - Variables de entorno
- `src/config/*.js` - Configuración específica

**Ejemplos:**
- "Cambiar puerto" → `.env` o `server.js`
- "Modificar CORS" → `server.js`
- "Agregar nueva variable de entorno" → `.env`

---

## 🎯 SKILLS BACKEND

### SKILL 1: analisis-backend
**Cuándo usar:** Antes de cualquier modificación de código backend.

**Pasos:**
1. **Identificar tipo de cambio** usando el Mapa de Navegación arriba
2. **Leer archivos relacionados**:
   - Si es endpoint → Leer route completa Y controller completo
   - Si es lógica → Leer controller completo Y modelo relacionado
   - Si es modelo → Leer schema completo Y controller que lo usa
   - Si es servicio → Leer servicio completo Y dónde se llama
3. **Buscar dependencias**:
   - ¿Qué endpoints usan este controller?
   - ¿Qué controllers usan este modelo?
   - ¿Qué servicios llaman a esta función?
4. **Verificar middleware**:
   - ¿Qué autenticación usa? (auth, flexibleAuth, publicTokenAuth)
   - ¿Qué permisos requiere?
5. **Hacer preguntas al usuario**:
   - ¿Qué endpoint específico modificar?
   - ¿Qué validaciones mantener?
   - ¿Afecta a citas, sobreturnos, o ambos?
   - ¿Debe sincronizar con Google Calendar?

---

### SKILL 2: plan-backend
**Cuándo usar:** Después de completar analisis-backend y antes de codear.

**Formato del plan:**
```
## 📋 PLAN BACKEND

### RESUMEN:
[Descripción en 2-3 líneas del cambio]

### ARCHIVOS A MODIFICAR:
- src/routes/[archivo].js - [Cambio específico]
- src/controllers/[archivo].js - [Cambio específico]
- src/models/[archivo].js - [Cambio específico]

### CAMBIOS DETALLADOS:

**Archivo 1: [nombre]**
- Línea X: [Qué cambiar]
- Función Y: [Qué modificar]

**Archivo 2: [nombre]**
- Endpoint: [Método] [Ruta]
- Modificar: [Qué cambiar]

### ENDPOINTS AFECTADOS:
- [Método] /api/[ruta] - [Cómo se afecta]

### MODELOS AFECTADOS:
- [Modelo] - [Qué campos cambian]

### AUTENTICACIÓN:
- [auth / flexibleAuth / publicTokenAuth / ninguna]
- Permisos: [read / update / delete / ninguno]

### RIESGOS:
- ⚠️ [Qué podría romperse]
- ⚠️ [Endpoints que podrían fallar]
- ✅ Mitigación: [Cómo evitarlo]

### VALIDACIÓN:
- [ ] Verificar que servidor compile sin errores
- [ ] Verificar que MongoDB schema sea válido
- [ ] Verificar que rutas estén correctamente montadas

### ❓ ¿Procedo?
```

**🛑 ESPERAR APROBACIÓN antes de continuar**

---

### SKILL 3: implementacion-backend
**Cuándo usar:** Solo después de aprobación del plan.

**Pasos:**
1. **Modificar un archivo a la vez**:
   - Usar Edit tool
   - Explicar qué estás haciendo
   - Mostrar el fragmento cambiado

2. **Orden de modificación**:
   - Primero: `models/` (si cambia schema)
   - Segundo: `controllers/` (lógica de negocio)
   - Tercero: `routes/` (endpoints)
   - Cuarto: `middleware/` (si es necesario)
   - Quinto: `services/` (integraciones externas)

3. **Después de cada cambio**:
   - Verificar sintaxis
   - Explicar qué cambió
   - Actualizar TodoWrite

4. **Si hay error**:
   - Mostrar el error completo
   - Analizar causa
   - Proponer solución
   - Esperar aprobación para arreglar

5. **Código mínimo**:
   - NO agregar validaciones extra
   - NO cambiar estructura de respuestas
   - NO modificar middleware existente sin consultar
   - Solo el cambio solicitado

---

### ⚠️ REGLAS ESPECÍFICAS BACKEND

**MongoDB / Mongoose:**
- Nunca cambiar schemas sin consultar (afecta datos en producción)
- Respetar enums existentes
- Mantener validaciones existentes
- Si agrega campo nuevo, definir default

**Express / Routes:**
- Respetar estructura de rutas existente
- No cambiar métodos HTTP sin consultar
- Mantener middleware en orden correcto
- Verificar que rutas estén montadas en server.js

**Controllers:**
- Siempre validar input en controllers
- Mantener manejo de errores existente (try-catch)
- Respetar formato de respuestas (success, data, error)
- Logging con prefijos [DEBUG], [ERROR], [WARN]

**Autenticación:**
- No cambiar middleware de auth sin consultar
- Respetar permisos existentes
- No exponer endpoints sin autenticación a menos que sea explícito

**Google Calendar:**
- Mantener timezone: America/Argentina/Buenos_Aires
- Duración default: 15 minutos
- Verificar que googleEventId se guarde en BD

**Horarios de Sobreturnos:**
- Números 1-5: Mañana (11:00-12:00)
- Números 6-10: Tarde (19:00-20:00)
- Hardcodeados en controller, NO cambiar sin consultar

---

## Stack Tecnológico

- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: MongoDB + Mongoose
- **Autenticación**: JWT + API Key
- **Integración**: Google Calendar API
- **Timezone**: America/Argentina/Buenos_Aires

## Estructura de Carpetas

```
backend/
├── src/
│   ├── models/              # Mongoose schemas
│   │   ├── appointment.js   # Citas regulares
│   │   ├── sobreturno.js    # Sobreturnos
│   │   └── user.js          # Usuarios admin
│   │
│   ├── controllers/         # Request handlers
│   │   ├── appointmentController.js    # Lógica de citas
│   │   ├── sobreturnoController.js     # Lógica de sobreturnos
│   │   ├── authController.js           # Autenticación
│   │   └── tokenController.js          # Generación de tokens públicos
│   │
│   ├── routes/              # Express routes
│   │   ├── appointmentRoutes.js
│   │   ├── sobreturnoRoutes.js
│   │   ├── authRoutes.js
│   │   └── tokenRoutes.js
│   │
│   ├── services/            # Business logic
│   │   ├── googleCalendarService.js   # Singleton Google Calendar
│   │   └── calendarSync.js            # Sincronización
│   │
│   ├── middleware/          # Express middleware
│   │   ├── auth.js                    # JWT authentication
│   │   ├── flexibleAuth.js            # API Key O JWT
│   │   ├── publicTokenAuth.js         # Token público
│   │   └── errorHandler.js            # Error handling
│   │
│   └── config/              # Configuration
│       └── database.js      # MongoDB connection
│
├── scripts/                 # Utility scripts
│   ├── sync-all-appointments.js  # Migración a Calendar
│   ├── test-calendar.js          # Test Google Calendar
│   ├── test-connection.js        # Test MongoDB
│   └── create-admin.js           # Crear usuario admin
│
├── server.js                # Entry point
├── credentials.json         # Google service account
├── package.json
└── .env                     # Variables de entorno
```

## Entry Point: server.js

**Configuración principal del servidor**:

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',           // Frontend dev
    'http://localhost:3008',           // Chatbot
    'https://micitamedica.me'          // Producción
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
  next();
});

// Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/sobreturnos', sobreturnoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tokens', tokenRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error MongoDB:', err));

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

## Modelos (Mongoose Schemas)

### sobreturno.js

**Schema de sobreturnos** (campo `isSobreturno` siempre `true`):

```javascript
const SobreturnoSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  sobreturnoNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed'
  },
  socialWork: {
    type: String,
    enum: [
      'INSSSEP',
      'Swiss Medical',
      'OSDE',
      'Galeno',
      'CONSULTA PARTICULAR',
      'Otras Obras Sociales'
    ],
    default: 'CONSULTA PARTICULAR',
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  attended: {
    type: Boolean,
    default: false
  },
  googleEventId: {
    type: String,
    default: null
  },
  isSobreturno: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isPaid: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true  // createdAt, updatedAt
});

module.exports = mongoose.model('Sobreturno', SobreturnoSchema, 'sobreturnos');
```

### appointment.js

**Schema de citas regulares** (campo `isSobreturno` siempre `false`):

```javascript
const AppointmentSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  socialWork: {
    type: String,
    enum: [...], // Mismo enum que sobreturnos
    required: true
  },
  phone: { type: String, required: true },
  dni: { type: String },
  email: { type: String },
  description: { type: String },
  attended: { type: Boolean, default: false },
  googleEventId: { type: String },
  isSobreturno: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false }
}, { timestamps: true });
```

## Controllers

### sobreturnoController.js

**Controlador principal de sobreturnos**.

#### Funciones Clave:

**1. createSobreturno** (líneas 147-234)

Crea un nuevo sobreturno y calcula automáticamente el horario.

```javascript
exports.createSobreturno = async (req, res) => {
  try {
    const { sobreturnoNumber, date, clientName, socialWork, phone, email, description } = req.body;

    // Validaciones
    if (!sobreturnoNumber || !date || !clientName || !socialWork || !phone) {
      return res.status(400).json({ error: 'Campos requeridos faltantes' });
    }

    // Verificar duplicados
    const existente = await Sobreturno.findOne({
      date,
      sobreturnoNumber,
      isSobreturno: true,
      status: { $ne: 'cancelled' }
    });

    if (existente) {
      return res.status(409).json({ error: 'Sobreturno ya reservado' });
    }

    // Calcular horario según número
    let sobreturnoTime = '';
    if (sobreturnoNumber >= 1 && sobreturnoNumber <= 5) {
      // Mañana
      switch(sobreturnoNumber) {
        case 1: sobreturnoTime = '11:00'; break;
        case 2: sobreturnoTime = '11:15'; break;
        case 3: sobreturnoTime = '11:30'; break;
        case 4: sobreturnoTime = '11:45'; break;
        case 5: sobreturnoTime = '12:00'; break;
      }
    } else {
      // Tarde
      switch(sobreturnoNumber) {
        case 6: sobreturnoTime = '19:00'; break;
        case 7: sobreturnoTime = '19:15'; break;
        case 8: sobreturnoTime = '19:30'; break;
        case 9: sobreturnoTime = '19:45'; break;
        case 10: sobreturnoTime = '20:00'; break;
      }
    }

    // Crear sobreturno
    const nuevoSobreturno = new Sobreturno({
      sobreturnoNumber,
      date,
      time: sobreturnoTime,
      clientName,
      socialWork,
      phone,
      email: email || '',
      description: description || '',
      status: 'confirmed',
      isSobreturno: true,
      isAvailable: false
    });

    await nuevoSobreturno.save();

    // Crear evento en Google Calendar
    const calendarService = require('../services/googleCalendarService');
    const googleEvent = await calendarService.createCalendarEvent({
      date,
      time: sobreturnoTime,
      clientName,
      socialWork,
      phone,
      isSobreturno: true
    });

    nuevoSobreturno.googleEventId = googleEvent.id;
    await nuevoSobreturno.save();

    res.status(201).json(nuevoSobreturno);
  } catch (error) {
    console.error('[ERROR] Error al crear sobreturno:', error);
    res.status(500).json({ error: error.message });
  }
};
```

**2. getSobreturnosByDate** (líneas 267-335)

Retorna sobreturnos disponibles para una fecha específica.

```javascript
exports.getSobreturnosByDate = async (req, res) => {
  try {
    const { date } = req.params;

    // Obtener sobreturnos ocupados
    const sobreturnos = await Sobreturno.find({
      date,
      isSobreturno: true,
      status: { $ne: 'cancelled' }
    });

    // Array de todos los números posibles (1-10)
    const allSobreturnos = Array.from({length: 10}, (_, i) => i + 1);

    // Filtrar ocupados
    const ocupados = sobreturnos.map(s => s.sobreturnoNumber);
    const disponibles = allSobreturnos.filter(num => !ocupados.includes(num));

    // Mapear a horarios
    const sobreturnosDisponibles = disponibles.map(num => {
      let horario = '';
      if (num >= 1 && num <= 5) {
        // Mañana
        switch(num) {
          case 1: horario = '11:00'; break;
          case 2: horario = '11:15'; break;
          case 3: horario = '11:30'; break;
          case 4: horario = '11:45'; break;
          case 5: horario = '12:00'; break;
        }
      } else {
        // Tarde
        switch(num) {
          case 6: horario = '19:00'; break;
          case 7: horario = '19:15'; break;
          case 8: horario = '19:30'; break;
          case 9: horario = '19:45'; break;
          case 10: horario = '20:00'; break;
        }
      }
      return {
        numero: num,
        horario,
        turno: num <= 5 ? 'mañana' : 'tarde'
      };
    });

    return res.json({
      success: true,
      data: {
        disponibles: sobreturnosDisponibles,
        totalDisponibles: disponibles.length,
        fecha: date
      }
    });
  } catch (error) {
    console.error('[ERROR]:', error);
    res.status(500).json({ error: error.message });
  }
};
```

**3. validateSobreturno** (líneas 16-44)

Valida si un sobreturno está disponible.

```javascript
exports.validateSobreturno = async (req, res) => {
  try {
    const { date, sobreturnoNumber } = req.query;

    const existente = await Sobreturno.findOne({
      date,
      sobreturnoNumber,
      isSobreturno: true,
      status: { $ne: 'cancelled' }
    });

    return res.json({
      success: true,
      available: !existente
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**4. reserveSobreturno** (líneas 363-377)

Marca un sobreturno como no disponible (usado por chatbot).

```javascript
exports.reserveSobreturno = async (req, res) => {
  try {
    const { id } = req.body;

    const sobreturno = await Sobreturno.findById(id);

    if (!sobreturno || !sobreturno.isAvailable) {
      return res.status(400).json({ error: 'Sobreturno no disponible' });
    }

    sobreturno.isAvailable = false;
    await sobreturno.save();

    res.json({ success: true, sobreturno });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### appointmentController.js

**Controlador de citas regulares** (similar a sobreturnos pero sin `sobreturnoNumber`).

Funciones principales:
- `getAppointments` - Listar citas
- `createAppointment` - Crear cita
- `updateAppointment` - Actualizar cita
- `deleteAppointment` - Eliminar cita
- `getAvailableTimes` - Horarios disponibles
- `updatePaymentStatus` - Actualizar pago
- `updateDescription` - Actualizar descripción

## Routes

### sobreturnoRoutes.js

**Definición de rutas de sobreturnos**:

```javascript
const express = require('express');
const router = express.Router();
const sobreturnoController = require('../controllers/sobreturnoController');
const { flexibleAuth } = require('../middleware/flexibleAuth');
const auth = require('../middleware/auth');

// Health check (sin autenticación)
router.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'sobreturnos' });
});

// Rutas con autenticación flexible (API Key O JWT)
router.get('/validate', flexibleAuth, sobreturnoController.validateSobreturno);
router.get('/validate/:sobreturnoNumber', flexibleAuth, sobreturnoController.validateSobreturno);
router.get('/available/:date', flexibleAuth, sobreturnoController.getAvailableSobreturnos);
router.get('/date/:date', flexibleAuth, sobreturnoController.getSobreturnosByDate);
router.post('/', flexibleAuth, sobreturnoController.createSobreturno);
router.post('/reserve', flexibleAuth, sobreturnoController.reserveSobreturno);
router.get('/', flexibleAuth, sobreturnoController.getSobreturnos);

// Rutas solo con JWT + permisos
router.get('/:id', auth('read'), sobreturnoController.getSobreturno);
router.put('/:id', auth('update'), sobreturnoController.updateSobreturno);
router.delete('/:id', auth('delete'), sobreturnoController.deleteSobreturno);
router.patch('/:id/payment', auth('update'), sobreturnoController.updatePaymentStatus);
router.patch('/:id/description', auth('update'), sobreturnoController.updateSobreturnoDescription);
router.patch('/:id/status', auth('update'), sobreturnoController.updateSobreturnoStatus);

module.exports = router;
```

### appointmentRoutes.js

**Rutas de citas regulares** (estructura similar a sobreturnos).

## Middleware

### flexibleAuth.js

**Autenticación dual: API Key O JWT**.

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const flexibleAuth = async (req, res, next) => {
  try {
    // Opción 1: API Key (para chatbot)
    const apiKey = req.header('X-API-Key');
    const CHATBOT_API_KEY = process.env.CHATBOT_API_KEY || 'chatbot-api-key-2024-change-in-production';

    if (apiKey === CHATBOT_API_KEY) {
      console.log('[AUTH] Autenticado via API Key (Chatbot)');
      req.authMethod = 'apiKey';
      return next();
    }

    // Opción 2: JWT Token (para dashboard y tokens públicos)
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Acceso denegado. Se requiere autenticación.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token público (type: 'public')
    if (decoded.type === 'public') {
      console.log('[AUTH] Autenticado via Token Público');
      req.authMethod = 'publicToken';
      req.tokenData = decoded;
      return next();
    }

    // Token admin (buscar usuario en BD)
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Usuario no encontrado o inactivo' });
    }

    req.user = user;
    req.authMethod = 'jwt';
    next();

  } catch (error) {
    console.error('[AUTH] Error:', error.message);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = { flexibleAuth };
```

### auth.js

**Middleware de autenticación JWT con permisos**.

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ message: 'Acceso denegado' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Usuario inválido' });
      }

      // Verificar permisos
      if (requiredPermission && !user.permissions.includes(requiredPermission)) {
        return res.status(403).json({ message: 'Permisos insuficientes' });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token inválido' });
    }
  };
};

module.exports = auth;
```

### publicTokenAuth.js

**Middleware específico para tokens públicos**.

```javascript
const jwt = require('jsonwebtoken');

const publicTokenAuth = (req, res, next) => {
  try {
    // Buscar token en query params O header
    let token = req.query.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Token público requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'public') {
      return res.status(403).json({ message: 'Token inválido' });
    }

    req.tokenData = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado (válido 7 horas)' });
    }
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = publicTokenAuth;
```

## Services

### googleCalendarService.js

**Singleton para Google Calendar API**.

```javascript
const { google } = require('googleapis');
const path = require('path');

class GoogleCalendarService {
  constructor() {
    this.calendar = null;
    this.isInitialized = false;
  }

  async ensureInitialized() {
    if (this.isInitialized) return;

    try {
      const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        path.join(__dirname, '../../credentials.json');

      const auth = new google.auth.GoogleAuth({
        keyFile: CREDENTIALS_PATH,
        scopes: ['https://www.googleapis.com/auth/calendar']
      });

      this.calendar = google.calendar({ version: 'v3', auth });
      this.isInitialized = true;

      console.log('[CALENDAR] Google Calendar inicializado correctamente');
    } catch (error) {
      console.error('[CALENDAR] Error al inicializar:', error);
      throw error;
    }
  }

  async createCalendarEvent(appointment) {
    await this.ensureInitialized();

    try {
      const { date, time, clientName, socialWork, phone, isSobreturno } = appointment;

      // Crear fecha/hora de inicio
      const startTime = new Date(`${date}T${time}:00`);
      const endTime = new Date(startTime.getTime() + 15 * 60000); // +15 minutos

      const event = {
        summary: `${isSobreturno ? '[SOBRETURNO] ' : ''}Consulta - ${clientName}`,
        description: `Paciente: ${clientName}\nObra Social: ${socialWork}\nTeléfono: ${phone}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires'
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires'
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 60 }
          ]
        }
      };

      const result = await this.calendar.events.insert({
        calendarId: process.env.CALENDAR_ID,
        requestBody: event
      });

      console.log('[CALENDAR] Evento creado:', result.data.id);
      return result.data;
    } catch (error) {
      console.error('[CALENDAR] Error al crear evento:', error);
      throw error;
    }
  }

  async syncEventsForDate(date) {
    await this.ensureInitialized();

    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const response = await this.calendar.events.list({
      calendarId: process.env.CALENDAR_ID,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      timeZone: 'America/Argentina/Buenos_Aires'
    });

    return response.data.items;
  }

  async testConnection() {
    await this.ensureInitialized();

    const response = await this.calendar.calendarList.list();
    return response.data.items;
  }
}

// Exportar singleton
module.exports = new GoogleCalendarService();
```

## Variables de Entorno

### .env

```env
# MongoDB
MONGODB_URI=mongodb://username:password@host:port/database?authSource=admin

# Server
PORT=3001
NODE_ENV=production

# Google Calendar
CALENDAR_ID=email@gmail.com
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3008,https://micitamedica.me

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# Chatbot API Key
CHATBOT_API_KEY=chatbot-api-key-2024-change-in-production
```

## Scripts Útiles

### sync-all-appointments.js

**Migración única para sincronizar citas existentes con Google Calendar**.

```bash
node scripts/sync-all-appointments.js
```

### test-calendar.js

**Test de conexión con Google Calendar**.

```bash
node scripts/test-calendar.js
```

### create-admin.js

**Crear usuario administrador**.

```bash
node scripts/create-admin.js
```

## Comandos de Desarrollo

### Iniciar servidor

```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm run start
```

### Testing

```bash
# Test MongoDB
node scripts/test-connection.js

# Test Google Calendar
node scripts/test-calendar.js

# Test configuración de sobreturnos
node scripts/test-sobreturno-config.js
```

## Patrones de Desarrollo

### Validación de Entrada

```javascript
exports.functionName = async (req, res) => {
  try {
    const { field1, field2 } = req.body;

    // Validar campos requeridos
    if (!field1 || !field2) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes'
      });
    }

    // Validar duplicados
    const existente = await Model.findOne({ field1, field2 });
    if (existente) {
      return res.status(409).json({
        error: 'Registro duplicado'
      });
    }

    // Continuar...
  } catch (error) {
    console.error('[ERROR]:', error);
    res.status(500).json({ error: error.message });
  }
};
```

### Logging

```javascript
console.log('[DEBUG] Mensaje de debug');
console.error('[ERROR] Mensaje de error:', error);
console.warn('[WARN] Advertencia');
console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
```

### Respuestas Consistentes

```javascript
// Éxito
res.json({
  success: true,
  data: resultado,
  message: 'Operación exitosa'
});

// Error
res.status(400).json({
  success: false,
  error: 'Mensaje de error',
  details: errorDetails
});
```

### Manejo de Fechas

```javascript
// Siempre usar formato YYYY-MM-DD
const date = '2026-01-19';

// Crear Date con timezone correcto
const startTime = new Date(`${date}T${time}:00`);

// Timezone Argentina
timeZone: 'America/Argentina/Buenos_Aires'
```

## Horarios de Sobreturnos

**Mapeo hardcodeado** (usado en `createSobreturno` y `getSobreturnosByDate`):

```javascript
const HORARIOS_SOBRETURNOS = {
  // Mañana (11:00 - 12:00)
  1: '11:00',
  2: '11:15',
  3: '11:30',
  4: '11:45',
  5: '12:00',

  // Tarde (19:00 - 20:00)
  6: '19:00',
  7: '19:15',
  8: '19:30',
  9: '19:45',
  10: '20:00'
};

// Uso
const time = HORARIOS_SOBRETURNOS[sobreturnoNumber];
```

## Seguridad

### Autenticación Multi-Nivel

1. **Sin autenticación**: `/api/health`
2. **API Key**: Chatbot (`X-API-Key` header)
3. **Token Público**: Usuarios desde chatbot (JWT con `type: 'public'`)
4. **JWT Admin**: Dashboard (JWT con permisos)

### CORS Configurado

```javascript
cors({
  origin: [
    'http://localhost:5173',     // Frontend dev
    'http://localhost:3008',     // Chatbot
    'https://micitamedica.me'    // Producción
  ],
  credentials: true
})
```

### Generación de Token Público

```javascript
// tokenController.js
const publicToken = jwt.sign(
  {
    type: 'public',
    permissions: ['view_available_times', 'create_appointment'],
    source: 'chatbot'
  },
  process.env.JWT_SECRET,
  { expiresIn: '7h' }
);
```

## Debugging

### Logs de Request

```javascript
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('Headers:', req.headers);
  next();
});
```

### Error Handling

```javascript
// errorHandler.js
module.exports = (err, req, res, next) => {
  console.error('[ERROR HANDLER]:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
```

## Convenciones

### Naming

- **Archivos**: camelCase (`sobreturnoController.js`)
- **Variables**: camelCase (`sobreturnoNumber`)
- **Constantes**: UPPER_SNAKE_CASE (`CHATBOT_API_KEY`)
- **Modelos**: PascalCase (`Sobreturno`)

### Estructura de Controller

```javascript
exports.functionName = async (req, res) => {
  try {
    // 1. Extraer datos de req.body/req.params/req.query
    // 2. Validar entrada
    // 3. Buscar/crear/actualizar en BD
    // 4. Operaciones adicionales (Calendar, etc.)
    // 5. Responder con éxito
  } catch (error) {
    // Logging y respuesta de error
  }
};
```

## Próximos Pasos Comunes

### Agregar Nuevo Endpoint

1. Crear función en controller
2. Agregar ruta en routes
3. Configurar middleware apropiado
4. Documentar en CLAUDE.md

### Modificar Schema

1. Actualizar modelo en `models/`
2. Si cambia estructura, crear script de migración
3. Actualizar validaciones en controller
4. Actualizar tipos en frontend

### Integrar Nuevo Servicio Externo

1. Crear archivo en `services/`
2. Usar patrón singleton si es necesario
3. Configurar credenciales en `.env`
4. Agregar tests en `scripts/`

## Archivos Clave de Referencia

1. **server.js** - Entry point y configuración
2. **sobreturnoController.js** - Lógica de sobreturnos
3. **googleCalendarService.js** - Integración Calendar
4. **flexibleAuth.js** - Autenticación dual
5. **sobreturno.js** - Schema de sobreturnos

---

**Última actualización**: 2026-01-19
