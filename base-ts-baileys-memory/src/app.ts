import { createBot, createProvider, createFlow, addKeyword, MemoryDB } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import fetch from 'node-fetch'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { es } from 'date-fns/locale'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './database/connection'
import { MongoAdapter } from '@builderbot/database-mongo'
import axios from 'axios'
import * as path from 'path'
import QRCode from 'qrcode';
import fs from 'fs';

dotenv.config()

// Configuración de Express
const app = express()
app.use(cors())
app.use(express.json())

// Configuración de MongoDB
export const adapterDB = new MongoAdapter({
    dbUri: process.env.MONGODB_URI || 'mongodb://admin:Consultorio2025@mongo:27017?authSource=admin',
    dbName: 'consultorio',
})

const PORT = process.env.PORT ?? 3008
const API_URL =
  process.env.API_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001/api'
    : 'http://backend:3001/api');

interface Patient {
    name: string;
    phone: string;
    obrasocial: string;
}

interface AppointmentTime {
    displayTime: string;
}

interface AppointmentDetails {
    displayDate: string;
    start: AppointmentTime;
    end: AppointmentTime;
    patient: Patient;
    summary: string;
}

interface AppointmentData {
    clientName: string;
    socialWork: string;
    phone: string;
    date: string;
    time: string;
    email?: string;
}

interface AppointmentResponse {
    success: boolean;
    data: {
        _id: string;
        clientName: string;
        socialWork: string;
        phone: string;
        date: string;
        time: string;
        status: string;
        email?: string;
    };
}

interface TimeSlot {
    displayTime: string;
    time: string;
    status: 'available' | 'unavailable';
}

interface AvailableSlots {
    morning: TimeSlot[];
    afternoon: TimeSlot[];
}

interface APIResponse {
    success: boolean;
    data: {
        displayDate: string;
        available: AvailableSlots;
    };
}

interface APIResponseWrapper {
    data: APIResponse;
}

function formatearFechaEspanol(fecha: string): string {
    const timeZone = 'America/Argentina/Buenos_Aires';
    const date = fecha.includes('T') ? 
        toZonedTime(new Date(fecha), timeZone) :
        toZonedTime(new Date(fecha + 'T00:00:00'), timeZone);
        
    console.log('8. Formateando fechaa:', date);
    const nombreDia = format(date, 'EEEE', { locale: es });
    const diaDelMes = format(date, 'dd');
    console.log('7. Día del mes:', diaDelMes);
    const nombreMes = format(date, 'MMMM', { locale: es });
    const año = format(date, 'yyyy');
    
    return `${nombreDia} ${diaDelMes} de ${nombreMes} de ${año}`;
}

