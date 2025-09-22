import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  IconButton, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  MenuItem,
  Drawer,
  Tooltip,
  Pagination,
  Switch,
  FormControlLabel,
  Avatar,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  ViewList as ViewListIcon,
  GridView as GridViewIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { format } from 'date-fns';
import type { ChangeEvent } from 'react';
import type { Appointment, AppointmentStatus, SocialWork } from '../types/appointment';
import { appointmentService, getAvailableTimes } from '../services/appointmentService';

const ITEMS_PER_PAGE = 6;

const initialFormState = {
  clientName: '',
  date: '',
  time: '',
  status: 'pending' as AppointmentStatus,
  socialWork: 'CONSULTA PARTICULAR' as SocialWork,
  phone: '',
  email: '',
  description: '',
  attended: false,
  isSobreturno: false
};

interface TimeSlot {
  displayTime: string;
  time: string;
  period: 'morning' | 'afternoon';
}

export interface AppointmentListHandle {
  openCreateDialog: () => void;
}

const AppointmentList = forwardRef<AppointmentListHandle, { showHistory?: boolean; title?: string }>(
  ({ showHistory = false, title = showHistory ? 'Historial de Turnos' : 'Próximos Turnos' }, ref) => {
    // Permite abrir el diálogo de nueva cita desde el exterior
    useImperativeHandle(ref, () => ({
      openCreateDialog: () => {
        setFormData(initialFormState);
        setEditingAppointment(null);
        setOpenDialog(true);
      }
    }));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isExtraSmall = useMediaQuery('(max-width:500px)');

  // Estados
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [availableSlots, setAvailableSlots] = useState<{
    morning: TimeSlot[];
    afternoon: TimeSlot[];
    all: TimeSlot[];
  }>({
    morning: [],
    afternoon: [],
    all: []
  });

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Manejador para realizar la búsqueda con todos los filtros
  const handleSearch = () => {
    setPage(1); // Resetear a la primera página
  };

  // Manejadores de eventos para filtros
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };
  const handleDateFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDateFilter(event.target.value);
    setPage(1);
  };

  const handleViewModeChange = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  // Filtrar y ordenar las citas
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(appointment => {
        const matchesSearch = appointment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            appointment.phone.includes(searchQuery);
        const matchesDate = !dateFilter || appointment.date === dateFilter;
        
        if (showHistory) {
          // Para historial, mostrar todas las citas pasadas
          return matchesSearch && matchesDate;
        } else {
          // Para citas vigentes, excluir las canceladas
          return matchesSearch && matchesDate && appointment.status !== 'cancelled';
        }
      })
      .sort((a, b) => {
        if (showHistory) {
          // Para historial, mostrar primero las más recientes
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else {
          // Para citas vigentes, mostrar primero las más próximas
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
      });
  }, [appointments, searchQuery, dateFilter, showHistory]);

  // Calcular el número total de páginas
  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
  
  // Obtener las citas para la página actual
  const paginatedAppointments = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAppointments, page]);

  // Resto de la funcionalidad existente...
  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getAll({ showHistory });
      setAppointments(data.filter(appointment => {
        if (showHistory) {
          // Para historial, mostrar citas pasadas
          return new Date(appointment.date) < new Date();
        } else {
          // Para citas vigentes, mostrar citas futuras y de hoy
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const appointmentDate = new Date(appointment.date);
          appointmentDate.setHours(0, 0, 0, 0);
          return appointmentDate >= today && appointment.status !== 'cancelled';
        }
      }));
    } catch (err) {
      setError((err as Error).message);
      setSnackbar({
        open: true,
        message: 'Error al cargar las citas',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [showHistory]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editingAppointment) {
        await appointmentService.update(editingAppointment._id, formData);
        setSnackbar({
          open: true,
          message: 'Cita actualizada correctamente',
          severity: 'success'
        });
      } else {
        // Construir el objeto exactamente como el test manual exitoso
        const dataToSend: any = {
          clientName: formData.clientName,
          date: formData.date,
          time: formData.time,
          socialWork: formData.socialWork,
          phone: formData.phone,
          email: formData.email,
          description: formData.description,
          isSobreturno: !!formData.isSobreturno
        };
        // Eliminar campos vacíos para evitar enviar undefined/null
        Object.keys(dataToSend).forEach(key => {
          if (dataToSend[key] === '' || dataToSend[key] === undefined) {
            delete dataToSend[key];
          }
        });
        console.log('Creando cita (frontend, ajustado):', dataToSend);
        await appointmentService.create(dataToSend);
        setSnackbar({
          open: true,
          message: 'Cita creada correctamente',
          severity: 'success'
        });
      }
      setOpenDialog(false);
      setEditingAppointment(null);
      setFormData(initialFormState);
      await loadAppointments();
    } catch (error: any) {
      let msg = 'Error al crear la cita';
      if (error?.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error?.message) {
        msg = error.message;
      }
      setSnackbar({
        open: true,
        message: msg,
        severity: 'error'
      });
    }
  };

  const handleEditClick = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      clientName: appointment.clientName,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      socialWork: appointment.socialWork,
      phone: appointment.phone,
      email: appointment.email || '',
      description: appointment.description || '',
      attended: appointment.attended || false,
      isSobreturno: appointment.isSobreturno || false
    });
    setOpenDialog(true);
  };

  const handleDeleteClick = (appointmentId: string) => {
    setDeleteConfirmOpen(true);
    setEditingAppointment(appointments.find(a => a._id === appointmentId) || null);
  };

  const handleDelete = async () => {
    if (!editingAppointment) return;

    try {
      if (editingAppointment.isSobreturno) {
        // Eliminar sobreturno
        await sobreturnoService.deleteSobreturno(editingAppointment._id);
        setSnackbar({
          open: true,
          message: 'Sobreturno eliminado correctamente',
          severity: 'success'
        });
      } else {
        // Eliminar cita normal
        await appointmentService.delete(editingAppointment._id);
        setSnackbar({
          open: true,
          message: 'Cita eliminada correctamente',
          severity: 'success'
        });
      }
      await loadAppointments();
    } catch {
      setSnackbar({
        open: true,
        message: 'Error al eliminar',
        severity: 'error'
      });
    } finally {
      setDeleteConfirmOpen(false);
      setEditingAppointment(null);
    }
  };

  const handleAppointmentClick = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDrawerOpen(true);
  }, []);

  const handleAttendedChange = async (appointmentId: string, attended: boolean, event?: React.SyntheticEvent) => {
    if (event) {
      event.stopPropagation();
    }

    try {
      const updateData = {
        attended,
        status: attended ? 'confirmed' as AppointmentStatus : 'pending' as AppointmentStatus
      };

      await appointmentService.update(appointmentId, updateData);
      
      setAppointments(prev => prev.map(app => 
        app._id === appointmentId ? { ...app, ...updateData } : app
      ));

      if (selectedAppointment && selectedAppointment._id === appointmentId) {
        setSelectedAppointment(prev => prev ? { ...prev, ...updateData } : prev);
      }

      setSnackbar({
        open: true,
        message: `Asistencia ${attended ? 'marcada' : 'desmarcada'} correctamente`,
        severity: 'success'
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Error al actualizar el estado de asistencia',
        severity: 'error'
      });
    }
  };

  const handleDescriptionChange = (appointmentId: string, newDescription: string) => {
    const appointment = appointments.find(a => a._id === appointmentId);
    if (!appointment) return;

    setAppointments(prev => prev.map(app => 
      app._id === appointmentId ? { ...app, description: newDescription } : app
    ));

    if (selectedAppointment && selectedAppointment._id === appointmentId) {
      setSelectedAppointment(prev => prev ? { ...prev, description: newDescription } : prev);
    }

    appointmentService.update(appointmentId, { description: newDescription })
      .catch(() => {
        setSnackbar({
          open: true,
          message: 'Error al guardar la descripción',
          severity: 'error'
        });
      });
  };

  const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => (
    <Card
      sx={{
        display: 'flex',
        flexDirection: viewMode === 'grid' ? 'column' : 'row',
        height: viewMode === 'grid' ? 'auto' : { 
          xs: 'auto', 
          sm: '110px',
          md: '120px' 
        },
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3
        },
        cursor: 'pointer',
        // Ajuste suave del padding en diferentes breakpoints
        '& .MuiCardContent-root': {
          p: { 
            xs: 1.5,
            sm: viewMode === 'grid' ? 2 : 1.75,
            md: 2 
          }
        }
      }}
      onClick={() => handleAppointmentClick(appointment)}
    >
      <CardContent sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: viewMode === 'grid' ? 'column' : { 
          xs: 'column', 
          sm: 'row' 
        },
        alignItems: viewMode === 'grid' ? 'flex-start' : { 
          xs: 'flex-start', 
          sm: 'center' 
        },
        gap: { 
          xs: 1, 
          sm: viewMode === 'grid' ? 1.5 : 2,
          md: 2 
        },
        p: { 
          xs: 1.5,
          sm: viewMode === 'grid' ? 2 : 1.75,
          md: 2 
        }
      }}>
        <Avatar 
          sx={{ 
            width: viewMode === 'grid' ? 60 : { xs: 50, sm: 40 },
            height: viewMode === 'grid' ? 60 : { xs: 50, sm: 40 },
            bgcolor: appointment.attended ? 'success.main' : 'primary.main',
            fontSize: viewMode === 'grid' ? '1.5rem' : { xs: '1.2rem', sm: '1rem' }
          }}
        >
          {appointment.clientName.split(' ').map(name => name[0]).join('').toUpperCase()}
        </Avatar>

        <Box sx={{ 
          flex: viewMode === 'grid' ? 1 : { xs: 1, sm: 0.3 },
          minWidth: viewMode === 'grid' ? 'auto' : { 
            xs: 'auto', 
            sm: '180px',
            md: '200px' 
          }
        }}>
          <Typography 
            variant={viewMode === 'grid' ? 'h6' : 'subtitle1'} 
            component="div" 
            noWrap
            sx={{
              fontSize: {
                xs: viewMode === 'grid' ? '1.1rem' : '0.95rem',
                sm: viewMode === 'grid' ? '1.15rem' : '1rem',
                md: viewMode === 'grid' ? '1.25rem' : '1.1rem'
              },
              fontWeight: {
                xs: 500,
                sm: 600
              },
              mb: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {appointment.clientName}
            {appointment.isSobreturno && (() => {
              // Extraer hora de inicio y fin
              let turno = '';
              let color = '';
              const timeStr = appointment.time;
              // Ejemplo: "10:15-11:00", "19:00-20:00"
              const times = timeStr.split('-');
              if (times.length === 2) {
                const [start, end] = times;
                const [startHour, _startMin] = start.split(':').map(Number);
                const [endHour, _endMin] = end.split(':').map(Number);
                // Mañana: cualquier parte entre 10:00 y 12:00
                if ((startHour >= 10 && startHour < 12) || (endHour >= 10 && endHour < 12)) {
                  turno = 'Turno Mañana';
                  color = '#ff9800';
                }
                // Tarde: cualquier parte entre 17:00 y 20:00
                else if ((startHour >= 17 && startHour < 20) || (endHour >= 17 && endHour < 20)) {
                  turno = 'Turno Tarde';
                  color = '#d32f2f';
                }
              } else if (timeStr) {
                // Si solo hay una hora, por ejemplo "11:00"
                const [hour, _min] = timeStr.split(':').map(Number);
                if (hour >= 10 && hour < 12) {
                  turno = 'Turno Mañana';
                  color = '#ff9800';
                } else if (hour >= 17 && hour < 20) {
                  turno = 'Turno Tarde';
                  color = '#d32f2f';
                }
              }
              return turno ? (
                <>
                  <span style={{margin: '0 6px', color: '#888'}}>|</span>
                  <span style={{ color, fontWeight: 600 }}>{turno}</span>
                </>
              ) : null;
            })()}
          </Typography>
          <Typography 
            color="text.secondary" 
            variant={viewMode === 'grid' ? 'body1' : 'body2'}
            sx={{ 
              fontSize: { 
                xs: '0.875rem', 
                sm: '0.9rem',
                md: '1rem' 
              },
              opacity: 0.9
            }}
          >
            {format(new Date(`${appointment.date}T00:00:00`), 'dd/MM/yyyy')} - {appointment.time}
          </Typography>
        </Box>

        <Box sx={{ 
          flex: viewMode === 'grid' ? 1 : { xs: 1, sm: 0.4 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: viewMode === 'grid' ? 'column' : 'row' },
          alignItems: viewMode === 'grid' ? 'flex-start' : { xs: 'flex-start', sm: 'center' },
          gap: { xs: 1, sm: 2 },
          ml: viewMode === 'grid' ? 0 : { xs: 0, sm: 'auto' }
        }}>
          <FormControlLabel
            control={
              <Switch
                checked={appointment.attended}
                onChange={(e) => {
                  e.stopPropagation();
                  handleAttendedChange(appointment._id, e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
                color="success"
                size={viewMode === 'grid' ? 'medium' : 'small'}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'success.main',
                    '&:hover': {
                      backgroundColor: 'success.light'
                    }
                  }
                }}
              />
            }
            label="Asistió"
            sx={{
              mr: 0,
              '& .MuiFormControlLabel-label': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
          />
          <Chip
            label={appointment.status === 'pending' ? 'Pendiente' : 'Confirmada'}
            color={appointment.status === 'pending' ? 'warning' : 'success'}
            size={viewMode === 'grid' ? 'medium' : 'small'}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              height: { xs: 24, sm: 32 }
            }}
          />
          {appointment.isSobreturno && (
            <>
              <Chip
                label="Sobreturno"
                color="info"
                size={viewMode === 'grid' ? 'medium' : 'small'}
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  height: { xs: 24, sm: 32 }
                }}
              />
              <Chip
                label={appointment.time === '11:00-12:00' || appointment.time === '11:00' ? 'Turno Mañana' : 'Turno Tarde'}
                color="error"
                size={viewMode === 'grid' ? 'medium' : 'small'}
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  height: { xs: 24, sm: 32 },
                  ml: 1
                }}
              />
            </>
          )}
      
        </Box>
      </CardContent>
    </Card>
  );

  const handleDateChange = async (date: string) => {
    if (date) {
      try {
        const response = await getAvailableTimes(date);
        if (response.success) {
          setAvailableSlots({
            morning: response.data.morning,
            afternoon: response.data.afternoon,
            all: [...response.data.morning, ...response.data.afternoon]
          });
        } else {
          setAvailableSlots({ morning: [], afternoon: [], all: [] });
        }
      } catch (error) {
        console.error('Error al obtener horarios:', error);
        setAvailableSlots({ morning: [], afternoon: [], all: [] });
      }
    } else {
      setAvailableSlots({ morning: [], afternoon: [], all: [] });
    }
  };

  // Generar todos los horarios posibles para sobreturnos (08:00 a 22:00 cada 15 min)
  const generateAllTimeSlots = () => {
    const slots: TimeSlot[] = [];
    let hour = 8;
    let minute = 0;
    while (hour < 22 || (hour === 22 && minute === 0)) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({ time, displayTime: time, period: hour < 12 ? 'morning' : 'afternoon' });
      minute += 15;
      if (minute === 60) {
        minute = 0;
        hour++;
      }
    }
    return slots;
  };

  useEffect(() => {
    if (!formData.date) {
      setAvailableSlots({ morning: [], afternoon: [], all: [] });
      return;
    }
    if (formData.isSobreturno) {
      setAvailableSlots({
        morning: [],
        afternoon: [],
        all: generateAllTimeSlots()
      });
    } else {
      handleDateChange(formData.date);
    }
  }, [formData.date, formData.isSobreturno]);

  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Error al cargar las citas: {error}
        </Alert>
      </Box>
    );
  }

  if (appointments.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography>
          {showHistory 
            ? 'No hay turnos en el historial de la última semana' 
            : 'No hay turnos próximos programados'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Controles de filtrado */}
      <Box sx={{ 
        mb: { xs: 2, sm: 2.5, md: 3 }, 
        display: 'flex', 
        flexDirection: { 
          xs: 'column', 
          sm: 'row' 
        },
        gap: { 
          xs: 1.5, 
          sm: 2 
        }, 
        alignItems: { 
          xs: 'stretch', 
          sm: 'center' 
        }
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { 
            xs: 'column', 
            sm: 'row' 
          },
          gap: { 
            xs: 1.5, 
            sm: 2 
          }, 
          flex: { 
            xs: 1, 
            sm: 0.7,
            md: 0.8 
          }
        }}>
          <TextField
            size="small"
            label="Buscar por nombre o teléfono"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder='Juan Pérez '
            InputProps={{
              startAdornment: (
                <InputAdornment position="end">
                  {/* <SearchIcon /> */}
                </InputAdornment>
              ),
            }}
            sx={{ 
              minWidth: { 
                xs: '100%', 
                sm: '250px',
                md: '300px' 
              },
              '& .MuiInputBase-root': {
                borderRadius: 1,
                bgcolor: 'background.paper'
              }
            }}
          />
          <TextField
            size="small"
            type="date"
            label="Filtrar por fecha"
            value={dateFilter}
            onChange={handleDateFilterChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                
                </InputAdornment>
              )
            }}
            sx={{ 
              minWidth: { 
                xs: '100%', 
                sm: '180px',
                md: '200px' 
              },
              '& .MuiInputBase-root': {
                borderRadius: 1,
                bgcolor: 'background.paper'
              }
            }}
            InputLabelProps={{ shrink: true }}
          />
          
          <Button
            variant="contained"
            onClick={handleSearch}
            startIcon={<SearchIcon />}
            sx={{
              borderRadius: 1,
              minWidth: { xs: '100%', sm: 'auto' },
              py: { xs: 1, sm: 'auto' }
            }}
          >
            Buscar
          </Button>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          justifyContent: { xs: 'flex-end', sm: 'auto' },
          mt: { xs: 1, sm: 0 }
        }}>
          <Tooltip title={viewMode === 'grid' ? 'Ver como lista' : 'Ver como grid'}>
            <IconButton 
              onClick={handleViewModeChange} 
              color="primary"
              sx={{
                borderRadius: 1,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'common.white'
                }
              }}
            >
              {viewMode === 'grid' ? <ViewListIcon /> : <GridViewIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Nueva cita">
            <IconButton
              onClick={() => {
                setFormData(initialFormState);
                setEditingAppointment(null);
                setOpenDialog(true);
              }}
              color="primary"
              sx={{
                borderRadius: 1,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'common.white'
                }
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Grid de citas con margen inferior ajustado */}
      <Box sx={{
        display: viewMode === 'grid' ? 'grid' : 'flex',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(auto-fill, minmax(280px, 1fr))',
          md: 'repeat(auto-fill, minmax(320px, 1fr))'
        },
        flexDirection: 'column',
        gap: { 
          xs: 1, 
          sm: 1.5,
          md: 2 
        },
        mb: { xs: 8, sm: 3 } // Margen para la paginación fija en móvil
      }}>
        {paginatedAppointments.map((appointment: Appointment) => (
          <AppointmentCard 
            key={appointment._id}
            appointment={appointment}
          />
        ))}
      </Box>

      {/* Paginación responsiva */}
      {totalPages > 1 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          position: { 
            xs: 'fixed', 
            sm: 'static' 
          },
          bottom: { 
            xs: 0, 
            sm: 'auto' 
          },
          left: { 
            xs: 0, 
            sm: 'auto' 
          },
          right: { 
            xs: 0, 
            sm: 'auto' 
          },
          bgcolor: (theme) => theme.palette.background.paper,
          borderTop: { 
            xs: 1, 
            sm: 0 
          },
          borderColor: 'divider',
          py: { 
            xs: 1, 
            sm: 1.5,
            md: 2 
          },
          px: { 
            xs: 2,
            sm: 2,
            md: 3 
          },
          mt: { 
            xs: 0, 
            sm: 2,
            md: 3 
          },
          zIndex: (theme) => theme.zIndex.appBar - 1,
          width: { 
            xs: '100%', 
            sm: 'auto' 
          },
          boxShadow: { 
            xs: '0px -2px 4px rgba(0, 0, 0, 0.1)', 
            sm: 'none' 
          },
          transition: 'all 0.3s ease'
        }}>
          {isExtraSmall ? (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              width: '100%',
              justifyContent: 'space-between'
            }}>
              <IconButton 
                onClick={() => setPage(page > 1 ? page - 1 : page)}
                disabled={page === 1}
                size="small"
                sx={{
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5
                  }
                }}
              >
                <NavigateBeforeIcon />
              </IconButton>
              <Typography 
                variant="body2" 
                sx={{ 
                  mx: 2,
                  fontWeight: 'medium'
                }}
              >
                Página {page} de {totalPages}
              </Typography>
              <IconButton 
                onClick={() => setPage(page < totalPages ? page + 1 : page)}
                disabled={page === totalPages}
                size="small"
                sx={{
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5
                  }
                }}
              >
                <NavigateNextIcon />
              </IconButton>
            </Box>
          ) : (            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
              size={isMobile ? 'small' : 'medium'}
              siblingCount={isMobile ? 0 : 1}
              boundaryCount={isMobile ? 1 : 2}
              sx={{
                '& .MuiPagination-ul': {
                  gap: { 
                    xs: 0.5, 
                    sm: 0.75,
                    md: 1 
                  }
                },
                '& .MuiPaginationItem-root': {
                  minWidth: { 
                    xs: 28, 
                    sm: 32,
                    md: 36 
                  },
                  height: { 
                    xs: 28, 
                    sm: 32,
                    md: 36 
                  },
                  fontSize: { 
                    xs: '0.8125rem', 
                    sm: '0.875rem',
                    md: '1rem' 
                  }
                }
              }}
            />
          )}
        </Box>
      )}

      {/* Drawer y Diálogos */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { 
              xs: '100%', 
              sm: '400px',
              md: '450px' 
            },
            borderRadius: { 
              xs: '16px 16px 0 0', 
              sm: 0 
            },
            maxHeight: {
              xs: '90vh',
              sm: '100vh'
            },
            transition: 'width 0.3s ease-in-out'
          }
        }}
      >
        {selectedAppointment && (
          <Box sx={{ 
            p: { 
              xs: 2, 
              sm: 2.5,
              md: 3 
            } 
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: { 
                xs: 2, 
                sm: 2.5,
                md: 3 
              } 
            }}>
              <Typography 
                variant="h6"
                sx={{
                  fontSize: {
                    xs: '1.1rem',
                    sm: '1.2rem',
                    md: '1.25rem'
                  }
                }}
              >
                Detalles de la cita
              </Typography>
              <IconButton 
                onClick={() => setDrawerOpen(false)}
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3 
            }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Paciente
                </Typography>
                <Typography variant="h5">
                  {selectedAppointment.clientName}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Fecha y hora
                </Typography>
                <Typography>
                  {format(new Date(`${selectedAppointment.date}T00:00:00`), 'dd/MM/yyyy')} - {selectedAppointment.time}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Contacto
                </Typography>
                <Typography>{selectedAppointment.phone}</Typography>
                {selectedAppointment.email && (
                  <Typography>{selectedAppointment.email}</Typography>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Estado
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedAppointment.attended}
                      onChange={(e) => handleAttendedChange(selectedAppointment._id, e.target.checked)}
                      color="success"
                    />
                  }
                  label="Asistió"
                />
                <Chip
                  label={selectedAppointment.status === 'pending' ? 'Pendiente' : 'Confirmada'}
                  color={selectedAppointment.status === 'pending' ? 'warning' : 'success'}
                  sx={{ ml: 1 }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Notas
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  value={selectedAppointment.description || ''}
                  onChange={(e) => handleDescriptionChange(selectedAppointment._id, e.target.value)}
                  placeholder="Agregar notas..."
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditClick(selectedAppointment)}
                  fullWidth
                >
                  Editar
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteClick(selectedAppointment._id)}
                  fullWidth
                >
                  Eliminar
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            width: { 
              xs: '90%', 
              sm: '400px',
              md: '450px' 
            },
            m: { 
              xs: 2, 
              sm: 3,
              md: 4 
            },
            borderRadius: {
              xs: 2,
              sm: 1
            }
          }
        }}
      >
        <DialogTitle sx={{
          fontSize: {
            xs: '1.1rem',
            sm: '1.25rem'
          },
          py: {
            xs: 1.5,
            sm: 2
          }
        }}>
          ¿Eliminar cita?
        </DialogTitle>
        <DialogContent sx={{
          py: {
            xs: 1,
            sm: 1.5
          }
        }}>
          <Typography sx={{
            fontSize: {
              xs: '0.925rem',
              sm: '1rem'
            }
          }}>
            Esta acción no se puede deshacer. ¿Está seguro que desea eliminar esta cita?
          </Typography>
        </DialogContent>
        <DialogActions sx={{
          px: {
            xs: 2,
            sm: 3
          },
          py: {
            xs: 1.5,
            sm: 2
          }
        }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              px: { xs: 2, sm: 3 },
              py: { xs: 0.75, sm: 1 }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              px: { xs: 2, sm: 3 },
              py: { xs: 0.75, sm: 1 }
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingAppointment(null);
          setFormData(initialFormState);
        }}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            width: { xs: '95%', sm: '80%' },
            m: { xs: 2, sm: 4 }
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingAppointment ? 'Editar cita' : 'Nueva cita'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ 
              mt: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2 
            }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isSobreturno}
                    onChange={e => setFormData(prev => ({ ...prev, isSobreturno: e.target.checked }))}
                    name="isSobreturno"
                    color="primary"
                  />
                }
                label="Sobreturno (permite cualquier horario entre 08:00 y 22:00)"
                sx={{ mb: 1 }}
              />
              <TextField
                label="Nombre del paciente"
                name="clientName"
                value={formData.clientName}
                onChange={handleFormChange}
                fullWidth
                required
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 1
                  }
                }}
              />
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <TextField
                  label="Fecha"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    handleFormChange(e);
                    handleDateChange(e.target.value);
                  }}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputBase-root': {
                      borderRadius: 1
                    }
                  }}
                />

                {/* Dropdown para seleccionar hora */}
                <FormControl fullWidth required sx={{ minWidth: 120 }}>
                  <InputLabel id="select-time-label">Hora</InputLabel>
                  <Select
                    labelId="select-time-label"
                    id="select-time"
                    name="time"
                    value={formData.time}
                    label="Hora"
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  >
                    {formData.isSobreturno
                      ? availableSlots.all.map((slot) => (
                          <MenuItem key={slot.time} value={slot.time}>{slot.displayTime}</MenuItem>
                        ))
                      : availableSlots.all.map((slot) => (
                          <MenuItem key={slot.time} value={slot.time}>{slot.displayTime} ({slot.period === 'morning' ? 'Mañana' : 'Tarde'})</MenuItem>
                        ))}
                  </Select>
                </FormControl>
              </Box>

              <TextField
                select
                label="Obra social"
                name="socialWork"
                value={formData.socialWork}
                onChange={handleFormChange}
                fullWidth
                required
              >
                <MenuItem value="INSSSEP">INSSSEP</MenuItem>
                <MenuItem value="Swiss Medical">Swiss Medical</MenuItem>
                <MenuItem value="OSDE">OSDE</MenuItem>
                <MenuItem value="Galeno">Galeno</MenuItem>
                <MenuItem value="CONSULTA PARTICULAR">CONSULTA PARTICULAR</MenuItem>
              </TextField>

              {editingAppointment && (
                <TextField
                  select
                  label="Estado"
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  fullWidth
                  required
                >
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="confirmed">Confirmada</MenuItem>
                  <MenuItem value="cancelled">Cancelada</MenuItem>
                </TextField>
              )}

              <TextField
                label="Teléfono"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                fullWidth
                required
              />

              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                fullWidth
              />

              <TextField
                label="Notas"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={4}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenDialog(false);
                setEditingAppointment(null);
                setFormData(initialFormState);
              }}
              sx={{
                borderRadius: 1,
                textTransform: 'none'
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                borderRadius: 1,
                textTransform: 'none'
              }}
            >
              {editingAppointment ? 'Guardar cambios' : 'Crear cita'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 1
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default AppointmentList;
