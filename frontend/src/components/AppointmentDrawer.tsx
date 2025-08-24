import React from 'react';
import { Drawer, Box, Typography, IconButton, TextField, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import type { Appointment } from '../types/appointment';

interface AppointmentDrawerProps {
  open: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSaveDescription?: (id: string, description: string) => void;
  editable?: boolean;
}

const AppointmentDrawer = ({ open, appointment, onClose, onSaveDescription, editable = true }: AppointmentDrawerProps) => {
  const [description, setDescription] = useState(appointment?.description || '');

  // Actualizar descripción local si cambia la cita
  React.useEffect(() => {
    setDescription(appointment?.description || '');
  }, [appointment]);

  if (!appointment) return null;

  const handleSave = () => {
    if (onSaveDescription && appointment._id) {
      onSaveDescription(appointment._id, description);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: '400px', md: '450px' },
          borderRadius: { xs: '16px 16px 0 0', sm: 0 },
          maxHeight: { xs: '90vh', sm: '100vh' },
          transition: 'width 0.3s ease-in-out'
        }
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 2.5, md: 3 } }}>
          <Typography variant="h6">Detalles de la cita</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Paciente</Typography>
            <Typography variant="h5">{appointment.clientName}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Fecha y hora</Typography>
            <Typography>{appointment.date} - {appointment.time}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Contacto</Typography>
            <Typography>{appointment.phone}</Typography>
            {appointment.email && <Typography>{appointment.email}</Typography>}
          </Box>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Notas / Comentarios</Typography>
            <TextField
              value={description}
              onChange={e => setDescription(e.target.value)}
              multiline
              minRows={3}
              fullWidth
              disabled={!editable}
            />
            {editable && (
              <Button variant="contained" sx={{ mt: 1 }} onClick={handleSave}>Guardar</Button>
            )}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AppointmentDrawer;
