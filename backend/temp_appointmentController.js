// Archivo temporal con los cambios
const Appointment = require('../models/appointment');
const mongoose = require('mongoose');
const googleCalendarService = require('../services/googleCalendarService');
const syncWithGoogleCalendar = require('../services/calendarSync');

// Función auxiliar para validar ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getAllAppointments = async (req, res) => {
    try {
        const { date, showHistory } = req.query;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Primero sincronizamos con Google Calendar
        const targetDate = date ? new Date(date) : today;
        console.log('[DEBUG] Sincronizando citas para la fecha:', targetDate.toISOString());
        await syncWithGoogleCalendar(targetDate);

        let query = {};
        if (showHistory === 'true') {
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            query = {
                date: {
                    $gte: oneWeekAgo.toISOString().split('T')[0],
                    $lt: today.toISOString().split('T')[0]
                }
            };
        } else if (date) {
            query = { date };
        } else {
            query = {
                date: {
                    $gte: today.toISOString().split('T')[0]
                }
            };
        }

        console.log('[DEBUG] Buscando citas con query:', query);
        const appointments = await Appointment.find(query).sort({ date: 1, time: 1 });
        console.log(`[DEBUG] Se encontraron ${appointments.length} citas`);
        
        res.json(appointments);
    } catch (error) {
        console.error('[ERROR] Error al obtener las citas:', error);
        res.status(500).json({ 
            message: 'Error al obtener las citas',
            error: error.message 
        });
    }
};