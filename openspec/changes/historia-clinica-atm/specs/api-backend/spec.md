# API Backend Specification — Historia Clínica ATM

**Domain**: API Backend  
**Change**: historia-clinica-atm  
**Type**: NEW (full specification)  
**Date**: 2026-03-21

---

## Purpose

Define RESTful API endpoints for managing patients, clinical histories, and follow-ups in the CitaMedicaBeta multi-tenant system. All endpoints MUST enforce tenant isolation using the existing `tenantResolver` middleware.

---

## Requirements

### Requirement: REQ-API-001 — Patient CRUD Operations

The system **MUST** provide RESTful endpoints to create, read, update, and delete patient records.

#### Scenario: Create new patient successfully

- **GIVEN** an authenticated user with clinicId = "clinic123"
- **WHEN** POST `/api/patients` with body:
  ```json
  {
    "fullName": "Juan Pérez",
    "dni": "12345678",
    "birthDate": "1985-05-15",
    "gender": "M",
    "phone": "+5491112345678",
    "email": "juan@example.com",
    "address": "Av. Corrientes 1234",
    "occupation": "Ingeniero",
    "socialWork": "OSDE"
  }
  ```
- **THEN** response status is 201 Created
- **AND** response body contains:
  ```json
  {
    "success": true,
    "data": {
      "_id": "pat123",
      "clinicId": "clinic123",
      "fullName": "Juan Pérez",
      "dni": "12345678",
      "clinicNumber": "PAC-001",
      "birthDate": "1985-05-15",
      "age": 40,
      "gender": "M",
      "phone": "+5491112345678",
      "email": "juan@example.com",
      "address": "Av. Corrientes 1234",
      "occupation": "Ingeniero",
      "socialWork": "OSDE",
      "createdAt": "2026-03-21T10:00:00.000Z",
      "updatedAt": "2026-03-21T10:00:00.000Z"
    }
  }
  ```
- **AND** patient is saved in MongoDB with `clinicId: "clinic123"`

#### Scenario: Create patient with duplicate DNI in same clinic fails

- **GIVEN** patient with DNI "12345678" already exists in clinic "clinic123"
- **WHEN** POST `/api/patients` with DNI "12345678" for clinic "clinic123"
- **THEN** response status is 400 Bad Request
- **AND** response body contains:
  ```json
  {
    "success": false,
    "message": "Ya existe un paciente con este DNI en esta clínica"
  }
  ```

#### Scenario: Create patient with duplicate DNI in different clinic succeeds

- **GIVEN** patient with DNI "12345678" exists in clinic "clinicA"
- **WHEN** POST `/api/patients` with DNI "12345678" for clinic "clinicB"
- **THEN** response status is 201 Created
- **AND** patient is created successfully (DNI unique per clinic, not globally)

#### Scenario: List patients with search filter

- **GIVEN** clinic "clinic123" has 3 patients: "Juan Pérez", "María López", "Pedro Gómez"
- **WHEN** GET `/api/patients?search=juan`
- **THEN** response status is 200 OK
- **AND** response contains only patient "Juan Pérez"

#### Scenario: Get patient by ID

- **GIVEN** patient with ID "pat123" exists in clinic "clinic123"
- **WHEN** GET `/api/patients/pat123`
- **THEN** response status is 200 OK
- **AND** response body contains patient data

#### Scenario: Update patient

- **GIVEN** patient "pat123" exists
- **WHEN** PUT `/api/patients/pat123` with body `{ "phone": "+5491199999999" }`
- **THEN** response status is 200 OK
- **AND** patient phone is updated
- **AND** `updatedAt` timestamp is refreshed

#### Scenario: Delete patient (soft delete)

- **GIVEN** patient "pat123" exists
- **WHEN** DELETE `/api/patients/pat123`
- **THEN** response status is 200 OK
- **AND** patient is marked as deleted (soft delete, not removed from DB)

---

### Requirement: REQ-API-002 — Clinical History CRUD Operations

The system **MUST** provide endpoints to manage clinical histories for ATM patients.

#### Scenario: Create clinical history for patient