async function fetchAvailableSlots(date: Date): Promise<APIResponseWrapper> {
    try {
        const formattedDate = format(date, 'yyyy-MM-dd');
        console.log('9. Consultando slots disponibles para:', formattedDate);
        const response = await axios.get<APIResponse>(`${API_URL}/appointments/available/${formattedDate}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        return { data: response.data };
    } catch (error) {
        console.error('Error al obtener slots disponibles:', error);
        throw error;
    }
}

// Primero, añadimos una función para obtener las citas reservadas
async function getReservedAppointments(date: string): Promise<string[]> {
    try {
        const response = await axios.get(`${API_URL}/appointments/reserved/${date}`);
        if (response.data.success) {
            return response.data.data.map(appointment => appointment.time);
        }
        return [];
    } catch (error) {
        console.error('Error al obtener citas reservadas:', error);
        return [];
    }
}

// Flujo para mostrar los horarios disponibles
export const availableSlotsFlow = addKeyword(['1', 'horarios', 'disponibles', 'turnos'])
.addAction(async (ctx, { flowDynamic, state }) => {
    try {
        console.log('1. Iniciando flujo de horarios disponibles');
        const timeZone = 'America/Argentina/Buenos_Aires';
        
        const now = new Date();
        const localChatDate = toZonedTime(now, timeZone);
        
        const currentHour = parseInt(format(localChatDate, 'HH'), 10);
        const currentMinute = parseInt(format(localChatDate, 'mm'), 10);
        
        console.log('2. Hora actual:', `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);

        const getNextWorkingDay = (date: Date): Date => {
            const nextDate = new Date(date);
            nextDate.setHours(0, 0, 0, 0);
            
            if (currentHour >= 18) {
                nextDate.setDate(nextDate.getDate() + 1);
            }
            
            while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
                nextDate.setDate(nextDate.getDate() + 1);
            }
            return nextDate;
        };

        const appointmentDate = getNextWorkingDay(localChatDate);
        const formattedDate = format(appointmentDate, 'yyyy-MM-dd');
        console.log('3. Fecha de cita:', formattedDate);

        // Obtener las citas reservadas antes de mostrar los horarios disponibles
        const reservedTimes = await getReservedAppointments(formattedDate);
        console.log('4. Horarios reservados:', reservedTimes);

        const slotResponse = await fetchAvailableSlots(appointmentDate);
        const { data } = slotResponse;

        if (data.success) {
            const fechaFormateada = formatearFechaEspanol(data.data.displayDate);
            let message = `📅 *Horarios disponibles*\n`;
            message += `📆 Para el día: *${fechaFormateada}*\n\n`;
            
            const slots: TimeSlot[] = [];
            let morningMessage = '';
            let afternoonMessage = '';
            
            // Actualizamos el filtrado de horarios incluyendo la verificación de reservas
            const availableMorning = data.data.available.morning
                .filter(slot => {
                    const [slotHour, slotMinute] = slot.displayTime.split(':').map(Number);
                    
                    if (reservedTimes.includes(slot.displayTime)) {
                        return false;
                    }
                    
                    if (format(appointmentDate, 'yyyy-MM-dd') === format(localChatDate, 'yyyy-MM-dd')) {
                        return slot.status === 'available' && 
                               (slotHour > currentHour || 
                                (slotHour === currentHour && slotMinute > currentMinute));
                    }
                    return slot.status === 'available';
                });

            const availableAfternoon = data.data.available.afternoon
                .filter(slot => {
                    const [slotHour, slotMinute] = slot.displayTime.split(':').map(Number);
                    
                    if (reservedTimes.includes(slot.displayTime)) {
                        return false;
                    }
                    
                    if (format(appointmentDate, 'yyyy-MM-dd') === format(localChatDate, 'yyyy-MM-dd')) {
                        return slot.status === 'available' && 
                               (slotHour > currentHour || 
                                (slotHour === currentHour && slotMinute > currentMinute));
                    }
                    return slot.status === 'available';
                });

            if (availableMorning.length > 0) {
                morningMessage = `*🌅 Horarios de mañana:*\n`;
                availableMorning.forEach((slot, index) => {
                    slots.push(slot);
                    morningMessage += `${slots.length}. ⏰ ${slot.displayTime}\n`;
                });
                message += morningMessage + '\n';
            }
            
            if (availableAfternoon.length > 0) {
                afternoonMessage = `*🌇 Horarios de tarde:*\n`;
                availableAfternoon.forEach((slot, index) => {
                    slots.push(slot);
                    afternoonMessage += `${slots.length}. ⏰ ${slot.displayTime}\n`;
                });
                message += afternoonMessage;
            }

            if (slots.length === 0) {
                await flowDynamic('❌ Lo siento, no hay horarios disponibles para el día solicitado.');
                return;
            }

            await state.update({
                availableSlots: slots,
                appointmentDate: format(appointmentDate, 'yyyy-MM-dd'),
                fullConversationTimestamp: format(localChatDate, "yyyy-MM-dd'T'HH:mm:ssXXX"),
                conversationStartTime: format(localChatDate, 'HH:mm'),
            });

            await flowDynamic(message);
        } else {
            await flowDynamic('Lo siento, hubo un problema al obtener los horarios disponibles. Por favor, intenta nuevamente.');
        }
    } catch (error) {
        console.error('Error al procesar la respuesta:', error);
        await flowDynamic('Lo siento, ocurrió un error al consultar los horarios. Por favor, intenta nuevamente más tarde.');
    }
})

    .addAnswer('✍️ Por favor, indica el número del horario que deseas reservar. Si no deseas reservar, escribe *cancelar*.', { capture: true }, async (ctx, { gotoFlow, flowDynamic, state }) => {
        if (ctx.body.toLowerCase() === 'cancelar') {
            await flowDynamic(`❌ *Reserva cancelada.* Si necesitas más ayuda, no dudes en contactarnos nuevamente.\n🤗 ¡Que tengas un excelente día!`);
            return;
        }

        const selectedSlotNumber = parseInt(ctx.body);
        const availableSlots = state.get('availableSlots');

        if (isNaN(selectedSlotNumber) || selectedSlotNumber < 1 || selectedSlotNumber > availableSlots.length) {
            await flowDynamic('Número de horario inválido. Por favor, intenta nuevamente.');
            return;
        }

        const selectedSlot = availableSlots[selectedSlotNumber - 1];
        await state.update({ selectedSlot: selectedSlot });
        return gotoFlow(bookAppointmentFlow);
    });

