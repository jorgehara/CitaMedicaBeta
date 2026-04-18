// Task 4.3: CreatePatientDialog - Material-UI Dialog for creating new patients
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
  IconButton,
  Grid,
} from '@mui/material';
import { Close as CloseIcon, Person as PersonIcon } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { patientService } from '../services/patientService';
import type { BasePatient } from '../types/clinicalHistory';
import { useClinicConfig } from '../context/ClinicConfigContext';

interface CreatePatientDialogProps {
  open: boolean;
  onClose: () => void;
  onPatientCreated: () => void;
}

const CreatePatientDialog = ({ open, onClose, onPatientCreated }: CreatePatientDialogProps) => {
  const { socialWorks } = useClinicConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  const [formData, setFormData] = useState<Partial<BasePatient>>({
    firstName: '',
    lastName: '',
    dni: '',
    birthDate: '',
    gender: 'M',
    phone: '',
    email: '',
    address: '',
    socialWork: '',
    allergies: '',
    chronicDiseases: '',
    currentMedications: '',
  });

  const handleInputChange = (field: keyof BasePatient, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleDateChange = (date: Date | null) => {
    setBirthDate(date);
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setFormData((prev) => ({ ...prev, birthDate: formattedDate }));
    } else {
      setFormData((prev) => ({ ...prev, birthDate: '' }));
    }
    setError('');
  };

  const validate = (): boolean => {
    if (!formData.firstName?.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }
    if (!formData.lastName?.trim()) {
      setError('El apellido es obligatorio');
      return false;
    }
    if (!formData.birthDate) {
      setError('La fecha de nacimiento es obligatoria');
      return false;
    }
    if (!formData.gender) {
      setError('El género es obligatorio');
      return false;
    }
    if (!formData.phone?.trim()) {
      setError('El teléfono es obligatorio');
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
      await patientService.create(formData as BasePatient);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        dni: '',
        birthDate: '',
        gender: 'M',
        phone: '',
        email: '',
        address: '',
        socialWork: '',
        allergies: '',
        chronicDiseases: '',
        currentMedications: '',
      });
      setBirthDate(null);
      onPatientCreated();
    } catch (err: any) {
      if (import.meta.env.DEV) console.error('[CreatePatientDialog] Error creating patient:', err);
      setError(err.message || 'Error al crear paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        firstName: '',
        lastName: '',
        dni: '',
        birthDate: '',
        gender: 'M',
        phone: '',
        email: '',
        address: '',
        socialWork: '',
        allergies: '',
        chronicDiseases: '',
        currentMedications: '',
      });
      setBirthDate(null);
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-2">
            <PersonIcon className="text-blue-500" />
            <Typography variant="h6" className="font-semibold">
              Nuevo Paciente
            </Typography>
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
          {/* Demographics */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Datos Personales
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              label="Nombre"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              disabled={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              label="Apellido"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              disabled={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="DNI"
              value={formData.dni}
              onChange={(e) => handleInputChange('dni', e.target.value)}
              disabled={loading}
              placeholder="12345678"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha de Nacimiento *"
                value={birthDate}
                onChange={handleDateChange}
                maxDate={new Date()}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              required
              select
              label="Género"
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              disabled={loading}
            >
              <MenuItem value="M">Masculino</MenuItem>
              <MenuItem value="F">Femenino</MenuItem>
              <MenuItem value="X">Otro</MenuItem>
            </TextField>
          </Grid>

          {/* Contact */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" className="font-semibold mb-2 mt-2 text-gray-700 dark:text-gray-300">
              Contacto
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={loading}
              placeholder="2634123456"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={loading}
              placeholder="ejemplo@email.com"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Dirección"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              disabled={loading}
              placeholder="Calle, Número, Ciudad"
            />
          </Grid>

          {/* Medical */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" className="font-semibold mb-2 mt-2 text-gray-700 dark:text-gray-300">
              Datos Médicos
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              select
              label="Obra Social"
              value={formData.socialWork}
              onChange={(e) => handleInputChange('socialWork', e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">Sin obra social</MenuItem>
              {socialWorks.map((work: string) => (
                <MenuItem key={work} value={work}>
                  {work}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Alergias"
              value={formData.allergies}
              onChange={(e) => handleInputChange('allergies', e.target.value)}
              disabled={loading}
              placeholder="Ingrese alergias conocidas (medicamentos, alimentos, etc.)"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Enfermedades Crónicas"
              value={formData.chronicDiseases}
              onChange={(e) => handleInputChange('chronicDiseases', e.target.value)}
              disabled={loading}
              placeholder="Diabetes, hipertensión, etc."
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Medicamentos Actuales"
              value={formData.currentMedications}
              onChange={(e) => handleInputChange('currentMedications', e.target.value)}
              disabled={loading}
              placeholder="Medicamentos que toma regularmente"
            />
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
          {loading ? <CircularProgress size={24} /> : 'Crear Paciente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePatientDialog;
