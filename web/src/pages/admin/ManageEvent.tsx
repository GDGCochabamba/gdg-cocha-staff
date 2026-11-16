import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../auth";
import { getEventBySlug, updateEvent } from "../../lib/events";
import {
  approveApplication,
  demoteFromLeader,
  promoteToLeader,
  rejectApplication,
  setTier,
  subscribeApplications,
  toggleInitiative,
} from "../../lib/applications";
import { subscribeShifts } from "../../lib/shifts";
import type { ApplicationDoc, EventDoc, EventStatus, ShiftDoc } from "../../types";
import StatusBadge from "../../components/StatusBadge";
import TierBadge from "../../components/TierBadge";
import { computeTierForApplication } from "../../lib/reputation";

export default function ManageEvent() {
  const { slug = "" } = useParams();
  useAuth();
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [apps, setApps] = useState<ApplicationDoc[]>([]);
  const [shifts, setShifts] = useState<ShiftDoc[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const ev = await getEventBySlug(slug);
      setEvent(ev);
    })();
  }, [slug]);

  useEffect(() => {
    if (!event) return;
    const u1 = subscribeApplications(event.id, setApps);
    const u2 = subscribeShifts(event.id, null, setShifts);
    return () => { u1(); u2(); };
  }, [event]);

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      if (filter !== "all" && a.commissionId !== filter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      return true;
    });
  }, [apps, filter, statusFilter]);

  const counts = useMemo(() => {
    const byComm: Record<string, number> = {};
    let pending = 0, approved = 0, cancelled = 0, rejected = 0;
    for (const a of apps) {
      byComm[a.commissionId] = (byComm[a.commissionId] ?? 0) + 1;
      if (a.status === "pending") pending++;
      else if (a.status === "approved") approved++;
      else if (a.status === "cancelled") cancelled++;
      else if (a.status === "rejected") rejected++;
    }
    return { byComm, pending, approved, cancelled, rejected, total: apps.length };
  }, [apps]);

  if (!event) return <div className="text-gray-500">Cargando…</div>;

  async function changeStatus(status: EventStatus) {
    if (!event) return;
    await updateEvent(event.id, { status });
    setEvent({ ...event, status });
  }

  async function recomputeAll() {
    if (!event) return;
    for (const a of apps) {
      const t = computeTierForApplication(a, event, shifts);
      if (t !== a.tier) await setTier(event.id, a.uid, t);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin" className="text-sm text-gray-500 hover:text-black">← Eventos</Link>
        <div className="flex items-start justify-between gap-2 mt-2 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">{event.name}</h1>
            <p className="text-sm text-gray-500">{fmtDate(event.dateISO)} · <span className="text-gray-700">{event.commissions.length} comisiones</span></p>
            {event.location?.name && <p className="text-sm text-gray-500">📍 {event.location.name}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/admin/eventos/${event.slug}/editar`}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
            >
              Editar
            </Link>
            <select
              value={event.status}
              onChange={(e) => changeStatus(e.target.value as EventStatus)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="draft">Borrador</option>
              <option value="open">Postulaciones abiertas</option>
              <option value="closed">Postulaciones cerradas</option>
              <option value="past">Finalizado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
        <div className="text-sm font-medium mb-2">Ocupación por comisión</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
          {event.commissions.map((c) => {
            const approved = apps.filter((a) => a.commissionId === c.id && a.status === "approved").length;
            const pending = apps.filter((a) => a.commissionId === c.id && a.status === "pending").length;
            const limit = c.limit ?? 5;
            const pct = Math.min(100, (approved / limit) * 100);
            const isFull = approved >= limit;
            return (
              <div key={c.id} className="border border-gray-200 rounded p-2">
                <div className="font-medium truncate">{c.name}</div>
                <div className="mt-1 h-1.5 rounded bg-gray-100 overflow-hidden">
                  <div className={`h-full ${isFull ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 text-gray-600">
                  {approved}/{limit} aprobados{pending > 0 ? ` · ${pending} pend.` : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <Stat label="Total" value={counts.total} />
        <Stat label="Pendientes" value={counts.pending} />
        <Stat label="Aprobados" value={counts.approved} />
        <Stat label="Cancelados" value={counts.cancelled} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-0"
          >
            <option value="all">Todas las comisiones</option>
            {event.commissions.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({counts.byComm[c.id] ?? 0})</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobados</option>
            <option value="cancelled">Cancelados</option>
            <option value="rejected">Rechazados</option>
          </select>
          <button
            onClick={recomputeAll}
            className="ml-auto px-3 py-2 bg-gray-800 text-white rounded-lg text-xs"
          >
            Recalcular tiers
          </button>
        </div>

        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="text-left py-2 px-3">Persona</th>
                <th className="text-left py-2 px-3">Comisión</th>
                <th className="text-left py-2 px-3">Estado</th>
                <th className="text-left py-2 px-3">Tier</th>
                <th className="text-right py-2 px-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.uid} className="border-b border-gray-100 align-top">
                  <td className="py-2 px-3">
                    <div className="font-medium">{a.displayName}</div>
                    <div className="text-xs text-gray-500">{a.email}</div>
                    {a.phone && <div className="text-xs text-gray-500">{a.phone}</div>}
                  </td>
                  <td className="py-2 px-3">{event.commissions.find((c) => c.id === a.commissionId)?.name ?? a.commissionId}</td>
                  <td className="py-2 px-3"><StatusBadge status={a.status} /></td>
                  <td className="py-2 px-3">
                    <TierBadge tier={a.tier} />
                    {a.role === "leader" && (
                      <div className="mt-1">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">Líder</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right space-x-1 whitespace-nowrap">
                    {a.status === "pending" && (
                      <>
                        <button onClick={() => approveApplication(event.id, a.uid)} className="text-xs px-2 py-1 bg-green-600 text-white rounded">Aprobar</button>
                        <button onClick={() => rejectApplication(event.id, a.uid)} className="text-xs px-2 py-1 bg-red-600 text-white rounded">Rechazar</button>
                      </>
                    )}
                    {a.status === "approved" && a.role !== "leader" && (
                      <button onClick={() => promoteToLeader(event.id, a.uid)} className="text-xs px-2 py-1 bg-purple-600 text-white rounded">Hacer líder</button>
                    )}
                    {a.role === "leader" && (
                      <button onClick={() => demoteFromLeader(event.id, a.uid)} className="text-xs px-2 py-1 bg-gray-500 text-white rounded">Quitar líder</button>
                    )}
                    {a.status === "approved" && (
                      <button
                        onClick={() => toggleInitiative(event.id, a.uid, a.initiative)}
                        className={`text-xs px-2 py-1 rounded ${a.initiative ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-700"}`}
                      >
                        {a.initiative ? "★" : "☆"} Iniciativa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">Sin postulaciones.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-3 text-center">
      <div className="text-xl sm:text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00-04:00");
  return d.toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" });
}
