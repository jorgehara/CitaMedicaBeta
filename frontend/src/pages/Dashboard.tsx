import { Box, Paper, Typography, Card, CardContent, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import {
  EventNote as EventNoteIcon,
} from '@mui/icons-material';
import AppointmentList from '../components/AppointmentList';
import { useState, useEffect } from 'react';
import { createAppointment, getAvailableTimes } from '../services/appointmentService';

const Dashboard = () => {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [appointmentData, setAppointmentData] = useState({ date: '', time: '' });

  useEffect(() => {
    if (selectedDate) {
      getAvailableTimes(selectedDate)
        .then(times => setAvailableTimes(times))
        .catch(error => console.error('Error al obtener horarios:', error));
    } else {
      setAvailableTimes([]);
    }
  }, [selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    // Resetear el horario seleccionado cuando cambia la fecha
    setAppointmentData(prev => ({ ...prev, time: '' }));
  };

  return (
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
        <FormControl fullWidth required>
          <InputLabel>Horario</InputLabel>
          <Select
            value={appointmentData.time}
            onChange={(e) => setAppointmentData({ ...appointmentData, time: e.target.value })}
            disabled={!selectedDate || availableTimes.length === 0}
          >
            {availableTimes.map((time) => (
              <MenuItem key={time} value={time}>
                {time}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default Dashboard;
