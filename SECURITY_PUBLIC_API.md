# Seguridad de la API Pública

## Arquitectura de Protección

Este documento explica cómo se protege la API pública de reserva de turnos contra abuso, sin necesidad de duplicar la API completa.

## Estrategia de Seguridad

### 1. **Separación de Rutas**

**Rutas Públicas** (`/api/appointments/public/*`)
- Sin autenticación requerida
- Protegidas con rate limiting agresivo
- Solo operaciones de lectura limitada y creación controlada

**Rutas Protegidas** (`/api/appointments/*`)
- Requieren autenticación (JWT o API Key)
- Sin rate limiting (usuarios autenticados son confiables)
- Acceso completo a CRUD y operaciones administrativas

### 2. **Rate Limiting por IP**

Implementado con `express-rate-limit` en `publicRateLimit.js`:

#### Consultar Horarios Disponibles
```javascript
- Límite: 30 requests cada 15 minutos por IP
- Suficiente para: Usuario normal navegando fechas
- Previene: Scraping masivo de horarios
```

#### Crear Citas
```javascript
- Límite: 5 citas cada 1 hora por IP
- Suficiente para: Familia agendando turnos
- Previene: Spam de citas falsas
```

### 3. **Validaciones de Negocio**

En el controlador `appointmentController.js`:

```javascript
- Validación de horarios (08:00 - 22:00)
- Verificación de disponibilidad en tiempo real
- Prevención de doble reserva
- Validación de datos obligatorios (nombre, teléfono, obra social)
```

### 4. **CORS Configurado**

Solo permite orígenes específicos:
```javascript
- localhost:5173, localhost:5174 (desarrollo)
- https://micitamedica.me (producción)
- Bloquea cualquier otro origen
```

## Ventajas de esta Arquitectura

### ✅ **Sin Duplicación de Código**
- Mismos controladores para rutas públicas y privadas
- Mismo modelo de datos
- Misma lógica de negocio

### ✅ **Protección Diferenciada**
- Rate limiting solo en endpoints públicos
- Usuarios autenticados no sufren restricciones
- Chatbot con API Key no sufre restricciones

### ✅ **Fácil Mantenimiento**
- Un solo código para mantener
- Middlewares modulares y reutilizables
- Fácil ajustar límites según necesidad

## Configuración de Límites

Si necesitas ajustar los límites, edita `publicRateLimit.js`:

```javascript
// Más restrictivo (para alto tráfico)
windowMs: 15 * 60 * 1000,  // 15 minutos
max: 10,                    // 10 requests

// Más permisivo (para bajo tráfico)
windowMs: 5 * 60 * 1000,   // 5 minutos
max: 50,                    // 50 requests
```

## Monitoreo

Los headers de respuesta incluyen información de rate limiting:

```
RateLimit-Limit: 30
RateLimit-Remaining: 25
RateLimit-Reset: 1702178400
```

Cuando se excede el límite:
```json
{
  "success": false,
  "message": "Demasiadas solicitudes desde esta IP. Por favor, intenta nuevamente en 15 minutos."
}
```

## Endpoints Públicos

### GET `/api/appointments/public/available-times`
**Rate Limit:** 30 requests / 15 minutos

**Query Parameters:**
- `date` (string, required): Fecha en formato YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-12-11",
    "morning": [
      { "displayTime": "10:00", "time": "10:00", "period": "morning" }
    ],
    "afternoon": [
      { "displayTime": "17:00", "time": "17:00", "period": "afternoon" }
    ]
  }
}
```

### POST `/api/appointments/public/book`
**Rate Limit:** 5 citas / 1 hora

**Body:**
```json
{
  "clientName": "Juan Pérez",
  "phone": "2634123456",
  "email": "juan@email.com",
  "socialWork": "OSDE",
  "date": "2025-12-11",
  "time": "10:00",
  "description": "Consulta general"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "clientName": "Juan Pérez",
    "status": "pending",
    ...
  }
}
```

## Producción

### Variables de Entorno

En producción, asegúrate de configurar:

```env
# CORS para producción
CORS_ORIGINS=https://micitamedica.me

# Otros orígenes si es necesario
# CORS_ORIGINS=https://micitamedica.me,https://www.micitamedica.me
```

### Recomendaciones Adicionales

1. **Cloudflare o Similar**: Agregar protección DDoS a nivel de CDN
2. **Logs**: Monitorear IPs que exceden rate limits frecuentemente
3. **Honeypot**: Agregar campo oculto en formulario para detectar bots
4. **reCAPTCHA**: Considerar agregar para creación de citas (opcional)

## Troubleshooting

### Usuario legítimo bloqueado

Si un usuario legítimo excede el límite:
1. Verificar si está haciendo refresh excesivo
2. Ajustar límites temporalmente
3. Agregar su IP a la lista de bypass (si es confiable)

### Ataque de múltiples IPs

Si detectas ataque distribuido:
1. Reducir límites temporalmente
2. Activar Cloudflare modo "Under Attack"
3. Revisar logs para patrones
4. Bloquear rangos de IPs sospechosos

## Testing

### Test de Rate Limit

```bash
# Test: Consultar horarios (debe permitir 30 requests)
for i in {1..35}; do
  curl "http://localhost:3008/api/appointments/public/available-times?date=2025-12-11"
  echo "Request $i"
done
# Requests 31-35 deben retornar 429 (Too Many Requests)

# Test: Crear citas (debe permitir 5 por hora)
for i in {1..7}; do
  curl -X POST "http://localhost:3008/api/appointments/public/book" \
    -H "Content-Type: application/json" \
    -d '{"clientName":"Test","phone":"123","socialWork":"OSDE","date":"2025-12-15","time":"10:00"}'
  echo "Request $i"
done
# Requests 6-7 deben retornar 429
```
