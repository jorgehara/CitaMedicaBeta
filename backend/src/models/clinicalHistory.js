const mongoose = require('mongoose');

const clinicalHistorySchema = new mongoose.Schema({
  // Multi-tenant field
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true,
    index: true
  },

  // References
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },

  // Date of consultation
  consultationDate: {
    type: Date,
    required: true,
    default: Date.now
  },

  // Anamnesis
  chiefComplaint: {
    type: String,
    required: true,
    trim: true
  },
  currentIllness: {
    type: String,
    trim: true
  },

  // Helkimo Index
  helkimoIndex: {
    // Anamnestic Index (AI)
    ai: {
      score: {
        type: Number,
        min: 0,
        max: 25,
        default: 0
      },
      classification: {
        type: String,
        enum: ['Sin síntomas', 'Síntomas leves', 'Síntomas severos'],
        default: 'Sin síntomas'
      },
      questions: {
        q1: { type: Number, min: 0, max: 5, default: 0 }, // Dificultad al abrir boca
        q2: { type: Number, min: 0, max: 5, default: 0 }, // Dificultad al mover mandíbula lateralmente
        q3: { type: Number, min: 0, max: 5, default: 0 }, // Fatiga/dolor muscular al masticar
        q4: { type: Number, min: 0, max: 5, default: 0 }, // Rigidez mandibular
        q5: { type: Number, min: 0, max: 5, default: 0 }  // Luxación de ATM
      }
    },

    // Dysfunction Index (DI)
    di: {
      score: {
        type: Number,
        min: 0,
        max: 25,
        default: 0
      },
      classification: {
        type: String,
        enum: ['Sin disfunción', 'Disfunción leve', 'Disfunción moderada', 'Disfunción severa'],
        default: 'Sin disfunción'
      },
      measurements: {
        rangeOfMovement: { type: Number, min: 0, max: 5, default: 0 },
        impairedTMJFunction: { type: Number, min: 0, max: 5, default: 0 },
        pain: { type: Number, min: 0, max: 5, default: 0 },
        muscularPain: { type: Number, min: 0, max: 5, default: 0 },
        TMJPain: { type: Number, min: 0, max: 5, default: 0 }
      }
    }
  },

  // Clinical examination
  examination: {
    extraoral: { type: String, trim: true },
    intraoral: { type: String, trim: true },
    TMJPalpation: { type: String, trim: true },
    muscularPalpation: { type: String, trim: true },
    occlusion: { type: String, trim: true }
  },

  // Symptoms
  symptoms: {
    pain: {
      present: { type: Boolean, default: false },
      location: [{ type: String, trim: true }],
      intensity: { type: Number, min: 0, max: 10 },
      character: { type: String, trim: true },
      duration: { type: String, trim: true }
    },
    sounds: {
      present: { type: Boolean, default: false },
      type: [{ 
        type: String, 
        enum: ['Clic', 'Crepitación', 'Pop'],
        trim: true 
      }],
      location: { type: String, enum: ['Derecha', 'Izquierda', 'Bilateral'] }
    },
    limitations: {
      present: { type: Boolean, default: false },
      description: { type: String, trim: true }
    }
  },

  // Odontogram
  odontogram: {
    teeth: [{
      number: { type: Number, required: true },
      status: { 
        type: String, 
        enum: ['Sano', 'Caries', 'Obturado', 'Ausente', 'Endodoncia', 'Corona', 'Otro'],
        default: 'Sano'
      },
      notes: { type: String, trim: true }
    }],
    generalNotes: { type: String, trim: true }
  },

  // Diagnosis
  diagnosis: {
    primary: { type: String, required: true, trim: true },
    secondary: [{ type: String, trim: true }]
  },

  // Treatment plan
  treatmentPlan: {
    description: { type: String, required: true, trim: true },
    procedures: [{
      name: { type: String, required: true, trim: true },
      status: { 
        type: String, 
        enum: ['Pendiente', 'En progreso', 'Completado'],
        default: 'Pendiente'
      },
      date: { type: Date },
      notes: { type: String, trim: true }
    }],
    observations: { type: String, trim: true }
  },

  // Attachments (photos, X-rays, etc.)
  attachments: [{
    type: {
      type: String,
      enum: ['Foto', 'Radiografía', 'Tomografía', 'Documento', 'Otro'],
      required: true
    },
    url: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    uploadDate: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes (Task 1.5)
// Compound index: clinic + patient + createdAt (for patient's history sorted by date)
clinicalHistorySchema.index({ clinic: 1, patient: 1, createdAt: -1 });

// Compound index: clinic + createdAt (for clinic-wide history listings)
clinicalHistorySchema.index({ clinic: 1, createdAt: -1 });

// Reference indexes for foreign keys
clinicalHistorySchema.index({ patient: 1 });
clinicalHistorySchema.index({ appointment: 1 });

// Pre-save hook: auto-classify Helkimo indices
clinicalHistorySchema.pre('save', function(next) {
  // Auto-classify AI (Anamnestic Index)
  if (this.helkimoIndex && this.helkimoIndex.ai) {
    const aiScore = this.helkimoIndex.ai.score;
    
    if (aiScore === 0) {
      this.helkimoIndex.ai.classification = 'Sin síntomas';
    } else if (aiScore >= 1 && aiScore <= 9) {
      this.helkimoIndex.ai.classification = 'Síntomas leves';
    } else if (aiScore >= 10) {
      this.helkimoIndex.ai.classification = 'Síntomas severos';
    }
  }

  // Auto-classify DI (Dysfunction Index)
  if (this.helkimoIndex && this.helkimoIndex.di) {
    const diScore = this.helkimoIndex.di.score;
    
    if (diScore === 0) {
      this.helkimoIndex.di.classification = 'Sin disfunción';
    } else if (diScore >= 1 && diScore <= 4) {
      this.helkimoIndex.di.classification = 'Disfunción leve';
    } else if (diScore >= 5 && diScore <= 9) {
      this.helkimoIndex.di.classification = 'Disfunción moderada';
    } else if (diScore >= 10) {
      this.helkimoIndex.di.classification = 'Disfunción severa';
    }
  }

  next();
});

module.exports = mongoose.model('ClinicalHistory', clinicalHistorySchema);
