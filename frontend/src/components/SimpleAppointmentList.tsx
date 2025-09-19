import { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AppointmentDrawer from './AppointmentDrawer';
import * as sobreturnoService from '../services/sobreturnoService';
import type { Appointment } from '../types/appointment';

interface SimpleAppointmentListProps {
  appointments: Appointment[];
  title: string;
}

const SimpleAppointmentList = ({ appointments, title }: SimpleAppointmentListProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [attendedStates, setAttendedStates] = useState<{[id: string]: boolean}>(
    () => Object.fromEntries((appointments as Appointment[]).map((a: Appointment) => [a._id, a.attended || false]))
  );

  const handleItemClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDrawerOpen(true);
  };

  const handleSaveDescription = async (id: string, description: string) => {
    if (selectedAppointment && selectedAppointment._id === id) {
      setSelectedAppointment({ ...selectedAppointment, description });
    }
    try {
      await sobreturnoService.updateSobreturnoDescription(id, description);
    } catch {
      // Manejar error si es necesario
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      <List>
        {appointments.map((appointment) => (
          <ListItem
            key={appointment._id}
            sx={{
              mb: 1,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              cursor: attendedStates[appointment._id] ? 'not-allowed' : 'pointer',
              opacity: attendedStates[appointment._id] ? 0.5 : 1,
              backgroundColor: attendedStates[appointment._id] ? '#f5f5f5' : 'inherit'
            }}
            onClick={() => !attendedStates[appointment._id] && handleItemClick(appointment)}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {appointment.clientName}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{ ml: 0.5, p: 0 }}
                    disabled={attendedStates[appointment._id]}
                    onClick={e => {
                      e.stopPropagation();
                      setAttendedStates(prev => ({
                        ...prev,
                        [appointment._id]: true
                      }));
                    }}
                  >
                    <CheckCircleIcon sx={{ color: attendedStates[appointment._id] ? '#43a047' : '#bdbdbd', fontSize: 22 }} />
                  </IconButton>
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      📞 <strong>{appointment.phone}</strong>
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>{appointment.time}</Typography>
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