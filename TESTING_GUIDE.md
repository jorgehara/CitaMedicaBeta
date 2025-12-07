# 🧪 GUÍA DE TESTING - FASE 1 COMPLETA

## ✅ IMPLEMENTACIÓN COMPLETADA

### Backend ✅
- ✅ Modelo de Usuario con roles
- ✅ Middleware de autenticación JWT
- ✅ Middleware de control de roles
- ✅ Controladores de autenticación
- ✅ Rutas protegidas
- ✅ Usuario admin creado en MongoDB

### Frontend ✅
- ✅ Tailwind CSS configurado
- ✅ Tipos TypeScript
- ✅ Servicio de autenticación
- ✅ Contexto de autenticación (AuthContext)
- ✅ Axios con interceptores JWT
- ✅ Página de Login con animaciones
- ✅ ProtectedRoute component
- ✅ App.tsx integrado
- ✅ Layout con logout button

---

## 🚀 PASOS PARA PROBAR

### 1️⃣ Iniciar Backend

```bash
cd backend
npm run dev
```

**Verificar:**
- ✅ "Servidor corriendo en el puerto 3001"
- ✅ "Conectado a MongoDB"
- ✅ No hay errores en consola

**Rutas disponibles:**
- http://localhost:3001/api/health
- http://localhost:3001/api/auth/login (POST)
- http://localhost:3001/api/appointments (GET - requiere auth)

---

### 2️⃣ Iniciar Frontend

```bash
cd frontend
npm run dev
```

**Verificar:**
- ✅ "Local: http://localhost:5173"
- ✅ No hay errores de compilación TypeScript
- ✅ Tailwind CSS carga correctamente

---

### 3️⃣ Test 1: Acceso sin autenticación

1. Abre el navegador en http://localhost:5173
2. **Esperado:** Deberías ser redirigido automáticamente a `/login`
3. **Verificar en DevTools (F12):**
   - Console: "[AUTH] Sesión no encontrada" o similar
   - Network: No hay llamadas a `/api/appointments`

---

### 4️⃣ Test 2: Login con credenciales correctas

**Credenciales de prueba:**
- Email: `admin@cita-medica.com`
- Password: `admin123`

**Pasos:**
1. Ingresa el email y password
2. Haz clic en "Iniciar Sesión"
3. **Esperado:**
   - Loading spinner aparece brevemente
   - Eres redirigido a `/` (Dashboard)
   - El sidebar muestra tu nombre y rol ("Administrador" - "admin")
   - Puedes ver las citas

**Verificar en DevTools:**
- **Console:**
  - `[AUTH] Login exitoso: admin@cita-medica.com (admin)`
- **Application > Local Storage:**
  - `auth_token`: Debería existir con un string largo (JWT)
- **Network:**
  - POST `/api/auth/login` → Status 200
  - GET `/api/appointments` → Status 200 (con header Authorization)

---

### 5️⃣ Test 3: Navegación autenticada

1. Haz clic en "Horarios" en el sidebar
2. **Esperado:** La página carga sin redirigir a login
3. Haz clic en "Historial"
4. **Esperado:** La página carga sin redirigir a login

---

### 6️⃣ Test 4: Logout

1. Haz scroll hasta abajo del sidebar
2. Verás tu nombre, rol y botón "Cerrar Sesión"
3. Haz clic en "Cerrar Sesión"
4. **Esperado:**
   - Eres redirigido a `/login`
   - El token se elimina de localStorage
   - Si intentas ir a `/` manualmente, redirige a `/login`

**Verificar en DevTools:**
- **Console:** `[AUTH] Logout exitoso`
- **Application > Local Storage:** `auth_token` ya no existe

---

### 7️⃣ Test 5: Token persistente (refresh page)

1. Haz login nuevamente
2. **Sin cerrar sesión**, recarga la página (F5)
3. **Esperado:**
   - El sistema verifica el token automáticamente
   - NO te redirige a login
   - Sigues viendo el Dashboard
   - Tu nombre y rol siguen apareciendo en el sidebar

**Verificar en DevTools:**
- **Console:** `[AUTH] Sesión restaurada: admin@cita-medica.com`

---

### 8️⃣ Test 6: Token expirado (simulación)

1. Mientras estás logueado, abre DevTools
2. Ve a Application > Local Storage
3. Edita el valor de `auth_token` a cualquier cosa (ej: "abc123")
4. Recarga la página o intenta acceder a `/`
5. **Esperado:**
   - Eres redirigido a `/login`
   - Mensaje de error: "Token inválido" o similar

---

### 9️⃣ Test 7: Protección de API

1. Cierra sesión completamente
2. Abre DevTools > Console
3. Ejecuta este código:

```javascript
fetch('http://localhost:3001/api/appointments')
  .then(res => res.json())
  .then(data => console.log(data))
```

4. **Esperado:**
   - Status 401 Unauthorized
   - Mensaje: "Acceso denegado. No se proporcionó token de autenticación."

