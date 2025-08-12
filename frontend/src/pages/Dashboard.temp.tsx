import { Box, Typography, Card, CardContent, TextField, Button } from '@mui/material';
import {
  EventNote as EventNoteIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import SimpleAppointmentList from '../components/SimpleAppointmentList';
import { mockAppointments } from '../mockData/appointments';

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const Dashboard = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // Filtrar citas para hoy y próximas
  const todayAppointments = mockAppointments.filter(
    app => app.date === selectedDate
  );
  
  const upcomingAppointments = mockAppointments.filter(
    app => app.status === 'confirmed' && !app.attended && app.date >= selectedDate
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

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, p: 3 }}>
      {/* Panel de Citas de Hoy */}
      <Box sx={{ width: { xs: '100%', md: '48%', lg: '32%' } }}>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TodayIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Citas Hoy</Typography>
              </Box>
              <Typography variant="subtitle1" color="text.secondary">
                {formatDate(selectedDate)}
              </Typography>
            </Box>
            <SimpleAppointmentList appointments={todayAppointments} />
          </CardContent>
        </Card>
      </Box>

      {/* Panel de Próximas Citas */}
      <Box sx={{ width: { xs: '100%', md: '48%', lg: '32%' } }}>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ScheduleIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Próximas Citas</Typography>
            </Box>
            <SimpleAppointmentList appointments={upcomingAppointments} />
          </CardContent>
        </Card>
      </Box>

      {/* Panel de Horarios Disponibles */}
      <Box sx={{ width: { xs: '100%', md: '48%', lg: '32%' } }}>
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
            {availableTimeSlots.morning.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Mañana</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {availableTimeSlots.morning.map((slot) => (
                    <Button
                      key={slot.time}
                      variant="outlined"
                      size="small"
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
                    >
                      {slot.displayTime}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
