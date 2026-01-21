# Guía Frontend - CitaMedicaBeta

Documentación detallada de la estructura y patrones del frontend para agentes de Claude Code.

---

## 🗺️ MAPA DE NAVEGACIÓN FRONTEND

**Usa este mapa para saber DÓNDE buscar según el tipo de cambio solicitado:**

### 🎨 Cambios de UI / Visual / Pantallas
**Buscar en:**
- `src/pages/*.tsx` - Páginas completas (Dashboard, Schedule, History, Login, etc.)
- `src/components/*.tsx` - Componentes reutilizables (Layout, AppointmentList, Dialogs, etc.)

**Ejemplos:**
- "Cambiar el color del botón" → `components/` o `pages/`
- "Agregar un campo al formulario" → `pages/BookAppointment.tsx` o `pages/SelectOverturn.tsx`
- "Modificar la tabla de citas" → `components/AppointmentList.tsx`

---

### 🔌 Cambios de Lógica / API / Datos
**Buscar en:**
- `src/services/*.ts` - Llamadas al backend (appointmentService, sobreturnoService)
- `src/config/axios.ts` - Configuración HTTP (timeout, retry, interceptors)

**Ejemplos:**
- "Agregar nuevo endpoint" → `services/appointmentService.ts`
- "Cambiar timeout de API" → `config/axios.ts`
- "Modificar parámetros de llamada" → `services/`

---

### 📝 Cambios de Tipos / Interfaces
**Buscar en:**
- `src/types/*.ts` - Definiciones TypeScript (appointment.ts)

**Ejemplos:**
- "Agregar campo a la interfaz Appointment" → `types/appointment.ts`
- "Cambiar tipo de una propiedad" → `types/`

---

### 🛣️ Cambios de Rutas / Navegación
**Buscar en:**
- `src/App.tsx` - Definición de rutas de React Router

**Ejemplos:**
- "Agregar nueva ruta" → `App.tsx`
- "Cambiar ruta protegida a pública" → `App.tsx`

---

### 🌐 Cambios de Estado Global / Context
**Buscar en:**
- `src/context/*.tsx` - React Context (AuthContext, ColorModeContext)

**Ejemplos:**
- "Modificar autenticación" → `context/AuthContext.tsx`
- "Cambiar tema" → `context/ColorModeContext.tsx`

---

## 🎯 SKILLS FRONTEND

### SKILL 1: analisis-frontend
**Cuándo usar:** Antes de cualquier modificación de código frontend.

**Pasos:**
1. **Identificar tipo de cambio** usando el Mapa de Navegación arriba
2. **Leer archivos relacionados**:
   - Si es UI → Leer página o componente completo
   - Si es API → Leer servicio completo
   - Si es tipo → Leer types/appointment.ts
3. **Buscar dependencias**:
   - ¿Qué otros archivos importan este archivo?
   - ¿Qué componentes usan esta función/tipo?
4. **Hacer preguntas al usuario**:
   - ¿Exactamente qué elemento visual cambiar?
   - ¿Qué comportamiento debe preservarse?
   - ¿Hay validaciones que mantener?

---

### SKILL 2: plan-frontend
**Cuándo usar:** Después de completar analisis-frontend y antes de codear.

**Formato del plan:**
```
## 📋 PLAN FRONTEND

### RESUMEN:
[Descripción en 2-3 líneas del cambio]

### ARCHIVOS A MODIFICAR:
- src/pages/[archivo].tsx - [Cambio específico]
- src/services/[archivo].ts - [Cambio específico]

### CAMBIOS DETALLADOS:

**Archivo 1: [nombre]**
- Línea X: [Qué cambiar]
- Agregar: [Qué agregar]

**Archivo 2: [nombre]**
- Modificar: [Qué modificar]

### COMPONENTES AFECTADOS:
- [Componente X] - [Cómo se afecta]

### RIESGOS:
- ⚠️ [Qué podría romperse]
- ✅ Mitigación: [Cómo evitarlo]

### VALIDACIÓN:
- [ ] Compilación TypeScript: npx tsc --noEmit
- [ ] Verificar imports
- [ ] Verificar tipos

### ❓ ¿Procedo?
```

