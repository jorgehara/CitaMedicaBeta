# Actualizador de QR para WhatsApp (Windows)

Esta herramienta permite descargar y mantener actualizado el código QR del chatbot de WhatsApp.

## Requisitos
- Windows 7/8/10/11
- Conexión SSH al servidor configurada
- OpenSSH instalado en Windows

## Instrucciones de uso

1. Extraer el contenido del ZIP en cualquier ubicación
2. Hacer doble clic en `update-qr.bat`
3. El script creará una carpeta llamada `QR` en tu escritorio
4. El QR se descargará automáticamente cada 30 segundos
5. El archivo QR se guardará como `qr.png` dentro de la carpeta `QR`

## Ubicación del QR
```
C:\Users\TuUsuario\Desktop\QR\qr.png
```

## Para detener el script
- Presiona `Ctrl+C` en la ventana del script
- O simplemente cierra la ventana

## Notas
- El QR se actualiza cada 30 segundos automáticamente
- Mantén la ventana abierta mientras necesites actualizar el QR
- Si cierras la ventana, el script dejará de actualizar el QR
