// Task 4.4: ClinicalHistoryForm - Full ATM/Bruxism clinical history form
import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  MenuItem,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  LocalHospital as LocalHospitalIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import HelkimoCalculator from './HelkimoCalculator';
import type { BaseClinicalHistory, HelkimoIndex, Diagnosis } from '../types/clinicalHistory';

interface ClinicalHistoryFormProps {
  patientId: string;
  appointmentId?: string;
  onSubmit: (data: BaseClinicalHistory) => Promise<void>;
  onCancel: () => void;
}

const ClinicalHistoryForm = ({ patientId, appointmentId, onSubmit, onCancel }: ClinicalHistoryFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedAccordion, setExpandedAccordion] = useState<string>('anamnesis');

  // Form state - Anamnesis
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [currentIllness, setCurrentIllness] = useState('');

  // Helkimo Index
  const [helkimoIndex, setHelkimoIndex] = useState<HelkimoIndex>({
    ai: {
      symptomsA: 0,
      symptomsB: 0,
      symptomsC: 0,
      symptomsD: 0,
      symptomsE: 0,
      total: 0,
      classification: 'Ai0',
    },
    di: {
      mobilityImpairment: 0,
      tmjFunction: 0,
      musclePain: 0,
      tmjPain: 0,
      painOnMovement: 0,
      total: 0,
      classification: 'Di0',
    },
  });

  // Clinical Examination - TMJ
  const [painLocation, setPainLocation] = useState('');
  const [painIntensity, setPainIntensity] = useState<number>(0);
  const [painCharacter, setPainCharacter] = useState('');
  const [painFrequency, setPainFrequency] = useState('');

  // Clinical Examination - Occlusion
  const [molarClass, setMolarClass] = useState<'I' | 'II' | 'III'>('I');
  const [canineClass, setCanineClass] = useState<'I' | 'II' | 'III'>('I');
  const [overbite, setOverbite] = useState('');
  const [overjet, setOverjet] = useState('');
  const [crossbite, setCrossbite] = useState(false);
  const [openBite, setOpenBite] = useState(false);

  // Clinical Examination - TMJ Details
  const [leftJoint, setLeftJoint] = useState('');
  const [rightJoint, setRightJoint] = useState('');
  const [sounds, setSounds] = useState('');
  const [tmjPain, setTmjPain] = useState('');

  // Clinical Examination - Muscular Palpation
  const [masseter, setMasseter] = useState('');
  const [temporal, setTemporal] = useState('');
  const [sternocleidomastoid, setSternocleidomastoid] = useState('');
  const [trapezius, setTrapezius] = useState('');

  // Clinical Examination - Extraoral
  const [facialAsymmetry, setFacialAsymmetry] = useState(false);
  const [musclePalpation, setMusclePalpation] = useState('');
  const [lymphNodes, setLymphNodes] = useState('');

  // Clinical Examination - Intraoral
  const [mucosa, setMucosa] = useState('');
  const [tongue, setTongue] = useState('');
  const [palate, setPalate] = useState('');
  const [floor, setFloor] = useState('');

  // Diagnosis
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [secondaryDiagnosis, setSecondaryDiagnosis] = useState<string[]>([]);
  const [icd10, setIcd10] = useState('');
  const [secondaryDiagnosisInput, setSecondaryDiagnosisInput] = useState('');

  // Treatment Plan
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [totalCost, setTotalCost] = useState<number | ''>('');

  // Symptoms tracking
  const [symptomsOther, setSymptomsOther] = useState('');
  const soundsList: string[] = [];
  const limitationsList: string[] = [];

  const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : '');
  };

  const handleHelkimoCalculate = (result: HelkimoIndex) => {
    setHelkimoIndex(result);
  };

  const handleAddSecondaryDiagnosis = () => {
    if (secondaryDiagnosisInput.trim() && !secondaryDiagnosis.includes(secondaryDiagnosisInput.trim())) {
      setSecondaryDiagnosis([...secondaryDiagnosis, secondaryDiagnosisInput.trim()]);
      setSecondaryDiagnosisInput('');
    }
  };

  const handleRemoveSecondaryDiagnosis = (diagnosisToRemove: string) => {
    setSecondaryDiagnosis(secondaryDiagnosis.filter(d => d !== diagnosisToRemove));
  };

  const validateForm = (): string | null => {
    if (!chiefComplaint.trim()) {
      return 'El motivo de consulta es obligatorio';
    }
    if (!primaryDiagnosis.trim()) {
      return 'El diagnóstico principal es obligatorio';
    }
    if (painIntensity < 0 || painIntensity > 10) {
      return 'La intensidad del dolor debe estar entre 0 y 10';
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
      const diagnosis: Diagnosis = {
        primary: primaryDiagnosis,
        secondary: secondaryDiagnosis.length > 0 ? secondaryDiagnosis : undefined,
        icd10: icd10 || undefined,
      };

      const formData: BaseClinicalHistory = {
        patient: patientId,
        appointment: appointmentId,
        chiefComplaint,
        currentIllness: currentIllness || undefined,
        helkimoIndex,
        clinicalExamination: {
          extraoral: {
            facialAsymmetry,
            musclePalpation: musclePalpation || undefined,
            lymphNodes: lymphNodes || undefined,
          },
          intraoral: {
            mucosa: mucosa || undefined,
            tongue: tongue || undefined,
            palate: palate || undefined,
            floor: floor || undefined,
          },
          tmj: {
            leftJoint: leftJoint || undefined,
            rightJoint: rightJoint || undefined,
            sounds: sounds || undefined,
            pain: tmjPain || undefined,
          },
          muscularPalpation: {
            masseter: masseter || undefined,
            temporal: temporal || undefined,
            sternocleidomastoid: sternocleidomastoid || undefined,
            trapezius: trapezius || undefined,
          },
          occlusion: {
            molarClass,
            canineClass,
            overbite: overbite || undefined,
            overjet: overjet || undefined,
            crossbite,
            openBite,
          },
        },
        symptoms: {
          pain: painLocation || painCharacter || painFrequency
            ? {
                location: painLocation || undefined,
                intensity: painIntensity,
                character: painCharacter || undefined,
                frequency: painFrequency || undefined,
              }
            : undefined,
          sounds: soundsList.length > 0 ? soundsList : undefined,
          limitations: limitationsList.length > 0 ? limitationsList : undefined,
          other: symptomsOther || undefined,
        },
        diagnosis,
        treatmentPlan: treatmentNotes || estimatedDuration || totalCost
          ? {
              procedures: [],
              estimatedDuration: estimatedDuration || undefined,
              totalCost: totalCost ? Number(totalCost) : undefined,
              notes: treatmentNotes || undefined,
            }
          : undefined,
      };

      await onSubmit(formData);
    } catch (err: any) {
      console.error('[ClinicalHistoryForm] Error submitting form:', err);
      setError(err.message || 'Error al guardar la historia clínica');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className="max-w-5xl mx-auto">
      {/* Header */}
      <Box className="flex items-center gap-3 mb-6">
        <LocalHospitalIcon className="text-blue-500 size-8" />
        <Typography variant="h5" className="font-bold">
          Nueva Historia Clínica ATM/Bruxismo
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Anamnesis */}
      <Accordion 
        expanded={expandedAccordion === 'anamnesis'} 
        onChange={handleAccordionChange('anamnesis')}
        className="mb-3"
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className="font-semibold">1. Anamnesis *</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                fullWidth
                multiline
                rows={3}
                label="Motivo de consulta"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="¿Por qué motivo consulta el paciente?"
                helperText="Descripción breve del motivo principal de la consulta"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Enfermedad actual (opcional)"
                value={currentIllness}
                onChange={(e) => setCurrentIllness(e.target.value)}
                placeholder="Historia de la enfermedad actual, cronología de síntomas..."
                helperText="Detalles sobre la evolución de los síntomas"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Helkimo Index */}
      <Accordion 
        expanded={expandedAccordion === 'helkimo'} 
        onChange={handleAccordionChange('helkimo')}
        className="mb-3"
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box className="flex items-center justify-between w-full pr-4">
            <Typography className="font-semibold">2. Índice de Helkimo *</Typography>
            <Box className="flex gap-2">
              <Chip size="small" label={`AI: ${helkimoIndex.ai.classification}`} color="primary" />
              <Chip size="small" label={`DI: ${helkimoIndex.di.classification}`} color="secondary" />
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <HelkimoCalculator 
            onCalculate={handleHelkimoCalculate} 
            initialValues={helkimoIndex}
            embedded
          />
        </AccordionDetails>
      </Accordion>

      {/* Symptoms */}
      <Accordion 
        expanded={expandedAccordion === 'symptoms'} 
        onChange={handleAccordionChange('symptoms')}
        className="mb-3"
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className="font-semibold">3. Síntomas</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" className="font-semibold mb-2">
                Dolor
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Localización del dolor"
                value={painLocation}
                onChange={(e) => setPainLocation(e.target.value)}
                placeholder="Ej: ATM bilateral, músculos temporales..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Intensidad (0-10)"
                value={painIntensity}
                onChange={(e) => setPainIntensity(Number(e.target.value))}
                inputProps={{ min: 0, max: 10, step: 1 }}
                helperText="Escala EVA: 0 = sin dolor, 10 = dolor máximo"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Carácter del dolor"
                value={painCharacter}
                onChange={(e) => setPainCharacter(e.target.value)}
                placeholder="Ej: punzante, sordo, pulsátil..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Frecuencia"
                value={painFrequency}
                onChange={(e) => setPainFrequency(e.target.value)}
                placeholder="Ej: constante, intermitente, matutino..."
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider className="my-2" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Otros síntomas"
                value={symptomsOther}
                onChange={(e) => setSymptomsOther(e.target.value)}
                placeholder="Cefaleas, bruxismo, apretamiento, parestesias..."
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Clinical Examination */}
      <Accordion 
        expanded={expandedAccordion === 'examination'} 
        onChange={handleAccordionChange('examination')}
        className="mb-3"
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className="font-semibold">4. Examen Clínico</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Extraoral */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                Examen Extraoral
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                label="Asimetría facial"
                value={facialAsymmetry ? 'yes' : 'no'}
                onChange={(e) => setFacialAsymmetry(e.target.value === 'yes')}
              >
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="yes">Sí</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label="Palpación muscular"
                value={musclePalpation}
                onChange={(e) => setMusclePalpation(e.target.value)}
                placeholder="Hallazgos en músculos faciales..."
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Ganglios linfáticos"
                value={lymphNodes}
                onChange={(e) => setLymphNodes(e.target.value)}
                placeholder="Palpación de cadenas ganglionares..."
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>

            {/* Intraoral */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                Examen Intraoral
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Mucosa"
                value={mucosa}
                onChange={(e) => setMucosa(e.target.value)}
                placeholder="Estado de mucosa oral..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Lengua"
                value={tongue}
                onChange={(e) => setTongue(e.target.value)}
                placeholder="Indentaciones, movilidad..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Paladar"
                value={palate}
                onChange={(e) => setPalate(e.target.value)}
                placeholder="Torus, forma..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Piso de boca"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="Hallazgos..."
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>

            {/* TMJ Examination */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                Articulación Temporomandibular (ATM)
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Articulación izquierda"
                value={leftJoint}
                onChange={(e) => setLeftJoint(e.target.value)}
                placeholder="Palpación, sensibilidad..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Articulación derecha"
                value={rightJoint}
                onChange={(e) => setRightJoint(e.target.value)}
                placeholder="Palpación, sensibilidad..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Ruidos articulares"
                value={sounds}
                onChange={(e) => setSounds(e.target.value)}
                placeholder="Clicks, crepitación..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Dolor articular"
                value={tmjPain}
                onChange={(e) => setTmjPain(e.target.value)}
                placeholder="Localización, intensidad..."
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>

            {/* Muscular Palpation */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                Palpación Muscular
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Masetero"
                value={masseter}
                onChange={(e) => setMasseter(e.target.value)}
                placeholder="Sensibilidad, puntos gatillo..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Temporal"
                value={temporal}
                onChange={(e) => setTemporal(e.target.value)}
                placeholder="Sensibilidad, puntos gatillo..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Esternocleidomastoideo"
                value={sternocleidomastoid}
                onChange={(e) => setSternocleidomastoid(e.target.value)}
                placeholder="Sensibilidad..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Trapecio"
                value={trapezius}
                onChange={(e) => setTrapezius(e.target.value)}
                placeholder="Sensibilidad..."
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>

            {/* Occlusion */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                Oclusión
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Clase molar"
                value={molarClass}
                onChange={(e) => setMolarClass(e.target.value as 'I' | 'II' | 'III')}
              >
                <MenuItem value="I">Clase I</MenuItem>
                <MenuItem value="II">Clase II</MenuItem>
                <MenuItem value="III">Clase III</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Clase canina"
                value={canineClass}
                onChange={(e) => setCanineClass(e.target.value as 'I' | 'II' | 'III')}
              >
                <MenuItem value="I">Clase I</MenuItem>
                <MenuItem value="II">Clase II</MenuItem>
                <MenuItem value="III">Clase III</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Overbite (mm)"
                value={overbite}
                onChange={(e) => setOverbite(e.target.value)}
                placeholder="Ej: 2mm"
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Overjet (mm)"
                value={overjet}
                onChange={(e) => setOverjet(e.target.value)}
                placeholder="Ej: 3mm"
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Mordida cruzada"
                value={crossbite ? 'yes' : 'no'}
                onChange={(e) => setCrossbite(e.target.value === 'yes')}
              >
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="yes">Sí</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Mordida abierta"
                value={openBite ? 'yes' : 'no'}
                onChange={(e) => setOpenBite(e.target.value === 'yes')}
              >
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="yes">Sí</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Diagnosis */}
      <Accordion 
        expanded={expandedAccordion === 'diagnosis'} 
        onChange={handleAccordionChange('diagnosis')}
        className="mb-3"
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className="font-semibold">5. Diagnóstico *</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                fullWidth
                label="Diagnóstico principal"
                value={primaryDiagnosis}
                onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                placeholder="Ej: Trastorno temporomandibular con dolor miofascial"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label="Diagnósticos secundarios"
                value={secondaryDiagnosisInput}
                onChange={(e) => setSecondaryDiagnosisInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSecondaryDiagnosis();
                  }
                }}
                placeholder="Agregar diagnóstico secundario (Enter para agregar)"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Button 
                fullWidth 
                variant="outlined" 
                onClick={handleAddSecondaryDiagnosis}
                className="h-full"
              >
                Agregar
              </Button>
            </Grid>
            {secondaryDiagnosis.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Box className="flex flex-wrap gap-2">
                  {secondaryDiagnosis.map((diagnosis, index) => (
                    <Chip
                      key={index}
                      label={diagnosis}
                      onDelete={() => handleRemoveSecondaryDiagnosis(diagnosis)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Código CIE-10 (opcional)"
                value={icd10}
                onChange={(e) => setIcd10(e.target.value)}
                placeholder="Ej: M79.1, K07.6"
                helperText="Código de Clasificación Internacional de Enfermedades"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Treatment Plan */}
      <Accordion 
        expanded={expandedAccordion === 'treatment'} 
        onChange={handleAccordionChange('treatment')}
        className="mb-3"
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className="font-semibold">6. Plan de Tratamiento</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notas del plan de tratamiento"
                value={treatmentNotes}
                onChange={(e) => setTreatmentNotes(e.target.value)}
                placeholder="Descripción del plan terapéutico: placa de relajación, fisioterapia, medicación..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Duración estimada"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="Ej: 3 meses, 6 sesiones..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Costo total estimado"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value ? Number(e.target.value) : '')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                placeholder="0"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

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
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {loading ? 'Guardando...' : 'Guardar Historia Clínica'}
        </Button>
      </Box>
    </Box>
  );
};

export default ClinicalHistoryForm;
