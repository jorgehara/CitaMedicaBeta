# Data Models Specification — Historia Clínica ATM

**Domain**: Data Models  
**Change**: historia-clinica-atm  
**Type**: NEW (full specification)  
**Date**: 2026-03-21

---

## Purpose

Define MongoDB schemas (Mongoose models) for Patient, ClinicalHistory, and FollowUp entities. All models MUST include `clinicId` for multi-tenant isolation.

---

## Requirements

### Requirement: REQ-MODEL-001 — Patient Schema

The system **MUST** define a Patient schema with demographic and medical information.

#### Schema Definition

```javascript
const patientSchema = new mongoose.Schema({
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true,
    index: true
  },
  
  // Demographic Data
  fullName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  dni: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  birthDate: {
    type: String, // Format: 'YYYY-MM-DD'
    required: false
  },
  
  gender: {
    type: String,
    enum: ['M', 'F', 'Otro'],
    required: false
  },
  
  // Contact Data
  phone: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true
  },
  
  address: {
    type: String,
    required: false,
    trim: true
  },
  
  // Additional Data
  occupation: {
    type: String,
    required: false,
    trim: true
  },
  
  socialWork: {
    type: String,
    required: false,
    trim: true
  },
  
  clinicNumber: {
    type: String,
    required: true,
    unique: false // NOT globally unique, unique per clinic via compound index
  },
  
  // Soft Delete
  deleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: {
    type: Date,
    default: null
  }
  
}, {
  timestamps: true // Adds createdAt and updatedAt
});
```

#### Scenario: Unique DNI per clinic (compound index)

- **GIVEN** Patient schema
- **WHEN** schema is compiled
- **THEN** compound index `{ clinicId: 1, dni: 1 }` with `unique: true` exists
- **AND** same DNI can exist in different clinics
- **AND** same DNI CANNOT exist twice in same clinic

#### Scenario: Age virtual field

- **GIVEN** Patient with birthDate "1985-05-15"
- **WHEN** patient document is retrieved
- **THEN** virtual field `age` returns calculated age in years

```javascript
patientSchema.virtual('age').get(function() {
  if (!this.birthDate) return null;
  const today = new Date();
  const birth = new Date(this.birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});
```

#### Scenario: Include virtuals in JSON output

- **GIVEN** Patient document with virtuals
- **WHEN** `patient.toJSON()` is called
- **THEN** virtual fields (like `age`) are included in output

```javascript
patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });
```

---

### Requirement: REQ-MODEL-002 — Clinical History Schema

The system **MUST** define a ClinicalHistory schema for ATM/Bruxism assessment.

#### Schema Definition

```javascript
const clinicalHistorySchema = new mongoose.Schema({
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true,
    index: true
  },
  
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional: track who created the history
  },
  
  // Anamnesis (Patient History)
  chiefComplaint: {
    type: String,
    required: false,
    trim: true
  },
  
  medicalHistory: {
    type: String,
    required: false,
    trim: true
  },
  
  dentalHistory: {
    type: String,
    required: false,
    trim: true
  },
  
  // Helkimo Indices
  helkimoAI: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: false
    },
    classification: {
      type: String,
      enum: ['Sin síntomas', 'Leve', 'Moderado', 'Grave'],
      required: false
    }
  },
  
  helkimoDI: {
    score: {
      type: Number,
      min: 0,
      max: 25,
      required: false
    },
    classification: {
      type: String,
      enum: ['Sin signos clínicos', 'Leve', 'Moderado', 'Grave'],
      required: false
    }
  },
  
  // Signs and Symptoms (Boolean flags)
  musclePain: {
    type: Boolean,
    default: false
  },
  
  jointSounds: {
    type: Boolean,
    default: false
  },
  
  openingLimitation: {
    type: Boolean,
    default: false
  },
  
  headaches: {
    type: Boolean,
    default: false
  },
  
  // Bruxism Assessment
  bruxism: {
    type: {
      type: String,
      enum: ['Ninguno', 'Diurno', 'Nocturno', 'Mixto'],
      default: 'Ninguno'
    },
    severity: {
      type: String,
      enum: ['Ninguna', 'Leve', 'Moderado', 'Grave'],
      default: 'Ninguna'
    }
  },
  
  // Treatment Plan
  treatment: {
    type: String,
    required: false,
    trim: true
  },
  
  observations: {
    type: String,
    required: false,
    trim: true
  }
  
}, {
  timestamps: true
});
```

#### Scenario: One clinical history per patient

- **GIVEN** patient "pat123"
- **WHEN** clinical history is created for "pat123"
- **THEN** only ONE clinical history exists per patient
- **AND** subsequent clinical changes are recorded in FollowUp model

#### Scenario: Auto-classify Helkimo AI on save

- **GIVEN** clinical history with `helkimoAI.score = 15`
- **WHEN** document is saved
- **THEN** pre-save hook auto-sets `helkimoAI.classification = "Moderado"`

