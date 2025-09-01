const mongoose = require('mongoose');

const SobreturnoSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
  socialWork: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  description: { type: String },
  attended: { type: Boolean, default: false },
  googleEventId: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Sobreturno', SobreturnoSchema, 'sobreturnos');