**🛑 ESPERAR APROBACIÓN antes de continuar**

---

### SKILL 3: implementacion-frontend
**Cuándo usar:** Solo después de aprobación del plan.

**Pasos:**
1. **Modificar un archivo a la vez**:
   - Usar Edit tool
   - Explicar qué estás haciendo
   - Mostrar el fragmento cambiado

2. **Verificar después de cada cambio**:
   ```bash
   cd frontend
   npx tsc --noEmit
   ```

3. **Actualizar TodoWrite** marcando tarea como completada

4. **Si hay error**:
   - Mostrar el error
   - Analizar causa
   - Proponer solución
   - Esperar aprobación para arreglar

5. **Código mínimo**:
   - NO agregar features extra
   - NO refactorizar código existente
   - Solo el cambio solicitado

---

### ⚠️ REGLAS ESPECÍFICAS FRONTEND

**Material-UI:**
- Respetar tema existente (theme.palette, theme.breakpoints)
- Usar componentes MUI existentes
- No cambiar estructura de Layout sin consultar

**TypeScript:**
- Nunca usar `any`
- Siempre tipar correctamente
- Verificar con `npx tsc --noEmit` antes de marcar como completado

**React:**
- Respetar hooks existentes (useState, useEffect, etc.)
- No cambiar ciclo de vida de componentes sin consultar
- Mantener patrones de props existentes

**Servicios API:**
- Respetar estructura de respuesta del backend
- Mantener manejo de errores existente
- No cambiar configuración de axios sin consultar

---

## Stack Tecnológico

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **HTTP Client**: Axios (con retry logic)
- **Date Handling**: date-fns
- **Estado Global**: React Context API

## Estructura de Carpetas

```
frontend/src/
├── pages/                 # Componentes de página (1 por ruta)
│   ├── Dashboard.tsx      # Dashboard principal (autenticado)
│   ├── Schedule.tsx       # Gestión de horarios (autenticado)
│   ├── History.tsx        # Historial de citas (autenticado)
│   ├── Login.tsx          # Login de administrador
│   ├── Register.tsx       # Registro de nuevo admin
│   ├── ChangePassword.tsx # Cambiar contraseña (autenticado)
│   ├── BookAppointment.tsx      # Reserva pública de citas
│   └── SelectOverturn.tsx       # Reserva pública de sobreturnos
│
├── components/            # Componentes reutilizables
│   ├── Layout.tsx                      # Layout principal con sidebar
│   ├── ProtectedRoute.tsx              # HOC para rutas protegidas
│   ├── AppointmentList.tsx             # Lista completa de citas (1545 líneas)
│   ├── SimpleAppointmentList.tsx       # Lista compacta (381 líneas)
│   ├── CreateOverturnDialog.tsx        # Dialog para crear sobreturno
│   └── GlobalCreateAppointmentDialog.tsx  # Dialog global para crear cita
│
├── services/              # Capa de servicios API
│   ├── appointmentService.ts  # API de citas regulares
│   └── sobreturnoService.ts   # API de sobreturnos
│
├── config/
│   └── axios.ts           # Configuración de Axios (timeout, retry)
│
├── types/
│   └── appointment.ts     # Tipos TypeScript compartidos
│
├── context/               # React Context
│   ├── ColorModeContext.tsx  # Tema light/dark
│   └── AuthContext.tsx       # Autenticación
│
├── App.tsx                # Configuración de rutas
└── main.tsx               # Entry point
```

## Rutas de la Aplicación

### Rutas Públicas (sin autenticación)
| Ruta | Componente | Propósito |
|------|-----------|----------|
| `/login` | Login.tsx | Inicio de sesión admin |
| `/register` | Register.tsx | Registro de admin |
| `/agendar-turno` | BookAppointment.tsx | Reserva pública de citas |
| `/reservar-turno` | BookAppointment.tsx | Alias de /agendar-turno |
| `/book-appointment` | BookAppointment.tsx | Alias en inglés |
| `/seleccionar-sobreturno` | SelectOverturn.tsx | **Selección de sobreturnos** |

