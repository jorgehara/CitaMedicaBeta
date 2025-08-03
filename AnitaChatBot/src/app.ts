import { join } from 'path';
import { createBot, createProvider, createFlow, addKeyword, utils, EVENTS } from '@builderbot/bot';
import { MongoAdapter as Database } from '@builderbot/database-mongo';
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';

import welcomeFlow from 'flows/welcome.flow';
import { gptFlow } from 'flows/gpt.flow';
// import voiceNoteFlow from 'flows/voiceNote.flow';
import { adminFlow } from 'flows/admin.flow';
// import sendPdfFlow from 'flows/sendPdf.flow';
import { menuFlow, menuRecaudacion, menuCatastro } from 'flows/menu.flow';
import { formFlow } from 'flows/form.flow';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const pdfFolderPath = join(__dirname, 'pdfs');
app.use('/pdfs', express.static(pdfFolderPath));

const port = process.env.PORT ?? 3008;

const isActive = async (ctx, ctxFn) => {
    // Implementa la lógica de isActive aquí
    return true;
};

const isConvActive = async (from, ctxFn) => {
    // Implementa la lógica de isConvActive aquí
    return true;
};

const flowPrincipal = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, ctxFn) => {
        if (!await isActive(ctx, ctxFn)) {
            return ctxFn.endFlow();
        }
        if (!await isConvActive(ctx.from, ctxFn)) {
            return ctxFn.endFlow();
        }

        const welcomeArray = [
            "anita", "hola", "buenas", "buenos días", "buenas tardes", "buenas noches", "ho",
            "hola anita", "ola", "ola anita", "hi", "ole", 'ANITA',
            'HOLA',
            'BUENAS',
            'BUENOS DÍAS',
            'BUENAS TARDES',
            'BUENAS NOCHES',
            'HO',
            'HOLA ANITA',
            'OLA',
            'OLA ANITA',
            'HI',
            'OLE'
        ].map(saludo => saludo.toLowerCase());

        const keywords = [...new Set(welcomeArray)];
        const bodyText = ctx.body.toLowerCase();
        const containsKeyword = keywords.some(keyword => bodyText.includes(keyword));
        if (containsKeyword) {
            return await ctxFn.gotoFlow(welcomeFlow);
        }

        // Array de palabras a buscar
const palabrasClave = ["menu", "menú"];

// Verifica si alguna de las palabras está en el texto
if (ctx.body.length > 8 || 
   (!palabrasClave.some(palabra => ctx.body.toLowerCase().includes(palabra)) && ctx.body.length < 8)) {
    return ctxFn.gotoFlow(gptFlow);
} else {
    return ctxFn.gotoFlow(menuFlow);
}



        // if (ctx.body.length > 8 || (!ctx.body.toLowerCase().includes("menu") && ctx.body.length < 8)) {
        //     return ctxFn.gotoFlow(gptFlow);
        // } else {
        //     return ctxFn.gotoFlow(menuFlow);
        // }
    });

const main = async () => {
    const adapterFlow = createFlow([flowPrincipal, menuFlow, formFlow, welcomeFlow, gptFlow, adminFlow]);
    const adapterProvider = createProvider(Provider);
    const adapterDB = new Database({
        dbUri: process.env.MONGO_DB_URI,
        dbName: process.env.MONGO_DB_NAME,
    });

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body;
            await bot.sendMessage(number, message, { media: urlMedia ?? null });
            res.end('sended');
        })
    );

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body;
            await bot.dispatch('REGISTER_FLOW', { from: number, name });
            res.end('trigger');
        })
    );

    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body;
            await bot.dispatch('SAMPLES', { from: number, name });
            res.end('trigger');
        })
    );

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body;
            if (intent === 'remove') bot.blacklist.remove(number);
            if (intent === 'add') bot.blacklist.add(number);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok', number, intent }));
        })
    );

    const server = httpServer(+port);
    server?.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`El puerto ${port} ya está en uso. Por favor, usa otro puerto.`);
            process.exit(1);
        } else {
            throw err;
        }
    });
};

main();