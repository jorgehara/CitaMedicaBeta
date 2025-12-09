# 🔐 Implementación de API Key para Chatbot

## 📋 Resumen
Se implementó un sistema de autenticación por API Key para proteger las rutas públicas del chatbot, manteniendo la seguridad sin requerir JWT.

## ✅ Cambios Realizados

### 1. Backend - Middleware de API Key

**Archivo creado:** `backend/src/middleware/apiKeyAuth.js`
- Middleware que valida el header `X-API-Key`
- Permite acceso sin JWT para el chatbot
- Rechaza peticiones sin API Key válido

### 2. Backend - Rutas Protegidas

**Archivos modificados:**
- `backend/src/routes/appointmentRoutes.js`
- `backend/src/routes/sobreturnoRoutes.js`

**Rutas protegidas con API Key (chatbot):**
```javascript
// Appointments
GET  /api/appointments/available/:date      // Consultar turnos disponibles
GET  /api/appointments/reserved/:date       // Consultar turnos reservados
POST /api/appointments                      // Crear cita
GET  /api/appointments/available-times      // Consultar horarios disponibles

// Sobreturnos
GET  /api/sobreturnos/validate             // Validar sobreturno
GET  /api/sobreturnos/validate/:number     // Validar por número
GET  /api/sobreturnos/available/:date      // Consultar disponibles
GET  /api/sobreturnos/date/:date           // Consultar por fecha
POST /api/sobreturnos                      // Crear sobreturno
POST /api/sobreturnos/reserve              // Reservar sobreturno
POST /api/sobreturnos/cache/clear          // Limpiar caché
```

**Rutas protegidas con JWT (dashboard):**
```javascript
// Operaciones administrativas
GET    /api/appointments/              // Listar todas
PUT    /api/appointments/:id           // Actualizar
PATCH  /api/appointments/:id/payment   // Actualizar pago
DELETE /api/appointments/:id           // Eliminar

GET    /api/sobreturnos/               // Listar todos
PUT    /api/sobreturnos/:id            // Actualizar
PATCH  /api/sobreturnos/:id/payment    // Actualizar pago
DELETE /api/sobreturnos/:id            // Eliminar
```

### 3. Backend - Variables de Entorno

**Archivo:** `backend/.env`

```env
# JWT Secret para autenticación de usuarios del dashboard
JWT_SECRET=cita-medica-jwt-secret-2024-change-in-production

# API Key para el chatbot (WhatsApp Bot)
CHATBOT_API_KEY=chatbot-anita-kulinka-2024-secure-key-change-in-production
```

### 4. Chatbot - Configuración de Axios

**Archivo:** `AnitaByCitaMedica/src/config/axios.ts`
- Agregado header `X-API-Key` a todas las peticiones
- El API Key se obtiene de `process.env.CHATBOT_API_KEY`

### 5. Chatbot - Variables de Entorno

**Archivo:** `AnitaByCitaMedica/.env`

```env
# API Key para autenticación con el backend
CHATBOT_API_KEY=chatbot-anita-kulinka-2024-secure-key-change-in-production
```

### 6. Chatbot - Peticiones Fetch

**Archivo:** `AnitaByCitaMedica/src/app.ts`
- Todas las llamadas `fetch()` incluyen el header `X-API-Key`
- Ejemplos:
  ```typescript
  fetch(`${API_URL}/sobreturnos/validate/${numero}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': CHATBOT_API_KEY
    }
  })
  ```

## 🚀 Deployment

### Paso 1: Reiniciar Backend
```bash
cd C:\Users\JorgeHaraDevs\Desktop\CitaMedicaBeta\backend
pm2 restart backend
# o
npm start
```

### Paso 2: Rebuild y Reiniciar Chatbot
```bash
cd C:\Users\JorgeHaraDevs\Desktop\AnitaByCitaMedica
npm run build
pm2 restart chatbot
# o
npm start
```

### Paso 3: Verificar Logs
```bash
# Backend
pm2 logs backend

# Chatbot
pm2 logs chatbot
```

## 🔒 Seguridad

### Niveles de Protección:

1. **Rutas Públicas (Health Check):**
   - `GET /api/sobreturnos/health`
   - Sin autenticación para monitoreo

2. **Rutas Chatbot (API Key):**
   - Todas las operaciones del chatbot
   - Requieren header `X-API-Key`
   - No requieren JWT

3. **Rutas Dashboard (JWT):**
   - Operaciones administrativas (CRUD completo)
   - Requieren header `Authorization: Bearer <token>`
   - Validan roles y permisos

## 🔑 Cambiar API Key en Producción

**IMPORTANTE:** Cambia la API Key en producción antes del deployment final.

1. Genera una key segura:
```bash
# En PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

2. Actualiza `.env` en ambos proyectos:
```env
CHATBOT_API_KEY=tu-nueva-key-super-segura-aqui
```

3. Reinicia ambos servicios

## ✅ Testing

### Test 1: Chatbot puede consultar turnos
```bash
curl -H "X-API-Key: chatbot-anita-kulinka-2024-secure-key-change-in-production" \
     https://micitamedica.me/api/appointments/available/2024-12-10
```

### Test 2: Sin API Key falla
```bash
curl https://micitamedica.me/api/appointments/available/2024-12-10
# Esperado: 401 Unauthorized
```

### Test 3: API Key incorrecta falla
```bash
curl -H "X-API-Key: wrong-key" \
     https://micitamedica.me/api/appointments/available/2024-12-10
# Esperado: 403 Forbidden
```

## 📝 Notas

- El chatbot ahora puede acceder a las rutas sin necesidad de JWT
- Las rutas administrativas siguen protegidas con autenticación JWT
- El API Key debe ser el mismo en backend y chatbot
- En producción, usa API Keys fuertes y únicas
- Considera rotación de keys periódica para mayor seguridad

## 🔄 Próximos Pasos (Opcional)

1. **Rotación automática de API Keys**
2. **Rate limiting por IP**
3. **Logging de peticiones con API Key**
4. **Múltiples API Keys para diferentes bots**
