// ConfirmDeleteDialog - Confirmation dialog for delete operations
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
}

const ConfirmDeleteDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
}: ConfirmDeleteDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box className="flex items-center gap-2">
          <WarningIcon className="text-red-500" fontSize="large" />
          <Typography variant="h6" className="font-semibold">
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" className="mb-3">
          Esta acción no se puede deshacer
        </Alert>
        
        <Typography variant="body1" className="mb-2">
          {message}
        </Typography>

        {itemName && (
          <Box className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md mt-3">
            <Typography variant="body2" className="font-semibold">
              {itemName}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className="p-4">
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          className="bg-red-500 hover:bg-red-600"
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
