const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { auth } = require('../middleware/auth');
const { checkPermission } = require('../middleware/roleCheck');

// Rutas de prueba para Google Calendar (solo admin)
router.get('/test-calendar', auth, checkPermission('appointments', 'read'), appointmentController.testCalendarConnection);
router.post('/test-calendar-create', auth, checkPermission('appointments', 'create'), appointmentController.testCreateEvent);

// Rutas para citas (protegidas con autenticación)

// GET - Lectura (admin, operador, auditor)
router.get('/', auth, checkPermission('appointments', 'read'), appointmentController.getAllAppointments);
router.get('/available/:date', auth, checkPermission('appointments', 'read'), appointmentController.getAvailableAppointments);
router.get('/reserved/:date', auth, checkPermission('appointments', 'read'), appointmentController.getReservedAppointments);
router.get('/available-times', auth, checkPermission('appointments', 'read'), appointmentController.getAvailableTimes);

// POST - Creación (admin, operador)
router.post('/', auth, checkPermission('appointments', 'create'), appointmentController.createAppointment);

// PUT - Actualización (admin, operador)
router.put('/:id', auth, checkPermission('appointments', 'update'), appointmentController.updateAppointment);

// PATCH - Actualización parcial (admin, operador)
router.patch('/:id/payment', auth, checkPermission('appointments', 'update'), appointmentController.updatePaymentStatus);
router.patch('/:id/description', auth, checkPermission('appointments', 'update'), appointmentController.updateDescription);

// DELETE - Eliminación (solo admin)
router.delete('/:id', auth, checkPermission('appointments', 'delete'), appointmentController.deleteAppointment);

module.exports = router;
