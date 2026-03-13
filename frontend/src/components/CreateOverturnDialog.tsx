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
import { useClinicConfig } from '../context/ClinicConfigContext';

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


interface CreateOverturnDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

interface SobreturnoSlot {
  numero: number;
  horario: string;
  turno: string;
  disponible: boolean;
}

const CreateOverturnDialog: React.FC<CreateOverturnDialogProps> = ({ open, onClose, onCreate }) => {
  const { socialWorks: socialWorkOptions } = useClinicConfig();
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [selectedSobreturno, setSelectedSobreturno] = useState<number | null>(null);
  const [allSobreturnoSlots, setAllSobreturnoSlots] = useState<SobreturnoSlot[]>([]);
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
      setAllSobreturnoSlots([]);
      setError(null);
    }
  }, [open]);

  const loadAvailableSobreturnos = async (date: string) => {
    try {
      setLoadingAvailable(true);
      setError(null);
      const response = await getSobreturnosByDate(date);
      if (response.success && response.data.todosLosSlots) {
        setAllSobreturnoSlots(response.data.todosLosSlots);
      } else {
        setAllSobreturnoSlots([]);
      }
    } catch (error) {
      console.error('[CreateOverturnDialog] Error al cargar sobreturnos disponibles:', error);
      setAllSobreturnoSlots([]);
      setError('Error al cargar sobreturnos disponibles');
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSobreturnoSelect = (slot: SobreturnoSlot) => {
    if (slot.disponible) {
      setSelectedSobreturno(slot.numero);
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
                ) : allSobreturnoSlots.length === 0 ? (
                  <Alert severity="warning">No hay sobreturnos disponibles para esta fecha</Alert>
                ) : (
                  <>
                    {/* Turno Mañana */}
                    {allSobreturnoSlots.filter(s => s.turno === 'mañana').length > 0 && (
                      <>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                          Turno Mañana:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          {allSobreturnoSlots.filter(s => s.turno === 'mañana').map((slot) => (
                            <Box key={slot.numero} sx={{ flex: '1 1 calc(20% - 8px)', minWidth: '80px' }}>
                              <Card
                                onClick={() => handleSobreturnoSelect(slot)}
                                sx={{
                                  border: selectedSobreturno === slot.numero ? '3px solid #2196f3' : '1px solid #e0e0e0',
                                  cursor: slot.disponible ? 'pointer' : 'not-allowed',
                                  opacity: slot.disponible ? 1 : 0.4,
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    boxShadow: slot.disponible ? 3 : 0,
                                    transform: slot.disponible ? 'translateY(-2px)' : 'none'
                                  }
                                }}
                              >
                                <CardContent sx={{ p: 1, textAlign: 'center', '&:last-child': { pb: 1 } }}>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    #{slot.numero}
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                    {slot.horario}
                                  </Typography>
                                  {!slot.disponible && (
                                    <Typography variant="caption" color="error" sx={{ display: 'block', fontSize: '0.65rem' }}>
                                      Ocupado
                                    </Typography>
                                  )}
                                </CardContent>
                              </Card>
                            </Box>
                          ))}
                        </Box>
                      </>
                    )}

                    {/* Turno Tarde */}
                    {allSobreturnoSlots.filter(s => s.turno === 'tarde').length > 0 && (
                      <>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                          Turno Tarde:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {allSobreturnoSlots.filter(s => s.turno === 'tarde').map((slot) => (
                            <Box key={slot.numero} sx={{ flex: '1 1 calc(20% - 8px)', minWidth: '80px' }}>
                              <Card
                                onClick={() => handleSobreturnoSelect(slot)}
                                sx={{
                                  border: selectedSobreturno === slot.numero ? '3px solid #2196f3' : '1px solid #e0e0e0',
                                  cursor: slot.disponible ? 'pointer' : 'not-allowed',
                                  opacity: slot.disponible ? 1 : 0.4,
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    boxShadow: slot.disponible ? 3 : 0,
                                    transform: slot.disponible ? 'translateY(-2px)' : 'none'
                                  }
                                }}
                              >
                                <CardContent sx={{ p: 1, textAlign: 'center', '&:last-child': { pb: 1 } }}>
                                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    #{slot.numero}
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                    {slot.horario}
                                  </Typography>
                                  {!slot.disponible && (
                                    <Typography variant="caption" color="error" sx={{ display: 'block', fontSize: '0.65rem' }}>
                                      Ocupado
                                    </Typography>
                                  )}
                                </CardContent>
                              </Card>
                            </Box>
                          ))}
                        </Box>
                      </>
                    )}

                    {selectedSobreturno && (() => {
                      const selectedSlot = allSobreturnoSlots.find(s => s.numero === selectedSobreturno);
                      return (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          Sobreturno seleccionado: #{selectedSobreturno} - {selectedSlot?.horario}
                          {selectedSlot?.turno === 'mañana'
                            ? ' (Turno mañana)'
                            : ' (Turno tarde)'}
                        </Alert>
                      );
                    })()}
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
