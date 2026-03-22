# UI Frontend Specification — Historia Clínica ATM

**Domain**: UI Frontend  
**Change**: historia-clinica-atm  
**Type**: NEW (full specification)  
**Date**: 2026-03-21

---

## Purpose

Define user interface requirements for managing patients, clinical histories, and follow-ups in the CitaMedicaBeta frontend (React + Material-UI + TypeScript).

---

## Requirements

### Requirement: REQ-UI-001 — Patient List Page

The system **MUST** provide a patient list page with search and pagination.

#### Scenario: Display patient list

- **GIVEN** clinic has 15 patients
- **WHEN** user navigates to `/patients`
- **THEN** page displays:
  - Page title "Pacientes"
  - Search bar (placeholder: "Buscar por nombre, DNI o teléfono")
  - Table with columns: N°Clínico, Nombre, DNI, Teléfono, Edad, Acciones
  - Pagination controls (if >10 patients)
  - Button "Nuevo Paciente" (top right)

#### Scenario: Search patients by name

- **GIVEN** patients "Juan Pérez", "María López", "Pedro Gómez"
- **WHEN** user types "juan" in search bar
- **THEN** table updates to show only "Juan Pérez"
- **AND** search is case-insensitive
- **AND** search is debounced (500ms delay)

#### Scenario: Search patients by DNI

- **GIVEN** patient with DNI "12345678"
- **WHEN** user types "12345" in search bar
- **THEN** table shows patient with matching DNI

#### Scenario: Click on patient row

- **GIVEN** patient list with patient "Juan Pérez"
- **WHEN** user clicks on "Juan Pérez" row
- **THEN** user is navigated to `/patients/:id` (patient detail page)

#### Scenario: Empty state

- **GIVEN** clinic has no patients
- **WHEN** user navigates to `/patients`
- **THEN** page displays empty state message:
  - Icon (person outline)
  - Text: "No hay pacientes registrados"
  - Button: "Registrar primer paciente"

---

### Requirement: REQ-UI-002 — Create Patient Form

The system **MUST** provide a form to register new patients.

#### Scenario: Display create patient form

- **GIVEN** user is on `/patients`
- **WHEN** user clicks "Nuevo Paciente" button
- **THEN** dialog/drawer opens with form:
  - **Sección Datos Personales**:
    - Nombre y Apellido* (required, text input)
    - DNI* (required, text input, max 8 digits)
    - Fecha de Nacimiento (date picker, optional)
    - Género (select: M/F/Otro, optional)
  - **Sección Contacto**:
    - Teléfono* (required, text input, format: +54...)
    - Email (optional, email input)
    - Dirección (optional, text input)
  - **Sección Adicional**:
    - Ocupación (optional, text input)
    - Obra Social (optional, select from clinic socialWorks)
  - Buttons: "Cancelar" | "Guardar"

#### Scenario: Submit valid patient form

- **GIVEN** user fills all required fields correctly
- **WHEN** user clicks "Guardar"
- **THEN** POST `/api/patients` is called
- **AND** success message appears: "Paciente registrado exitosamente"
- **AND** dialog closes
- **AND** patient list refreshes
- **AND** user is navigated to `/patients/:id` (new patient detail)

#### Scenario: Validation — missing required fields

- **GIVEN** user opens create patient form
- **WHEN** user clicks "Guardar" without filling required fields
- **THEN** error messages appear below each empty required field:
  - "Nombre y Apellido es requerido"
  - "DNI es requerido"
  - "Teléfono es requerido"
- **AND** form is NOT submitted

#### Scenario: Validation — duplicate DNI

- **GIVEN** patient with DNI "12345678" already exists
- **WHEN** user tries to create patient with same DNI
- **THEN** API returns 400 error
- **AND** error toast appears: "Ya existe un paciente con este DNI"

#### Scenario: Cancel form

- **GIVEN** user has filled some fields
- **WHEN** user clicks "Cancelar"
- **THEN** confirmation dialog appears: "¿Descartar cambios?"
- **AND** if user confirms, dialog closes without saving

---

### Requirement: REQ-UI-003 — Patient Detail Page

The system **MUST** provide a patient detail page with clinical history and follow-ups.

#### Scenario: Display patient detail

