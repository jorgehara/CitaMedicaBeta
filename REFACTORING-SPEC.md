# REFACTORING-SPEC: CitaMedica → Multi-Tenant

**Objetivo:** Convertir CitaMedica en un sistema multi-tenant que soporte múltiples clínicas
desde el mismo repositorio, mismo VPS y misma base de datos.
**Constraint absoluto:** El cliente actual (`micitamedica.me`) no debe ver ningún cambio.
**Fecha:** 2026-03-12

---

## Contexto: Los dos tenants

| # | Tenant | Subdominio | Especialidad |
|---|--------|-----------|--------------|
| 1 | Dr. Kulinka (cliente actual) | `micitamedica.me` | Médico clínico |
| 2 | Od. Melina Villalba (nuevo) | `od-melinavillalba.micitamedica.me` | Odontología |

Ambos comparten: mismo backend (puerto 3001), misma DB MongoDB, mismo repositorio Git.

---

## Estrategia: Resolución de tenant por subdominio

El backend detecta de qué clínica es cada request leyendo el header `Host`:
- `micitamedica.me` → clinicId del Tenant #1
- `od-melinavillalba.micitamedica.me` → clinicId del Tenant #2

Esto requiere **cero cambios en el frontend** durante las primeras fases.

---

## FASE 0 — Modelos + Migración (CERO cambios de comportamiento)

**Qué hace:** Prepara la base de datos. Nada cambia en la API ni en el frontend.
**Riesgo:** Ninguno. El campo `clinicId` se agrega como opcional con default null.

### 0.1 Nuevo modelo: `Clinic`

Crear `backend/src/models/clinic.js`:

```javascript
const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true }, // "micitamedica", "od-melinavillalba"
  name: { type: String, required: true },               // "Consultorio Dr. Kulinka"
  subdomain: { type: String, default: null },           // null = dominio raíz

  settings: {
    timezone: { type: String, default: 'America/Argentina/Buenos_Aires' },
    appointmentDuration: { type: Number, default: 15 }, // minutos
    maxSobreturnos: { type: Number, default: 10 },
    businessHours: {
      morning:   { start: { type: String, default: '10:00' }, end: { type: String, default: '11:45' }, enabled: { type: Boolean, default: true } },
      afternoon: { start: { type: String, default: '17:00' }, end: { type: String, default: '19:45' }, enabled: { type: Boolean, default: true } }
    },
    sobreturnoHours: {
      morning:   { start: { type: String, default: '11:00' }, end: { type: String, default: '12:00' }, enabled: { type: Boolean, default: true } },
      afternoon: { start: { type: String, default: '19:00' }, end: { type: String, default: '20:00' }, enabled: { type: Boolean, default: true } }
    }
  },

  // Obras sociales configurables por clínica (reemplaza el enum hardcodeado)
  socialWorks: {
    type: [String],
    default: ['INSSSEP', 'Swiss Medical', 'OSDE', 'Galeno', 'CONSULTA PARTICULAR', 'Otras Obras Sociales']
  },

  googleCalendar: {
    calendarId: { type: String, default: null },
    credentialsPath: { type: String, default: null }, // path absoluto al credentials.json en el server
    connected: { type: Boolean, default: false }
  },

  chatbot: {
    webhookUrl: { type: String, default: null }, // ej: http://localhost:3008/api/notify-appointment
    apiKey: { type: String, default: null },
    active: { type: Boolean, default: false }
  },

  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Clinic', clinicSchema);
```

### 0.2 Agregar `clinicId` a los modelos existentes

**En `appointment.js`, `sobreturno.js`, `user.js`, `unavailability.js` — agregar el mismo campo:**

```javascript
// Agregar al schema (al final, antes del cierre del objeto de campos):
clinicId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Clinic',
  default: null  // null durante migración, obligatorio después
}
```

⚠️ Mantener `default: null` — no poner `required: true` todavía. Eso viene en Fase 1.

### 0.3 Script de migración

Crear `backend/migrate-to-multitenant.js`:

