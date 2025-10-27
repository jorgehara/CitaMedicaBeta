const express = require('express');
const router = express.Router();
const sobreturnoController = require('../controllers/sobreturnoController');

// Rutas básicas
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

router.get('/', sobreturnoController.getAllSobreturnos);
router.post('/', sobreturnoController.createSobreturno);
router.get('/:id', sobreturnoController.getSobreturno);
router.put('/:id', sobreturnoController.updateSobreturno);
router.delete('/:id', sobreturnoController.deleteSobreturno);

// Rutas especiales
router.patch('/:id/payment', sobreturnoController.updatePaymentStatus);
router.patch('/:id/status', sobreturnoController.updateSobreturnoDescription);
// Endpoint de salud para sobreturnos
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Endpoint para validar disponibilidad
router.get('/date/:date', sobreturnoController.getSobreturnosByDate);

// Endpoint para limpiar caché (usado por el chatbot)
router.post('/cache/clear', (req, res) => {
    // En realidad no tenemos caché en el backend pero respondemos OK
    // para que el chatbot continúe sin errores
    console.log('Solicitud de limpieza de caché recibida:', req.body);
    res.status(200).json({ 
        success: true, 
        message: 'Caché limpiada exitosamente' 
    });
});

// Obtener sobre turnos disponibles por fecha
router.get('/available/:date', sobreturnoController.getAvailableSobreturnos);

// Reservar un sobreturno
router.post('/reserve', sobreturnoController.reserveSobreturno);

// Crear un nuevo sobre turno
router.post('/', sobreturnoController.createSobreturno);

// Listar sobre turnos (opcional: ?status=pending)
router.get('/', sobreturnoController.getSobreturnos);

// Actualizar estado de un sobre turno
router.patch('/:id/status', sobreturnoController.updateSobreturnoStatus);

// Eliminar un sobreturno
router.delete('/:id', sobreturnoController.deleteSobreturno);


module.exports = router;