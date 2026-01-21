# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚠️ PROTOCOLO OBLIGATORIO DE TRABAJO

**CONTEXTO CRÍTICO**: Este proyecto está en **PRODUCCIÓN**. Todos los cambios son pequeños, incrementales y quirúrgicos. El cliente solicita mejoras sutiles o complementos al código existente. Un error cuesta días de trabajo.

**REGLA FUNDAMENTAL**: NUNCA escribir código sin completar las 3 FASES obligatorias.

---

### 📖 FASE 1: ENTENDIMIENTO (OBLIGATORIO)

Cuando recibas una tarea de modificación, DEBES hacer PRIMERO:

1. **Leer el código existente** relacionado con la tarea
   - Usa Read, Grep, Glob para explorar
   - Entiende el contexto actual antes de proponer cambios

2. **Hacer preguntas específicas** para clarificar EXACTAMENTE qué cambiar
   - ¿Qué funcionalidad específica hay que modificar?
   - ¿Hay algún comportamiento existente que deba preservarse?
   - ¿Cuál es el alcance exacto del cambio?

3. **Identificar el alcance mínimo** (qué tocar, qué NO tocar)
   - Lista archivos que SÍ se modificarán
   - Lista archivos que NO deben tocarse
   - Código mínimo necesario

4. **Detectar riesgos** (qué podría romperse)
   - Dependencias que podrían afectarse
   - Funcionalidades existentes que podrían fallar
   - Validaciones que podrían romperse

---

### 📋 FASE 2: PLAN (MOSTRAR Y ESPERAR APROBACIÓN)

Antes de escribir UNA SOLA LÍNEA de código, DEBES presentar:

```
## 📋 PLAN DE IMPLEMENTACIÓN

### RESUMEN (2-3 líneas):
[Qué voy a cambiar exactamente]

### ARCHIVOS A MODIFICAR:
1. ruta/archivo1.ext - [Qué cambio específico]
2. ruta/archivo2.ext - [Qué cambio específico]

### CAMBIOS DETALLADOS:
[Descripción específica de cada cambio]

### RIESGOS IDENTIFICADOS:
- ⚠️ [Qué podría fallar]
- ✅ [Mitigaciones]

### ❓ ¿Procedo con este plan?
```

**🛑 STOP AQUÍ - Esperar aprobación explícita del usuario antes de continuar**

---

### 🔨 FASE 3: IMPLEMENTACIÓN (PASO A PASO)

**SOLO después de aprobación explícita:**

1. **Un cambio a la vez**
   - Modificar un archivo
   - Explicar qué estás haciendo
   - Mostrar el cambio

2. **Código mínimo necesario**
   - No agregar funcionalidades extra
   - No refactorizar código que funciona
   - No "mejorar" cosas no solicitadas

3. **Verificar que funcione**
   - npx tsc --noEmit (si es TypeScript)
   - Compilación exitosa
   - Sin errores

4. **Actualizar TodoWrite** después de cada cambio completado

---

### 🚫 PROHIBICIONES ABSOLUTAS

- ❌ NO escribir código sin pasar por FASE 1 y FASE 2
- ❌ NO agregar features no solicitadas
- ❌ NO refactorizar código existente que funciona
- ❌ NO tocar archivos fuera del alcance mínimo
- ❌ NO asumir - SIEMPRE preguntar si hay duda

---

### ✅ PRINCIPIOS GUÍA

1. **Código en producción primero**: Preservar funcionalidad existente
2. **Cambios mínimos**: Solo lo estrictamente necesario
3. **Validación constante**: Verificar antes, durante y después
4. **Comunicación clara**: Explicar cada paso
5. **Esperar aprobación**: Nunca asumir que puedo proceder

---

## Project Overview

CitaMedicaBeta is a medical appointment scheduling system integrated with a chatbot and Google Calendar. The system manages two types of appointments: regular appointments and "sobreturnos" (overturn appointments - additional slots beyond regular capacity).

**Tech Stack:**
- Backend: Node.js + Express + MongoDB + Google Calendar API
- Frontend: React + TypeScript + Vite + Material-UI
- Architecture: Monorepo with separate frontend and backend directories

## Development Commands

### Backend (from `backend/` directory)
```bash
npm run start      # Start production server
npm run dev        # Start development server with nodemon
```

