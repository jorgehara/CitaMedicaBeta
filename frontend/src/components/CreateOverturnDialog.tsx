import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, Alert } from '@mui/material';
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

interface CreateOverturnDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

const CreateOverturnDialog: React.FC<CreateOverturnDialogProps> = ({ open, onClose, onCreate }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateHour = (time: string) => {
    const [hour] = time.split(':').map(Number);
    return hour >= 8 && hour < 22;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateHour(formData.time)) {
      setError('El horario debe estar entre las 08:00 y las 22:00.');
      return;
    }
    setError(null);
    onCreate({ ...formData, isOverturn: true });
    onClose();
    setFormData(initialFormState);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Nuevo sobre-turno</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
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
          <Button type="submit" variant="contained" color="primary">Crear sobre-turno</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateOverturnDialog;