- **GIVEN** patient "pat123" exists in clinic "clinic123"
- **AND** authenticated user "user456"
- **WHEN** POST `/api/clinical-histories` with body:
  ```json
  {
    "patientId": "pat123",
    "chiefComplaint": "Dolor en ATM al masticar",
    "medicalHistory": "HTA controlada",
    "dentalHistory": "Ortodoncia hace 5 años",
    "helkimoAI": { "score": 15, "classification": "Leve" },
    "helkimoDI": { "score": 20, "classification": "Moderado" },
    "musclePain": true,
    "jointSounds": false,
    "openingLimitation": true,
    "headaches": true,
    "bruxism": { "type": "Nocturno", "severity": "Moderado" },
    "treatment": "Placa de relajación nocturna",
    "observations": "Paciente muy tenso, recomendar fisioterapia"
  }
  ```
- **THEN** response status is 201 Created
- **AND** response contains clinical history with ID
- **AND** `createdBy` field is set to "user456"
- **AND** `clinicId` field is set to "clinic123"

#### Scenario: Get clinical history by patient ID

- **GIVEN** patient "pat123" has clinical history "ch456"
- **WHEN** GET `/api/clinical-histories/patient/pat123`
- **THEN** response status is 200 OK
- **AND** response body contains clinical history "ch456"

#### Scenario: Update clinical history

- **GIVEN** clinical history "ch456" exists
- **WHEN** PUT `/api/clinical-histories/ch456` with body `{ "treatment": "Placa ajustada + ejercicios" }`
- **THEN** response status is 200 OK
- **AND** treatment field is updated
- **AND** `updatedAt` timestamp is refreshed

#### Scenario: Tenant isolation — cannot access other clinic's clinical history

- **GIVEN** clinical history "ch456" belongs to clinic "clinicA"
- **WHEN** user from clinic "clinicB" requests GET `/api/clinical-histories/ch456`
- **THEN** response status is 404 Not Found
- **AND** clinical history is NOT returned

---

### Requirement: REQ-API-003 — Follow-Up Operations

The system **MUST** provide endpoints to record and retrieve patient follow-ups.

#### Scenario: Create follow-up linked to appointment

- **GIVEN** clinical history "ch456" for patient "pat123"
- **AND** appointment "apt789" exists for patient "pat123"
- **WHEN** POST `/api/follow-ups` with body:
  ```json
  {
    "clinicalHistoryId": "ch456",
    "patientId": "pat123",
    "appointmentId": "apt789",
    "date": "2026-03-21",
    "symptoms": "Mejora del dolor, persiste leve chasquido",
    "treatment": "Ajuste de placa, continuar",
    "notes": "Paciente satisfecho con evolución"
  }
  ```
- **THEN** response status is 201 Created
- **AND** response contains follow-up with ID
- **AND** `clinicId` is inherited from clinical history

#### Scenario: Create follow-up without appointment

- **GIVEN** clinical history "ch456" exists
- **WHEN** POST `/api/follow-ups` with body (without `appointmentId`):
  ```json
  {
    "clinicalHistoryId": "ch456",
    "patientId": "pat123",
    "date": "2026-03-25",
    "symptoms": "Control telefónico, sin dolor",
    "treatment": "Continuar con placa",
    "notes": "Llamada de seguimiento"
  }
  ```
- **THEN** response status is 201 Created
- **AND** follow-up is created without appointment linkage

#### Scenario: List follow-ups for clinical history

- **GIVEN** clinical history "ch456" has 3 follow-ups
- **WHEN** GET `/api/follow-ups/clinical-history/ch456`
- **THEN** response status is 200 OK
- **AND** response contains array of 3 follow-ups ordered by date DESC

#### Scenario: Update follow-up

- **GIVEN** follow-up "fu123" exists
- **WHEN** PUT `/api/follow-ups/fu123` with body `{ "notes": "Actualización: paciente canceló próxima cita" }`
- **THEN** response status is 200 OK
- **AND** notes field is updated

---

### Requirement: REQ-API-004 — Search and Filter Patients

The system **MUST** support searching patients by multiple criteria within the tenant.

#### Scenario: Search by full name (case insensitive)

- **GIVEN** patients "Juan Pérez", "María Juan", "Pedro López"
- **WHEN** GET `/api/patients?search=juan`
- **THEN** response contains "Juan Pérez" and "María Juan"
- **AND** "Pedro López" is NOT included

#### Scenario: Search by DNI

