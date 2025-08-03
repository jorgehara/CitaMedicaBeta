import { addKeyword, EVENTS } from "@builderbot/bot";
import { writeToSheet, readSheet, appendToSheet, getFilteredData } from "../scripts/sheets";

const formFlow = addKeyword(EVENTS.ACTION)
    .addAnswer("😊 ¿Cómo te llamas?", { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({ name: ctx.body }); // Guarda el nombre del usuario en el estado
        }
    )
    .addAnswer("👋 encantado de conocerte. Brindame tu número teléfonico 📲 o 📧Email", { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({ mail: ctx.body }); // Guarda el mail en el estado
        }
    )
    .addAnswer("✍ ¿Cuál es el motivo de tu consulta/reclamo/sugerencia? *Tomate tu tiempo* para detallarnos lo que necesitas", { capture: true },
        async (ctx, ctxFn) => {
            await ctxFn.state.update({ motive: ctx.body }); // Guarda el motivo en el estado
        }
        )
        .addAnswer(
        `🤗 ¡Gracias por la información!\nNotificaré al Área correspondiente a la brevedad.\nSi tienes otra consulta puedes escribir *Menu*`, 
        null,
        async (ctx, ctxFn) => {
            const userInfo = await ctxFn.state.getMyState(); // Recupera todos los datos almacenados en el estado
            await appendToSheet([[userInfo.name, userInfo.mail, userInfo.motive]])
        })
    .addAction(async (ctx, ctxFn) => {
            const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
            await ctxFn.gotoFlow(menuFlow);
        });

export { formFlow };