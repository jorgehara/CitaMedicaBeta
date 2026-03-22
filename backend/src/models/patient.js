const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  // Multi-tenant field
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true,
    index: true
  },

  // Auto-generated clinical number (PAC-XXXX)
  clinicNumber: {
    type: String,
    unique: true,
    sparse: true
  },

  // Demographics
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dni: {
    type: String,
    required: true,
    trim: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['M', 'F', 'Otro'],
    required: true
  },

  // Contact information
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
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    province: { type: String, trim: true },
    postalCode: { type: String, trim: true }
  },

  // Medical information
  socialWork: {
    type: String,
    required: true,
    trim: true
  },
  socialWorkNumber: {
    type: String,
    trim: true
  },
  medicalHistory: {
    allergies: [{ type: String, trim: true }],
    chronicDiseases: [{ type: String, trim: true }],
    medications: [{ type: String, trim: true }],
    previousSurgeries: [{ type: String, trim: true }],
    familyHistory: { type: String, trim: true },
    notes: { type: String, trim: true }
  },

  // Soft delete
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual field: age (calculated from birthDate)
patientSchema.virtual('age').get(function() {
  if (!this.birthDate) return null;
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Include virtuals in JSON output
patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

// Indexes (Task 1.4)
// Compound index: clinic + isActive + lastName (for active patient listings sorted by name)
patientSchema.index({ clinic: 1, isActive: 1, lastName: 1 });

// Compound index: clinic + dni (for DNI lookups within clinic)
patientSchema.index({ clinic: 1, dni: 1 });

// Compound index: clinic + clinicNumber (for clinical number lookups)
patientSchema.index({ clinic: 1, clinicNumber: 1 });

// Text index on firstName + lastName for search functionality
patientSchema.index({ firstName: 'text', lastName: 'text' });

// Pre-save hook: generate clinicNumber (PAC-XXXX)
patientSchema.pre('save', async function(next) {
  if (this.isNew && !this.clinicNumber) {
    try {
      // Find the highest existing clinicNumber for this clinic
      const lastPatient = await this.constructor
        .findOne({ clinic: this.clinic })
        .sort({ clinicNumber: -1 })
        .select('clinicNumber')
        .lean();

      let nextNumber = 1;
      if (lastPatient && lastPatient.clinicNumber) {
        const match = lastPatient.clinicNumber.match(/PAC-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      this.clinicNumber = `PAC-${String(nextNumber).padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
