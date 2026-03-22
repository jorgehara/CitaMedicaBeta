// Task 4.6: HelkimoCalculator - Visual Helkimo Index calculator
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import { Calculate as CalculateIcon } from '@mui/icons-material';
import type { HelkimoIndex } from '../types/clinicalHistory';

interface HelkimoCalculatorProps {
  onCalculate?: (result: HelkimoIndex) => void;
  initialValues?: Partial<HelkimoIndex>;
  embedded?: boolean;
}

const HelkimoCalculator = ({ onCalculate, initialValues, embedded = false }: HelkimoCalculatorProps) => {
  // Anamnestic Index (AI) - Symptoms
  const [symptomsA, setSymptomsA] = useState(initialValues?.ai?.symptomsA ?? 0);
  const [symptomsB, setSymptomsB] = useState(initialValues?.ai?.symptomsB ?? 0);
  const [symptomsC, setSymptomsC] = useState(initialValues?.ai?.symptomsC ?? 0);
  const [symptomsD, setSymptomsD] = useState(initialValues?.ai?.symptomsD ?? 0);
  const [symptomsE, setSymptomsE] = useState(initialValues?.ai?.symptomsE ?? 0);

  // Dysfunction Index (DI) - Clinical findings
  const [mobilityImpairment, setMobilityImpairment] = useState(initialValues?.di?.mobilityImpairment ?? 0);
  const [tmjFunction, setTmjFunction] = useState(initialValues?.di?.tmjFunction ?? 0);
  const [musclePain, setMusclePain] = useState(initialValues?.di?.musclePain ?? 0);
  const [tmjPain, setTmjPain] = useState(initialValues?.di?.tmjPain ?? 0);
  const [painOnMovement, setPainOnMovement] = useState(initialValues?.di?.painOnMovement ?? 0);

  // Calculate totals and classifications
  const calculateAI = (): { total: number; classification: 'Ai0' | 'AiI' | 'AiII' } => {
    const total = symptomsA + symptomsB + symptomsC + symptomsD + symptomsE;
    let classification: 'Ai0' | 'AiI' | 'AiII';
    
    if (total === 0) {
      classification = 'Ai0';
    } else if (total >= 1 && total <= 9) {
      classification = 'AiI';
    } else {
      classification = 'AiII';
    }
    
    return { total, classification };
  };

  const calculateDI = (): { total: number; classification: 'Di0' | 'DiI' | 'DiII' | 'DiIII' } => {
    const total = mobilityImpairment + tmjFunction + musclePain + tmjPain + painOnMovement;
    let classification: 'Di0' | 'DiI' | 'DiII' | 'DiIII';
    
    if (total === 0) {
      classification = 'Di0';
    } else if (total >= 1 && total <= 4) {
      classification = 'DiI';
    } else if (total >= 5 && total <= 9) {
      classification = 'DiII';
    } else {
      classification = 'DiIII';
    }
    
    return { total, classification };
  };

  const aiResult = calculateAI();
  const diResult = calculateDI();

  // Determine overall severity
  const getSeverity = (): { level: string; color: string; label: string } => {
    if (aiResult.classification === 'Ai0' && diResult.classification === 'Di0') {
      return { level: 'none', color: 'success', label: 'Sin disfunción' };
    } else if (aiResult.classification === 'AiI' && diResult.classification === 'DiI') {
      return { level: 'mild', color: 'warning', label: 'Disfunción leve' };
    } else if (aiResult.classification === 'AiII' || diResult.classification === 'DiII') {
      return { level: 'moderate', color: 'orange', label: 'Disfunción moderada' };
    } else {
      return { level: 'severe', color: 'error', label: 'Disfunción severa' };
    }
  };

  const severity = getSeverity();

  // Notify parent component when values change
  useEffect(() => {
    if (onCalculate) {
      const result: HelkimoIndex = {
        ai: {
          symptomsA,
          symptomsB,
          symptomsC,
          symptomsD,
          symptomsE,
          total: aiResult.total,
          classification: aiResult.classification,
        },
        di: {
          mobilityImpairment,
          tmjFunction,
          musclePain,
          tmjPain,
          painOnMovement,
          total: diResult.total,
          classification: diResult.classification,
        },
      };
      onCalculate(result);
    }
  }, [symptomsA, symptomsB, symptomsC, symptomsD, symptomsE, mobilityImpairment, tmjFunction, musclePain, tmjPain, painOnMovement]);

  const symptomOptions = [
    { value: 0, label: '0 - Sin síntomas' },
    { value: 1, label: '1 - Síntomas leves' },
    { value: 5, label: '5 - Síntomas severos' },
  ];

  const dysfunctionOptions = [
    { value: 0, label: '0 - Normal' },
    { value: 1, label: '1 - Leve' },
    { value: 5, label: '5 - Severo' },
  ];

  const content = (
    <Box>
      <Box className="flex items-center gap-2 mb-4">
        <CalculateIcon className={embedded ? 'text-blue-500 size-5' : 'text-blue-500'} />
        <Typography variant={embedded ? 'subtitle1' : 'h6'} className="font-semibold">
          Índice de Helkimo
        </Typography>
      </Box>

      {/* Anamnestic Index (AI) */}
      <Box className="mb-6">
        <Typography variant="subtitle2" className="font-semibold mb-3 text-blue-700 dark:text-blue-400">
          Índice Anamnésico (AI) - Síntomas reportados por el paciente
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="A. Síntomas de ATM"
              value={symptomsA}
              onChange={(e) => setSymptomsA(Number(e.target.value))}
              helperText="Ruidos, sensación de cansancio, rigidez al despertar"
            >
              {symptomOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="B. Dificultad de movimiento mandibular"
              value={symptomsB}
              onChange={(e) => setSymptomsB(Number(e.target.value))}
              helperText="Limitación en apertura, lateralidad o protrusión"
            >
              {symptomOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="C. Luxación de ATM"
              value={symptomsC}
              onChange={(e) => setSymptomsC(Number(e.target.value))}
              helperText="Desplazamiento, bloqueo o subluxación"
            >
              {symptomOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="D. Dolor en región de ATM"
              value={symptomsD}
              onChange={(e) => setSymptomsD(Number(e.target.value))}
              helperText="Dolor espontáneo o al movimiento"
            >
              {symptomOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="E. Dolor en músculos masticatorios"
              value={symptomsE}
              onChange={(e) => setSymptomsE(Number(e.target.value))}
              helperText="Dolor muscular al masticar o en reposo"
            >
              {symptomOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <Box className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Typography variant="body2" className="font-semibold">
            Total AI: {aiResult.total} puntos - Clasificación: {aiResult.classification}
          </Typography>
        </Box>
      </Box>

      <Divider className="my-6" />

      {/* Dysfunction Index (DI) */}
      <Box className="mb-6">
        <Typography variant="subtitle2" className="font-semibold mb-3 text-purple-700 dark:text-purple-400">
          Índice de Disfunción (DI) - Hallazgos clínicos
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Impedimento de movilidad"
              value={mobilityImpairment}
              onChange={(e) => setMobilityImpairment(Number(e.target.value))}
              helperText="Rango de movimiento mandibular (apertura < 40mm = leve, < 30mm = severo)"
            >
              {dysfunctionOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Función de la ATM"
              value={tmjFunction}
              onChange={(e) => setTmjFunction(Number(e.target.value))}
              helperText="Clicks, crepitación, luxación durante movimiento"
            >
              {dysfunctionOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Dolor muscular a la palpación"
              value={musclePain}
              onChange={(e) => setMusclePain(Number(e.target.value))}
              helperText="Dolor en masetero, temporal, pterigoideos"
            >
              {dysfunctionOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Dolor en ATM a la palpación"
              value={tmjPain}
              onChange={(e) => setTmjPain(Number(e.target.value))}
              helperText="Dolor al palpar región preauricular o polo lateral del cóndilo"
            >
              {dysfunctionOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Dolor al movimiento mandibular"
              value={painOnMovement}
              onChange={(e) => setPainOnMovement(Number(e.target.value))}
              helperText="Dolor durante apertura, lateralidad o protrusión"
            >
              {dysfunctionOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <Box className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <Typography variant="body2" className="font-semibold">
            Total DI: {diResult.total} puntos - Clasificación: {diResult.classification}
          </Typography>
        </Box>
      </Box>

      <Divider className="my-6" />

      {/* Overall Result */}
      <Box className={`p-4 rounded-lg bg-${severity.level === 'none' ? 'green' : severity.level === 'mild' ? 'yellow' : severity.level === 'moderate' ? 'orange' : 'red'}-50 dark:bg-${severity.level === 'none' ? 'green' : severity.level === 'mild' ? 'yellow' : severity.level === 'moderate' ? 'orange' : 'red'}-900/20`}>
        <Typography variant="subtitle1" className="font-bold mb-2">
          Resultado General
        </Typography>
        <Box className="flex flex-wrap gap-2">
          <Chip 
            label={`AI: ${aiResult.classification}`}
            color={severity.color as any}
            size="small"
          />
          <Chip 
            label={`DI: ${diResult.classification}`}
            color={severity.color as any}
            size="small"
          />
          <Chip 
            label={severity.label}
            color={severity.color as any}
            variant="filled"
          />
        </Box>
        <Typography variant="caption" className="mt-2 block text-gray-600 dark:text-gray-400">
          {severity.level === 'none' && 'No se observan signos ni síntomas de disfunción temporomandibular'}
          {severity.level === 'mild' && 'Disfunción leve con síntomas ocasionales y hallazgos clínicos mínimos'}
          {severity.level === 'moderate' && 'Disfunción moderada que requiere tratamiento y seguimiento'}
          {severity.level === 'severe' && 'Disfunción severa que requiere intervención especializada'}
        </Typography>
      </Box>
    </Box>
  );

  if (embedded) {
    return content;
  }

  return (
    <Card className="shadow-md">
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

export default HelkimoCalculator;
