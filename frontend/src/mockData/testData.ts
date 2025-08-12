import type { Appointment } from '../types/appointment';

export const testAppointments: Appointment[] = [
  {
    _id: 'test-1',
    clientName: 'María González',
    date: '2025-08-11',
    time: '09:00',
    status: 'confirmed',
    socialWork: 'OSDE',
    phone: '3794-123456',
    email: 'maria.gonzalez@email.com',
    description: 'Control anual',
    attended: true
  },
  {
    _id: 'test-2',
    clientName: 'Juan Pérez',
    date: '2025-08-11',
    time: '10:30',
    status: 'pending',
    socialWork: 'Swiss Medical',
    phone: '3794-789012',
    email: 'juan.perez@email.com',
    description: 'Primera consulta - Dolor de cabeza'
  },
  {
    _id: 'test-3',
    clientName: 'Ana Martínez',
    date: '2025-08-11',
    time: '11:45',
    status: 'confirmed',
    socialWork: 'INSSSEP',
    phone: '3794-345678',
    description: 'Control de presión arterial'
  },
  {
    _id: 'test-4',
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
    _id: 'test-5',
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

export const upcomingAppointments = testAppointments.filter(
  app => app.status === 'confirmed' && !app.attended
);

export const todayAppointments = testAppointments.filter(
  app => app.date === '2025-08-11'
);

// Horarios disponibles de ejemplo
export const availableTimeSlots = {
  morning: [
    { time: '09:00', displayTime: '9:00 AM', period: 'morning' as const },
    { time: '10:30', displayTime: '10:30 AM', period: 'morning' as const },
    { time: '11:45', displayTime: '11:45 AM', period: 'morning' as const }
  ],
  afternoon: [
    { time: '15:00', displayTime: '3:00 PM', period: 'afternoon' as const },
    { time: '16:30', displayTime: '4:30 PM', period: 'afternoon' as const },
    { time: '17:45', displayTime: '5:45 PM', period: 'afternoon' as const }
  ]
};
