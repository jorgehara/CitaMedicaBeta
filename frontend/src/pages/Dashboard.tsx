import { Box, Typography, Card, CardContent, TextField } from '@mui/material';
import {
  Today as TodayIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useState, useRef, useEffect } from 'react';
import CreateOverturnDialog from '../components/CreateOverturnDialog';
import SimpleAppointmentList from '../components/SimpleAppointmentList';
// Permite usar la función global para abrir el diálogo de nueva cita
declare global {
  interface Window {
    openCreateAppointmentDialog: () => void;
  }
}
import { mockAppointments } from '../mockData/appointments';
import AppointmentList from '../components/AppointmentList';

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
  const [openOverturnDialog, setOpenOverturnDialog] = useState(false);
  const [appointments, setAppointments] = useState(mockAppointments);

  // Filtrar citas para hoy y próximas
  const todayAppointments = appointments.filter(
    app => app.date === selectedDate && !app.isSobreturno
  );
  const overturnAppointments = appointments.filter(
    app => app.date === selectedDate && app.isSobreturno
  );

  // Crear sobre turno
  const handleCreateOverturn = (data: any) => {
    setAppointments(prev => [
      ...prev,
      {
        ...data,
        _id: 'mock-' + (prev.length + 1),
        isSobreturno: true
      }
    ]);
  };

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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Sobre-turnos</Typography>
              </Box>
            </Box>
            <SimpleAppointmentList
              appointments={overturnAppointments}
              onNewAppointment={() => setOpenOverturnDialog(true)}
            />
            <CreateOverturnDialog
              open={openOverturnDialog}
              onClose={() => setOpenOverturnDialog(false)}
              onCreate={handleCreateOverturn}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