### Rutas Protegidas (requieren JWT)
| Ruta | Componente | Propósito |
|------|-----------|----------|
| `/` | Dashboard.tsx | Dashboard principal |
| `/horarios` | Schedule.tsx | Gestión de horarios |
| `/historial` | History.tsx | Historial de citas |
| `/change-password` | ChangePassword.tsx | Cambiar contraseña |

## Páginas Principales

### 1. Dashboard.tsx (347 líneas)

**Propósito**: Pantalla principal del sistema, muestra citas y sobreturnos del día.

**Características**:
- Auto-refresh cada 1 minuto (60000ms)
- Selector de fecha
- Dos paneles lado a lado:
  - Citas regulares (`!app.isSobreturno`)
  - Sobreturnos (`isSobreturno === true`)
- Estadísticas en tiempo real
- Animaciones con Framer Motion

**Estados**:
```typescript
const [selectedDate, setSelectedDate] = useState<Date>(new Date());
const [appointments, setAppointments] = useState<Appointment[]>([]);
const [sobreturnos, setSobreturnos] = useState<Appointment[]>([]);
const [loading, setLoading] = useState(false);
const [refreshing, setRefreshing] = useState(false);
const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
```

**Funciones principales**:
```typescript
fetchAllData()           // Cargar citas y sobreturnos
handleRefresh()          // Refresh manual
handleDateChange(date)   // Cambiar fecha seleccionada
```

**Auto-refresh**:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchAllData();
  }, 60000); // 1 minuto
  return () => clearInterval(interval);
}, [selectedDate]);
```

### 2. SelectOverturn.tsx (585 líneas) [NUEVO]

**Propósito**: Página pública para que usuarios desde chatbot seleccionen sobreturnos.

**Flujo**:
1. Extrae token de URL → localStorage
2. Carga sobreturnos disponibles para HOY
3. Muestra grid de 10 cards (5 mañana, 5 tarde)
4. Usuario selecciona + completa formulario
5. Crea sobreturno → pantalla de éxito

**Estados**:
```typescript
type PageState = 'LOADING' | 'READY' | 'SUBMITTING' | 'SUCCESS' | 'ERROR_NO_TOKEN' | 'ERROR_NO_AVAILABLE';