- **GIVEN** user navigates to `/patients/pat123`
- **THEN** page displays:
  - **Header Section**:
    - Patient name (large title)
    - Clinical number (PAC-XXX)
    - Age and gender
    - Contact info (phone, email)
    - "Editar Paciente" button
  - **Tabs**:
    - Tab 1: "Historia Clínica" (default active)
    - Tab 2: "Seguimientos"
    - Tab 3: "Citas" (upcoming/past appointments)

#### Scenario: Tab 1 — Clinical History (existing)

- **GIVEN** patient has clinical history
- **WHEN** user is on "Historia Clínica" tab
- **THEN** page displays:
  - Anamnesis section (chief complaint, medical/dental history)
  - Helkimo Indices (AI + DI with scores and classification badges)
  - Signs and Symptoms (checkboxes: dolor muscular, chasquidos, etc.)
  - Bruxism assessment (type + severity)
  - Treatment plan (text area)
  - Observations (text area)
  - "Editar Historia Clínica" button
  - Timestamp: "Creada el DD/MM/YYYY por [Usuario]"

#### Scenario: Tab 1 — Clinical History (not created yet)

- **GIVEN** patient has NO clinical history
- **WHEN** user is on "Historia Clínica" tab
- **THEN** page displays empty state:
  - Icon (document outline)
  - Text: "No hay historia clínica registrada"
  - Button: "Crear Historia Clínica"

#### Scenario: Create clinical history

- **GIVEN** patient has no clinical history
- **WHEN** user clicks "Crear Historia Clínica"
- **THEN** form appears with sections:
  - **Anamnesis**:
    - Motivo de consulta (textarea)
    - Antecedentes médicos (textarea)
    - Antecedentes odontológicos (textarea)
  - **Índices de Helkimo**:
    - AI: Score (number input 0-100) → Classification (auto-calculated badge)
    - DI: Score (number input 0-25) → Classification (auto-calculated badge)
  - **Signos y Síntomas** (checkboxes):
    - ☐ Dolor muscular
    - ☐ Chasquidos articulares
    - ☐ Limitación de apertura
    - ☐ Cefaleas
  - **Bruxismo**:
    - Tipo (select: Ninguno/Diurno/Nocturno/Mixto)
    - Severidad (select: Ninguna/Leve/Moderado/Grave)
  - **Tratamiento Indicado** (textarea)
  - **Observaciones** (textarea)
  - Buttons: "Cancelar" | "Guardar"

#### Scenario: Auto-calculate Helkimo classification

- **GIVEN** user enters AI score "15"
- **WHEN** input loses focus (onBlur)
- **THEN** badge next to score updates to "Moderado" (orange color)

#### Scenario: Edit clinical history

- **GIVEN** patient has clinical history
- **WHEN** user clicks "Editar Historia Clínica"
- **THEN** same form appears in edit mode with current values pre-filled
- **AND** user can update fields
- **AND** "Guardar" calls PUT `/api/clinical-histories/:id`

---

### Requirement: REQ-UI-004 — Follow-Ups Timeline

The system **MUST** provide a timeline view of patient follow-ups.

#### Scenario: Display follow-ups timeline

- **GIVEN** patient has 3 follow-ups
- **WHEN** user is on "Seguimientos" tab
- **THEN** page displays vertical timeline:
  - Each follow-up card shows:
    - Date (DD/MM/YYYY)
    - Symptoms (text)
    - Treatment (text)
    - Notes (text)
    - "Editar" icon button
  - Timeline is ordered by date DESC (most recent first)
  - "Nuevo Seguimiento" button (top right)

#### Scenario: Empty follow-ups state

- **GIVEN** patient has no follow-ups
- **WHEN** user is on "Seguimientos" tab
- **THEN** page displays empty state:
  - Icon (timeline outline)
  - Text: "No hay seguimientos registrados"
  - Button: "Registrar primer seguimiento"

#### Scenario: Create follow-up

- **GIVEN** user is on "Seguimientos" tab
- **WHEN** user clicks "Nuevo Seguimiento"
- **THEN** dialog opens with form:
  - Fecha (date picker, default: today)
  - Síntomas (textarea)
  - Tratamiento (textarea)
  - Notas (textarea, optional)
  - Buttons: "Cancelar" | "Guardar"

#### Scenario: Link follow-up to appointment (optional)

