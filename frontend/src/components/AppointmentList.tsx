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
  Snackbar,
  Alert,
  TextField,
  MenuItem,
  Paper,
  Drawer,
  Tooltip,
  Pagination,
  Grid as MuiGrid,
  Switch,
  FormControlLabel,
  type ChipProps,
  Avatar
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  ViewList as ViewListIcon,
  GridView as GridViewIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  AccountCircle as AccountCircleIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, isToday } from 'date-fns';
import type { ChangeEvent, MouseEvent } from 'react';
import type { Appointment, AppointmentStatus, SocialWork } from '../types/appointment';
import { appointmentService } from '../services/appointmentService';

import type { BaseAppointment } from '../types/appointment';
type FormData = BaseAppointment;

const initialFormState: FormData = {
  clientName: '',
  date: '',
  time: '',
  status: 'pending',
  socialWork: 'CONSULTA PARTICULAR',
  phone: '',
  email: '',
  description: '',
  attended: false
};

const socialWorkOptions: SocialWork[] = [
  'INSSSEP',
  'Swiss Medical',
  'OSDE',
  'Galeno',
  'CONSULTA PARTICULAR'
];

const statusOptions: { value: AppointmentStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'cancelled', label: 'Cancelada' }
];

const getStatusColor = (status: AppointmentStatus): ChipProps['color'] => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: AppointmentStatus) => {
  switch (status) {
    case 'pending': return 'Pendiente';
    case 'confirmed': return 'Confirmada';
    case 'cancelled': return 'Cancelada';
    default: return status;
  }
};

const ITEMS_PER_PAGE = 6;

