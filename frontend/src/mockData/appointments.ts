import type { Appointment } from '../types/appointment';

export const mockAppointments: Appointment[] = [
  {
    _id: 'mock-1',
    clientName: 'María González',
    date: '2025-08-11',
    time: '09:00',
    status: 'confirmed',
    socialWork: 'OSDE',
    phone: '3794-123456',
    email: 'maria.gonzalez@email.com',
    description: 'Control anual - Turno regular',
    attended: false
  },
  {
    _id: 'mock-2',
    clientName: 'Juan Pérez',
    date: '2025-08-11',
    time: '10:30',
    status: 'pending',
    socialWork: 'Swiss Medical',
    phone: '3794-789012',
    email: 'juan.perez@email.com',
    description: 'Sobre-turno - Dolor de cabeza',
    attended: false
  },
  {
    _id: 'mock-3',
    clientName: 'Ana Martínez',
    date: '2025-08-11',
    time: '11:45',
    status: 'confirmed',
    socialWork: 'INSSSEP',
    phone: '3794-345678',
    description: 'Control de presión arterial'
  },
  {
    _id: 'mock-4',
    clientName: 'Carlos Rodríguez',
    date: '2025-08-11',
    time: '15:00',
    status: 'cancelled',
    socialWork: 'Galeno',
    phone: '3794-901234',
    email: 'carlos.rodriguez@email.com',
    description: 'Consulta de seguimiento'
  },
  {
    _id: 'mock-5',
    clientName: 'Laura Sánchez',
    date: '2025-08-11',
    time: '16:30',
    status: 'confirmed',
    socialWork: 'CONSULTA PARTICULAR',
    phone: '3794-567890',
    email: 'laura.sanchez@email.com',
    description: 'Consulta por dolor lumbar'
  }
];

export const upcomingAppointments = mockAppointments.filter(
  app => app.status === 'confirmed' && !app.attended
);

export const todayAppointments = mockAppointments.filter(
  app => app.date === '2025-08-11'
);
