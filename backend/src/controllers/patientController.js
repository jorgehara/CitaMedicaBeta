const Patient = require('../models/patient');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all patients (with optional filters)
exports.getAllPatients = async (req, res) => {
  try {
    const { active } = req.query;
    
    // Build filter (scoped by clinic)
    const filter = { clinic: req.clinicId };
    
    // Filter by active status if provided
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    const patients = await Patient.find(filter)
      .sort({ lastName: 1, firstName: 1 });

    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    console.error('[ERROR] Error al obtener pacientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los pacientes',
      error: error.message
    });
  }
};

// Get patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente inválido'
      });
    }

    const patient = await Patient.findOne({
      _id: id,
      clinic: req.clinicId
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('[ERROR] Error al obtener paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el paciente',
      error: error.message
    });
  }
};

// Create patient
exports.createPatient = async (req, res) => {
  try {
    const patientData = {
      ...req.body,
      clinic: req.clinicId
    };

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'dni', 'birthDate', 'gender', 'phone', 'socialWork'];
    const missingFields = requiredFields.filter(field => !patientData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Campos requeridos faltantes: ${missingFields.join(', ')}`
      });
    }

    // Check for duplicate DNI in the same clinic
    const existingPatient = await Patient.findOne({
      clinic: req.clinicId,
      dni: patientData.dni
    });

    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un paciente con ese DNI en esta clínica'
      });
    }

    // Validate social work against clinic's list
    if (req.clinic.socialWorks.length > 0 &&
        !req.clinic.socialWorks.includes(patientData.socialWork)) {
      return res.status(400).json({
        success: false,
        message: `Obra social no válida. Opciones: ${req.clinic.socialWorks.join(', ')}`
      });
    }

    const patient = new Patient(patientData);
    await patient.save();

    console.log(`[DEBUG] Paciente creado: ${patient.clinicNumber} - ${patient.firstName} ${patient.lastName}`);

    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('[ERROR] Error al crear paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el paciente',
      error: error.message
    });
  }
};

// Update patient
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente inválido'
      });
    }

    // Find patient
    const patient = await Patient.findOne({
      _id: id,
      clinic: req.clinicId
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Validate social work if provided
    if (req.body.socialWork && req.clinic.socialWorks.length > 0 &&
        !req.clinic.socialWorks.includes(req.body.socialWork)) {
      return res.status(400).json({
        success: false,
        message: `Obra social no válida. Opciones: ${req.clinic.socialWorks.join(', ')}`
      });
    }

    // Check for duplicate DNI if changing DNI
    if (req.body.dni && req.body.dni !== patient.dni) {
      const existingPatient = await Patient.findOne({
        clinic: req.clinicId,
        dni: req.body.dni,
        _id: { $ne: id }
      });

      if (existingPatient) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe otro paciente con ese DNI en esta clínica'
        });
      }
    }

    // Don't allow changing clinic or clinicNumber
    delete req.body.clinic;
    delete req.body.clinicNumber;

    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    console.log(`[DEBUG] Paciente actualizado: ${updatedPatient.clinicNumber}`);

    res.json({
      success: true,
      data: updatedPatient
    });
  } catch (error) {
    console.error('[ERROR] Error al actualizar paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el paciente',
      error: error.message
    });
  }
};

// Soft delete patient
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de paciente inválido'
      });
    }

    const patient = await Patient.findOne({
      _id: id,
      clinic: req.clinicId
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Soft delete: set isActive to false
    patient.isActive = false;
    await patient.save();

    console.log(`[DEBUG] Paciente desactivado: ${patient.clinicNumber}`);

    res.json({
      success: true,
      message: 'Paciente desactivado correctamente'
    });
  } catch (error) {
    console.error('[ERROR] Error al desactivar paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar el paciente',
      error: error.message
    });
  }
};

// Search patients (Task 2.8)
exports.searchPatients = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un término de búsqueda (parámetro "q")'
      });
    }

    const searchTerm = q.trim();

    // Build search query (scoped by clinic)
    const filter = {
      clinic: req.clinicId,
      isActive: true,
      $or: [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { dni: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
        { clinicNumber: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    const patients = await Patient.find(filter)
      .sort({ lastName: 1, firstName: 1 })
      .limit(50); // Limit results for performance

    console.log(`[DEBUG] Búsqueda de pacientes: "${searchTerm}" - ${patients.length} resultados`);

    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    console.error('[ERROR] Error al buscar pacientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar pacientes',
      error: error.message
    });
  }
};

// Get patient by appointment (Task 2.11)
exports.getPatientByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!isValidObjectId(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cita inválido'
      });
    }

    // Import Appointment model
    const Appointment = require('../models/appointment');

    // Find appointment and verify it belongs to the clinic
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      clinicId: req.clinicId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada en esta clínica'
      });
    }

    // Search for patient by matching clientName, phone, or DNI
    // This is a fuzzy match since appointments don't have direct patient references yet
    const searchFilter = {
      clinic: req.clinicId,
      isActive: true,
      $or: [
        { phone: appointment.phone }
      ]
    };

    // Try to match by name (split first and last name)
    if (appointment.clientName) {
      const nameParts = appointment.clientName.trim().split(' ');
      if (nameParts.length >= 2) {
        searchFilter.$or.push({
          firstName: { $regex: nameParts[0], $options: 'i' },
          lastName: { $regex: nameParts.slice(1).join(' '), $options: 'i' }
        });
      }
    }

    const patients = await Patient.find(searchFilter)
      .sort({ createdAt: -1 })
      .limit(5);

    if (patients.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'No se encontró un paciente asociado a esta cita'
      });
    }

    // Return the most recent match
    res.json({
      success: true,
      data: patients[0],
      alternatives: patients.length > 1 ? patients.slice(1) : []
    });
  } catch (error) {
    console.error('[ERROR] Error al obtener paciente por cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el paciente por cita',
      error: error.message
    });
  }
};