```javascript
// EJECUTAR UNA SOLA VEZ: node migrate-to-multitenant.js
require('dotenv').config();
const mongoose = require('mongoose');
const Clinic = require('./src/models/clinic');
const Appointment = require('./src/models/appointment');
const Sobreturno = require('./src/models/sobreturno');
const User = require('./src/models/user');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado a MongoDB');

  // 1. Crear Tenant #1 (cliente actual)
  let clinic1 = await Clinic.findOne({ slug: 'micitamedica' });
  if (!clinic1) {
    clinic1 = await Clinic.create({
      slug: 'micitamedica',
      name: 'Consultorio Dr. Kulinka',
      subdomain: null, // dominio raíz
      googleCalendar: {
        calendarId: process.env.CALENDAR_ID,
        credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        connected: true
      },
      chatbot: {
        webhookUrl: 'http://localhost:3008/api/notify-appointment',
        apiKey: process.env.CHATBOT_API_KEY,
        active: true
      }
    });
    console.log('Clinic #1 creada:', clinic1._id);
  } else {
    console.log('Clinic #1 ya existe:', clinic1._id);
  }

  // 2. Asignar clinicId a todos los documentos existentes
  const r1 = await Appointment.updateMany({ clinicId: null }, { $set: { clinicId: clinic1._id } });
  const r2 = await Sobreturno.updateMany({ clinicId: null }, { $set: { clinicId: clinic1._id } });
  const r3 = await User.updateMany({ clinicId: null }, { $set: { clinicId: clinic1._id } });

  console.log(`Appointments migrados: ${r1.modifiedCount}`);
  console.log(`Sobreturnos migrados:  ${r2.modifiedCount}`);
  console.log(`Usuarios migrados:     ${r3.modifiedCount}`);
  console.log('✅ Migración completada. Cliente actual intacto.');

  await mongoose.disconnect();
}

migrate().catch(err => { console.error(err); process.exit(1); });
```

### 0.4 Crear Tenant #2

Crear `backend/create-clinic-odontologa.js`:

```javascript
// EJECUTAR UNA SOLA VEZ: node create-clinic-odontologa.js
require('dotenv').config();
const mongoose = require('mongoose');
const Clinic = require('./src/models/clinic');
const User = require('./src/models/user');
const bcrypt = require('bcryptjs');

async function createClinic() {
  await mongoose.connect(process.env.MONGODB_URI);

  const clinic2 = await Clinic.create({
    slug: 'od-melinavillalba',
    name: 'Od. Melina Villalba',
    subdomain: 'od-melinavillalba',
    settings: {
      appointmentDuration: 30, // odontología usa turnos de 30 min
      businessHours: {
        morning:   { start: '09:00', end: '12:00', enabled: true },
        afternoon: { start: '15:00', end: '19:00', enabled: true }
      },
      sobreturnoHours: {
        morning:   { start: '12:00', end: '13:00', enabled: true },
        afternoon: { start: '19:00', end: '20:00', enabled: true }
      }
    },
    socialWorks: [
      'OSDE Dental',
      'Swiss Medical Dental',
      'OMINT',
      'Galeno Dental',
      'CONSULTA PARTICULAR',
      'Otras Obras Sociales'
    ],
    googleCalendar: {
      // Completar después de crear el Google Calendar de la odontóloga
      calendarId: null,
      credentialsPath: '/var/www/od-melinavillalba/credentials.json',
      connected: false
    },
    chatbot: {
      webhookUrl: 'http://localhost:3009/api/notify-appointment', // puerto diferente
      apiKey: 'GENERAR-API-KEY-ODONTOLOGA',
      active: false // activar cuando el chatbot esté listo
    }
  });

  // Crear usuario admin para la odontóloga
  const hashedPassword = await bcrypt.hash('CambiarEstaPassword123!', 10);
  await User.create({
    nombre: 'Od. Melina Villalba',
    email: 'admin@od-melinavillalba.micitamedica.me',
    password: hashedPassword,
    role: 'admin',
    clinicId: clinic2._id,
    activo: true
  });

  console.log('✅ Clinic #2 creada:', clinic2._id);
  console.log('✅ Admin creado: admin@od-melinavillalba.micitamedica.me');
  await mongoose.disconnect();
}

createClinic().catch(err => { console.error(err); process.exit(1); });
```

### Verificación Fase 0
```bash
node migrate-to-multitenant.js
# Resultado esperado: todos los documentos tienen clinicId asignado

node create-clinic-odontologa.js
# Resultado esperado: Clinic #2 y usuario admin creados

# Verificar que micitamedica.me sigue funcionando exactamente igual
curl https://micitamedica.me/api/health
```

---

## FASE 1 — Backend Multi-Tenant (frontend sin cambios)

