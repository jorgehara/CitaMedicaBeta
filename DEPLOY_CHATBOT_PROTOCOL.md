# Protocolo OBLIGATORIO para Deploy de Cambios que Afectan Chatbot

## 🚨 NUNCA SALTEAR ESTOS PASOS 🚨

### Paso 1: Reboot del VPS Tailscale (PRIMERO)

```bash
# Conectarte a Tailscale VPN en Windows primero
# Luego:
ssh jorgeharadevs@100.120.226.7 "sudo reboot"
```

**Resultado esperado**: 
- Conexión SSH se cortará (normal)
- El servidor se apagará y reiniciará

---

### Paso 2: ESPERAR 10 MINUTOS (NO NEGOCIABLE)

⏰ **Configurá un temporizador por 10 minutos**

**NO hagas NADA durante estos 10 minutos:**
- ❌ No intentes conectarte
- ❌ No sigas con el deploy
- ❌ No revises logs
- ✅ Esperá los 10 minutos completos

**Por qué 10 minutos:**
- Sistema Tailscale necesita reconectar
- MongoDB necesita iniciar completamente
- PM2 necesita autostart de servicios
- Network stack necesita estabilizarse
- Reducir a 5 min causa problemas intermitentes

---

### Paso 3: Verificar que el Servidor Está Arriba

```bash
ssh jorgeharadevs@100.120.226.7 "uptime"
```

**Resultado esperado**:
```
up 2 minutes, ...
```

Si da timeout, **esperá 2 minutos más** y reintentá.

---

### Paso 4: Verificar Servicios Autoiniciados

```bash
ssh jorgeharadevs@100.120.226.7 "pm2 list"
```

**Resultado esperado**:
- `chatbot-odontologa` - status: `online` o `stopped`
- `restart-server` - status: `online` o `stopped`

---

### Paso 5: Deploy de Cambios (si corresponde)

**Solo si hiciste cambios en el código del chatbot:**

```bash
ssh jorgeharadevs@100.120.226.7

# Para AnitaChatBot-Odontologia
cd ~/Desktop/AnitaChatBot-Odontologia
git pull origin main
npm install  # solo si cambió package.json
npm run build  # solo si es TypeScript

# Para AnitaByCitaMedica (CharlyBot)
cd ~/Desktop/AnitaByCitaMedica
git pull origin main
npm install  # solo si cambió package.json
npm run build  # solo si es TypeScript
```

---

### Paso 6: Reiniciar Chatbots (EN ORDEN)

**PRIMERO: chatbot-odontologa**

```bash
cd ~/Desktop/AnitaChatBot-Odontologia/
pm2 delete chatbot-odontologa  # eliminar proceso viejo
pm2 start restart-server.sh --interpreter bash --name chatbot-odontologa
pm2 logs chatbot-odontologa --lines 30
```

**Verificá logs**: Debe decir `✅ Connected Provider` o similar.

**SEGUNDO: restart-server (CharlyBot)**

```bash
cd ~/Desktop/AnitaByCitaMedica/
pm2 delete restart-server  # eliminar proceso viejo
pm2 start restart-server.sh --interpreter bash --name restart-server
pm2 logs restart-server --lines 30
```

**Verificá logs**: Debe decir `✅ Connected Provider` o similar.

---

### Paso 7: Guardar Configuración PM2

```bash
pm2 save
```

Esto guarda el estado actual para que PM2 los reinicie automáticamente después del próximo reboot.

---

### Paso 8: Verificar Estado Final

```bash
pm2 status
```

**Resultado esperado**:
```
┌────┬─────────────────────┬─────────┬─────────┬──────┬────────┬─────────┐
│ id │ name                │ mode    │ pid     │ ↺    │ status │ cpu     │
├────┼─────────────────────┼─────────┼─────────┼──────┼────────┼─────────┤
│ 0  │ chatbot-odontologa  │ fork    │ 12345   │ 0    │ online │ 0%      │
│ 1  │ restart-server      │ fork    │ 12346   │ 0    │ online │ 0%      │
└────┴─────────────────────┴─────────┴─────────┴──────┴────────┴─────────┘
```

Ambos deben estar `online`.

---

### Paso 9: Probar Chatbots

**Chatbot Odontóloga:**
- Enviar WhatsApp a número de Od. Villalba
- Escribir "hola"
- Debe responder con menú

**CharlyBot (Dr. Kulinka):**
- Enviar WhatsApp a número de Dr. Kulinka
- Escribir "hola"  
- Debe mostrar horarios disponibles

---

## 🚨 Errores Comunes

### "Connection refused" al hacer SSH después de reboot
- **Solución**: Esperá 2 minutos más. El servidor aún no terminó de arrancar.

### PM2 dice "pm2: command not found"
- **Solución**: Falta cargar NVM. Ejecutá:
  ```bash
  source ~/.nvm/nvm.sh
  pm2 list
  ```

### Chatbot dice "offline" o "errored" en pm2 list
- **Solución**: Revisá logs:
  ```bash
  pm2 logs chatbot-odontologa --lines 50
  # o
  pm2 logs restart-server --lines 50
  ```
- Buscá errores de conexión, permisos, o puertos ocupados

### Chatbot no responde en WhatsApp
- **Verificá**: QR code escaneado y sesión activa
- **Verificá**: Logs de PM2 no muestren errores de Baileys
- **Verificá**: Archivo `bot_sessions/` existe con datos de sesión

---

## 📝 Checklist Rápido

Antes de cualquier cambio en VPS Tailscale:

- [ ] ¿Hiciste reboot? (`ssh jorgeharadevs@100.120.226.7 "sudo reboot"`)
- [ ] ¿Esperaste 10 minutos COMPLETOS?
- [ ] ¿Verificaste que el servidor está arriba? (`ssh ... "uptime"`)
- [ ] ¿Hiciste pull de cambios? (si aplica)
- [ ] ¿Reiniciaste chatbot-odontologa PRIMERO?
- [ ] ¿Reiniciaste restart-server SEGUNDO?
- [ ] ¿Guardaste PM2? (`pm2 save`)
- [ ] ¿Verificaste que ambos están online? (`pm2 status`)
- [ ] ¿Probaste ambos chatbots por WhatsApp?

---

## 🎯 Recordatorios

1. **SIEMPRE reboot antes de cambios** - No hay excepciones
2. **10 minutos de espera** - No negociable
3. **Orden de inicio**: odontologa → CharlyBot
4. **Verificar logs** después de cada restart
5. **pm2 save** al final para persistir configuración

---

**Última actualización**: 2026-04-01
