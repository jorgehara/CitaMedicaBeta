const express = require('express');
const router = express.Router();
const unavailabilityController = require('../controllers/unavailabilityController');
const { auth } = require('../middleware/auth');
const { flexibleAuth } = require('../middleware/flexibleAuth');

// GET - Listar bloqueos (chatbot con API Key O frontend con JWT)
router.get('/unavailability', flexibleAuth, unavailabilityController.getAll);

// POST - Crear bloqueo (solo JWT - usuario autenticado del dashboard)
router.post('/unavailability', auth, unavailabilityController.create);

// DELETE - Eliminar bloqueo (solo JWT - usuario autenticado del dashboard)
router.delete('/unavailability/:id', auth, unavailabilityController.remove);

module.exports = router;
