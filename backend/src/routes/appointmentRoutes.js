const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Rutas para citas
router.get('/appointments', appointmentController.getAllAppointments);
router.get('/appointments/available/:date', appointmentController.getAvailableAppointments);
router.post('/appointments', appointmentController.createAppointment);
router.put('/appointments/:id', appointmentController.updateAppointment);
router.delete('/appointments/:id', appointmentController.deleteAppointment);

module.exports = router;
