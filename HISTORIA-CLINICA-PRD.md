# PRD: Sistema de Historias Clínicas Odontológicas

## 📋 Contexto

La Od. Melina Villalba utiliza actualmente un formato físico de "Historia Clínica de ATM" (Articulación Temporomandibular) en formato Word para registrar información de sus pacientes. Necesita digitalizar este proceso integrándolo al sistema web CitaMedicaBeta.

---

## 🎯 Objetivo

Crear un módulo de **Historias Clínicas Odontológicas** que permita:
1. Registrar y gestionar pacientes de forma centralizada
2. Documentar historias clínicas con enfoque en ATM y odontología general
3. Vincular historias clínicas con citas (appointments)
4. Visualizar el historial completo de un paciente
5. Soporte multi-tenant (Od. Villalba independiente del Dr. Kulinka)

---

## 📝 Campos del Formulario Actual (Formato Papel)

### **Sección 1: Datos del Paciente**
```
- Nombre y apellido
- Edad
- Fecha de nacimiento
- DNI
- Domicilio
- Teléfono
- Ocupación
- Obra social
```

### **Sección 2: Anamnesis (Datos Médicos)**
```
- Motivo de consulta
- Derivación (quién lo deriva)
- Tratamiento médico actual
- Medicación
- Alergias
- Accidentes o traumatismos
- Cirugías
```

### **Sección 3: Síntomas Específicos ATM (Checkboxes Sí/No)**
```
✓ Dolor de cuello
✓ Más estrés de lo normal
✓ Dolores de cabeza a repetición
✓ Dolor de oídos
✓ Tinnitus (zumbido en oídos)
✓ Dolor en la zona de ATM
✓ Siente ruidos en la mandíbula
✓ Se traba o trabó la mandíbula
✓ Dolor facial
✓ Dolor detrás de los ojos
✓ Sensibilidad en el cuero cabelludo
✓ Fatiga al masticar
✓ Frota o aprieta los dientes durante el día (bruxismo)
✓ Ortodoncia (tiene o tuvo)
✓ Hormigueos en manos o brazos
✓ Sensaciones nauseosas
✓ Mareos o vértigo
✓ Usa anteojos
✓ Plantillas (ortopédicas)
```

### **Sección 4: Evaluación Clínica**
```
- Desvío de línea media
  - Funcional / Esqueletal (radio button)
- Posición del hioides
```

**Mediciones de Movimiento Mandibular (en mm)**:
```
- Apertura: _____ mm
- Lateralidad derecha: _____ mm
- Lateralidad izquierda: _____ mm
- Protrusiva: _____ mm
```

**Palpación Muscular (detectar puntos de dolor)**:
```
✓ Masetero (derecho/izquierdo)
✓ Pterigoideo (derecho/izquierdo)
✓ Vientre posterior del digástrico
✓ Triángulo suboccipital
✓ Temporales
✓ Supra e infrahioideos
✓ ECOM (esternocleidomastoideo)
```

### **Sección 5: Mapeo del Dolor**
```
- MAPA DEL DOLOR ROCABADO
  - Derecho: [área para dibujar/marcar]
  - Izquierdo: [área para dibujar/marcar]
```

### **Sección 6: Diagnóstico**
```
- DIAGNÓSTICO PRESUNTIVO: [texto libre]
```

---

## 🏗️ Modelo de Datos Propuesto

