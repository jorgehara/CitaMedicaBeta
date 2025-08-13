import { Box, Typography } from '@mui/material';
import AppointmentList from '../components/AppointmentList';
import { useRef } from 'react';

declare global {
  interface Window {
    openCreateAppointmentDialog: () => void;
  }
}

const History = () => {
  const appointmentListRef = useRef<{ openCreateDialog: () => void }>(null);
  window.openCreateAppointmentDialog = () => {
    appointmentListRef.current?.openCreateDialog();
  };
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Historial de Turnos
      </Typography>
  <AppointmentList ref={appointmentListRef} showHistory={true} />
    </Box>
  );
};

export default History;
