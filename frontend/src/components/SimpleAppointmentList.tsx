import { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip, IconButton, Button, Menu, MenuItem } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AppointmentDrawer from './AppointmentDrawer';
import * as sobreturnoService from '../services/sobreturnoService';
import type { Appointment } from '../types/appointment';

interface SimpleAppointmentListProps {
  appointments: Appointment[];
  title: string;
  onCreateClick?: () => void;
  showCreateButton?: boolean;
  buttonLabel?: string;
}

const SimpleAppointmentList = ({ appointments, title, onCreateClick, showCreateButton = false, buttonLabel }: SimpleAppointmentListProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMenuAppointment, setSelectedMenuAppointment] = useState<string | null>(null);
  
  // Inicializar estados desde localStorage
  const [attendedStates, setAttendedStates] = useState<{[id: string]: boolean}>(() => {
    const savedStates = localStorage.getItem('attendedStates');
    const defaultStates = Object.fromEntries(
      (appointments as Appointment[]).map((a: Appointment) => [a._id, a.attended || false])
    );
    
    if (savedStates) {
      const parsed = JSON.parse(savedStates);
      return { ...defaultStates, ...parsed };
    }
    
    return defaultStates;
  });

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

  // Actualizar localStorage cuando cambie el estado de attended
  const updateAttendedState = (appointmentId: string, value: boolean) => {
    const newStates = {
      ...attendedStates,
      [appointmentId]: value
    };
    setAttendedStates(newStates);
    localStorage.setItem('attendedStates', JSON.stringify(newStates));
  };

  const handleSaveDescription = async (id: string, description: string) => {
    if (selectedAppointment && selectedAppointment._id === id) {
      setSelectedAppointment({ ...selectedAppointment, description });
    }
    try {
      await sobreturnoService.updateSobreturnoDescription(id, description);
    } catch {
      // Manejar error si es necesario
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
                : 'inherit'
            }}
            onClick={() => !attendedStates[appointment._id] && handleItemClick(appointment)}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {appointment.clientName}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{ ml: 0.5, p: 0 }}
                    disabled={attendedStates[appointment._id]}
                    onClick={e => {
                      e.stopPropagation();
                      updateAttendedState(appointment._id, true);
                    }}
                  >
                    <CheckCircleIcon sx={{ 
                      color: attendedStates[appointment._id] 
                        ? '#4caf50'
                        : (theme) => theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.3)' 
                          : 'rgba(0, 0, 0, 0.2)',
                      fontSize: 22 
                    }} />
                  </IconButton>
                  {attendedStates[appointment._id] && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, appointment._id)}
                      sx={{ 
                        ml: 0.5,
                        color: (theme) => theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.7)' 
                          : 'rgba(0, 0, 0, 0.54)',
                        '&:hover': {
                          color: (theme) => theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.9)' 
                            : 'rgba(0, 0, 0, 0.87)',
                          backgroundColor: (theme) => theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                          ml: 1
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      📞 <strong>{appointment.phone}</strong>
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>{appointment.time}</Typography>
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