import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    clientName: String,
    socialWork: String,
    phone: String,
    date: String,
    time: String,
    email: String,
    description: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

export const Appointment = mongoose.model('Appointment', appointmentSchema);