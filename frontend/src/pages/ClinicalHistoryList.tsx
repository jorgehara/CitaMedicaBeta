// ClinicalHistoryList page - List all clinical histories with CRUD functionality
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocalHospital as LocalHospitalIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/animations/PageTransition';
import ScaleIn from '../components/animations/ScaleIn';
import CreatePatientDialog from '../components/CreatePatientDialog';
import { clinicalHistoryService } from '../services/clinicalHistoryService';
import { patientService } from '../services/patientService';
import type { ClinicalHistory, Patient } from '../types/clinicalHistory';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClinicalHistoryWithPatient extends ClinicalHistory {
  patientData?: {
    firstName: string;
    lastName: string;
    clinicNumber: string;
    phone: string;
  };
}

const ClinicalHistoryList = () => {
  const navigate = useNavigate();
  const [histories, setHistories] = useState<ClinicalHistoryWithPatient[]>([]);
  const [filteredHistories, setFilteredHistories] = useState<ClinicalHistoryWithPatient[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPatient, setFilterPatient] = useState('');
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dialogs state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createPatientDialogOpen, setCreatePatientDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<ClinicalHistoryWithPatient | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    patient: '',
    chiefComplaint: '',
    diagnosis: {
      primary: '',
      secondary: [] as string[],
    },
    treatmentPlan: {
      description: '',
    },
  });

  // Fetch all clinical histories
  const fetchHistories = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsRefreshing(true);
      }
      const data = await clinicalHistoryService.getAllWithPatient();
      
      // Add patient data to each history
      const historiesWithPatient = data.map((history: ClinicalHistory) => {
        const patientData = history.patient as unknown as { firstName: string; lastName: string; clinicNumber: string; phone: string };
        return {
          ...history,
          patientData: patientData ? {
            firstName: patientData.firstName || '',
            lastName: patientData.lastName || '',
            clinicNumber: patientData.clinicNumber || '',
            phone: patientData.phone || '',
          } : undefined,
        };
      });
      
      setHistories(historiesWithPatient);
      setFilteredHistories(historiesWithPatient);
      setError('');
    } catch (err: any) {
      console.error('[ClinicalHistoryList] Error fetching histories:', err);
      setError(err.message || 'Error al cargar historias clínicas');
    } finally {
      if (showLoadingState) {
        setIsRefreshing(false);
      }
      setLoading(false);
    }
  }, []);

  // Fetch all patients for the create form
  const fetchPatients = useCallback(async () => {
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (err: any) {
      console.error('[ClinicalHistoryList] Error fetching patients:', err);
    }
  }, []);

  useEffect(() => {
    fetchHistories(true);
    fetchPatients();
  }, [fetchHistories, fetchPatients]);

  // Filter histories based on search query and patient filter
  useEffect(() => {
    let filtered = [...histories];

    // Filter by patient
    if (filterPatient) {
      filtered = filtered.filter(h => h.patient === filterPatient);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(h => {
        const patientName = h.patientData 
          ? `${h.patientData.firstName} ${h.patientData.lastName}`.toLowerCase()
          : '';
        const clinicNumber = h.patientData?.clinicNumber?.toLowerCase() || '';
        const chiefComplaint = h.chiefComplaint?.toLowerCase() || '';
        const diagnosis = h.diagnosis?.primary?.toLowerCase() || '';
        const phone = h.patientData?.phone?.toLowerCase() || '';

        return (
          patientName.includes(query) ||
          clinicNumber.includes(query) ||
          chiefComplaint.includes(query) ||
          diagnosis.includes(query) ||
          phone.includes(query)
        );
      });
    }

    setFilteredHistories(filtered);
  }, [searchQuery, filterPatient, histories]);

  const handleRefresh = () => {
    fetchHistories(true);
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      patient: '',
      chiefComplaint: '',
      diagnosis: { primary: '', secondary: [] },
      treatmentPlan: { description: '' },
    });
    setCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (history: ClinicalHistoryWithPatient) => {
    setSelectedHistory(history);
    setFormData({
      patient: history.patient,
      chiefComplaint: history.chiefComplaint,
      diagnosis: {
        primary: history.diagnosis?.primary || '',
        secondary: history.diagnosis?.secondary || [],
      },
      treatmentPlan: {
        description: history.treatmentPlan?.notes || history.treatmentPlan?.procedures?.[0]?.name || '',
      },
    });
    setEditDialogOpen(true);
  };

  const handleOpenViewDialog = (history: ClinicalHistoryWithPatient) => {
    setSelectedHistory(history);
    setViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (history: ClinicalHistoryWithPatient) => {
    setSelectedHistory(history);
    setDeleteDialogOpen(true);
  };

  const handleCreateHistory = async () => {
    setSaving(true);
    setError('');

    try {
      await clinicalHistoryService.create({
        patient: formData.patient,
        chiefComplaint: formData.chiefComplaint,
        diagnosis: {
          primary: formData.diagnosis.primary,
          secondary: formData.diagnosis.secondary,
        },
        treatmentPlan: {
          notes: formData.treatmentPlan.description,
          procedures: [],
        },
      });
      setCreateDialogOpen(false);
      await fetchHistories(true);
    } catch (err: any) {
      console.error('[ClinicalHistoryList] Error creating history:', err);
      setError(err.message || 'Error al crear historia clínica');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateHistory = async () => {
    if (!selectedHistory) return;
    
    setSaving(true);
    setError('');

    try {
      await clinicalHistoryService.update(selectedHistory._id, {
        chiefComplaint: formData.chiefComplaint,
        diagnosis: {
          primary: formData.diagnosis.primary,
          secondary: formData.diagnosis.secondary,
        },
        treatmentPlan: {
          notes: formData.treatmentPlan.description,
          procedures: selectedHistory.treatmentPlan?.procedures || [],
        },
      });
      setEditDialogOpen(false);
      await fetchHistories(true);
    } catch (err: any) {
      console.error('[ClinicalHistoryList] Error updating history:', err);
      setError(err.message || 'Error al actualizar historia clínica');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (!selectedHistory) return;

    setSaving(true);
    setError('');

    try {
      await clinicalHistoryService.delete(selectedHistory._id);
      setDeleteDialogOpen(false);
      await fetchHistories(true);
    } catch (err: any) {
      console.error('[ClinicalHistoryList] Error deleting history:', err);
      setError(err.message || 'Error al eliminar historia clínica');
    } finally {
      setSaving(false);
    }
  };

  const handlePatientClick = (patientId: string) => {
    navigate(`/pacientes/${patientId}`);
  };

  const getHelkimoColor = (classification: string) => {
    if (classification === 'Ai0' || classification === 'Di0') return 'success';
    if (classification === 'AiI' || classification === 'DiI') return 'info';
    if (classification === 'AiII' || classification === 'DiII') return 'warning';
    if (classification === 'DiIII') return 'error';
    return 'default';
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
              Historias Clínicas
            </Typography>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              {filteredHistories.length} historia{filteredHistories.length !== 1 ? 's' : ''} clinica{filteredHistories.length !== 1 ? 's' : ''}
            </Typography>
          </div>

          <Box className="flex items-center gap-2">
            {/* Refresh button */}
            <Tooltip title="Actualizar lista">
              <span>
                <IconButton
                  onClick={handleRefresh}
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
            <Tooltip title="Crear nuevo paciente">
              <Button
                variant="outlined"
                startIcon={<PersonIcon />}
                onClick={() => setCreatePatientDialogOpen(true)}
                className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                size="small"
              >
                Nuevo Paciente
              </Button>
            </Tooltip>

            {/* Create history button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              className="bg-blue-500 hover:bg-blue-600 transition-all duration-200"
            >
              Nueva Historia Clínica
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Box className="flex flex-col sm:flex-row gap-3 mb-4">
          <TextField
            fullWidth
            placeholder="Buscar por paciente, motivo de consulta, diagnóstico..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            className="bg-white dark:bg-gray-800"
            sx={{ flex: 1 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filtrar por Paciente</InputLabel>
            <Select
              value={filterPatient}
              onChange={(e) => setFilterPatient(e.target.value)}
              label="Filtrar por Paciente"
            >
              <MenuItem value="">Todos los pacientes</MenuItem>
              {patients.map((patient) => (
                <MenuItem key={patient._id} value={patient._id}>
                  {patient.firstName} {patient.lastName} ({patient.clinicNumber})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </motion.div>

      {/* Error message */}
      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {filteredHistories.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="text-center py-12">
            <CardContent>
              <LocalHospitalIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {searchQuery || filterPatient ? 'No se encontraron historias clínicas' : 'No hay historias clínicas registradas'}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {searchQuery || filterPatient
                  ? 'Intenta con otro término de búsqueda'
                  : 'Comienza creando tu primera historia clínica'}
              </Typography>
              {!searchQuery && !filterPatient && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateDialog}
                  className="mt-4"
                >
                  Agregar Historia Clínica
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* History list */}
      <AnimatePresence mode="wait">
        {filteredHistories.length > 0 && (
          <motion.div
            key="history-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {filteredHistories.map((history, index) => (
              <ScaleIn key={history._id} delay={index * 0.03}>
                <Card
                  className="transition-all duration-200 hover:shadow-lg"
                >
                  <CardContent className="p-4">
                    {/* Header */}
                    <Box className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 mb-3">
                      <Box className="flex-1">
                        <Box className="flex items-center gap-2 mb-2">
                          <Chip
                            label={history.patientData?.clinicNumber || 'Sin paciente'}
                            size="small"
                            className="bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-mono font-semibold"
                          />
                          <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                            {history.consultationDate 
                              ? format(new Date(history.consultationDate), "d 'de' MMMM 'de' yyyy", { locale: es })
                              : format(new Date(history.createdAt), "d 'de' MMMM 'de' yyyy", { locale: es })
                            }
                          </Typography>
                        </Box>
                        
                        <Typography variant="h6" className="font-semibold mb-1">
                          {history.chiefComplaint}
                        </Typography>
                        
                        {history.patientData && (
                          <Box className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            <span 
                              className="cursor-pointer hover:text-blue-500"
                              onClick={() => handlePatientClick(history.patient)}
                            >
                              {history.patientData.firstName} {history.patientData.lastName}
                            </span>
                          </Box>
                        )}
                      </Box>

                      {/* Actions */}
                      <Box className="flex items-center gap-1">
                        <Tooltip title="Ver detalles">
                          <IconButton
                            onClick={() => handleOpenViewDialog(history)}
                            className="text-blue-500 hover:bg-blue-500/10"
                            size="small"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            onClick={() => handleOpenEditDialog(history)}
                            className="text-green-500 hover:bg-green-500/10"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            onClick={() => handleOpenDeleteDialog(history)}
                            className="text-red-500 hover:bg-red-500/10"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Diagnosis and Helkimo */}
                    {history.diagnosis?.primary && (
                      <Box className="mb-2">
                        <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
                          <strong>Diagnóstico:</strong> {history.diagnosis.primary}
                        </Typography>
                      </Box>
                    )}

                    {/* Helkimo indices */}
                    {history.helkimoIndex && (
                      <Box className="flex gap-2 flex-wrap">
                        {history.helkimoIndex.ai && (
                          <Chip
                            label={`Helkimo AI: ${history.helkimoIndex.ai.classification || 'N/A'}`}
                            size="small"
                            color={getHelkimoColor(history.helkimoIndex.ai.classification || '')}
                          />
                        )}
                        {history.helkimoIndex.di && (
                          <Chip
                            label={`Helkimo DI: ${history.helkimoIndex.di.classification || 'N/A'}`}
                            size="small"
                            color={getHelkimoColor(history.helkimoIndex.di.classification || '')}
                          />
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </ScaleIn>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => !saving && setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="flex items-center gap-2">
          <LocalHospitalIcon className="text-blue-500" />
          <span>Nueva Historia Clínica</span>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" className="mb-3" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          <Box className="space-y-4 mt-3">
            <FormControl fullWidth>
              <InputLabel>Paciente</InputLabel>
              <Select
                value={formData.patient}
                onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                label="Paciente"
                required
              >
                {patients.map((patient) => (
                  <MenuItem key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName} ({patient.clinicNumber})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Motivo de Consulta"
              value={formData.chiefComplaint}
              onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Diagnóstico Principal"
              value={formData.diagnosis.primary}
              onChange={(e) => setFormData({ 
                ...formData, 
                diagnosis: { ...formData.diagnosis, primary: e.target.value } 
              })}
              required
            />

            <TextField
              fullWidth
              label="Plan de Tratamiento"
              value={formData.treatmentPlan.description}
              onChange={(e) => setFormData({ 
                ...formData, 
                treatmentPlan: { ...formData.treatmentPlan, description: e.target.value } 
              })}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateHistory} 
            variant="contained"
            disabled={saving || !formData.patient || !formData.chiefComplaint || !formData.diagnosis.primary}
          >
            {saving ? <CircularProgress size={24} /> : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => !saving && setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="flex items-center gap-2">
          <EditIcon className="text-green-500" />
          <span>Editar Historia Clínica</span>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" className="mb-3" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          <Box className="space-y-4 mt-3">
            {selectedHistory?.patientData && (
              <Box className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                  Paciente: <strong>{selectedHistory.patientData.firstName} {selectedHistory.patientData.lastName}</strong> ({selectedHistory.patientData.clinicNumber})
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth
              label="Motivo de Consulta"
              value={formData.chiefComplaint}
              onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Diagnóstico Principal"
              value={formData.diagnosis.primary}
              onChange={(e) => setFormData({ 
                ...formData, 
                diagnosis: { ...formData.diagnosis, primary: e.target.value } 
              })}
              required
            />

            <TextField
              fullWidth
              label="Plan de Tratamiento"
              value={formData.treatmentPlan.description}
              onChange={(e) => setFormData({ 
                ...formData, 
                treatmentPlan: { ...formData.treatmentPlan, description: e.target.value } 
              })}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateHistory} 
            variant="contained"
            color="success"
            disabled={saving || !formData.chiefComplaint || !formData.diagnosis.primary}
          >
            {saving ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="flex items-center gap-2">
          <ViewIcon className="text-blue-500" />
          <span>Detalles de Historia Clínica</span>
        </DialogTitle>
        <DialogContent>
          {selectedHistory && (
            <Box className="space-y-4 mt-2">
              {/* Patient Info */}
              {selectedHistory.patientData && (
                <Box className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Typography variant="subtitle2" className="text-blue-600 dark:text-blue-400 font-semibold mb-2">
                    Datos del Paciente
                  </Typography>
                  <Box className="grid grid-cols-2 gap-2">
                    <Typography variant="body2">
                      <strong>Nombre:</strong> {selectedHistory.patientData.firstName} {selectedHistory.patientData.lastName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Número de Historia:</strong> {selectedHistory.patientData.clinicNumber}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Teléfono:</strong> {selectedHistory.patientData.phone}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Chief Complaint */}
              <Box>
                <Typography variant="subtitle2" className="font-semibold">
                  Motivo de Consulta
                </Typography>
                <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
                  {selectedHistory.chiefComplaint}
                </Typography>
              </Box>

              {/* Current Illness */}
              {selectedHistory.currentIllness && (
                <Box>
                  <Typography variant="subtitle2" className="font-semibold">
                    Enfermedad Actual
                  </Typography>
                  <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
                    {selectedHistory.currentIllness}
                  </Typography>
                </Box>
              )}

              {/* Diagnosis */}
              {selectedHistory.diagnosis?.primary && (
                <Box>
                  <Typography variant="subtitle2" className="font-semibold">
                    Diagnóstico
                  </Typography>
                  <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
                    <strong>Principal:</strong> {selectedHistory.diagnosis.primary}
                  </Typography>
                  {selectedHistory.diagnosis.secondary && selectedHistory.diagnosis.secondary.length > 0 && (
                    <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
                      <strong>Secundario:</strong> {selectedHistory.diagnosis.secondary.join(', ')}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Helkimo Index */}
              {selectedHistory.helkimoIndex && (
                <Box>
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    Índices Helkimo
                  </Typography>
                  <Box className="flex gap-2 flex-wrap">
                    {selectedHistory.helkimoIndex.ai && (
                      <Chip
                        label={`AI: ${selectedHistory.helkimoIndex.ai.classification || 'N/A'} (${selectedHistory.helkimoIndex.ai.total || 0})`}
                        color={getHelkimoColor(selectedHistory.helkimoIndex.ai.classification || '')}
                      />
                    )}
                    {selectedHistory.helkimoIndex.di && (
                      <Chip
                        label={`DI: ${selectedHistory.helkimoIndex.di.classification || 'N/A'} (${selectedHistory.helkimoIndex.di.total || 0})`}
                        color={getHelkimoColor(selectedHistory.helkimoIndex.di.classification || '')}
                      />
                    )}
                  </Box>
                </Box>
              )}

              {/* Treatment Plan */}
              {(selectedHistory.treatmentPlan?.notes || selectedHistory.treatmentPlan?.procedures?.length > 0) && (
                <Box>
                  <Typography variant="subtitle2" className="font-semibold">
                    Plan de Tratamiento
                  </Typography>
                  {selectedHistory.treatmentPlan?.notes && (
                    <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
                      {selectedHistory.treatmentPlan.notes}
                    </Typography>
                  )}
                  {selectedHistory.treatmentPlan?.procedures && selectedHistory.treatmentPlan.procedures.length > 0 && (
                    <Box className="mt-2 space-y-1">
                      {selectedHistory.treatmentPlan.procedures.map((proc, i) => (
                        <Chip
                          key={i}
                          label={`${proc.name} - ${proc.status}`}
                          size="small"
                          className="mr-1"
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              {/* Clinical Examination */}
              {selectedHistory.clinicalExamination && (
                <Box>
                  <Typography variant="subtitle2" className="font-semibold">
                    Examen Clínico
                  </Typography>
                  <Typography variant="body2" className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(selectedHistory.clinicalExamination, null, 2)}
                  </Typography>
                </Box>
              )}

              {/* Dates */}
              <Box className="text-gray-500 dark:text-gray-400 text-sm">
                <Typography variant="caption">
                  Creado: {format(new Date(selectedHistory.createdAt), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                </Typography>
                <br />
                <Typography variant="caption">
                  Actualizado: {format(new Date(selectedHistory.updatedAt), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Cerrar
          </Button>
          <Button 
            onClick={() => {
              setViewDialogOpen(false);
              if (selectedHistory) handleOpenEditDialog(selectedHistory);
            }}
            startIcon={<EditIcon />}
          >
            Editar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !saving && setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Alert severity="warning" className="mb-3">
            Esta acción eliminará la historia clínica permanentemente. Esta acción no se puede deshacer.
          </Alert>
          <Typography>
            ¿Estás seguro de que deseas eliminar la historia clínica de{' '}
            <strong>{selectedHistory?.patientData?.firstName} {selectedHistory?.patientData?.lastName}</strong>?
          </Typography>
          {selectedHistory && (
            <Typography variant="body2" className="mt-2 text-gray-600 dark:text-gray-400">
              Motivo de consulta: {selectedHistory.chiefComplaint}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteHistory}
            color="error"
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Patient Dialog */}
      <CreatePatientDialog
        open={createPatientDialogOpen}
        onClose={() => setCreatePatientDialogOpen(false)}
        onPatientCreated={() => {
          setCreatePatientDialogOpen(false);
          fetchPatients(); // Refresh patients list
        }}
      />
    </PageTransition>
  );
};

export default ClinicalHistoryList;