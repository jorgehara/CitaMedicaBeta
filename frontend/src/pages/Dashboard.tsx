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
    <Box sx={{ 
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        flex: 1,
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr' },
        gap: 3,
        overflow: 'hidden',
        p: 3
      }}>
        {/* Panel izquierdo */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          gap: 3
        }}>
          <Card sx={{ bgcolor: 'background.paper' }}>
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

          <Paper sx={{ 
            flex: 1,
            bgcolor: 'background.paper',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" sx={{ p: 3, pb: 0 }}>
              Citas del Día
            </Typography>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <AppointmentList />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
