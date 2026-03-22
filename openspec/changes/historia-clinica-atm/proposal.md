# Proposal: Módulo de Historias Clínicas ATM

**Project**: CitaMedicaBeta  
**Change**: historia-clinica-atm  
**Date**: 2026-03-21  
**Complexity**: MEDIA-ALTA (28-38 horas estimadas)

---

## Intent

**Problema de Negocio**: Od. Melina Villalba necesita digitalizar y sistematizar las historias clínicas de pacientes con trastornos de ATM (Articulación Temporomandibular) y bruxismo. Actualmente gestiona estos datos en papel o planillas sueltas, lo que dificulta:
- Seguimiento longitudinal de tratamientos
- Acceso rápido durante consultas
- Trazabilidad de evolución del paciente
- Análisis de patrones y resultados

**Necesidad del Usuario**: Sistema integrado en CitaMedicaBeta que permita crear, visualizar y actualizar historias clínicas especializadas en ATM, vinculadas a las citas existentes, con campos específicos del dominio odontológico (índices Helkimo, mapa de dolor Rocabado, evolución de síntomas).

**Valor**: Mejora la calidad de atención, reduce tiempo de consulta, facilita decisiones clínicas basadas en historial completo, y profesionaliza el consultorio.

---

## Scope

### In Scope

#### MVP (Fase 1)
- **Modelo Patient**: 
  - Datos demográficos (nombre, DNI, edad, género, teléfono, email)
  - Información médica básica (obra social, ocupación, dirección)
  - Vinculación con appointments existentes
  - Multi-tenant por `clinicId`

- **Modelo ClinicalHistory (ATM/Bruxismo)**:
  - Ficha de anamnesis ATM (motivo consulta, antecedentes médicos/odontológicos)
  - Índice de Helkimo (DI = Índice de Disfunción, AI = Índice Anamnésico)
  - Signos y síntomas (dolor muscular, chasquidos, limitación apertura, cefaleas, bruxismo)
  - Tratamiento indicado y observaciones

- **Modelo FollowUp**:
  - Evoluciones por fecha
  - Cambios en síntomas
  - Ajustes de tratamiento
  - Notas de consulta

- **CRUD Backend**:
  - Endpoints REST para Patient, ClinicalHistory, FollowUp
  - Validaciones por tenant (aislamiento multi-tenant)
  - Búsqueda de pacientes (por nombre, DNI, teléfono)

- **UI Frontend**:
  - Listado de pacientes con búsqueda
  - Formulario de creación/edición de historia clínica
  - Vista de seguimientos (timeline)
  - Integración con appointments (acceso desde tarjeta de cita)

#### Opcional (si hay tiempo)
- Upload de archivos adjuntos (radiografías) - Storage en filesystem local o cloud (S3)
- Exportación PDF de historia clínica
- Mapa de dolor interactivo (simplificado)

### Out of Scope (para futuras iteraciones)

- ❌ Mapa de dolor Rocabado completo con canvas interactivo (complejidad UI alta)
- ❌ Sistema de recordatorios automáticos de seguimiento
- ❌ Análisis estadístico de resultados de tratamientos
- ❌ Integración con sistemas de facturación
- ❌ Firma digital de profesional
- ❌ Historial odontológico completo (odontograma, periodoncia, endodoncia)
- ❌ Multi-profesional (compartir pacientes entre odontólogos)

---

## Approach

### Estrategia Técnica

**1. Backend (Node.js + Express + MongoDB)**

Crear 3 nuevos modelos Mongoose:

