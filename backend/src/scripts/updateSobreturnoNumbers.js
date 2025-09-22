const mongoose = require('mongoose');
require('dotenv').config();
const Sobreturno = require('../models/sobreturno');

async function updateSobreturnoNumbers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB');

        // Obtener todos los sobreturnos que no tienen sobreturnoNumber
        const sobreturnos = await Sobreturno.find({ sobreturnoNumber: { $exists: false } });
        console.log(`Encontrados ${sobreturnos.length} sobreturnos para actualizar`);

        for (const sobreturno of sobreturnos) {
            let sobreturnoNumber;
            
            // Asignar número basado en el horario
            if (sobreturno.time.includes('11:00')) sobreturnoNumber = 1;
            else if (sobreturno.time.includes('11:15')) sobreturnoNumber = 2;
            else if (sobreturno.time.includes('11:30')) sobreturnoNumber = 3;
            else if (sobreturno.time.includes('11:45')) sobreturnoNumber = 4;
            else if (sobreturno.time.includes('12:00')) sobreturnoNumber = 5;
            else if (sobreturno.time.includes('19:00')) sobreturnoNumber = 6;
            else if (sobreturno.time.includes('19:15')) sobreturnoNumber = 7;
            else if (sobreturno.time.includes('19:30')) sobreturnoNumber = 8;
            else if (sobreturno.time.includes('19:45')) sobreturnoNumber = 9;
            else if (sobreturno.time.includes('20:00')) sobreturnoNumber = 10;

            if (sobreturnoNumber) {
                console.log(`Actualizando sobreturno ${sobreturno._id} con número ${sobreturnoNumber}`);
                await Sobreturno.updateOne(
                    { _id: sobreturno._id },
                    { $set: { sobreturnoNumber } }
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

updateSobreturnoNumbers();