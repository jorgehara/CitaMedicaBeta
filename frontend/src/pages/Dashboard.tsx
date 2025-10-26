import { Box, Typography, Card, CardContent, TextField } from '@mui/material';
import {
  Today as TodayIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import type { Appointment } from '../types/appointment';
import CreateOverturnDialog from '../components/CreateOverturnDialog';
import SimpleAppointmentList from '../components/SimpleAppointmentList';
// Permite usar la función global para abrir el diálogo de nueva cita
declare global {
  interface Window {
    openCreateAppointmentDialog: () => void;
    refreshAppointments?: () => void; // Añadimos una función para refrescar las citas
  }
}
import { appointmentService } from '../services/appointmentServiceold';
import * as sobreturnoService from '../services/sobreturnoService';


const Dashboard = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [openOverturnDialog, setOpenOverturnDialog] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [overturnAppointments, setOverturnAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtrar citas para la fecha seleccionada
  const todayAppointments = appointments.filter(
    app => app.date === selectedDate && !app.isSobreturno
  );
  const overturnsToday = overturnAppointments.filter(
    (app: any) => app.date === selectedDate
  );

  // Obtener citas del backend
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await appointmentService.getAll();
        setAppointments(data);
      } catch (e) {
        console.error('Error al cargar citas:', e);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Crear función global para actualizar las citas
    window.refreshAppointments = fetchAppointments;
    
    fetchAppointments();
    
    return () => {
      // Limpiar la función global al desmontar el componente
      window.refreshAppointments = undefined;
    };
  }, [selectedDate]);

  // Obtener sobre turnos del backend
  useEffect(() => {
    const fetchSobreturnos = async () => {
      try {
        const data = await sobreturnoService.getSobreturnos();
        setOverturnAppointments(data);
      } catch (e) {
        console.error('Error al cargar sobreturnos:', e);
        setOverturnAppointments([]);
      }
    };
    fetchSobreturnos();
  }, [selectedDate]);

  // Handler para crear un nuevo sobreturno
  const handleCreateOverturn = async (overturnData: Omit<Appointment, '_id'>) => {
    try {
      await sobreturnoService.createSobreturno({ ...overturnData, status: 'pending' });
      // Refrescar sobreturnos y citas
      const [updatedSobreturnos, updatedAppointments] = await Promise.all([
        sobreturnoService.getSobreturnos(),
        appointmentService.getAll()
      ]);
      setOverturnAppointments(updatedSobreturnos);
      setAppointments(updatedAppointments);
    } catch (e) {
      console.error('Error al crear sobreturno:', e);
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
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <Typography>Cargando citas...</Typography>
              </Box>
            ) : (
              <SimpleAppointmentList
                appointments={todayAppointments}
                title=""
                showCreateButton
                onCreateClick={() => window.openCreateAppointmentDialog?.()}
              />
            )}
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
              title=""
              showCreateButton
              onCreateClick={() => setOpenOverturnDialog(true)}
              buttonLabel="NUEVO SOBRETURNO"
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
