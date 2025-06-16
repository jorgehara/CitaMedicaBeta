import { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';

const QRCode: React.FC = () => {
  const [qrImage, setQrImage] = useState<string>('');
  
  const fetchQR = async () => {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`/qr?t=${timestamp}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.qr) {
        // Usar directamente la URL de datos de la respuesta
        setQrImage(data.qr);
      } else {
        console.warn('QR recibido está vacío');
      }
    } else {
      console.warn('Error al obtener QR:', response.status);
    }
  } catch (error) {
    console.error('Error al obtener el QR:', error);
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
            Cargando código QR...
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
