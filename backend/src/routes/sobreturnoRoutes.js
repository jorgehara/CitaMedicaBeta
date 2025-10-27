const express = require('express');
const router = express.Router();
const sobreturnoController = require('../controllers/sobreturnoController');

/**
 * Endpoints públicos - No requieren autenticación
 */

// Health check
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Endpoints de consulta pública
router.get('/validate', sobreturnoController.validateSobreturno);
router.get('/available/:date', sobreturnoController.getAvailableSobreturnos);
router.get('/date/:date', sobreturnoController.getSobreturnosByDate);

/**
 * Endpoints protegidos - Sistema principal
 */

// Operaciones CRUD básicas
router.get('/', sobreturnoController.getSobreturnos);
router.post('/', sobreturnoController.createSobreturno);
router.get('/:id', sobreturnoController.getSobreturno);
router.put('/:id', sobreturnoController.updateSobreturno);
router.delete('/:id', sobreturnoController.deleteSobreturno);

// Gestión de estados y actualizaciones
router.patch('/:id/payment', sobreturnoController.updatePaymentStatus);
router.patch('/:id/description', sobreturnoController.updateSobreturnoDescription);
router.patch('/:id/status', sobreturnoController.updateSobreturnoStatus);

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