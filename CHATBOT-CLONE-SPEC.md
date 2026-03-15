# CHATBOT-CLONE-SPEC: ANITACHATBOT → Od. Melina Villalba

**Objetivo:** Documentar exactamente qué cambiar al duplicar ANITACHATBOT
para la nueva odontóloga Od. Melina Villalba.
**Fecha actualización:** 2026-03-13
**Prerrequisito:** El backend multi-tenant ya debe estar deployado (REFACTORING-SPEC Fases 0-3 completas).

---

## Contexto: Dos chatbots, mismo código base

| # | Chatbot | Número WhatsApp | Backend URL | Puerto local |
|---|---------|-----------------|-------------|--------------|
| 1 | ANITACHATBOT (Dr. Kulinka) | Número actual | `https://micitamedica.me/api` | 3008 |
| 2 | ANITACHATBOT (Od. Villalba) | **+5493735123456** *(placeholder — confirmar con la odontóloga)* | `https://od-melinavillalba.micitamedica.me/api` | **3009** |

Ambos son el mismo código. Solo cambian las variables de entorno y los textos de los mensajes.

---

## Paso 1: Duplicar el repositorio del chatbot

```bash
# En el VPS:
cd /var/www
cp -r ANITACHATBOT ANITACHATBOT-odontologa

# Si el chatbot está en Git, crear una nueva carpeta o branch
git clone <repo-chatbot> ANITACHATBOT-odontologa
```

---

## Paso 2: Variables de entorno a cambiar

Crear/editar `.env` en `ANITACHATBOT-odontologa/`:

```env
# ============================================
# ANITACHATBOT — Od. Melina Villalba
# Clonado de ANITACHATBOT (Dr. Kulinka)
# ============================================

# Puerto del chatbot (DIFERENTE al original para evitar conflicto)
PORT=3009

# WhatsApp — número de la odontóloga
# ⚠️ PLACEHOLDER: confirmar número real con la odontóloga antes de deploy
WHATSAPP_PHONE_NUMBER=+5493735123456
WHATSAPP_PHONE_NUMBER_ID=XXXXXXXXX     # ID de Meta si usa Cloud API
WHATSAPP_ACCESS_TOKEN=XXXXXXX          # Token de acceso Meta

# Backend de CitaMedica — apunta al subdominio de la odontóloga
# ⚠️ CRÍTICO: El backend resuelve el tenant por el subdominio del Host header.
#    Esto garantiza que todos los datos queden aislados en la clínica correcta.
CITAMEDICA_API_URL=https://od-melinavillalba.micitamedica.me/api
CITAMEDICA_API_KEY=GENERAR-API-KEY-ODONTOLOGA  # debe coincidir con Clinic.chatbot.apiKey en MongoDB

# Webhook que CitaMedica usará para notificar al chatbot cuando un paciente
# reserva un turno desde el formulario público (link enviado por el chatbot)
# (debe coincidir exactamente con Clinic.chatbot.webhookUrl en la DB)
CHATBOT_WEBHOOK_PORT=3009
CHATBOT_WEBHOOK_URL=http://localhost:3009/api/notify-appointment

# Identificación del chatbot (para logs y URLs generadas)
CLINIC_NAME=Od. Melina Villalba
CLINIC_SLUG=od-melinavillalba
```

---

## Paso 3: Textos a personalizar en el código

Buscar y reemplazar los textos que mencionan al doctor/consultorio:

### Mensaje de bienvenida
```javascript
// ANTES (ANITACHATBOT Dr. Kulinka):
"¡Hola! Soy Anita, la asistente del Dr. Kulinka. ¿En qué te puedo ayudar?"

// DESPUÉS (ANITACHATBOT Od. Villalba):
"¡Hola! Soy Anita, la asistente de la Od. Melina Villalba. ¿En qué te puedo ayudar?"
```

### Mensaje de confirmación de turno
```javascript
// ANTES:
"Tu turno médico fue confirmado para el {fecha} a las {hora}."

// DESPUÉS:
"Tu turno odontológico fue confirmado para el {fecha} a las {hora}."
```

### Mensaje de obras sociales
```javascript
// ✅ CONFIRMADO: La Od. Villalba trabaja SOLO de manera particular.
// No acepta obras sociales.
//
// Por ahora la única opción es:
// - "CONSULTA PARTICULAR"
//
// (La opción "CONSULTA CON FACTURA" puede agregarse en el futuro si la profesional lo desea)
//
// ✅ RECOMENDADO: No hardcodearla en el código del chatbot.
//   Usar: GET /api/clinic/config → data.socialWorks
//   Así el chatbot siempre muestra la lista que tenga la DB.
```

