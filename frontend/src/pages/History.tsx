import React from 'react';
import { Box, Typography } from '@mui/material';
import AppointmentList from '../components/AppointmentList';

const History = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Historial de Turnos
      </Typography>
      <AppointmentList showHistory={true} />
    </Box>
  );
};

export default History;
