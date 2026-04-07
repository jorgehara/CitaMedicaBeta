# Guía de Agentes para CitaMedicaBeta

Este documento proporciona una visión general del proyecto CitaMedicaBeta para que los agentes de Claude Code puedan entender rápidamente la estructura y trabajar de manera eficiente en futuras tareas.

## Visión General del Proyecto

**CitaMedicaBeta** es un sistema de gestión de citas médicas con las siguientes características:

- Gestión de citas regulares y sobreturnos
- Integración con chatbot de WhatsApp (ANITACHATBOT)
- Sincronización automática con Google Calendar
- Panel de administración web
- Sistema de tokens públicos para reservas desde chatbot
- Módulo de historias clínicas ATM/Bruxismo con seguimiento longitudinal

## Arquitectura del Sistema

```
CitaMedicaBeta/
├── backend/           # API REST - Node.js + Express + MongoDB
├── frontend/          # SPA - React + TypeScript + Vite + Material-UI
├── CLAUDE.md          # Instrucciones para Claude Code (LEER PRIMERO)
├── AGENTS.md          # Este archivo
└── .claude/           # Configuración de Claude Code
```

### Sistema Completo

```
┌─────────────────────┐
│  Usuario WhatsApp   │
│  (Cliente Final)    │
└──────────┬──────────┘
           │
           v
┌─────────────────────────────────────────┐
│      ANITACHATBOT (Puerto 3008)         │
│  C:\Users\...\AnitaByCitaMedica         │
│  - Genera tokens públicos               │
│  - Captura datos del paciente           │
│  - Envía links de reserva               │
└──────────┬──────────────────────────────┘
           │
           v
┌─────────────────────────────────────────┐
│   CitaMedicaBeta Frontend (Puerto 5173) │
│   - Dashboard de administración         │
│   - Páginas públicas de reserva         │
│   - Manejo de tokens públicos           │
└──────────┬──────────────────────────────┘
           │
           v
┌─────────────────────────────────────────┐
│   CitaMedicaBeta Backend (Puerto 3001)  │
│   - API REST                            │
│   - Lógica de negocio                   │
│   - Integración Google Calendar         │
└──────────┬──────────────────────────────┘
           │
           v
    ┌──────┴──────┐
    │             │
    v             v
┌─────────┐  ┌──────────────┐
│ MongoDB │  │ Google       │
│         │  │ Calendar API │
└─────────┘  └──────────────┘
```

## Tipos de Citas

El sistema maneja **dos tipos** de citas:

### 1. Citas Regulares (`isSobreturno: false`)
- Horarios normales del consultorio
- Gestión completa desde dashboard
- Endpoint: `/api/appointments`
- Modelo: `backend/src/models/appointment.js`
- Servicio: `frontend/src/services/appointmentService.ts`

### 2. Sobreturnos (`isSobreturno: true`)
- **10 slots adicionales por día**
- Horarios fijos:
  - Mañana (1-5): 11:00, 11:15, 11:30, 11:45, 12:00
  - Tarde (6-10): 19:00, 19:15, 19:30, 19:45, 20:00
- Endpoint: `/api/sobreturnos`
- Modelo: `backend/src/models/sobreturno.js`
- Servicio: `frontend/src/services/sobreturnoService.ts`

## Módulo de Historias Clínicas ATM

El sistema incluye un módulo completo de historias clínicas para pacientes ATM/Bruxismo:

### 1. Pacientes (`Patient`)
- Demografía: nombre, DNI, fecha de nacimiento, género, obra social
- Contacto: teléfono, email, dirección
- Historia médica: alergias, enfermedades crónicas, medicamentos
- **Número clínico auto-generado**: PAC-0001, PAC-0002, etc.
- Endpoint: `/api/patients`
- Modelo: `backend/src/models/patient.js`
- Servicio: `frontend/src/services/patientService.ts`

### 2. Historias Clínicas (`ClinicalHistory`)
- Anamnesis: motivo de consulta, enfermedad actual
- **Índices Helkimo**: AI (Anamnesis Index) y DI (Dysfunction Index)
- **Clasificación automática**: Sin síntomas / Leve / Moderado / Severo
- Examen clínico: extraoral, intraoral, palpación ATM/muscular, oclusión
- Síntomas: dolor, ruidos articulares, limitaciones
- Odontograma básico
- Diagnóstico y plan de tratamiento
- Endpoint: `/api/clinical-histories`
- Modelo: `backend/src/models/clinicalHistory.js`
- Servicio: `frontend/src/services/clinicalHistoryService.ts`

