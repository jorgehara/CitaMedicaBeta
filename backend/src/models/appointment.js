const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    clientName: { 
        type: String, 
        required: true 
    },
    googleEventId: {
        type: String,
        default: null
    },
    socialWork: {
        type: String,
        enum: ['INSSSEP', 'Swiss Medical', 'OSDE', 'Galeno', 'CONSULTA PARTICULAR'],
        default: 'CONSULTA PARTICULAR'
    },
    phone: { 
        type: String, 
        required: true 
    },
    email: String,
    date: { 
        type: String, 
        required: true 
    },
    time: { 
        type: String, 
        required: true 
    },
    description: String,
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    eventId: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
