import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Alert,
  Card,
  CardContent,
  Typography,
  CircularProgress
} from '@mui/material';
import type { AppointmentStatus, SocialWork } from '../types/appointment';
import { getSobreturnosByDate } from '../services/sobreturnoService';

const initialFormState = {
  clientName: '',
  date: '',
  status: 'confirmed' as AppointmentStatus,
  socialWork: 'CONSULTA PARTICULAR' as SocialWork,
  phone: '',
  email: '',
  description: '',
  attended: false
};

const socialWorkOptions: SocialWork[] = [
  'INSSSEP',
  'Swiss Medical',
  'OSDE',
  'Galeno',
  'CONSULTA PARTICULAR',
  'Otras Obras Sociales'
];

const HORARIOS_SOBRETURNOS: Record<number, string> = {
  1: '11:00',
  2: '11:15',
  3: '11:30',
  4: '11:45',
  5: '12:00',
  6: '19:00',
  7: '19:15',
  8: '19:30',
  9: '19:45',
  10: '20:00'
};

interface CreateOverturnDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

const CreateOverturnDialog: React.FC<CreateOverturnDialogProps> = ({ open, onClose, onCreate }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [selectedSobreturno, setSelectedSobreturno] = useState<number | null>(null);
  const [disponiblesSobreturnos, setDisponiblesSobreturnos] = useState<number[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  // Cargar sobreturnos disponibles cuando se selecciona una fecha
  useEffect(() => {
    if (formData.date && open) {
      loadAvailableSobreturnos(formData.date);
    }
  }, [formData.date, open]);

  // Reset al cerrar
  useEffect(() => {
    if (!open) {
      setFormData(initialFormState);
      setSelectedSobreturno(null);
      setDisponiblesSobreturnos([]);
      setError(null);
    }
  }, [open]);

  const loadAvailableSobreturnos = async (date: string) => {
    try {
      setLoadingAvailable(true);
      setError(null);
      const response = await getSobreturnosByDate(date);
      if (response.success && response.data.disponibles) {
        const numerosDisponibles = response.data.disponibles.map((s: any) => s.numero);
        setDisponiblesSobreturnos(numerosDisponibles);
        console.log('[CreateOverturnDialog] Sobreturnos disponibles:', numerosDisponibles);
      } else {
        setDisponiblesSobreturnos([]);
      }
    } catch (error) {
      console.error('[CreateOverturnDialog] Error al cargar sobreturnos disponibles:', error);
      setDisponiblesSobreturnos([]);
      setError('Error al cargar sobreturnos disponibles');
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSobreturnoSelect = (num: number) => {
    if (disponiblesSobreturnos.includes(num)) {
      setSelectedSobreturno(num);
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que se seleccionó un sobreturno
    if (!selectedSobreturno) {
      setError('Debes seleccionar un número de sobreturno');
      return;
    }

    setError(null);

    // Preparar datos con el formato correcto para el backend
    const sobreturnoData = {
      sobreturnoNumber: selectedSobreturno,
      date: formData.date,
      clientName: formData.clientName,
      socialWork: formData.socialWork,
      phone: formData.phone,
      email: formData.email || '',
      description: formData.description || '',
      isSobreturno: true,
      status: 'confirmed'
    };

    console.log('[CreateOverturnDialog] Enviando datos:', sobreturnoData);
    onCreate(sobreturnoData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Nuevo sobre-turno</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Nombre del paciente"
              name="clientName"
              value={formData.clientName}
              onChange={handleFormChange}
              fullWidth
              required
            />

            <TextField
              label="Fecha"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleFormChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            {/* Grid de Sobreturnos */}
            {formData.date && (
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Selecciona número de sobreturno:
                </Typography>

                {loadingAvailable ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : disponiblesSobreturnos.length === 0 ? (
                  <Alert severity="warning">No hay sobreturnos disponibles para esta fecha</Alert>
                ) : (
                  <>
                    {/* Turno Mañana */}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                      Turno Mañana (11:00-12:00):
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <Box key={num} sx={{ flex: '1 1 calc(20% - 8px)', minWidth: '80px' }}>
                          <Card
                            onClick={() => handleSobreturnoSelect(num)}
                            sx={{
                              border: selectedSobreturno === num ? '3px solid #2196f3' : '1px solid #e0e0e0',
                              cursor: disponiblesSobreturnos.includes(num) ? 'pointer' : 'not-allowed',
                              opacity: disponiblesSobreturnos.includes(num) ? 1 : 0.4,
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: disponiblesSobreturnos.includes(num) ? 3 : 0,
                                transform: disponiblesSobreturnos.includes(num) ? 'translateY(-2px)' : 'none'
                              }
                            }}
                          >
                            <CardContent sx={{ p: 1, textAlign: 'center', '&:last-child': { pb: 1 } }}>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                #{num}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                {HORARIOS_SOBRETURNOS[num]}
                              </Typography>
                              {!disponiblesSobreturnos.includes(num) && (
                                <Typography variant="caption" color="error" sx={{ display: 'block', fontSize: '0.65rem' }}>
                                  Ocupado
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Box>
                      ))}
                    </Box>

                    {/* Turno Tarde */}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                      Turno Tarde (19:00-20:00):
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {[6, 7, 8, 9, 10].map((num) => (
                        <Box key={num} sx={{ flex: '1 1 calc(20% - 8px)', minWidth: '80px' }}>
                          <Card
                            onClick={() => handleSobreturnoSelect(num)}
                            sx={{
                              border: selectedSobreturno === num ? '3px solid #2196f3' : '1px solid #e0e0e0',
                              cursor: disponiblesSobreturnos.includes(num) ? 'pointer' : 'not-allowed',
                              opacity: disponiblesSobreturnos.includes(num) ? 1 : 0.4,
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: disponiblesSobreturnos.includes(num) ? 3 : 0,
                                transform: disponiblesSobreturnos.includes(num) ? 'translateY(-2px)' : 'none'
                              }
                            }}
                          >
                            <CardContent sx={{ p: 1, textAlign: 'center', '&:last-child': { pb: 1 } }}>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                #{num}
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                {HORARIOS_SOBRETURNOS[num]}
                              </Typography>
                              {!disponiblesSobreturnos.includes(num) && (
                                <Typography variant="caption" color="error" sx={{ display: 'block', fontSize: '0.65rem' }}>
                                  Ocupado
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Box>
                      ))}
                    </Box>

                    {selectedSobreturno && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Sobreturno seleccionado: #{selectedSobreturno} - {HORARIOS_SOBRETURNOS[selectedSobreturno]}
                        {selectedSobreturno <= 5
                          ? ' (Debe llegar entre 11:00-11:30 hs)'
                          : ' (Debe llegar entre 19:00-19:30 hs)'}
                      </Alert>
                    )}
                  </>
                )}
              </Box>
            )}

            <TextField
              select
              label="Obra social"
              name="socialWork"
              value={formData.socialWork}
              onChange={handleFormChange}
              fullWidth
              required
            >
              {socialWorkOptions.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Teléfono"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              fullWidth
              required
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              fullWidth
            />

            <TextField
              label="Notas"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!selectedSobreturno || loadingAvailable}
          >
            Crear sobre-turno
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateOverturnDialog;
