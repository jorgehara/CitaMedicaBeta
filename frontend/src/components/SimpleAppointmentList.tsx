import { Box, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import type { Appointment } from '../types/appointment';

interface SimpleAppointmentListProps {
  appointments: Appointment[];
  title?: string;
}

const SimpleAppointmentList = ({ appointments, title }: SimpleAppointmentListProps) => {
  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
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
              primary={appointment.clientName}
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {appointment.time}
                  </Typography>
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
