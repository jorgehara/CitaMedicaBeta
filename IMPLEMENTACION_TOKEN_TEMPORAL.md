# Implementación de Token Temporal para Reserva Pública

## 📋 Resumen

En lugar de endpoints completamente públicos, usamos **tokens temporales** generados por el chatbot que son válidos por 7 horas. Esto proporciona seguridad sin comprometer la experiencia del usuario.

## 🔐 Arquitectura

### Flujo de Trabajo

1. **Usuario interactúa con chatbot WhatsApp**
2. **Chatbot genera token temporal** llamando a `POST /api/tokens/generate-public-token`
3. **Chatbot envía enlace al usuario**: `https://micitamedica.me/reservar-turno?token=xxx`
4. **Usuario abre el enlace** y el token se almacena en localStorage
5. **Frontend usa el token** para hacer peticiones a `/api/appointments/public/*`
6. **Token expira en 7 horas**

## 🛠️ Implementación Backend (✅ COMPLETADA)

### 1. Controlador de Tokens
**Archivo**: `backend/src/controllers/tokenController.js`

Genera tokens JWT con:
- `type: 'public'`
- `permissions: ['view_available_times', 'create_appointment']`
- `expiresIn: '7h'`

### 2. Middleware de Validación
**Archivo**: `backend/src/middleware/publicTokenAuth.js`

Valida:
- Token en header `Authorization: Bearer xxx` o query param `?token=xxx`
- Tipo de token es 'public'
- Token no está expirado

### 3. Rutas
**Archivo**: `backend/src/routes/tokenRoutes.js`

```javascript
POST /api/tokens/generate-public-token
Header: X-API-Key: <CHATBOT_API_KEY>
Response: { token, expiresIn, expiresAt }
```

**Archivo**: `backend/src/routes/appointmentRoutes.js`

```javascript
GET  /api/appointments/public/available-times?token=xxx
POST /api/appointments/public/book + Header: Authorization: Bearer xxx
```

## 🎨 Implementación Frontend (⚠️ PENDIENTE)

### Paso 1: Actualizar BookAppointment.tsx

Agregar al inicio del componente:

```typescript
import { useSearchParams } from 'react-router-dom';

const BookAppointment = () => {
  const [searchParams] = useSearchParams();

  // Extraer y almacenar token de la URL
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      // Almacenar token en localStorage
      localStorage.setItem('public_token', urlToken);

      // Opcional: Limpiar URL quitando el token
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  // ... resto del componente
```

### Paso 2: Actualizar axios.ts

Modificar el interceptor de requests para agregar el token público:

```typescript
axiosInstance.interceptors.request.use(
    (config) => {
        // Obtener token JWT de usuario autenticado
        const userToken = localStorage.getItem('auth_token');

        // Obtener token público temporal
        const publicToken = localStorage.getItem('public_token');

        // Priorizar token de usuario, luego token público
        if (userToken) {
            config.headers.Authorization = `Bearer ${userToken}`;
        } else if (publicToken) {
            config.headers.Authorization = `Bearer ${publicToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
```

### Paso 3: Manejo de errores de token expirado

En el interceptor de response de axios:

```typescript
if (status === 401) {
    const errorMessage = (error.response.data as any)?.message || '';

    if (errorMessage.includes('Token expirado')) {
        // Si es token público expirado, mostrar mensaje amigable
        const publicToken = localStorage.getItem('public_token');
        if (publicToken) {
            localStorage.removeItem('public_token');
            alert('Tu enlace de reserva ha expirado. Por favor, solicita uno nuevo al chatbot de WhatsApp.');
            window.location.href = '/';
            return Promise.reject(error);
        }
    }

    // ... resto del manejo de errores
}
```

## 🤖 Implementación en el Chatbot

### Ejemplo en Node.js

```javascript
const axios = require('axios');

async function generarEnlaceReserva() {
    try {
        // 1. Generar token temporal
        const response = await axios.post(
            'https://micitamedica.me/api/tokens/generate-public-token',
            {},
            {
                headers: {
                    'X-API-Key': process.env.CHATBOT_API_KEY
                }
            }
        );

        const { token, expiresAt } = response.data.data;

        // 2. Construir enlace
        const enlace = `https://micitamedica.me/reservar-turno?token=${token}`;

        // 3. Enviar al usuario por WhatsApp
        await enviarMensajeWhatsApp(
            numeroUsuario,
            `🗓️ *Reserva tu Turno*\n\n` +
            `Haz clic en el siguiente enlace para agendar tu consulta:\n` +
            `${enlace}\n\n` +
            `⏰ Este enlace es válido por 7 horas.`
        );

        return enlace;
    } catch (error) {
        console.error('Error al generar enlace:', error);
        throw error;
    }
}
```

## 🧪 Testing

### Test 1: Generar Token

```bash
curl -X POST http://localhost:3008/api/tokens/generate-public-token \
  -H "X-API-Key: chatbot-api-key-2024-change-in-production" \
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7h",
    "expiresAt": "2025-12-10T16:30:00.000Z"
  }
}
```

### Test 2: Usar Token para Obtener Horarios

```bash
TOKEN="<token_del_paso_anterior>"

