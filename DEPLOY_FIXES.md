# Guía de Despliegue - Correcciones de API Timeouts

## Resumen de Cambios

Se han implementado mejoras críticas para resolver los problemas de timeout (3000ms exceeded) que estaban bloqueando el sistema en producción.

### Cambios Realizados

#### 1. Frontend (`frontend/src/config/axios.ts`)
- ✅ Timeout aumentado de 3s a 30s
- ✅ Retry logic automático (3 intentos)
- ✅ Exponential backoff (1s, 2s, 4s)
- ✅ Mejor manejo de errores de red

#### 2. Backend (`backend/server.js`)
- ✅ CORS optimizado (eliminada configuración duplicada)
- ✅ Agregado soporte para puerto 3008 (chatbot)
- ✅ Body parser limit aumentado a 10mb
- ✅ Health check mejorado con uptime
- ✅ Mejor logging de requests

#### 3. Documentación
- ✅ Creado `CHATBOT_API_CONFIG.md` con configuración recomendada para el chatbot
- ✅ Actualizado `CLAUDE.md` con las mejoras implementadas

## Pasos para Desplegar en Producción

### Paso 1: Preparar el Frontend

```bash
# En tu máquina local o en el servidor
cd frontend

# Asegurarse de que las dependencias estén actualizadas
npm install

# Construir el proyecto
npm run build

# El resultado estará en frontend/dist/
```

### Paso 2: Subir Cambios al Servidor

```bash
# Opción A: Si usas Git
git add .
git commit -m "Fix: Aumentar timeout API y agregar retry logic"
git push origin main

# Luego en el servidor
cd /ruta/a/CitaMedicaBeta
git pull origin main

# Opción B: Si subes archivos manualmente
# Subir estos archivos al servidor:
# - frontend/src/config/axios.ts
# - backend/server.js
# - CHATBOT_API_CONFIG.md
```

### Paso 3: Reconstruir Frontend en el Servidor

```bash
# En el servidor
cd /home/jorgeharadevs/CitaMedicaBeta/frontend

# Instalar/actualizar dependencias
npm install

# Construir
npm run build
```

### Paso 4: Reiniciar Backend

```bash
# Verificar que el backend esté corriendo
pm2 status

# Reiniciar el backend
pm2 restart backend

# O si no está en PM2
cd /home/jorgeharadevs/CitaMedicaBeta/backend
npm run start
```

### Paso 5: Reiniciar Frontend

```bash
# Si el frontend corre con PM2
pm2 restart frontend

# O si usas nginx + serve
pm2 restart preview
```

### Paso 6: Actualizar Configuración del Chatbot

**IMPORTANTE**: El chatbot necesita actualizar su configuración de axios.

1. Localiza el archivo donde el chatbot configura axios o fetch
2. Aplica los cambios descritos en `CHATBOT_API_CONFIG.md`
3. Los cambios principales son:
   - Timeout de 3000ms a 30000ms
   - Agregar retry logic con 3 intentos
   - Exponential backoff

```bash
# Después de actualizar el código del chatbot
pm2 restart restart-server
```

### Paso 7: Verificar que Todo Funciona

```bash
# 1. Verificar health del backend
curl https://micitamedica.me/api/health

# Debe responder:
# {"status":"OK","timestamp":"...","service":"appointment-backend","version":"1.0.0","uptime":123.45}

# 2. Verificar que el frontend carga
curl https://micitamedica.me

# 3. Ver logs del backend
pm2 logs backend --lines 50

# 4. Ver logs del chatbot
pm2 logs restart-server --lines 50

# 5. Ver logs de errores
pm2 logs --err --lines 50
```

### Paso 8: Probar Funcionalidad

1. **Desde el navegador**:
   - Abrir https://micitamedica.me
   - Intentar crear una cita
   - Verificar que no haya errores de timeout

2. **Desde el chatbot**:
   - Enviar mensaje "turnos"
   - Verificar que responda con horarios disponibles
   - No debe mostrar "Sistema en modo offline"

## Verificaciones de Seguridad en Producción

