import { Box, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import NewAppointmentButton from './NewAppointmentButton';
import type { Appointment } from '../types/appointment';

interface SimpleAppointmentListProps {
  appointments: Appointment[];
  title?: string;
  onNewAppointment?: () => void;
  onValidateOverturn?: (id: string, status: 'confirmed' | 'cancelled') => void;
}

const SimpleAppointmentList = ({ appointments, title, onNewAppointment, onValidateOverturn }: SimpleAppointmentListProps) => {
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
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {appointment.clientName}
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                    {appointment.time}
                  </Typography>
                </Box>
              }
              secondary={
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
                  <Typography variant="body2" color="text.secondary">
                    {appointment.socialWork}
                  </Typography>
                  {onValidateOverturn && appointment.status === 'pending' && appointment.isSobreturno && (
                    <>
                      <button
                        style={{ marginLeft: 8, color: 'green', border: 'none', background: 'none', cursor: 'pointer' }}
                        title="Aceptar"
                        onClick={() => onValidateOverturn(appointment._id, 'confirmed')}
                      >Aceptar</button>
                      <button
                        style={{ marginLeft: 4, color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                        title="Rechazar"
                        onClick={() => onValidateOverturn(appointment._id, 'cancelled')}
                      >Rechazar</button>
                    </>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default SimpleAppointmentList;
