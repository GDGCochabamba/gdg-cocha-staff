import type { Commission } from "../types";

export const COMMISSIONS: Commission[] = [
  {
    id: "inscripciones",
    name: "Inscripciones / Registro",
    roles: "Control de asistencia el día del evento, verificación de inscritos vs. faltantes. Atención al detalle, permanecer en el área de registro desde temprano.",
    schedule: "Desde temprano el día del evento hasta concluir el ingreso de asistentes.",
  },
  {
    id: "marketing",
    name: "Marketing",
    roles: "Planificación, verificación y publicación de contenido en redes sociales. Trabajo conjunto y constante con Diseño y Video.",
    schedule: "Antes del evento, continuo.",
  },
  {
    id: "diseno",
    name: "Diseño",
    roles: "Creación de posts, templates y gráficos estáticos. Coordinación con Marketing y Video (y apoyo a Web).",
    schedule: "Antes del evento.",
  },
  {
    id: "video",
    name: "Video",
    roles: "Edición y creación de contenido audiovisual independiente del estático. Coordinación con Marketing y Diseño.",
    schedule: "Antes y durante el evento.",
  },
  {
    id: "logistica",
    name: "Logística",
    roles: "Búsqueda de sponsors, cotización/compra de alimentos y bebidas, gestión de presupuesto, selección del venue. Armar cronograma general.",
    schedule: "Trabajo previo intenso y ejecución el día del evento.",
  },
  {
    id: "web",
    name: "Web",
    roles: "Creación, actualización y mantenimiento de la página web del evento. Apoyo de Diseño cuando sea necesario.",
    schedule: "Antes del evento.",
  },
  {
    id: "decoracion",
    name: "Decoración y Actividades",
    roles: "Ambientación del lugar (globos, banners, etc.) y gestión de dinámicas especiales.",
    schedule: "Trabajo intenso un día antes del evento.",
  },
  {
    id: "speakers",
    name: "Speakers",
    roles: "Contacto previo, correos, logística de transporte (aeropuerto, hotel, venue), coordinación de horarios y actividades (especialmente para speakers extranjeros).",
    schedule: "Antes, durante y después del evento, con dedicación exclusiva a los ponentes el día del DevFest.",
  },
  {
    id: "escenario",
    name: "Staff de Escenario",
    roles: "Maestro de Ceremonias, pasar diapositivas, presentar speakers, asistencia en escenario (agua, micrófonos).",
    schedule: "Exclusivamente el día del evento en el área principal.",
  },
  {
    id: "limpieza",
    name: "Limpieza y Desarmado",
    roles: "Arrinconar, mover mobiliario y limpieza general del lugar. Todas las comisiones (excepto Speakers) participan en desarmado al final.",
    schedule: "Final del evento.",
  },
];

export function commissionName(id: string): string {
  return COMMISSIONS.find((c) => c.id === id)?.name ?? id;
}