const [pageState, setPageState] = useState<PageState>('LOADING');
const [selectedSobreturno, setSelectedSobreturno] = useState<number | null>(null);
const [disponibles, setDisponibles] = useState<number[]>([]);
const [formData, setFormData] = useState({nombre, obraSocial, telefono});
```

**Horarios hardcodeados**:
```typescript
const HORARIOS: Record<number, string> = {
  1: '11:00', 2: '11:15', 3: '11:30', 4: '11:45', 5: '12:00',
  6: '19:00', 7: '19:15', 8: '19:30', 9: '19:45', 10: '20:00'
};
```

**Patrón de token público** (líneas 60-77 de BookAppointment.tsx):
```typescript
useEffect(() => {
  const urlToken = searchParams.get('token');
  if (urlToken) {
    localStorage.setItem('public_token', urlToken);
    window.history.replaceState({}, '', window.location.pathname);
  }
}, [searchParams]);
```

### 3. BookAppointment.tsx (610 líneas)

**Propósito**: Reserva pública de citas regulares con token público.

**Características**:
- Stepper de 3 pasos: Fecha/Hora → Datos → Confirmación
- Extrae token público de URL
- DatePicker para seleccionar fecha
- Grid de horarios disponibles
- Formulario completo (nombre, teléfono, DNI, email, obra social)

**Diferencias con SelectOverturn**:
- Tiene Stepper (3 pasos) vs un solo paso
- DatePicker vs fecha fija (HOY)
- Horarios dinámicos desde API vs hardcodeados
- Para citas regulares vs sobreturnos

## Componentes Principales

### AppointmentList.tsx (1545 líneas)

**Componente más complejo** del frontend.

**Propósito**: Lista completa de citas con funcionalidades de gestión.

**Características**:
- Dos modos: Grid view y List view
- Crear, editar, eliminar citas
- Marcar asistencia (Switch)
- Marcar como pagado (Checkbox)
- Actualizar descripción
- Filtros por nombre/teléfono y fecha
- Paginación (6 items por página)
- Drawer lateral con detalles

**Detecta tipo de cita**:
```typescript
if (appointment.isSobreturno) {
  await sobreturnoService.delete(id);
} else {
  await appointmentService.delete(id);
}
```

**Props**:
```typescript
interface AppointmentListProps {
  showHistory?: boolean;
  onRefresh?: () => void;
}
```

**Ref expuesto**:
```typescript
useImperativeHandle(ref, () => ({
  refreshAppointments: fetchAppointments,
}));
```

### SimpleAppointmentList.tsx (381 líneas)

**Versión compacta** de AppointmentList.

**Propósito**: Lista simple para Dashboard.

**Características**:
- ListItem format (más compacto)
- Funcionalidades básicas: eliminar, marcar asistencia, marcar pago
- Drawer para editar descripción
- Menú contextual (MoreVert) para desbloquear
- Polling cada 6 minutos

**Props**:
```typescript
interface SimpleAppointmentListProps {
  appointments: Appointment[];
  title: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  buttonLabel?: string;
}
```

**Estados locales persistentes**:
```typescript
// Guarda estados de asistencia en localStorage
const attendedStatesKey = `attendedStates_${title}`;
localStorage.setItem(attendedStatesKey, JSON.stringify(attendedStates));
```

### Layout.tsx (443 líneas)

**Propósito**: Layout principal con AppBar + Drawer + Main Content.

**Características**:
- AppBar con logo "Dr. Daniel Kulinka"
- Drawer permanente (desktop) / temporal (mobile)
- Menú lateral: Inicio, Horarios, Historial
- Usuario dropdown: Cambiar contraseña, Logout
- Botón "NUEVA CITA" en esquina superior derecha
- Expone función global para abrir dialog

**Función global**:
```typescript
window.openCreateAppointmentDialog = () => {
  setOpenGlobalDialog(true);
};
```

**Menú lateral**:
```typescript
const menuItems = [
  { text: 'Inicio', icon: <DashboardIcon />, path: '/' },
  { text: 'Horarios', icon: <EventAvailableIcon />, path: '/horarios' },
  { text: 'Historial', icon: <HistoryIcon />, path: '/historial' }
];
```

## Servicios API

### appointmentService.ts (157 líneas)

**Endpoints de citas regulares**:

```typescript
// Listar citas
getAll({ showHistory, date })
→ GET /appointments?showHistory=true&date=2026-01-19

// Crear cita (normal o pública)
create(data, isPublic = false)
→ POST /appointments (si isPublic = false)
→ POST /appointments/public/book (si isPublic = true)

// Actualizar cita
update(id, data)
→ PUT /appointments/:id

// Eliminar cita
delete(id)
→ DELETE /appointments/:id

// Actualizar estado
updateStatus(id, status)
→ PUT /appointments/:id

// Reagendar
reschedule(id, date, time)
→ PUT /appointments/:id

// Actualizar descripción
updateDescription(id, description)
→ PATCH /appointments/:id/description

// Actualizar pago
updatePaymentStatus(id, isPaid)
→ PATCH /appointments/:id/payment

// Obtener horarios disponibles
getAvailableTimes(date, isPublic = false)
→ GET /appointments/available-times?date=2026-01-19
```

**Manejo de token público**:
```typescript
if (isPublic) {
  const token = localStorage.getItem('public_token');
  config.params = { ...config.params, token };
}
```

### sobreturnoService.ts (115 líneas)

**Endpoints de sobreturnos**:

```typescript
// Validar disponibilidad
validateSobreturno(date, sobreturnoNumber)
→ GET /sobreturnos/validate?date=2026-01-19&sobreturnoNumber=3

// Eliminar sobreturno
deleteSobreturno(id)
→ DELETE /sobreturnos/:id

// Actualizar descripción
updateSobreturnoDescription(id, description)
→ PATCH /sobreturnos/:id/description

// Actualizar pago
updatePaymentStatus(id, isPaid)
→ PATCH /sobreturnos/:id/payment

// Listar sobreturnos
getSobreturnos(status?)
→ GET /sobreturnos?status=confirmed

// Crear sobreturno
createSobreturno(data)
→ POST /sobreturnos

