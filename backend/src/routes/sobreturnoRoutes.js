const express = require('express');
const router = express.Router();
const sobreturnoController = require('../controllers/sobreturnoController');
// Endpoint de salud para sobreturnos
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Validar disponibilidad de un sobre turno (formato antiguo)
router.get('/validate', sobreturnoController.validateSobreturno);

// Validar disponibilidad con parámetros simples (para el chatbot)
router.get('/validate/:sobreturnoNumber', (req, res) => {
    const sobreturnoNumber = parseInt(req.params.sobreturnoNumber);
    // Obtenemos la fecha actual en formato YYYY-MM-DD
    const today = new Date();
    const date = today.toISOString().split('T')[0];
    
    req.query.date = date;
    req.query.sobreturnoNumber = sobreturnoNumber;
    
    return sobreturnoController.validateSobreturno(req, res);
});// Obtener sobre turnos disponibles por fecha
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