const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Rutas de prueba para Google Calendar
router.get('/test-calendar', appointmentController.testCalendarConnection);
router.post('/test-calendar-create', appointmentController.testCreateEvent);

// Rutas para citas
router.get('/appointments', appointmentController.getAllAppointments);
router.get('/appointments/available/:date', appointmentController.getAvailableAppointments);
router.get('/appointments/reserved/:date', appointmentController.getReservedAppointments);
router.post('/appointments', appointmentController.createAppointment);
router.put('/appointments/:id', appointmentController.updateAppointment);
router.delete('/appointments/:id', appointmentController.deleteAppointment);

// Ruta para obtener horarios disponibles
router.get('/appointments/available-times', appointmentController.getAvailableTimes);

// Ruta para actualizar estado de pago
router.patch('/appointments/:id/payment', appointmentController.updatePaymentStatus);

// Ruta para actualizar descripción
router.patch('/appointments/:id/description', appointmentController.updateDescription);

module.exports = router;