// Actualizar estado
updateSobreturnoStatus(id, status)
→ PATCH /sobreturnos/:id/status

// Obtener disponibles por fecha [NUEVO]
getSobreturnosByDate(date)
→ GET /sobreturnos/date/2026-01-19
```

**Respuesta de getSobreturnosByDate**:
```typescript
{
  success: true,
  data: {
    disponibles: [
      { numero: 1, horario: '11:00', turno: 'mañana' },
      { numero: 3, horario: '11:30', turno: 'mañana' },
      { numero: 7, horario: '19:15', turno: 'tarde' }
    ],
    totalDisponibles: 3,
    fecha: '2026-01-19'
  }
}
```

## Configuración de Axios

### config/axios.ts (167 líneas)

**Base URL**:
```typescript
const baseURL = import.meta.env.VITE_API_URL || 'https://micitamedica.me/api';
```

**Timeout y Retry**:
```typescript
{
  timeout: 30000,  // 30 segundos
  retry: 3,        // Máximo 3 reintentos
  retryDelay: exponentialBackoff  // 1s, 2s, 4s
}
```

**Condiciones de retry**:
```typescript
// Reintenta en:
- Errores de red (ECONNABORTED, ETIMEDOUT)
- Códigos 5xx (server errors)
- Códigos 408 (Request Timeout)
- Códigos 429 (Too Many Requests)
```

**Interceptor de Request**:
```typescript
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Interceptor de Response**:
```typescript
// Maneja errores 401/403
if (error.response?.status === 401) {
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
}
```

## Tipos TypeScript

### types/appointment.ts

**Interfaces principales**:

```typescript
type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

type SocialWork =
  | 'INSSSEP'
  | 'Swiss Medical'
  | 'OSDE'
  | 'Galeno'
  | 'CONSULTA PARTICULAR'
  | 'Otras Obras Sociales';

interface BaseAppointment {
  clientName: string;
  date: string;           // YYYY-MM-DD
  time: string;           // HH:mm
  status: AppointmentStatus;
  socialWork: SocialWork;
  phone: string;
  dni?: string;
  email?: string;
  description?: string;
  attended?: boolean;
  isSobreturno?: boolean;  // ⭐ CLAVE para diferenciar tipos
  isPaid?: boolean;
}

interface Appointment extends BaseAppointment {
  _id: string;
  googleEventId?: string;
}
```

## Patrones de Desarrollo

### Diferenciación de Tipos de Cita

**Siempre detectar el tipo**:
```typescript
if (appointment.isSobreturno) {
  // Usar sobreturnoService
  await sobreturnoService.updatePaymentStatus(id, isPaid);
} else {
  // Usar appointmentService
  await appointmentService.updatePaymentStatus(id, isPaid);
}
```

### Manejo de Tokens Públicos

**Patrón establecido** (usado en BookAppointment y SelectOverturn):

```typescript
// 1. Extraer token de URL
useEffect(() => {
  const urlToken = searchParams.get('token');
  if (urlToken) {
    localStorage.setItem('public_token', urlToken);
    window.history.replaceState({}, '', window.location.pathname);
  }
}, [searchParams]);

// 2. Usar en llamadas API
const token = localStorage.getItem('public_token');
await axiosInstance.get(`/endpoint`, {
  params: { token }
});
```

### Estados de Carga

**Patrón típico**:
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleAction = async () => {
  setLoading(true);
  setError('');
  try {
    await service.action();
  } catch (err) {
    setError('Mensaje de error amigable');
  } finally {
    setLoading(false);
  }
};
```

### Validaciones de Formulario

**Validar antes de enviar**:
```typescript
const validateForm = (): boolean => {
  if (!formData.nombre.trim()) {
    setError('El nombre es requerido');
    return false;
  }

  if (formData.nombre.trim().length < 3) {
    setError('El nombre debe tener al menos 3 caracteres');
    return false;
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre.trim())) {
    setError('El nombre solo debe contener letras');
    return false;
  }

  // ... más validaciones

  return true;
};
```

### Manejo de Fechas

**Usar date-fns**:
```typescript
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Formatear para backend
const dateStr = format(new Date(), 'yyyy-MM-dd');  // "2026-01-19"