// Flujo para construir una cita
export const bookAppointmentFlow = addKeyword(['2', 'reservar', 'cita', 'agendar'])
    .addAnswer(
        'Por favor, indícame tu *NOMBRE* y *APELLIDO* (ej: Juan Pérez):',
        { capture: true }
    )
    .addAction(async (ctx, { state }) => {
        const name = ctx.body.trim();
        await state.update({ clientName: name });
    })
    .addAnswer(
        '*Por favor*, selecciona tu *OBRA SOCIAL* de la siguiente lista:\n\n' +
        '1️⃣ INSSSEP\n' +
        '2️⃣ Swiss Medical\n' +
        '3️⃣ OSDE\n' +
        '4️⃣ Galeno\n' +
        '5️⃣ CONSULTA PARTICULAR',
        { capture: true }
    )
    .addAction(async (ctx, { state }) => {
        const socialWorkOption = ctx.body.trim();
        const socialWorks = {
            '1': 'INSSSEP',
            '2': 'Swiss Medical',
            '3': 'OSDE',
            '4': 'Galeno',
            '5': 'CONSULTA PARTICULAR',
            '6': 'CONSULTA PARTICULAR',
            '7': 'CONSULTA PARTICULAR',
            '8': 'CONSULTA PARTICULAR',
            '9': 'CONSULTA PARTICULAR',
        };

        const socialWork = socialWorks[socialWorkOption] || 'CONSULTA PARTICULAR';
        await state.update({ socialWork });
    })
    .addAnswer(
        '*Vamos a proceder con la reserva de tu cita.*',
        { delay: 1000 }
    )
    .addAction(async (ctx, { flowDynamic, state }) => {
        try {
            const clientName = state.get('clientName');
            const socialWork = state.get('socialWork');
            const selectedSlot = state.get('selectedSlot');
            const appointmentDate = state.get('appointmentDate');
            const phone = ctx.from;

            const appointmentData = {
                clientName,
                socialWork,
                phone: phone,
                date: appointmentDate,
                time: selectedSlot.displayTime,
                email: phone + '@phone.com',
                description: 'Reserva de cita'
            };

            try {
                const response = await axios.post(`${API_URL}/appointments`, appointmentData, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const data = response.data;

                if (data.success) {
                    const fechaFormateada = formatearFechaEspanol(data.data.date);
                    const message = `✨ *CONFIRMACIÓN DE CITA MÉDICA* ✨\n\n` +
                        `✅ La cita ha sido agendada exitosamente\n\n` +
                        `📅 *Fecha:* ${fechaFormateada}\n` +
                        `🕒 *Hora:* ${data.data.time}\n` +
                        `👤 *Paciente:* ${data.data.clientName}\n` +
                        `📞 *Teléfono:* ${data.data.phone}\n` +
                        `🏥 *Obra Social:* ${data.data.socialWork}\n\n` +
                        `ℹ️ *Información importante:*\n` +
                        `- Por favor, llegue 10 minutos antes de su cita\n` +
                        `- Traiga su documento de identidad\n` +
                        `- Traiga su carnet de obra social\n\n` +
                        `📌 *Para cambios o cancelaciones:*\n` +
                        `Por favor contáctenos con anticipación\n\n` +
                        `*¡Gracias por confiar en nosotros!* 🙏\n` +
                        `----------------------------------`;
                    await flowDynamic(message);
                } else {
                    await flowDynamic('Lo siento, hubo un problema al crear la cita. Por favor, intenta nuevamente.');
                }
            } catch (error) {
                console.error('Error al crear la cita:', error);
                await flowDynamic('Lo siento, ocurrió un error al crear la cita. Por favor, intenta nuevamente más tarde.');
            }
        } catch (error) {
            console.error('Error:', error);
            await flowDynamic('❌ Hubo un error al agendar la cita. Por favor, intenta nuevamente.');
        }
    })
    .addAction(async (ctx, ctxFn) => {
        await ctxFn.gotoFlow(goodbyeFlow);
    });
//Flujo de despedida
export const goodbyeFlow = addKeyword(['bye', 'adiós', 'chao', 'chau'])
    .addAnswer(
        `👋 *¡Hasta luego! Si necesitas más ayuda, no dudes en contactarnos nuevamente.*`,
        { delay: 1000 }
    )
    .addAction(async (ctx, ctxFn 
    ) => {
        await ctxFn.gotoFlow(welcomeFlow);
    });

// Flujo de bienvenida
const welcomeFlow = addKeyword<Provider, IDBDatabase>(['hi', 'hello', 'hola'])
    .addAnswer(`🤖🩺 *¡Bienvenido al Asistente Virtual del Consultorio Médico!* 🩺`)
    .addAnswer(
        [
            'Puedo ayudarte con las siguientes opciones:',
            '',
            '1️⃣ *horarios* - Ver horarios disponibles para citas',
            '',
            '¿En qué puedo ayudarte hoy?'
        ].join('\n')
    );

// Variable global para almacenar el QR y el estado del bot
let globalQR: string | null = null;
let provider: Provider | null = null;

// Endpoint para servir el código QR
app.get('/qr', async (req, res) => {
    try {
        if (!globalQR) {
            return res.status(404).json({ error: 'QR no disponible aún' });
        }
        const qrBuffer = await QRCode.toBuffer(globalQR);
        res.type('png');
        res.send(qrBuffer);
    } catch (error) {
        console.error('Error al generar QR:', error);
        res.status(500).json({ error: 'Error al generar QR' });
    }
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor del chatbot escuchando en puerto ${PORT}`);
});
// Función principal para iniciar el bot
const main = async () => {
    //conexion a la base de datos
    await connectDB();

    //Inicia los flujos de conversaciones
    const adapterFlow = createFlow([
        welcomeFlow,
        availableSlotsFlow,
        bookAppointmentFlow,
        goodbyeFlow
    ]);

    const adapterProvider = createProvider(Provider)
    provider = adapterProvider;

    adapterProvider.on('qr', (qr) => {
        globalQR = qr;
        console.log('Nuevo QR generado');
    });

    adapterProvider.on('ready', () => {
        console.log('Bot está listo');
        globalQR = null; // Limpiar QR cuando el bot está conectado
    });

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB
    })

    httpServer(+PORT)
}

main()