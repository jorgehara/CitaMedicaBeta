@echo off
echo ===============================
echo  Deteniendo CitaMedicaBeta
echo ===============================

echo.
echo Deteniendo contenedores...
docker-compose down

echo.
echo Limpiando volúmenes (opcional)...
set /p cleanup="¿Deseas limpiar los volúmenes? (y/n): "
if /i "%cleanup%"=="y" (
    docker-compose down -v
    echo Volúmenes limpiados.
)

echo.
echo ===============================
echo  Servicios detenidos
echo ===============================

pause
