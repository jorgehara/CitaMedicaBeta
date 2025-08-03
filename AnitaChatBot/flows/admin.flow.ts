import { addKeyword } from '@builderbot/bot';
import { toggleActive, toogleActiveBot, conversationsOff } from "../scripts/utils";

const adminFlow = addKeyword(["!onoff", "!help", "!activeconv", "!conversationsOff"])
    .addAction(async (ctx, ctxFn) => {
        // Lista de números de administradores autorizados
        //const adminNum = ["NUMERO ADMIN"];
        const adminNum = ["5493794051686"]

        // Validación de número de administrador
        //if (!adminNum.includes(ctx.from)) {
        //    return ctxFn.flowDynamic("No estás autorizado para comandar el bot.");
        //}
         if (!adminNum.includes(ctx.from)) {
            return ctxFn.flowDynamic("😢No estás autorizado para comandar el bot.");
        }

        // Comando de ayuda
        if (ctx.body.toLowerCase().includes("!help")) {
            return ctxFn.flowDynamic(
                "Comandos disponibles: \
                \n!onoff - Este comando activa o desactiva el bot para TODAS las conversaciones\n\
                \n!activeconv [Numero] - Este comando activa o desactiva UNA conversación por 48hs\n\
                \n!conversationsOff - Este comando devuelve las conversaciones desactivadas"
            );
        }

        // Comando para encender/apagar el bot
        if (ctx.body.toLowerCase().includes("!onoff")) {
            const active = await toogleActiveBot(ctx, ctxFn);
        }
        // Comando para encender/apagar el bot
        if (ctx.body.toLowerCase().includes("!activeconv")) {
            const numberA = ctx.body.replace(/[^0-9]/g, '');
            try {
                const active = await toggleActive(numberA, ctxFn);
            } catch (e) {
                console.log(e)
                await ctxFn.flowDynamic("Formato incorrecto");
            }
        }
        // Comando para traer conversaciones desactivadas
        if (ctx.body.toLowerCase().includes("!conversationsoff")) {
            const result = await conversationsOff(ctxFn);
            const answer = result.map(conversation => `${conversation[0]} ${conversation[1]}`).join('\n');
            await ctxFn.flowDynamic(`Conversaciones desactivadas:\n${answer}`);

        }
    });

export { adminFlow };