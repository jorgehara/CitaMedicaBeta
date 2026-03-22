// Task 4.5: FollowUpForm - Follow-up consultation form
import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Slider,
  MenuItem,
  Chip,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import type { BaseFollowUp } from '../types/clinicalHistory';

interface FollowUpFormProps {
  clinicalHistoryId: string;
  onSubmit: (data: BaseFollowUp) => Promise<void>;
  onCancel: () => void;
}

interface TreatmentUpdate {
  procedureName: string;
  update: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}

interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PhotoPreview {
  file: File;
  preview: string;
  description: string;
}

const FollowUpForm = ({ clinicalHistoryId, onSubmit, onCancel }: FollowUpFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [followUpDate, setFollowUpDate] = useState<Date | null>(new Date());
  const [evolutionNotes, setEvolutionNotes] = useState('');
  const [painLevel, setPainLevel] = useState<number>(0);
  
  // Symptoms update
  const [symptomsStatus, setSymptomsStatus] = useState<'improved' | 'worsened' | 'stable' | 'resolved'>('stable');
  const [symptomsNotes, setSymptomsNotes] = useState('');

  // Treatment updates
  const [treatmentUpdates, setTreatmentUpdates] = useState<TreatmentUpdate[]>([]);
  const [newTreatmentProcedure, setNewTreatmentProcedure] = useState('');
  const [newTreatmentUpdate, setNewTreatmentUpdate] = useState('');
  const [newTreatmentStatus, setNewTreatmentStatus] = useState<'planned' | 'in_progress' | 'completed' | 'cancelled'>('in_progress');

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [newMedication, setNewMedication] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFrequency, setNewFrequency] = useState('');
  const [newDuration, setNewDuration] = useState('');

  // Photos
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);

  // Next appointment
  const [nextAppointmentDate, setNextAppointmentDate] = useState<Date | null>(null);
  const [nextAppointmentReason, setNextAppointmentReason] = useState('');

  const handleAddTreatmentUpdate = () => {
    if (newTreatmentProcedure.trim() && newTreatmentUpdate.trim()) {
      setTreatmentUpdates([
        ...treatmentUpdates,
        {
          procedureName: newTreatmentProcedure.trim(),
          update: newTreatmentUpdate.trim(),
          status: newTreatmentStatus,
        },
      ]);
      setNewTreatmentProcedure('');
      setNewTreatmentUpdate('');
      setNewTreatmentStatus('in_progress');
    }
  };

  const handleRemoveTreatmentUpdate = (index: number) => {
    setTreatmentUpdates(treatmentUpdates.filter((_, i) => i !== index));
  };

  const handleAddPrescription = () => {
    if (newMedication.trim() && newDosage.trim() && newFrequency.trim() && newDuration.trim()) {
      setPrescriptions([
        ...prescriptions,
        {
          medication: newMedication.trim(),
          dosage: newDosage.trim(),
          frequency: newFrequency.trim(),
          duration: newDuration.trim(),
        },
      ]);
      setNewMedication('');
      setNewDosage('');
      setNewFrequency('');
      setNewDuration('');
    }
  };

  const handleRemovePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo debe ser menor a 10MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos((prev) => [
          ...prev,
          {
            file,
            preview: reader.result as string,
            description: '',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handlePhotoDescriptionChange = (index: number, description: string) => {
    setPhotos(
      photos.map((photo, i) => (i === index ? { ...photo, description } : photo))
    );
  };

  const validateForm = (): string | null => {
    if (!followUpDate) {
      return 'La fecha de seguimiento es obligatoria';
    }
    if (!evolutionNotes.trim()) {
      return 'Las notas de evolución son obligatorias';
    }
    if (painLevel < 0 || painLevel > 10) {
      return 'El nivel de dolor debe estar entre 0 y 10';
    }
    if (nextAppointmentDate && !nextAppointmentReason.trim()) {
      return 'Si programas una próxima cita, debes especificar el motivo';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert photos to base64 strings (already done in preview)
      const photoUrls = photos.map((photo) => ({
        url: photo.preview, // This is already base64
        description: photo.description || undefined,
      }));

      const formData: BaseFollowUp = {
        clinicalHistory: clinicalHistoryId,
        date: format(followUpDate!, 'yyyy-MM-dd'),
        evolution: evolutionNotes,
        symptomsUpdate: {
          status: symptomsStatus,
          notes: symptomsNotes || undefined,
        },
        treatmentUpdates: treatmentUpdates.length > 0 ? treatmentUpdates : undefined,
        prescriptions: prescriptions.length > 0 ? prescriptions : undefined,
        photos: photoUrls.length > 0 ? photoUrls : undefined,
        nextAppointment:
          nextAppointmentDate && nextAppointmentReason.trim()
            ? {
                date: format(nextAppointmentDate, 'yyyy-MM-dd'),
                reason: nextAppointmentReason.trim(),
              }
            : undefined,
      };

      await onSubmit(formData);
    } catch (err: any) {
      console.error('[FollowUpForm] Error submitting form:', err);
      setError(err.message || 'Error al guardar el seguimiento');
    } finally {
      setLoading(false);
    }
  };

  const painMarks = [
    { value: 0, label: '0' },
    { value: 5, label: '5' },
    { value: 10, label: '10' },
  ];

  return (
    <Box component="form" onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {/* Header */}
      <Box className="flex items-center gap-3 mb-6">
        <CalendarIcon className="text-green-500 size-8" />
        <Typography variant="h5" className="font-bold">
          Nuevo Seguimiento
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Date */}
        <Grid size={{ xs: 12, md: 6 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha de seguimiento *"
              value={followUpDate}
              onChange={setFollowUpDate}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Pain Level */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography gutterBottom className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Nivel de dolor actual (0-10)
          </Typography>
          <Box className="px-3">
            <Slider
              value={painLevel}
              onChange={(_, value) => setPainLevel(value as number)}
              min={0}
              max={10}
              step={1}
              marks={painMarks}
              valueLabelDisplay="on"
              color={painLevel <= 3 ? 'success' : painLevel <= 6 ? 'warning' : 'error'}
            />
          </Box>
        </Grid>

        {/* Evolution Notes */}
        <Grid size={{ xs: 12 }}>
          <TextField
            required
            fullWidth
            multiline
            rows={4}
            label="Notas de evolución"
            value={evolutionNotes}
            onChange={(e) => setEvolutionNotes(e.target.value)}
            placeholder="Describe la evolución del paciente desde la última consulta..."
            helperText="Campo obligatorio"
          />
        </Grid>

        {/* Symptoms Update */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" className="font-semibold mb-2">
            Actualización de Síntomas
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            fullWidth
            label="Estado de síntomas"
            value={symptomsStatus}
            onChange={(e) => setSymptomsStatus(e.target.value as any)}
          >
            <MenuItem value="improved">Mejorado</MenuItem>
            <MenuItem value="stable">Estable</MenuItem>
            <MenuItem value="worsened">Empeorado</MenuItem>
            <MenuItem value="resolved">Resuelto</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            fullWidth
            label="Notas adicionales"
            value={symptomsNotes}
            onChange={(e) => setSymptomsNotes(e.target.value)}
            placeholder="Detalles sobre cambios en los síntomas..."
          />
        </Grid>

        {/* Treatment Updates */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" className="font-semibold mb-2">
            Actualizaciones de Tratamiento
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Procedimiento"
            value={newTreatmentProcedure}
            onChange={(e) => setNewTreatmentProcedure(e.target.value)}
            placeholder="Ej: Placa de relajación"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Actualización"
            value={newTreatmentUpdate}
            onChange={(e) => setNewTreatmentUpdate(e.target.value)}
            placeholder="Ej: Ajuste realizado"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Estado"
            value={newTreatmentStatus}
            onChange={(e) => setNewTreatmentStatus(e.target.value as any)}
          >
            <MenuItem value="planned">Planeado</MenuItem>
            <MenuItem value="in_progress">En proceso</MenuItem>
            <MenuItem value="completed">Completado</MenuItem>
            <MenuItem value="cancelled">Cancelado</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleAddTreatmentUpdate}
            startIcon={<AddIcon />}
            className="h-full"
          >
            Agregar
          </Button>
        </Grid>
        {treatmentUpdates.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Box className="flex flex-col gap-2">
              {treatmentUpdates.map((update, index) => (
                <Card key={index} variant="outlined" className="bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="py-2 px-3 flex items-center justify-between">
                    <Box className="flex-1">
                      <Typography variant="body2" className="font-semibold">
                        {update.procedureName}
                      </Typography>
                      <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                        {update.update}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={update.status === 'in_progress' ? 'En proceso' : update.status === 'completed' ? 'Completado' : update.status === 'planned' ? 'Planeado' : 'Cancelado'}
                        color={update.status === 'completed' ? 'success' : update.status === 'cancelled' ? 'error' : 'default'}
                        className="ml-2"
                      />
                    </Box>
                    <IconButton size="small" onClick={() => handleRemoveTreatmentUpdate(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>
        )}

        {/* Prescriptions */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" className="font-semibold mb-2">
            Prescripciones
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Medicación"
            value={newMedication}
            onChange={(e) => setNewMedication(e.target.value)}
            placeholder="Ej: Ibuprofeno"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Dosis"
            value={newDosage}
            onChange={(e) => setNewDosage(e.target.value)}
            placeholder="Ej: 400mg"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Frecuencia"
            value={newFrequency}
            onChange={(e) => setNewFrequency(e.target.value)}
            placeholder="Ej: c/8hs"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Duración"
            value={newDuration}
            onChange={(e) => setNewDuration(e.target.value)}
            placeholder="Ej: 7 días"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleAddPrescription}
            startIcon={<AddIcon />}
            className="h-full"
          >
            Agregar
          </Button>
        </Grid>
        {prescriptions.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Box className="flex flex-col gap-2">
              {prescriptions.map((prescription, index) => (
                <Card key={index} variant="outlined" className="bg-green-50 dark:bg-green-900/20">
                  <CardContent className="py-2 px-3 flex items-center justify-between">
                    <Box>
                      <Typography variant="body2" className="font-semibold">
                        {prescription.medication} - {prescription.dosage}
                      </Typography>
                      <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                        {prescription.frequency} durante {prescription.duration}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => handleRemovePrescription(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>
        )}

        {/* Photos */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" className="font-semibold mb-2">
            Fotos (opcional)
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCameraIcon />}
          >
            Subir fotos
            <input
              type="file"
              hidden
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
            />
          </Button>
          <Typography variant="caption" className="ml-2 text-gray-500">
            Máximo 10MB por foto
          </Typography>
        </Grid>
        {photos.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={2}>
              {photos.map((photo, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Card variant="outlined" className="relative">
                    <img
                      src={photo.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover"
                    />
                    <IconButton
                      size="small"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => handleRemovePhoto(index)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                    <CardContent className="py-2">
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Descripción (opcional)"
                        value={photo.description}
                        onChange={(e) => handlePhotoDescriptionChange(index, e.target.value)}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}

        {/* Next Appointment */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" className="font-semibold mb-2">
            Próxima Cita (opcional)
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha de próxima cita"
              value={nextAppointmentDate}
              onChange={setNextAppointmentDate}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Motivo"
            value={nextAppointmentReason}
            onChange={(e) => setNextAppointmentReason(e.target.value)}
            placeholder="Ej: Control de placa"
            disabled={!nextAppointmentDate}
          />
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box className="flex justify-end gap-3 mt-6">
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
          startIcon={<CancelIcon />}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={<SaveIcon />}
        >
          {loading ? 'Guardando...' : 'Guardar Seguimiento'}
        </Button>
      </Box>
    </Box>
  );
};

export default FollowUpForm;
