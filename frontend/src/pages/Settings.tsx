import { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Alert, Snackbar } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const Settings = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleDeleteSessions = async () => {
    try {
      const response = await fetch('/api/bot/sessions', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Sesiones eliminadas correctamente',
          severity: 'success'
        });
      } else {
        throw new Error('Error al eliminar las sesiones');
      }
    } catch {
      setSnackbar({
        open: true,
        message: 'Error al eliminar las sesiones',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Configuración
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Gestión de sesiones de WhatsApp
          </Typography>
          <Typography color="text.secondary" paragraph>
            Eliminar todas las sesiones de WhatsApp guardadas. Esto requerirá volver a escanear el código QR para reconectar el bot.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteSessions}
            sx={{ mt: 2 }}
          >
            Eliminar sesiones
          </Button>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;