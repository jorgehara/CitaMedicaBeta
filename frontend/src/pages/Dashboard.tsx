import { Box, Typography, Card, CardContent, TextField } from '@mui/material';
import {
  Today as TodayIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import SimpleAppointmentList from '../components/SimpleAppointmentList';
// Permite usar la función global para abrir el diálogo de nueva cita
declare global {
  interface Window {
    openCreateAppointmentDialog: () => void;
  }
}
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
    app => app.description?.toLowerCase().includes('sobre-turno') && app.date === selectedDate
  );

  // No necesitamos handleDateChange ya que la fecha es solo informativa en el Dashboard

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, width: '100%', marginTop: 2 }}>
      {/* Panel de Citas de Hoy */}
      <Box sx={{ width: { xs: '100%', md: '49%' }, flex: 1 }}>
        <Card elevation={3}>
          <CardContent sx={{ minHeight: 120 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TodayIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Citas Hoy</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  type="date"
                  size="small"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: 1,
                    minWidth: 140,
                    '& .MuiInputBase-input': {
                      py: 1,
                      px: 1.5,
                    },
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>
            </Box>
            <SimpleAppointmentList
              appointments={todayAppointments}
              onNewAppointment={() => window.openCreateAppointmentDialog()}
            />
          </CardContent>
        </Card>
      </Box>
      {/* Panel de Sobre-turnos */}
      <Box sx={{ width: { xs: '100%', md: '49%' }, flex: 1 }}>
        <Card elevation={3}>
          <CardContent sx={{ minHeight: 120 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ScheduleIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Sobre-turnos</Typography>
            </Box>
            <SimpleAppointmentList
              appointments={overturnAppointments}
              onNewAppointment={() => window.openCreateAppointmentDialog()}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