- **GIVEN** patient with DNI "12345678"
- **WHEN** GET `/api/patients?search=12345678`
- **THEN** response contains patient with DNI "12345678"

#### Scenario: Search by phone

- **GIVEN** patient with phone "+5491112345678"
- **WHEN** GET `/api/patients?search=1112345678`
- **THEN** response contains patient with matching phone

#### Scenario: Pagination

- **GIVEN** 50 patients in clinic
- **WHEN** GET `/api/patients?page=2&limit=10`
- **THEN** response contains patients 11-20
- **AND** response includes pagination metadata:
  ```json
  {
    "success": true,
    "data": [...],
    "pagination": {
      "total": 50,
      "page": 2,
      "limit": 10,
      "totalPages": 5
    }
  }
  ```

---

### Requirement: REQ-API-005 — Data Validation

The system **MUST** validate all input data before persisting to database.

#### Scenario: Missing required fields returns 400

- **GIVEN** authenticated user
- **WHEN** POST `/api/patients` with body missing `fullName`:
  ```json
  {
    "dni": "12345678",
    "phone": "+5491112345678"
  }
  ```
- **THEN** response status is 400 Bad Request
- **AND** response contains validation error:
  ```json
  {
    "success": false,
    "message": "Campo requerido: fullName"
  }
  ```

#### Scenario: Invalid date format returns 400

- **GIVEN** authenticated user
- **WHEN** POST `/api/patients` with invalid birthDate:
  ```json
  {
    "fullName": "Juan Pérez",
    "dni": "12345678",
    "birthDate": "15/05/1985",
    "phone": "+5491112345678"
  }
  ```
- **THEN** response status is 400 Bad Request
- **AND** response contains error: "Formato de fecha inválido. Use YYYY-MM-DD"

#### Scenario: Invalid gender value returns 400

- **GIVEN** authenticated user
- **WHEN** POST `/api/patients` with gender "X"
- **THEN** response status is 400 Bad Request
- **AND** response contains error: "Género debe ser M, F, u Otro"

---

### Requirement: REQ-API-006 — Auto-generated Clinical Number

The system **MUST** auto-generate a unique clinical number for each new patient within the clinic.

#### Scenario: First patient gets PAC-001

- **GIVEN** clinic "clinic123" has no patients
- **WHEN** POST `/api/patients` creates first patient
- **THEN** patient receives `clinicNumber: "PAC-001"`

#### Scenario: Second patient gets PAC-002

- **GIVEN** clinic "clinic123" already has patient with `clinicNumber: "PAC-001"`
- **WHEN** POST `/api/patients` creates second patient
- **THEN** patient receives `clinicNumber: "PAC-002"`

#### Scenario: Different clinics have independent counters

- **GIVEN** clinic "clinicA" has patient "PAC-010"
- **AND** clinic "clinicB" has no patients
- **WHEN** POST `/api/patients` creates patient in clinic "clinicB"
- **THEN** patient receives `clinicNumber: "PAC-001"` (independent counter)

---

### Requirement: REQ-API-007 — Age Calculation (Virtual Field)

The system **MUST** calculate patient age automatically from `birthDate` when returning patient data.

#### Scenario: Calculate age from birthDate

- **GIVEN** patient with birthDate "1985-05-15"
- **AND** current date is "2026-03-21"
- **WHEN** GET `/api/patients/{id}`
- **THEN** response contains `age: 40` (calculated field, not stored in DB)

#### Scenario: Age updates automatically with time

- **GIVEN** patient with birthDate "2000-12-31"
- **AND** current date is "2026-01-01"
- **WHEN** GET `/api/patients/{id}`
- **THEN** response contains `age: 25`
- **AND** on "2027-01-01", same query returns `age: 26`

---

### Requirement: REQ-API-008 — Helkimo Index Auto-classification

The system **SHOULD** auto-calculate Helkimo classification based on score when creating/updating clinical history.

#### Scenario: AI score 0 → Sin síntomas

- **GIVEN** clinical history with `helkimoAI.score = 0`
- **WHEN** POST `/api/clinical-histories`
- **THEN** `helkimoAI.classification` is auto-set to "Sin síntomas"

#### Scenario: AI score 1-9 → Leve

- **GIVEN** clinical history with `helkimoAI.score = 5`
- **WHEN** POST `/api/clinical-histories`
- **THEN** `helkimoAI.classification` is auto-set to "Leve"

