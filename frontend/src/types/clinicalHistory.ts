// Task 3.1: TypeScript types for Clinical History module

export interface Patient {
  _id: string;
  clinic: string;
  clinicNumber: string; // Auto-generated PAC-XXXX
  
  // Demographics
  firstName: string;
  lastName: string;
  dni?: string;
  birthDate: string; // YYYY-MM-DD
  age?: number; // Virtual field calculated from birthDate
  gender: 'M' | 'F' | 'X';
  
  // Contact
  phone: string;
  email?: string;
  address?: string;
  
  // Medical
  socialWork?: string;
  allergies?: string;
  chronicDiseases?: string;
  currentMedications?: string;
  
  // Control
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BasePatient extends Omit<Patient, '_id' | 'clinic' | 'clinicNumber' | 'age' | 'createdAt' | 'updatedAt' | 'isActive'> {
  // Form data for creating/updating patients
}

export interface HelkimoIndex {
  // Anamnestic Index (AI)
  ai: {
    symptomsA: number; // 0, 1, 5 (severity)
    symptomsB: number;
    symptomsC: number;
    symptomsD: number;
    symptomsE: number;
    total: number; // Sum of A-E
    classification: 'Ai0' | 'AiI' | 'AiII'; // Auto-calculated
  };
  
  // Dysfunction Index (DI)
  di: {
    mobilityImpairment: number; // 0, 1, 5
    tmjFunction: number;
    musclePain: number;
    tmjPain: number;
    painOnMovement: number;
    total: number;
    classification: 'Di0' | 'DiI' | 'DiII' | 'DiIII'; // Auto-calculated
  };
}

export interface ClinicalExamination {
  extraoral?: {
    facialAsymmetry?: boolean;
    musclePalpation?: string;
    lymphNodes?: string;
  };
  
  intraoral?: {
    mucosa?: string;
    tongue?: string;
    palate?: string;
    floor?: string;
  };
  
  tmj?: {
    leftJoint?: string;
    rightJoint?: string;
    sounds?: string;
    pain?: string;
  };
  
  muscularPalpation?: {
    masseter?: string;
    temporal?: string;
    sternocleidomastoid?: string;
    trapezius?: string;
  };
  
  occlusion?: {
    molarClass?: 'I' | 'II' | 'III';
    canineClass?: 'I' | 'II' | 'III';
    overbite?: string;
    overjet?: string;
    crossbite?: boolean;
    openBite?: boolean;
  };
}

export interface Symptoms {
  pain?: {
    location?: string;
    intensity?: number; // 0-10 scale
    character?: string;
    frequency?: string;
  };
  sounds?: string[];
  limitations?: string[];
  other?: string;
}

export interface ToothStatus {
  number: number; // 1-32 (FDI notation: 11-48)
  status: 'healthy' | 'caries' | 'filled' | 'crown' | 'missing' | 'implant' | 'root_canal' | 'other';
  notes?: string;
}

export interface Odontogram {
  teeth: ToothStatus[];
}

export interface Diagnosis {
  primary: string;
  secondary?: string[];
  icd10?: string; // ICD-10 code if applicable
}

export interface TreatmentProcedure {
  name: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  date?: string;
  cost?: number;
}

export interface TreatmentPlan {
  description?: string; // General treatment plan description
  procedures: TreatmentProcedure[];
  estimatedDuration?: string;
  totalCost?: number;
  notes?: string;
}

export interface Attachment {
  type: 'photo' | 'xray' | 'document';
  url: string;
  description?: string;
  uploadedAt: string;
}

export interface ClinicalHistory {
  _id: string;
  clinic: string;
  patient: string; // Patient ID reference
  appointment?: string; // Optional appointment link
  
  // Anamnesis
  chiefComplaint: string;
  currentIllness?: string;
  
  // Helkimo Index
  helkimoIndex: HelkimoIndex;
  
  // Clinical Examination
  clinicalExamination?: ClinicalExamination;
  
  // Symptoms
  symptoms?: Symptoms;
  
  // Odontogram
  odontogram?: Odontogram;
  
  // Diagnosis
  diagnosis: Diagnosis;
  
  // Treatment
  treatmentPlan?: TreatmentPlan;
  
  // Attachments
  attachments?: Attachment[];
  
  // Metadata
  consultationDate?: string; // YYYY-MM-DD (optional, defaults to createdAt)
  createdAt: string;
  updatedAt: string;
}

export interface BaseClinicalHistory extends Omit<ClinicalHistory, '_id' | 'clinic' | 'createdAt' | 'updatedAt'> {
  // Form data for creating/updating clinical histories
}

export interface FollowUp {
  _id: string;
  clinic: string;
  clinicalHistory: string; // ClinicalHistory ID reference
  
  date: string; // YYYY-MM-DD
  evolution: string; // Progress notes
  
  symptomsUpdate?: {
    status: 'improved' | 'worsened' | 'stable' | 'resolved';
    notes?: string;
    painLevel?: number; // 0-10 scale
  };
  
  treatmentUpdates?: Array<{
    procedureName: string;
    update: string;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  }>;
  
  prescriptions?: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  
  photos?: Array<{
    url: string;
    description?: string;
  }>;
  
  nextAppointment?: {
    date: string;
    reason: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface BaseFollowUp extends Omit<FollowUp, '_id' | 'clinic' | 'createdAt' | 'updatedAt'> {
  // Form data for creating/updating follow-ups
}

// Helper type for patient search results
export interface PatientSearchResult {
  _id: string;
  clinicNumber: string;
  firstName: string;
  lastName: string;
  dni?: string;
  phone: string;
  age?: number;
  lastVisit?: string;
}

// Helper type for clinical history summary (used in patient detail view)
export interface ClinicalHistorySummary {
  _id: string;
  date: string;
  chiefComplaint: string;
  diagnosis: string;
  helkimoAiClassification: string;
  helkimoDiClassification: string;
}
