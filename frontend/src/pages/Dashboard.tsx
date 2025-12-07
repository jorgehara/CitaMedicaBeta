import { Box, Typography, Card, CardContent, TextField, IconButton, Tooltip, Chip, CircularProgress } from '@mui/material';
import {
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Appointment } from '../types/appointment';
import CreateOverturnDialog from '../components/CreateOverturnDialog';
import SimpleAppointmentList from '../components/SimpleAppointmentList';
import PageTransition from '../components/animations/PageTransition';
import ScaleIn from '../components/animations/ScaleIn';
import { appointmentService } from '../services/appointmentService';
import * as sobreturnoService from '../services/sobreturnoService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Declaración global
declare global {
  interface Window {
    updateAppointmentsList?: (appointments: Appointment[]) => void;
    openCreateAppointmentDialog: () => void;
    refreshAppointments?: () => void;
  }
}

const AUTO_REFRESH_INTERVAL = 60000; // 1 minuto

const Dashboard = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [openOverturnDialog, setOpenOverturnDialog] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [overturnAppointments, setOverturnAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [timeAgo, setTimeAgo] = useState<string>('justo ahora');

  // Filtrar citas para la fecha seleccionada
  const todayAppointments = appointments.filter(
    app => app.date === selectedDate && !app.isSobreturno
  );
  const overturnsToday = overturnAppointments.filter(
    (app: any) => app.date === selectedDate
  );

  // Función para obtener todas las citas
  const fetchAllData = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsRefreshing(true);
      }

      const [appointmentsData, sobreturnosData] = await Promise.all([
        appointmentService.getAll(),
        sobreturnoService.getSobreturnos()
      ]);

      setAppointments(appointmentsData);
      setOverturnAppointments(sobreturnosData);
      setLastUpdate(new Date());

      console.log('[DASHBOARD] Datos actualizados:', {
        citas: appointmentsData.length,
        sobreturnos: sobreturnosData.length,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error('[DASHBOARD] Error al cargar datos:', e);
    } finally {
      if (showLoadingState) {
        setIsRefreshing(false);
      }
      setLoading(false);
    }
  }, []);

  // Actualizar "hace X tiempo" cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const timeString = formatDistanceToNow(lastUpdate, {
          addSuffix: true,
          locale: es
        });
        setTimeAgo(timeString);
      } catch (error) {
        setTimeAgo('justo ahora');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  // Auto-refresh cada 1 minuto
  useEffect(() => {
    // Carga inicial
    fetchAllData(true);

    // Configurar auto-refresh
    const interval = setInterval(() => {
      console.log('[AUTO-REFRESH] Actualizando datos automáticamente...');
      fetchAllData(false); // No mostrar loading spinner en auto-refresh
    }, AUTO_REFRESH_INTERVAL);

    // Función global para refresh manual
    window.refreshAppointments = () => fetchAllData(true);

    return () => {
      clearInterval(interval);
      window.refreshAppointments = undefined;
    };
  }, [fetchAllData]);

  // Actualizar cuando cambie la fecha
  useEffect(() => {
    window.updateAppointmentsList = (updatedAppointments: Appointment[]) => {
      setAppointments(updatedAppointments);
    };

    return () => {
      window.updateAppointmentsList = undefined;
    };
  }, []);

  // Handler para refresh manual
  const handleManualRefresh = async () => {
    await fetchAllData(true);
  };

  // Handler para crear sobreturno
  const handleCreateOverturn = async (overturnData: Omit<Appointment, '_id'>) => {
    try {
      await sobreturnoService.createSobreturno({ ...overturnData, status: 'pending' });
      // Refrescar datos
      await fetchAllData(true);
    } catch (e) {
      console.error('[DASHBOARD] Error al crear sobreturno:', e);
    }
  };

  return (
    <PageTransition>
      {/* Header con estadísticas y refresh */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <Typography variant="h4" className="font-bold mb-1" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#1565c0' }}>
              Dashboard
            </Typography>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <AccessTimeIcon className="text-lg" />
              <span>Última actualización: {timeAgo}</span>
            </div>
          </div>

          <Box className="flex items-center gap-2">
            {/* Indicador de auto-refresh */}
            <Chip
              icon={<AccessTimeIcon />}
              label="Auto-actualización: 1 min"
              size="small"
              color="primary"
              variant="outlined"
              className="hidden sm:flex"
            />

            {/* Botón de refresh manual */}
            <Tooltip title="Actualizar ahora">
              <span>
                <IconButton
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400 transition-all duration-200"
                  size="small"
                >
                  <motion.div
                    animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                    transition={{
                      duration: 1,
                      repeat: isRefreshing ? Infinity : 0,
                      ease: 'linear'
                    }}
                  >
                    <RefreshIcon />
                  </motion.div>
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        {/* Estadísticas rápidas */}
        <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ScaleIn delay={0.1}>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <Typography variant="h4" className="font-bold mb-1">
                  {todayAppointments.length}
                </Typography>
                <Typography variant="body2" className="opacity-90">
                  Citas de hoy
                </Typography>
              </CardContent>
            </Card>
          </ScaleIn>

          <ScaleIn delay={0.2}>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <Typography variant="h4" className="font-bold mb-1">
                  {overturnsToday.length}
                </Typography>
                <Typography variant="body2" className="opacity-90">
                  Sobreturnos
                </Typography>
              </CardContent>
            </Card>
          </ScaleIn>

          <ScaleIn delay={0.3}>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <Typography variant="h4" className="font-bold mb-1">
                  {todayAppointments.length + overturnsToday.length}
                </Typography>
                <Typography variant="body2" className="opacity-90">
                  Total del día
                </Typography>
              </CardContent>
            </Card>
          </ScaleIn>
        </Box>
      </motion.div>

      {/* Paneles de citas */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center h-64"
          >
            <CircularProgress size={60} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-4"
          >
            {/* Panel de Citas */}
            <Box className="w-full md:w-[calc(50%-0.5rem)] flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full"
              >
                <Card elevation={3} className="h-full" sx={{ display: 'flex', flexDirection: 'column', minHeight: '400px', maxHeight: '600px' }}>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Box className="flex items-center justify-between mb-4">
                      <Box className="flex items-center gap-2">
                        <TodayIcon className="text-blue-500" />
                        <Typography variant="h6" className="font-semibold">
                          Citas Hoy
                        </Typography>
                      </Box>
                      <TextField
                        type="date"
                        size="small"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="min-w-[140px]"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                      <SimpleAppointmentList
                        appointments={todayAppointments}
                        title=""
                        showCreateButton
                        onCreateClick={() => window.openCreateAppointmentDialog?.()}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>

            {/* Panel de Sobreturnos */}
            <Box className="w-full md:w-[calc(50%-0.5rem)] flex-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="h-full"
              >
                <Card elevation={3} className="h-full" sx={{ display: 'flex', flexDirection: 'column', minHeight: '400px', maxHeight: '600px' }}>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Box className="flex items-center gap-2 mb-4">
                      <ScheduleIcon className="text-purple-500" />
                      <Typography variant="h6" className="font-semibold">
                        Sobre-turnos
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                      <SimpleAppointmentList
                        appointments={overturnsToday}
                        title=""
                        showCreateButton
                        onCreateClick={() => setOpenOverturnDialog(true)}
                        buttonLabel="NUEVO SOBRETURNO"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog de sobreturno */}
      <CreateOverturnDialog
        open={openOverturnDialog}
        onClose={() => setOpenOverturnDialog(false)}
        onCreate={handleCreateOverturn}
      />
    </PageTransition>
  );
};

export default Dashboard;