5. Ahora haz login y ejecuta el mismo código:

```javascript
const token = localStorage.getItem('auth_token');
fetch('http://localhost:3001/api/appointments', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(res => res.json())
  .then(data => console.log(data))
```

6. **Esperado:**
   - Status 200 OK
   - Array de citas

---

### 🔟 Test 8: Login con credenciales incorrectas

1. Intenta hacer login con:
   - Email: `admin@cita-medica.com`
   - Password: `wrongpassword`
2. **Esperado:**
   - Error mostrado: "Credenciales inválidas"
   - NO eres redirigido
   - Permaneces en `/login`

---

### 1️⃣1️⃣ Test 9: Validación de formulario

1. En la página de login, intenta:
   - Email vacío → Error: "El email es obligatorio"
   - Email inválido (ej: "admin") → Error: "Email inválido"
   - Password vacío → Error: "La contraseña es obligatoria"
   - Password corto (<6 caracteres) → Error: "Mínimo 6 caracteres"

---

### 1️⃣2️⃣ Test 10: Animaciones (UI/UX)

**Verificar que las siguientes animaciones funcionan:**

1. **Login page:**
   - ✅ Fade in al cargar la página
   - ✅ Círculos animados en el fondo (rotación continua)
   - ✅ Glassmorphism effect en el card
   - ✅ Hover en el botón de login (escala 1.02)
   - ✅ Click en el botón (escala 0.98)

2. **ProtectedRoute:**
   - ✅ Loading spinner con animación de pulso
   - ✅ Texto "Verificando sesión..." con fade in

3. **Página de acceso denegado (si tienes múltiples roles):**
   - ✅ Emoji 🚫 con fade in
   - ✅ Texto animado desde abajo

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### ❌ Error: "Cannot find module '@mui/material'"
**Solución:**
```bash
cd frontend
npm install
```

### ❌ Error: "ECONNREFUSED ::1:3001"
**Solución:**
- Verifica que el backend esté corriendo
- Verifica que el puerto 3001 no esté ocupado

### ❌ Error: "CORS policy" en consola
**Solución:**
- Verifica que `http://localhost:5173` esté en CORS_ORIGINS del backend
- Reinicia el backend después de cambiar .env

### ❌ Login no funciona (no redirige)
**Solución:**
1. Abre DevTools > Network
2. Busca la request a `/api/auth/login`
3. Verifica el status code y la respuesta
4. Si es 401: Verifica las credenciales
5. Si es 500: Revisa los logs del backend

### ❌ Token se pierde al recargar
**Solución:**
- Verifica que `localStorage.setItem('auth_token', ...)` funcione
- Abre DevTools > Application > Local Storage
- Busca la key `auth_token`

### ❌ Tailwind CSS no funciona
**Solución:**
```bash
cd frontend
npm install tailwindcss postcss autoprefixer
```
Verifica que `index.css` tenga las directivas `@tailwind`

---

## ✅ CHECKLIST FINAL

- [ ] Backend corriendo sin errores
- [ ] Frontend corriendo sin errores de compilación
- [ ] Login funciona con credenciales correctas
- [ ] Redirect a login cuando no autenticado
- [ ] Token se guarda en localStorage
- [ ] Token se envía en requests a API
- [ ] Logout funciona y limpia token
- [ ] Sesión persiste al recargar página
- [ ] Protección de rutas funciona
- [ ] Animaciones se ven correctamente
- [ ] Modo oscuro/claro funciona
- [ ] Sidebar muestra nombre y rol del usuario
- [ ] Botón de logout visible y funcional

---

## 🎯 PRÓXIMOS PASOS

Una vez que todos los tests pasen:

### FASE 2: Mejoras UI/UX
- Modernizar componentes con Tailwind
- Agregar más animaciones con Framer Motion
- Mejorar tema oscuro/claro
- Loading skeletons

### FASE 3: Dashboard Auto-actualizable
- Polling cada 60 segundos
- Indicador de última actualización
- Botón de refresh manual

### FASE 4: Gestión de Usuarios (Admin)
- CRUD de usuarios
- Asignación de roles
- Cambio de contraseñas
- Desactivación de usuarios

---

## 📝 NOTAS IMPORTANTES

1. **Cambiar contraseña del admin:**
   - Después del primer login, cambiar la contraseña
   - Usar endpoint: PUT `/api/auth/change-password`

2. **Crear más usuarios:**
   - Solo el admin puede crear usuarios
   - Usar endpoint: POST `/api/auth/register`

3. **Roles y permisos:**
   - `admin`: Acceso total (crear, editar, eliminar)
   - `operador`: Crear y editar citas
   - `auditor`: Solo lectura

4. **Seguridad:**
   - Los tokens expiran en 7 días
   - El backend valida cada request
   - Las contraseñas se hashean con bcrypt

---

**Última actualización:** 2025-12-06
**Estado:** FASE 1 - 100% COMPLETADA ✅
