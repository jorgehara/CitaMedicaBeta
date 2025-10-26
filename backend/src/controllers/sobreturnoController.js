// Eliminar un sobreturno por ID
exports.deleteSobreturno = async (req, res) => {
  try {
    const { id } = req.params;
    const sobreturno = await Sobreturno.findByIdAndDelete(id);
    if (!sobreturno) {
      return res.status(404).json({ error: 'Sobreturno no encontrado' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar estado de pago
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPaid } = req.body;

    console.log(`[DEBUG] Actualizando estado de pago para sobreturno ${id} a ${isPaid}`);

    const sobreturno = await Sobreturno.findById(id);
    if (!sobreturno) {
      return res.status(404).json({ error: 'Sobreturno no encontrado' });
    }

    sobreturno.isPaid = isPaid;
    await sobreturno.save();

    console.log(`[DEBUG] Estado de pago actualizado exitosamente`);
    res.json(sobreturno);
  } catch (error) {
    console.error('[ERROR] Error al actualizar estado de pago:', error);
    res.status(500).json({ error: 'Error al actualizar estado de pago' });
  }
};

const Sobreturno = require('../models/sobreturno');
const googleCalendarService = require('../services/googleCalendarService');

// Obtener todos los sobreturnos
exports.getAllSobreturnos = async (req, res) => {
  try {
    console.log('[DEBUG] Obteniendo todos los sobreturnos');
    const sobreturnos = await Sobreturno.find({});
    console.log(`[DEBUG] Se encontraron ${sobreturnos.length} sobreturnos`);
    res.json(sobreturnos);
  } catch (error) {
    console.error('[ERROR] Error al obtener sobreturnos:', error);
    res.status(500).json({ error: 'Error al obtener sobreturnos' });
  }
};

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
      switch(sobreturnoNumber) {
        case 1: sobreturnoTime = '11:00'; break;
        case 2: sobreturnoTime = '11:15'; break;
        case 3: sobreturnoTime = '11:30'; break;
        case 4: sobreturnoTime = '11:45'; break;
        case 5: sobreturnoTime = '12:00'; break;
      }
    } else if (sobreturnoNumber >= 6 && sobreturnoNumber <= 10) {
      switch(sobreturnoNumber) {
        case 6: sobreturnoTime = '19:00'; break;
        case 7: sobreturnoTime = '19:15'; break;
        case 8: sobreturnoTime = '19:30'; break;
        case 9: sobreturnoTime = '19:45'; break;
        case 10: sobreturnoTime = '20:00'; break;
      }
    } else {
      return res.status(400).json({ error: 'Número de sobreturno inválido' });
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

// Validar disponibilidad de un sobre turno
exports.validateSobreturno = async (req, res) => {
  try {
    const { date, sobreturnoNumber } = req.query;
    console.log('[DEBUG] Validando disponibilidad:', { date, sobreturnoNumber });

    if (!date) {
      return res.status(400).json({ 
        success: false,
        message: 'Se requiere la fecha'
      });
    }

    // Si no se proporciona número de sobreturno, devolver todos los disponibles
    if (!sobreturnoNumber) {
      // Obtener todos los sobreturnos para la fecha especificada
      const sobreturnos = await Sobreturno.find({ 
        date,
        status: { $ne: 'cancelled' }
      });

      // Crear un array con todos los números de sobreturno posibles
      const allSobreturnos = Array.from({length: 10}, (_, i) => i + 1);
      
      // Filtrar los números de sobreturno que ya están ocupados
      const ocupados = sobreturnos.map(s => s.sobreturnoNumber);
      const disponibles = allSobreturnos.filter(num => !ocupados.includes(num));

      // Preparar la respuesta con los horarios correspondientes
      const sobreturnosDisponibles = disponibles.map(num => {
        let horario = '';
        if (num >= 1 && num <= 5) {
          switch(num) {
            case 1: horario = '11:00'; break;
            case 2: horario = '11:15'; break;
            case 3: horario = '11:30'; break;
            case 4: horario = '11:45'; break;
            case 5: horario = '12:00'; break;
          }
        } else {
          switch(num) {
            case 6: horario = '19:00'; break;
            case 7: horario = '19:15'; break;
            case 8: horario = '19:30'; break;
            case 9: horario = '19:45'; break;
            case 10: horario = '20:00'; break;
          }
        }
        return {
          numero: num,
          horario,
          turno: num <= 5 ? 'mañana' : 'tarde'
        };
      });

      return res.json({
        success: true,
        data: {
          disponibles: sobreturnosDisponibles,
          totalDisponibles: disponibles.length,
          fecha: date
        }
      });
    }

    if (!date || !sobreturnoNumber) {
      return res.status(400).json({ 
        error: 'Se requieren fecha y número de sobreturno' 
      });
    }

    // Buscar cualquier sobreturno no cancelado para esa fecha y número
    const existente = await Sobreturno.findOne({ 
      date, 
      sobreturnoNumber,
      status: { $ne: 'cancelled' } // No considerar los cancelados
    });

    // Si existe y no está cancelado, no está disponible
    const available = !existente;
    console.log('[DEBUG] Resultado validación:', { 
      available, 
      existente: existente ? existente.status : 'no existe' 
    });

    res.json({ available });
  } catch (error) {
    console.error('[ERROR] Error al validar sobreturno:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener sobreturnos disponibles por fecha
exports.getAvailableSobreturnos = async (req, res) => {
  try {
    const { date } = req.params;
    console.log('[DEBUG] Consultando sobreturnos disponibles para:', date);

    // Buscar sobreturnos disponibles para la fecha
    const disponibles = await Sobreturno.find({
      date,
      isAvailable: true,
      status: { $ne: 'cancelled' },
      isSobreturno: true
    });

    return res.json({
      success: true,
      data: disponibles,
      totalDisponibles: disponibles.length,
      fecha: date
    });
  } catch (error) {
    console.error('[ERROR] Error al obtener sobreturnos disponibles:', error);
    res.status(500).json({ error: error.message });
  }
};

// Reservar un sobreturno (marcar como no disponible)
exports.reserveSobreturno = async (req, res) => {
  try {
    const { id } = req.body;
    const sobreturno = await Sobreturno.findById(id);
    if (!sobreturno || !sobreturno.isAvailable) {
      return res.status(400).json({ error: 'Sobreturno no disponible' });
    }
    sobreturno.isAvailable = false;
    await sobreturno.save();
    res.json({ success: true, sobreturno });
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
