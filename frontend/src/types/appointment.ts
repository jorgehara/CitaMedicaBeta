export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';
export type SocialWork = 'INSSSEP' | 'Swiss Medical' | 'OSDE' | 'Galeno' | 'CONSULTA PARTICULAR';

export interface BaseAppointment {
  clientName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  socialWork: SocialWork;
  phone: string;
  email?: string;
  description?: string;
  attended?: boolean; // indica si el paciente asistió a la cita
}

export interface Appointment extends BaseAppointment {
  _id: string;
}
