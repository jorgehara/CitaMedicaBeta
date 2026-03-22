const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const clinicalHistoryController = require('../controllers/clinicalHistoryController');
const { flexibleAuth } = require('../middleware/flexibleAuth');

// All routes use flexibleAuth (API Key OR JWT)

// Search patients (Task 2.8)
router.get('/search', flexibleAuth, patientController.searchPatients);

// Get clinical histories by patient (Task 2.9)
router.get('/:patientId/clinical-histories', flexibleAuth, clinicalHistoryController.getClinicalHistoriesByPatient);

// Get patient by appointment (Task 2.11)
router.get('/appointment/:appointmentId', flexibleAuth, patientController.getPatientByAppointment);

// CRUD operations
router.get('/', flexibleAuth, patientController.getAllPatients);
router.get('/:id', flexibleAuth, patientController.getPatientById);
router.post('/', flexibleAuth, patientController.createPatient);
router.put('/:id', flexibleAuth, patientController.updatePatient);
router.delete('/:id', flexibleAuth, patientController.deletePatient);

module.exports = router;
