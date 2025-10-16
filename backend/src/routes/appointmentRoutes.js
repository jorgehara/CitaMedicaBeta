const// Rutas de prueba para Google Calendar (solo admin)
router.get('/test-calendar', protect, admin, appointmentController.testCalendarConnection);
router.post('/test-calendar-create', protect, admin, appointmentController.testCreateEvent);

// Rutas públicas
router.get('/appointments/available/:date', appointmentController.getAvailableAppointments);
router.get('/appointments/available-times', appointmentController.getAvailableTimes);

// Rutas protegidas
router.get('/appointments', protect, appointmentController.getAllAppointments);
router.get('/appointments/reserved/:date', protect, appointmentController.getReservedAppointments);
router.post('/appointments', protect, appointmentController.createAppointment);
router.put('/appointments/:id', protect, appointmentController.updateAppointment);
router.delete('/appointments/:id', protect, admin, appointmentController.deleteAppointment);uire('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Rutas de prueba para Google Calendar (solo admin)
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

module.exports = router;
