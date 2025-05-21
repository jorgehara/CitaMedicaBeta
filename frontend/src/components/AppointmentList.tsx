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
  Divider,
  Tooltip,
  Pagination
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
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '../services/appointmentService';
import type { Appointment, AppointmentStatus, SocialWork } from '../types/appointment';

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
  description: ''
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

const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case 'confirmed': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
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

const ITEMS_PER_PAGE = 15;

const AppointmentList = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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

  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);
  const paginatedAppointments = appointments.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

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
      // Solo actualizamos la UI si la eliminación fue exitosa
      setSnackbar({
        open: true,
        message: 'Cita eliminada correctamente',
        severity: 'success'
      });
      await loadAppointments(); // Recargar la lista de citas
    } catch (error) {
      console.error('Error al eliminar la cita:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Error al eliminar la cita',
        severity: 'error'
      });
      await loadAppointments(); // Recargar para asegurar consistencia con el backend
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
  };

  const renderAppointmentCard = (appointment: Appointment) => (    <Card
      key={appointment._id} 
      sx={{ 
        position: 'relative',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        },
        display: 'flex',
        flexDirection: {
          xs: 'column',
          sm: viewMode === 'list' ? 'row' : 'column'
        },
        mb: { xs: 1, sm: 2 },
        height: {
          xs: 'auto',
          sm: viewMode === 'list' ? '100px' : '250px'
        },
        flex: 1,
        width: '100%',
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
      onClick={() => handleAppointmentClick(appointment)}
    >      <CardContent sx={{ 
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: {
          xs: 'column',
          sm: viewMode === 'list' ? 'row' : 'column'
        },
        alignItems: {
          xs: 'stretch',
          sm: viewMode === 'list' ? 'center' : 'stretch'
        },
        justifyContent: 'space-between',
        gap: { xs: 1, sm: 2 },
        p: { xs: 1.5, sm: 2 },
        '&:last-child': {
          pb: { xs: 1.5, sm: 2 }
        },
        '& > *': { // Esto asegura que los hijos también ocupen el espacio disponible
          width: '100%',
          height: '100%'
        }
      }}>
        <Box sx={{ 
          flex: viewMode === 'list' ? '0 0 200px' : 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'medium', fontSize: viewMode === 'list' ? '1rem' : '1.25rem' }}>
            {appointment.clientName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon sx={{ fontSize: 'small', color: 'primary.main' }} />
            <Typography variant="body2" color="text.secondary">
              {appointment.date} - {appointment.time}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Chip
            label={getStatusLabel(appointment.status)}
            color={getStatusColor(appointment.status)}
            size="small"
            sx={{ minWidth: 90 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
            {appointment.socialWork}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(appointment);
              }}
              color="primary"
              sx={{ 
                '&:hover': { 
                  bgcolor: 'primary.light',
                  '& svg': { color: 'white' }
                }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(appointment._id);
              }}
              color="error"
              sx={{ 
                '&:hover': { 
                  bgcolor: 'error.light',
                  '& svg': { color: 'white' }
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderAppointmentDetails = () => {
    if (!selectedAppointment) return null;

    return (
      <Box sx={{ 
        p: 4,
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
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Detalles del Paciente
          </Typography>
          <IconButton 
            onClick={() => setDrawerOpen(false)}
            sx={{ 
              '&:hover': { 
                bgcolor: 'primary.light',
                color: 'white'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Paper sx={{ 
          p: 3, 
          flex: 1,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1
        }}>
          <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
            {selectedAppointment.clientName}
          </Typography>

          <Box sx={{ my: 3 }}>
            <Chip
              label={getStatusLabel(selectedAppointment.status)}
              color={getStatusColor(selectedAppointment.status)}
              sx={{ 
                px: 2,
                py: 2.5,
                borderRadius: 2,
                fontSize: '1rem'
              }}
            />
          </Box>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 3,
            mt: 4
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1
            }}>
              <AccessTimeIcon color="primary" />
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Fecha y Hora
                </Typography>
                <Typography variant="body1">
                  {selectedAppointment.date} - {selectedAppointment.time}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1
            }}>
              <AssignmentIcon color="primary" />
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Obra Social
                </Typography>
                <Typography variant="body1">
                  {selectedAppointment.socialWork}
                </Typography>
              </Box>
            </Box>

            {selectedAppointment.phone && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1
              }}>
                <PhoneIcon color="primary" />
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Teléfono
                  </Typography>
                  <Typography variant="body1">
                    {selectedAppointment.phone}
                  </Typography>
                </Box>
              </Box>
            )}

            {selectedAppointment.email && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1
              }}>
                <EmailIcon color="primary" />
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {selectedAppointment.email}
                  </Typography>
                </Box>
              </Box>
            )}

            {selectedAppointment.description && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="overline" color="text.secondary" display="block" gutterBottom>
                  Descripción
                </Typography>
                <Paper variant="outlined" sx={{ 
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1
                }}>
                  <Typography variant="body1">
                    {selectedAppointment.description}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      overflow: 'hidden'
    }}>      <Box sx={{ 
        flex: 1, 
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0,
        maxWidth: '1400px',
        width: '100%',
        mx: 'auto'
      }}>
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'space-between',
          width: '100%',
          height: '64px', // Altura fija para el título
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: 2
        }}>
          <Box>
            <Tooltip title={viewMode === 'grid' ? 'Vista de Lista' : 'Vista de Cuadrícula'}>
              <IconButton
                color="primary"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <ViewListIcon /> : <GridViewIcon />}
              </IconButton>
            </Tooltip>
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
        <Box sx={{
          flex: 1,
          display: viewMode === 'grid' ? 'grid' : 'flex',
          flexDirection: 'column',
          width: '1150px',
          overflow: 'auto',
          alignContent: 'start',
          padding: 1,
          minHeight: 0,
          height: '100%',
          bgcolor: 'background.default',
          borderRadius: 1
        }}>
          {paginatedAppointments.map(renderAppointmentCard)}
        </Box>        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          gap: 1,
          mt: 2,
          mb: 2,
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          pt: 2
        }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {Math.min(ITEMS_PER_PAGE * page, appointments.length)} de {appointments.length} citas
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                mx: 0.5
              }
            }}
          />
        </Box>
      </Box>      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        variant="temporary"
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: '450px' },
            maxWidth: '100%',
            boxSizing: 'border-box',
            borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
            bgcolor: 'background.default'
          },
        }}
      >
        {renderAppointmentDetails()}
      </Drawer>

      {/* Formulario de creación/edición */}
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
                label="Descripción"
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
            <Button onClick={() => {
              setOpenDialog(false);
              setEditingAppointment(null);
              setFormData(initialFormState);
            }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {editingAppointment ? 'Guardar Cambios' : 'Crear Cita'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
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

      {/* Snackbar para notificaciones */}
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
