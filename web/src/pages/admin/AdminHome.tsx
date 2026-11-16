import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listEvents } from "../../lib/events";
import type { EventDoc } from "../../types";
import EventCard from "../../components/EventCard";

export default function AdminHome() {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listEvents().then((e) => {
      setEvents(e);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-semibold">Panel de administración</h1>
        <Link
          to="/admin/eventos/nuevo"
          className="w-full sm:w-auto text-center px-4 py-2 bg-black text-white rounded-lg text-sm hover:brightness-110"
        >
          + Nuevo evento
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-500">Cargando eventos…</div>
      ) : events.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center space-y-3">
          <p className="text-gray-600">No hay eventos todavía.</p>
          <Link
            to="/admin/eventos/nuevo"
            className="inline-block px-5 py-3 bg-gBlue text-white rounded-lg font-medium"
          >
            Crear primer evento
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {events.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              href={`/admin/eventos/${e.slug}`}
              actionLabel="Gestionar →"
            />
          ))}
        </div>
      )}
    </div>
  );
}