#### Scenario: AI score 10-24 → Moderado

- **GIVEN** clinical history with `helkimoAI.score = 15`
- **WHEN** POST `/api/clinical-histories`
- **THEN** `helkimoAI.classification` is auto-set to "Moderado"

#### Scenario: AI score 25+ → Grave

- **GIVEN** clinical history with `helkimoAI.score = 30`
- **WHEN** POST `/api/clinical-histories`
- **THEN** `helkimoAI.classification` is auto-set to "Grave"

#### Scenario: DI score 0 → Sin signos clínicos

- **GIVEN** clinical history with `helkimoDI.score = 0`
- **WHEN** POST `/api/clinical-histories`
- **THEN** `helkimoDI.classification` is auto-set to "Sin signos clínicos"

#### Scenario: DI score 1-4 → Leve

- **GIVEN** clinical history with `helkimoDI.score = 3`
- **WHEN** POST `/api/clinical-histories`
- **THEN** `helkimoDI.classification` is auto-set to "Leve"

#### Scenario: DI score 5-9 → Moderado

- **GIVEN** clinical history with `helkimoDI.score = 7`
- **WHEN** POST `/api/clinical-histories`
- **THEN** `helkimoDI.classification` is auto-set to "Moderado"

#### Scenario: DI score 10-25 → Grave

- **GIVEN** clinical history with `helkimoDI.score = 15`
- **WHEN** POST `/api/clinical-histories`
- **THEN** `helkimoDI.classification` is auto-set to "Grave"

---

### Requirement: REQ-API-009 — Multi-Tenant Isolation

The system **MUST** enforce strict tenant isolation for all patient, clinical history, and follow-up operations.

#### Scenario: User from clinicA cannot access clinicB patients

- **GIVEN** patient "pat123" belongs to clinic "clinicA"
- **AND** authenticated user belongs to clinic "clinicB"
- **WHEN** GET `/api/patients/pat123`
- **THEN** response status is 404 Not Found

#### Scenario: Search only returns patients from user's clinic

- **GIVEN** clinic "clinicA" has patient "Juan A"
- **AND** clinic "clinicB" has patient "Juan B"
- **WHEN** user from clinicA requests GET `/api/patients?search=juan`
- **THEN** response contains only "Juan A"
- **AND** "Juan B" is NOT included

#### Scenario: Create patient auto-assigns user's clinicId

- **GIVEN** authenticated user with clinicId "clinic123"
- **WHEN** POST `/api/patients` (body does NOT include clinicId)
- **THEN** patient is created with `clinicId: "clinic123"` (auto-assigned from req.clinicId)

---

## API Endpoint Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **GET** | `/api/patients` | List patients (with search/pagination) | Yes |
| **POST** | `/api/patients` | Create patient | Yes |
| **GET** | `/api/patients/:id` | Get patient by ID | Yes |
| **PUT** | `/api/patients/:id` | Update patient | Yes |
| **DELETE** | `/api/patients/:id` | Delete patient (soft) | Yes |
| **POST** | `/api/clinical-histories` | Create clinical history | Yes |
| **GET** | `/api/clinical-histories/patient/:patientId` | Get clinical history by patient | Yes |
| **PUT** | `/api/clinical-histories/:id` | Update clinical history | Yes |
| **POST** | `/api/follow-ups` | Create follow-up | Yes |
| **GET** | `/api/follow-ups/clinical-history/:clinicalHistoryId` | List follow-ups | Yes |
| **PUT** | `/api/follow-ups/:id` | Update follow-up | Yes |

---

## Error Response Format

All errors **MUST** follow this format:

```json
{
  "success": false,
  "message": "Error description in Spanish"
}
```

Common HTTP status codes:
- `200 OK` — Successful GET, PUT
- `201 Created` — Successful POST
- `400 Bad Request` — Validation error
- `401 Unauthorized` — Missing or invalid auth token
- `403 Forbidden` — User lacks permissions
- `404 Not Found` — Resource not found or tenant isolation violation
- `500 Internal Server Error` — Server error

---

**Total Requirements**: 9  
**Total Scenarios**: 42  
**Coverage**: Happy paths ✅ | Edge cases ✅ | Error states ✅
