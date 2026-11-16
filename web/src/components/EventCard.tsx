import { Link } from "react-router-dom";
import type { EventDoc } from "../types";

const statusLabel: Record<EventDoc["status"], { label: string; cls: string }> = {
  draft: { label: "Borrador", cls: "bg-gray-100 text-gray-700" },
  open: { label: "Postulaciones abiertas", cls: "bg-green-100 text-green-800" },
  closed: { label: "Postulaciones cerradas", cls: "bg-yellow-100 text-yellow-800" },
  past: { label: "Finalizado", cls: "bg-gray-200 text-gray-600" },
};

export default function EventCard({ event, href, actionLabel }: {
  event: EventDoc;
  href: string;
  actionLabel?: string;
}) {
  const st = statusLabel[event.status] ?? statusLabel.draft;
  return (
    <Link
      to={href}
      className="block bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-gray-400 transition"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg sm:text-xl font-semibold leading-tight">{event.name}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${st.cls}`}>
          {st.label}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-1">{fmtDate(event.dateISO)}</p>
      {event.tagline && <p className="text-sm text-gray-700 mt-2 line-clamp-2">{event.tagline}</p>}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{event.commissions.length} comisiones</span>
        <span className="text-gBlue font-medium">{actionLabel ?? "Ver detalles →"}</span>
      </div>
    </Link>
  );
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00-04:00");
  return d.toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
