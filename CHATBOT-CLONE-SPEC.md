# CHATBOT-CLONE-SPEC: ANITACHATBOT → Od. Melina Villalba

**Objetivo:** Documentar exactamente qué cambiar al duplicar ANITACHATBOT
para la nueva odontóloga Od. Melina Villalba.
**Fecha:** 2026-03-12
**Prerrequisito:** El backend multi-tenant ya debe estar deployado (REFACTORING-SPEC Fases 0-3 completas).

---

## Contexto: Dos chatbots, mismo código base

| # | Chatbot | Número WhatsApp | Backend URL | Puerto local |
|---|---------|-----------------|-------------|--------------|
| 1 | ANITACHATBOT (Dr. Kulinka) | Número actual | `https://micitamedica.me/api` | 3008 |
| 2 | ANITACHATBOT (Od. Villalba) | Número nuevo de la odontóloga | `https://od-melinavillalba.micitamedica.me/api` | **3009** |

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
# (Configurar según el proveedor: Twilio, Meta API, etc.)
WHATSAPP_PHONE_NUMBER=+549XXXXXXXXXX   # número real de la Odontóloga
WHATSAPP_PHONE_NUMBER_ID=XXXXXXXXX     # ID de Meta si usa Cloud API
WHATSAPP_ACCESS_TOKEN=XXXXXXX          # Token de acceso Meta

# Backend de CitaMedica — apunta al subdominio de la odontóloga
CITAMEDICA_API_URL=https://od-melinavillalba.micitamedica.me/api
CITAMEDICA_API_KEY=GENERAR-API-KEY-ODONTOLOGA  # misma que está en Clinic.chatbot.apiKey

# Webhook que CitaMedica usará para notificar al chatbot
# (debe coincidir con Clinic.chatbot.webhookUrl en la DB)
CHATBOT_WEBHOOK_PORT=3009
CHATBOT_WEBHOOK_URL=http://localhost:3009/api/notify-appointment

# Identificación del chatbot (para logs)
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
// El chatbot muestra opciones de obras sociales
// ANTES (médico):
"¿Con qué obra social? OSDE / Swiss Medical / INSSSEP / Galeno / Consulta particular"

// DESPUÉS (odontóloga):
"¿Con qué obra social? OSDE Dental / Swiss Medical Dental / OMINT / Galeno Dental / Consulta particular"
```

> ⚠️ Las obras sociales disponibles también se pueden obtener dinámicamente desde la API:
> `GET /api/clinic/config` → `data.socialWorks`
> Si el chatbot hace esta llamada en el arranque, no necesita tenerlas hardcodeadas.

### Duración de turnos en mensajes
```javascript
// ANTES (médico, turnos de 15 min):
"Cada consulta dura aproximadamente 15 minutos."

// DESPUÉS (odontóloga, turnos de 30 min):
"Cada consulta dura aproximadamente 30 minutos."
```

---

## Paso 4: Cambios en la lógica del chatbot

### 4.1 URL del backend
Reemplazar toda referencia a la URL del backend:
```javascript
// Buscar: micitamedica.me/api
// Reemplazar con: od-melinavillalba.micitamedica.me/api
// O mejor: usar process.env.CITAMEDICA_API_URL en todo el código
```

### 4.2 Generación de token público
Si el chatbot genera tokens públicos para el link de reserva:
```javascript
// La llamada ya usa la URL del .env, verificar que el link generado use el subdominio correcto
const bookingUrl = `https://od-melinavillalba.micitamedica.me/reservar?token=${token}`;
// O dinámicamente: `https://${process.env.CLINIC_SLUG}.micitamedica.me/reservar?token=${token}`
```

### 4.3 Header X-API-Key
El chatbot debe incluir su API Key en las llamadas al backend:
```javascript
// En todas las llamadas a la API de CitaMedica:
headers: {
  'X-API-Key': process.env.CITAMEDICA_API_KEY
}
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

Una vez que el chatbot esté corriendo, actualizar los datos en la DB:

```javascript
// Ejecutar en Mongo shell o como script:
db.clinics.updateOne(
  { slug: 'od-melinavillalba' },
  {
    $set: {
      'chatbot.webhookUrl': 'http://localhost:3009/api/notify-appointment',
      'chatbot.apiKey': 'GENERAR-API-KEY-ODONTOLOGA',
      'chatbot.active': true
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

# 2. El chatbot puede crear un turno de prueba
curl -X POST https://od-melinavillalba.micitamedica.me/api/appointments \
  -H "X-API-Key: GENERAR-API-KEY-ODONTOLOGA" \
  -H "Content-Type: application/json" \
  -d '{"clientName":"Test Paciente","phone":"1111111111","date":"2026-03-20","time":"09:00","socialWork":"CONSULTA PARTICULAR"}'

# 3. El turno aparece en el dashboard de la odontóloga
# Ir a https://od-melinavillalba.micitamedica.me

# 4. El turno NO aparece en el dashboard del Dr. Kulinka
# Ir a https://micitamedica.me

# 5. Google Calendar sincroniza (si está configurado)
curl https://od-melinavillalba.micitamedica.me/api/test-calendar
```

---

## Checklist de onboarding completo — Od. Melina Villalba

### Infraestructura
- [ ] DNS: `od-melinavillalba.micitamedica.me` apunta al VPS
- [ ] SSL: Certificado Let's Encrypt instalado para el subdominio
- [ ] Nginx: Configuración del subdominio habilitada

### Base de datos
- [ ] Clinic #2 creada con obras sociales de odontología
- [ ] Admin user creado (email + password temporal entregado a la odontóloga)
- [ ] Script de migración ejecutado

### Google Calendar
- [ ] Service Account creada en Google Cloud
- [ ] `credentials.json` subido al VPS
- [ ] Calendar compartido con la Service Account
- [ ] `calendarId` actualizado en la Clinic de DB

### Chatbot
- [ ] Repositorio duplicado en `/var/www/ANITACHATBOT-odontologa`
- [ ] `.env` configurado con número nuevo y URL del subdominio
- [ ] Textos personalizados (bienvenida, confirmación, obras sociales)
- [ ] PM2 corriendo en puerto 3009
- [ ] `Clinic.chatbot` actualizado en DB con webhookUrl y apiKey

### Verificación
- [ ] Login funciona en `od-melinavillalba.micitamedica.me`
- [ ] Dashboard muestra 0 turnos (clínica nueva, aislada)
- [ ] Crear turno de prueba → aparece solo en esta clínica
- [ ] Google Calendar recibe el evento de prueba
- [ ] Chatbot envía link correcto (subdominio de la odontóloga)
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