const AppointmentList = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [debouncedDescription, setDebouncedDescription] = useState<NodeJS.Timeout | null>(null);

  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);

  // Función para ordenar las citas
  const getSortedAppointments = useCallback((apps: Appointment[]) => {
    return [...apps].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return sortDirection === 'asc' 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });
  }, [sortDirection]);

  // Manejar el cambio de dirección del ordenamiento
  const handleSortDirectionChange = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  // Ordenar las citas
  const sortedAppointments = useMemo(() => {
    return getSortedAppointments(appointments);
  }, [appointments, getSortedAppointments]);

  // Calcular las citas paginadas a partir de las ordenadas
  const paginatedAppointments = useMemo(() => {
    return sortedAppointments.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    );
  }, [sortedAppointments, page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const loadAppointments = useCallback(async () => {
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al cargar las citas',
        severity: 'error'
      });
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      description: appointment.description || ''
    });
    setOpenDialog(true);
  };

  const handleDeleteClick = (appointmentId: string) => {
    setAppointmentToDelete(appointmentId);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      await appointmentService.delete(appointmentToDelete);
      setSnackbar({
        open: true,
        message: 'Cita eliminada correctamente',
        severity: 'success'
      });
      await loadAppointments();
    } catch (error) {
      console.error('Error al eliminar la cita:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al eliminar la cita',
        severity: 'error'
      });
    } finally {
      setDeleteConfirmOpen(false);
      setAppointmentToDelete(null);
    }
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
        await appointmentService.create(formData);
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
    } catch {
      setSnackbar({
        open: true,
        message: editingAppointment 
          ? 'Error al actualizar la cita'
          : 'Error al crear la cita',
        severity: 'error'
      });
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDrawerOpen(true);
  };  const handleAttendedChange = async (appointmentId: string, attended: boolean, event?: React.SyntheticEvent) => {
    try {
      if (event) {
        event.stopPropagation();
      }

      const updateData = {
        attended,
        status: attended ? 'confirmed' as AppointmentStatus : 'pending' as AppointmentStatus
      };

      // Primero intentar actualizar en el backend
      await appointmentService.update(appointmentId, updateData);

      // Solo si la actualización fue exitosa, actualizar el estado local
      if (selectedAppointment && selectedAppointment._id === appointmentId) {
        setSelectedAppointment(prev => ({
          ...prev!,
          ...updateData
        }));
      }

      setAppointments(prev => prev.map(app => 
        app._id === appointmentId ? { ...app, ...updateData } : app
      ));
      
      setSnackbar({
        open: true,
        message: `Asistencia ${attended ? 'marcada' : 'desmarcada'} correctamente`,
        severity: 'success'
      });
    } catch (error: unknown) {
      console.error('Error al actualizar asistencia:', error);
      
      // Revertir los cambios locales si hay error
      if (selectedAppointment && selectedAppointment._id === appointmentId) {
        setSelectedAppointment(prev => ({
          ...prev!,
          attended: !attended,
          status: !attended ? 'confirmed' as AppointmentStatus : 'pending' as AppointmentStatus
        }));
      }
      
      setAppointments(prev => prev.map(app => 
        app._id === appointmentId 
          ? { 
              ...app, 
              attended: !attended,
              status: !attended ? 'confirmed' as AppointmentStatus : 'pending' as AppointmentStatus
            } 
          : app
      ));

      setSnackbar({
        open: true,
        message: 'Error al actualizar el estado de asistencia',
        severity: 'error'
      });
    }
  };

  const handleDescriptionChange = (appointmentId: string, newDescription: string) => {
    // Primero actualizar el estado local para una respuesta inmediata
    if (selectedAppointment && selectedAppointment._id === appointmentId) {
      setSelectedAppointment(prev => ({
        ...prev!,
        description: newDescription
      }));
    }

    // Actualizar en el listado
    setAppointments(prev => prev.map(app => 
      app._id === appointmentId 
        ? { ...app, description: newDescription } 
        : app
    ));

    // Cancelar el debounce anterior si existe
    if (debouncedDescription) {
      clearTimeout(debouncedDescription);
    }

    // Crear un nuevo debounce
    const timeoutId = setTimeout(async () => {
      try {
        await appointmentService.update(appointmentId, { description: newDescription });
      } catch (error) {
        console.error('Error al actualizar la descripción:', error);
        setSnackbar({
          open: true,
          message: 'Error al guardar la descripción',
          severity: 'error'
        });
      }
    }, 1000); // Esperar 1 segundo antes de hacer la actualización

    setDebouncedDescription(timeoutId);
  };

  // Calcular estadísticas
  const todaysAppointments = appointments.filter(app => 
    isToday(new Date(app.date))
  );
  const pendingAppointments = appointments.filter(app => 
    app.status === 'pending'
  );
  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card 
      sx={{ 
        marginBottom: 2, 
        cursor: 'pointer',
        '&:hover': { boxShadow: 6 },
        display: 'flex',
        flexDirection: viewMode === 'grid' ? 'column' : 'row',
        height: viewMode === 'grid' ? 'auto' : '100px'
      }}
      onClick={() => handleAppointmentClick(appointment)}
    >      <CardContent sx={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: viewMode === 'grid' ? 'column' : 'row',
        alignItems: viewMode === 'grid' ? 'flex-start' : 'center',
        gap: 2,
        py: viewMode === 'grid' ? 2 : 1,
        "&:last-child": { pb: viewMode === 'grid' ? 2 : 1 }
      }}>
        <Avatar 
          sx={{ 
            width: viewMode === 'grid' ? 60 : 40, 
            height: viewMode === 'grid' ? 60 : 40,
            bgcolor: appointment.attended ? 'success.main' : 'primary.main'
          }}
        >
          {appointment.clientName.split(' ').map(name => name[0]).join('').toUpperCase()}
        </Avatar>
        <Box sx={{ 
          flex: viewMode === 'grid' ? 1 : 0.3,
          minWidth: viewMode === 'grid' ? 'auto' : '200px'
        }}>
          <Typography variant="h6" component="div" noWrap>
            {appointment.clientName}
          </Typography>
          <Typography color="text.secondary" variant={viewMode === 'grid' ? 'body1' : 'body2'}>
            {format(new Date(`${appointment.date}T00:00:00`), 'dd/MM/yyyy')} - {appointment.time}
          </Typography>
        </Box>

        <Box sx={{ 
          flex: viewMode === 'grid' ? 1 : 0.3,
          display: 'flex',
          flexDirection: viewMode === 'grid' ? 'column' : 'row',
          alignItems: viewMode === 'grid' ? 'flex-start' : 'center',
          gap: 1
        }}>
          <Typography color="text.secondary" variant={viewMode === 'grid' ? 'body1' : 'body2'}>
            Obra Social: {appointment.socialWork}
          </Typography>
        </Box>

        <Box sx={{ 
          flex: viewMode === 'grid' ? 1 : 0.4,
          display: 'flex',
          justifyContent: viewMode === 'grid' ? 'flex-start' : 'flex-end',
          alignItems: 'center',
          gap: 2,
          ml: viewMode === 'grid' ? 0 : 'auto'
        }}>
          <FormControlLabel
            control={              <Switch
                checked={appointment.attended || false}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  e.stopPropagation();
                  handleAttendedChange(appointment._id, e.target.checked);
                }}
                onClick={(e: MouseEvent) => e.stopPropagation()}
                color="success"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'success.main',
                    '&:hover': {
                      backgroundColor: 'success.light'
                    },
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: 'success.main',
                  },
                }}
              />
            }
            label="Asistió"
          />
          <Chip
            label={appointment.status}
            color={getStatusColor(appointment.status)}
            size={viewMode === 'grid' ? 'medium' : 'small'}
          />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={viewMode === 'grid' ? 'Vista de Lista' : 'Vista de Cuadrícula'}>
              <IconButton
                color="primary"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <ViewListIcon /> : <GridViewIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={`Ordenar ${sortDirection === 'asc' ? 'Descendente' : 'Ascendente'}`}>
              <IconButton
                color="primary"
                onClick={handleSortDirectionChange}
              >
                {sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>          <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 2 
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {todaysAppointments.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Citas Hoy
                </Typography>
              </Box>
              <Tooltip title={`Ordenar por fecha ${sortDirection === 'asc' ? 'descendente' : 'ascendente'}`}>
                <IconButton onClick={handleSortDirectionChange} color="primary">
                  {sortDirection === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main">
                {pendingAppointments.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pendientes
              </Typography>
            </Box>
            <Tooltip title="Nueva Cita">
              <IconButton
                color="primary"
                onClick={() => {
                  setEditingAppointment(null);
                  setFormData(initialFormState);
                  setOpenDialog(true);
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
          <Box sx={{
          display: viewMode === 'grid' ? 'grid' : 'flex',
          flexDirection: 'column',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr',
          gap: 2,
          overflow: 'auto',
          flex: 1,
          width: '100%',
          height: 'calc(100vh - 250px)'
        }}>
          {paginatedAppointments.map(appointment => (
            <AppointmentCard 
              key={appointment._id} 
              appointment={appointment} 
            />
          ))}
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          gap: 1,
          pt: 2,
          borderTop: 1,
          borderColor: 'divider'
        }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {Math.min(ITEMS_PER_PAGE * page, appointments.length)} de {appointments.length} citas
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="medium"
            showFirstButton
            showLastButton
          />
        </Box>
      </Box>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        variant="temporary"
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: '400px' },
            boxSizing: 'border-box',
          }
        }}
      >
        {selectedAppointment && (
          <Box sx={{ 
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3
            }}>
              <Typography variant="h6">
                Detalles de la Cita
              </Typography>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
              <Paper sx={{ 
                p: 3,
                flex: 1,
                borderRadius: 2,
                overflow: 'auto'
            }}>
                <Typography variant="subtitle2" gutterBottom>
                  Información del Paciente
                </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 3 
              }}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64,
                    bgcolor: selectedAppointment.attended ? 'success.main' : 'primary.main'
                  }}
                >
                  {selectedAppointment.clientName.split(' ').map(name => name[0]).join('').toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 0.5 }}>
                    {selectedAppointment.clientName}
                  </Typography>
                  <Chip
                    label={getStatusLabel(selectedAppointment.status)}
                    color={getStatusColor(selectedAppointment.status)}
                    sx={{ px: 2 }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Fecha y Hora
                </Typography>
                <Typography>
                  {format(new Date(`${selectedAppointment.date}T00:00:00`), 'dd/MM/yyyy')} - {selectedAppointment.time}
                </Typography>
                        <Typography style={
                          { 
                            marginTop: 8,
                            fontWeight: 'semibold'
                          }
                        }variant="body2" color="text.secondary">
                          Obra Social: {selectedAppointment.socialWork}
                        </Typography>
              </Box>              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography>+{selectedAppointment.phone}</Typography>
                  </Box>
                  {selectedAppointment.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography>{selectedAppointment.email}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Estado de la Cita
                </Typography>                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedAppointment.attended || false}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleAttendedChange(selectedAppointment._id, e.target.checked, e);
                        }}
                        color="success"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: 'success.main',
                            '&:hover': {
                              backgroundColor: 'success.light'
                            },
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'success.main',
                          },
                        }}
                      />
                    }
                    label={selectedAppointment.attended ? "Asistió" : "No asistió"}
                  />
                  <Chip
                    label={getStatusLabel(selectedAppointment.status)}
                    color={getStatusColor(selectedAppointment.status)}
                  />
                </Box>
              </Box>              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                  Notas y Observaciones
                </Typography>                <TextField
                  multiline
                  rows={8}
                  fullWidth
                  variant="outlined"
                  value={selectedAppointment.description || ''}
                  onChange={(e) => {
                    const newDescription = e.target.value;
                    handleDescriptionChange(selectedAppointment._id, newDescription);
                  }}
                  placeholder="Agregar notas o comentarios sobre la consulta..."
                  sx={{ 
                    mt: 1,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                    },
                    '& .MuiInputBase-input': {
                      lineHeight: 1.6,
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Los cambios se guardan automáticamente al escribir
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}
      </Drawer>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>¿Eliminar cita?</DialogTitle>
        <DialogContent>
          <Typography>
            Esta acción no se puede deshacer. ¿Está seguro que desea eliminar esta cita?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para crear/editar citas */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingAppointment(null);
          setFormData(initialFormState);
        }}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingAppointment ? 'Editar Cita' : 'Nueva Cita'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Nombre del Paciente"
                name="clientName"
                value={formData.clientName}
                onChange={handleFormChange}
                required
                fullWidth
                size="small"
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Fecha"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  label="Hora"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleFormChange}
                  required
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <TextField
                select
                label="Obra Social"
                name="socialWork"
                value={formData.socialWork}
                onChange={handleFormChange}
                required
                fullWidth
                size="small"
              >
                {socialWorkOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              {editingAppointment && (
                <TextField
                  select
                  label="Estado"
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  required
                  fullWidth
                  size="small"
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              <TextField
                label="Teléfono"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                required
                fullWidth
                size="small"
              />

              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                fullWidth
                size="small"
              />

              <TextField
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={4}
                fullWidth
                size="small"
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
            >
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {editingAppointment ? 'Guardar Cambios' : 'Crear Cita'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AppointmentList;