### Duración de turnos en mensajes
```javascript
// La duración real está en: GET /api/clinic/config → data.settings.appointmentDuration
// Para la odontóloga está configurada en 30 minutos en la DB.
//
// ANTES (médico, 15 min):
"Cada consulta dura aproximadamente 15 minutos."

// DESPUÉS (odontóloga, 30 min):
"Cada consulta dura aproximadamente 30 minutos."
//
// ✅ MEJOR: leerlo desde clinic config en el arranque para no hardcodearlo.
```

---

## Paso 4: Cambios en la lógica del chatbot

### 4.1 URL del backend
Reemplazar toda referencia a la URL del backend:
```javascript
// Buscar: micitamedica.me/api
// Reemplazar con: od-melinavillalba.micitamedica.me/api
// ✅ MEJOR: usar process.env.CITAMEDICA_API_URL en todo el código (ya debería estar así)
```

### 4.2 Header X-API-Key (OBLIGATORIO en todas las llamadas)
El chatbot debe incluir su API Key en TODAS las llamadas al backend:
```javascript
// En todas las llamadas a la API de CitaMedica:
headers: {
  'X-API-Key': process.env.CITAMEDICA_API_KEY,
  'Content-Type': 'application/json'
}
// Sin este header, el backend responde 403 Forbidden.
```

### 4.3 Generación de token público para link de reserva
El flujo completo cuando el chatbot quiere que el paciente elija turno:
```javascript
// PASO 1: El chatbot genera un token temporal (válido 7 horas)
const response = await axios.post(
  `${process.env.CITAMEDICA_API_URL}/tokens/generate-public-token`,
  {},
  { headers: { 'X-API-Key': process.env.CITAMEDICA_API_KEY } }
);
const { token } = response.data.data;

// PASO 2: El chatbot envía al paciente el link de reserva
// ✅ Usar el CLINIC_SLUG del .env para que el link sea dinámico
const bookingUrl = `https://${process.env.CLINIC_SLUG}.micitamedica.me/reservar?token=${token}`;
// Resultado: https://od-melinavillalba.micitamedica.me/reservar?token=eyJhbG...

// PASO 3: El backend notifica al chatbot cuando el paciente completa la reserva
// (via webhook — ver sección 4.4)
```

### 4.4 Recibir notificación de reserva completada (Webhook entrante)
El backend llama al chatbot cuando un paciente reserva desde el formulario público:
```javascript
// El chatbot debe tener un endpoint activo en:
// POST http://localhost:3009/api/notify-appointment
// (este valor se configura en Clinic.chatbot.webhookUrl en MongoDB)

// Payload que el backend envía:
{
  "appointment": {
    "id": "ObjectId",
    "clientName": "nombre del paciente",
    "phone": "+54 911 ...",
    "date": "2026-03-15",
    "time": "14:30",
    "socialWork": "OSDE"
  }
}

// El chatbot recibe esto y puede enviar un mensaje de confirmación por WhatsApp al paciente.
// Timeout del backend para esta llamada: 5 segundos.
// Si el chatbot no responde, el turno igual se guarda — solo se pierde la notificación.
```

---

## Paso 5: PM2 — Iniciar el nuevo chatbot

```bash
cd /var/www/ANITACHATBOT-odontologa
npm install

# Iniciar con un nombre diferente
pm2 start index.js --name "chatbot-odontologa"
pm2 save