```javascript
clinicalHistorySchema.pre('save', function(next) {
  // Auto-classify Helkimo AI
  if (this.helkimoAI && this.helkimoAI.score !== undefined) {
    const score = this.helkimoAI.score;
    if (score === 0) this.helkimoAI.classification = 'Sin síntomas';
    else if (score <= 9) this.helkimoAI.classification = 'Leve';
    else if (score <= 24) this.helkimoAI.classification = 'Moderado';
    else this.helkimoAI.classification = 'Grave';
  }
  
  // Auto-classify Helkimo DI
  if (this.helkimoDI && this.helkimoDI.score !== undefined) {
    const score = this.helkimoDI.score;
    if (score === 0) this.helkimoDI.classification = 'Sin signos clínicos';
    else if (score <= 4) this.helkimoDI.classification = 'Leve';
    else if (score <= 9) this.helkimoDI.classification = 'Moderado';
    else this.helkimoDI.classification = 'Grave';
  }
  
  next();
});
```

---

### Requirement: REQ-MODEL-003 — Follow-Up Schema

The system **MUST** define a FollowUp schema to track patient evolution over time.

#### Schema Definition

```javascript
const followUpSchema = new mongoose.Schema({
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true,
    index: true
  },
  
  clinicalHistoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClinicalHistory',
    required: true,
    index: true
  },
  
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false // Optional: link to appointment if follow-up happened during a visit
  },
  
  date: {
    type: String, // Format: 'YYYY-MM-DD'
    required: true,
    index: true
  },
  
  symptoms: {
    type: String,
    required: false,
    trim: true
  },
  
  treatment: {
    type: String,
    required: false,
    trim: true
  },
  
  notes: {
    type: String,
    required: false,
    trim: true
  }
  
}, {
  timestamps: true
});
```

#### Scenario: Multiple follow-ups per clinical history

- **GIVEN** clinical history "ch456"
- **WHEN** follow-ups are created for "ch456"
- **THEN** multiple follow-up documents can exist
- **AND** they are ordered by `date` DESC when queried

#### Scenario: Follow-up inherits clinicId from clinical history

- **GIVEN** clinical history "ch456" with `clinicId: "clinic123"`
- **WHEN** follow-up is created for "ch456"
- **THEN** follow-up `clinicId` is auto-set to "clinic123" (via middleware or controller)

---

### Requirement: REQ-MODEL-004 — Indexes for Performance

The system **MUST** define database indexes to optimize query performance.

#### Scenario: Patient indexes

- **GIVEN** Patient schema
- **THEN** indexes exist on:
  - `{ clinicId: 1, dni: 1 }` (unique compound)
  - `{ clinicId: 1, fullName: 1 }`
  - `{ clinicId: 1, phone: 1 }`
  - `{ clinicId: 1, createdAt: -1 }`

#### Scenario: Clinical History indexes

- **GIVEN** ClinicalHistory schema
- **THEN** indexes exist on:
  - `{ clinicId: 1, patientId: 1 }` (unique compound — one history per patient per clinic)
  - `{ patientId: 1 }`

#### Scenario: Follow-Up indexes

- **GIVEN** FollowUp schema
- **THEN** indexes exist on:
  - `{ clinicId: 1, clinicalHistoryId: 1, date: -1 }`
  - `{ appointmentId: 1 }` (for linking from appointments)

---

### Requirement: REQ-MODEL-005 — Referential Integrity

The system **SHOULD** maintain referential integrity between models using Mongoose `ref` and population.

#### Scenario: Populate patient from clinical history

- **GIVEN** clinical history with `patientId: "pat123"`
- **WHEN** query uses `.populate('patientId')`
- **THEN** patient data is embedded in response

```javascript
ClinicalHistory.findById('ch456').populate('patientId');
```

#### Scenario: Populate clinical history from follow-up

- **GIVEN** follow-up with `clinicalHistoryId: "ch456"`
- **WHEN** query uses `.populate('clinicalHistoryId')`
- **THEN** clinical history data is embedded

#### Scenario: Cascade delete (future consideration)

- **GIVEN** patient "pat123" is deleted
- **WHEN** patient is soft-deleted
- **THEN** associated clinical history and follow-ups remain accessible (NOT hard deleted)
- **AND** future queries filter by `patient.deleted === false`

---

### Requirement: REQ-MODEL-006 — Auto-generated Clinical Number

The system **MUST** auto-generate sequential clinical numbers per clinic.

#### Scenario: Generate clinicNumber on patient creation

- **GIVEN** clinic "clinic123" has 10 patients
- **WHEN** new patient is created
- **THEN** pre-save hook generates `clinicNumber: "PAC-011"`

```javascript
patientSchema.pre('save', async function(next) {
  if (this.isNew && !this.clinicNumber) {
    const count = await mongoose.model('Patient').countDocuments({ 
      clinicId: this.clinicId,
      deleted: false
    });
    this.clinicNumber = `PAC-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});
```

---

## Model Relationships

```
Clinic (existing)
  └─ has many → Patient
                   └─ has one → ClinicalHistory
                                   └─ has many → FollowUp

Appointment (existing)
  └─ has one → FollowUp (optional linkage)
```

---

## Data Integrity Rules

1. **Multi-tenant isolation**: ALL queries MUST filter by `clinicId`
2. **Soft delete**: Patient deletion sets `deleted: true`, does NOT remove from DB
3. **Unique DNI per clinic**: Enforced via compound index `{ clinicId, dni }`
4. **One clinical history per patient**: Enforced via compound unique index `{ clinicId, patientId }`
5. **Sequential clinicNumber**: Auto-generated per clinic, NOT globally unique

---

**Total Requirements**: 6  
**Total Scenarios**: 14  
**Coverage**: Schema definitions ✅ | Indexes ✅ | Virtuals ✅ | Hooks ✅
