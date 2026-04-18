// CreateClinicalHistoryDialog - Dialog for creating/editing clinical history visits
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocalHospital as LocalHospitalIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { clinicalHistoryService } from '../services/clinicalHistoryService';
import type { BaseClinicalHistory, HelkimoIndex, ClinicalHistory } from '../types/clinicalHistory';
import { parseISO } from 'date-fns';

interface CreateClinicalHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  onHistoryCreated: () => void;
  editMode?: boolean;
  existingHistory?: ClinicalHistory | null;
}

const CreateClinicalHistoryDialog = ({
  open,
  onClose,
  patientId,
  patientName,
  onHistoryCreated,
  editMode = false,
  existingHistory = null,
}: CreateClinicalHistoryDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consultationDate, setConsultationDate] = useState<Date | null>(new Date());

  // Helkimo AI scores (0, 1, or 5)
  const [aiScores, setAiScores] = useState({
    symptomsA: 0,
    symptomsB: 0,
    symptomsC: 0,
    symptomsD: 0,
    symptomsE: 0,
  });

  // Helkimo DI scores (0, 1, or 5)
  const [diScores, setDiScores] = useState({
    mobilityImpairment: 0,
    tmjFunction: 0,
    musclePain: 0,
    tmjPain: 0,
    painOnMovement: 0,
  });

  const [formData, setFormData] = useState({
    chiefComplaint: '',
    currentIllness: '',
    primaryDiagnosis: '',
    secondaryDiagnosis: '',
    treatmentPlanDescription: '',
  });

  // Load existing data when in edit mode
  useEffect(() => {
    if (editMode && existingHistory && open) {
      // Load form data
      setFormData({
        chiefComplaint: existingHistory.chiefComplaint || '',
        currentIllness: existingHistory.currentIllness || '',
        primaryDiagnosis: existingHistory.diagnosis?.primary || '',
        secondaryDiagnosis: existingHistory.diagnosis?.secondary?.join(', ') || '',
        treatmentPlanDescription: existingHistory.treatmentPlan?.description || '',
      });

      // Load consultation date
      if (existingHistory.consultationDate) {
        setConsultationDate(parseISO(existingHistory.consultationDate));
      } else if (existingHistory.createdAt) {
        setConsultationDate(parseISO(existingHistory.createdAt));
      }

      // Load Helkimo AI scores
      if (existingHistory.helkimoIndex?.ai) {
        setAiScores({
          symptomsA: existingHistory.helkimoIndex.ai.symptomsA || 0,
          symptomsB: existingHistory.helkimoIndex.ai.symptomsB || 0,
          symptomsC: existingHistory.helkimoIndex.ai.symptomsC || 0,
          symptomsD: existingHistory.helkimoIndex.ai.symptomsD || 0,
          symptomsE: existingHistory.helkimoIndex.ai.symptomsE || 0,
        });
      }

      // Load Helkimo DI scores
      if (existingHistory.helkimoIndex?.di) {
        setDiScores({
          mobilityImpairment: existingHistory.helkimoIndex.di.mobilityImpairment || 0,
          tmjFunction: existingHistory.helkimoIndex.di.tmjFunction || 0,
          musclePain: existingHistory.helkimoIndex.di.musclePain || 0,
          tmjPain: existingHistory.helkimoIndex.di.tmjPain || 0,
          painOnMovement: existingHistory.helkimoIndex.di.painOnMovement || 0,
        });
      }
    } else if (!open) {
      // Reset form when dialog closes
      setFormData({
        chiefComplaint: '',
        currentIllness: '',
        primaryDiagnosis: '',
        secondaryDiagnosis: '',
        treatmentPlanDescription: '',
      });
      setAiScores({
        symptomsA: 0,
        symptomsB: 0,
        symptomsC: 0,
        symptomsD: 0,
        symptomsE: 0,
      });
      setDiScores({
        mobilityImpairment: 0,
        tmjFunction: 0,
        musclePain: 0,
        tmjPain: 0,
        painOnMovement: 0,
      });
      setConsultationDate(new Date());
    }
  }, [editMode, existingHistory, open]);

  // Calculate Helkimo totals and classifications
  const calculateHelkimo = () => {
    // AI calculation
    const aiTotal = Object.values(aiScores).reduce((sum, val) => sum + val, 0);
    let aiClassification: 'Ai0' | 'AiI' | 'AiII';
    if (aiTotal === 0) aiClassification = 'Ai0';
    else if (aiTotal >= 1 && aiTotal <= 9) aiClassification = 'AiI';
    else aiClassification = 'AiII';

    // DI calculation
    const diTotal = Object.values(diScores).reduce((sum, val) => sum + val, 0);
    let diClassification: 'Di0' | 'DiI' | 'DiII' | 'DiIII';
    if (diTotal === 0) diClassification = 'Di0';
    else if (diTotal >= 1 && diTotal <= 4) diClassification = 'DiI';
    else if (diTotal >= 5 && diTotal <= 9) diClassification = 'DiII';
    else diClassification = 'DiIII';

    return {
      ai: { ...aiScores, total: aiTotal, classification: aiClassification, score: aiTotal },
      di: { ...diScores, total: diTotal, classification: diClassification, score: diTotal },
    };
  };

  const helkimo = calculateHelkimo();

  const getHelkimoColor = (classification: string) => {
    if (classification.includes('0')) return 'success';
    if (classification.includes('I') && !classification.includes('II')) return 'info';
    if (classification.includes('II')) return 'warning';
    if (classification.includes('III')) return 'error';
    return 'default';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleAiScoreChange = (symptom: keyof typeof aiScores, value: number) => {
    setAiScores((prev) => ({ ...prev, [symptom]: value }));
  };

  const handleDiScoreChange = (factor: keyof typeof diScores, value: number) => {
    setDiScores((prev) => ({ ...prev, [factor]: value }));
  };

  const validate = (): boolean => {
    if (!formData.chiefComplaint.trim()) {
      setError('El motivo de consulta es obligatorio');
      return false;
    }
    if (!formData.primaryDiagnosis.trim()) {
      setError('El diagnóstico es obligatorio');
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
      const helkimoIndex = calculateHelkimo();

      const clinicalHistory: Partial<BaseClinicalHistory> = {
        patient: patientId,
        chiefComplaint: formData.chiefComplaint,
        currentIllness: formData.currentIllness || undefined,
        helkimoIndex: helkimoIndex as HelkimoIndex,
        diagnosis: {
          primary: formData.primaryDiagnosis,
          secondary: formData.secondaryDiagnosis
            ? formData.secondaryDiagnosis.split(',').map((d) => d.trim()).filter(Boolean)
            : undefined,
        },
        treatmentPlan: formData.treatmentPlanDescription
          ? {
              description: formData.treatmentPlanDescription,
              procedures: [],
            }
          : undefined,
        consultationDate: consultationDate ? format(consultationDate, 'yyyy-MM-dd') : undefined,
      };

      if (editMode && existingHistory) {
        // Update existing clinical history
        await clinicalHistoryService.update(existingHistory._id, clinicalHistory as BaseClinicalHistory);
      } else {
        // Create new clinical history
        await clinicalHistoryService.create(clinicalHistory as BaseClinicalHistory);
      }

      onHistoryCreated();
      onClose();
    } catch (err: any) {
      if (import.meta.env.DEV) console.error('[CreateClinicalHistoryDialog] Error creating clinical history:', err);
      setError(err.message || 'Error al crear historia clínica');
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-2">
            <LocalHospitalIcon className="text-blue-500" />
            <Box>
              <Typography variant="h6" className="font-semibold">
                {editMode ? 'Editar Visita' : 'Nueva Visita'}
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

      <DialogContent dividers sx={{ maxHeight: '70vh' }}>
        {error && (
          <Alert severity="error" className="mb-4" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha de Consulta"
                value={consultationDate}
                onChange={setConsultationDate}
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

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box className="flex gap-2 mt-2">
              <Chip
                label={`AI: ${helkimo.ai.classification} (${helkimo.ai.total})`}
                color={getHelkimoColor(helkimo.ai.classification)}
                size="small"
              />
              <Chip
                label={`DI: ${helkimo.di.classification} (${helkimo.di.total})`}
                color={getHelkimoColor(helkimo.di.classification)}
                size="small"
              />
            </Box>
          </Grid>

          {/* Anamnesis */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Anamnesis
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              label="Motivo de Consulta"
              value={formData.chiefComplaint}
              onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
              disabled={loading}
              multiline
              rows={2}
              placeholder="Ej: Dolor en ATM derecha al masticar"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Enfermedad Actual"
              value={formData.currentIllness}
              onChange={(e) => handleInputChange('currentIllness', e.target.value)}
              disabled={loading}
              multiline
              rows={3}
              placeholder="Historia de la enfermedad actual, evolución..."
            />
          </Grid>

          {/* Helkimo Index AI */}
          <Grid size={{ xs: 12 }}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" className="font-semibold">
                  Índice Anamnésico (AI) - Total: {helkimo.ai.total}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Síntomas A"
                      value={aiScores.symptomsA}
                      onChange={(e) => handleAiScoreChange('symptomsA', Number(e.target.value))}
                    >
                      <MenuItem value={0}>0 - Sin síntomas</MenuItem>
                      <MenuItem value={1}>1 - Leve</MenuItem>
                      <MenuItem value={5}>5 - Severo</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Síntomas B"
                      value={aiScores.symptomsB}
                      onChange={(e) => handleAiScoreChange('symptomsB', Number(e.target.value))}
                    >
                      <MenuItem value={0}>0 - Sin síntomas</MenuItem>
                      <MenuItem value={1}>1 - Leve</MenuItem>
                      <MenuItem value={5}>5 - Severo</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Síntomas C"
                      value={aiScores.symptomsC}
                      onChange={(e) => handleAiScoreChange('symptomsC', Number(e.target.value))}
                    >
                      <MenuItem value={0}>0 - Sin síntomas</MenuItem>
                      <MenuItem value={1}>1 - Leve</MenuItem>
                      <MenuItem value={5}>5 - Severo</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Síntomas D"
                      value={aiScores.symptomsD}
                      onChange={(e) => handleAiScoreChange('symptomsD', Number(e.target.value))}
                    >
                      <MenuItem value={0}>0 - Sin síntomas</MenuItem>
                      <MenuItem value={1}>1 - Leve</MenuItem>
                      <MenuItem value={5}>5 - Severo</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Síntomas E"
                      value={aiScores.symptomsE}
                      onChange={(e) => handleAiScoreChange('symptomsE', Number(e.target.value))}
                    >
                      <MenuItem value={0}>0 - Sin síntomas</MenuItem>
                      <MenuItem value={1}>1 - Leve</MenuItem>
                      <MenuItem value={5}>5 - Severo</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Helkimo Index DI */}
          <Grid size={{ xs: 12 }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" className="font-semibold">
                  Índice de Disfunción (DI) - Total: {helkimo.di.total}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Limitación Movilidad"
                      value={diScores.mobilityImpairment}
                      onChange={(e) => handleDiScoreChange('mobilityImpairment', Number(e.target.value))}
                    >
                      <MenuItem value={0}>0 - Sin limitación</MenuItem>
                      <MenuItem value={1}>1 - Leve</MenuItem>
                      <MenuItem value={5}>5 - Severa</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Función ATM"
                      value={diScores.tmjFunction}
                      onChange={(e) => handleDiScoreChange('tmjFunction', Number(e.target.value))}
                    >
                      <MenuItem value={0}>0 - Normal</MenuItem>
                      <MenuItem value={1}>1 - Leve alteración</MenuItem>
                      <MenuItem value={5}>5 - Severa alteración</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Dolor Muscular"
                      value={diScores.musclePain}
                      onChange={(e) => handleDiScoreChange('musclePain', Number(e.target.value))}
                    >
                      <MenuItem value={0}>0 - Sin dolor</MenuItem>
                      <MenuItem value={1}>1 - Leve</MenuItem>
                      <MenuItem value={5}>5 - Severo</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Dolor ATM"
                      value={diScores.tmjPain}
                      onChange={(e) => handleDiScoreChange('tmjPain', Number(e.target.value))}
                    >
                      <MenuItem value={0}>0 - Sin dolor</MenuItem>
                      <MenuItem value={1}>1 - Leve</MenuItem>
                      <MenuItem value={5}>5 - Severo</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Dolor al Movimiento"
                      value={diScores.painOnMovement}
                      onChange={(e) => handleDiScoreChange('painOnMovement', Number(e.target.value))}
                    >
                      <MenuItem value={0}>0 - Sin dolor</MenuItem>
                      <MenuItem value={1}>1 - Leve</MenuItem>
                      <MenuItem value={5}>5 - Severo</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Diagnosis */}
          <Grid size={{ xs: 12 }}>
            <Divider className="my-2" />
            <Typography variant="subtitle2" className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Diagnóstico
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              label="Diagnóstico Principal"
              value={formData.primaryDiagnosis}
              onChange={(e) => handleInputChange('primaryDiagnosis', e.target.value)}
              disabled={loading}
              placeholder="Ej: Disfunción temporomandibular bilateral"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Diagnósticos Secundarios (separados por coma)"
              value={formData.secondaryDiagnosis}
              onChange={(e) => handleInputChange('secondaryDiagnosis', e.target.value)}
              disabled={loading}
              placeholder="Ej: Bruxismo nocturno, Maloclusión clase II"
            />
          </Grid>

          {/* Treatment Plan */}
          <Grid size={{ xs: 12 }}>
            <Divider className="my-2" />
            <Typography variant="subtitle2" className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Plan de Tratamiento
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Descripción del Tratamiento"
              value={formData.treatmentPlanDescription}
              onChange={(e) => handleInputChange('treatmentPlanDescription', e.target.value)}
              disabled={loading}
              multiline
              rows={3}
              placeholder="Plan terapéutico propuesto..."
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
          {loading ? <CircularProgress size={24} /> : editMode ? 'Guardar Cambios' : 'Crear Visita'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateClinicalHistoryDialog;