```javascript
// models/patient.js
{
  clinicId: ObjectId (required, indexed),
  fullName: String (required),
  dni: String (required, unique per clinic),
  birthDate: String,
  gender: String (enum),
  phone: String (required),
  email: String,
  address: String,
  occupation: String,
  socialWork: String,
  clinicNumber: String (auto-generado),
  createdAt: Date,
  updatedAt: Date
}

// models/clinicalHistory.js
{
  clinicId: ObjectId (required),
  patientId: ObjectId (required, ref: 'Patient'),
  createdBy: ObjectId (ref: 'User'),
  
  // Anamnesis
  chiefComplaint: String,
  medicalHistory: String,
  dentalHistory: String,
  
  // Helkimo Indices
  helkimoAI: { score: Number, classification: String },
  helkimoDI: { score: Number, classification: String },
  
  // Signs & Symptoms
  musclePain: Boolean,
  jointSounds: Boolean,
  openingLimitation: Boolean,
  headaches: Boolean,
  bruxism: { type: String, severity: String },
  
  // Treatment
  treatment: String,
  observations: String,
  
  createdAt: Date,
  updatedAt: Date
}

// models/followUp.js
{
  clinicId: ObjectId (required),
  clinicalHistoryId: ObjectId (required, ref: 'ClinicalHistory'),
  patientId: ObjectId (required, ref: 'Patient'),
  appointmentId: ObjectId (optional, ref: 'Appointment'),
  
  date: String,
  symptoms: String,
  treatment: String,
  notes: String,
  
  createdAt: Date
}
```

**2. Routes & Controllers**

```
/api/patients
  GET    / (list + search)
  POST   / (create)
  GET    /:id
  PUT    /:id
  DELETE /:id (soft delete)

/api/clinical-histories
  POST   / (create for patient)
  GET    /patient/:patientId
  PUT    /:id
  
/api/follow-ups
  POST   / (create follow-up)
  GET    /clinical-history/:clinicalHistoryId
  PUT    /:id
```

**3. Frontend (React + Material-UI)**

Nuevas páginas:
- `/patients` - Listado con búsqueda
- `/patients/:id` - Detalle de paciente + historia clínica + seguimientos
- `/patients/new` - Alta de paciente
- `/clinical-history/new/:patientId` - Nueva historia clínica

Componentes nuevos:
- `PatientList.tsx` - Tabla con búsqueda
- `PatientForm.tsx` - Formulario de paciente
- `ClinicalHistoryForm.tsx` - Formulario ATM
- `FollowUpTimeline.tsx` - Timeline de evoluciones
- `PatientDrawer.tsx` - Acceso rápido desde appointment

**4. Integración con Appointments**

- Agregar botón "Ver Historia Clínica" en tarjetas de citas
- Crear paciente automáticamente desde appointment si no existe (matching por teléfono/nombre)
- Vincular follow-ups con appointments