### Frontend (from `frontend/` directory)
```bash
npm run dev        # Start Vite dev server (port 5173)
npm run build      # Build for production (TypeScript + Vite)
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### Production Deployment
According to `comandos.md`:
- Backend: `npm run start`
- Frontend: `npm install && npm run build && npm run preview`

## Architecture

### Backend Structure (`backend/src/`)

**Core Directories:**
- `models/` - Mongoose schemas for MongoDB
  - `appointment.js` - Regular appointments (isSobreturno: false)
  - `sobreturno.js` - Overturn appointments (isSobreturno: true, max 10 per day)
- `controllers/` - Request handlers for routes
- `routes/` - Express route definitions
- `services/` - Business logic and external integrations
  - `googleCalendarService.js` - Singleton service for Google Calendar API
  - `calendarSync.js` - Synchronization logic
- `middleware/` - Express middleware (error handling, etc.)
- `config/` - Configuration files
- `scripts/` - Utility scripts

**Key Files:**
- `server.js` - Express app entry point, sets up CORS, connects to MongoDB, registers routes
- `credentials.json` - Google Calendar service account credentials (referenced by GOOGLE_APPLICATION_CREDENTIALS)

### Frontend Structure (`frontend/src/`)

**Core Directories:**
- `pages/` - Main route components
  - `Dashboard.tsx` - Main dashboard view
  - `Schedule.tsx` - Schedule management
  - `History.tsx` - Appointment history
- `components/` - Reusable UI components
  - `Layout.tsx` - Main layout wrapper
  - `AppointmentList.tsx` - List view of appointments
  - `CreateAppointmentButton.tsx` - Appointment creation trigger
  - `CreateOverturnDialog.tsx` - Sobreturno creation dialog
  - `GlobalCreateAppointmentDialog.tsx` - Global appointment creation
  - `SimpleAppointmentList.tsx` - Simplified appointment list
- `services/` - API client services
  - `appointmentService.ts` - Appointment API calls
  - `sobreturnoService.ts` - Sobreturno API calls
- `config/` - Configuration
  - `axios.ts` - Axios instance configured with baseURL (https://micitamedica.me/api)
- `context/` - React contexts
  - `ColorModeContext.tsx` - Theme context for light/dark mode
- `types/` - TypeScript type definitions

**Routing:**
- `/` - Dashboard
- `/horarios` - Schedule
- `/historial` - History

### Data Models

**Appointment Schema:**
- Core fields: `clientName`, `phone`, `email`, `date`, `time`, `socialWork`, `description`
- Status: `status` (pending/confirmed/cancelled), `attended` (boolean), `isPaid` (boolean)
- Integration: `googleEventId` (links to Google Calendar event), `isSobreturno` (false for regular)
- Social works enum: ['INSSSEP', 'Swiss Medical', 'OSDE', 'Galeno', 'CONSULTA PARTICULAR', 'Otras Obras Sociales']

**Sobreturno Schema:**
- Extends appointment with: `sobreturnoNumber` (1-10), `isAvailable` (boolean), `isSobreturno` (true)
- Stored in separate collection: `sobreturnos`

### API Endpoints

**Appointments (`/api/appointments`):**
- GET `/appointments` - Get all appointments
- GET `/appointments/available/:date` - Get available time slots for date
- GET `/appointments/reserved/:date` - Get reserved appointments for date
- GET `/appointments/available-times` - Get available times
- POST `/appointments` - Create appointment
- PUT `/appointments/:id` - Update appointment
- DELETE `/appointments/:id` - Delete appointment
- PATCH `/appointments/:id/payment` - Update payment status
- PATCH `/appointments/:id/description` - Update description
- GET `/test-calendar` - Test Google Calendar connection
- POST `/test-calendar-create` - Test event creation

**Sobreturnos (`/api/sobreturnos`):**
- GET `/` - Get all sobreturnos
- GET `/validate` - Validate sobreturno availability
- GET `/available/:date` - Get available sobreturnos for date
- GET `/date/:date` - Get sobreturnos by date
- POST `/` - Create sobreturno
- POST `/reserve` - Reserve sobreturno (chatbot endpoint)
- GET `/:id` - Get single sobreturno
- PUT `/:id` - Update sobreturno
- DELETE `/:id` - Delete sobreturno
- PATCH `/:id/payment` - Update payment status
- PATCH `/:id/description` - Update description
- PATCH `/:id/status` - Update status

**Health Check:**
- GET `/api/health` - Backend health status

### Google Calendar Integration

**Service Pattern:**
- Singleton service (`googleCalendarService.js`) handles all Calendar API calls
- Lazy initialization with `ensureInitialized()` - connects on first use
- Uses service account authentication via `credentials.json`
- Timezone: `America/Argentina/Buenos_Aires`
- Default event duration: 15 minutes

**Key Operations:**
- `createCalendarEvent(appointment)` - Creates event, returns `googleEventId`
- `syncEventsForDate(date)` - Fetches events for specific date
- `testConnection()` - Validates Calendar API connectivity

**Synchronization:**
- Script: `backend/sync-all-appointments.js` - One-time migration to sync existing appointments to Calendar
- Updates pending appointments to confirmed and creates missing Calendar events
- See `SYNC_INSTRUCTIONS.md` for detailed usage

### Environment Configuration

**Required Backend Variables (.env):**
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Backend port (default: 3001)
- `CALENDAR_ID` - Google Calendar ID (email)
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to credentials.json
- `CORS_ORIGINS` - Comma-separated allowed origins
- `NODE_ENV` - development/production

**Frontend Variables:**
- `VITE_API_URL` - API base URL

**Production URL:** https://micitamedica.me

## Development Patterns

### Backend Patterns
- Controllers validate input, call services, return JSON responses
- Services handle business logic and external API calls
- Models define schemas with validation and enums
- Error handling via centralized `errorHandler` middleware
- Extensive logging of requests and operations

### Frontend Patterns
- Material-UI for all UI components
- Axios instance in `config/axios.ts` with interceptors (currently commented debug logs)
- Service layer handles all API calls, returns promises
- React Router for navigation
- Context API for theme management
- TypeScript for type safety

### Data Flow
1. User interacts with frontend component
2. Component calls service function (e.g., `appointmentService.createAppointment()`)
3. Service uses axios instance to call backend API
4. Backend controller validates and processes request
5. Controller may call Google Calendar service to sync event
6. Response flows back through the chain

## Important Notes

- **Two Appointment Types:** The system distinguishes between regular appointments (`isSobreturno: false`) and sobreturnos (`isSobreturno: true`). They have separate collections, routes, and controllers but share similar schemas.
- **Google Calendar Sync:** Every appointment/sobreturno should have a corresponding Google Calendar event. The `googleEventId` field stores the link.
- **Social Work Types:** Hardcoded enum in both models - changes require updating both schemas
- **CORS:** Backend has CORS configured for multiple origins including localhost ports and production domain
- **Timezone:** System is configured for Argentina timezone (`America/Argentina/Buenos_Aires`)
- **MongoDB Auth:** Uses authentication (see MONGODB_URI format in .env example)

## Testing & Debugging

**Backend Test Scripts:**
- `test-calendar.js` - Test Google Calendar connection
- `test-connection.js` - Test database connection
- `test-db.js` - Database operations test
- `test-sobreturno-config.js` - Sobreturno configuration test
- `test-sync.js` - Synchronization test

**Debug Scripts:**
- `debug-script.js`
- `detailed-analysis.js`

## Chatbot Integration

The system mentions chatbot integration (port 3008) but chatbot code is not in this repository. The backend provides specific endpoints for chatbot interaction:
- `/api/sobreturnos/reserve` - Reserve sobreturno from chatbot
- `/api/sobreturnos/validate` - Validate sobreturno availability
- `/api/sobreturnos/cache/clear` - Clear chatbot cache

**Important**: See `CHATBOT_API_CONFIG.md` for detailed chatbot API configuration, including timeout settings, retry logic, and troubleshooting guide.

## API Call Improvements (Latest Updates)

### Frontend Axios Configuration
- **Timeout**: Increased from default to 30 seconds (30000ms)
- **Retry Logic**: Automatic retry with exponential backoff (3 attempts max)
- **Error Handling**: Improved error detection for network issues and server errors
- **Retryable Errors**: Automatically retries on network errors (ECONNABORTED, ETIMEDOUT) and server errors (5xx, 408, 429)

### Backend Server Configuration
- **CORS**: Enhanced CORS configuration with support for chatbot origin (localhost:3008)
- **Request Size**: Increased body parser limit to 10mb
- **Logging**: Improved request logging with origin tracking
- **Health Check**: Enhanced health endpoint with uptime information

### Performance Features
- Exponential backoff strategy (1s, 2s, 4s delays between retries)
- Automatic retry on transient failures
- Better error messages for debugging
- Network resilience for unstable connections
