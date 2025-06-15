@echo off
title Actualizador de QR WhatsApp
echo Iniciando actualizador de QR...
echo Presiona Ctrl+C para detener el script

if not exist "%USERPROFILE%\Desktop\QR" mkdir "%USERPROFILE%\Desktop\QR"

:loop
echo.
echo Descargando QR... %date% %time%
scp -P 22 "root@srv838272.hstgr.cloud:/root/CitaMedicaBeta/base-ts-baileys-memory/bot.qr.png" "%USERPROFILE%\Desktop\QR\qr.png"

if %ERRORLEVEL% NEQ 0 (
    echo Error al descargar el QR. Verificando archivo...
    ssh root@srv838272.hstgr.cloud "ls -l /root/CitaMedicaBeta/base-ts-baileys-memory/bot.qr.png"
) else (
    echo QR descargado correctamente
)
echo QR actualizado! Esperando 30 segundos...
echo El QR se encuentra en la carpeta QR de tu escritorio
timeout /t 30
goto loop
