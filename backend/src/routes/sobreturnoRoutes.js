// Eliminar un sobreturno
router.delete('/:id', sobreturnoController.deleteSobreturno);
const express = require('express');
const router = express.Router();
const sobreturnoController = require('../controllers/sobreturnoController');

// Validar disponibilidad de un sobre turno
router.get('/validate', sobreturnoController.validateSobreturno);

// Obtener sobre turnos disponibles por fecha
router.get('/available/:date', sobreturnoController.getAvailableSobreturnos);

// Crear un nuevo sobre turno
router.post('/', sobreturnoController.createSobreturno);

// Listar sobre turnos (opcional: ?status=pending)
router.get('/', sobreturnoController.getSobreturnos);

// Actualizar estado de un sobre turno
router.patch('/:id/status', sobreturnoController.updateSobreturnoStatus);

// Reservar un sobreturno
router.post('/reserve', sobreturnoController.reserveSobreturno);

module.exports = router;
