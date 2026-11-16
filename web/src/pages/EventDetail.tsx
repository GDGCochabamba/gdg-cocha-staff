import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, MessageCircle } from "lucide-react";
import { useAuth } from "../auth";
import { getEventBySlug } from "../lib/events";
import { getApplication } from "../lib/applications";
import type { ApplicationDoc, EventDoc } from "../types";
import StatusBadge from "../components/StatusBadge";
import MapView from "../components/MapView";

export default function EventDetail() {
  const { slug = "" } = useParams();
  const { user, signIn } = useAuth();
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [application, setApplication] = useState<ApplicationDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const ev = await getEventBySlug(slug);
      setEvent(ev);
      if (ev && user) {
        const app = await getApplication(ev.id, user.uid);
        setApplication(app);
      }
      setLoading(false);
    })();
  }, [slug, user]);

  if (loading) return <div className="text-gray-500">Cargando…</div>;
  if (!event) return <div className="text-gray-500">Evento no encontrado.</div>;

  const isOpen = event.status === "open";

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="text-sm text-gray-500 hover:text-black">← Todos los eventos</Link>
        <h1 className="text-2xl sm:text-3xl font-semibold mt-2">{event.name}</h1>
        <p className="text-sm text-gray-600">
          {fmtDate(event.dateISO)}
          {(event.startTime || event.endTime) && (
            <> · {event.startTime || "?"}{event.endTime ? ` – ${event.endTime}` : ""}</>
          )}
        </p>
        {event.location?.name && (
          <p className="text-sm text-gray-700 mt-1 inline-flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {event.location.name}{event.location.address ? ` · ${event.location.address}` : ""}
          </p>
        )}
        {event.tagline && <p className="text-gray-700 mt-2">{event.tagline}</p>}
      </div>

      {event.location?.lat !== undefined && event.location?.lng !== undefined && (
        <MapView lat={event.location.lat} lng={event.location.lng} />
      )}

      {event.description && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 text-sm text-gray-800 whitespace-pre-line">
          {event.description}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4">
        <h2 className="font-semibold">¿Quieres ser staff?</h2>

        {application ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusBadge status={application.status} />
              <span className="text-sm text-gray-600">Comisión: {commissionNameOf(event, application.commissionId)}</span>
            </div>
            {application.status === "approved" && (event.staffStartTime || event.staffEndTime) && (
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <div className="font-medium text-blue-900">Horario del staff</div>
                <div className="text-blue-800">
                  Llegada: <span className="font-medium">{event.staffStartTime || "—"}</span>
                  {event.staffEndTime && <> · Salida: <span className="font-medium">{event.staffEndTime}</span></>}
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Los asistentes llegan a las {event.startTime || "?"}; tú llegas antes para preparar.
                </p>
              </div>
            )}
            {application.status === "approved" && event.whatsappGroupUrl && (
              <a
                href={event.whatsappGroupUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 mt-2 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <MessageCircle className="w-4 h-4" />
                Unirme al grupo de WhatsApp del staff
              </a>
            )}
            <Link
              to={`/mis-postulaciones`}
              className="block mt-1 text-sm text-gBlue hover:underline"
            >
              Ver mis postulaciones
            </Link>
          </div>
        ) : !user ? (
          <>
            <p className="text-sm text-gray-600">Inicia sesión con tu cuenta de Google para postular.</p>
            <button
              onClick={signIn}
              className="w-full sm:w-auto px-5 py-3 bg-gBlue text-white rounded-lg font-medium"
            >
              Iniciar sesión con Google
            </button>
          </>
        ) : !isOpen ? (
          <p className="text-sm text-gray-600">Las postulaciones para este evento no están abiertas.</p>
        ) : (
          <Link
            to={`/eventos/${event.slug}/postular`}
            className="inline-block w-full sm:w-auto text-center px-5 py-3 bg-gBlue text-white rounded-lg font-medium"
          >
            Postular ahora →
          </Link>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-2">Comisiones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {event.commissions.map((c) => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium">{c.name}</div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{c.limit ?? 5} cupos</span>
              </div>
              <p className="text-gray-600 mt-1"><span className="font-medium">Rol: </span>{c.roles}</p>
              <p className="text-gray-600 mt-1"><span className="font-medium">Horario: </span>{c.schedule}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function commissionNameOf(event: EventDoc, id: string): string {
  return event.commissions.find((c) => c.id === id)?.name ?? id;
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00-04:00");
  return d.toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
