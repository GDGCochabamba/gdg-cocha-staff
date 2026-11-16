import type { CatalogEntry } from "../types";

export const DEFAULT_CATALOG: CatalogEntry[] = [
  {
    id: "inscripciones",
    name: "Inscripciones / Registro",
    defaultRoles: "Control de asistencia el día del evento, verificación de inscritos vs. faltantes. Atención al detalle, permanecer en el área de registro desde temprano.",
    defaultSchedule: "Desde temprano el día del evento hasta concluir el ingreso de asistentes.",
  },
  {
    id: "marketing",
    name: "Marketing",
    defaultRoles: "Planificación, verificación y publicación de contenido en redes sociales. Trabajo conjunto y constante con Diseño y Video.",
    defaultSchedule: "Antes del evento, continuo.",
  },
  {
    id: "diseno",
    name: "Diseño",
    defaultRoles: "Creación de posts, templates y gráficos estáticos. Coordinación con Marketing y Video.",
    defaultSchedule: "Antes del evento.",
  },
  {
    id: "video",
    name: "Video",
    defaultRoles: "Edición y creación de contenido audiovisual independiente del estático. Coordinación con Marketing y Diseño.",
    defaultSchedule: "Antes y durante el evento.",
  },
  {
    id: "logistica",
    name: "Logística",
    defaultRoles: "Búsqueda de sponsors, cotización/compra de alimentos y bebidas, gestión de presupuesto, selección del venue. Armar cronograma general.",
    defaultSchedule: "Trabajo previo intenso y ejecución el día del evento.",
  },
  {
    id: "web",
    name: "Web",
    defaultRoles: "Creación, actualización y mantenimiento de la página web del evento. Apoyo de Diseño cuando sea necesario.",
    defaultSchedule: "Antes del evento.",
  },
  {
    id: "decoracion",
    name: "Decoración y Actividades",
    defaultRoles: "Ambientación del lugar (globos, banners, etc.) y gestión de dinámicas especiales.",
    defaultSchedule: "Trabajo intenso un día antes del evento.",
  },
  {
    id: "speakers",
    name: "Speakers",
    defaultRoles: "Contacto previo, correos, logística de transporte (aeropuerto, hotel, venue), coordinación de horarios y actividades (especialmente para speakers extranjeros).",
    defaultSchedule: "Antes, durante y después del evento.",
  },
  {
    id: "escenario",
    name: "Staff de Escenario",
    defaultRoles: "Maestro de Ceremonias, pasar diapositivas, presentar speakers, asistencia en escenario (agua, micrófonos).",
    defaultSchedule: "Exclusivamente el día del evento.",
  },
  {
    id: "limpieza",
    name: "Limpieza y Desarmado",
    defaultRoles: "Arrinconar, mover mobiliario y limpieza general del lugar.",
    defaultSchedule: "Final del evento.",
  },
  {
    id: "streaming",
    name: "Streaming / Transmisión",
    defaultRoles: "Operar cámaras, mezcla de video, subida a plataformas.",
    defaultSchedule: "Durante el evento.",
  },
  {
    id: "fotografia",
    name: "Fotografía",
    defaultRoles: "Cobertura fotográfica del evento, entrega de assets al final.",
    defaultSchedule: "Durante el evento.",
  },
];