# Verificar que ambos chatbots corren sin conflicto
pm2 list
# Esperado:
# chatbot-dr-kulinka   → puerto 3008   ✅ online
# chatbot-odontologa   → puerto 3009   ✅ online
```

---

## Paso 6: Actualizar la Clinic en MongoDB

### 6A — Configurar el chatbot
```javascript
db.clinics.updateOne(
  { slug: 'od-melinavillalba' },
  {
    $set: {
      'chatbot.webhookUrl': 'http://localhost:3009/api/notify-appointment',
      'chatbot.apiKey': 'GENERAR-API-KEY-ODONTOLOGA',  // misma que CITAMEDICA_API_KEY en .env
      'chatbot.active': true
    }
  }
);
```

### 6B — Configurar obras sociales y datos de la clínica
```javascript
// ✅ CONFIRMADO: la Od. Villalba trabaja solo de manera particular.
// No acepta obras sociales. Puede emitir factura.
db.clinics.updateOne(
  { slug: 'od-melinavillalba' },
  {
    $set: {
      'socialWorks': ['CONSULTA PARTICULAR'],
      'settings.appointmentDuration': 30,          // turnos de 30 minutos
      'settings.appointmentLabel': 'Consulta odontológica'
    }
  }
);
```

---

## Paso 7: Configurar Google Calendar de la odontóloga

### Pasos en Google Cloud Console:
1. Ir a https://console.cloud.google.com
2. Seleccionar el proyecto existente (o crear uno nuevo para la odontóloga)
3. `APIs y servicios` → `Credenciales` → `Crear credenciales` → `Cuenta de servicio`
4. Nombre: `citamedica-odontologa`
5. Descargar el JSON de credenciales
6. Subir a `/var/www/od-melinavillalba/credentials.json` en el VPS

### En Google Calendar de la odontóloga:
1. Crear un calendario dedicado (ej: "Turnos Consultorio")
2. `Configuración del calendario` → `Integración` → copiar el **ID del calendario**
3. `Compartir este calendario` → agregar el email del service account con permisos de edición

### Actualizar la Clinic en DB:
```javascript
db.clinics.updateOne(
  { slug: 'od-melinavillalba' },
  {
    $set: {
      'googleCalendar.calendarId': 'EMAIL-CALENDARIO@gmail.com',
      'googleCalendar.credentialsPath': '/var/www/od-melinavillalba/credentials.json',
      'googleCalendar.connected': true
    }
  }
);
```

---

## Paso 8: Verificación completa

```bash
# 1. El chatbot nuevo responde
curl http://localhost:3009/health

# 2. El backend reconoce la clínica correctamente (sin auth)
curl https://od-melinavillalba.micitamedica.me/api/clinic/config

# 3. El chatbot puede generar un token público
curl -X POST https://od-melinavillalba.micitamedica.me/api/tokens/generate-public-token \
  -H "X-API-Key: GENERAR-API-KEY-ODONTOLOGA"

# 4. El chatbot puede crear un turno de prueba
curl -X POST https://od-melinavillalba.micitamedica.me/api/appointments \
  -H "X-API-Key: GENERAR-API-KEY-ODONTOLOGA" \
  -H "Content-Type: application/json" \
  -d '{"clientName":"Test Paciente","phone":"3735000000","date":"2026-03-20","time":"09:00","socialWork":"CONSULTA PARTICULAR"}'

# 5. El turno aparece en el dashboard de la odontóloga
# Ir a https://od-melinavillalba.micitamedica.me

# 6. El turno NO aparece en el dashboard del Dr. Kulinka
# Ir a https://micitamedica.me

# 7. Google Calendar sincroniza (si está configurado)
curl https://od-melinavillalba.micitamedica.me/api/test-calendar
```

---

## 🤖 Sección especial: Notas para la IA que programe el chatbot

> **Para copiar y pegar al iniciar el desarrollo del chatbot clonado.**
> Estas notas explican cómo funciona el backend al que se conecta este chatbot.

### Arquitectura multi-tenant

El backend es **multi-tenant**. La clínica activa se determina automáticamente por el **subdominio del Host header** de cada request.

- Llamada a `https://od-melinavillalba.micitamedica.me/api/...` → datos de la Od. Villalba
- Llamada a `https://micitamedica.me/api/...` → datos del Dr. Kulinka
- **No se pasa ningun ID de clínica en el body ni en los headers.** El subdominio lo resuelve todo.

### Autenticación del chatbot

El chatbot se autentica con un header `X-API-Key` en todas las llamadas:

```
X-API-Key: <valor de CITAMEDICA_API_KEY en .env>
```

Sin este header → `403 Forbidden`. No usar JWT (eso es para el dashboard de la odontóloga).

### Endpoint de configuración pública (sin auth)

```
GET https://od-melinavillalba.micitamedica.me/api/clinic/config
```

Devuelve (sin autenticación):
```json
{
  "success": true,
  "data": {
    "name": "Od. Melina Villalba",
    "slug": "od-melinavillalba",
    "socialWorks": ["CONSULTA PARTICULAR"],
    // ✅ La odontóloga trabaja solo de forma particular — sin obras sociales
    "settings": {
      "timezone": "America/Argentina/Buenos_Aires",
      "appointmentDuration": 30,
      "maxSobreturnos": 10,
      "businessHours": { "morning": {...}, "afternoon": {...} },
      "workingDays": [1, 2, 3, 4, 5, 6],
      "appointmentLabel": "Consulta odontológica"
    }
  }
}
```

**Recomendación:** Llamar a este endpoint al iniciar el chatbot y cachear la configuración. Así las obras sociales y la duración de turnos siempre están actualizadas.

### Flujo de reserva de turno (el más importante)

