
const Sobreturno = require('../models/sobreturno');
const googleCalendarService = require('../services/googleCalendarService');

// Crear un nuevo sobre turno
exports.createSobreturno = async (req, res) => {
  try {
    const sobreturno = new Sobreturno(req.body);
    await sobreturno.save();
    res.status(201).json(sobreturno);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Listar todos los sobre turnos (opcional: filtrar por estado)
exports.getSobreturnos = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const sobreturnos = await Sobreturno.find(filter).sort({ date: 1, time: 1 });
    res.json(sobreturnos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar estado de un sobre turno (aceptar/rechazar)
exports.updateSobreturnoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sobreturno = await Sobreturno.findByIdAndUpdate(id, { status }, { new: true });
    if (!sobreturno) return res.status(404).json({ error: 'Sobreturno no encontrado' });

    // Si se confirma, crear evento en Google Calendar
    if (status === 'confirmed') {
      try {
        await googleCalendarService.createCalendarEvent(sobreturno);
      } catch (calendarError) {
        console.error('Error al crear evento de sobreturno en Google Calendar:', calendarError);
        // No interrumpir el flujo por error de calendar
      }
    }

    res.json(sobreturno);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
