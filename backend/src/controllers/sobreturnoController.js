// Eliminar un sobreturno por ID
exports.deleteSobreturno = async (req, res) => {
  try {
    const { id } = req.params;
    const sobreturno = await Sobreturno.findOneAndDelete({ _id: id, clinicId: req.clinicId });
    if (!sobreturno) {
      return res.status(404).json({ error: 'Sobreturno no encontrado' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validar disponibilidad de sobreturno
exports.validateSobreturno = async (req, res) => {
    try {
        const { date, sobreturnoNumber } = req.query;
        
        if (!date || !sobreturnoNumber) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere fecha y número de sobreturno'
            });
        }

        const existingSobreturno = await Sobreturno.findOne({
            date,
            sobreturnoNumber: parseInt(sobreturnoNumber),
            clinicId: req.clinicId,
            status: { $ne: 'cancelled' }
        });

        return res.json({
            success: true,
            available: !existingSobreturno
        });
    } catch (error) {
        console.error('[ERROR] Error al validar sobreturno:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al validar disponibilidad'
        });
    }
};

// Actualizar estado de pago
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPaid } = req.body;

    if (typeof isPaid !== 'boolean') {
      return res.status(400).json({ error: 'El valor de isPaid debe ser un booleano' });
    }

    // console.log(`[DEBUG] Actualizando estado de pago para sobreturno ${id} a ${isPaid}`);

    // Usar findByIdAndUpdate para obtener el documento actualizado y asegurar que existe
    const sobreturno = await Sobreturno.findOneAndUpdate(
      { _id: id, clinicId: req.clinicId },
      { $set: { isPaid: isPaid } },
      { new: true, runValidators: true }
    );

    if (!sobreturno) {
      return res.status(404).json({ error: 'Sobreturno no encontrado' });
    }

    // console.log(`[DEBUG] Estado de pago actualizado exitosamente para sobreturno:`, sobreturno);
    res.json(sobreturno);
  } catch (error) {
    console.error('[ERROR] Error al actualizar estado de pago:', error);
    res.status(500).json({ error: 'Error al actualizar estado de pago' });
  }
};

const Sobreturno = require('../models/sobreturno');
const googleCalendarService = require('../services/googleCalendarService');

