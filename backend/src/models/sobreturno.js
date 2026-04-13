const mongoose = require('mongoose');

const SobreturnoSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  sobreturnoNumber: { type: Number, required: true, min: 1, max: 12 },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
  socialWork: {
    type: String,
    default: 'CONSULTA PARTICULAR',
    required: true,
    trim: true
    // Validación de valores válidos delegada al controller usando clinic.socialWorks
  },
  phone: { type: String, required: true },
  email: { type: String },
  description: { type: String },
  attended: { type: Boolean, default: false },
  googleEventId: { type: String, default: null },
  isSobreturno: { type: Boolean, default: true }, // Nuevo campo para identificar sobreturnos
  isAvailable: { type: Boolean, default: true }, // Indica si el sobreturno está disponible
  isPaid: { type: Boolean, default: false }, // Indica si el sobreturno ha sido pagado
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Sobreturno', SobreturnoSchema, 'sobreturnos');