```
1. Paciente escribe al chatbot por WhatsApp

2. Chatbot consulta horarios disponibles:
   GET /api/appointments/available/{fecha}
   Headers: { X-API-Key: ... }
   → Devuelve array de horarios libres

3. Chatbot genera token temporal para formulario web:
   POST /api/tokens/generate-public-token
   Headers: { X-API-Key: ... }
   → Devuelve: { token: "eyJ...", expiresIn: "7h" }

4. Chatbot envía link al paciente:
   https://od-melinavillalba.micitamedica.me/reservar?token={token}

5. Paciente llena el formulario en la web y confirma el turno
   (el frontend usa el token para llamar a POST /api/appointments/public/book)

6. Backend crea el turno y llama al webhook del chatbot:
   POST http://localhost:3009/api/notify-appointment
   Body: { appointment: { clientName, phone, date, time, socialWork } }

7. Chatbot recibe el webhook y envía confirmación por WhatsApp al paciente
```

### Flujo alternativo: sobreturno directo por chatbot

Si el chatbot reserva un sobreturno directamente (sin formulario web):

```
POST /api/sobreturnos
Headers: { X-API-Key: ..., Content-Type: application/json }
Body: {
  "sobreturnoNumber": 1,         // 1 al 10
  "date": "2026-03-15",          // YYYY-MM-DD
  "clientName": "Juan Pérez",    // requerido
  "socialWork": "OSDE",          // requerido — debe estar en la lista de socialWorks
  "phone": "3735000000",         // requerido
  "email": "juan@example.com"    // opcional
}
→ El campo "time" se calcula automáticamente según la configuración del slot
→ Se crea evento en Google Calendar automáticamente
```

Para ver qué sobreturnos están disponibles en una fecha:
```
GET /api/sobreturnos/available/{fecha}
Headers: { X-API-Key: ... }
```

### CORS

El backend ya tiene habilitado `http://localhost:3009` en sus orígenes CORS. No hay que configurar nada en el servidor.

### Sobre el webhook entrante (endpoint que el chatbot debe implementar)

El chatbot necesita exponer este endpoint:
```
POST /api/notify-appointment
```

El backend lo llama con timeout de **5 segundos**. Si el chatbot tarda más o está caído, el turno igual se guarda — solo se pierde la confirmación por WhatsApp. El chatbot debe responder con status 200 lo más rápido posible y procesar la lógica de WhatsApp de forma asíncrona.

---

## Checklist de onboarding completo — Od. Melina Villalba

### Infraestructura
- [ ] DNS: `od-melinavillalba.micitamedica.me` apunta al VPS ✅ *(subdominio confirmado)*
- [ ] SSL: Certificado Let's Encrypt instalado para el subdominio
- [ ] Nginx: Configuración del subdominio habilitada

### Base de datos
- [ ] Clinic #2 creada (`slug: 'od-melinavillalba'`, `appointmentDuration: 30`, `socialWorks: ['CONSULTA PARTICULAR']`)
- [ ] Admin user creado (email + password temporal entregado a la odontóloga)
- [ ] Script de migración ejecutado

### Google Calendar
- [ ] Service Account creada en Google Cloud
- [ ] `credentials.json` subido al VPS
- [ ] Calendar compartido con la Service Account
- [ ] `calendarId` actualizado en la Clinic de DB

### Chatbot
- [ ] Repositorio duplicado en `/var/www/ANITACHATBOT-odontologa`
- [ ] `.env` configurado — **PENDIENTE**: confirmar número WhatsApp real (placeholder: +5493735123456)
- [ ] Textos personalizados (bienvenida, confirmación)
- [ ] PM2 corriendo en puerto 3009
- [ ] `Clinic.chatbot` actualizado en DB con `webhookUrl` y `apiKey`

### Verificación
- [ ] Login funciona en `od-melinavillalba.micitamedica.me`
- [ ] Dashboard muestra 0 turnos (clínica nueva, aislada)
- [ ] `GET /api/clinic/config` devuelve datos de la odontóloga
- [ ] Generar token público con API Key funciona
- [ ] Crear turno de prueba → aparece solo en esta clínica
- [ ] Google Calendar recibe el evento de prueba
- [ ] Chatbot envía link correcto (`od-melinavillalba.micitamedica.me/reservar?token=...`)
- [ ] Webhook entrante recibe notificación al completar reserva pública
- [ ] `micitamedica.me` sigue funcionando sin cambios

---

## Estimación de tiempo de onboarding

| Tarea | Tiempo estimado |
|-------|----------------|
| DNS + SSL | 30 min (propagación DNS puede tardar hasta 24h) |
| Nginx config | 15 min |
| Scripts DB (migration + create clinic) | 20 min |
| Google Calendar setup | 30 min |
| Chatbot clone + config | 45 min |
| Testing y verificación | 30 min |
| **Total** | **~3 horas** |
