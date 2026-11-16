import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { BRAND } from "../config/brand";
import { listEvents } from "../lib/events";
import type { EventDoc } from "../types";
import EventCard from "../components/EventCard";

export default function Home() {
  const { user, signIn, loading } = useAuth();
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    listEvents().then((all) => {
      setEvents(all.filter((e) => e.status === "open" || e.status === "closed" || e.status === "past"));
      setLoadingEvents(false);
    });
  }, []);

  const openEvents = events.filter((e) => e.status === "open");
  const closedOrPast = events.filter((e) => e.status !== "open");

  return (
    <div className="space-y-8">
      <section className="text-center space-y-3 py-6 sm:py-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          <span className="text-gBlue">{"{"}</span>
          {" "}{BRAND.name}{" "}
          <span className="text-gBlue">{"}"}</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600">{BRAND.tagline}</p>
        {!user && !loading && (
          <button
            onClick={signIn}
            className="mt-4 w-full sm:w-auto px-6 py-3 bg-gBlue text-white rounded-lg font-medium hover:brightness-110"
          >
            Iniciar sesión con Google
          </button>
        )}
      </section>

      <section>
        <h2 className="text-xl sm:text-2xl font-semibold mb-3">Eventos abiertos</h2>
        {loadingEvents ? (
          <div className="text-gray-500">Cargando eventos…</div>
        ) : openEvents.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500">
            No hay eventos con postulaciones abiertas ahora mismo. Vuelve pronto.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {openEvents.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                href={`/eventos/${e.slug}`}
                actionLabel={user ? "Postular →" : "Ver detalles →"}
              />
            ))}
          </div>
        )}
      </section>

      {closedOrPast.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Otros eventos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {closedOrPast.map((e) => (
              <EventCard key={e.id} event={e} href={`/eventos/${e.slug}`} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
