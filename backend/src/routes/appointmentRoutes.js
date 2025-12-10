const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { auth } = require('../middleware/auth');
const { checkPermission } = require('../middleware/roleCheck');
const { apiKeyAuth } = require('../middleware/apiKeyAuth');
const { flexibleAuth } = require('../middleware/flexibleAuth');

// ========================================
// RUTAS PÚBLICAS (Sin autenticación)
// Para la página pública de reserva de turnos
// ========================================

// Consultar tiempos disponibles - PÚBLICO
router.get('/public/available-times', appointmentController.getAvailableTimes);

// Crear cita desde formulario público - PÚBLICO
router.post('/public/book', appointmentController.createAppointment);

// ========================================
// RUTAS CON AUTENTICACIÓN FLEXIBLE (API Key O JWT)
// Permiten acceso tanto del chatbot como del frontend
// ========================================

// Consultar turnos disponibles (chatbot con API Key O frontend con JWT)
router.get('/available/:date', flexibleAuth, appointmentController.getAvailableAppointments);

// Consultar turnos reservados (chatbot con API Key O frontend con JWT)
router.get('/reserved/:date', flexibleAuth, appointmentController.getReservedAppointments);

// Crear cita (chatbot con API Key O frontend con JWT)
router.post('/', flexibleAuth, appointmentController.createAppointment);

// Consultar tiempos disponibles (chatbot con API Key O frontend con JWT)
router.get('/available-times', flexibleAuth, appointmentController.getAvailableTimes);

// Listar todas las citas (chatbot con API Key O frontend con JWT)
router.get('/', flexibleAuth, appointmentController.getAllAppointments);

// ========================================
// RUTAS PROTEGIDAS (Solo JWT con permisos)
// ========================================

// Rutas de prueba para Google Calendar (solo admin)
router.get('/test-calendar', auth, checkPermission('appointments', 'read'), appointmentController.testCalendarConnection);
router.post('/test-calendar-create', auth, checkPermission('appointments', 'create'), appointmentController.testCreateEvent);

// PUT - Actualización (admin, operador)
router.put('/:id', auth, checkPermission('appointments', 'update'), appointmentController.updateAppointment);

// PATCH - Actualización parcial (admin, operador)
router.patch('/:id/payment', auth, checkPermission('appointments', 'update'), appointmentController.updatePaymentStatus);
router.patch('/:id/description', auth, checkPermission('appointments', 'update'), appointmentController.updateDescription);

// DELETE - Eliminación (admin, operador)
router.delete('/:id', auth, checkPermission('appointments', 'delete'), appointmentController.deleteAppointment);

module.exports = router;
