# 🚀 INSTRUCCIONES DE DESPLIEGUE - CitaMedicaBeta 2.0

## ⚠️ PROBLEMA ACTUAL

El **backend en producción** (https://micitamedica.me) NO tiene el sistema de autenticación implementado.

**Evidencia:**
```bash
curl -X POST https://micitamedica.me/api/auth/login
# Respuesta: 404 Not Found - "Ruta no encontrada"
```

El código de autenticación está en el repositorio local pero NO está desplegado en producción.

---

## 📋 CAMBIOS PENDIENTES DE COMMIT

### Frontend:
1. `frontend/src/index.css` - Migración a Tailwind CSS v4
2. `frontend/src/pages/Dashboard.tsx` - Auto-refresh y UI moderna
3. `frontend/src/components/animations/` - 5 componentes de animación (sin trackear)
4. `RESUMEN_FINAL.md` - Documentación del proyecto

---

## 🔧 PASO 1: COMMIT DE CAMBIOS LOCALES

Ejecutar en la raíz del proyecto:

```bash
# Agregar archivos modificados
git add frontend/src/index.css
git add frontend/src/pages/Dashboard.tsx
git add frontend/src/components/AppointmentList.tsx
git add frontend/src/components/SimpleAppointmentList.tsx

# Agregar componentes de animación
git add frontend/src/components/animations/

# Agregar documentación
git add RESUMEN_FINAL.md

# Crear commit
git commit -m "Complete Phase 3: Auto-refresh dashboard and UI polish

- Update Dashboard with 1-minute auto-refresh
- Add last update indicator with real-time formatting
- Add manual refresh button with animations
- Add statistics cards with gradients
- Migrate to Tailwind CSS v4 syntax
- Add 5 reusable Framer Motion animation components

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 🚀 PASO 2: PUSH AL REPOSITORIO REMOTO

```bash
# Verificar rama actual
git branch

# Push a origin/main
git push origin main
```

---

## 🖥️ PASO 3: DESPLEGAR EN PRODUCCIÓN

### A. Conectar al servidor de producción

```bash
# SSH al servidor (reemplazar con tus credenciales)
ssh usuario@micitamedica.me
# O usar tu método de acceso al servidor
```

### B. Actualizar el backend

```bash
# Navegar al directorio del proyecto backend
cd /ruta/al/proyecto/CitaMedicaBeta/backend

# Pull de los últimos cambios
git pull origin main

# Instalar dependencias nuevas (si hay)
npm install

# Verificar que existe el archivo .env con estas variables:
cat .env
# Debe contener:
# MONGODB_URI=mongodb://...
# PORT=3001
# CALENDAR_ID=...
# GOOGLE_APPLICATION_CREDENTIALS=...
# CORS_ORIGINS=http://localhost:4173,http://localhost:5173,https://micitamedica.me
# JWT_SECRET=... (DEBE ESTAR DEFINIDO)
# NODE_ENV=production

# ⚠️ IMPORTANTE: Agregar JWT_SECRET si no existe
echo "JWT_SECRET=tu-secreto-super-seguro-y-aleatorio-aqui" >> .env

# Crear usuario administrador
node create-admin.js

# Reiniciar el servicio backend
# (El comando depende de cómo esté configurado el servidor)

# Si usa PM2:
pm2 restart backend
# O
pm2 restart all

# Si usa systemd:
sudo systemctl restart cita-medica-backend

# Si usa forever:
forever restart backend/server.js

# Si corre directamente:
# Detener el proceso actual (Ctrl+C o kill PID)
# Luego iniciar:
npm run start
# O en modo desarrollo:
npm run dev
```

### C. Actualizar el frontend

```bash
# Navegar al directorio del frontend
cd /ruta/al/proyecto/CitaMedicaBeta/frontend

# Pull de los últimos cambios
git pull origin main

# Instalar dependencias nuevas
npm install

# Build de producción
npm run build

# El build genera archivos en frontend/dist/
# Estos deben servirse por Nginx o el servidor web que uses

# Si usas PM2 para preview:
pm2 restart frontend
# O
npm run preview
```

### D. Configurar Nginx (si aplica)

Verificar que Nginx esté configurado para servir el frontend y proxy el backend:

```nginx
# /etc/nginx/sites-available/micitamedica.me

server {
    listen 443 ssl;
    server_name micitamedica.me;

    # SSL certificates
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend - servir archivos estáticos
    location / {
        root /ruta/al/proyecto/CitaMedicaBeta/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API - proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Luego reiniciar Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## ✅ PASO 4: VERIFICAR DESPLIEGUE

### A. Verificar Backend

```bash
# Probar health endpoint
curl https://micitamedica.me/api/health

# Probar login endpoint (DEBE retornar 400 o error de validación, NO 404)
curl -X POST https://micitamedica.me/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cita-medica.com","password":"admin123"}'

# Respuesta esperada (SUCCESS):
# {
#   "success": true,
#   "data": {
#     "user": {...},
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
#   }
# }
```

### B. Verificar Frontend

1. Abrir https://micitamedica.me en el navegador
2. Debe redirigir automáticamente a `/login`
3. Ingresar credenciales:
   - Email: `admin@cita-medica.com`
   - Password: `admin123`
4. Debe iniciar sesión correctamente
5. Dashboard debe mostrar:
   - ✅ 3 tarjetas de estadísticas con gradientes
   - ✅ "Última actualización: hace X segundos"
   - ✅ Botón de refresh manual
   - ✅ Auto-refresh cada 1 minuto (ver console logs)

### C. Verificar Console del Navegador

Abrir DevTools > Console y verificar:
```
[DASHBOARD] Datos actualizados: { citas: X, sobreturnos: Y, timestamp: ... }
[AUTO-REFRESH] Actualizando datos automáticamente... (cada 60 segundos)
```

---

## 🔐 CREDENCIALES DE ACCESO

**Usuario administrador:**
- Email: `admin@cita-medica.com`
- Password: `admin123`
- Rol: admin

⚠️ **IMPORTANTE:** Cambiar la contraseña después del primer login en producción.

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema: Backend retorna 404 en /api/auth/login

**Causa:** Backend no actualizado o no reiniciado.

**Solución:**
```bash
cd backend
git pull
npm install
pm2 restart backend
# O reiniciar el servicio correspondiente
```

### Problema: Error "Respuesta de login inválida" en frontend

**Causa:** Frontend en desarrollo apuntando a backend sin auth.

**Solución:** Desplegar backend primero (ver PASO 3.B).

### Problema: CORS error en navegador

**Causa:** Backend no tiene configurado CORS para el dominio.

**Solución:**
```bash
# Editar backend/.env
CORS_ORIGINS=http://localhost:5173,http://localhost:4173,https://micitamedica.me

# Reiniciar backend
pm2 restart backend
```

### Problema: JWT_SECRET no definido

**Causa:** Variable de entorno faltante.

**Solución:**
```bash
cd backend
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
pm2 restart backend
```

### Problema: Create admin script falla

**Causa:** MongoDB no conectado o usuario ya existe.

**Solución:**
```bash
# Verificar conexión MongoDB
mongo "$MONGODB_URI"

# Si usuario ya existe, resetear password manualmente:
# Conectar a MongoDB y ejecutar:
db.users.deleteOne({ email: "admin@cita-medica.com" })

# Luego re-ejecutar:
node create-admin.js
```

---

## 📚 ARCHIVOS CLAVE

### Backend:
- `backend/server.js` - Entry point con rutas auth
- `backend/src/routes/authRoutes.js` - Rutas de autenticación
- `backend/src/controllers/authController.js` - Lógica de auth
- `backend/src/models/user.js` - Modelo de usuario
- `backend/src/middleware/auth.js` - JWT middleware
- `backend/create-admin.js` - Script crear admin

### Frontend:
- `frontend/src/App.tsx` - Rutas protegidas
- `frontend/src/config/axios.ts` - Interceptors JWT
- `frontend/src/context/AuthContext.tsx` - Estado de auth
- `frontend/src/pages/Login.tsx` - Página de login
- `frontend/src/pages/Dashboard.tsx` - Dashboard con auto-refresh

---

## 🎯 CHECKLIST DE DESPLIEGUE

- [ ] 1. Commit cambios locales
- [ ] 2. Push al repositorio remoto
- [ ] 3. SSH al servidor de producción
- [ ] 4. Pull cambios en backend
- [ ] 5. Instalar dependencias backend (`npm install`)
- [ ] 6. Verificar/crear `.env` con `JWT_SECRET`
- [ ] 7. Ejecutar `node create-admin.js`
- [ ] 8. Reiniciar servicio backend
- [ ] 9. Probar endpoint `/api/auth/login` con curl
- [ ] 10. Pull cambios en frontend
- [ ] 11. Instalar dependencias frontend (`npm install`)
- [ ] 12. Build frontend (`npm run build`)
- [ ] 13. Reiniciar servicio frontend
- [ ] 14. Verificar Nginx configurado correctamente
- [ ] 15. Abrir https://micitamedica.me en navegador
- [ ] 16. Hacer login exitoso
- [ ] 17. Verificar auto-refresh funciona
- [ ] 18. Cambiar password de admin

---

## 📞 SOPORTE

Si encuentras problemas durante el despliegue:

1. Verificar logs del backend: `pm2 logs backend` o `journalctl -u cita-medica-backend`
2. Verificar logs de Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Verificar console del navegador (F12 > Console)
4. Verificar Network tab en DevTools para ver requests fallidas

---

**Versión:** 2.0.0
**Fecha:** Diciembre 2025
**Estado:** Listo para despliegue en producción
