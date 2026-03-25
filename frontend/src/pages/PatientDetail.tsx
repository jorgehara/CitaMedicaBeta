// Task 4.2: PatientDetail page - Show patient details and clinical histories
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Home as HomeIcon,
  LocalHospital as LocalHospitalIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import PageTransition from '../components/animations/PageTransition';
import ScaleIn from '../components/animations/ScaleIn';
import { patientService } from '../services/patientService';
import { clinicalHistoryService } from '../services/clinicalHistoryService';
import { followUpService } from '../services/followUpService';
import type { Patient, ClinicalHistorySummary, ClinicalHistory, FollowUp, BaseClinicalHistory, BaseFollowUp } from '../types/clinicalHistory';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ClinicalHistoryForm from '../components/ClinicalHistoryForm';
import FollowUpForm from '../components/FollowUpForm';

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [clinicalHistories, setClinicalHistories] = useState<ClinicalHistorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Clinical history dialog state
  const [createHistoryDialogOpen, setCreateHistoryDialogOpen] = useState(false);
  const [creatingHistory, setCreatingHistory] = useState(false);
  
  // Follow-up dialog state
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [selectedHistoryForFollowUp, setSelectedHistoryForFollowUp] = useState<string | null>(null);
  const [creatingFollowUp, setCreatingFollowUp] = useState(false);
  
  // Expanded history details state
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [expandedHistoryDetails, setExpandedHistoryDetails] = useState<ClinicalHistory | null>(null);
  const [loadingHistoryDetails, setLoadingHistoryDetails] = useState(false);
  
  // Follow-ups state (per history)
  const [followUpsByHistory, setFollowUpsByHistory] = useState<Record<string, FollowUp[]>>({});

  // Fetch patient data
  const fetchPatientData = useCallback(async (showLoadingState = true) => {
    if (!id) return;

    try {
      if (showLoadingState) {
        setIsRefreshing(true);
      }

      const [patientData, historiesData] = await Promise.all([
        patientService.getById(id),
        clinicalHistoryService.getSummariesByPatient(id),
      ]);

      setPatient(patientData);
      setClinicalHistories(historiesData);
      setError('');
    } catch (err: any) {
      console.error('[PatientDetail] Error fetching patient data:', err);
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

  const handleCreateClinicalHistory = () => {
    setCreateHistoryDialogOpen(true);
  };

  const handleClinicalHistorySubmit = async (data: BaseClinicalHistory) => {
    setCreatingHistory(true);
    setError('');
    
    try {
      await clinicalHistoryService.create(data);
      setCreateHistoryDialogOpen(false);
      await fetchPatientData(true); // Refresh data
    } catch (err: any) {
      console.error('[PatientDetail] Error creating clinical history:', err);
      setError(err.message || 'Error al crear historia clínica');
    } finally {
      setCreatingHistory(false);
    }
  };

  const handleClinicalHistoryClick = async (historyId: string) => {
    // Toggle expand/collapse
    if (expandedHistoryId === historyId) {
      setExpandedHistoryId(null);
      setExpandedHistoryDetails(null);
      return;
    }

    setExpandedHistoryId(historyId);
    setLoadingHistoryDetails(true);
    
    try {
      const [historyDetails, followUps] = await Promise.all([
        clinicalHistoryService.getById(historyId),
        followUpService.getByClinicalHistory(historyId)
      ]);
      
      setExpandedHistoryDetails(historyDetails);
      setFollowUpsByHistory(prev => ({ ...prev, [historyId]: followUps }));
    } catch (err: any) {
      console.error('[PatientDetail] Error fetching clinical history details:', err);
      setError(err.message || 'Error al cargar detalles de historia clínica');
    } finally {
      setLoadingHistoryDetails(false);
    }
  };

  const handleOpenFollowUpDialog = (historyId: string) => {
    setSelectedHistoryForFollowUp(historyId);
    setFollowUpDialogOpen(true);
  };

  const handleFollowUpSubmit = async (data: BaseFollowUp) => {
    if (!selectedHistoryForFollowUp) return;
    
    setCreatingFollowUp(true);
    setError('');
    
    try {
      await followUpService.create(data);
      setFollowUpDialogOpen(false);
      setSelectedHistoryForFollowUp(null);
      
      // Refresh follow-ups for this history
      const updatedFollowUps = await followUpService.getByClinicalHistory(selectedHistoryForFollowUp);
      setFollowUpsByHistory(prev => ({ ...prev, [selectedHistoryForFollowUp]: updatedFollowUps }));
    } catch (err: any) {
      console.error('[PatientDetail] Error creating follow-up:', err);
      setError(err.message || 'Error al crear seguimiento');
    } finally {
      setCreatingFollowUp(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!id) return;

    setDeleting(true);
    try {
      await patientService.delete(id);
      navigate('/pacientes');
    } catch (err: any) {
      console.error('[PatientDetail] Error deleting patient:', err);
      setError(err.message || 'Error al eliminar paciente');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <Box className="flex items-center gap-3">
            <IconButton onClick={handleBack} className="bg-gray-200 dark:bg-gray-700">
              <ArrowBackIcon />
            </IconButton>
            <div>
              <Typography variant="h4" className="font-bold">
                {patient.firstName} {patient.lastName}
              </Typography>
              <Chip
                label={patient.clinicNumber}
                size="small"
                className="mt-1 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-mono font-semibold"
              />
            </div>
          </Box>

          <Box className="flex items-center gap-2">
            <Tooltip title="Actualizar">
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
            <Tooltip title="Editar paciente">
              <IconButton className="bg-gray-200 dark:bg-gray-700">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar paciente">
              <IconButton
                onClick={() => setDeleteDialogOpen(true)}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-600"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </motion.div>

      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Patient Information Cards */}
      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Personal Info */}
        <ScaleIn delay={0.1}>
          <Card className="h-full">
            <CardContent>
              <Box className="flex items-center gap-2 mb-3">
                <PersonIcon className="text-blue-500" />
                <Typography variant="h6" className="font-semibold">
                  Datos Personales
                </Typography>
              </Box>
              <Divider className="mb-3" />
              <Box className="space-y-2">
                {patient.dni && (
                  <Box className="flex items-start gap-2">
                    <BadgeIcon className="text-gray-400 mt-0.5" fontSize="small" />
                    <Box>
                      <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                        DNI
                      </Typography>
                      <Typography variant="body2">{patient.dni}</Typography>
                    </Box>
                  </Box>
                )}
                <Box className="flex items-start gap-2">
                  <BadgeIcon className="text-gray-400 mt-0.5" fontSize="small" />
                  <Box>
                    <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                      Fecha de Nacimiento / Edad
                    </Typography>
                    <Typography variant="body2">
                      {format(new Date(patient.birthDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      {patient.age && ` (${patient.age} años)`}
                    </Typography>
                  </Box>
                </Box>
                <Box className="flex items-start gap-2">
                  <PersonIcon className="text-gray-400 mt-0.5" fontSize="small" />
                  <Box>
                    <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                      Género
                    </Typography>
                    <Typography variant="body2">
                      {patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : 'Otro'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </ScaleIn>

        {/* Contact Info */}
        <ScaleIn delay={0.2}>
          <Card className="h-full">
            <CardContent>
              <Box className="flex items-center gap-2 mb-3">
                <PhoneIcon className="text-green-500" />
                <Typography variant="h6" className="font-semibold">
                  Contacto
                </Typography>
              </Box>
              <Divider className="mb-3" />
              <Box className="space-y-2">
                <Box className="flex items-start gap-2">
                  <PhoneIcon className="text-gray-400 mt-0.5" fontSize="small" />
                  <Box>
                    <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                      Teléfono
                    </Typography>
                    <Typography variant="body2">{patient.phone}</Typography>
                  </Box>
                </Box>
                {patient.email && (
                  <Box className="flex items-start gap-2">
                    <EmailIcon className="text-gray-400 mt-0.5" fontSize="small" />
                    <Box>
                      <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                        Email
                      </Typography>
                      <Typography variant="body2" className="break-all">
                        {patient.email}
                      </Typography>
                    </Box>
                  </Box>
                )}
                {patient.address && (
                  <Box className="flex items-start gap-2">
                    <HomeIcon className="text-gray-400 mt-0.5" fontSize="small" />
                    <Box>
                      <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                        Dirección
                      </Typography>
                      <Typography variant="body2">{patient.address}</Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </ScaleIn>

        {/* Medical Info */}
        <ScaleIn delay={0.3}>
          <Card className="h-full">
            <CardContent>
              <Box className="flex items-center gap-2 mb-3">
                <LocalHospitalIcon className="text-purple-500" />
                <Typography variant="h6" className="font-semibold">
                  Información Médica
                </Typography>
              </Box>
              <Divider className="mb-3" />
              <Box className="space-y-2">
                {patient.socialWork && (
                  <Box>
                    <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                      Obra Social
                    </Typography>
                    <Typography variant="body2">{patient.socialWork}</Typography>
                  </Box>
                )}
                {patient.allergies && (
                  <Box>
                    <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                      Alergias
                    </Typography>
                    <Typography variant="body2" className="text-red-600 dark:text-red-400">
                      {patient.allergies}
                    </Typography>
                  </Box>
                )}
                {patient.chronicDiseases && (
                  <Box>
                    <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                      Enfermedades Crónicas
                    </Typography>
                    <Typography variant="body2">{patient.chronicDiseases}</Typography>
                  </Box>
                )}
                {patient.currentMedications && (
                  <Box>
                    <Typography variant="caption" className="text-gray-500 dark:text-gray-400">
                      Medicamentos Actuales
                    </Typography>
                    <Typography variant="body2">{patient.currentMedications}</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </ScaleIn>
      </Box>

      {/* Clinical Histories Section - TRELLO STYLE */}
      <ScaleIn delay={0.4}>
        <Box className="mb-6">
          <Box className="flex items-center justify-between mb-4">
            <Typography variant="h6" className="font-semibold">
              Historias Clínicas ({clinicalHistories.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateClinicalHistory}
              size="small"
              className="bg-blue-500 hover:bg-blue-600"
            >
              Nueva Visita
            </Button>
          </Box>

          {clinicalHistories.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
              <CardContent className="text-center py-8">
                <LocalHospitalIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No hay visitas registradas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Agregá la primera visita de {patient.firstName}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            /* TRELLO-STYLE CARD STACK */
            <Box 
              className="space-y-3"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {clinicalHistories.map((history, index) => {
                const isExpanded = expandedHistoryId === history._id;
                const helkimoAiColor = history.helkimoAiClassification === 'Ai0' ? 'success' : 
                                       history.helkimoAiClassification === 'AiI' ? 'warning' : 'error';
                const helkimoDiColor = history.helkimoDiClassification === 'Di0' ? 'success' : 
                                       history.helkimoDiClassification === 'DiI' ? 'info' :
                                       history.helkimoDiClassification === 'DiII' ? 'warning' : 'error';
                
                return (
                  <motion.div
                    key={history._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {/* TRELLO CARD */}
                    <Card 
                      className={`
                        transition-all duration-200 cursor-pointer
                        hover:shadow-lg hover:-translate-y-0.5
                        ${isExpanded ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-md border border-gray-200 dark:border-gray-700'}
                      `}
                      onClick={() => handleClinicalHistoryClick(history._id)}
                      sx={{
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <CardContent className="p-3">
                        {/* Card Header - Always visible */}
                        <Box className="flex items-start justify-between">
                          <Box className="flex-1">
                            {/* Date Badge */}
                            <Chip
                              icon={<span>📅</span>}
                              label={format(new Date(history.date), "dd MMM yyyy", { locale: es })}
                              size="small"
                              className="mb-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium"
                              sx={{ borderRadius: '4px' }}
                            />
                            
                            {/* Chief Complaint - Main Title */}
                            <Typography 
                              variant="subtitle1" 
                              className="font-semibold mb-1 leading-tight"
                              sx={{ fontSize: '1rem' }}
                            >
                              {history.chiefComplaint}
                            </Typography>
                            
                            {/* Helkimo Indices */}
                            <Box className="flex gap-1.5 flex-wrap mt-2">
                              <Chip
                                label={`AI: ${history.helkimoAiClassification}`}
                                size="small"
                                color={helkimoAiColor}
                                className="font-semibold text-xs"
                                sx={{ height: '22px', fontSize: '0.7rem' }}
                              />
                              <Chip
                                label={`DI: ${history.helkimoDiClassification}`}
                                size="small"
                                color={helkimoDiColor}
                                className="font-semibold text-xs"
                                sx={{ height: '22px', fontSize: '0.7rem' }}
                              />
                            </Box>
                          </Box>

                          {/* Quick Actions */}
                          <Box className="flex flex-col gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                            <Tooltip title="Editar">
                              <IconButton 
                                size="small" 
                                className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                onClick={() => handleClinicalHistoryClick(history._id)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Agregar Seguimiento">
                              <IconButton 
                                size="small" 
                                className="text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenFollowUpDialog(history._id);
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>

                        {/* Expanded Details - TRELLO CARD BACK */}
                        {isExpanded && expandedHistoryDetails && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Divider className="my-3" />
                            
                            {/* Diagnosis */}
                            <Box className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                              <Typography variant="caption" className="text-yellow-700 dark:text-yellow-400 font-semibold uppercase">
                                Diagnóstico
                              </Typography>
                              <Typography variant="body2" className="text-gray-800 dark:text-gray-200">
                                {expandedHistoryDetails.diagnosis.primary}
                              </Typography>
                              {expandedHistoryDetails.diagnosis.secondary && expandedHistoryDetails.diagnosis.secondary.length > 0 && (
                                <Typography variant="caption" className="text-gray-600 dark:text-gray-400 mt-1 block">
                                  Secundario: {expandedHistoryDetails.diagnosis.secondary.join(', ')}
                                </Typography>
                              )}
                            </Box>

                            {/* Treatment Plan */}
                            {expandedHistoryDetails.treatmentPlan && expandedHistoryDetails.treatmentPlan.notes && (
                              <Box className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                <Typography variant="caption" className="text-blue-700 dark:text-blue-400 font-semibold uppercase">
                                  Plan de Tratamiento
                                </Typography>
                                <Typography variant="body2" className="text-gray-800 dark:text-gray-200">
                                  {expandedHistoryDetails.treatmentPlan.notes}
                                </Typography>
                              </Box>
                            )}

                            {/* Follow-ups as mini cards */}
                            <Box className="mt-3">
                              <Typography variant="caption" className="text-gray-500 font-semibold uppercase mb-2 block">
                                Seguimientos ({followUpsByHistory[history._id]?.length || 0})
                              </Typography>
                              
                              {followUpsByHistory[history._id] && followUpsByHistory[history._id].length > 0 ? (
                                <Box className="space-y-2">
                                  {followUpsByHistory[history._id].map((followUp, idx) => (
                                    <Card 
                                      key={followUp._id} 
                                      variant="outlined" 
                                      className="bg-white dark:bg-gray-800 border-l-4 border-l-green-500"
                                      sx={{ borderRadius: '4px' }}
                                    >
                                      <CardContent className="py-2 px-2">
                                        <Box className="flex items-center justify-between mb-1">
                                          <Typography variant="caption" className="text-green-600 dark:text-green-400 font-semibold">
                                            📅 {format(new Date(followUp.date), "dd/MM/yyyy", { locale: es })}
                                          </Typography>
                                        </Box>
                                        <Typography variant="body2" className="text-gray-700 dark:text-gray-300 text-sm">
                                          {followUp.evolution}
                                        </Typography>
                                        {followUp.symptomsUpdate?.status && (
                                          <Chip
                                            label={`Síntomas: ${followUp.symptomsUpdate.status === 'improved' ? '✓ Mejoraron' : 
                                                                  followUp.symptomsUpdate.status === 'worsened' ? '✗ Empeoraron' :
                                                                  followUp.symptomsUpdate.status === 'resolved' ? '✓ Resueltos' : '→ Estables'}`}
                                            size="small"
                                            color={followUp.symptomsUpdate.status === 'improved' || followUp.symptomsUpdate.status === 'resolved' ? 'success' : 
                                                   followUp.symptomsUpdate.status === 'worsened' ? 'error' : 'default'}
                                            className="mt-1 text-xs"
                                            sx={{ height: '20px', fontSize: '0.65rem' }}
                                          />
                                        )}
                                      </CardContent>
                                    </Card>
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.secondary" className="italic">
                                  Sin seguimientos aún
                                </Typography>
                              )}
                            </Box>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </Box>
          )}
        </Box>
      </ScaleIn>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Alert severity="warning" className="mb-3">
            Esta acción marcará al paciente como inactivo. Podrás reactivarlo más tarde si es necesario.
          </Alert>
          <Typography>
            ¿Estás seguro de que deseas eliminar al paciente <strong>{patient.firstName} {patient.lastName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeletePatient}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clinical History Dialog */}
      <Dialog 
        open={createHistoryDialogOpen} 
        onClose={() => !creatingHistory && setCreateHistoryDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          className: "max-h-[90vh] overflow-y-auto"
        }}
      >
        <DialogTitle className="flex items-center gap-2">
          <LocalHospitalIcon className="text-blue-500" />
          <span>Nueva Historia Clínica - {patient.firstName} {patient.lastName}</span>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" className="mb-3" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          <ClinicalHistoryForm
            patientId={id!}
            onSubmit={handleClinicalHistorySubmit}
            onCancel={() => setCreateHistoryDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Follow-up Dialog */}
      <Dialog 
        open={followUpDialogOpen} 
        onClose={() => !creatingFollowUp && setFollowUpDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "max-h-[90vh] overflow-y-auto"
        }}
      >
        <DialogTitle className="flex items-center gap-2">
          <AddIcon className="text-green-500" />
          <span>Nuevo Seguimiento</span>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" className="mb-3" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {selectedHistoryForFollowUp && (
            <FollowUpForm
              clinicalHistoryId={selectedHistoryForFollowUp}
              onSubmit={handleFollowUpSubmit}
              onCancel={() => {
                setFollowUpDialogOpen(false);
                setSelectedHistoryForFollowUp(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default PatientDetail;
