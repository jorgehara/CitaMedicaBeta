import * as XLSX from 'xlsx';
import { appointmentService } from '../services/appointmentService';

export async function exportContactsToExcel(): Promise<void> {
  const appointments = await appointmentService.getAll({ showHistory: true });

  const rows = appointments.map((a) => {
    const parts = (a.clientName || '').trim().split(' ');
    return {
      'Nombre': parts[0] || '',
      'Apellido': parts.slice(1).join(' ') || '',
      'Nombre Completo': a.clientName || '',
      'Teléfono': a.phone || '',
      'Email': a.email || '',
      'Fecha': a.date || '',
      'Hora': a.time || '',
      'Estado': a.status || '',
      'Obra Social': a.socialWork || '',
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 15 },
    { wch: 20 },
    { wch: 28 },
    { wch: 18 },
    { wch: 28 },
    { wch: 12 },
    { wch: 8  },
    { wch: 12 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Contactos');
  XLSX.writeFile(wb, 'contactos-citamedica.xlsx');
}
