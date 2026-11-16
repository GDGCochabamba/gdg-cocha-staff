import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { cancelApplication, getUserApplications } from "../lib/applications";
import { listEvents } from "../lib/events";
import type { ApplicationDoc, EventDoc } from "../types";
import StatusBadge from "../components/StatusBadge";
import TierBadge from "../components/TierBadge";

export default function MyApplications() {
  const { user } = useAuth();
  const [apps, setApps] = useState<ApplicationDoc[]>([]);
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!user) return;
    const [a, e] = await Promise.all([getUserApplications(user.uid), listEvents()]);
    setApps(a.sort((x, y) => (y.appliedAt?.toMillis?.() ?? 0) - (x.appliedAt?.toMillis?.() ?? 0)));
    setEvents(e);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [user]);

  if (!user) return <div className="text-gray-500">Debes iniciar sesión.</div>;
  if (loading) return <div className="text-gray-500">Cargando…</div>;

  async function cancel(app: ApplicationDoc) {
    if (!confirm("¿Cancelar tu participación en este evento? Pasarás a Standby para futuros eventos.")) return;
    await cancelApplication(app.eventId, app.uid);
    await refresh();
  }

  const stats = {
    total: apps.length,
    approved: apps.filter((a) => a.status === "approved").length,
    tier1: apps.filter((a) => a.tier === "T1").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Mis postulaciones</h1>
        <p className="text-sm text-gray-500 break-all">{user.email}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="Postulaciones" value={stats.total} />
        <Stat label="Aprobadas" value={stats.approved} />
        <Stat label="Tier 1" value={stats.tier1} />
      </div>

      {apps.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-600">Aún no has postulado a ningún evento.</p>
          <Link to="/" className="inline-block mt-3 text-gBlue hover:underline text-sm">Ver eventos abiertos →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => {
            const ev = events.find((e) => e.id === a.eventId);
            const canCancel =
              (a.status === "pending" || a.status === "approved") &&
              ev &&
              hoursUntilEvent(ev) > (ev.cancelCutoffHours ?? 48);
            return (
              <div key={a.eventId} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{ev?.name ?? a.eventId}</h3>
                    <p className="text-xs text-gray-500">{ev ? fmtDate(ev.dateISO) : ""}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <TierBadge tier={a.tier} />
                  {ev && <span>· Comisión: <span className="text-gray-800">{ev.commissions.find((c) => c.id === a.commissionId)?.name ?? a.commissionId}</span></span>}
                  {a.role === "leader" && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      Líder
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-1 items-center">
                  {ev && <Link to={`/eventos/${ev.slug}`} className="text-xs text-gBlue hover:underline">Ver evento →</Link>}
                  {a.role === "leader" && ev && (
                    <Link to={`/lider/${ev.slug}`} className="text-xs text-purple-700 hover:underline">
                      Panel líder →
                    </Link>
                  )}
                  {a.status === "approved" && ev?.whatsappGroupUrl && (
                    <a
                      href={ev.whatsappGroupUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs text-green-700 hover:underline"
                    >
                      💬 Grupo WhatsApp del staff
                    </a>
                  )}
                  {canCancel && (
                    <button onClick={() => cancel(a)} className="text-xs text-red-700 hover:underline">
                      Cancelar participación
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-3 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function hoursUntilEvent(e: EventDoc): number {
  const d = new Date(e.dateISO + "T00:00:00-04:00");
  return (d.getTime() - Date.now()) / 3600000;
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00-04:00");
  return d.toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" });
}
