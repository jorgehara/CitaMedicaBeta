const Appointment = require('../models/appointment');
const GoogleCalendarService = require('../services/googleCalendarService');
const mongoose = require('mongoose');

// Instancia singleton del servicio de Google Calendar
const googleCalendar = new GoogleCalendarService();

// Función auxiliar para validar ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getAllAppointments = async (req, res) => {
  try {
    const { date } = req.query;
    console.log('1. Backend - getAllAppointments - fecha solicitada:', date);
    
    let appointments;
    if (date) {
      console.log('2. Backend - Buscando citas para la fecha específica');
      appointments = await Appointment.find({ date }).sort({ time: 1 });
    } else {
      console.log('2. Backend - Buscando todas las citas');
      appointments = await Appointment.find().sort({ date: 1, time: 1 });
    }

    console.log('3. Backend - Citas encontradas:', appointments.length);
    res.json(appointments);
    
  } catch (error) {
    console.error('Error en getAllAppointments:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener las citas', 
      error: error.message 
    });
  }
};

exports.getAvailableAppointments = async (req, res) => {
    try {
        const { date } = req.params;
        console.log('1. Backend - getAvailableAppointments - fecha solicitada:', date);

        // Crear array con todos los horarios posibles
        const allPossibleSlots = [];
        
        // Horarios de la mañana (8:00 a 11:45)
        for (let hour = 8; hour < 12; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                allPossibleSlots.push({
                    displayTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
                    time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
                    status: 'available'  // Cambiado de 'disponible' a 'available'
                });
            }
        }
        
        // Horarios de la tarde (16:00 a 19:45)
        for (let hour = 16; hour < 20; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                allPossibleSlots.push({
                    displayTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
                    time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
                    status: 'available'  // Cambiado de 'disponible' a 'available'
                });
            }
        }        // Obtener las citas existentes para la fecha
        const existingAppointments = await Appointment.find({ 
            date,
            status: { $ne: 'cancelled' } // Excluir citas canceladas
        });

        // Marcar horarios ocupados
        const bookedTimes = existingAppointments.map(apt => apt.time);
        allPossibleSlots.forEach(slot => {
            if (bookedTimes.includes(slot.time)) {
                slot.status = 'unavailable';  // Cambiado de 'ocupado' a 'unavailable'
            }
        });

        // Separar slots en mañana y tarde
        const morning = allPossibleSlots.filter(slot => {
            const hour = parseInt(slot.time.split(':')[0]);
            return hour < 12;
        });

        const afternoon = allPossibleSlots.filter(slot => {
            const hour = parseInt(slot.time.split(':')[0]);
            return hour >= 16;
        });
        
        const response = {
            success: true,
            data: {
                displayDate: date,
                available: {
                    morning,
                    afternoon
                }
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Error en getAvailableAppointments:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las citas disponibles',
            error: error.message
        });
    }
};

exports.getReservedAppointments = async (req, res) => {
  try {
    const { date } = req.params;
    console.log('1. Backend - getReservedAppointments - fecha solicitada:', date);
    
    const appointments = await Appointment.find({ 
      date,
      status: { $ne: 'cancelled' } // Excluir citas canceladas
    }).select('time');

    console.log('2. Backend - Citas reservadas encontradas:', appointments.length);

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error en getReservedAppointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las citas reservadas',
      error: error.message
    });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const appointmentData = {
      clientName: req.body.clientName,
      socialWork: req.body.socialWork,
      phone: req.body.phone,
      email: req.body.email,
      date: req.body.date,
      time: req.body.time,
      status: 'pending'  // Cambiado de 'ocupado' a 'pending' para coincidir con el enum del modelo
    };

    // Verificar si ya existe una cita en ese horario
    const existingAppointment = await Appointment.findOne({
      date: appointmentData.date,
      time: appointmentData.time,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'El horario seleccionado ya no está disponible'
      });
    }

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    // Intentar crear el evento en Google Calendar
    try {
      await googleCalendar.ensureInitialized();
      const eventId = await googleCalendar.createEvent(appointment);
      appointment.googleEventId = eventId;
      await appointment.save();
    } catch (calendarError) {
      console.error('Error al crear evento en Google Calendar:', calendarError);
      // Continuamos con la creación de la cita aunque falle la sincronización con Google Calendar
    }

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error al crear la cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la cita',
      error: error.message
    });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    console.log('Actualizando cita:', req.params.id, req.body);

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID de cita inválido' 
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Cita no encontrada' 
      });
    }

    const updates = {};
    
    // Manejar el estado y asistencia
    if ('status' in req.body) {
      updates.status = req.body.status;
      // Si se confirma la cita, marcarla como asistida
      if (req.body.status === 'confirmed') {
        updates.attended = true;
      }
    }
    
    if ('attended' in req.body) {
      updates.attended = req.body.attended;
      // Si se marca como asistida, confirmar la cita
      if (req.body.attended) {
        updates.status = 'confirmed';
      }
    }
    
    // Manejar la descripción
    if ('description' in req.body) {
      updates.description = req.body.description.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos válidos para actualizar'
      });
    }

    // Actualizar la fecha de modificación
    updates.updatedAt = new Date();

    console.log('Aplicando actualizaciones:', updates);

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Actualizar en Google Calendar si es necesario
    try {
      if (appointment.googleEventId) {
        await googleCalendar.updateEvent(appointment.googleEventId, updatedAppointment);
      }
    } catch (calendarError) {
      console.error('Error al actualizar evento en Google Calendar:', calendarError);
    }

    res.json({ 
      success: true,
      data: updatedAppointment 
    });

  } catch (error) {
    console.error('Error al actualizar la cita:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar la cita',
      error: error.message 
    });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID de cita inválido' 
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Cita no encontrada' 
      });
    }

    try {
      if (appointment.googleEventId) {
        await googleCalendar.deleteEvent(appointment.googleEventId);
      }
    } catch (calendarError) {
      console.error('Error al eliminar evento de Google Calendar:', calendarError);
      // Continuamos con la eliminación de la cita aunque falle la sincronización
    }

    await Appointment.deleteOne({ _id: req.params.id });
    res.json({ 
      success: true,
      message: 'Cita eliminada correctamente' 
    });
  } catch (error) {
    console.error('Error al eliminar la cita:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar la cita', 
      error: error.message 
    });
  }
};
