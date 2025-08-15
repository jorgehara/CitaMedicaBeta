import { Tooltip, IconButton } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface Props {
  onClick: () => void;
}

const NewAppointmentButton: React.FC<Props> = ({ onClick }) => (
  <Tooltip title="Nueva cita">
    <IconButton
      onClick={onClick}
      color="primary"
      sx={{
        borderRadius: 1,
        bgcolor: 'background.paper',
        boxShadow: 1,
        '&:hover': {
          bgcolor: 'primary.main',
          color: 'common.white'
        }
      }}
    >
      <AddIcon />
    </IconButton>
  </Tooltip>
);

export default NewAppointmentButton;
