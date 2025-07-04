import type { Appointment } from '../types/appointment';

// DATOS DE PRUEBA - COMENTADOS PARA PRODUCCIÓN
/* export const mockAppointments: Appointment[] = [
  {
    _id: 'mock-1',
    clientName: 'Juan Pérez',
    date: '2025-05-25',
    time: '09:00',
    status: 'confirmed',
    socialWork: 'INSSSEP',
    phone: '3704123456',
    email: 'juan.perez@email.com',
    description: 'Control de rutina',
    attended: true
  },
  {
    _id: 'mock-2',
    clientName: 'María García',
    date: '2025-05-25',
    time: '10:00',
    status: 'pending',
    socialWork: 'Swiss Medical',
    phone: '3704789012',
    email: 'maria.garcia@email.com',
    description: 'Primera consulta',
    attended: false
  },
  {
    _id: 'mock-3',
    clientName: 'Carlos Rodríguez',
    date: '2025-05-25',
    time: '11:30',
    status: 'confirmed',
    socialWork: 'OSDE',
    phone: '3704345678',
    email: 'carlos.rodriguez@email.com',
    description: 'Seguimiento tratamiento',
    attended: false
  },
  {
    _id: 'mock-4',
    clientName: 'Ana Martínez',
    date: '2025-05-25',
    time: '14:30',
    status: 'pending',
    socialWork: 'Galeno',
    phone: '3704901234',
    email: 'ana.martinez@email.com',
    description: 'Consulta por dolor',
    attended: false
  },
  {
    _id: 'mock-5',
    clientName: 'Roberto López',
    date: '2025-05-25',
    time: '15:00',
    status: 'cancelled',
    socialWork: 'CONSULTA PARTICULAR',
    phone: '3704567890',
    email: 'roberto.lopez@email.com',
    description: 'Canceló por emergencia',
    attended: false
  },
  {
    _id: 'mock-6',
    clientName: 'Laura Fernández',
    date: '2025-05-26',
    time: '09:00',
    status: 'confirmed',
    socialWork: 'INSSSEP',
    phone: '3704234567',
    email: 'laura.fernandez@email.com',
    description: 'Control mensual',
    attended: false
  },
  {
    _id: 'mock-7',
    clientName: 'Diego González',
    date: '2025-05-26',
    time: '10:30',
    status: 'confirmed',
    socialWork: 'OSDE',
    phone: '3704345678',
    email: 'diego.gonzalez@email.com',
    description: 'Revisión post tratamiento',
    attended: false
  },
  {
    _id: 'mock-8',
    clientName: 'Sofía Torres',
    date: '2025-05-26',
    time: '11:00',
    status: 'pending',
    socialWork: 'Swiss Medical',
    phone: '3704456789',
    email: 'sofia.torres@email.com',
    description: 'Primera vez',
    attended: false
  },
  {
    _id: 'mock-9',
    clientName: 'Miguel Ángel Ruiz',
    date: '2025-05-26',
    time: '14:00',
    status: 'confirmed',
    socialWork: 'Galeno',
    phone: '3704567890',
    email: 'miguel.ruiz@email.com',
    description: 'Seguimiento',
    attended: false
  },
  {
    _id: 'mock-10',
    clientName: 'Carmen Sánchez',
    date: '2025-05-26',
    time: '15:30',
    status: 'pending',
    socialWork: 'CONSULTA PARTICULAR',
    phone: '3704678901',
    email: 'carmen.sanchez@email.com',
    description: 'Consulta general',
    attended: false
  },
  {
    _id: 'mock-11',
    clientName: 'Pablo Morales',
    date: '2025-05-27',
    time: '09:00',
    status: 'confirmed',
    socialWork: 'INSSSEP',
    phone: '3704789012',
    email: 'pablo.morales@email.com',
    description: 'Control rutinario',
    attended: false
  },
  {
    _id: 'mock-12',
    clientName: 'Valentina López',
    date: '2025-05-27',
    time: '10:00',
    status: 'pending',
    socialWork: 'OSDE',
    phone: '3704890123',
    email: 'valentina.lopez@email.com',
    description: 'Primera consulta',
    attended: false
  },
  {
    _id: 'mock-13',
    clientName: 'Martín Herrera',
    date: '2025-05-27',
    time: '11:30',
    status: 'confirmed',
    socialWork: 'Swiss Medical',
    phone: '3704901234',
    email: 'martin.herrera@email.com',
    description: 'Seguimiento mensual',
    attended: false
  },
  {
    _id: 'mock-14',
    clientName: 'Lucía Paz',
    date: '2025-05-27',
    time: '14:00',
    status: 'cancelled',
    socialWork: 'Galeno',
    phone: '3704012345',
    email: 'lucia.paz@email.com',
    description: 'Cancelada - viaje',
    attended: false
  },
  {
    _id: 'mock-15',
    clientName: 'Federico Ramírez',
    date: '2025-05-27',
    time: '15:30',
    status: 'confirmed',
    socialWork: 'CONSULTA PARTICULAR',
    phone: '3704123456',
    email: 'federico.ramirez@email.com',
    description: 'Control post operatorio',
    attended: false
  },
  {
    _id: 'mock-16',
    clientName: 'Isabella Moreno',
    date: '2025-05-28',
    time: '09:00',
    status: 'pending',
    socialWork: 'INSSSEP',
    phone: '3704234567',
    email: 'isabella.moreno@email.com',
    description: 'Primera vez',
    attended: false
  },
  {
    _id: 'mock-17',
    clientName: 'Tomás Acosta',
    date: '2025-05-28',
    time: '10:30',
    status: 'confirmed',
    socialWork: 'OSDE',
    phone: '3704345678',
    email: 'tomas.acosta@email.com',
    description: 'Seguimiento tratamiento',
    attended: false
  },
  {
    _id: 'mock-18',
    clientName: 'Emma Giménez',
    date: '2025-05-28',
    time: '11:30',
    status: 'pending',
    socialWork: 'Swiss Medical',
    phone: '3704456789',
    email: 'emma.gimenez@email.com',
    description: 'Control mensual',
    attended: false
  },
  {
    _id: 'mock-19',
    clientName: 'Lucas Castro',
    date: '2025-05-28',
    time: '14:00',
    status: 'confirmed',
    socialWork: 'Galeno',
    phone: '3704567890',
    email: 'lucas.castro@email.com',
    description: 'Revisión',
    attended: false
  },
  {
    _id: 'mock-20',
    clientName: 'Victoria Romero',
    date: '2025-05-28',
    time: '15:30',
    status: 'pending',
    socialWork: 'CONSULTA PARTICULAR',
    phone: '3704678901',
    email: 'victoria.romero@email.com',
    description: 'Primera consulta',    attended: false
  }
]; */

// Exportar un arreglo vacío para producción
export const mockAppointments: Appointment[] = [];
