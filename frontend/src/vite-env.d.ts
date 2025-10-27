/// <reference types="vite/client" />

import { Appointment } from './types/appointment'

declare global {
  interface Window {
    refreshAppointments?: () => void;
    updateAppointmentsList?: (appointments: Appointment[]) => void;
  }
}
