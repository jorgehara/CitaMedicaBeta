const ClinicalHistory = require('../models/clinicalHistory');
const Patient = require('../models/patient');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all clinical histories (with optional filters)
exports.getAllClinicalHistories = async (req, res) => {
  try {
    const { patient, startDate, endDate } = req.query;

    // Build filter (scoped by clinic)
    const filter = { clinic: req.clinicId };

    // Filter by patient if provided
    if (patient && isValidObjectId(patient)) {
      filter.patient = patient;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      filter.consultationDate = {};
      if (startDate) {
        filter.consultationDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.consultationDate.$lte = new Date(endDate);
      }
    }

    const clinicalHistories = await ClinicalHistory.find(filter)
      .populate('patient', 'firstName lastName dni clinicNumber')
      .populate('appointment', 'date time')
      .sort({ consultationDate: -1 });

    res.json({
      success: true,
      data: clinicalHistories
    });
  } catch (error) {
    console.error('[ERROR] Error al obtener historias clínicas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las historias clínicas',
      error: error.message
    });
  }
};

// Get clinical history by ID
exports.getClinicalHistoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de historia clínica inválido'
      });
    }

    const clinicalHistory = await ClinicalHistory.findOne({
      _id: id,
      clinic: req.clinicId
    })
      .populate('patient', 'firstName lastName dni clinicNumber age gender socialWork phone email')
      .populate('appointment', 'date time');

    if (!clinicalHistory) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada'
      });
    }

    res.json({
      success: true,
      data: clinicalHistory
    });
  } catch (error) {
    console.error('[ERROR] Error al obtener historia clínica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la historia clínica',
      error: error.message
    });
  }
};

// Create clinical history
exports.createClinicalHistory = async (req, res) => {
  try {
    const clinicalHistoryData = {
      ...req.body,
      clinic: req.clinicId
    };

    // Validate required fields
    const requiredFields = ['patient', 'chiefComplaint', 'diagnosis.primary', 'treatmentPlan.description'];
    const missingFields = [];

    if (!clinicalHistoryData.patient) missingFields.push('patient');
    if (!clinicalHistoryData.chiefComplaint) missingFields.push('chiefComplaint');
    if (!clinicalHistoryData.diagnosis || !clinicalHistoryData.diagnosis.primary) {
      missingFields.push('diagnosis.primary');
    }
    if (!clinicalHistoryData.treatmentPlan || !clinicalHistoryData.treatmentPlan.description) {
      missingFields.push('treatmentPlan.description');
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Campos requeridos faltantes: ${missingFields.join(', ')}`
      });
    }

    // Validate patient ID
    if (!isValidObjectId(clinicalHistoryData.patient)) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente inválido'
      });
    }

    // Verify patient exists and belongs to the clinic
    const patient = await Patient.findOne({
      _id: clinicalHistoryData.patient,
      clinic: req.clinicId
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado en esta clínica'
      });
    }

    const clinicalHistory = new ClinicalHistory(clinicalHistoryData);
    await clinicalHistory.save();

    // Populate patient data for response
    await clinicalHistory.populate('patient', 'firstName lastName dni clinicNumber');

    console.log(`[DEBUG] Historia clínica creada para paciente: ${patient.clinicNumber}`);

    res.status(201).json({
      success: true,
      data: clinicalHistory
    });
  } catch (error) {
    console.error('[ERROR] Error al crear historia clínica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la historia clínica',
      error: error.message
    });
  }
};

// Update clinical history
exports.updateClinicalHistory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de historia clínica inválido'
      });
    }

    // Find clinical history
    const clinicalHistory = await ClinicalHistory.findOne({
      _id: id,
      clinic: req.clinicId
    });

    if (!clinicalHistory) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada'
      });
    }

    // Don't allow changing clinic or patient
    delete req.body.clinic;
    delete req.body.patient;

    const updatedClinicalHistory = await ClinicalHistory.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName dni clinicNumber');

    console.log(`[DEBUG] Historia clínica actualizada: ${id}`);

    res.json({
      success: true,
      data: updatedClinicalHistory
    });
  } catch (error) {
    console.error('[ERROR] Error al actualizar historia clínica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la historia clínica',
      error: error.message
    });
  }
};

// Delete clinical history
exports.deleteClinicalHistory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de historia clínica inválido'
      });
    }

    const clinicalHistory = await ClinicalHistory.findOne({
      _id: id,
      clinic: req.clinicId
    });

    if (!clinicalHistory) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada'
      });
    }

    await ClinicalHistory.deleteOne({ _id: id });

    console.log(`[DEBUG] Historia clínica eliminada: ${id}`);

    res.json({
      success: true,
      message: 'Historia clínica eliminada correctamente'
    });
  } catch (error) {
    console.error('[ERROR] Error al eliminar historia clínica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la historia clínica',
      error: error.message
    });
  }
};

// Get Helkimo classification (Task 2.7)
exports.getHelkimoClassification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de historia clínica inválido'
      });
    }

    const clinicalHistory = await ClinicalHistory.findOne({
      _id: id,
      clinic: req.clinicId
    }).select('helkimoIndex');

    if (!clinicalHistory) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        ai: {
          score: clinicalHistory.helkimoIndex?.ai?.score || 0,
          classification: clinicalHistory.helkimoIndex?.ai?.classification || 'Sin síntomas'
        },
        di: {
          score: clinicalHistory.helkimoIndex?.di?.score || 0,
          classification: clinicalHistory.helkimoIndex?.di?.classification || 'Sin disfunción'
        }
      }
    });
  } catch (error) {
    console.error('[ERROR] Error al obtener clasificación Helkimo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la clasificación Helkimo',
      error: error.message
    });
  }
};

// Get clinical histories by patient (Task 2.9)
exports.getClinicalHistoriesByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!isValidObjectId(patientId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente inválido'
      });
    }

    // Verify patient exists and belongs to the clinic
    const patient = await Patient.findOne({
      _id: patientId,
      clinic: req.clinicId
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado en esta clínica'
      });
    }

    const clinicalHistories = await ClinicalHistory.find({
      clinic: req.clinicId,
      patient: patientId
    })
      .populate('appointment', 'date time')
      .sort({ consultationDate: -1 });

    console.log(`[DEBUG] Historias clínicas del paciente ${patient.clinicNumber}: ${clinicalHistories.length}`);

    res.json({
      success: true,
      data: clinicalHistories
    });
  } catch (error) {
    console.error('[ERROR] Error al obtener historias clínicas del paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las historias clínicas del paciente',
      error: error.message
    });
  }
};
