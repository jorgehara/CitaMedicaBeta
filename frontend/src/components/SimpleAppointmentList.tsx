//tarjetitas de citas con todos los detalles
import { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip, IconButton, Button, Menu, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AppointmentDrawer from './AppointmentDrawer';
import * as sobreturnoService from '../services/sobreturnoService';
import { appointmentService } from '../services/appointmentService';
import type { Appointment } from '../types/appointment';
import { useClinicConfig } from '../context/ClinicConfigContext';

interface SimpleAppointmentListProps {
  appointments: Appointment[];
  title: string;
  onCreateClick?: () => void;
  showCreateButton?: boolean;
  buttonLabel?: string;
}

const SimpleAppointmentList = ({ appointments, title, onCreateClick, showCreateButton = false, buttonLabel }: SimpleAppointmentListProps) => {
  const { clinicName } = useClinicConfig();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Actualizar cuando cambien los appointments desde el padre

  // Polling cada 6 minutos para refrescar la lista
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      // Forzar actualización llamando a la función global si existe
      if (window.refreshAppointments) {
        window.refreshAppointments();
      }
    }, 360000); // 6 minutos

    return () => clearInterval(pollingInterval);
  }, []);
  const handleDeleteAppointment = async (id: string, isSobreturno: boolean) => {
    setDeletingId(id);
    try {
      if (isSobreturno) {
        await sobreturnoService.deleteSobreturno(id);
      } else {
        await appointmentService.delete(id);
      }
      // Actualizar la lista usando la función global en vez de recargar toda la página
      const updatedAppointments = appointments.filter(a => a._id !== id);
      if (window.updateAppointmentsList) {
        window.updateAppointmentsList(updatedAppointments);
      }
    } catch (error) {
      alert(`Error al eliminar ${isSobreturno ? 'sobreturno' : 'cita'}`);
    }
    setDeletingId(null);
  };
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMenuAppointment, setSelectedMenuAppointment] = useState<string | null>(null);
  
  // Inicializar estados desde localStorage
  const [attendedStates, setAttendedStates] = useState<{[id: string]: boolean}>(() => {
    const savedStates = localStorage.getItem('attendedStates');
    const defaultStates = Object.fromEntries(
      appointments.map((a) => [a._id, a.attended || false])
    );
    return savedStates ? { ...defaultStates, ...JSON.parse(savedStates) } : defaultStates;
  });

  // Estado para pagos
  const [paidStates, setPaidStates] = useState<{[id: string]: boolean}>(() => {
    return Object.fromEntries(
      appointments.map((a) => [a._id, a.isPaid || false])
    );
  });

  // Actualizar estados de pago cuando cambian los appointments
  useEffect(() => {
    const newPaidStates = Object.fromEntries(
      appointments.map((a) => [a._id, a.isPaid || false])
    );
    setPaidStates(newPaidStates);
  }, [appointments]);

  const updatePaymentState = async (appointmentId: string, value: boolean) => {
    try {
      const appointment = appointments.find(a => a._id === appointmentId);
      if (!appointment) {
        throw new Error('Cita no encontrada');
      }

      let updatedAppointment;
      if (appointment.isSobreturno) {
        updatedAppointment = await sobreturnoService.updatePaymentStatus(appointmentId, value);
      } else {
        updatedAppointment = await appointmentService.updatePaymentStatus(appointmentId, value);
      }
      
      if (import.meta.env.DEV) console.log('[DEBUG] Cita actualizada:', updatedAppointment);
      
      // Actualizar el estado local inmediatamente
      setPaidStates(prevStates => ({
        ...prevStates,
        [appointmentId]: updatedAppointment.isPaid
      }));

      // Actualizar la lista de citas localmente
      const updatedAppointments = appointments.map(a => 
        a._id === appointmentId ? { ...a, isPaid: updatedAppointment.isPaid } : a
      );
      if (window.updateAppointmentsList) {
        window.updateAppointmentsList(updatedAppointments);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al actualizar estado de pago:', error);
      alert('Error al actualizar estado de pago');
    }
  };

  const handleItemClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDrawerOpen(true);
  };

 const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, appointmentId: string) => {
  event.stopPropagation();
  setMenuAnchorEl(event.currentTarget);
  setSelectedMenuAppointment(appointmentId);
};

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMenuAppointment(null);
  };

  const handleUnlockAppointment = () => {
    if (selectedMenuAppointment) {
      const newStates = { ...attendedStates };
      delete newStates[selectedMenuAppointment];
      setAttendedStates(newStates);
      localStorage.setItem('attendedStates', JSON.stringify(newStates));
    }
    handleMenuClose();
  };

  const updateAttendedState = (appointmentId: string, value: boolean) => {
    const newStates = {
      ...attendedStates,
      [appointmentId]: value
    };
    setAttendedStates(newStates);
    localStorage.setItem('attendedStates', JSON.stringify(newStates));
  };

  const handleSaveDescription = async (id: string, description: string) => {
    try {
      const appointment = appointments.find(a => a._id === id);
      if (!appointment) {
        throw new Error('Cita no encontrada');
      }

      let updatedAppointment;
      if (appointment.isSobreturno) {
        updatedAppointment = await sobreturnoService.updateSobreturnoDescription(id, description);
      } else {
        updatedAppointment = await appointmentService.updateDescription(id, description);
      }

      // Actualizar el estado local inmediatamente
      const updatedAppointments = appointments.map(a => 
        a._id === id ? { ...a, description } : a
      );
      if (window.updateAppointmentsList) {
        window.updateAppointmentsList(updatedAppointments);
      }
      
      if (selectedAppointment && selectedAppointment._id === id) {
        setSelectedAppointment({ ...selectedAppointment, description });
      }

      if (import.meta.env.DEV) console.log('[DEBUG] Descripción actualizada:', updatedAppointment);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al guardar descripción:', error);
      alert('Error al guardar la descripción');
    }
  };

  const getTurnoInfo = (time: string) => {
    const hours = time.split('-')[0].split(':')[0];
    const hour = parseInt(hours, 10);
    
    if (hour >= 10 && hour < 12) {
      return { text: 'Turno Mañana', color: '#ff9800' };
    } else if (hour >= 17 && hour < 20) {
      return { text: 'Turno Tarde', color: '#d32f2f' };
    }
    return { text: '', color: '' };
  };

  const getAppointmentTypeLabel = (description?: string): string => {
    if (!description || description.trim() === '') return 'Sin especificar';
    
    const desc = description.toLowerCase().trim();
    
    // Detectar duración desde description
    const is30min = desc.includes('30 min') || desc.includes('30min');
    const is60min = desc.includes('60 min') || desc.includes('60min') || desc.includes('1 hora');
    
    // 30 minutos → siempre es Control
    if (is30min) {
      return 'Control';
    }
    
    // 60 minutos → Primera Cita/Tratamiento
    if (is60min) {
      return 'Primera Cita/Tratamiento';
    }
    
    // Fallback por keywords (si no hay duración explícita)
    if (desc.includes('primera') || desc.includes('nuevo') || desc.includes('atm') || desc.includes('bruxismo')) {
      return 'Primera Cita/Tratamiento';
    }
    if (desc.includes('control') || desc.includes('seguimiento') || desc.includes('segunda') || desc.includes('ajuste')) {
      return 'Control';
    }
    
    return 'Sin especificar';
  };

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'Primera Cita/Tratamiento':
        return { 
          backgroundColor: 'rgba(76, 175, 80, 0.15)', 
          color: '#4caf50'
        };
      case 'Control':
        return { 
          backgroundColor: 'rgba(33, 150, 243, 0.15)', 
          color: '#2196f3'
        };
      default:
        return { 
          backgroundColor: 'rgba(158, 158, 158, 0.15)', 
          color: '#9e9e9e'
        };
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        {showCreateButton && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateClick}
            size="small"
          >
            {buttonLabel || (title === 'Sobre-turnos' ? 'Nuevo Sobreturno' : 'Nueva Cita')}
          </Button>
        )}
      </Box>
      <List>
        {appointments.map((appointment) => (
          <ListItem
            key={appointment._id}
            sx={{
              mb: 1,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              cursor: attendedStates[appointment._id] ? 'not-allowed' : 'pointer',
              opacity: attendedStates[appointment._id] ? 0.7 : 1,
              backgroundColor: attendedStates[appointment._id]
                ? (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.04)'
                : paidStates[appointment._id]
                ? (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(76, 175, 80, 0.15)' // Verde oscuro suave para dark mode
                  : 'rgba(76, 175, 79, 0.253)'  // Verde claro suave para light mode
                : 'inherit',
              p: 2,
              position: 'relative',
            }}
            onClick={() => !attendedStates[appointment._id] && handleItemClick(appointment)}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {appointment.clientName}
                      </Typography>
                      {appointment.consultationType ? (
                        <Chip
                          label={appointment.consultationType}
                          size="small"
                          sx={{
                            height: '20px',
                            fontSize: '0.7rem',
                            backgroundColor: appointment.consultationType === 'Primera consulta'
                              ? '#e3f2fd'
                              : appointment.consultationType === 'Control'
                                ? 'rgba(33, 150, 243, 0.15)'
                                : 'rgba(158, 158, 158, 0.15)',
                            color: appointment.consultationType === 'Primera consulta'
                              ? '#1565c0'
                              : appointment.consultationType === 'Control'
                                ? '#2196f3'
                                : '#9e9e9e',
                            fontWeight: 600,
                          }}
                        />
                      ) : clinicName === 'Od. Melina Villalba' && (() => {
                        const typeLabel = getAppointmentTypeLabel(appointment.description);
                        const badgeStyle = getTypeBadgeStyle(typeLabel);
                        return (
                          <Chip
                            label={typeLabel}
                            size="small"
                            sx={{
                              height: '20px',
                              fontSize: '0.7rem',
                              backgroundColor: badgeStyle.backgroundColor,
                              color: badgeStyle.color,
                              fontWeight: 600,
                            }}
                          />
                        );
                      })()}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={appointment.status}
                        size="small"
                        color={
                          appointment.status === 'confirmed'
                            ? 'success'
                            : appointment.status === 'pending'
                            ? 'warning'
                            : 'error'
                        }
                        sx={{ height: '22px' }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {appointment.socialWork}
                      </Typography>
                      {getTurnoInfo(appointment.time).text && (
                        <Chip 
                          label={getTurnoInfo(appointment.time).text}
                          size="small"
                          sx={{ 
                            backgroundColor: getTurnoInfo(appointment.time).color,
                            color: 'white',
                            height: '22px'
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                  {/* Icono de eliminar en la esquina superior derecha */}
                  {/* Iconos de visto, eliminar y menú alineados */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      sx={{ p: 0.5 }}
                      disabled={attendedStates[appointment._id]}
                      onClick={e => {
                        e.stopPropagation();
                        updateAttendedState(appointment._id, true);
                      }}
                    >
                      <CheckCircleIcon sx={{ color: attendedStates[appointment._id] ? '#4caf50' : (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)', fontSize: 24 }} />
                    </IconButton>
                    {attendedStates[appointment._id] && (
                      <IconButton
                        size="small"
                        sx={{ p: 0.5 }}
                        onClick={(e) => handleMenuOpen(e, appointment._id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      sx={{
                        p: 0.5,
                        color: '#d32f2f',
                        backgroundColor: 'transparent',
                        '&:hover': { color: '#b71c1c', backgroundColor: 'rgba(211,47,47,0.08)' }
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteAppointment(appointment._id, !!appointment.isSobreturno);
                      }}
                      disabled={deletingId === appointment._id}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                        📞
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {appointment.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                        🕒
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {appointment.time}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={paidStates[appointment._id] || false}
                              onChange={(e) => {
                                e.stopPropagation();
                                updatePaymentState(appointment._id, e.target.checked);
                              }}
                              size="small"
                              onClick={(e) => e.stopPropagation()}
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Pagó
                            </Typography>
                          }
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
      <AppointmentDrawer
        open={drawerOpen}
        appointment={selectedAppointment}
        onClose={() => setDrawerOpen(false)}
        onSaveDescription={handleSaveDescription}
      />
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleUnlockAppointment}>
          <Typography>Desbloquear tarjeta</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SimpleAppointmentList;