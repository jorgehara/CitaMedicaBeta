const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    isSobreturno: {
        type: Boolean,
        default: false,
        required: true
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    clientName: { 
        type: String, 
        required: true,
        trim: true
    },
    googleEventId: {
        type: String,
        default: null
    },
    socialWork: {
        type: String,
        enum: {
            values: ['INSSSEP', 'Swiss Medical', 'OSDE', 'Galeno', 'CONSULTA PARTICULAR', 'Otras Obras Sociales'],
            message: 'La obra social {VALUE} no es válida'
        },
        default: 'CONSULTA PARTICULAR',
        required: true,
        trim: true
    },
    phone: { 
        type: String, 
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    date: { 
        type: String, 
        required: true 
    },
    time: { 
        type: String, 
        required: true 
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending',
        required: true
    },
    attended: {
        type: Boolean,
        default: false,
        required: true
    },
    clinicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: { 
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
