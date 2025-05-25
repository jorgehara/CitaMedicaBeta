import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';

const QRCode: React.FC = () => {
  const [qrImage, setQrImage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchQR = async () => {
    try {
      setError('');
      const baseUrl = import.meta.env.PROD 
        ? 'https://micitamedica.me/api' 
        : 'http://localhost:3008/api';

      const response = await fetch(`${baseUrl}/qr`, {
        headers: {
          'Accept': 'image/png',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('image/png')) {
        throw new Error('La respuesta no es una imagen PNG');
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('La imagen QR está vacía');
      }

      // Limpiar URL anterior si existe
      if (qrImage) {
        URL.revokeObjectURL(qrImage);
      }

      const imageUrl = URL.createObjectURL(blob);
      setQrImage(imageUrl);
    } catch (error) {
      console.error('Error al obtener el QR:', error);
      setError(error instanceof Error ? error.message : 'Error al obtener el código QR');
      if (qrImage) {
        URL.revokeObjectURL(qrImage);
        setQrImage('');
      }
    }
  };

  // Efecto para manejar la limpieza de URLs de objetos
  useEffect(() => {
    return () => {
      if (qrImage) {
        URL.revokeObjectURL(qrImage);
      }
    };
  }, [qrImage]);

  // Efecto para actualización periódica del QR
  useEffect(() => {
    fetchQR();
    const interval = setInterval(fetchQR, 60000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : qrImage ? (
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
