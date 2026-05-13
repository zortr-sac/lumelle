export const WhatsAppTemplates = {
  bookingRequest: (vars: {
    nombre: string;
    negocio: string;
    servicio: string;
    fecha: string;
    hora: string;
    tecnica?: string;
  }) =>
    [
      `Hola ${vars.negocio} ✨`,
      ``,
      `Soy ${vars.nombre}. Acabo de reservar:`,
      `📅 ${vars.fecha} a las ${vars.hora}`,
      `💅 ${vars.servicio}${vars.tecnica ? ` — con ${vars.tecnica}` : ""}`,
      ``,
      `¿Me podrían confirmar la cita? Gracias 🌸`,
    ].join("\n"),

  confirmation: (vars: {
    nombre: string;
    negocio: string;
    servicio: string;
    fecha: string;
    hora: string;
  }) =>
    `Hola ${vars.nombre}, tu cita en ${vars.negocio} está confirmada para el ${vars.fecha} a las ${vars.hora}. Servicio: ${vars.servicio}. Te esperamos ✨`,

  reminder: (vars: {
    nombre: string;
    hora: string;
    negocio: string;
    servicio: string;
  }) =>
    `Hola ${vars.nombre} 💕 te recordamos tu cita mañana a las ${vars.hora} en ${vars.negocio} para ${vars.servicio}. Si necesitas reprogramar, avísanos con anticipación.`,

  retoque: (vars: { nombre: string; dias: number; negocio: string }) =>
    `Hola ${vars.nombre} 🌸 ya pasaron ${vars.dias} días desde tu último servicio en ${vars.negocio}. Si deseas retoque, tenemos horarios disponibles esta semana.`,

  cumpleanos: (vars: { nombre: string; negocio: string }) =>
    `¡Feliz cumpleaños ${vars.nombre}! 🎉 En ${vars.negocio} queremos regalarte un beneficio especial para tu próxima visita 💕`,
} as const;

export type TemplateName = keyof typeof WhatsAppTemplates;
