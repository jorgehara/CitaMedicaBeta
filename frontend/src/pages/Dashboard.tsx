import { Box, Paper, Typography, Card, CardContent, TextField, Button, Grid, Chip } from '@mui/material';
import {
  EventNote as EventNoteIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import SimpleAppointmentList from '../components/SimpleAppointmentList';
import { useState, useEffect } from 'react';
import { getAvailableTimes } from '../services/appointmentService';
import { mockAppointments } from '../mockData/appointments';

interface TimeSlot {
  displayTime: string;
  time: string;
  period: 'morning' | 'afternoon';
}

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState('2025-08-11');
  const [appointmentData, setAppointmentData] = useState({ date: '', time: '' });

  // Filtrar citas para hoy y próximas
  const todayAppointments = mockAppointments.filter(
    app => app.date === '2025-08-11'
  );
  
  const upcomingAppointments = mockAppointments.filter(
    app => app.status === 'confirmed' && !app.attended
  );

  // Horarios disponibles de ejemplo
  const availableTimeSlots = {
    morning: [
      { time: '09:00', displayTime: '9:00 AM', period: 'morning' as const },
      { time: '10:30', displayTime: '10:30 AM', period: 'morning' as const },
      { time: '11:45', displayTime: '11:45 AM', period: 'morning' as const }
    ],
    afternoon: [
      { time: '15:00', displayTime: '3:00 PM', period: 'afternoon' as const },
      { time: '16:30', displayTime: '4:30 PM', period: 'afternoon' as const },
      { time: '17:45', displayTime: '5:45 PM', period: 'afternoon' as const }
    ]
  };

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
    <Grid container spacing={3} sx={{ p: 3 }}>
      {/* Panel de Citas de Hoy */}
      <Grid item xs={12} md={6} lg={4}>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TodayIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Citas Hoy</Typography>
            </Box>
            <SimpleAppointmentList appointments={todayAppointments} />
          </CardContent>
        </Card>
      </Grid>

      {/* Panel de Próximas Citas */}
      <Grid item xs={12} md={6} lg={4}>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ScheduleIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Próximas Citas</Typography>
            </Box>
            <SimpleAppointmentList appointments={upcomingAppointments} />
          </CardContent>
        </Card>
      </Grid>

      {/* Panel de Horarios Disponibles */}
      <Grid item xs={12} md={12} lg={4}>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EventNoteIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Horarios Disponibles</Typography>
            </Box>
            <TextField
              fullWidth
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              sx={{ mb: 2 }}
            />
            {/* Mostrar horarios disponibles */}
            {availableTimeSlots.morning.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Mañana</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {availableTimeSlots.morning.map((slot) => (
                    <Button
                      key={slot.time}
                      variant="outlined"
                      size="small"
                      onClick={() => setAppointmentData({ date: selectedDate, time: slot.time })}
                    >
                      {slot.displayTime}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}
            {availableTimeSlots.afternoon.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>Tarde</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {availableTimeSlots.afternoon.map((slot) => (
                    <Button
                      key={slot.time}
                      variant="outlined"
                      size="small"
                      onClick={() => setAppointmentData({ date: selectedDate, time: slot.time })}
                    >
                      {slot.displayTime}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
export default Dashboard;