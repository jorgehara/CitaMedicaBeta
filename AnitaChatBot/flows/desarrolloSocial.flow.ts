import { addKeyword } from "@builderbot/bot";
import { formFlow } from "./form.flow.js";


const flowDesarrolloSocial1 = addKeyword("1")
  .addAnswer(
`📅 TURNOS PARA ANSES 📅

📝 Requisitos:

- Tener tu D.N.I a mano
- Tu clave de Seguridad Social de Anses

❗ Si no tienes tu clave, podemos ayudarte a obtenerla.

📍 Dónde solicitarla: Acércate a la oficina de Desarrollo Social de la Municipalidad de Pampa del Infierno.

📍 Dirección: Calle Sarmiento 625

🗓️ Horarios: Lunes a Viernes, de 8:00 a 12:00 hs.

🌟 ¡Te esperamos para asistirte! 🌟`
  )
  .addAction(async (ctx, ctxFn) => {
    const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
    await ctxFn.gotoFlow(menuFlow);
  });

const flowDesarrolloSocial2 = addKeyword("2")
  .addAnswer(
`🍎 *PROGRAMA DE NUTRICIÓN* 🍎

👶 *Asistencia para niños y embarazadas en bajo peso* 👩‍🍼

🍽️ *Beneficios:* 

- Módulo de mercadería rica en nutrientes
- Estabilidad nutricional del niño o embarazada
- Seguimiento a través de equipo profesional especializado
- Controles mensuales sobre peso y talla

✅ *Seguimiento:* 

- Tras varios meses de valoraciones positivas, se brinda la baja del seguimiento

🤰 *Embarazadas:* 

- Se incluye a todas las embarazadas en bajo peso, sin importar su edad
- Embarazadas menores de 16 años: Incluidas en PLAN NUTRICIONAL
- Embarazadas mayores de 16 años: Deben estar en bajo peso para ser incluidas en el PLAN NUTRICIONAL

📋 *Requisitos:* 

- Edad en niños: Desde 6 meses hasta 13 años
- Otros requisitos específicos

📍 *Dónde solicitarlo:* Acércate a la oficina de Desarrollo Social de la Municipalidad de Pampa del Infierno

📍 *Dirección:* Calle Sarmiento 625

🗓️ *Horarios:* Lunes a Viernes, de 8:00 a 12:00 hs.

🌟 ¡Te esperamos para asistirte! 🌟`
  )
  .addAction(async (ctx, ctxFn) => {
    const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
    await ctxFn.gotoFlow(menuFlow);
  });

const flowDesarrolloSocial3 = addKeyword("3")
  .addAnswer(
`🌾 PROGRAMA DE CELIAQUÍA 🌾

🏥 Asistencia para personas con celiaquía 🏥

🍽️ Beneficios: 

- Módulo de mercadería SIN TACC
- Estabilidad nutricional del paciente

📋 *Requisitos:* 

🔸 Certificado otorgado por la Unidad Provincial de Seguimiento Nutricional y Atención al Celíaco, rellenado por su médico
🔹 Fotocopia de DNI
🔸 Certificación Negativa de Anses que no posee Obra Social

📍 Dónde solicitarlo: Acércate a la oficina de Desarrollo Social de la Municipalidad de Pampa del Infierno

📍 Dirección: Calle Sarmiento 625

🗓️ Horarios: Lunes a Viernes, de 8:00 a 12:00 hs.

🌟 ¡Te esperamos para asistirte! 🌟`
  )
  .addAction(async (ctx, ctxFn) => {
    const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
    await ctxFn.gotoFlow(menuFlow);
  });

const flowDesarrolloSocial4 = addKeyword("4")
  .addAnswer(
`🚌 *PROGRAMA DE COORDINACIÓN DE VIAJES A LOS CENTROS DE SALUD DE PCIA. ROQUE SÁENZ PEÑA Y RESISTENCIA* 🚌

🏥 *Asistencia para personas que requieran viajes a centros de salud* 🏥

🔄 *Requisitos Obligatorios*

 - DNI vigente en mano.

 - Receta u orden médica para realizarse el estudio correspondiente. 

 - Asistir de manera presencial a la Oficina de Desarrollo Social.

 📍 En Calle Sarmiento 625

🗓️ Horarios: Lunes a Viernes, de 8:00 a 12:00 hs

🌟 ¡Te esperamos para asistirte! 🌟`
  )
  .addAction(async (ctx, ctxFn) => {
    const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
    await ctxFn.gotoFlow(menuFlow);
  });
const flowDesarrolloSocial5 = addKeyword("5") 
  .addAnswer(
`🎓 *ASISTENCIA DE BECAS A ESTUDIANTES* 🎓

📋 *Requisitos Principales:* 

- DNI vigente
- Correo electrónico
- Número de celular
- Certicado de Inscripción o Alumno Regular

📍 Dónde solicitarlo:
Acércate a la oficina de Desarrollo Social de la Municipalidad de Pampa del Infierno.

📍 Dirección: Calle Sarmiento 625

🗓️ Horarios: Lunes a Viernes, de 8:00 a 12:00 hs.

🌟 ¡Te esperamos para asistirte! 🌟`
  )
  .addAction(async (ctx, ctxFn) => {
    const menuFlow = await import("./menu.flow.js").then((mod) => mod.menuFlow);
    await ctxFn.gotoFlow(menuFlow);
  });

const flowDesarrolloSocial6 = addKeyword("6") 
  .addAnswer(
`📢 *Consultas, Sugerencias o Reclamos* 📢
✍¡Estamos aquí para ayudarte! Dejaremos asentada su consulta, sugerencia o reclamo, luego de unas breves preguntas...`
)
  .addAction(async (ctx, ctxFn) => {
    const formFlow = await import("./form.flow.js").then((mod) => mod.formFlow);
    await ctxFn.gotoFlow(formFlow);
  });

export {
  flowDesarrolloSocial1,
  flowDesarrolloSocial2,
  flowDesarrolloSocial3,
  flowDesarrolloSocial4,
  flowDesarrolloSocial5,
  flowDesarrolloSocial6,
};