### 3. Seguimientos (`FollowUp`)
- Evolución del paciente por fecha
- Actualización de síntomas (mejorado/empeorado/estable)
- Actualizaciones de tratamiento
- Prescripciones
- Fotos de seguimiento
- Endpoint: `/api/follow-ups`
- Modelo: `backend/src/models/followUp.js`
- Servicio: `frontend/src/services/followUpService.ts`

### Relación con Citas
- Cada cita puede estar vinculada a un paciente (campo `patientId`)
- Desde `SimpleAppointmentList` hay botón "Historia Clínica" para acceso directo
- Permite ver/editar historia clínica desde el contexto de la cita

### Páginas Frontend
- **`/patients`**: Lista de pacientes con búsqueda por nombre/DNI/número clínico
- **`/patients/:id`**: Detalle del paciente con 3 tabs:
  - Info del paciente (demografía + historia médica)
  - Historias clínicas (lista + formulario de creación)
  - Seguimientos (timeline + formulario de evolución)

## Estructura de Directorios

### Backend (`backend/`)
```
backend/
├── src/
│   ├── models/           # Mongoose schemas
│   │   ├── appointment.js      # Citas regulares
│   │   ├── sobreturno.js       # Sobreturnos
│   │   ├── patient.js          # Pacientes (historias clínicas)
│   │   ├── clinicalHistory.js  # Historias clínicas ATM
│   │   └── followUp.js         # Seguimientos longitudinales
│   ├── controllers/      # Request handlers
│   │   ├── appointmentController.js
│   │   ├── sobreturnoController.js
│   │   ├── patientController.js
│   │   ├── clinicalHistoryController.js
│   │   └── followUpController.js
│   ├── routes/           # Express routes
│   │   ├── appointmentRoutes.js
│   │   ├── sobreturnoRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── clinicalHistoryRoutes.js
│   │   └── followUpRoutes.js
│   ├── services/         # Business logic
│   │   ├── googleCalendarService.js  # Singleton service
│   │   └── calendarSync.js
│   ├── middleware/       # Express middleware
│   │   ├── flexibleAuth.js         # API Key O JWT
│   │   └── errorHandler.js
│   ├── config/           # Configuration
│   └── scripts/          # Utility scripts
├── server.js             # Entry point
└── credentials.json      # Google service account
```

### Frontend (`frontend/`)
```
frontend/
├── src/
│   ├── pages/            # Main route components
│   │   ├── Dashboard.tsx         # Main dashboard
│   │   ├── Schedule.tsx          # Schedule management
│   │   ├── History.tsx           # Appointment history
│   │   ├── BookAppointment.tsx   # Public booking (citas)
│   │   ├── SelectOverturn.tsx    # Public booking (sobreturnos)
│   │   ├── PatientList.tsx       # Patient list with search
│   │   └── PatientDetail.tsx     # Patient detail with clinical histories
│   ├── components/       # Reusable UI components
│   │   ├── Layout.tsx                      # Main layout
│   │   ├── AppointmentList.tsx             # Full list
│   │   ├── SimpleAppointmentList.tsx       # Compact list
│   │   ├── CreateOverturnDialog.tsx        # Sobreturno dialog
│   │   ├── GlobalCreateAppointmentDialog.tsx
│   │   ├── ClinicalHistoryForm.tsx         # Clinical history form
│   │   ├── FollowUpForm.tsx                # Follow-up form
│   │   └── CreatePatientDialog.tsx         # Patient creation dialog
│   ├── services/         # API client services
│   │   ├── appointmentService.ts
│   │   ├── sobreturnoService.ts
│   │   ├── patientService.ts
│   │   ├── clinicalHistoryService.ts
│   │   └── followUpService.ts
│   ├── config/
│   │   └── axios.ts      # Axios config (30s timeout, retry)
│   ├── types/
│   │   └── appointment.ts
│   ├── context/          # React contexts
│   └── App.tsx           # Routes
└── package.json
```

## Endpoints Principales

