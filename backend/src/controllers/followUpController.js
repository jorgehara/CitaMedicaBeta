const FollowUp = require('../models/followUp');
const ClinicalHistory = require('../models/clinicalHistory');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all follow-ups (with optional filters)
exports.getAllFollowUps = async (req, res) => {
  try {
    const { clinicalHistory, startDate, endDate } = req.query;

    // Build filter (scoped by clinic)
    const filter = { clinic: req.clinicId };

    // Filter by clinical history if provided
    if (clinicalHistory && isValidObjectId(clinicalHistory)) {
      filter.clinicalHistory = clinicalHistory;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    const followUps = await FollowUp.find(filter)
      .populate({
        path: 'clinicalHistory',
        select: 'patient consultationDate diagnosis',
        populate: {
          path: 'patient',
          select: 'firstName lastName clinicNumber'
        }
      })
      .sort({ date: -1 });

    res.json({
      success: true,
      data: followUps
    });
  } catch (error) {
    console.error('[ERROR] Error al obtener seguimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los seguimientos',
      error: error.message
    });
  }
};

// Get follow-up by ID
exports.getFollowUpById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de seguimiento inválido'
      });
    }

    const followUp = await FollowUp.findOne({
      _id: id,
      clinic: req.clinicId
    }).populate({
      path: 'clinicalHistory',
      select: 'patient consultationDate diagnosis treatmentPlan',
      populate: {
        path: 'patient',
        select: 'firstName lastName clinicNumber dni age gender socialWork phone'
      }
    });

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: 'Seguimiento no encontrado'
      });
    }

    res.json({
      success: true,
      data: followUp
    });
  } catch (error) {
    console.error('[ERROR] Error al obtener seguimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el seguimiento',
      error: error.message
    });
  }
};

// Create follow-up
exports.createFollowUp = async (req, res) => {
  try {
    const followUpData = {
      ...req.body,
      clinic: req.clinicId
    };

    // Validate required fields
    if (!followUpData.clinicalHistory || !followUpData.evolution) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos faltantes: clinicalHistory, evolution'
      });
    }

    // Validate clinical history ID
    if (!isValidObjectId(followUpData.clinicalHistory)) {
      return res.status(400).json({
        success: false,
        message: 'ID de historia clínica inválido'
      });
    }

    // Verify clinical history exists and belongs to the clinic
    const clinicalHistory = await ClinicalHistory.findOne({
      _id: followUpData.clinicalHistory,
      clinic: req.clinicId
    });

    if (!clinicalHistory) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada en esta clínica'
      });
    }

    const followUp = new FollowUp(followUpData);
    await followUp.save();

    // Populate for response
    await followUp.populate({
      path: 'clinicalHistory',
      select: 'patient consultationDate',
      populate: {
        path: 'patient',
        select: 'firstName lastName clinicNumber'
      }
    });

    console.log(`[DEBUG] Seguimiento creado para historia clínica: ${clinicalHistory._id}`);

    res.status(201).json({
      success: true,
      data: followUp
    });
  } catch (error) {
    console.error('[ERROR] Error al crear seguimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el seguimiento',
      error: error.message
    });
  }
};

// Update follow-up
exports.updateFollowUp = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de seguimiento inválido'
      });
    }

    // Find follow-up
    const followUp = await FollowUp.findOne({
      _id: id,
      clinic: req.clinicId
    });

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: 'Seguimiento no encontrado'
      });
    }

    // Don't allow changing clinic or clinicalHistory
    delete req.body.clinic;
    delete req.body.clinicalHistory;

    const updatedFollowUp = await FollowUp.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate({
      path: 'clinicalHistory',
      select: 'patient consultationDate',
      populate: {
        path: 'patient',
        select: 'firstName lastName clinicNumber'
      }
    });

    console.log(`[DEBUG] Seguimiento actualizado: ${id}`);

    res.json({
      success: true,
      data: updatedFollowUp
    });
  } catch (error) {
    console.error('[ERROR] Error al actualizar seguimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el seguimiento',
      error: error.message
    });
  }
};

// Delete follow-up
exports.deleteFollowUp = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de seguimiento inválido'
      });
    }

    const followUp = await FollowUp.findOne({
      _id: id,
      clinic: req.clinicId
    });

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: 'Seguimiento no encontrado'
      });
    }

    await FollowUp.deleteOne({ _id: id });

    console.log(`[DEBUG] Seguimiento eliminado: ${id}`);

    res.json({
      success: true,
      message: 'Seguimiento eliminado correctamente'
    });
  } catch (error) {
    console.error('[ERROR] Error al eliminar seguimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el seguimiento',
      error: error.message
    });
  }
};

// Get follow-ups by clinical history (Task 2.10)
exports.getFollowUpsByClinicalHistory = async (req, res) => {
  try {
    const { historyId } = req.params;

    if (!isValidObjectId(historyId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de historia clínica inválido'
      });
    }

    // Verify clinical history exists and belongs to the clinic
    const clinicalHistory = await ClinicalHistory.findOne({
      _id: historyId,
      clinic: req.clinicId
    });

    if (!clinicalHistory) {
      return res.status(404).json({
        success: false,
        message: 'Historia clínica no encontrada en esta clínica'
      });
    }

    const followUps = await FollowUp.find({
      clinic: req.clinicId,
      clinicalHistory: historyId
    }).sort({ date: -1 });

    console.log(`[DEBUG] Seguimientos de historia clínica ${historyId}: ${followUps.length}`);

    res.json({
      success: true,
      data: followUps
    });
  } catch (error) {
    console.error('[ERROR] Error al obtener seguimientos de la historia clínica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los seguimientos de la historia clínica',
      error: error.message
    });
  }
};
