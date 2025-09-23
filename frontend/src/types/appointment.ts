export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';
export type SocialWork = 'INSSSEP' | 'Swiss Medical' | 'OSDE' | 'Galeno' | 'CONSULTA PARTICULAR' | 'Otras Obras Sociales';


export interface BaseAppointment {
  clientName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  socialWork: SocialWork;
  phone: string;
  dni?: string;
  email?: string;
  description?: string;
  attended?: boolean; // indica si el paciente asistió a la cita
  isSobreturno?: boolean; // indica si es sobreturno
}

export interface Appointment extends BaseAppointment {
  _id: string;
}