### Citas Regulares
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/appointments` | Listar todas las citas |
| GET | `/api/appointments/available/:date` | Horarios disponibles |
| POST | `/api/appointments` | Crear cita |
| POST | `/api/appointments/public/book` | Crear cita (público con token) |
| PUT | `/api/appointments/:id` | Actualizar cita |
| DELETE | `/api/appointments/:id` | Eliminar cita |
| PATCH | `/api/appointments/:id/payment` | Actualizar estado de pago |
| PATCH | `/api/appointments/:id/description` | Actualizar descripción |

### Sobreturnos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/sobreturnos` | Listar todos los sobreturnos |
| GET | `/api/sobreturnos/date/:date` | **Disponibles por fecha** (usado en SelectOverturn) |
| GET | `/api/sobreturnos/validate` | Validar disponibilidad |
| POST | `/api/sobreturnos` | Crear sobreturno |
| POST | `/api/sobreturnos/reserve` | Reservar (chatbot) |
| PUT | `/api/sobreturnos/:id` | Actualizar sobreturno |
| DELETE | `/api/sobreturnos/:id` | Eliminar sobreturno |
| PATCH | `/api/sobreturnos/:id/payment` | Actualizar estado de pago |
| PATCH | `/api/sobreturnos/:id/description` | Actualizar descripción |
| PATCH | `/api/sobreturnos/:id/status` | Actualizar estado |

## Autenticación

### Sistema Dual (flexibleAuth middleware)

**1. API Key (Chatbot)**
- Header: `X-API-Key: <CHATBOT_API_KEY>`
- Usado por ANITACHATBOT en puerto 3008
- Permite crear citas y sobreturnos

**2. JWT Token (Dashboard Admin)**
- Header: `Authorization: Bearer <JWT_TOKEN>`
- Usado por dashboard administrativo
- Acceso completo a todas las operaciones

**3. Token Público (Usuarios desde chatbot)**
- Query param: `?token=<PUBLIC_TOKEN>`
- Válido por 7 horas
- Permisos limitados: crear citas/sobreturnos, ver disponibles
- Se guarda en `localStorage` como `public_token`

## Flujos de Trabajo Importantes

### Flujo 1: Reserva de Sobreturno desde Chatbot

```
1. Usuario contacta chatbot WhatsApp
2. Chatbot captura datos (nombre, obra social, teléfono)
3. Chatbot genera token público:
   POST /api/auth/generate-public-token
4. Chatbot envía link:
   https://micitamedica.me/seleccionar-sobreturno?token=JWT
5. Usuario abre link → SelectOverturn.tsx
6. Página extrae token → localStorage
7. Carga sobreturnos disponibles:
   GET /api/sobreturnos/date/2026-01-19
8. Usuario selecciona sobreturno y completa datos
9. Envía formulario:
   POST /api/sobreturnos/
10. Backend calcula horario automáticamente
11. Backend crea evento en Google Calendar
12. Usuario ve pantalla de confirmación
```

### Flujo 2: Gestión desde Dashboard

```
1. Admin hace login → JWT token
2. Dashboard carga citas del día:
   GET /api/appointments?date=2026-01-19
   GET /api/sobreturnos?date=2026-01-19
3. Admin puede:
   - Crear nuevas citas
   - Marcar asistencia
   - Marcar como pagado
   - Editar descripción
   - Eliminar citas
4. Cambios se reflejan automáticamente cada 1 minuto
```

## Google Calendar Integration

### Servicio Singleton
- Archivo: `backend/src/services/googleCalendarService.js`
- Autenticación: Service Account via `credentials.json`
- Timezone: `America/Argentina/Buenos_Aires`
- Duración: 15 minutos por defecto

### Operaciones
```javascript
// Crear evento
createCalendarEvent(appointment) → googleEventId

// Sincronizar eventos de una fecha
syncEventsForDate(date)

// Test de conexión
testConnection()
```

### Cuando se crea/confirma
1. Se crea evento en Google Calendar
2. Se guarda `googleEventId` en MongoDB
3. Se envía recordatorio 60 min antes

## Patrones y Convenciones

### Diferenciación de Tipos
```typescript
// Detectar tipo
if (appointment.isSobreturno) {
  // Usar sobreturnoService
  await sobreturnoService.delete(id);
} else {
  // Usar appointmentService
  await appointmentService.delete(id);
}
```

### Obras Sociales (enum compartido)
```typescript
'INSSSEP' | 'Swiss Medical' | 'OSDE' | 'Galeno' |
'CONSULTA PARTICULAR' | 'Otras Obras Sociales'
```

### Estados
```typescript
'pending' | 'confirmed' | 'cancelled'
```

### Formato de Fecha
```typescript
// Backend y frontend
date: 'YYYY-MM-DD'  // Ej: '2026-01-19'
time: 'HH:mm'       // Ej: '11:30'
```

## Configuración del Entorno

### Backend (.env)
```env
MONGODB_URI=mongodb://...
PORT=3001
CALENDAR_ID=email@gmail.com
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
CORS_ORIGINS=http://localhost:5173,https://micitamedica.me
JWT_SECRET=...
CHATBOT_API_KEY=...
NODE_ENV=production
```

