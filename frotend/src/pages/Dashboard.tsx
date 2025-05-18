import { Box, Grid, Paper, Typography, Card, CardContent } from '@mui/material';
import {
  EventNote as EventNoteIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import AppointmentList from '../components/AppointmentList';

const Dashboard = () => {
  // Datos de ejemplo
  const citasHoy = 3;
  const patientDetails = {
    name: 'Juan Pérez',
    phone: '555-0001',
    email: 'juan@email.com',
    socialSecurity: 'OSDE'
  };

  return (
    <Box sx={{ height: '100%' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Panel izquierdo */}
        <Box>
          <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <EventNoteIcon color="primary" />
                <Typography variant="h6">Citas Hoy</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {citasHoy}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +2 programadas
              </Typography>
            </CardContent>
          </Card>

          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Citas del Día
            </Typography>
            <AppointmentList />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
