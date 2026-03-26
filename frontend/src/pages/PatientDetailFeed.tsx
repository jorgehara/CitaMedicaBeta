// PatientDetailFeed - Vista estilo Facebook Feed con tarjetitas scrolleables
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Divider,
  Avatar,
  Paper,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocalHospital as LocalHospitalIcon,
  CalendarToday as CalendarIcon,
  Favorite as HeartIcon,
  Comment as CommentIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import PageTransition from '../components/animations/PageTransition';
import CreateClinicalHistoryDialog from '../components/CreateClinicalHistoryDialog';
import CreateFollowUpDialog from '../components/CreateFollowUpDialog';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import { patientService } from '../services/patientService';
import { clinicalHistoryService } from '../services/clinicalHistoryService';
import { followUpService } from '../services/followUpService';
import type { Patient, ClinicalHistory, FollowUp } from '../types/clinicalHistory';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PatientDetailFeed = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [clinicalHistories, setClinicalHistories] = useState<ClinicalHistory[]>([]);
  const [followUpsByHistory, setFollowUpsByHistory] = useState<Record<string, FollowUp[]>>({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // Dialog states
  const [openNewVisitDialog, setOpenNewVisitDialog] = useState(false);
  const [openFollowUpDialog, setOpenFollowUpDialog] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>('');
  const [editingHistory, setEditingHistory] = useState<ClinicalHistory | null>(null);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  
  // Delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState<'visit' | 'followup'>('visit');
  const [deleteItemId, setDeleteItemId] = useState<string>('');
  const [deleteItemName, setDeleteItemName] = useState<string>('');
  
  // Expanded follow-ups state (for collapsible follow-ups)
  const [expandedFollowUps, setExpandedFollowUps] = useState<Record<string, boolean>>({});
  
  // Filters
  const [filterDate, setFilterDate] = useState<string>('all');
  const [filterDiagnosis, setFilterDiagnosis] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');

  // Fetch patient data and all clinical histories
  const fetchPatientData = useCallback(async (showLoadingState = true) => {
    if (!id) return;

    try {
      if (showLoadingState) {
        setIsRefreshing(true);
      }

      // Get patient data and clinical histories
      const patientData = await patientService.getById(id);
      const historiesResponse = await clinicalHistoryService.getByPatient(id);

      setPatient(patientData);
      setClinicalHistories(historiesResponse);

      // Load follow-ups for each history
      const followUpsMap: Record<string, FollowUp[]> = {};
      for (const history of historiesResponse) {
        try {
          const followUps = await followUpService.getByClinicalHistory(history._id);
          followUpsMap[history._id] = followUps;
        } catch (err) {
          console.error(`Error loading follow-ups for history ${history._id}:`, err);
          followUpsMap[history._id] = [];
        }
      }
      setFollowUpsByHistory(followUpsMap);
      
      setError('');
    } catch (err: any) {
      console.error('[PatientDetailFeed] Error fetching patient data:', err);
      setError(err.message || 'Error al cargar datos del paciente');
    } finally {
      if (showLoadingState) {
        setIsRefreshing(false);
      }
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPatientData(true);
  }, [fetchPatientData]);

  const handleBack = () => {
    navigate('/pacientes');
  };

  const handleRefresh = () => {
    fetchPatientData(true);
  };

  const handleOpenNewVisit = () => {
    setEditingHistory(null);
    setOpenNewVisitDialog(true);
  };

  const handleCloseNewVisit = () => {
    setEditingHistory(null);
    setOpenNewVisitDialog(false);
  };

  const handleVisitCreated = () => {
    fetchPatientData(false); // Refresh data without loading spinner
    setEditingHistory(null);
    setOpenNewVisitDialog(false);
  };

  const handleOpenFollowUp = (historyId: string) => {
    setEditingFollowUp(null);
    setSelectedHistoryId(historyId);
    setOpenFollowUpDialog(true);
  };

  const handleCloseFollowUp = () => {
    setEditingFollowUp(null);
    setOpenFollowUpDialog(false);
    setSelectedHistoryId('');
  };

  const handleFollowUpCreated = () => {
    fetchPatientData(false); // Refresh data without loading spinner
    setEditingFollowUp(null);
    setOpenFollowUpDialog(false);
    setSelectedHistoryId('');
  };

  const toggleFollowUps = (historyId: string) => {
    setExpandedFollowUps((prev) => ({
      ...prev,
      [historyId]: !prev[historyId],
    }));
  };

  const handleEditVisit = (history: ClinicalHistory) => {
    setEditingHistory(history);
    setOpenNewVisitDialog(true);
  };

  const handleEditFollowUp = (followUp: FollowUp, historyId: string) => {
    setEditingFollowUp(followUp);
    setSelectedHistoryId(historyId);
    setOpenFollowUpDialog(true);
  };

  const handleDeleteVisit = (historyId: string, chiefComplaint: string) => {
    setDeleteType('visit');
    setDeleteItemId(historyId);
    setDeleteItemName(chiefComplaint);
    setOpenDeleteDialog(true);
  };

  const handleDeleteFollowUp = (followUpId: string, date: string) => {
    setDeleteType('followup');
    setDeleteItemId(followUpId);
    setDeleteItemName(`Seguimiento del ${format(new Date(date), "dd/MM/yyyy", { locale: es })}`);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteType === 'visit') {
        await clinicalHistoryService.delete(deleteItemId);
      } else {
        await followUpService.delete(deleteItemId);
      }
      setOpenDeleteDialog(false);
      setDeleteItemId('');
      setDeleteItemName('');
      fetchPatientData(false);
    } catch (err: any) {
      console.error('[PatientDetailFeed] Error deleting:', err);
      setError(err.message || 'Error al eliminar');
      setOpenDeleteDialog(false);
    }
  };

  // Filter clinical histories
  const filteredHistories = clinicalHistories.filter((history) => {
    // Date filter
    if (filterDate !== 'all') {
      const historyDate = new Date(history.consultationDate || history.createdAt);
      const now = new Date();
      
      if (filterDate === 'last7days') {
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
        if (historyDate < sevenDaysAgo) return false;
      } else if (filterDate === 'last30days') {
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        if (historyDate < thirtyDaysAgo) return false;
      } else if (filterDate === 'last90days') {
        const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
        if (historyDate < ninetyDaysAgo) return false;
      }
    }

    // Diagnosis filter
    if (filterDiagnosis !== 'all') {
      const primaryDiagnosis = history.diagnosis?.primary?.toLowerCase() || '';
      if (!primaryDiagnosis.includes(filterDiagnosis.toLowerCase())) {
        return false;
      }
    }

    // Search text filter
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      const chiefComplaint = history.chiefComplaint?.toLowerCase() || '';
      const currentIllness = history.currentIllness?.toLowerCase() || '';
      const primaryDiagnosis = history.diagnosis?.primary?.toLowerCase() || '';
      const treatmentDesc = history.treatmentPlan?.description?.toLowerCase() || '';
      
      if (
        !chiefComplaint.includes(search) &&
        !currentIllness.includes(search) &&
        !primaryDiagnosis.includes(search) &&
        !treatmentDesc.includes(search)
      ) {
        return false;
      }
    }

    return true;
  });

  // Get unique diagnoses for filter
  const uniqueDiagnoses = Array.from(
    new Set(
      clinicalHistories
        .map((h) => h.diagnosis?.primary)
        .filter(Boolean)
    )
  ).sort();

  const getHelkimoColor = (classification: string) => {
    if (!classification) return 'default';
    if (classification.includes('Sin')) return 'success';
    if (classification.includes('leve')) return 'info';
    if (classification.includes('moderada')) return 'warning';
    if (classification.includes('severa') || classification.includes('Severa')) return 'error';
    return 'default';
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && !patient) {
    return (
      <PageTransition>
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Volver a Pacientes
        </Button>
      </PageTransition>
    );
  }

  if (!patient) {
    return (
      <PageTransition>
        <Alert severity="warning">Paciente no encontrado</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} className="mt-4">
          Volver a Pacientes
        </Button>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      {/* FACEBOOK-STYLE FEED LAYOUT */}
      <Box className="max-w-3xl mx-auto pb-8">
        {/* Header - Patient Info Card (Sticky) */}
        <Paper 
          elevation={2}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            bgcolor: 'background.paper',
            mb: 3,
          }}
        >
          <Box className="p-4">
            <Box className="flex items-center justify-between mb-3">
              <Box className="flex items-center gap-3">
                <IconButton onClick={handleBack} size="small">
                  <ArrowBackIcon />
                </IconButton>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                  <PersonIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h5" className="font-bold">
                    {patient.firstName} {patient.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {patient.clinicNumber} • {patient.age ? `${patient.age} años` : format(new Date(patient.birthDate), 'dd/MM/yyyy')}
                  </Typography>
                </Box>
              </Box>

              <Box className="flex gap-2">
                <Tooltip title="Actualizar">
                  <IconButton
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    color="primary"
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
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={handleOpenNewVisit}
                >
                  Nueva Visita
                </Button>
              </Box>
            </Box>

            {/* Quick Info */}
            <Box className="flex gap-4 flex-wrap">
              {patient.phone && (
                <Box className="flex items-center gap-1 text-sm">
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2">{patient.phone}</Typography>
                </Box>
              )}
              {patient.email && (
                <Box className="flex items-center gap-1 text-sm">
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2">{patient.email}</Typography>
                </Box>
              )}
              {patient.socialWork && (
                <Chip label={patient.socialWork} size="small" color="primary" variant="outlined" />
              )}
            </Box>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" className="mb-4" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Feed Section */}
        <Typography variant="h6" className="mb-3 px-2 text-gray-600 dark:text-gray-400">
          Historial de Visitas ({filteredHistories.length}/{clinicalHistories.length})
        </Typography>

        {/* Filters and Search */}
        {clinicalHistories.length > 0 && (
          <Box className="mb-4 px-2 space-y-2">
            {/* Search bar */}
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar en visitas (motivo, diagnóstico, tratamiento...)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon className="mr-2 text-gray-400" />,
              }}
            />

            {/* Filter dropdowns */}
            <Box className="flex gap-2">
              <TextField
                select
                size="small"
                label="Período"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="last7days">Últimos 7 días</MenuItem>
                <MenuItem value="last30days">Últimos 30 días</MenuItem>
                <MenuItem value="last90days">Últimos 90 días</MenuItem>
              </TextField>

              <TextField
                select
                size="small"
                label="Diagnóstico"
                value={filterDiagnosis}
                onChange={(e) => setFilterDiagnosis(e.target.value)}
                sx={{ flex: 1, maxWidth: 300 }}
              >
                <MenuItem value="all">Todos</MenuItem>
                {uniqueDiagnoses.map((diagnosis) => (
                  <MenuItem key={diagnosis} value={diagnosis || ''}>
                    {diagnosis}
                  </MenuItem>
                ))}
              </TextField>

              {(filterDate !== 'all' || filterDiagnosis !== 'all' || searchText.trim()) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setFilterDate('all');
                    setFilterDiagnosis('all');
                    setSearchText('');
                  }}
                >
                  Limpiar
                </Button>
              )}
            </Box>
          </Box>
        )}

        {clinicalHistories.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="text-center py-12">
              <LocalHospitalIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No hay visitas registradas
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                Agregá la primera visita de {patient.firstName}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                className="mt-4"
                onClick={handleOpenNewVisit}
              >
                Crear Primera Visita
              </Button>
            </CardContent>
          </Card>
        ) : filteredHistories.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="text-center py-8">
              <Typography variant="h6" color="text.secondary">
                No hay visitas que coincidan con los filtros
              </Typography>
              <Button
                variant="text"
                onClick={() => {
                  setFilterDate('all');
                  setFilterDiagnosis('all');
                  setSearchText('');
                }}
                className="mt-2"
              >
                Limpiar Filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* FEED OF CARDS */
          <Box className="space-y-4">
            {filteredHistories.map((history, index) => {
              const followUps = followUpsByHistory[history._id] || [];
              const hasFollowUps = followUps.length > 0;

              return (
                <motion.div
                  key={history._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card elevation={2} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      {/* Post Header */}
                      <Box className="flex items-start justify-between mb-3">
                        <Box className="flex items-center gap-2">
                          <Avatar sx={{ width: 40, height: 40, bgcolor: 'secondary.main' }}>
                            <LocalHospitalIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" className="font-semibold">
                              Visita Médica
                            </Typography>
                            <Box className="flex items-center gap-1 text-xs text-gray-500">
                              <CalendarIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption">
                                {format(new Date(history.consultationDate || history.createdAt), "d 'de' MMMM 'de' yyyy", { locale: es })}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Box className="flex gap-1">
                          <Tooltip title="Editar visita">
                            <IconButton size="small" onClick={() => handleEditVisit(history)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar visita">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteVisit(history._id, history.chiefComplaint)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      {/* Post Content */}
                      <Box className="mb-3">
                        {/* Chief Complaint */}
                        <Typography variant="h6" className="font-semibold mb-2">
                          {history.chiefComplaint}
                        </Typography>

                        {/* Current Illness */}
                        {history.currentIllness && (
                          <Typography variant="body2" color="text.secondary" className="mb-3">
                            {history.currentIllness}
                          </Typography>
                        )}

                        {/* Diagnosis */}
                        <Box className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3">
                          <Typography variant="caption" className="text-blue-700 dark:text-blue-400 font-semibold uppercase block mb-1">
                            Diagnóstico
                          </Typography>
                          <Typography variant="body2" className="font-medium">
                            {history.diagnosis?.primary}
                          </Typography>
                          {history.diagnosis?.secondary && history.diagnosis.secondary.length > 0 && (
                            <Typography variant="caption" className="text-gray-600 dark:text-gray-400 mt-1 block">
                              Secundario: {history.diagnosis.secondary.join(', ')}
                            </Typography>
                          )}
                        </Box>

                        {/* Helkimo Indices */}
                        {history.helkimoIndex && (
                          <Box className="flex gap-2 mb-3">
                            {history.helkimoIndex.ai && (
                              <Chip
                                label={`AI: ${history.helkimoIndex.ai.classification} (${history.helkimoIndex.ai.score || 0})`}
                                size="small"
                                color={getHelkimoColor(history.helkimoIndex.ai.classification)}
                                className="font-semibold"
                              />
                            )}
                            {history.helkimoIndex.di && (
                              <Chip
                                label={`DI: ${history.helkimoIndex.di.classification} (${history.helkimoIndex.di.score || 0})`}
                                size="small"
                                color={getHelkimoColor(history.helkimoIndex.di.classification)}
                                className="font-semibold"
                              />
                            )}
                          </Box>
                        )}

                        {/* Treatment Plan */}
                        {history.treatmentPlan?.description && (
                          <Box className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <Typography variant="caption" className="text-green-700 dark:text-green-400 font-semibold uppercase block mb-1">
                              Plan de Tratamiento
                            </Typography>
                            <Typography variant="body2">
                              {history.treatmentPlan.description}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Divider className="my-3" />

                      {/* Follow-ups Section */}
                      {hasFollowUps && (
                        <Box className="mt-3">
                          <Box 
                            className="flex items-center justify-between mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors"
                            onClick={() => toggleFollowUps(history._id)}
                          >
                            <Typography variant="caption" className="text-gray-600 dark:text-gray-400 font-semibold uppercase flex items-center gap-1">
                              <CommentIcon sx={{ fontSize: 14 }} />
                              Seguimientos ({followUps.length})
                            </Typography>
                            <IconButton size="small">
                              {expandedFollowUps[history._id] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                            </IconButton>
                          </Box>
                          
                          {expandedFollowUps[history._id] && (
                            <Box className="space-y-2 pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                              {followUps.map((followUp) => (
                              <Box key={followUp._id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md relative group">
                                <Box className="flex items-center justify-between mb-1">
                                  <Box className="flex items-center gap-1">
                                    <CalendarIcon sx={{ fontSize: 12 }} className="text-gray-500" />
                                    <Typography variant="caption" className="text-gray-600 dark:text-gray-400 font-medium">
                                      {format(new Date(followUp.date), "dd/MM/yyyy", { locale: es })}
                                    </Typography>
                                  </Box>
                                  <Box className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Tooltip title="Editar">
                                      <IconButton 
                                        size="small" 
                                        sx={{ padding: '2px' }}
                                        onClick={() => handleEditFollowUp(followUp, history._id)}
                                      >
                                        <EditIcon sx={{ fontSize: 14 }} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Eliminar">
                                      <IconButton 
                                        size="small" 
                                        sx={{ padding: '2px' }}
                                        onClick={() => handleDeleteFollowUp(followUp._id, followUp.date)}
                                        color="error"
                                      >
                                        <DeleteIcon sx={{ fontSize: 14 }} />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                                <Typography variant="body2" className="text-sm">
                                  {followUp.evolution}
                                </Typography>
                                {followUp.symptomsUpdate?.status && (
                                  <Box className="mt-1">
                                    <Chip
                                      label={
                                        followUp.symptomsUpdate.status === 'improved' ? '✓ Mejoró' :
                                        followUp.symptomsUpdate.status === 'worsened' ? '✗ Empeoró' :
                                        followUp.symptomsUpdate.status === 'resolved' ? '✓ Resuelto' :
                                        '→ Estable'
                                      }
                                      size="small"
                                      color={
                                        followUp.symptomsUpdate.status === 'improved' || followUp.symptomsUpdate.status === 'resolved' ? 'success' :
                                        followUp.symptomsUpdate.status === 'worsened' ? 'error' : 'default'
                                      }
                                      sx={{ height: '20px', fontSize: '0.65rem' }}
                                    />
                                    {followUp.symptomsUpdate.painLevel !== undefined && (
                                      <Typography variant="caption" className="ml-2 text-gray-600">
                                        Dolor: {followUp.symptomsUpdate.painLevel}/10
                                      </Typography>
                                    )}
                                  </Box>
                                 )}
                              </Box>
                            ))}
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Post Actions */}
                      <Box className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          variant="text"
                          onClick={() => handleOpenFollowUp(history._id)}
                        >
                          Agregar Seguimiento
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Dialogs */}
      {patient && (
        <>
          <CreateClinicalHistoryDialog
            open={openNewVisitDialog}
            onClose={handleCloseNewVisit}
            patientId={patient._id}
            patientName={`${patient.firstName} ${patient.lastName}`}
            onHistoryCreated={handleVisitCreated}
            editMode={!!editingHistory}
            existingHistory={editingHistory}
          />
          <CreateFollowUpDialog
            open={openFollowUpDialog}
            onClose={handleCloseFollowUp}
            clinicalHistoryId={selectedHistoryId}
            patientName={`${patient.firstName} ${patient.lastName}`}
            onFollowUpCreated={handleFollowUpCreated}
            editMode={!!editingFollowUp}
            existingFollowUp={editingFollowUp}
          />
          <ConfirmDeleteDialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            onConfirm={confirmDelete}
            title={deleteType === 'visit' ? 'Eliminar Visita' : 'Eliminar Seguimiento'}
            message={deleteType === 'visit' 
              ? '¿Estás seguro de que querés eliminar esta visita? Se eliminarán también todos sus seguimientos.'
              : '¿Estás seguro de que querés eliminar este seguimiento?'
            }
            itemName={deleteItemName}
          />
        </>
      )}
    </PageTransition>
  );
};

export default PatientDetailFeed;
