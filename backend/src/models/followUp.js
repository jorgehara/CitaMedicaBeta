const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  // Multi-tenant field
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true,
    index: true
  },

  // Reference to clinical history
  clinicalHistory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClinicalHistory',
    required: true,
    index: true
  },

  // Follow-up date
  date: {
    type: Date,
    required: true,
    default: Date.now
  },

  // Evolution notes
  evolution: {
    type: String,
    required: true,
    trim: true
  },

  // Symptoms update
  symptomsUpdate: {
    improved: { type: Boolean, default: false },
    worsened: { type: Boolean, default: false },
    stable: { type: Boolean, default: false },
    notes: { type: String, trim: true }
  },

  // Treatment updates
  treatmentUpdates: [{
    procedure: { type: String, required: true, trim: true },
    status: { 
      type: String, 
      enum: ['Completado', 'En progreso', 'Suspendido', 'Modificado'],
      default: 'En progreso'
    },
    observations: { type: String, trim: true }
  }],

  // New prescriptions or recommendations
  prescriptions: [{
    medication: { type: String, required: true, trim: true },
    dosage: { type: String, trim: true },
    frequency: { type: String, trim: true },
    duration: { type: String, trim: true }
  }],

  // Photos or attachments
  photos: [{
    url: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    uploadDate: { type: Date, default: Date.now }
  }],

  // Next appointment
  nextAppointment: {
    scheduled: { type: Boolean, default: false },
    date: { type: Date },
    notes: { type: String, trim: true }
  }
}, {
  timestamps: true
});

// Indexes (Task 1.6)
// Compound index: clinic + clinicalHistory + date (for follow-ups by history sorted by date)
followUpSchema.index({ clinic: 1, clinicalHistory: 1, date: -1 });

// Compound index: clinic + date (for clinic-wide follow-up listings)
followUpSchema.index({ clinic: 1, date: -1 });

// Reference index
followUpSchema.index({ clinicalHistory: 1 });

module.exports = mongoose.model('FollowUp', followUpSchema);
