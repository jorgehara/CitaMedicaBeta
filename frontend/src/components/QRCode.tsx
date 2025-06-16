import { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';

const QRCode: React.FC = () => {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [QrMessage, setQrMessage] = useState<string>("Cargando código QR...");

 const fetchQR = async () => {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`/qr?t=${timestamp}`);
    
    if (response.ok) {
      const data = await response.json();
      setQrImage(data.qr);
    } else if (response.status === 404) {
      // Mostrar mensaje específico para 404
      setQrImage(null);
      setQrMessage("WhatsApp ya está conectado o aún no ha generado un código QR");
    } else {
      setQrMessage("Error al cargar el código QR");
    }
  } catch (error) {
    console.error('Error al obtener el QR:', error);
    setQrMessage("Error de conexión al servidor");
  }
};

  useEffect(() => {
    fetchQR();
    const interval = setInterval(fetchQR, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3 
    }}>
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Escanea el código QR
        </Typography>
        {qrImage ? (
          <img 
            src={qrImage} 
            alt="QR Code" 
            style={{ 
              maxWidth: '100%',
              height: 'auto'
            }} 
          />
        ) : (
          <Typography color="text.secondary">
            {QrMessage}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Este código se actualiza automáticamente cada minuto
        </Typography>
      </Paper>
    </Box>
  );
};

export default QRCode;