### Frontend (.env)
```env
VITE_API_URL=https://micitamedica.me/api
```

## Comandos Útiles

### Backend
```bash
cd backend
npm run dev      # Desarrollo con nodemon
npm run start    # Producción
```

### Frontend
```bash
cd frontend
npm run dev      # Vite dev server (puerto 5173)
npm run build    # Build para producción
npx tsc --noEmit # Verificar tipos TypeScript
```

## Testing

### Backend Scripts de Test
- `test-calendar.js` - Test Google Calendar
- `test-connection.js` - Test MongoDB
- `sync-all-appointments.js` - Sincronizar citas existentes

### Frontend Debug
- Axios tiene logging deshabilitado (ver `frontend/src/config/axios.ts`)
- Logs en consola con prefijos: `[DEBUG]`, `[ERROR]`, `[WARN]`

## Archivos de Referencia Clave

Para entender rápidamente el sistema, lee estos archivos en orden:

1. **CLAUDE.md** - Instrucciones completas para Claude Code
2. **backend/server.js** - Entry point del backend
3. **frontend/src/App.tsx** - Rutas del frontend
4. **backend/src/models/sobreturno.js** - Schema de sobreturnos
5. **backend/src/controllers/sobreturnoController.js** - Lógica de negocio
6. **frontend/src/pages/Dashboard.tsx** - UI principal

## Documentación Detallada

Para información más detallada sobre áreas específicas:

- **Deploy completo** (backend, frontend, chatbot): [`docs/ops/deploy.md`](docs/ops/deploy.md)
- **Seguridad y API pública**: [`docs/ops/security.md`](docs/ops/security.md)
- **Configuración API Key y tokens del chatbot**: [`docs/chatbot/api-config.md`](docs/chatbot/api-config.md)
- **Testing**: [`docs/dev/testing.md`](docs/dev/testing.md)
- **PRD Historia Clínica ATM**: [`docs/specs/historia-clinica.md`](docs/specs/historia-clinica.md)
- **Frontend**: Ver `frontend/SUBAGENTS-FRONTEND.md`
- **Backend**: Ver `backend/SUBAGENTS-BACKEND.md`
- **Chatbot**: Proyecto separado en `C:\Users\JorgeHaraDevs\Desktop\AnitaByCitaMedica`

## Convenciones de Desarrollo

### No Hacer
- ❌ NO crear archivos .md innecesarios
- ❌ NO usar emojis a menos que el usuario lo solicite
- ❌ NO modificar archivos del chatbot (repo separado)
- ❌ NO cambiar esquemas de MongoDB sin migración
- ❌ NO exponer datos sensibles en URLs

### Hacer
- ✅ Seguir patrones establecidos (ver BookAppointment.tsx, Dashboard.tsx)
- ✅ Usar Material-UI para toda la UI
- ✅ Validar en frontend Y backend
- ✅ Manejar errores con try-catch y mensajes claros
- ✅ Logging con prefijos `[DEBUG]`, `[ERROR]`, `[WARN]`
- ✅ Usar TypeScript types del archivo `types/appointment.ts`
- ✅ Verificar tipos con `npx tsc --noEmit` antes de commit

## URLs de Producción

- **Frontend**: https://micitamedica.me
- **Backend API**: https://micitamedica.me/api
- **Chatbot**: http://localhost:3008 (local)

## Notas Importantes

1. **Sobreturnos vs Citas**: Son colecciones separadas en MongoDB, servicios separados en frontend, pero comparten schema similar
2. **Horarios de Sobreturnos**: Hardcodeados en el backend (líneas 299-314 de sobreturnoController.js)
3. **Token Público**: Válido 7 horas, se guarda en localStorage, no en URL después de carga inicial
4. **CORS**: Configurado para localhost:5173, localhost:3008, y producción
5. **Auto-refresh**: Dashboard se actualiza cada 1 minuto automáticamente
6. **Google Calendar**: Se crea evento automáticamente al confirmar cita/sobreturno

## Última Actualización

- **Fecha**: 2026-03-22
- **Cambio**: Agregado módulo completo de Historias Clínicas ATM/Bruxismo
- **Archivos nuevos**: 28 archivos (3 modelos backend, 3 controllers, 3 routes, 3 services frontend, 2 páginas, 7 componentes)
- **Funciones nuevas**: Gestión de pacientes, historias clínicas con índices Helkimo, seguimientos longitudinales
- **Rutas nuevas**: `/patients`, `/patients/:id`
- **Endpoints nuevos**: 11 endpoints REST (5 patients, 4 clinical-histories, 2 follow-ups)
