@echo off
title Actualizador de QR WhatsApp
echo Iniciando actualizador de QR...
echo Presiona Ctrl+C para detener el script

if not exist "%USERPROFILE%\Desktop\QR" mkdir "%USERPROFILE%\Desktop\QR"

:loop
echo.
echo Descargando QR... %date% %time%
scp -r root@srv838272.hstgr.cloud:/root/CitaMedicaBeta/base-ts-baileys-memory/bot.qr.png "%USERPROFILE%\Desktop\QR\qr.png"
echo QR actualizado! Esperando 30 segundos...
echo El QR se encuentra en la carpeta QR de tu escritorio
timeout /t 30
goto loop
