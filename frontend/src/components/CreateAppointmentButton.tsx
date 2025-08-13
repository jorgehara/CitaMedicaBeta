import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import React from 'react';

interface Props {
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
}

const CreateAppointmentButton: React.FC<Props> = ({ onClick, size = 'medium' }) => (
  <Button
    variant="contained"
    color="primary"
    startIcon={<AddIcon />}
    onClick={onClick}
    size={size}
    sx={{
      borderRadius: 2,
      padding: size === 'small' ? '6px 16px' : size === 'large' ? '16px 32px' : '12px 24px',
      boxShadow: 3,
      minWidth: size === 'small' ? '120px' : size === 'large' ? '200px' : '160px',
      fontWeight: 'bold',
      fontSize: size === 'small' ? '0.95rem' : size === 'large' ? '1.15rem' : '1.05rem',
      '&:hover': {
        boxShadow: 6
      }
    }}
  >
    Crear nueva cita
  </Button>
);

export default CreateAppointmentButton;
