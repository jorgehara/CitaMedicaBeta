import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { appointmentService } from '../services/appointmentService';
import { getSobreturnosByDate, createSobreturno } from '../services/sobreturnoService';
import type { SocialWork } from '../types/appointment';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface TimeSlot {
  displayTime: string;
  time: string;
  period: 'morning' | 'afternoon';
}

const socialWorks: SocialWork[] = [
  'INSSSEP',
  'Swiss Medical',
  'OSDE',
  'Galeno',
  'CONSULTA PARTICULAR',
  'Otras Obras Sociales',
];

const HORARIOS_SOBRETURNOS: Record<number, string> = {
  1: '11:00', 2: '11:15', 3: '11:30', 4: '11:45', 5: '12:00',
  6: '19:00', 7: '19:15', 8: '19:30', 9: '19:45', 10: '20:00'
};

const steps = ['Fecha y Hora', 'Datos Personales', 'Confirmación'];

const BookAppointment = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchParams] = useSearchParams();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Extraer y almacenar token de la URL
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      console.log('[DEBUG] Token recibido en URL, almacenando en localStorage');
      localStorage.setItem('public_token', urlToken);

      // Limpiar URL quitando el token por seguridad
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      // Verificar si ya hay un token almacenado
      const storedToken = localStorage.getItem('public_token');
      if (storedToken) {
        console.log('[DEBUG] Token encontrado en localStorage');
      } else {
        console.warn('[WARN] No hay token de acceso. Solicita un nuevo enlace al chatbot.');
      }
    }
  }, [searchParams]);

  // Step 1: Date and Time
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Sobreturnos state
  const [showingSobreturnos, setShowingSobreturnos] = useState(false);
  const [selectedSobreturno, setSelectedSobreturno] = useState<number | null>(null);
  const [disponiblesSobreturnos, setDisponiblesSobreturnos] = useState<number[]>([]);

  // Step 2: Personal Data
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    email: '',
    dni: '',
    socialWork: '' as SocialWork | '',
    description: '',
  });

  const handleDateChange = async (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTime('');
    setSelectedSobreturno(null);
    setError('');
    setShowingSobreturnos(false);

    if (date) {
      setLoadingTimes(true);
      try {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const response = await appointmentService.getAvailableTimes(formattedDate, true); // true = público

        if (response.success && response.data) {
          const allTimes = [...response.data.morning, ...response.data.afternoon];
          setAvailableTimes(allTimes);

          // Si no hay horarios normales, cargar sobreturnos automáticamente
          if (allTimes.length === 0) {
            console.log('[DEBUG] No hay turnos normales, consultando sobreturnos...');
            try {
              const sobreturnosResponse = await getSobreturnosByDate(formattedDate);

              if (sobreturnosResponse.success && sobreturnosResponse.data.totalDisponibles > 0) {
                const numerosDisponibles = sobreturnosResponse.data.disponibles.map((s: any) => s.numero);
                setDisponiblesSobreturnos(numerosDisponibles);
                setShowingSobreturnos(true);
                console.log('[DEBUG] Sobreturnos disponibles:', numerosDisponibles);
              } else {
                setError('No hay turnos ni sobreturnos disponibles para esta fecha');
              }
            } catch (sobreturnoErr) {
              console.error('[ERROR] Error al cargar sobreturnos:', sobreturnoErr);
              setError('No hay horarios disponibles para esta fecha');
            }
          }
        }
      } catch (err) {
        console.error('Error al cargar horarios:', err);
        setError('Error al cargar los horarios disponibles');
        setAvailableTimes([]);
      } finally {
        setLoadingTimes(false);
      }
    } else {
      setAvailableTimes([]);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setError('');
  };

  const handleSobreturnoSelect = (numero: number) => {
    if (disponiblesSobreturnos.includes(numero)) {
      setSelectedSobreturno(numero);
      setError('');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleNext = () => {
    setError('');

    if (activeStep === 0) {
      if (!selectedDate) {
        setError('Por favor selecciona una fecha');
        return;
      }

      // Validar según si es turno normal o sobreturno
      if (showingSobreturnos) {
        if (!selectedSobreturno) {
          setError('Por favor selecciona un sobreturno');
          return;
        }
      } else {
        if (!selectedTime) {
          setError('Por favor selecciona un horario');
          return;
        }
      }
    }

    if (activeStep === 1) {
      if (!formData.clientName.trim()) {
        setError('Por favor ingresa tu nombre completo');
        return;
      }
      if (!formData.phone.trim()) {
        setError('Por favor ingresa tu teléfono');
        return;
      }
      if (!formData.socialWork) {
        setError('Por favor selecciona tu obra social');
        return;
      }
    }

    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    // Validar según tipo de turno
    if (!selectedDate) {
      setError('Datos de fecha incompletos');
      return;
    }

    if (showingSobreturnos && !selectedSobreturno) {
      setError('Por favor selecciona un sobreturno');
      return;
    }

    if (!showingSobreturnos && !selectedTime) {
      setError('Datos de hora incompletos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      if (showingSobreturnos && selectedSobreturno) {
        // Crear sobreturno
        const sobreturnoData = {
          sobreturnoNumber: selectedSobreturno,
          date: formattedDate,
          time: HORARIOS_SOBRETURNOS[selectedSobreturno],
          clientName: formData.clientName,
          socialWork: formData.socialWork as SocialWork,
          phone: formData.phone,
          email: formData.email || '',
          description: formData.description || '',
          status: 'confirmed' as const,
          isSobreturno: true,
        };

        await createSobreturno(sobreturnoData);
      } else {
        // Crear cita normal
        const appointmentData = {
          clientName: formData.clientName,
          phone: formData.phone,
          email: formData.email || undefined,
          dni: formData.dni || undefined,
          socialWork: formData.socialWork as SocialWork,
          description: formData.description || undefined,
          date: formattedDate,
          time: selectedTime,
          status: 'pending' as const,
        };

        await appointmentService.create(appointmentData, true); // true = público
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Error al crear la cita:', err);
      setError(err.message || 'Error al agendar el turno. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Selecciona fecha y horario
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha del turno"
                value={selectedDate}
                onChange={handleDateChange}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    sx: { mb: 3 }
                  }
                }}
              />
            </LocalizationProvider>

            {loadingTimes && (
              <Box display="flex" justifyContent="center" my={3}>
                <CircularProgress />
              </Box>
            )}

            {!loadingTimes && availableTimes.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 500 }}>
                  Horarios disponibles:
                </Typography>
                <Grid container spacing={1.5}>
                  {availableTimes.map((slot) => (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={slot.time}>
                      <Card
                        elevation={selectedTime === slot.time ? 8 : 2}
                        sx={{
                          border: selectedTime === slot.time ? 2 : 0,
                          borderColor: 'primary.main',
                          transition: 'all 0.2s',
                        }}
                      >
                        <CardActionArea onClick={() => handleTimeSelect(slot.time)}>
                          <CardContent sx={{ p: 2, textAlign: 'center' }}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: selectedTime === slot.time ? 700 : 500,
                                color: selectedTime === slot.time ? 'primary.main' : 'text.primary'
                              }}
                            >
                              {slot.displayTime}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {!loadingTimes && showingSobreturnos && (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  No hay turnos disponibles para esta fecha. Puedes seleccionar un sobreturno:
                </Alert>

                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                  Sobreturnos Mañana (llegar entre 11:00-11:30):
                </Typography>
                <Grid container spacing={1.5} sx={{ mb: 3 }}>
                  {[1, 2, 3, 4, 5].map((num) => {
                    const isDisponible = disponiblesSobreturnos.includes(num);
                    const isSelected = selectedSobreturno === num;
                    return (
                      <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={num}>
                        <Card
                          elevation={isSelected ? 8 : 2}
                          sx={{
                            border: isSelected ? 2 : 0,
                            borderColor: 'primary.main',
                            opacity: isDisponible ? 1 : 0.5,
                            transition: 'all 0.2s',
                            cursor: isDisponible ? 'pointer' : 'not-allowed',
                            bgcolor: !isDisponible ? 'action.disabledBackground' : 'background.paper',
                          }}
                        >
                          <CardActionArea
                            onClick={() => handleSobreturnoSelect(num)}
                            disabled={!isDisponible}
                          >
                            <CardContent sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Sobreturno {num}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: isSelected ? 700 : 500,
                                  color: isSelected ? 'primary.main' : isDisponible ? 'text.primary' : 'text.disabled',
                                }}
                              >
                                {HORARIOS_SOBRETURNOS[num]}
                              </Typography>
                              {!isDisponible && (
                                <Typography variant="caption" color="error">
                                  Ocupado
                                </Typography>
                              )}
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                  Sobreturnos Tarde (llegar entre 19:00-19:30):
                </Typography>
                <Grid container spacing={1.5}>
                  {[6, 7, 8, 9, 10].map((num) => {
                    const isDisponible = disponiblesSobreturnos.includes(num);
                    const isSelected = selectedSobreturno === num;
                    return (
                      <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={num}>
                        <Card
                          elevation={isSelected ? 8 : 2}
                          sx={{
                            border: isSelected ? 2 : 0,
                            borderColor: 'primary.main',
                            opacity: isDisponible ? 1 : 0.5,
                            transition: 'all 0.2s',
                            cursor: isDisponible ? 'pointer' : 'not-allowed',
                            bgcolor: !isDisponible ? 'action.disabledBackground' : 'background.paper',
                          }}
                        >
                          <CardActionArea
                            onClick={() => handleSobreturnoSelect(num)}
                            disabled={!isDisponible}
                          >
                            <CardContent sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Sobreturno {num}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: isSelected ? 700 : 500,
                                  color: isSelected ? 'primary.main' : isDisponible ? 'text.primary' : 'text.disabled',
                                }}
                              >
                                {HORARIOS_SOBRETURNOS[num]}
                              </Typography>
                              {!isDisponible && (
                                <Typography variant="caption" color="error">
                                  Ocupado
                                </Typography>
                              )}
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Ingresa tus datos
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  label="Nombre completo"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  variant="outlined"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Teléfono"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  variant="outlined"
                  placeholder="Ej: 2634123456"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="DNI"
                  value={formData.dni}
                  onChange={(e) => handleInputChange('dni', e.target.value)}
                  variant="outlined"
                  placeholder="Ej: 12345678"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  variant="outlined"
                  placeholder="ejemplo@email.com"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Obra Social"
                  value={formData.socialWork}
                  onChange={(e) => handleInputChange('socialWork', e.target.value)}
                  variant="outlined"
                >
                  {socialWorks.map((work) => (
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
                  rows={3}
                  label="Motivo de consulta (opcional)"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  variant="outlined"
                  placeholder="Describe brevemente el motivo de tu consulta"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              Confirma tus datos
            </Typography>

            <Paper elevation={0} sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha y Hora
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {selectedDate && format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                  </Typography>
                  {showingSobreturnos && selectedSobreturno ? (
                    <>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Sobreturno {selectedSobreturno} - {HORARIOS_SOBRETURNOS[selectedSobreturno]}
                      </Typography>
                      <Alert severity="info" sx={{ mt: 1 }}>
                        {selectedSobreturno <= 5
                          ? 'Debe llegar entre las 11:00 y las 11:30 hs'
                          : 'Debe llegar entre las 19:00 y las 19:30 hs'}
                      </Alert>
                    </>
                  ) : (
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {availableTimes.find(t => t.time === selectedTime)?.displayTime}
                    </Typography>
                  )}
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    Paciente
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {formData.clientName}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Teléfono
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {formData.phone}
                  </Typography>
                </Grid>

                {formData.dni && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      DNI
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                      {formData.dni}
                    </Typography>
                  </Grid>
                )}

                {formData.email && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                      {formData.email}
                    </Typography>
                  </Grid>
                )}

                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    Obra Social
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {formData.socialWork}
                  </Typography>
                </Grid>

                {formData.description && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Motivo de consulta
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                      {formData.description}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: { xs: 3, sm: 5 },
              textAlign: 'center',
              borderRadius: 3,
            }}
          >
            <Box sx={{ mb: 3 }}>
              <CheckCircleIcon
                sx={{
                  fontSize: 80,
                  color: 'success.main',
                  mb: 2,
                }}
              />
            </Box>

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              ¡Turno agendado con éxito!
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              Tu turno ha sido confirmado para:
            </Typography>

            <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
              </Typography>
              {showingSobreturnos && selectedSobreturno ? (
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                  Sobreturno {selectedSobreturno} - {HORARIOS_SOBRETURNOS[selectedSobreturno]}
                </Typography>
              ) : (
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                  {availableTimes.find(t => t.time === selectedTime)?.displayTime}
                </Typography>
              )}
            </Paper>

            {showingSobreturnos && selectedSobreturno && (
              <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
                {selectedSobreturno <= 5
                  ? 'Debe llegar entre las 11:00 y las 11:30 hs'
                  : 'Debe llegar entre las 19:00 y las 19:30 hs'}
              </Alert>
            )}

            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              Recibirás una confirmación por WhatsApp al número {formData.phone}
            </Alert>

            <Typography variant="body2" color="text.secondary">
              {showingSobreturnos
                ? selectedSobreturno && selectedSobreturno <= 5
                  ? 'Por favor, llega entre las 11:00 y las 11:30 hs'
                  : 'Por favor, llega entre las 19:00 y las 19:30 hs'
                : 'Por favor, llega 30 minutos antes de tu turno'}
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: { xs: 3, sm: 5 },
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <EventAvailableIcon
              sx={{
                fontSize: 50,
                color: 'primary.main',
                mb: 2,
              }}
            />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Agendar Turno
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Completa los datos para reservar tu consulta
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper
            activeStep={activeStep}
            sx={{ mb: 4 }}
            orientation={isMobile ? 'vertical' : 'horizontal'}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Step Content */}
          <Box sx={{ mb: 4 }}>
            {renderStepContent()}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              sx={{ minWidth: 100 }}
            >
              Atrás
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Confirmar turno'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                sx={{ minWidth: 100 }}
              >
                Siguiente
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default BookAppointment;