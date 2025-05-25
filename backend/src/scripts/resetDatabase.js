const mongoose = require('mongoose');
const Appointment = require('../models/appointment');

const resetDatabase = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGO_DB_URI || 'mongodb://admin:Consultorio2025@mongo:27017/consultorio?authSource=admin');
    
    // Eliminar todas las citas
    await Appointment.deleteMany({});
    
    console.log('Base de datos limpiada exitosamente');
    
    // Crear algunas citas de ejemplo
    const sampleAppointments = [
      {
        clientName: 'Juan Pérez',
        socialWork: 'INSSSEP',
        phone: '3794123456',
        email: 'juan@example.com',
        date: '2025-05-22',
        time: '09:00',
        status: 'pending',
        description: 'Primera consulta',
        attended: false
      },
      {
        clientName: 'María García',
        socialWork: 'OSDE',
        phone: '3794789012',
        email: 'maria@example.com',
        date: '2025-05-22',
        time: '10:00',
        status: 'confirmed',
        description: 'Control mensual',
        attended: true
      }
    ];
    
    await Appointment.insertMany(sampleAppointments);
    console.log('Citas de ejemplo creadas exitosamente');
    
  } catch (error) {
    console.error('Error al resetear la base de datos:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Ejecutar el script
resetDatabase();