// Formatear para UI
const displayDate = format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es });
// "domingo 19 de enero, 2026"
```

## Material-UI Patterns

### Responsive Design

**Usar breakpoints**:
```typescript
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

<Typography variant={isMobile ? 'h5' : 'h4'}>
  Título Responsive
</Typography>
```

### Grid Layout

**Grid de Cards**:
```typescript
<Grid container spacing={2}>
  {items.map(item => (
    <Grid item xs={6} sm={4} md={2.4}>  {/* 2, 3, 5 columnas */}
      <Card>...</Card>
    </Grid>
  ))}
</Grid>
```

### Dialogs

**Pattern de Dialog**:
```typescript
const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Abrir</Button>

<Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
  <DialogTitle>Título</DialogTitle>
  <DialogContent>
    {/* Contenido */}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpen(false)}>Cancelar</Button>
    <Button onClick={handleSubmit} variant="contained">Confirmar</Button>
  </DialogActions>
</Dialog>
```

### Loading States

**CircularProgress centrado**:
```typescript
{loading && (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress />
  </Box>
)}
```

### Alerts

**Feedback visual**:
```typescript
{error && (
  <Alert severity="error" onClose={() => setError('')}>
    {error}
  </Alert>
)}

{success && (
  <Alert severity="success">
    Operación exitosa
  </Alert>
)}
```

## Context API

### ColorModeContext

**Tema light/dark**:
```typescript
const colorMode = useContext(ColorModeContext);
colorMode.toggleColorMode();  // Cambiar tema
```

### AuthContext

**Autenticación**:
```typescript
const { isAuthenticated, login, logout } = useAuth();

// Login
await login(email, password);

// Logout
logout();
```

## Debugging

### Logs con Prefijos

```typescript
console.log('[DEBUG] Token recibido:', token);
console.error('[ERROR] Error al cargar:', error);
console.warn('[WARN] Token no encontrado');
```

### React DevTools

- Instalar extensión React DevTools
- Inspeccionar componentes y props
- Ver context values

## Testing

### Verificar Tipos

```bash
cd frontend
npx tsc --noEmit
```

### Dev Server

```bash
npm run dev
# Abre http://localhost:5173
```

### Build

```bash
npm run build
npm run preview  # Previsualizar build
```

## Convenciones

### Naming

- **Componentes**: PascalCase (`SelectOverturn.tsx`)
- **Servicios**: camelCase (`appointmentService.ts`)
- **Tipos**: PascalCase (`Appointment`, `SocialWork`)
- **Hooks**: camelCase con prefijo `use` (`useAuth`)

### File Organization

- Un componente por archivo
- Exportar como default
- Imports en orden: React → librerías → locales
- Types al inicio del archivo

### Props

- Usar interfaces para props
- Props opcionales con `?`
- Destructuring en parámetros

```typescript
interface MyComponentProps {
  title: string;
  onClose?: () => void;
  items: Item[];
}

const MyComponent = ({ title, onClose, items }: MyComponentProps) => {
  // ...
};
```

## Próximos Pasos Comunes

### Agregar Nueva Página

1. Crear archivo en `src/pages/NewPage.tsx`
2. Importar en `App.tsx`
3. Agregar Route en `App.tsx`
4. Si es protegida, wrap en `<ProtectedRoute>`

### Agregar Nuevo Servicio API

1. Crear función en servicio correspondiente
2. Usar axiosInstance configurado
3. Manejar errores con try-catch
4. Retornar data o lanzar error

### Modificar Componente Existente

1. Leer el archivo completo primero
2. Identificar patrón usado
3. Seguir mismo estilo
4. Verificar tipos con `npx tsc --noEmit`

## Archivos Clave de Referencia

Para entender rápidamente el frontend:

1. **App.tsx** - Rutas y configuración
2. **Dashboard.tsx** - Patrón de página principal
3. **SelectOverturn.tsx** - Patrón de página pública con token
4. **AppointmentList.tsx** - Componente complejo de referencia
5. **config/axios.ts** - Configuración HTTP
6. **types/appointment.ts** - Tipos compartidos

---

**Última actualización**: 2026-01-19