**Qué hace:** Cada request lleva su clinicId. Queries aisladas por clínica.
**Riesgo:** Bajo. El cliente actual sigue usando la misma URL y mismo JWT.

### 1.1 Middleware: `tenantResolver`

Crear `backend/src/middleware/tenantResolver.js`:

```javascript
const Clinic = require('../models/clinic');

// Cache simple en memoria para no consultar DB en cada request
const clinicCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function getClinicBySubdomain(subdomain) {
  const cacheKey = subdomain || 'root';
  const cached = clinicCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.clinic;

  const query = subdomain ? { subdomain } : { subdomain: null };
  const clinic = await Clinic.findOne({ ...query, active: true });
  if (clinic) clinicCache.set(cacheKey, { clinic, ts: Date.now() });
  return clinic;
}

module.exports = async function tenantResolver(req, res, next) {
  try {
    const host = req.headers.host || '';
    // host puede ser: "micitamedica.me" o "od-melinavillalba.micitamedica.me"
    const parts = host.split('.');
    // Si tiene 3+ partes y no es "www", la primera parte es el subdominio del tenant
    const subdomain = parts.length >= 3 && parts[0] !== 'www' ? parts[0] : null;

    const clinic = await getClinicBySubdomain(subdomain);
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clínica no encontrada' });
    }

    req.clinic = clinic;
    req.clinicId = clinic._id;
    next();
  } catch (err) {
    next(err);
  }
};
```

### 1.2 Registrar middleware en `server.js`

```javascript
// Agregar después de los middlewares existentes, ANTES de registrar las rutas:
const tenantResolver = require('./src/middleware/tenantResolver');
app.use('/api', tenantResolver); // aplica a todas las rutas /api/*
```

### 1.3 Actualizar `authController.js` — incluir `clinicId` en el JWT

En la función `login()`, cambiar la generación del token:

```javascript
// ANTES:
const token = jwt.sign(
  { userId: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '3d' }
);

// DESPUÉS:
const token = jwt.sign(
  { userId: user._id, email: user.email, role: user.role, clinicId: user.clinicId },
  process.env.JWT_SECRET,
  { expiresIn: '3d' }
);
```

También en `login()`, agregar validación de que el usuario pertenece a la clínica del request:

```javascript
// Después de verificar la contraseña, antes de generar el token:
if (user.clinicId.toString() !== req.clinicId.toString()) {
  return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
}
```

### 1.4 Actualizar todos los controllers — agregar `clinicId` a queries

**Patrón general:** En cada consulta de MongoDB, agregar `clinicId: req.clinicId`.

**`appointmentController.js` — cambios tipo:**

```javascript
// ANTES:
const appointments = await Appointment.find({ date });

// DESPUÉS:
const appointments = await Appointment.find({ date, clinicId: req.clinicId });
```

```javascript
// ANTES (crear):
const appointment = new Appointment({ clientName, phone, ... });

// DESPUÉS (crear):
const appointment = new Appointment({ clientName, phone, ..., clinicId: req.clinicId });
```

**Lista completa de métodos a actualizar en `appointmentController.js`:**
- `getAppointments` → añadir `clinicId` al find
- `getAllAppointments` → añadir `clinicId` al find
- `getAvailableAppointments` → añadir `clinicId` al find
- `getReservedAppointments` → añadir `clinicId` al find
- `createAppointment` → añadir `clinicId` al new Appointment()
- `updateAppointment` → añadir `clinicId` al findOne() para verificar ownership
- `deleteAppointment` → ídem
- `updateDescription` → ídem
- `updatePaymentStatus` → ídem

**`sobreturnoController.js` — mismos cambios en todos sus métodos.**

**`unavailabilityController.js` — mismos cambios.**

### 1.5 Actualizar Google Calendar service — usar config de la clínica

El `googleCalendarService.js` actual es un singleton. Convertirlo en factory:

```javascript
// ANTES (singleton al inicio del archivo):
let auth, calendar;
async function ensureInitialized() {
  if (auth) return;
  // usa process.env.GOOGLE_APPLICATION_CREDENTIALS
}

// DESPUÉS (factory por clínica):
const instances = new Map();

async function getCalendarService(clinic) {
  const key = clinic._id.toString();
  if (instances.has(key)) return instances.get(key);

  const { calendarId, credentialsPath } = clinic.googleCalendar;
  if (!calendarId || !credentialsPath || !clinic.googleCalendar.connected) {
    return null; // esta clínica no tiene Calendar configurado
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/calendar']
  });
  const calendarClient = google.calendar({ version: 'v3', auth });
  const service = { auth, calendar: calendarClient, calendarId };
  instances.set(key, service);
  return service;
}

module.exports = { getCalendarService };
```

