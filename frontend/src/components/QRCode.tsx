import { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';

const QRCode: React.FC = () => {
  const [qrImage, setQrImage] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const imageUrlRef = useRef<string | null>(null);

  const fetchQR = async () => {
    try {
      setError(false);
      const urlFetch = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3008'
        : 'https://micitamedica.me';
      const response = await fetch(`${urlFetch}/qr`);
      if (response.ok && response.headers.get("Content-Type")?.startsWith("image/")) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        // Limpia la anterior
        if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
        imageUrlRef.current = imageUrl;
        setQrImage(imageUrl);
      } else {
        setQrImage('');
        setError(true);
      }
    } catch (err) {
      setQrImage('');
      setError(true);
      console.error('Error al obtener el QR:', err);
    }
  };

  useEffect(() => {
    fetchQR();
    const interval = setInterval(fetchQR, 60000); // Actualizar cada minuto
    return () => {
      clearInterval(interval);
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    };
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
        {qrImage && !error ? (
          <img 
            src={qrImage} 
            alt="QR Code" 
            style={{ maxWidth: '100%', height: 'auto' }} 
            onError={() => setError(true)}
          />
        ) : (
          <Typography color="text.secondary">
            {error ? "QR no disponible aún. Intenta más tarde." : "Cargando código QR..."}
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
