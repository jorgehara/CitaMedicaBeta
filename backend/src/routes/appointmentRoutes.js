const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { auth } = require('../middleware/auth');
const { checkPermission } = require('../middleware/roleCheck');
const { apiKeyAuth } = require('../middleware/apiKeyAuth');

// ========================================
// RUTAS PÚBLICAS (Con API Key - Para Chatbot)
// ========================================

// Consultar turnos disponibles (chatbot con API Key)
router.get('/available/:date', apiKeyAuth, appointmentController.getAvailableAppointments);

// Consultar turnos reservados (chatbot con API Key)
router.get('/reserved/:date', apiKeyAuth, appointmentController.getReservedAppointments);

// Crear cita (chatbot con API Key)
router.post('/', apiKeyAuth, appointmentController.createAppointment);

// Consultar tiempos disponibles (chatbot con API Key)
router.get('/available-times', apiKeyAuth, appointmentController.getAvailableTimes);

// ========================================
// RUTAS PROTEGIDAS (Con autenticación)
// ========================================

// Rutas de prueba para Google Calendar (solo admin)
router.get('/test-calendar', auth, checkPermission('appointments', 'read'), appointmentController.testCalendarConnection);
router.post('/test-calendar-create', auth, checkPermission('appointments', 'create'), appointmentController.testCreateEvent);

// GET - Lectura (admin, operador, auditor)
router.get('/', auth, checkPermission('appointments', 'read'), appointmentController.getAllAppointments);

// PUT - Actualización (admin, operador)
router.put('/:id', auth, checkPermission('appointments', 'update'), appointmentController.updateAppointment);

// PATCH - Actualización parcial (admin, operador)
router.patch('/:id/payment', auth, checkPermission('appointments', 'update'), appointmentController.updatePaymentStatus);
router.patch('/:id/description', auth, checkPermission('appointments', 'update'), appointmentController.updateDescription);

// DELETE - Eliminación (solo admin)
router.delete('/:id', auth, checkPermission('appointments', 'delete'), appointmentController.deleteAppointment);

module.exports = router;
