const Appointment = require('../models/appointment');
const GoogleCalendarService = require('../services/googleCalendarService');
const mongoose = require('mongoose');

// Instancia singleton del servicio de Google Calendar
const googleCalendar = new GoogleCalendarService();

// Función auxiliar para validar ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    console.error('Error al obtener las citas:', error);
    res.status(500).json({ 
      message: 'Error al obtener las citas', 
      error: error.message 
    });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID de cita inválido' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    res.json(appointment);
  } catch (error) {
    console.error('Error al obtener la cita:', error);
    res.status(500).json({ 
      message: 'Error al obtener la cita', 
      error: error.message 
    });
  }
};

exports.createAppointment = async (req, res) => {
    try {
        // Crear la cita en MongoDB
        const appointment = new Appointment(req.body);
        const savedAppointment = await appointment.save();

        // Intentar crear el evento en Google Calendar
        const eventId = await googleCalendar.createCalendarEvent(savedAppointment);
        if (eventId) {
            savedAppointment.googleEventId = eventId;
            await savedAppointment.save();
        }

        res.status(201).json(savedAppointment);
    } catch (error) {
        console.error('Error al crear la cita:', error);
        res.status(500).json({ 
            message: 'Error al crear la cita', 
            error: error.message 
        });
    }
};

exports.updateAppointment = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID de cita inválido' });
    }

    await googleCalendar.ensureInitialized();
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    Object.assign(appointment, req.body);
    const updatedAppointment = await appointment.save();
    
    try {
      if (appointment.googleEventId) {
        await googleCalendar.updateEvent(appointment.googleEventId, updatedAppointment);
      }
    } catch (calendarError) {
      console.error('Error al actualizar evento en Google Calendar:', calendarError);
      // La actualización de la cita se mantiene aunque falle la sincronización
    }

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error al actualizar la cita:', error);
    res.status(500).json({ 
      message: 'Error al actualizar la cita', 
      error: error.message 
    });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID de cita inválido' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    try {
      if (appointment.googleEventId) {
        await googleCalendar.deleteEvent(appointment.googleEventId);
      }
    } catch (calendarError) {
      console.error('Error al eliminar evento de Google Calendar:', calendarError);
      // Continuamos con la eliminación de la cita aunque falle la sincronización
    }

    await appointment.remove();
    res.json({ message: 'Cita eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la cita:', error);
    res.status(500).json({ 
      message: 'Error al eliminar la cita', 
      error: error.message 
    });
  }
};