// Determina qué bloques están "quemados" para una fecha+hora dada
// Retorna { morningBlocked, afternoonBlocked }
// Exportada para testing unitario
function getBlockCutoffStatus({ dateStr, nowDate, timezone, mornCutoff = '12:16', aftnCutoff = '20:16' }) {
    const nowInTZ = new Date(nowDate.toLocaleString('en-US', { timeZone: timezone }));
    const todayStr = `${nowInTZ.getFullYear()}-${String(nowInTZ.getMonth() + 1).padStart(2, '0')}-${String(nowInTZ.getDate()).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const currentMinutes = nowInTZ.getHours() * 60 + nowInTZ.getMinutes();

    const [mH, mM] = mornCutoff.split(':').map(Number);
    const [aH, aM] = aftnCutoff.split(':').map(Number);

    return {
        isToday,
        morningBlocked:   isToday && currentMinutes >= mH * 60 + mM,
        afternoonBlocked: isToday && currentMinutes >= aH * 60 + aM
    };
}
exports.getBlockCutoffStatus = getBlockCutoffStatus;

// Genera slots de tiempo entre start y end con el intervalo indicado (en minutos)
function generateTimeSlots(start, end, durationMinutes) {
    const slots = [];
    let [h, m] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const endTotal = endH * 60 + endM;
    while (h * 60 + m <= endTotal) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        m += durationMinutes;
        if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
    }
    return slots;
}

// Devuelve todos los slots de sobreturno (morning + afternoon) según la clínica
// El sobreturnoNumber (1-based) es el índice en este array
function getSobreturnoSlots(clinic) {
    const duration = clinic.settings.appointmentDuration || 15;
    const sh = clinic.settings.sobreturnoHours;
    const morning = sh.morning.enabled
        ? generateTimeSlots(sh.morning.start, sh.morning.end, duration) : [];
    const afternoon = sh.afternoon.enabled
        ? generateTimeSlots(sh.afternoon.start, sh.afternoon.end, duration) : [];
    return { morning, afternoon, all: [...morning, ...afternoon] };
}

// Obtener un sobreturno por ID
exports.getSobreturno = async (req, res) => {
  try {
    const { id } = req.params;
    const sobreturno = await Sobreturno.findOne({ _id: id, clinicId: req.clinicId });
    if (!sobreturno) {
      return res.status(404).json({ error: 'Sobreturno no encontrado' });
    }
    res.json(sobreturno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un sobreturno
exports.updateSobreturno = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const sobreturno = await Sobreturno.findOneAndUpdate({ _id: id, clinicId: req.clinicId }, updates, { new: true, runValidators: true });
    if (!sobreturno) {
      return res.status(404).json({ error: 'Sobreturno no encontrado' });
    }
    res.json(sobreturno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar descripción de un sobreturno
exports.updateSobreturnoDescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Se requiere un ID de sobreturno' });
    }
    
    const sobreturno = await Sobreturno.findOneAndUpdate(
      { _id: id, clinicId: req.clinicId },
      { $set: { description } },
      { new: true, runValidators: true }
    );
    if (!sobreturno) {
      return res.status(404).json({ error: 'Sobreturno no encontrado' });
    }
    res.json(sobreturno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los sobreturnos
exports.getAllSobreturnos = async (req, res) => {
  try {
    // console.log('[DEBUG] Obteniendo todos los sobreturnos');
    const sobreturnos = await Sobreturno.find({ clinicId: req.clinicId });
    // console.log(`[DEBUG] Se encontraron ${sobreturnos.length} sobreturnos`);
    res.json(sobreturnos);
  } catch (error) {
    console.error('[ERROR] Error al obtener sobreturnos:', error);
    res.status(500).json({ error: 'Error al obtener sobreturnos' });
  }
};

// Crear un nuevo sobre turno
exports.createSobreturno = async (req, res) => {
  try {
    // console.log('[DEBUG] Recibiendo solicitud de sobreturno:', JSON.stringify(req.body, null, 2));
    
    // Validar datos requeridos
    const { sobreturnoNumber, date, clientName, socialWork, phone } = req.body;
    
    // Validar obra social contra la lista de la clínica
    if (socialWork && req.clinic.socialWorks.length > 0 &&
        !req.clinic.socialWorks.includes(socialWork)) {
        return res.status(400).json({
            error: `Obra social no válida. Opciones: ${req.clinic.socialWorks.join(', ')}`
        });
    }

    if (!sobreturnoNumber || !date || !clientName || !socialWork || !phone) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos',
        details: {
          sobreturnoNumber: !sobreturnoNumber,
          date: !date,
          clientName: !clientName,
          socialWork: !socialWork,
          phone: !phone
        }
      });
    }

    // Validar que no exista ya un sobreturno con el mismo número y fecha
    const existente = await Sobreturno.findOne({
      sobreturnoNumber: Number(sobreturnoNumber),
      date: new Date(date).toISOString().split('T')[0],
      clinicId: req.clinicId
    });
    
    if (existente) {
      return res.status(409).json({ error: 'Ya existe un sobreturno para ese número y fecha.' });
    }

    // Determinar el horario según el número de sobreturno (dinámico por clínica)
    const { all: allSlots } = getSobreturnoSlots(req.clinic);
    const sobreturnoTime = allSlots[sobreturnoNumber - 1]; // 1-based index
    if (!sobreturnoTime) {
      return res.status(400).json({ error: `Número de sobreturno inválido. Máximo disponible: ${allSlots.length}` });
    }

    const sobreturnoData = {
      ...req.body,
      time: sobreturnoTime,
      status: 'confirmed',
      clinicId: req.clinicId
    };

    console.log('[DEBUG] Creando sobreturno con datos:', JSON.stringify(sobreturnoData, null, 2));

    const sobreturno = new Sobreturno(sobreturnoData);
    console.log('[DEBUG] Modelo de sobreturno creado:', JSON.stringify(sobreturno, null, 2));

    await sobreturno.save();
    console.log('[DEBUG] Sobreturno guardado en la base de datos');

    // Crear evento en Google Calendar inmediatamente para sobreturnos confirmados
    try {
      // console.log('[DEBUG] Intentando crear evento en Google Calendar...');
      const googleCalendarService = require('../services/googleCalendarService');
      const clinicCalendarId = req.clinic?.googleCalendar?.calendarId;
      const appointmentLabel = req.clinic?.settings?.appointmentLabel;
      const eventId = await googleCalendarService.createCalendarEvent(sobreturno, clinicCalendarId, appointmentLabel);
      if (eventId) {
        // console.log('[DEBUG] Evento creado en Google Calendar, actualizando sobreturno...');
        sobreturno.googleEventId = eventId;
        await sobreturno.save();
        // console.log(`[DEBUG] Evento de Google Calendar creado para sobreturno con ID: ${eventId}`);
      }
    } catch (calendarError) {
      // console.log('[DEBUG] Error al crear evento en Google Calendar:', calendarError);
      // console.error('Error al crear evento de sobreturno en Google Calendar:', calendarError);
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
    // console.log('[DEBUG] Obteniendo sobreturnos - Query:', req.query);
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
    const filter = { clinicId: req.clinicId, isSobreturno: true };
    if (status) filter.status = status;
    if (date) filter.date = date;
    console.log('[DEBUG] Filtro aplicado:', filter);
    const sobreturnos = await Sobreturno.find(filter).sort({ date: 1, time: 1 });
    res.json(sobreturnos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener sobreturnos disponibles por fecha
// Regla de corte de bloque: si la fecha es hoy, los slots de mañana se ocultan
// a partir de las 12:16 y los de tarde a partir de las 20:16 (aunque no hayan sido tomados)
exports.getSobreturnosByDate = async (req, res) => {
  try {
    const { date } = req.params;
    console.log('[DEBUG] Obteniendo sobreturnos para fecha:', date);

    if (!date) {
      return res.status(400).json({ 
        success: false,
        message: 'Se requiere la fecha'
      });
    }

    // Obtener sobreturnos para la fecha especificada
    const sobreturnos = await Sobreturno.find({
      date,
      clinicId: req.clinicId,
      isSobreturno: true,
      status: { $ne: 'cancelled' }
    });

    console.log('[DEBUG] Sobreturnos encontrados:', sobreturnos.length);

    // Generar slots según configuración de la clínica (dinámico)
    const { morning: mSlots, afternoon: aSlots, all: allSlots } = getSobreturnoSlots(req.clinic);
    const totalSlots = allSlots.length;

    // --- Lógica de corte de bloque por hora (solo para el día actual) ---
    const timezone = req.clinic.settings.timezone || 'America/Argentina/Buenos_Aires';
    const { isToday, morningBlocked, afternoonBlocked } = getBlockCutoffStatus({
        dateStr: date,
        nowDate: new Date(),
        timezone
    });

    console.log('[DEBUG] isToday:', isToday, '| morningBlocked:', morningBlocked, '| afternoonBlocked:', afternoonBlocked);

    // Crear array con todos los números de sobreturno posibles (1-based)
    const allSobreturnos = Array.from({ length: totalSlots }, (_, i) => i + 1);

    // Filtrar ocupados
    const ocupados = sobreturnos.map(s => s.sobreturnoNumber);

    // Filtrar disponibles: no ocupados + bloque no quemado
    const disponibles = allSobreturnos.filter(num => {
      if (ocupados.includes(num)) return false;
      const isMorningSlot = num <= mSlots.length;
      if (isMorningSlot && morningBlocked) return false;
      if (!isMorningSlot && afternoonBlocked) return false;
      return true;
    });

    // Preparar la respuesta con los horarios correspondientes
    const sobreturnosDisponibles = disponibles.map(num => ({
      numero: num,
      horario: allSlots[num - 1],
      turno: num <= mSlots.length ? 'mañana' : 'tarde'
    }));

    const todosLosSlots = allSlots.map((horario, i) => {
      const num = i + 1;
      const isMorningSlot = num <= mSlots.length;
      const bloqueQuemado = isMorningSlot ? morningBlocked : afternoonBlocked;
      return {
        numero: num,
        horario,
        turno: isMorningSlot ? 'mañana' : 'tarde',
        disponible: !ocupados.includes(num) && !bloqueQuemado
      };
    });

    return res.json({
      success: true,
      data: {
        disponibles: sobreturnosDisponibles,
        todosLosSlots,
        totalDisponibles: disponibles.length,
        fecha: date
      }
    });

  } catch (error) {
    console.error('[ERROR] Error al obtener sobreturnos por fecha:', error);
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
      clinicId: req.clinicId,
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
    const sobreturno = await Sobreturno.findOneAndUpdate({ _id: id, clinicId: req.clinicId }, { status }, { new: true });
    if (!sobreturno) return res.status(404).json({ error: 'Sobreturno no encontrado' });

    // Si se confirma, crear evento en Google Calendar
    if (status === 'confirmed') {
      try {
        const clinicCalendarId = req.clinic?.googleCalendar?.calendarId;
        const appointmentLabel = req.clinic?.settings?.appointmentLabel;
        await googleCalendarService.createCalendarEvent(sobreturno, clinicCalendarId, appointmentLabel);
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