En los controllers, cambiar el uso:

```javascript
// ANTES:
const calendarService = require('../services/googleCalendarService');
await calendarService.createCalendarEvent(appointment);

// DESPUÉS:
const { getCalendarService } = require('../services/googleCalendarService');
const calendarService = await getCalendarService(req.clinic);
if (calendarService) {
  await calendarService.createCalendarEvent(appointment);
}
```

### 1.6 Chatbot webhook — usar URL de la clínica

En `appointmentController.js` y `sobreturnoController.js`, donde se notifica al chatbot:

```javascript
// ANTES:
await axios.post('http://localhost:3008/api/notify-appointment', { ... });

// DESPUÉS:
if (req.clinic.chatbot.active && req.clinic.chatbot.webhookUrl) {
  await axios.post(req.clinic.chatbot.webhookUrl, { ... }, {
    headers: { 'X-API-Key': req.clinic.chatbot.apiKey }
  }).catch(err => console.log('Chatbot notification failed (non-critical):', err.message));
}
```

### 1.7 Endpoint de configuración pública de la clínica

Agregar en `server.js` o en una nueva ruta `/api/clinic`:

```javascript
// GET /api/clinic/config — público, no requiere auth
router.get('/clinic/config', async (req, res) => {
  const clinic = req.clinic;
  res.json({
    success: true,
    data: {
      name: clinic.name,
      slug: clinic.slug,
      socialWorks: clinic.socialWorks,
      settings: clinic.settings,
      branding: clinic.branding || {}
    }
  });
});
```

### Verificación Fase 1
```bash
# Reiniciar backend
pm2 restart backend

# El cliente actual sigue funcionando
curl https://micitamedica.me/api/health
curl -X POST https://micitamedica.me/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cita-medica.com","password":"admin123"}'

# La nueva clínica responde
curl https://od-melinavillalba.micitamedica.me/api/health
curl https://od-melinavillalba.micitamedica.me/api/clinic/config

# Un usuario de clinic1 NO puede loguearse en clinic2 y viceversa
```

---

## FASE 2 — Configuración dinámica (sacar hardcodes)

**Qué hace:** Las obras sociales, horarios y duración de turnos se leen de la DB en lugar de estar fijos en el código.
**Riesgo:** Bajo, porque ya tenemos los valores guardados en la Clinic del Tenant #1.

### 2.1 Obras sociales — dejar de usar el enum

**En `appointment.js` y `sobreturno.js`:**

```javascript
// ANTES:
socialWork: {
  type: String,
  enum: ['INSSSEP', 'Swiss Medical', 'OSDE', 'Galeno', 'CONSULTA PARTICULAR', 'Otras Obras Sociales'],
  default: 'CONSULTA PARTICULAR'
}

// DESPUÉS:
socialWork: {
  type: String,
  default: 'CONSULTA PARTICULAR'
  // La validación del enum la hace el controller con req.clinic.socialWorks
}
```

**En el controller, validar contra la lista de la clínica:**

```javascript
// En createAppointment():
const validSocialWorks = req.clinic.socialWorks;
if (socialWork && !validSocialWorks.includes(socialWork)) {
  return res.status(400).json({ success: false, message: 'Obra social no válida para esta clínica' });
}
```

### 2.2 Horarios fijos — leerlos de la clínica

En los controllers donde se calculan los time slots disponibles:

```javascript
// ANTES:
const MORNING_SLOTS = ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45'];
const AFTERNOON_SLOTS = ['17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45'];

// DESPUÉS:
function generateSlots(start, end, durationMinutes) {
  const slots = [];
  let [h, m] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  while (h * 60 + m <= endH * 60 + endM) {
    slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    m += durationMinutes;
    if (m >= 60) { h += Math.floor(m/60); m = m % 60; }
  }
  return slots;
}

const { businessHours, appointmentDuration } = req.clinic.settings;
const morningSlots = businessHours.morning.enabled
  ? generateSlots(businessHours.morning.start, businessHours.morning.end, appointmentDuration)
  : [];
const afternoonSlots = businessHours.afternoon.enabled
  ? generateSlots(businessHours.afternoon.start, businessHours.afternoon.end, appointmentDuration)
  : [];
const ALL_SLOTS = [...morningSlots, ...afternoonSlots];
```

