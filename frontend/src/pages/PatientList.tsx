// Task 4.1: PatientList page - List all patients with search functionality
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/animations/PageTransition';
import ScaleIn from '../components/animations/ScaleIn';
import CreatePatientDialog from '../components/CreatePatientDialog';
import { patientService } from '../services/patientService';
import type { Patient } from '../types/clinicalHistory';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch all patients
  const fetchPatients = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsRefreshing(true);
      }
      const data = await patientService.getAll();
      setPatients(data);
      setFilteredPatients(data);
      setError('');
    } catch (err: any) {
      if (import.meta.env.DEV) console.error('[PatientList] Error fetching patients:', err);
      setError(err.message || 'Error al cargar pacientes');
    } finally {
      if (showLoadingState) {
        setIsRefreshing(false);
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients(true);
  }, [fetchPatients]);

  // Filter patients based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const dni = patient.dni?.toLowerCase() || '';
      const phone = patient.phone.toLowerCase();
      const clinicNumber = patient.clinicNumber.toLowerCase();

      return (
        fullName.includes(query) ||
        dni.includes(query) ||
        phone.includes(query) ||
        clinicNumber.includes(query)
      );
    });

    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  const handlePatientClick = (patientId: string) => {
    navigate(`/pacientes/${patientId}`);
  };

  const handleCreatePatient = () => {
    setOpenCreateDialog(true);
  };

  const handlePatientCreated = async () => {
    await fetchPatients(true);
    setOpenCreateDialog(false);
  };

  const handleManualRefresh = () => {
    fetchPatients(true);
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <PageTransition>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <Typography variant="h4" className="font-bold mb-1" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#1565c0' }}>
              Pacientes
            </Typography>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''} activo{filteredPatients.length !== 1 ? 's' : ''}
            </Typography>
          </div>

          <Box className="flex items-center gap-2">
            {/* Refresh button */}
            <Tooltip title="Actualizar lista">
              <span>
                <IconButton
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400"
                  size="small"
                >
                  <motion.div
                    animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                    transition={{
                      duration: 1,
                      repeat: isRefreshing ? Infinity : 0,
                      ease: 'linear'
                    }}
                  >
                    <RefreshIcon />
                  </motion.div>
                </IconButton>
              </span>
            </Tooltip>

            {/* Create patient button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreatePatient}
              className="bg-blue-500 hover:bg-blue-600 transition-all duration-200"
            >
              Nuevo Paciente
            </Button>
          </Box>
        </Box>

        {/* Search bar */}
        <ScaleIn delay={0.1}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, DNI, teléfono o historia clínica..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            className="bg-white dark:bg-gray-800"
          />
        </ScaleIn>
      </motion.div>

      {/* Error message */}
      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {filteredPatients.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="text-center py-12">
            <CardContent>
              <PersonIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {searchQuery ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {searchQuery
                  ? 'Intenta con otro término de búsqueda'
                  : 'Comienza agregando tu primer paciente'}
              </Typography>
              {!searchQuery && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreatePatient}
                  className="mt-4"
                >
                  Agregar Paciente
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Patient list */}
      <AnimatePresence mode="wait">
        {filteredPatients.length > 0 && (
          <motion.div
            key="patient-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredPatients.map((patient, index) => (
              <ScaleIn key={patient._id} delay={index * 0.05}>
                <Card
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                  onClick={() => handlePatientClick(patient._id)}
                >
                  <CardContent className="p-4">
                    {/* Clinic number badge */}
                    <Box className="flex justify-between items-start mb-3">
                      <Chip
                        label={patient.clinicNumber}
                        size="small"
                        className="bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-mono font-semibold"
                      />
                      {patient.age && (
                        <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                          {patient.age} años
                        </Typography>
                      )}
                    </Box>

                    {/* Patient name */}
                    <Typography variant="h6" className="font-semibold mb-2 truncate">
                      {patient.firstName} {patient.lastName}
                    </Typography>

                    {/* Contact info */}
                    <Box className="space-y-1">
                      {patient.dni && (
                        <Box className="flex items-center gap-2 text-sm">
                          <BadgeIcon sx={{ color: 'text.secondary' }} fontSize="small" />
                          <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                            DNI: {patient.dni}
                          </Typography>
                        </Box>
                      )}
                      <Box className="flex items-center gap-2 text-sm">
                        <PhoneIcon sx={{ color: 'text.secondary' }} fontSize="small" />
                        <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                          {patient.phone}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Social work */}
                    {patient.socialWork && (
                      <Chip
                        label={patient.socialWork}
                        size="small"
                        className="mt-3 bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                      />
                    )}

                    {/* Last update */}
                    <Typography variant="caption" className="block mt-2 text-gray-500 dark:text-gray-400">
                      Actualizado {formatDistanceToNow(new Date(patient.updatedAt), { addSuffix: true, locale: es })}
                    </Typography>
                  </CardContent>
                </Card>
              </ScaleIn>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Patient Dialog */}
      <CreatePatientDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onPatientCreated={handlePatientCreated}
      />
    </PageTransition>
  );
};

export default PatientList;
