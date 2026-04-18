// CreateFollowUpDialog - Dialog for adding/editing follow-up to a clinical history
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Box,
  Typography,
  IconButton,
  Grid,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';
import { followUpService } from '../services/followUpService';
import type { BaseFollowUp, FollowUp } from '../types/clinicalHistory';

interface CreateFollowUpDialogProps {
  open: boolean;
  onClose: () => void;
  clinicalHistoryId: string;
  patientName: string;
  onFollowUpCreated: () => void;
  editMode?: boolean;
  existingFollowUp?: FollowUp | null;
}

const CreateFollowUpDialog = ({
  open,
  onClose,
  clinicalHistoryId,
  patientName,
  onFollowUpCreated,
  editMode = false,
  existingFollowUp = null,
}: CreateFollowUpDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [followUpDate, setFollowUpDate] = useState<Date | null>(new Date());

  const [formData, setFormData] = useState({
    evolution: '',
    symptomsStatus: 'stable' as 'improved' | 'worsened' | 'stable' | 'resolved',
    symptomsNotes: '',
    painLevel: '',
  });

  // Load existing data when in edit mode
  useEffect(() => {
    if (editMode && existingFollowUp && open) {
      setFormData({
        evolution: existingFollowUp.evolution || '',
        symptomsStatus: existingFollowUp.symptomsUpdate?.status || 'stable',
        symptomsNotes: existingFollowUp.symptomsUpdate?.notes || '',
        painLevel: existingFollowUp.symptomsUpdate?.painLevel?.toString() || '',
      });
      if (existingFollowUp.date) {
        setFollowUpDate(parseISO(existingFollowUp.date));
      }
    } else if (!open) {
      // Reset form when dialog closes
      setFormData({
        evolution: '',
        symptomsStatus: 'stable',
        symptomsNotes: '',
        painLevel: '',
      });
      setFollowUpDate(new Date());
    }
  }, [editMode, existingFollowUp, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const validate = (): boolean => {
    if (!formData.evolution.trim()) {
      setError('Las notas de evolución son obligatorias');
      return false;
    }
    if (!followUpDate) {
      setError('La fecha de seguimiento es obligatoria');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const followUp: Partial<BaseFollowUp> = {
        clinicalHistory: clinicalHistoryId,
        date: followUpDate ? format(followUpDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        evolution: formData.evolution,
        symptomsUpdate: {
          status: formData.symptomsStatus,
          notes: formData.symptomsNotes || undefined,
          painLevel: formData.painLevel ? Number(formData.painLevel) : undefined,
        },
      };

      if (editMode && existingFollowUp) {
        // Update existing follow-up
        await followUpService.update(existingFollowUp._id, followUp as BaseFollowUp);
      } else {
        // Create new follow-up
        await followUpService.create(followUp as BaseFollowUp);
      }

      onFollowUpCreated();
      onClose();
    } catch (err: any) {
      if (import.meta.env.DEV) console.error('[CreateFollowUpDialog] Error creating follow-up:', err);
      setError(err.message || 'Error al crear seguimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'improved' || status === 'resolved') return 'success';
    if (status === 'worsened') return 'error';
    return 'default';
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-2">
            <CommentIcon className="text-blue-500" />
            <Box>
              <Typography variant="h6" className="font-semibold">
                {editMode ? 'Editar Seguimiento' : 'Agregar Seguimiento'}
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                {patientName}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} disabled={loading} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" className="mb-4" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Date */}
          <Grid size={{ xs: 12 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha de Seguimiento"
                value={followUpDate}
                onChange={setFollowUpDate}
                maxDate={new Date()}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Evolution */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              label="Evolución"
              value={formData.evolution}
              onChange={(e) => handleInputChange('evolution', e.target.value)}
              disabled={loading}
              multiline
              rows={4}
              placeholder="Describe la evolución del paciente desde la última visita..."
            />
          </Grid>

          {/* Symptoms Status */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Estado de Síntomas
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label="Estado"
              value={formData.symptomsStatus}
              onChange={(e) => handleInputChange('symptomsStatus', e.target.value)}
              disabled={loading}
            >
              <MenuItem value="improved">
                <Box className="flex items-center gap-2">
                  <Chip label="✓ Mejoró" size="small" color="success" />
                </Box>
              </MenuItem>
              <MenuItem value="stable">
                <Box className="flex items-center gap-2">
                  <Chip label="→ Estable" size="small" color="default" />
                </Box>
              </MenuItem>
              <MenuItem value="worsened">
                <Box className="flex items-center gap-2">
                  <Chip label="✗ Empeoró" size="small" color="error" />
                </Box>
              </MenuItem>
              <MenuItem value="resolved">
                <Box className="flex items-center gap-2">
                  <Chip label="✓ Resuelto" size="small" color="success" />
                </Box>
              </MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label="Nivel de Dolor"
              value={formData.painLevel}
              onChange={(e) => handleInputChange('painLevel', e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">Sin especificar</MenuItem>
              {Array.from({ length: 11 }, (_, i) => (
                <MenuItem key={i} value={i}>
                  {i}/10 {i === 0 ? '(Sin dolor)' : i <= 3 ? '(Leve)' : i <= 7 ? '(Moderado)' : '(Severo)'}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Symptoms Notes */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Notas Adicionales sobre Síntomas"
              value={formData.symptomsNotes}
              onChange={(e) => handleInputChange('symptomsNotes', e.target.value)}
              disabled={loading}
              multiline
              rows={2}
              placeholder="Detalles sobre cambios en los síntomas..."
            />
          </Grid>

          {/* Preview */}
          <Grid size={{ xs: 12 }}>
            <Box className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
              <Typography variant="caption" className="text-gray-600 dark:text-gray-400 font-semibold uppercase block mb-1">
                Vista Previa
              </Typography>
              <Box className="flex items-center gap-2 mb-2">
                <Chip
                  label={
                    formData.symptomsStatus === 'improved' ? '✓ Mejoró' :
                    formData.symptomsStatus === 'worsened' ? '✗ Empeoró' :
                    formData.symptomsStatus === 'resolved' ? '✓ Resuelto' :
                    '→ Estable'
                  }
                  size="small"
                  color={getStatusColor(formData.symptomsStatus)}
                />
                {formData.painLevel && (
                  <Typography variant="caption" className="text-gray-600">
                    Dolor: {formData.painLevel}/10
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
                {formData.evolution || 'Notas de evolución...'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions className="p-4">
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {loading ? <CircularProgress size={24} /> : editMode ? 'Guardar Cambios' : 'Agregar Seguimiento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateFollowUpDialog;