---

## FASE 3 — Nginx: Subdominio nuevo

### Agregar en la configuración de Nginx en el VPS:

```nginx
# /etc/nginx/sites-available/od-melinavillalba.micitamedica.me
server {
    listen 443 ssl;
    server_name od-melinavillalba.micitamedica.me;

    ssl_certificate /etc/letsencrypt/live/od-melinavillalba.micitamedica.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/od-melinavillalba.micitamedica.me/privkey.pem;

    # Frontend — mismos archivos estáticos que el cliente original
    location / {
        root /var/www/CitaMedicaBeta/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API — mismo proceso Node.js, puerto 3001
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;        # CRÍTICO: pasa el subdominio al backend
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Obtener certificado SSL para el subdominio
certbot --nginx -d od-melinavillalba.micitamedica.me

# Habilitar el site
ln -s /etc/nginx/sites-available/od-melinavillalba.micitamedica.me \
      /etc/nginx/sites-enabled/
nginx -t && nginx -s reload
```

⚠️ **Importante:** El header `proxy_set_header Host $host;` es lo que permite al backend
saber desde qué subdominio viene la request. Sin esto, el tenantResolver no funciona.

---

## FASE 4 — Frontend: Config dinámica

**Qué hace:** El frontend carga la configuración de su clínica al iniciar (obras sociales, nombre, branding).
**Resultado:** Mismos archivos JS/HTML servidos, comportamiento diferente por tenant.

### 4.1 `ClinicConfigProvider` context

Crear `frontend/src/context/ClinicConfigContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from '../config/axios';

interface ClinicConfig {
  name: string;
  slug: string;
  socialWorks: string[];
  settings: {
    timezone: string;
    appointmentDuration: number;
    businessHours: {
      morning: { start: string; end: string; enabled: boolean };
      afternoon: { start: string; end: string; enabled: boolean };
    };
  };
}

const ClinicConfigContext = createContext<ClinicConfig | null>(null);

export function ClinicConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ClinicConfig | null>(null);

  useEffect(() => {
    axios.get('/clinic/config').then(res => setConfig(res.data.data));
  }, []);

  if (!config) return null; // o un spinner de carga

  return (
    <ClinicConfigContext.Provider value={config}>
      {children}
    </ClinicConfigContext.Provider>
  );
}

export const useClinicConfig = () => useContext(ClinicConfigContext)!;
```

### 4.2 Usar en `App.tsx`

```typescript
// Envolver el árbol de rutas con ClinicConfigProvider
<ClinicConfigProvider>
  <RouterProvider ... />
</ClinicConfigProvider>
```

### 4.3 Obras sociales dinámicas en formularios

```typescript
// ANTES (hardcoded en GlobalCreateAppointmentDialog.tsx):
const SOCIAL_WORKS = ['INSSSEP', 'Swiss Medical', 'OSDE', ...];

// DESPUÉS:
const { socialWorks } = useClinicConfig();
// usar socialWorks en lugar de la constante hardcodeada
```

---

## Orden de ejecución recomendado

```
1. git pull (asegurarse de tener el código actual)
2. Ejecutar FASE 0 (modelos + migration script) → verificar micitamedica.me OK
3. Ejecutar FASE 1 (backend) → deploy → verificar ambos subdominios
4. Ejecutar FASE 3 (Nginx) → habilitar subdominio
5. Ejecutar FASE 2 (hardcodes) → en la misma release que Fase 1 o por separado
6. Ejecutar FASE 4 (frontend) → último, cuando backend ya funciona al 100%
```

---

## Checklist de verificación final

```bash
# Tenant 1 — Sin cambios
curl https://micitamedica.me/api/health
curl https://micitamedica.me/api/clinic/config
# → socialWorks: ['INSSSEP', 'Swiss Medical', 'OSDE', ...]
# → appointmentDuration: 15

# Tenant 2 — Nuevo
curl https://od-melinavillalba.micitamedica.me/api/health
curl https://od-melinavillalba.micitamedica.me/api/clinic/config
# → name: "Od. Melina Villalba"
# → socialWorks: ['OSDE Dental', 'Swiss Medical Dental', ...]
# → appointmentDuration: 30

# Aislamiento de datos — un turno del Tenant 1 NO aparece en Tenant 2
# Crear turno en T1, verificar que GET en T2 no lo muestra
```
