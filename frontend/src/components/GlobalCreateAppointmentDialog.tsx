import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box } from '@mui/material';
import type { AppointmentStatus, SocialWork } from '../types/appointment';

const initialFormState = {
  clientName: '',
  date: '',
  time: '',
  status: 'pending' as AppointmentStatus,
  socialWork: 'CONSULTA PARTICULAR' as SocialWork,
  phone: '',
  email: '',
  description: '',
  attended: false
};

const socialWorkOptions: SocialWork[] = [
  'INSSSEP',
  'Swiss Medical',
  'OSDE',
  'Galeno',
  'CONSULTA PARTICULAR'
];

const statusOptions = [
  { value: 'pending' as AppointmentStatus, label: 'Pendiente' },
  { value: 'confirmed' as AppointmentStatus, label: 'Confirmada' },
  { value: 'cancelled' as AppointmentStatus, label: 'Cancelada' }
];

interface GlobalCreateAppointmentDialogProps {
  open: boolean;
  onClose: () => void;
}

const GlobalCreateAppointmentDialog: React.FC<GlobalCreateAppointmentDialogProps> = ({ open, onClose }) => {
  const [formData, setFormData] = useState(initialFormState);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí deberías llamar al servicio de creación de cita global
    // await appointmentService.create(formData);
    onClose();
    setFormData(initialFormState);
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
              value={formData.time}
              onChange={handleFormChange}
              fullWidth
              required
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
          <Button type="submit" variant="contained" color="primary">Crear cita</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GlobalCreateAppointmentDialog;
