import { addKeyword, EVENTS } from '@builderbot/bot';

const welcomeFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, ctxFn) => {
        await ctxFn.endFlow("👋 ¡Hola! *Soy Anita* 👧🏼, tu asesora virtual de la *Municipalidad de Pampa del Infierno* ¿En qué puedo ayudarte hoy? escribe *Menu* para más opciones")
    })
    .addAction(async (ctx, ctxFn) => {
        const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
        await ctxFn.gotoFlow(menuFlow)
      })

export default welcomeFlow ;   