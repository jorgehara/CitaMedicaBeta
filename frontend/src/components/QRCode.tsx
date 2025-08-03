import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';

const QRCode: React.FC = () => {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrMessage, setQrMessage] = useState<string>("Cargando código QR...");
  const [isConnected, setIsConnected] = useState<boolean>(false);

 const fetchStatus = async () => {
  try {
    const response = await fetch('/status');
    
    if (response.ok) {
      const data = await response.json();
      setIsConnected(data.connected);
      
      if (data.connected) {
        setQrImage(null);
        setQrMessage(`WhatsApp conectado${data.botNumber ? ` al número: ${data.botNumber}` : ''}`);
      } else if (data.qr) {
        setQrImage(data.qr);
        setQrMessage("Escanea el código QR con WhatsApp");
      } else {
        setQrImage(null);
        setQrMessage("Esperando código QR...");
      }
    } else {
      setQrMessage("Error al obtener el estado");
      setQrImage(null);
    }
  } catch (error) {
    console.error('Error al obtener el estado:', error);
    setQrMessage("Error de conexión al servidor");
  }
};

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/disconnect', {
        method: 'POST'
      });
      
      if (response.ok) {
        setIsConnected(false);
        setQrImage(null);
        setQrMessage('Desconectado. Esperando nuevo código QR...');
      } else {
        const data = await response.json();
        setQrMessage(data.message || 'Error al desconectar');
      }
    } catch (error) {
      console.error('Error al desconectar:', error);
      setQrMessage('Error al desconectar');
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Actualizar cada 5 segundos

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
            {qrMessage}
          </Typography>
        )}
        {isConnected && (
          <Button
            variant="contained"
            color="error"
            onClick={handleDisconnect}
            sx={{ mt: 2 }}
          >
            Desconectar WhatsApp
          </Button>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {isConnected ? 'Conectado a WhatsApp' : 'El código QR se actualiza automáticamente cada 5 segundos'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default QRCode;