### **Patient (Paciente)**
```typescript
{
  // Datos básicos
  fullName: string,
  dni: string (unique por clínica),
  birthDate: string, // 'YYYY-MM-DD'
  age: number (calculado),
  gender: 'M' | 'F' | 'Otro',
  
  // Contacto
  phone: string,
  email?: string,
  address?: string,
  
  // Información adicional
  occupation?: string,
  socialWork?: string,
  
  // Multi-tenant
  clinicId: ObjectId,
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

### **ClinicalHistory (Historia Clínica)**
```typescript
{
  // Relaciones
  patientId: ObjectId,
  appointmentId?: ObjectId, // Opcional: vincular a cita específica
  clinicId: ObjectId,
  
  // Datos de la consulta
  date: string, // 'YYYY-MM-DD'
  reasonForVisit: string,
  referredBy?: string, // Derivación
  
  // Anamnesis
  currentMedicalTreatment?: string,
  currentMedications?: string[],
  allergies?: string[],
  accidentsOrTraumas?: string,
  surgeries?: string[],
  
  // Síntomas ATM (booleans)
  atmSymptoms: {
    neckPain?: boolean,
    increaseStress?: boolean,
    recurrentHeadaches?: boolean,
    earPain?: boolean,
    tinnitus?: boolean,
    atmZonePain?: boolean,
    jawNoises?: boolean,
    jawLocking?: boolean,
    facialPain?: boolean,
    painBehindEyes?: boolean,
    scalpSensitivity?: boolean,
    chewingFatigue?: boolean,
    daytimeBruxism?: boolean,
    orthodontics?: boolean,
    limbTingling?: boolean,
    nausea?: boolean,
    dizziness?: boolean,
    usesGlasses?: boolean,
    useInsoles?: boolean
  },
  
  // Evaluación clínica
  clinicalEvaluation: {
    // Desvío de línea media
    midlineDeviation?: {
      present: boolean,
      type?: 'Funcional' | 'Esqueletal'
    },
    
    // Posición del hioides
    hyoidPosition?: string,
    
    // Mediciones mandibulares (en mm)
    mandibularMovements?: {
      opening?: number,
      rightLaterality?: number,
      leftLaterality?: number,
      protrusive?: number
    },
    
    // Palpación muscular
    muscularPalpation?: {
      masseter?: { right?: string, left?: string }, // 'sin dolor', 'dolor leve', 'dolor moderado', 'dolor intenso'
      pterygoid?: { right?: string, left?: string },
      digastricPosteriorBelly?: { right?: string, left?: string },
      suboccipitalTriangle?: { right?: string, left?: string },
      temporalis?: { right?: string, left?: string },
      hyoidMuscles?: { right?: string, left?: string },
      sternocleidomastoid?: { right?: string, left?: string }
    },
    
    // Mapa del dolor Rocabado
    rocabadoPainMap?: {
      right?: string, // Texto o coordenadas de puntos de dolor
      left?: string
    }
  },
  
  // Diagnóstico
  presumptiveDiagnosis?: string,
  
  // Tratamiento y observaciones
  treatment?: string,
  observations?: string,
  
  // Archivos adjuntos (radiografías, imágenes)
  attachments?: [{
    filename: string,
    url: string,
    type: 'Radiografía' | 'Foto' | 'Documento',
    uploadDate: Date
  }],
  
  // Metadata
  createdBy: ObjectId, // Usuario que creó la historia
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Wireframe / UI Propuesto

### **Página: Lista de Pacientes**
```
┌──────────────────────────────────────────────────────────┐
│ HISTORIAS CLÍNICAS                                       │
├──────────────────────────────────────────────────────────┤
│ [Buscar paciente...] [Filtros ▼] [+ NUEVO PACIENTE]     │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ María González - DNI 35123456                       │  │
│ │ Tel: +54 11 1234-5678 | Edad: 34 años              │  │
│ │                                                     │  │
│ │ Historias clínicas (3):                            │  │
│ │ • 15/03/2026 - Dolor ATM bilateral                 │  │
│ │ • 01/02/2026 - Control post-tratamiento            │  │
│ │ • 10/01/2026 - Primera consulta                    │  │
│ │                                                     │  │
│ │ [Ver ficha completa] [Nueva historia clínica]      │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Juan Pérez - DNI 12345678                          │  │
│ │ ...                                                 │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### **Página: Perfil del Paciente**
```
┌──────────────────────────────────────────────────────────┐
│ ← Volver a pacientes                                     │
├──────────────────────────────────────────────────────────┤
│ MARÍA GONZÁLEZ                                           │
│ DNI: 35123456 | Edad: 34 años | Tel: +54 11 1234-5678  │
│                                                          │
│ [Tabs]                                                   │
│ ┌─────────────┬─────────────┬─────────────┐            │
│ │ Datos       │ Historias   │ Citas       │            │
│ │ Personales  │ Clínicas    │ Programadas │            │
│ └─────────────┴─────────────┴─────────────┘            │
│                                                          │
│ [Tab activo: Historias Clínicas]                        │
│                                                          │
│ [+ Nueva Historia Clínica]                              │
│                                                          │
│ Timeline de historias:                                   │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 📅 15/03/2026 - Dolor ATM bilateral                │  │
│ │ Diagnóstico: Disfunción temporomandibular          │  │
│ │ Tratamiento: Placa de relajación nocturna          │  │
│ │ [Ver detalles] [Editar] [Imprimir]                 │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 📅 01/02/2026 - Control post-tratamiento           │  │
│ │ ...                                                 │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### **Modal: Nueva Historia Clínica ATM**
```
┌──────────────────────────────────────────────────────────┐
│ NUEVA HISTORIA CLÍNICA - María González                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ [Accordion/Tabs por sección]                            │
│                                                          │
│ ▼ 1. ANAMNESIS                                          │
│   Motivo de consulta: [___________________________]     │
│   Derivación: [________________________________]         │
│   Tratamiento médico actual: [_________________]         │
│   Medicación: [+ Agregar medicamento]                   │
│   Alergias: [+ Agregar alergia]                         │
│   Accidentes/traumatismos: [___________________]         │
│   Cirugías: [+ Agregar cirugía]                         │
│                                                          │
│ ▼ 2. SÍNTOMAS ATM                                       │
│   ☐ Dolor de cuello                                     │
│   ☐ Más estrés de lo normal                             │
│   ☐ Dolores de cabeza a repetición                      │
│   ☐ Dolor de oídos                                      │
│   ☐ Tinnitus                                            │
│   ... (todos los checkboxes de síntomas)                │
│                                                          │
│ ▼ 3. EVALUACIÓN CLÍNICA                                │
│   Desvío línea media: ( ) Funcional ( ) Esqueletal     │
│                                                          │
│   Mediciones mandibulares:                              │
│   Apertura: [___] mm                                    │
│   Lateralidad derecha: [___] mm                         │
│   Lateralidad izquierda: [___] mm                       │
│   Protrusiva: [___] mm                                  │
│                                                          │
│   Palpación muscular:                                   │
│   [Tabla interactiva con múscu los y niveles de dolor]  │
│                                                          │
│ ▼ 4. DIAGNÓSTICO Y TRATAMIENTO                         │
│   Diagnóstico presuntivo: [__________________]          │
│   Tratamiento: [____________________________]           │
│   Observaciones: [___________________________]          │
│                                                          │
│ ▼ 5. ARCHIVOS ADJUNTOS                                 │
│   [📎 Subir archivo] [Radiografía] [Foto] [Documento]  │
│                                                          │
│                                                          │
│ [Cancelar] [Guardar borrador] [Guardar historia]       │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Plan de Implementación

### **FASE 1: Backend (6-8 horas)**
✅ Crear modelo `Patient`
✅ Crear modelo `ClinicalHistory` con campos ATM
✅ Crear controllers y routes CRUD
✅ Script de migración de datos
✅ Testing con Postman/curl

### **FASE 2: Frontend - Gestión de Pacientes (4-6 horas)**
✅ Página lista de pacientes
✅ Componente de búsqueda
✅ Página perfil de paciente (tabs)
✅ Formulario crear/editar paciente

### **FASE 3: Frontend - Historia Clínica ATM (8-10 horas)**
✅ Formulario completo de historia clínica
✅ Sección de síntomas ATM (checkboxes)
✅ Sección de evaluación clínica
✅ Tabla de palpación muscular
✅ Visualización de historias en timeline

### **FASE 4: Funcionalidades Avanzadas (6-8 horas)**
✅ Upload de archivos (radiografías)
✅ Mapa del dolor Rocabado (canvas interactivo O imagen + marcadores)
✅ Impresión de historia clínica en PDF
✅ Vinculación con citas (appointments)

### **FASE 5: Testing y Deploy (4-6 horas)**
✅ Testing multi-tenant
✅ Migración de datos en producción
✅ Deploy backend + frontend
✅ Capacitación a Od. Villalba

**TOTAL ESTIMADO: 28-38 horas (~4-5 días laborables)**

---

## ⚠️ Consideraciones Técnicas

### **Multi-tenant**
- Todas las queries filtran por `clinicId`
- Índice único: `(dni, clinicId)` para evitar DNI duplicados entre clínicas
- El Dr. Kulinka NO verá pacientes de la Od. Villalba

### **Privacidad y Seguridad**
- Historias clínicas solo accesibles por usuarios autenticados de la clínica
- Permisos por rol: admin/operador puede crear/editar, auditor solo lectura
- Archivos subidos deben validarse (tipo, tamaño)

### **Performance**
- Paginación en lista de pacientes (10-20 por página)
- Índices en MongoDB: `clinicId + fullName`, `clinicId + dni`
- Lazy loading de archivos adjuntos

### **Extensibilidad**
- Campo `specializedData` flexible para soportar otros tipos de historias clínicas (médico general si el Dr. Kulinka lo pide después)
- Estructura modular: separar lógica ATM en componentes reutilizables

---

## 📊 Campos Específicos ATM - Valores Permitidos

### **Niveles de Dolor en Palpación Muscular**
```typescript
type PainLevel = 'sin_dolor' | 'dolor_leve' | 'dolor_moderado' | 'dolor_intenso';
```

### **Músculos a Evaluar**
```typescript
const MUSCLES = {
  masseter: 'Masetero',
  pterygoid: 'Pterigoideo',
  digastricPosteriorBelly: 'Vientre posterior del digástrico',
  suboccipitalTriangle: 'Triángulo suboccipital',
  temporalis: 'Temporales',
  hyoidMuscles: 'Supra e infrahioideos',
  sternocleidomastoid: 'ECOM (esternocleidomastoideo)'
};
```

### **Síntomas ATM (20 items)**
Todos booleanos (Sí/No):
- neckPain, increaseStress, recurrentHeadaches, earPain, tinnitus, atmZonePain, jawNoises, jawLocking, facialPain, painBehindEyes, scalpSensitivity, chewingFatigue, daytimeBruxism, orthodontics, limbTingling, nausea, dizziness, usesGlasses, useInsoles

---

## 📚 Referencias

- **Documento original**: `AnitaChatBot-Odontologia/data_public/HISTORIA CLINICA DE ATM 2.docx`
- **Mapa del Dolor Rocabado**: Sistema de mapeo de dolor orofacial utilizado en fisioterapia mandibular
- **ATM**: Articulación Temporomandibular (articulación de la mandíbula)

---

## ✅ Checklist de Aceptación

- [ ] Se pueden crear, editar y eliminar pacientes
- [ ] Se pueden crear historias clínicas con TODOS los campos del formato papel
- [ ] Las historias clínicas se vinculan con pacientes
- [ ] Las historias clínicas se pueden vincular opcionalmente con citas
- [ ] Los síntomas ATM se muestran como checkboxes
- [ ] La evaluación clínica incluye mediciones mandibulares
- [ ] La palpación muscular se registra por músculo y lateralidad
- [ ] Se pueden subir archivos (radiografías, fotos)
- [ ] La lista de pacientes es paginada y buscable
- [ ] El perfil del paciente muestra timeline de todas sus historias
- [ ] Multi-tenant: Od. Villalba solo ve sus pacientes
- [ ] Se puede imprimir una historia clínica en PDF

---

**Última actualización**: 2026-03-15
**Autor**: Análisis basado en documento de Od. Melina Villalba
