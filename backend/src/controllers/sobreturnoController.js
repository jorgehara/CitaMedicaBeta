
const Sobreturno = require('../models/sobreturno');
const googleCalendarService = require('../services/googleCalendarService');

// Crear un nuevo sobre turno
exports.createSobreturno = async (req, res) => {
  try {
    console.log('[DEBUG] Recibiendo solicitud de sobreturno:', JSON.stringify(req.body, null, 2));
    

    // Validar que no exista ya un sobreturno con el mismo número y fecha
    const { sobreturnoNumber, date } = req.body;
    const existente = await Sobreturno.findOne({ sobreturnoNumber, date });
    if (existente) {
      return res.status(409).json({ error: 'Ya existe un sobreturno para ese número y fecha.' });
    }

    // Determinar el horario según el número de sobreturno
    let sobreturnoTime = '';
    if (sobreturnoNumber >= 1 && sobreturnoNumber <= 5) {
      sobreturnoTime = '11:00-12:00';
    } else if (sobreturnoNumber >= 6 && sobreturnoNumber <= 10) {
      sobreturnoTime = '19:00-20:00';
    } else {
      sobreturnoTime = 'Sin horario';
    }

    const sobreturnoData = {
      ...req.body,
      time: sobreturnoTime,
      status: 'confirmed' // Los sobreturnos ahora se confirman automáticamente
    };

    console.log('[DEBUG] Creando sobreturno con datos:', JSON.stringify(sobreturnoData, null, 2));

    const sobreturno = new Sobreturno(sobreturnoData);
    console.log('[DEBUG] Modelo de sobreturno creado:', JSON.stringify(sobreturno, null, 2));

    await sobreturno.save();
    console.log('[DEBUG] Sobreturno guardado en la base de datos');

    // Crear evento en Google Calendar inmediatamente para sobreturnos confirmados
    try {
      console.log('[DEBUG] Intentando crear evento en Google Calendar...');
      const googleCalendarService = require('../services/googleCalendarService');
      const eventId = await googleCalendarService.createCalendarEvent(sobreturno);
      if (eventId) {
        console.log('[DEBUG] Evento creado en Google Calendar, actualizando sobreturno...');
        sobreturno.googleEventId = eventId;
        await sobreturno.save();
        console.log(`[DEBUG] Evento de Google Calendar creado para sobreturno con ID: ${eventId}`);
      }
    } catch (calendarError) {
      console.log('[DEBUG] Error al crear evento en Google Calendar:', calendarError);
      console.error('Error al crear evento de sobreturno en Google Calendar:', calendarError);
      // No interrumpir el flujo por error de calendar
    }

    res.status(201).json(sobreturno);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Listar todos los sobre turnos (opcional: filtrar por estado)
exports.getSobreturnos = async (req, res) => {
  try {
    console.log('[DEBUG] Obteniendo sobreturnos - Query:', req.query);
    const { status, date } = req.query;

    // Sincronizar con Google Calendar si se solicita una fecha específica
    if (date) {
      console.log('[DEBUG] Sincronizando sobreturnos con Google Calendar para la fecha:', date);
      try {
        await googleCalendarService.syncEventsForDate(new Date(date));
      } catch (syncError) {
        console.error('[ERROR] Error al sincronizar con Google Calendar:', syncError);
        // Continuar con la búsqueda local incluso si falla la sincronización
      }
    }

    // Filtrar por fecha, estado y isSobreturno
    const filter = {};
    if (status) filter.status = status;
    if (date) filter.date = date;
    filter.isSobreturno = true;
    console.log('[DEBUG] Filtro aplicado:', filter);
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
