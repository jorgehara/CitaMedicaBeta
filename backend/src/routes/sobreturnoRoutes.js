const express = require('express');
const router = express.Router();
const sobreturnoController = require('../controllers/sobreturnoController');
const { auth } = require('../middleware/auth');
const { checkPermission } = require('../middleware/roleCheck');

/**
 * Endpoints públicos - No requieren autenticación
 */

// Health check
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Endpoints de consulta pública (solo para chatbot)
router.get('/validate', sobreturnoController.validateSobreturno);
router.get('/available/:date', sobreturnoController.getAvailableSobreturnos);
router.get('/date/:date', sobreturnoController.getSobreturnosByDate);

/**
 * Endpoints protegidos - Sistema principal
 */

// Operaciones CRUD básicas (requieren autenticación)

// GET - Lectura (admin, operador, auditor)
router.get('/', auth, checkPermission('sobreturnos', 'read'), sobreturnoController.getSobreturnos);
router.get('/:id', auth, checkPermission('sobreturnos', 'read'), sobreturnoController.getSobreturno);

// POST - Creación (admin, operador)
router.post('/', auth, checkPermission('sobreturnos', 'create'), sobreturnoController.createSobreturno);

// PUT - Actualización completa (admin, operador)
router.put('/:id', auth, checkPermission('sobreturnos', 'update'), sobreturnoController.updateSobreturno);

// PATCH - Actualización parcial (admin, operador)
router.patch('/:id/payment', auth, checkPermission('sobreturnos', 'update'), sobreturnoController.updatePaymentStatus);
router.patch('/:id/description', auth, checkPermission('sobreturnos', 'update'), sobreturnoController.updateSobreturnoDescription);
router.patch('/:id/status', auth, checkPermission('sobreturnos', 'update'), sobreturnoController.updateSobreturnoStatus);

// DELETE - Eliminación (solo admin)
router.delete('/:id', auth, checkPermission('sobreturnos', 'delete'), sobreturnoController.deleteSobreturno);

/**
 * Endpoints especiales - Chatbot y sincronización
 */

// Endpoints específicos para el chatbot
router.post('/reserve', sobreturnoController.reserveSobreturno);
router.post('/cache/clear', (req, res) => {
    // console.log('[DEBUG] Solicitud de limpieza de caché recibida:', req.body);
    res.status(200).json({ 
        success: true, 
        message: 'Caché limpiada exitosamente' 
    });
});

module.exports = router;