const Appointment = require('../models/appointment');
const googleCalendar = require('../services/googleCalendarService');
const mongoose = require('mongoose');

// Instancia singleton del servicio de Google Calendar
const googleCalendar = new GoogleCalendarService();

// Función auxiliar para validar ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Función para probar la conexión con Google Calendar
exports.testCalendarConnection = async (req, res) => {
    try {
        const result = await googleCalendar.testConnection();
        res.json({ 
            status: 'success', 
            message: 'Conexión con Google Calendar exitosa', 
            data: result 
        });
    } catch (error) {
        console.error('Error al probar Google Calendar:', error);
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
};

// Función para crear un evento de prueba en Google Calendar
exports.testCreateEvent = async (req, res) => {
    try {
        const testAppointment = {
            clientName: "Paciente de Prueba",
            socialWork: "Obra Social de Prueba",
            phone: "123-456-7890",
            email: "test@example.com",
            description: "Esta es una cita de prueba",
            date: new Date().toISOString().split('T')[0],
            time: "14:00",
        };

        const result = await googleCalendar.createCalendarEvent(testAppointment);
        res.json({
            status: 'success',
            message: 'Evento de prueba creado exitosamente',
            data: result
        });
    } catch (error) {
        console.error('Error al crear evento de prueba:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Horarios posibles de consulta
const MORNING_HOURS = ['10:00', '10:15', '10:30', '10:45', 
                      '11:00', '11:15', '11:30', '11:45'];

const AFTERNOON_HOURS = ['17:00', '17:15', '17:30', '17:45',
                        '18:00', '18:15', '18:30', '18:45',
                        '19:00', '19:15', '19:30', '19:45'];

exports.getAllAppointments = async (req, res) => {
  try {
    const { date, showHistory } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let query = {};
    
    if (showHistory === 'true') {
      // Para el historial, mostrar la semana anterior
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      query = {
        date: {
          $gte: oneWeekAgo.toISOString().split('T')[0],
          $lt: today.toISOString().split('T')[0]
        }
      };
    } else if (date) {
      // Para una fecha específica
      query = { date };
    } else {
      // Para turnos futuros (incluyendo hoy)
      query = {
        date: {
          $gte: today.toISOString().split('T')[0]
        }
      };
    }

    const appointments = await Appointment.find(query).sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    console.error('Error al obtener las citas:', error);
    res.status(500).json({ message: 'Error al obtener las citas' });
  }
};

exports.getAvailableAppointments = async (req, res) => {
    try {
        const { date } = req.params;
        console.log('1. Backend - getAvailableAppointments - fecha solicitada:', date);

        // Crear array con todos los horarios posibles
        const allPossibleSlots = [];
        
        // Horarios de la mañana (10:00 a 11:45)
        for (let hour = 10; hour < 12; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                allPossibleSlots.push({
                    displayTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
                    time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
                    status: 'available'
                });
            }
        }
        
        // Horarios de la tarde (17:00 a 19:45)
        for (let hour = 17; hour < 20; hour++) {
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
      const eventId = await googleCalendar.createCalendarEvent(appointment);
      if (eventId) {
        appointment.googleEventId = eventId;
        await appointment.save();
      }
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

exports.getAvailableTimes = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'Se requiere una fecha' });
    }

    const now = new Date();
    const requestedDate = new Date(date);
    requestedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obtener todas las citas para la fecha seleccionada
    const appointments = await Appointment.find({ 
      date,
      status: { $ne: 'cancelled' }
    });
    
    // Obtener los horarios ya ocupados
    const occupiedTimes = appointments.map(appointment => appointment.time);
    
    // Función para verificar si un horario está disponible considerando la hora actual
    const isTimeAvailable = (time) => {
      if (requestedDate.getTime() === today.getTime()) {
        const [hours, minutes] = time.split(':').map(Number);
        const slotTime = new Date(now);
        slotTime.setHours(hours, minutes, 0, 0);
        return slotTime > now;
      }
      return true;
    };

    // Filtrar horarios disponibles
    const availableMorning = MORNING_HOURS
      .filter(time => !occupiedTimes.includes(time) && isTimeAvailable(time))
      .map(time => ({
        displayTime: time,
        time: time,
        period: 'morning'
      }));

    const availableAfternoon = AFTERNOON_HOURS
      .filter(time => !occupiedTimes.includes(time) && isTimeAvailable(time))
      .map(time => ({
        displayTime: time,
        time: time,
        period: 'afternoon'
      }));

    res.json({
      success: true,
      data: {
        date,
        morning: availableMorning,
        afternoon: availableAfternoon
      }
    });
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener horarios disponibles' 
    });
  }
};