curl "http://localhost:3008/api/appointments/public/available-times?date=2025-12-11" \
  -H "Authorization: Bearer $TOKEN"
```

### Test 3: Crear Cita con Token

```bash
curl -X POST http://localhost:3008/api/appointments/public/book \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Juan Pérez",
    "phone": "2634123456",
    "socialWork": "OSDE",
    "date": "2025-12-11",
    "time": "10:00"
  }'
```

## 🔒 Seguridad

### Ventajas sobre Endpoints Públicos

1. **Trazabilidad**: Cada enlace tiene un token único
2. **Expiración**: Tokens válidos solo 7 horas
3. **Origen verificable**: Solo el chatbot con API Key puede generar tokens
4. **Revocación posible**: Se pueden invalidar tokens específicos (implementación futura)

### Protecciones Adicionales

Aún aplica el rate limiting como segunda capa de seguridad:
- 30 consultas de horarios cada 15 min por IP
- 5 creaciones de citas por hora por IP

### Logs y Monitoreo

El sistema registra:
- Cuando se genera un token (quién y cuándo)
- Cuando se usa un token (qué operación)
- Cuando un token expira o es inválido

## 📊 Comparación: Antes vs Después

### ❌ Antes (Endpoints Públicos Sin Autenticación)

- ✅ Fácil de usar
- ❌ Cualquiera puede acceder
- ❌ No hay trazabilidad
- ❌ Difícil controlar abuso
- ❌ CORS puede ser un problema

### ✅ Después (Tokens Temporales)

- ✅ Igual de fácil para usuarios legítimos
- ✅ Solo usuarios con enlace del chatbot
- ✅ Trazabilidad completa
- ✅ Control de acceso granular
- ✅ Sin problemas de CORS (token en header)

## 🚀 Próximos Pasos

1. ✅ Backend implementado
2. ⚠️ Actualizar frontend (BookAppointment.tsx y axios.ts)
3. ⚠️ Actualizar chatbot para generar tokens
4. ⚠️ Testing end-to-end
5. ⚠️ Desplegar a producción

## 💡 Mejoras Futuras

1. **Tokens de un solo uso**: Token se invalida después de crear cita
2. **Metadata en tokens**: Incluir origen, usuario de WhatsApp, etc.
3. **Dashboard de tokens**: Ver tokens activos, revocar, estadísticas
4. **Rate limiting por token**: Límites específicos por token, no solo por IP
5. **Notificaciones**: Alertar cuando token está por expirar

## 📝 Notas

- El token se almacena en `localStorage` del navegador
- Si el usuario comparte el enlace, cualquiera con el enlace puede usar el token (válido 7h)
- Para mayor seguridad, se podría implementar tokens de un solo uso
- Los tokens son JWT estándar, se pueden validar offline

## 🔧 Variables de Entorno

Asegúrate de tener configuradas:

```env
# Backend
JWT_SECRET=tu-secreto-jwt-muy-seguro
CHATBOT_API_KEY=tu-api-key-del-chatbot
```

No se requieren cambios en el frontend (usa las mismas variables).
