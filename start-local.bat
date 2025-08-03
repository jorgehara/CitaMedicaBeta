@echo off
echo ===============================
echo  CitaMedicaBeta - Inicio Local
echo ===============================

echo.
echo Verificando Docker Desktop...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Desktop no está instalado o no está en PATH
    pause
    exit /b 1
)

echo Docker Desktop encontrado!
echo.

echo Iniciando servicios con Docker Compose...
docker-compose --env-file .env up --build

echo.
echo ===============================
echo  Servicios iniciados:
echo  - MongoDB: localhost:27017
echo  - Backend: localhost:3001
echo  - Chatbot: localhost:3008
echo  - QR Code: http://localhost:3008/qr
echo  - Status: http://localhost:3008/status
echo  - Frontend: http://localhost
echo ===============================

pause