---

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/models/` | New | Agregar `patient.js`, `clinicalHistory.js`, `followUp.js` |
| `backend/src/controllers/` | New | Agregar `patientController.js`, `clinicalHistoryController.js`, `followUpController.js` |
| `backend/src/routes/` | New | Agregar `patientRoutes.js`, `clinicalHistoryRoutes.js`, `followUpRoutes.js` |
| `backend/src/middleware/tenantResolver.js` | Modified | Asegurar aislamiento multi-tenant en nuevos endpoints |
| `frontend/src/pages/` | New | Agregar `Patients.tsx`, `PatientDetail.tsx` |
| `frontend/src/components/` | New | Agregar componentes de historias clínicas |
| `frontend/src/App.tsx` | Modified | Agregar rutas `/patients`, `/patients/:id`, etc. |
| `frontend/src/components/SimpleAppointmentList.tsx` | Modified | Agregar botón "Historia Clínica" en tarjetas |
| `frontend/src/types/` | New | Agregar `patient.ts`, `clinicalHistory.ts` |
| `frontend/src/services/` | New | Agregar `patientService.ts`, `clinicalHistoryService.ts` |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Upload de archivos rompe por límites de tamaño** | Media | Alto | Implementar límite de 10MB por archivo, validar tipos permitidos (PDF, JPG, PNG), usar multer con disk storage |
| **Esquema de historia clínica no cubre casos reales** | Media | Medio | Validar con Od. Villalba en iteración temprana, campos opcionales para flexibilidad |
| **Performance en búsqueda de pacientes** | Baja | Medio | Índices en `clinicId + dni`, `clinicId + fullName`, paginación desde el inicio |
| **Aislamiento multi-tenant con nuevo módulo** | Baja | Alto | Reutilizar middleware `tenantResolver` existente, tests de aislamiento |
| **Migración de datos de appointments existentes** | Media | Bajo | Crear pacientes retroactivamente desde appointments con script de migración |
| **UI compleja de índices Helkimo** | Baja | Bajo | Formulario simple con inputs numéricos + clasificación auto-calculada |

---

## Rollback Plan

**Si algo falla en producción:**

1. **Backend**: 
   - NO eliminar modelos (pueden tener datos)
   - Comentar las rutas nuevas en `server.js`
   - Reiniciar servidor con código previo

2. **Frontend**:
   - Revertir commit con `git revert`
   - Rebuild frontend (`npm run build`)
   - Deploy versión anterior

3. **Base de datos**:
   - NO se requiere rollback de schema (MongoDB es schema-less)
   - Si hay datos corruptos, usar backup previo de MongoDB
   - Collections nuevas (`patients`, `clinicalhistories`, `followups`) pueden quedar sin uso

4. **Mitigación de impacto**:
   - Módulo es ADITIVO, no modifica funcionalidad existente de appointments
   - Otras clínicas (Dr. Kulinka) NO se ven afectadas (feature-flag por `clinicName`)

**Tiempo estimado de rollback**: 15-30 minutos

---

## Dependencies

**Técnicas**:
- ✅ MongoDB (ya existe)
- ✅ Mongoose (ya existe)
- ✅ Material-UI v7 (ya existe)
- ✅ Multi-tenant middleware (ya existe)
- 🆕 `multer` (si implementamos upload de archivos) - npm install multer
- 🆕 `pdfkit` o `jspdf` (si implementamos export PDF) - decidir según necesidad

**De Negocio**:
- ✅ Validación de Od. Villalba del esquema de historia clínica
- ❓ Definición de qué archivos se pueden adjuntar (radiografías, estudios)

**De Producto**:
- Ninguna - este módulo NO bloquea ni es bloqueado por otros cambios en progreso

---

## Success Criteria

- [ ] **Backend**: CRUD completo de Patient, ClinicalHistory, FollowUp con aislamiento multi-tenant funcionando
- [ ] **API**: Endpoints responden correctamente y validan tenant (tests con Postman/Thunder Client)
- [ ] **Frontend**: Od. Villalba puede crear un paciente, agregar historia clínica ATM, y registrar seguimientos
- [ ] **Integración**: Desde una cita en el dashboard, puede acceder a la historia clínica del paciente
- [ ] **Búsqueda**: Puede buscar pacientes por nombre, DNI o teléfono en menos de 1 segundo
- [ ] **Multi-tenant**: Dr. Kulinka NO ve pacientes de Od. Villalba y viceversa
- [ ] **Data Integrity**: No se crean pacientes duplicados (validación por DNI por clínica)
- [ ] **UX**: Formularios son usables en mobile (responsive design)
- [ ] **Producción**: Deploy exitoso sin afectar funcionalidad existente de appointments
- [ ] **Validación de usuario**: Od. Villalba confirma que el esquema cubre sus necesidades reales

---

## Estimación de Esfuerzo

**Backend**: 12-16 horas
- Modelos: 3h
- Controllers: 4h
- Routes + Middleware: 2h
- Testing manual: 3h
- Migration script (opcional): 2h

**Frontend**: 14-18 horas
- Páginas: 6h
- Componentes: 5h
- Servicios API: 2h
- Integración con appointments: 2h
- Testing manual + ajustes UX: 3h

**Documentación + Deploy**: 2-4 horas

**TOTAL**: 28-38 horas

---

## Next Steps

1. **Validación con cliente**: Mostrar este proposal a Od. Villalba para confirmar scope
2. **sdd-spec**: Escribir especificaciones detalladas de endpoints y UI
3. **sdd-design**: Diseño técnico de arquitectura e integraciones
4. **sdd-tasks**: Breakdown de tareas para implementación
5. **sdd-apply**: Implementación en sprints

---

**Status**: ✅ READY FOR REVIEW  
**Recommended Next Phase**: `sdd-spec` (escribir especificaciones técnicas)
