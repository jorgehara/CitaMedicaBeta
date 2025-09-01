# 🔄 Script de Sincronización de Citas

## ¿Qué hace este script?

El script `sync-all-appointments.js` realiza las siguientes acciones:

### ✅ **Para Citas Normales (appointments)**:
1. Cambia todas las citas de `status: 'pending'` a `status: 'confirmed'`
2. Crea eventos en Google Calendar para las citas que no tienen `googleEventId`
3. Actualiza el campo `googleEventId` con el ID del evento creado

### ✅ **Para Sobreturnos**:
1. Cambia todos los sobreturnos de `status: 'pending'` a `status: 'confirmed'`
2. Crea eventos en Google Calendar para los sobreturnos que no tienen `googleEventId`
3. Actualiza el campo `googleEventId` con el ID del evento creado

## 🚀 Cómo ejecutar:

### Opción 1: Desde terminal
```bash
cd "C:\Users\JorgeHaraDevs\Desktop\CitaMedicaBeta\backend"
node sync-all-appointments.js
```

### Opción 2: Desde VS Code (recomendado)
1. Abrir el archivo `sync-all-appointments.js`
2. Hacer clic derecho
3. Seleccionar "Run Code" o presionar `Ctrl+F1`

## 📊 Resultado esperado:

```
🚀 Iniciando sincronización de todas las citas...
✅ Conectado a MongoDB

📋 Sincronizando citas normales...
Encontradas X citas normales

📝 Cita 66d2... actualizada a confirmed
📅 Evento de Google Calendar creado para cita 66d2...: cal_event_123

📋 Sincronizando sobreturnos...
Encontrados Y sobreturnos

📝 Sobreturno 66d3... actualizado a confirmed
📅 Evento de Google Calendar creado para sobreturno 66d3...: cal_event_124

🎉 SINCRONIZACIÓN COMPLETADA
=====================================
📊 Total de citas normales: X
📊 Total de sobreturnos: Y
✅ Citas actualizadas: X
✅ Sobreturnos actualizados: Y
📅 Eventos de Google Calendar creados: Z
=====================================
```

## ⚠️ Importante:

- **Backup**: El script modifica la base de datos. Asegúrate de tener un backup
- **Google Calendar**: Verificar que las credenciales estén configuradas correctamente
- **Una sola vez**: Este script debe ejecutarse solo una vez para migrar datos existentes

## 🔍 Verificar después:

1. **Frontend**: Todas las citas deberían aparecer como confirmadas
2. **Google Calendar**: Todos los eventos deberían estar creados
3. **Base de datos**: Todos los registros con `status: 'confirmed'` y `googleEventId`

---

**¡Ejecuta el script cuando estés listo!** 🚀
