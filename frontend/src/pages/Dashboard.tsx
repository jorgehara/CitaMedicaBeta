import { Box, Typography, Card, CardContent } from '@mui/material';
import {
  Today as TodayIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import SimpleAppointmentList from '../components/SimpleAppointmentList';
import { mockAppointments } from '../mockData/appointments';

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const Dashboard = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // Filtrar citas para hoy y próximas
  const todayAppointments = mockAppointments.filter(
    app => app.date === selectedDate
  );
  
  const overturnAppointments = mockAppointments.filter(
    app => app.description?.toLowerCase().includes('sobre-turno')
  );

  // No necesitamos handleDateChange ya que la fecha es solo informativa en el Dashboard

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, width: '100%', marginTop: 2 }}>
      {/* Panel de Citas de Hoy */}
      <Box sx={{ width: { xs: '100%', md: '49%' }, flex: 1 }}>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TodayIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Citas Hoy</Typography>
              </Box>
              <Typography variant="subtitle1" color="text.secondary">
                {formatDate(selectedDate)}
              </Typography>
            </Box>
            <SimpleAppointmentList appointments={todayAppointments} />
          </CardContent>
        </Card>
      </Box>

      {/* Panel de Sobre-turnos */}
      <Box sx={{ width: { xs: '100%', md: '49%' }, flex: 1 }}>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ScheduleIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Sobre-turnos</Typography>
            </Box>
            <SimpleAppointmentList appointments={overturnAppointments} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
