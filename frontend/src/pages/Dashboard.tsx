import { Box, Paper, Typography, Card, CardContent, TextField, Button } from '@mui/material';
import {
  EventNote as EventNoteIcon,
} from '@mui/icons-material';
import AppointmentList from '../components/AppointmentList';
import { useState, useEffect } from 'react';
import { getAvailableTimes } from '../services/appointmentService';

interface TimeSlot {
  displayTime: string;
  time: string;
  period: 'morning' | 'afternoon';
}

const Dashboard = () => {
  const [availableSlots, setAvailableSlots] = useState<{
    morning: TimeSlot[];
    afternoon: TimeSlot[];
  }>({ morning: [], afternoon: [] });
  const [selectedDate, setSelectedDate] = useState('');
  const [appointmentData, setAppointmentData] = useState({ date: '', time: '' });

  useEffect(() => {
    if (selectedDate) {
      getAvailableTimes(selectedDate)
        .then(response => {
          if (response.success) {
            setAvailableSlots({
              morning: response.data.morning,
              afternoon: response.data.afternoon
            });
          } else {
            setAvailableSlots({ morning: [], afternoon: [] });
          }
        })
        .catch(error => {
          console.error('Error al obtener horarios:', error);
          setAvailableSlots({ morning: [], afternoon: [] });
        });
    } else {
      setAvailableSlots({ morning: [], afternoon: [] });
    }
  }, [selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setAppointmentData(prev => ({ ...prev, time: '' }));
  };

  return (
    <>
    <Box sx={{ 
      height: '100vh',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Panel superior */} 
      {/* este panel debe ocupar todo el ancho de la pantalla y ser responsive */} 

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 2, 
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider'
          }}>
        {/* Panel izquierdo */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          gap: 3
        }}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap:1, padding: 1 }}>
                <EventNoteIcon color="primary" />
                <Typography variant="h6">Citas Hoy</Typography>
              </Box>
            </CardContent>
          </Card>

          <Paper sx={{ 
            flex: 1,
            bgcolor: 'background.paper',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <AppointmentList showHistory={false} />
          </Box>
          </Paper>
        </Box>
      </Box>
      <Box sx={{ padding: 2 }}>
        <TextField
          type="date"
          value={appointmentData.date}
          onChange={(e) => {
            handleDateChange(e.target.value);
            setAppointmentData({ ...appointmentData, date: e.target.value });
          }}
          fullWidth
          required
        />
        {selectedDate && (
            <>
              {availableSlots.morning.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Horarios disponibles - Mañana
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 1 }}>
                    {availableSlots.morning.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={appointmentData.time === slot.time ? "contained" : "outlined"}
                        onClick={() => setAppointmentData(prev => ({ ...prev, time: slot.time }))}
                        size="small"
                      >
                        {slot.displayTime}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}

              {availableSlots.afternoon.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Horarios disponibles - Tarde
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 1 }}>
                    {availableSlots.afternoon.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={appointmentData.time === slot.time ? "contained" : "outlined"}
                        onClick={() => setAppointmentData(prev => ({ ...prev, time: slot.time }))}
                        size="small"
                      >
                        {slot.displayTime}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}

              {availableSlots.morning.length === 0 && availableSlots.afternoon.length === 0 && (
                <Typography color="error">
                  No hay horarios disponibles para la fecha seleccionada
                </Typography>
              )}
            </>
          )}
      </Box>

      <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Mostrar solo turnos futuros */}
      <AppointmentList showHistory={false} />

      {/* Formulario de creación de turno */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Crear nuevo turno
        </Typography>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            type="date"
            label="Fecha"
            value={appointmentData.date}
            onChange={(e) => {
              handleDateChange(e.target.value);
              setAppointmentData({ ...appointmentData, date: e.target.value });
            }}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />

          {selectedDate && (
            <>
              {availableSlots.morning.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Horarios disponibles - Mañana
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 1 }}>
                    {availableSlots.morning.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={appointmentData.time === slot.time ? "contained" : "outlined"}
                        onClick={() => setAppointmentData(prev => ({ ...prev, time: slot.time }))}
                        size="small"
                      >
                        {slot.displayTime}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}

              {availableSlots.afternoon.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Horarios disponibles - Tarde
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 1 }}>
                    {availableSlots.afternoon.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={appointmentData.time === slot.time ? "contained" : "outlined"}
                        onClick={() => setAppointmentData(prev => ({ ...prev, time: slot.time }))}
                        size="small"
                      >
                        {slot.displayTime}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}

              {availableSlots.morning.length === 0 && availableSlots.afternoon.length === 0 && (
                <Typography color="error">
                  No hay horarios disponibles para la fecha seleccionada
                </Typography>
              )}
            </>
          )}

          {/* Resto del formulario */}
        </Box>
      </Paper>
    </Box>
    </Box>
</>
  );
}
export default Dashboard;