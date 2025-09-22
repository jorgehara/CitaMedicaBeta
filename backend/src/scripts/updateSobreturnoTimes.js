const mongoose = require('mongoose');
require('dotenv').config();
const Sobreturno = require('../models/sobreturno');

async function updateSobreturnoTimes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB');

        // Obtener todos los sobreturnos que necesitan actualización
        const sobreturnos = await Sobreturno.find({
            $or: [
                { time: "11:00-12:00" },
                { time: "19:00-20:00" },
                { sobreturnoNumber: { $exists: false } }
            ]
        });

        console.log(`Encontrados ${sobreturnos.length} sobreturnos para actualizar`);

        for (const sobreturno of sobreturnos) {
            let updates = {};
            
            // Determinar el número y horario basado en el patrón actual
            if (sobreturno.time === "11:00-12:00") {
                // Buscar cuántos sobreturnos hay para esa fecha y turno
                const existingCount = await Sobreturno.countDocuments({
                    date: sobreturno.date,
                    time: "11:00-12:00",
                    _id: { $lt: sobreturno._id }
                });
                
                const sobreturnoNumber = existingCount + 1;
                if (sobreturnoNumber <= 5) {
                    updates.sobreturnoNumber = sobreturnoNumber;
                    updates.time = ['11:00', '11:15', '11:30', '11:45', '12:00'][sobreturnoNumber - 1];
                }
            } else if (sobreturno.time === "19:00-20:00") {
                const existingCount = await Sobreturno.countDocuments({
                    date: sobreturno.date,
                    time: "19:00-20:00",
                    _id: { $lt: sobreturno._id }
                });
                
                const sobreturnoNumber = existingCount + 6;
                if (sobreturnoNumber <= 10) {
                    updates.sobreturnoNumber = sobreturnoNumber;
                    updates.time = ['19:00', '19:15', '19:30', '19:45', '20:00'][sobreturnoNumber - 6];
                }
            }

            if (Object.keys(updates).length > 0) {
                console.log(`Actualizando sobreturno ${sobreturno._id}:`, updates);
                await Sobreturno.updateOne(
                    { _id: sobreturno._id },
                    { $set: updates }
                );
            }
        }

        console.log('Actualización completada');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateSobreturnoTimes();