export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';
export type SocialWork = string;


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
  consultationType?: string;
  attended?: boolean; // indica si el paciente asistió a la cita
  isSobreturno?: boolean; // indica si es sobreturno
  isPaid?: boolean; // indica si el paciente realizó el pago
  patientId?: string; // Task 3.5: Optional link to patient in clinical history module
}

export interface Appointment extends BaseAppointment {
  _id: string;
}
