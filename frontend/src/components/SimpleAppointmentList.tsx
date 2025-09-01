import { Box, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import { useState } from 'react';
import AppointmentDrawer from './AppointmentDrawer';
import * as sobreturnoService from '../services/sobreturnoService';
import NewAppointmentButton from './NewAppointmentButton';
import type { Appointment } from '../types/appointment';

interface SimpleAppointmentListProps {
  appointments: Appointment[];
  title?: string;
  onNewAppointment?: () => void;
  onValidateOverturn?: (id: string, status: 'confirmed' | 'cancelled') => void;
}

const SimpleAppointmentList = ({ appointments, title, onNewAppointment, onValidateOverturn }: SimpleAppointmentListProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleItemClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDrawerOpen(true);
  };

  const handleSaveDescription = async (id: string, description: string) => {
    if (selectedAppointment && selectedAppointment._id === id) {
      setSelectedAppointment({ ...selectedAppointment, description });
    }
    // Si es sobreturno, guardar en backend
    try {
      await sobreturnoService.updateSobreturnoDescription(id, description);
    } catch (e) {
      // Manejar error si es necesario
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        {onNewAppointment && <NewAppointmentButton onClick={onNewAppointment} />}
      </Box>
      <List>
        {appointments.map((appointment) => (
          <ListItem
            key={appointment._id}
            sx={{
              mb: 1,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              cursor: 'pointer'
            }}
            onClick={() => handleItemClick(appointment)}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {appointment.clientName}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                    {appointment.time}
                  </Typography>
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {/* Primera fila: Status y Obra Social */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={appointment.status}
                      size="small"
                      color={
                        appointment.status === 'confirmed'
                          ? 'success'
                          : appointment.status === 'pending'
                          ? 'warning'
                          : 'error'
                      }
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {appointment.socialWork}
                    </Typography>
                  </Box>
                  
                  {/* Segunda fila: Teléfono y DNI */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      📞 <strong>{appointment.phone}</strong>
                    </Typography>
                    {appointment.dni && (
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        🆔 <strong>{appointment.dni}</strong>
                      </Typography>
                    )}
                  </Box>

                  {/* Botones de validación para sobreturnos */}
                  {onValidateOverturn && appointment.status === 'pending' && appointment.isSobreturno && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <button
                        style={{ 
                          padding: '4px 8px', 
                          color: 'white', 
                          backgroundColor: 'green', 
                          border: 'none', 
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title="Aceptar"
                        onClick={e => { e.stopPropagation(); onValidateOverturn(appointment._id, 'confirmed'); }}
                      >✓ Aceptar</button>
                      <button
                        style={{ 
                          padding: '4px 8px', 
                          color: 'white', 
                          backgroundColor: 'red', 
                          border: 'none', 
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title="Rechazar"
                        onClick={e => { e.stopPropagation(); onValidateOverturn(appointment._id, 'cancelled'); }}
                      >✗ Rechazar</button>
                    </Box>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
      <AppointmentDrawer
        open={drawerOpen}
        appointment={selectedAppointment}
        onClose={() => setDrawerOpen(false)}
        onSaveDescription={handleSaveDescription}
      />
    </Box>
  );
};

export default SimpleAppointmentList;
