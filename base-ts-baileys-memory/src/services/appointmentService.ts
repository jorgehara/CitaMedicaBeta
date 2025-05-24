interface Appointment {
    _id: string;
    clientName: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    socialWork: string;
    phone: string;
    email?: string;
    description?: string;
}

export class AppointmentService {
    private readonly apiUrl: string;

    constructor() {
        this.apiUrl = 'http://localhost:3001/api';
    }

    async getAvailableAppointments(): Promise<Appointment[]> {
        try {
            const response = await fetch(`${this.apiUrl}/appointments`);
            if (!response.ok) {
                throw new Error('Error al obtener las citas disponibles');
            }
            const appointments = await response.json();
            return appointments.filter(appointment => appointment.status === 'pending');
        } catch (error) {
            console.error('Error en getAvailableAppointments:', error);
            throw error;
        }
    }

    async getAppointmentsByDate(date: string): Promise<Appointment[]> {
        try {
            const response = await fetch(`${this.apiUrl}/appointments`);
            if (!response.ok) {
                throw new Error('Error al obtener las citas');
            }
            const appointments = await response.json();
            return appointments.filter(appointment => appointment.date === date);
        } catch (error) {
            console.error('Error en getAppointmentsByDate:', error);
            throw error;
        }
    }

    formatAppointmentMessage(appointment: Appointment): string {
        return `📅 Cita el ${appointment.date} a las ${appointment.time}\n` +
               `👤 Paciente: ${appointment.clientName}\n` +
               `🏥 Obra Social: ${appointment.socialWork}\n` +
               `📱 Teléfono: ${appointment.phone}\n` +
               (appointment.email ? `📧 Email: ${appointment.email}\n` : '') +
               (appointment.description ? `📝 Descripción: ${appointment.description}\n` : '');
    }
}

export default new AppointmentService();