```bash
# 1. Verificar que el backend esté escuchando en el puerto correcto
sudo netstat -tulpn | grep 3001

# Debe mostrar algo como:
# tcp6       0      0 :::3001                 :::*                    LISTEN      12345/node

# 2. Verificar firewall
sudo ufw status

# 3. Verificar procesos PM2
pm2 status

# 4. Verificar que MongoDB esté corriendo
sudo systemctl status mongod
```

## Solución de Problemas

### Problema 1: "timeout of 3000ms exceeded" persiste en el chatbot

**Causa**: El chatbot no ha sido actualizado con la nueva configuración

**Solución**:
```bash
# 1. Editar el archivo de configuración del chatbot
# 2. Cambiar timeout de 3000 a 30000
# 3. Agregar retry logic según CHATBOT_API_CONFIG.md
# 4. Reiniciar
pm2 restart restart-server
```

### Problema 2: CORS errors desde el chatbot

**Causa**: El backend no tiene el origen del chatbot en CORS_ORIGINS

**Solución**:
```bash
# Editar backend/.env
CORS_ORIGINS=http://localhost:3008,http://localhost:5173,https://micitamedica.me

# Reiniciar backend
pm2 restart backend
```

### Problema 3: Backend no responde

**Causa**: Posible problema con MongoDB o configuración

**Solución**:
```bash
# 1. Verificar logs
pm2 logs backend --lines 100

# 2. Verificar variables de entorno
cd backend
cat .env

# 3. Verificar MongoDB
sudo systemctl status mongod

# 4. Reiniciar todo
pm2 restart all
```

### Problema 4: "sudo: a terminal is required" en logs

**Causa**: Algún script está intentando ejecutar sudo sin la configuración correcta

**Solución**: Este error parece venir del script de restart. Verificar:
```bash
# Ver la configuración de PM2 del chatbot
pm2 describe restart-server

# Si hay un script de restart que usa sudo, modificarlo o:
pm2 delete restart-server
pm2 start app.js --name restart-server
pm2 save
```

## Monitoreo Post-Despliegue

```bash
# Monitorear logs en tiempo real
pm2 logs

# Monitorear solo errores
pm2 logs --err

# Ver métricas de rendimiento
pm2 monit

# Ver uso de recursos
pm2 list
```

## Rollback (Si algo sale mal)

```bash
# 1. Volver al commit anterior
git log --oneline  # Ver commits
git revert HEAD    # Revertir último commit

# 2. Rebuild frontend
cd frontend
npm run build

# 3. Reiniciar servicios
pm2 restart all

# 4. Verificar
curl https://micitamedica.me/api/health
```

## Checklist de Despliegue

- [ ] Código actualizado en el servidor (git pull o subida manual)
- [ ] Frontend reconstruido (`npm run build`)
- [ ] Backend reiniciado (`pm2 restart backend`)
- [ ] Frontend reiniciado (`pm2 restart frontend` o similar)
- [ ] Chatbot actualizado con nueva configuración
- [ ] Chatbot reiniciado (`pm2 restart restart-server`)
- [ ] Health check responde OK (`curl https://micitamedica.me/api/health`)
- [ ] Frontend carga correctamente en el navegador
- [ ] Chatbot responde correctamente (enviar mensaje "turnos")
- [ ] No hay errores de timeout en los logs
- [ ] PM2 save ejecutado (`pm2 save`)

## Comandos Útiles de PM2

```bash
pm2 list                    # Ver todos los procesos
pm2 restart all             # Reiniciar todos
pm2 restart backend         # Reiniciar solo backend
pm2 stop all                # Detener todos
pm2 delete all              # Eliminar todos (¡cuidado!)
pm2 logs --lines 100        # Ver últimas 100 líneas de logs
pm2 flush                   # Limpiar logs
pm2 save                    # Guardar configuración actual
pm2 startup                 # Configurar inicio automático
pm2 resurrect               # Restaurar procesos guardados
```

## Contacto y Soporte

Si después de aplicar estos cambios el problema persiste:

1. Capturar logs completos: `pm2 logs --lines 500 > logs.txt`
2. Verificar el archivo `logs.txt`
3. Compartir información relevante del error
