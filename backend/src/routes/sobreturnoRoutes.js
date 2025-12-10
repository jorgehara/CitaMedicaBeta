const express = require('express');
const router = express.Router();
const sobreturnoController = require('../controllers/sobreturnoController');
const { auth } = require('../middleware/auth');
const { checkPermission } = require('../middleware/roleCheck');
const { apiKeyAuth } = require('../middleware/apiKeyAuth');
const { flexibleAuth } = require('../middleware/flexibleAuth');

/**
 * Endpoints con autenticación flexible (API Key O JWT)
 */

// Health check (sin protección para monitoreo)
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Endpoints de consulta (chatbot con API Key O frontend con JWT)
router.get('/validate', flexibleAuth, sobreturnoController.validateSobreturno);
router.get('/validate/:sobreturnoNumber', flexibleAuth, sobreturnoController.validateSobreturno);
router.get('/available/:date', flexibleAuth, sobreturnoController.getAvailableSobreturnos);
router.get('/date/:date', flexibleAuth, sobreturnoController.getSobreturnosByDate);

// Crear sobreturno (chatbot con API Key O frontend con JWT)
router.post('/', flexibleAuth, sobreturnoController.createSobreturno);

// Reservar sobreturno (chatbot con API Key O frontend con JWT)
router.post('/reserve', flexibleAuth, sobreturnoController.reserveSobreturno);

// Limpiar caché (chatbot con API Key O frontend con JWT)
router.post('/cache/clear', flexibleAuth, (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'Caché limpiada exitosamente' 
    });
});

// Listar todos los sobreturnos (chatbot con API Key O frontend con JWT)
router.get('/', flexibleAuth, sobreturnoController.getSobreturnos);
// Listar todos los sobreturnos (chatbot con API Key O frontend con JWT)
router.get('/', flexibleAuth, sobreturnoController.getSobreturnos);

/**
 * Endpoints protegidos - Solo JWT con permisos específicos
 */

// GET por ID - Lectura (admin, operador, auditor)
router.get('/:id', auth, checkPermission('sobreturnos', 'read'), sobreturnoController.getSobreturno);

// PUT - Actualización completa (admin, operador)
router.put('/:id', auth, checkPermission('sobreturnos', 'update'), sobreturnoController.updateSobreturno);

// PATCH - Actualización parcial (admin, operador)
router.patch('/:id/payment', auth, checkPermission('sobreturnos', 'update'), sobreturnoController.updatePaymentStatus);
router.patch('/:id/description', auth, checkPermission('sobreturnos', 'update'), sobreturnoController.updateSobreturnoDescription);
router.patch('/:id/status', auth, checkPermission('sobreturnos', 'update'), sobreturnoController.updateSobreturnoStatus);

// DELETE - Eliminación (admin, operador)
router.delete('/:id', auth, checkPermission('sobreturnos', 'delete'), sobreturnoController.deleteSobreturno);

module.exports = router;