- **GIVEN** patient has upcoming appointment
- **WHEN** user creates follow-up
- **THEN** form includes optional field:
  - "Relacionar con cita" (select dropdown with upcoming appointments)
- **AND** if selected, appointmentId is included in POST request

#### Scenario: Edit follow-up

- **GIVEN** follow-up exists
- **WHEN** user clicks "Editar" icon
- **THEN** dialog opens with form pre-filled
- **AND** user can update fields
- **AND** "Guardar" calls PUT `/api/follow-ups/:id`

---

### Requirement: REQ-UI-005 — Integration with Appointments

The system **MUST** provide access to patient clinical history from appointment cards.

#### Scenario: Access clinical history from appointment card

- **GIVEN** appointment for patient "Juan Pérez" (patientId: "pat123")
- **WHEN** user is on Dashboard viewing appointment card
- **THEN** card displays:
  - Patient name (clickable link)
  - Icon button "Historia Clínica" (document icon)

#### Scenario: Click "Historia Clínica" button from appointment

- **GIVEN** appointment card for patient "pat123"
- **WHEN** user clicks "Historia Clínica" icon
- **THEN** drawer/modal opens showing:
  - Patient summary (name, age, clinical number)
  - Clinical history summary (if exists):
    - Helkimo indices
    - Main symptoms
    - Current treatment
  - Latest follow-up (if exists)
  - Button: "Ver Historial Completo" → navigates to `/patients/pat123`

#### Scenario: Auto-create patient from appointment

- **GIVEN** appointment has clientName "Juan Pérez" and phone "+5491112345678"
- **AND** no patient exists with matching phone
- **WHEN** user clicks "Historia Clínica" icon
- **THEN** system suggests: "¿Crear ficha de paciente para Juan Pérez?"
- **AND** if user confirms, patient is auto-created with:
  - fullName = appointment.clientName
  - phone = appointment.phone
  - socialWork = appointment.socialWork
- **AND** patient detail opens for clinical history creation

#### Scenario: Match patient by phone

- **GIVEN** appointment has phone "+5491112345678"
- **AND** patient "pat123" has same phone
- **WHEN** user clicks "Historia Clínica" icon
- **THEN** patient "pat123" clinical history is displayed (auto-matched)

---

### Requirement: REQ-UI-006 — Responsive Design

The system **MUST** be usable on mobile devices (responsive design).

#### Scenario: Patient list on mobile

- **GIVEN** user accesses `/patients` on mobile (viewport <600px)
- **THEN** table converts to card layout:
  - Each patient is a card with:
    - Name (bold, large)
    - Clinical number (subtitle)
    - Phone (with call icon)
    - Age badge
    - Arrow icon (navigate to detail)

#### Scenario: Forms on mobile

- **GIVEN** user opens create patient form on mobile
- **THEN** form fields stack vertically
- **AND** date pickers adapt to mobile native pickers
- **AND** buttons are full-width

#### Scenario: Timeline on mobile

- **GIVEN** user views follow-ups timeline on mobile
- **THEN** timeline uses simplified layout (no left/right alternation)
- **AND** cards are full-width with padding

---

### Requirement: REQ-UI-007 — Loading and Error States

The system **MUST** provide clear feedback for loading and error states.

#### Scenario: Loading patient list

- **GIVEN** user navigates to `/patients`
- **WHEN** data is being fetched
- **THEN** skeleton loaders appear (3-5 placeholder rows)
- **AND** search bar is disabled until data loads

#### Scenario: API error

- **GIVEN** GET `/api/patients` returns 500 error
- **WHEN** user is on `/patients`
- **THEN** error alert appears:
  - Icon (error outline)
  - Text: "Error al cargar pacientes. Intentá nuevamente."
  - Button: "Reintentar"

#### Scenario: Network error

- **GIVEN** user has no internet connection
- **WHEN** user tries to create patient
- **THEN** error toast appears: "Error de conexión. Verificá tu internet."

#### Scenario: Success feedback

- **GIVEN** user creates patient successfully
- **THEN** success toast appears (green, auto-dismiss after 3s):
  - "Paciente registrado exitosamente"

---

### Requirement: REQ-UI-008 — Helkimo Classification Badges

The system **MUST** display Helkimo classifications with color-coded badges.

#### Scenario: AI/DI classification colors

