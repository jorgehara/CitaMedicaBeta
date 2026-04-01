import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import authService from '../services/authService';

const isOdontologia = window.location.hostname.includes('od-melinavillalba');

// ─── Kulinka: usa el sistema existente /status (json con qr base64) ──────────
const fetchKulinkaStatus = async (): Promise<{ connected: boolean; qr: string | null; botNumber?: string }> => {
  const response = await fetch('/status');
  if (!response.ok) throw new Error('Error al obtener el estado');
  return response.json();
};

// ─── Odontología: lee bot.qr.png del disco vía backend ───────────────────────
const fetchOdontologiaQR = async (): Promise<string> => {
  const token = authService.getToken();
  if (!token) throw new Error('Sin sesión activa');

  const response = await fetch(`/api/qr/odontologia?t=${Date.now()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'QR no disponible');
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

// ─── Componente ───────────────────────────────────────────────────────────────
const ChatbotQR: React.FC = () => {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [message, setMessage] = useState('Cargando código QR...');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const doctorName = isOdontologia ? 'Od. Melina Villalba' : 'Dr. Kulinka';

  const loadQR = async () => {
    setLoading(true);
    try {
      if (isOdontologia) {
        // Limpiar blob anterior para evitar memory leak
        if (blobUrl) URL.revokeObjectURL(blobUrl);

        const url = await fetchOdontologiaQR();
        setBlobUrl(url);
        setQrImage(url);
        setIsConnected(false);
        setMessage('Escaneá el código QR con WhatsApp');
      } else {
        const data = await fetchKulinkaStatus();
        setIsConnected(data.connected);
        if (data.connected) {
          setQrImage(null);
          setMessage(`WhatsApp conectado${data.botNumber ? ` al número: ${data.botNumber}` : ''}`);
        } else if (data.qr) {
          setQrImage(data.qr);
          setMessage('Escaneá el código QR con WhatsApp');
        } else {
          setQrImage(null);
          setMessage('Esperando código QR...');
        }
      }
    } catch (err: any) {
      setQrImage(null);
      setMessage(err.message || 'Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/disconnect', { method: 'POST' });
      if (response.ok) {
        setIsConnected(false);
        setQrImage(null);
        setMessage('Desconectado. Esperando nuevo código QR...');
      } else {
        const data = await response.json();
        setMessage(data.message || 'Error al desconectar');
      }
    } catch {
      setMessage('Error al desconectar');
    }
  };

  const handleFullscreen = () => {
    if (!qrImage) return;
    const win = window.open('', '_blank');
    if (!win) { alert('Habilitá los popups para ver el QR en pantalla completa'); return; }
    win.document.write(`
      <!DOCTYPE html><html>
      <head>
        <title>QR WhatsApp — ${doctorName}</title>
        <style>
          body { margin:0; display:flex; align-items:center; justify-content:center;
                 min-height:100vh; background:linear-gradient(135deg,#667eea,#764ba2); font-family:sans-serif; }
          .box { background:#fff; border-radius:20px; padding:40px; text-align:center;
                 box-shadow:0 20px 60px rgba(0,0,0,.3); }
          img  { width:400px; height:400px; border:3px solid #667eea; border-radius:15px; padding:20px; }
          h2   { color:#333; margin-bottom:6px; }
          p    { color:#666; margin-bottom:16px; }
          .warn{ background:#fff3cd; border:2px solid #ffc107; border-radius:8px;
                 padding:12px; margin-top:20px; color:#856404; font-size:.9rem; }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>🔗 Vincular WhatsApp</h2>
          <p>${doctorName}</p>
          <img src="${qrImage}" alt="QR"/>
          <div class="warn">⏱️ El QR expira en ~60 segundos. Si venció, cerrá esta ventana y hacé clic en <b>Actualizar</b>.</div>
        </div>
      </body></html>`);
    win.document.close();
  };

  useEffect(() => {
    loadQR();
    const interval = setInterval(loadQR, isOdontologia ? 30000 : 5000);
    return () => {
      clearInterval(interval);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 480, width: '100%' }}>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
          <QrCode2Icon sx={{ fontSize: 28, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            QR WhatsApp — {doctorName}
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ py: 4 }}>
            <CircularProgress size={48} />
          </Box>
        )}

        {!loading && qrImage && (
          <>
            <img
              src={qrImage}
              alt="QR WhatsApp"
              style={{ maxWidth: '100%', height: 'auto', maxHeight: 320, borderRadius: 8 }}
            />
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={handleFullscreen}
                sx={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff' }}>
                📱 Pantalla completa
              </Button>
              <Button variant="outlined" onClick={loadQR}>
                🔄 Actualizar
              </Button>
            </Box>
          </>
        )}

        {!loading && !qrImage && (
          <Typography color={message.toLowerCase().includes('error') ? 'error' : 'text.secondary'} sx={{ py: 4 }}>
            {message}
          </Typography>
        )}

        {!loading && isConnected && (
          <Button variant="contained" color="error" onClick={handleDisconnect} sx={{ mt: 2 }}>
            Desconectar WhatsApp
          </Button>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          {isConnected
            ? 'WhatsApp conectado correctamente'
            : `El QR se actualiza cada ${isOdontologia ? '30' : '5'} segundos`}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ChatbotQR;
