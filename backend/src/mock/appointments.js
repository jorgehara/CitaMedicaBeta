// DATOS MOCK PARA PRUEBAS DE BACKEND - NO USAR EN PRODUCCIÓN
const mockAppointments = [
  {
    _id: 'mock-back-1',
    clientName: 'José Gómez',
    date: '2025-05-25',
    time: '14:00',
    status: 'confirmed',
    socialWork: 'OSDE',
    phone: '3704111222',
    email: 'jose.gomez@email.com',
    description: 'Control mensual',
    attended: false,
    createdAt: new Date('2025-05-20'),
    updatedAt: new Date('2025-05-20')
  },
  {
    _id: 'mock-back-2',
    clientName: 'Laura Torres',
    date: '2025-05-26',
    time: '09:00',
    status: 'pending',
    socialWork: 'INSSSEP',
    phone: '3704333444',
    email: 'laura.torres@email.com',
    description: 'Primera consulta - Dolor de cabeza',
    attended: false,
    createdAt: new Date('2025-05-21'),
    updatedAt: new Date('2025-05-21')
  },
  {
    _id: 'mock-back-3',
    clientName: 'Miguel Ángel Pérez',
    date: '2025-05-26',
    time: '10:30',
    status: 'confirmed',
    socialWork: 'Swiss Medical',
    phone: '3704555666',
    email: 'miguel.perez@email.com',
    description: 'Revisión post operatoria',
    attended: false,
    createdAt: new Date('2025-05-22'),
    updatedAt: new Date('2025-05-22')
  },
  {
    _id: 'mock-back-4',
    clientName: 'Sofía Ramírez',
    date: '2025-05-27',
    time: '11:00',
    status: 'cancelled',
    socialWork: 'Galeno',
    phone: '3704777888',
    email: 'sofia.ramirez@email.com',
    description: 'Cancelada por el paciente',
    attended: false,
    createdAt: new Date('2025-05-23'),
    updatedAt: new Date('2025-05-24')
  },
  {
    _id: 'mock-back-5',
    clientName: 'Diego Fernández',
    date: '2025-05-27',
    time: '15:30',
    status: 'confirmed',
    socialWork: 'CONSULTA PARTICULAR',
    phone: '3704999000',
    email: 'diego.fernandez@email.com',
    description: 'Control rutinario',
    attended: false,
    createdAt: new Date('2025-05-24'),
    updatedAt: new Date('2025-05-24')
  }
];

// Para usar estos datos mock en desarrollo, puedes:
// 1. Importarlos directamente en el controlador
// 2. Usarlos para poblar la base de datos en desarrollo
// 3. Crear un middleware que intercepte las peticiones y devuelva estos datos

// Ejemplo de uso en el controlador:
/*
import { mockAppointments } from './mockData';

// En modo desarrollo
if (process.env.NODE_ENV === 'development') {
  // Usar datos mock
  const appointments = mockAppointments;
} else {
  // Usar datos reales de la base de datos
  const appointments = await Appointment.find();
}
*/

export default mockAppointments;
