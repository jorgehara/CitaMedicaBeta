const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subdomain: { type: String, default: null }, // null = dominio raíz

  settings: {
    timezone: { type: String, default: 'America/Argentina/Buenos_Aires' },
    appointmentDuration: { type: Number, default: 15 },
    maxSobreturnos: { type: Number, default: 10 },
    businessHours: {
      morning: {
        start: { type: String, default: '10:00' },
        end: { type: String, default: '11:45' },
        enabled: { type: Boolean, default: true }
      },
      afternoon: {
        start: { type: String, default: '17:00' },
        end: { type: String, default: '19:45' },
        enabled: { type: Boolean, default: true }
      }
    },
    sobreturnoHours: {
      morning: {
        start: { type: String, default: '11:00' },
        end: { type: String, default: '12:00' },
        enabled: { type: Boolean, default: true }
      },
      afternoon: {
        start: { type: String, default: '19:00' },
        end: { type: String, default: '20:00' },
        enabled: { type: Boolean, default: true }
      }
    },
    // Días hábiles: 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
    workingDays: { type: [Number], default: [1, 2, 3, 4, 5, 6] }
  },

  socialWorks: {
    type: [String],
    default: ['INSSSEP', 'Swiss Medical', 'OSDE', 'Galeno', 'CONSULTA PARTICULAR', 'Otras Obras Sociales']
  },

  googleCalendar: {
    calendarId: { type: String, default: null },
    credentialsPath: { type: String, default: null },
    connected: { type: Boolean, default: false }
  },

  chatbot: {
    webhookUrl: { type: String, default: null },
    apiKey: { type: String, default: null },
    active: { type: Boolean, default: false }
  },

  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Clinic', clinicSchema);
