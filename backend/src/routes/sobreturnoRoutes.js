const express = require('express');
const router = express.Router();
const sobreturnoController = require('../controllers/sobreturnoController');
const { auth } = require('../middleware/auth');
const { checkPermission } = require('../middleware/roleCheck');
const { apiKeyAuth } = require('../middleware/apiKeyAuth');

/**
 * Endpoints públicos con API Key - Para Chatbot
 */

// Health check (sin protección para monitoreo)
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Endpoints de consulta (chatbot con API Key)
router.get('/validate', apiKeyAuth, sobreturnoController.validateSobreturno);
router.get('/validate/:sobreturnoNumber', apiKeyAuth, sobreturnoController.validateSobreturno);
router.get('/available/:date', apiKeyAuth, sobreturnoController.getAvailableSobreturnos);
router.get('/date/:date', apiKeyAuth, sobreturnoController.getSobreturnosByDate);

// Crear sobreturno (chatbot con API Key)
router.post('/', apiKeyAuth, sobreturnoController.createSobreturno);

// Reservar sobreturno (chatbot con API Key)
router.post('/reserve', apiKeyAuth, sobreturnoController.reserveSobreturno);

// Limpiar caché (chatbot con API Key)
router.post('/cache/clear', apiKeyAuth, (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'Caché limpiada exitosamente' 
    });
});

/**
 * Endpoints protegidos - Sistema principal
 */

// Operaciones CRUD básicas (requieren autenticación)

// GET - Lectura (admin, operador, auditor)
router.get('/', auth, checkPermission('sobreturnos', 'read'), sobreturnoController.getSobreturnos);
router.get('/:id', auth, checkPermission('sobreturnos', 'read'), sobreturnoController.getSobreturno);

// PUT - Actualización completa (admin, operador)
router.put('/:id', auth, checkPermission('sobreturnos', 'update'), sobreturnoController.updateSobreturno);

// PATCH - Actualización parcial (admin, operador)
router.patch('/:id/payment', auth, checkPermission('sobreturnos', 'update'), sobreturnoController.updatePaymentStatus);
router.patch('/:id/description', auth, checkPermission('sobreturnos', 'update'), sobreturnoController.updateSobreturnoDescription);
router.patch('/:id/status', auth, checkPermission('sobreturnos', 'update'), sobreturnoController.updateSobreturnoStatus);

// DELETE - Eliminación (solo admin)
router.delete('/:id', auth, checkPermission('sobreturnos', 'delete'), sobreturnoController.deleteSobreturno);

module.exports = router;