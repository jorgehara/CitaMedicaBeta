import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, Snackbar, Alert } from '@mui/material';
import type { AppointmentStatus, SocialWork } from '../types/appointment';
import { appointmentService } from '../services/appointmentServiceold';

const initialFormState = {
  clientName: '',
  date: '',
  time: '',
  status: 'pending' as AppointmentStatus,
  socialWork: 'CONSULTA PARTICULAR' as SocialWork,
  phone: '',
  email: '',
  description: '',
  attended: false,
  isSobreturno: false
};

const socialWorkOptions: SocialWork[] = [
  'INSSSEP',
  'Swiss Medical',
  'OSDE',
  'Galeno',
  'CONSULTA PARTICULAR',
  'Otras Obras Sociales'
];


interface GlobalCreateAppointmentDialogProps {
  open: boolean;
  onClose: () => void;
}

const GlobalCreateAppointmentDialog: React.FC<GlobalCreateAppointmentDialogProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Construir el objeto exactamente como el test manual exitoso
      const dataToSend: any = {
        clientName: formData.clientName,
        date: formData.date,
        time: formData.time,
        socialWork: formData.socialWork,
        phone: formData.phone,
        email: formData.email,
        description: formData.description,
        isSobreturno: false // Citas normales
      };
      // Eliminar campos vacíos para evitar enviar undefined/null
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === '' || dataToSend[key] === undefined) {
          delete dataToSend[key];
        }
      });
      console.log('Creando cita normal (GlobalDialog):', dataToSend);
      await appointmentService.create(dataToSend);
      setSnackbar({
        open: true,
        message: 'Cita creada correctamente',
        severity: 'success'
      });
      onClose();
      setFormData(initialFormState);
    } catch (error: any) {
      let msg = 'Error al crear la cita';
      if (error?.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error?.message) {
        msg = error.message;
      }
      setSnackbar({
        open: true,
        message: msg,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Nueva cita</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nombre del paciente"
              name="clientName"
              value={formData.clientName}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              label="Fecha"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleFormChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Hora"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleFormChange}
              fullWidth
              required
                inputProps={{ min: '08:00', max: '22:00' }}
            />
            <TextField
              select
              label="Obra social"
              name="socialWork"
              value={formData.socialWork}
              onChange={handleFormChange}
              fullWidth
              required
            >
              {socialWorkOptions.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Teléfono"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              fullWidth
            />
            <TextField
              label="Notas"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear cita'}
          </Button>
        </DialogActions>
      </form>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default GlobalCreateAppointmentDialog;