- **GIVEN** clinical history with Helkimo indices
- **THEN** badges are displayed with colors:
  - "Sin síntomas" / "Sin signos clínicos" → Grey (#9e9e9e)
  - "Leve" → Green (#4caf50)
  - "Moderado" → Orange (#ff9800)
  - "Grave" → Red (#f44336)

#### Scenario: Display AI and DI side by side

- **GIVEN** clinical history form
- **WHEN** user views Helkimo section
- **THEN** AI and DI are displayed in two columns:
  - **Índice Anamnésico (AI)**
    - Score: [input] / 100
    - Classification: [badge]
  - **Índice de Disfunción (DI)**
    - Score: [input] / 25
    - Classification: [badge]

---

### Requirement: REQ-UI-009 — Accessibility (a11y)

The system **SHOULD** follow WCAG 2.1 AA accessibility guidelines.

#### Scenario: Keyboard navigation

- **GIVEN** user navigates using keyboard only
- **WHEN** user presses Tab
- **THEN** focus moves logically through interactive elements
- **AND** focus indicator is clearly visible

#### Scenario: Screen reader support

- **GIVEN** user uses screen reader
- **WHEN** user navigates patient list
- **THEN** each row is announced as "Patient: Juan Pérez, Clinical Number PAC-001, Phone +54..."

#### Scenario: Form labels

- **GIVEN** user is on create patient form
- **THEN** all inputs have associated `<label>` elements
- **AND** required fields have `aria-required="true"`

---

## Page Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/patients` | `Patients.tsx` | Patient list with search and pagination |
| `/patients/new` | `PatientForm.tsx` (in dialog/drawer) | Create new patient |
| `/patients/:id` | `PatientDetail.tsx` | Patient detail with tabs (history, follow-ups, appointments) |
| `/patients/:id/edit` | `PatientForm.tsx` (edit mode) | Edit patient info |

---

## Component Structure

```
src/pages/
  ├── Patients.tsx           (Patient list page)
  └── PatientDetail.tsx      (Patient detail with tabs)

src/components/
  ├── PatientList.tsx        (Table/card list of patients)
  ├── PatientForm.tsx        (Create/edit patient dialog)
  ├── PatientSearch.tsx      (Search bar with debounce)
  ├── ClinicalHistoryForm.tsx (Create/edit clinical history)
  ├── ClinicalHistoryView.tsx (Read-only view)
  ├── FollowUpTimeline.tsx    (Timeline of follow-ups)
  ├── FollowUpForm.tsx        (Create/edit follow-up dialog)
  ├── HelkimoIndicator.tsx    (AI/DI score + classification badge)
  └── PatientQuickView.tsx    (Drawer from appointment card)
```

---

## TypeScript Types

```typescript
// frontend/src/types/patient.ts

export interface Patient {
  _id: string;
  clinicId: string;
  fullName: string;
  dni: string;
  birthDate?: string;
  age?: number; // virtual field
  gender?: 'M' | 'F' | 'Otro';
  phone: string;
  email?: string;
  address?: string;
  occupation?: string;
  socialWork?: string;
  clinicNumber: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalHistory {
  _id: string;
  clinicId: string;
  patientId: string;
  createdBy?: string;
  chiefComplaint?: string;
  medicalHistory?: string;
  dentalHistory?: string;
  helkimoAI?: {
    score: number;
    classification: 'Sin síntomas' | 'Leve' | 'Moderado' | 'Grave';
  };
  helkimoDI?: {
    score: number;
    classification: 'Sin signos clínicos' | 'Leve' | 'Moderado' | 'Grave';
  };
  musclePain: boolean;
  jointSounds: boolean;
  openingLimitation: boolean;
  headaches: boolean;
  bruxism: {
    type: 'Ninguno' | 'Diurno' | 'Nocturno' | 'Mixto';
    severity: 'Ninguna' | 'Leve' | 'Moderado' | 'Grave';
  };
  treatment?: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUp {
  _id: string;
  clinicId: string;
  clinicalHistoryId: string;
  patientId: string;
  appointmentId?: string;
  date: string;
  symptoms?: string;
  treatment?: string;
  notes?: string;
  createdAt: string;
}
```

---

**Total Requirements**: 9  
**Total Scenarios**: 35  
**Coverage**: Pages ✅ | Components ✅ | Forms ✅ | Integration ✅ | Responsive ✅ | a11y ✅
