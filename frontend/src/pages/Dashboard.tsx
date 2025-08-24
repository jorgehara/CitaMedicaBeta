import { Box, Typography, Card, CardContent, TextField } from '@mui/material';
import {
  Today as TodayIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import CreateOverturnDialog from '../components/CreateOverturnDialog';
import SimpleAppointmentList from '../components/SimpleAppointmentList';
// Permite usar la función global para abrir el diálogo de nueva cita
declare global {
  interface Window {
    openCreateAppointmentDialog: () => void;
  }
}
import { mockAppointments } from '../mockData/appointments';
import * as sobreturnoService from '../services/sobreturnoService';
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
  const [overturnAppointments, setOverturnAppointments] = useState([]);

  // Filtrar citas para hoy y próximas (mock solo para turnos normales)
  const todayAppointments = appointments.filter(
    app => app.date === selectedDate && !app.isSobreturno
  );
  const overturnsToday = overturnAppointments.filter(
    (app: any) => app.date === selectedDate
  );

  // Obtener sobre turnos del backend
  useEffect(() => {
    const fetchSobreturnos = async () => {
      try {
        const data = await sobreturnoService.getSobreturnos();
        setOverturnAppointments(data);
      } catch (e) {
        setOverturnAppointments([]);
      }
    };
    fetchSobreturnos();
  }, [selectedDate]);

  // Crear sobre turno
  const handleCreateOverturn = async (data: any) => {
    try {
      await sobreturnoService.createSobreturno({ ...data, status: 'pending' });
      const updated = await sobreturnoService.getSobreturnos();
      setOverturnAppointments(updated);
    } catch (e) {
      // Manejar error
    }
  };

  // Validar (aceptar/rechazar) sobre turno
  const handleValidateOverturn = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      await sobreturnoService.updateSobreturnoStatus(id, status);
      const updated = await sobreturnoService.getSobreturnos();
      setOverturnAppointments(updated);
    } catch (e) {
      // Manejar error
    }
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
              appointments={overturnsToday}
              onNewAppointment={() => setOpenOverturnDialog(true)}
              onValidateOverturn={handleValidateOverturn}
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
