#!/bin/sh

# Limpiar archivos de sesión
rm -rf /app/bot_sessions/*
rm -rf /app/.baileys*
rm -rf /app/baileys_store_multi.json
rm -rf /app/*.log
rm -rf /app/sessions
rm -rf /app/baileys_data

# Crear directorios necesarios
mkdir -p /app/bot_sessions
mkdir -p /app/baileys_data

# Establecer permisos
chmod -R 777 /app/bot_sessions
chmod -R 777 /app/baileys_data

# Esperar a que MongoDB esté disponible
until nc -z mongodb 27017; do
    echo "Esperando a que MongoDB esté disponible..."
    sleep 1
done

# Limpiar la base de datos de sesiones si existe
mongosh mongodb://root:Consultorio2025@mongodb:27017/consultorio?authSource=admin --eval 'db.sessions.drop()' || true

# Iniciar la aplicación
exec node dist/app.js
