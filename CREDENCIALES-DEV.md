# Credenciales de Desarrollo

## 🔐 Login Principal (Recomendado para Testing)

### Clínica: Consultorio Dr. Kulinka (micitamedica)
- **Email:** `admin@cita-medica.com`
- **Password:** `123456`
- **URL:** http://localhost:5173
- **Datos disponibles:**
  - ✅ 48 Pacientes (PAC-0002 a PAC-0049)
  - ✅ 109 Historias Clínicas
  - ✅ 54 Seguimientos

---

## 🏥 Otras Clínicas Disponibles

### Od. Melina Villalba
- **Email:** `melina@od-melinavillalba.com`
- **Password:** `123456`
- **URL:** http://od-melinavillalba.localhost:5173
- **Datos:** 1 Paciente (PAC-0001)

### Dr. Kulinka (clínica secundaria)
- **Email:** `dr-kulinka@citamedica.com`
- **Password:** `123456`
- **URL:** http://localhost:5173
- **Datos:** Vacía (sin pacientes)

---

## 👤 Usuario Operador
- **Email:** `operador@test.com`
- **Password:** `123456`
- **Permisos:** Solo lectura y operaciones básicas

---

## 📊 Estadísticas de la Base de Datos

| Clínica | Pacientes | Historias | Seguimientos |
|---------|-----------|-----------|--------------|
| **micitamedica** (Principal) | 48 | 109 | 54 |
| od-melinavillalba | 1 | 0 | 0 |
| dr-kulinka | 0 | 0 | 0 |

---

## 🎯 Pasos para Ver los Pacientes

1. **Abrir el frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Acceder a:** http://localhost:5173

3. **Login con:**
   - Email: `admin@cita-medica.com`
   - Password: `123456`

4. **Ir a:** `/pacientes` o click en "Pacientes" en el menú lateral

5. **Deberías ver:** 48 pacientes desde PAC-0002 hasta PAC-0049

---

## 🔧 Scripts de Seed Disponibles

```bash
# Crear estructura inicial (clínicas y usuarios)
cd backend
node scripts/seed-dev.js

# Crear 5 pacientes básicos
node scripts/seed-patients.js

# Crear 20 pacientes adicionales (RECOMENDADO)
node scripts/seed-20-patients.js
```

---

## ⚠️ Notas Importantes

- Los pacientes están asociados a **clínicas específicas** (multi-tenant)
- El usuario `admin@cita-medica.com` tiene acceso a la clínica **micitamedica**
- Si no ves pacientes, verificá que estés logueado con el usuario correcto
- Los números clínicos son únicos globalmente (PAC-XXXX)
- Las historias clínicas están ordenadas cronológicamente por paciente

---

## 🐛 Troubleshooting

### No veo pacientes en el frontend
- ✅ Verificá que estés logueado con `admin@cita-medica.com`
- ✅ Abrí las DevTools y verificá el Network tab
- ✅ El endpoint debe ser: `GET /api/patients`
- ✅ La respuesta debe tener `data.length = 48`

### Error de autenticación
- ✅ Limpiá localStorage: `localStorage.clear()`
- ✅ Volvé a hacer login
- ✅ Verificá que el token JWT tenga el `clinicId` correcto

### Base de datos vacía
- ✅ Ejecutá primero: `node scripts/seed-dev.js`
- ✅ Luego ejecutá: `node scripts/seed-20-patients.js`
- ✅ Verificá la conexión a MongoDB en `.env`

---

Última actualización: 2026-03-26
