import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth";
import { getEventBySlug } from "../lib/events";
import { getApplication, subscribeApplications } from "../lib/applications";
import { checkIn, checkOut, subscribeShifts } from "../lib/shifts";
import type { ApplicationDoc, EventDoc, ShiftDoc } from "../types";

export default function LeaderPanel() {
  const { slug = "" } = useParams();
  const { user, profile } = useAuth();
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [myApp, setMyApp] = useState<ApplicationDoc | null>(null);
  const [apps, setApps] = useState<ApplicationDoc[]>([]);
  const [shifts, setShifts] = useState<ShiftDoc[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const ev = await getEventBySlug(slug);
      setEvent(ev);
      if (ev && user) {
        const a = await getApplication(ev.id, user.uid);
        setMyApp(a);
      }
    })();
  }, [slug, user]);

  useEffect(() => {
    if (!event || !myApp) return;
    const u1 = subscribeApplications(event.id, setApps);
    const u2 = subscribeShifts(event.id, myApp.commissionId, setShifts);
    return () => { u1(); u2(); };
  }, [event, myApp]);

  const volunteers = useMemo(
    () =>
      apps.filter(
        (a) => a.status === "approved" && myApp && a.commissionId === myApp.commissionId,
      ),
    [apps, myApp],
  );

  const openShiftByVol = useMemo(() => {
    const m = new Map<string, ShiftDoc>();
    for (const s of shifts) if (!s.checkOutAt && !m.has(s.volunteerId)) m.set(s.volunteerId, s);
    return m;
  }, [shifts]);

  const completedByVol = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of shifts) if (s.checkInAt && s.checkOutAt) m.set(s.volunteerId, (m.get(s.volunteerId) ?? 0) + 1);
    return m;
  }, [shifts]);

  if (!event) return <div className="text-gray-500">Cargando…</div>;
  if (!user || !myApp || myApp.role !== "leader") {
    return <div className="text-red-700">No eres líder en este evento.</div>;
  }

  const commission = event.commissions.find((c) => c.id === myApp.commissionId);

  async function handleCheckIn(v: ApplicationDoc) {
    if (!user || !profile || !event || !myApp) return;
    setBusy(v.uid);
    try {
      await checkIn(event.id, {
        volunteerId: v.uid,
        volunteerName: v.displayName,
        commissionId: myApp.commissionId,
        leaderId: user.uid,
        leaderName: profile.displayName ?? user.email ?? "Líder",
      });
    } finally {
      setBusy(null);
    }
  }

  async function handleCheckOut(shift: ShiftDoc) {
    if (!event || !shift.id) return;
    setBusy(shift.volunteerId);
    try {
      await checkOut(event.id, shift.id);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/mis-postulaciones" className="text-sm text-gray-500 hover:text-black">← Mis postulaciones</Link>
        <h1 className="text-xl sm:text-2xl font-semibold mt-2">Panel líder</h1>
        <p className="text-sm text-gray-500">
          {event.name} · Comisión: <span className="text-gray-800 font-medium">{commission?.name ?? myApp.commissionId}</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
          {(event.staffStartTime || event.staffEndTime) && (
            <span>
              🕐 Staff: {event.staffStartTime || "?"}{event.staffEndTime ? ` – ${event.staffEndTime}` : ""}
            </span>
          )}
          {(event.startTime || event.endTime) && (
            <span>
              🎤 Evento: {event.startTime || "?"}{event.endTime ? ` – ${event.endTime}` : ""}
            </span>
          )}
          {event.whatsappGroupUrl && (
            <a
              href={event.whatsappGroupUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-green-700 hover:underline"
            >
              💬 Grupo WhatsApp del staff
            </a>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {volunteers.length === 0 && (
          <div className="p-6 text-center text-gray-500">Aún no hay voluntarios aprobados.</div>
        )}
        {volunteers.map((v) => {
          const open = openShiftByVol.get(v.uid);
          const completed = completedByVol.get(v.uid) ?? 0;
          const isBusy = busy === v.uid;
          return (
            <div key={v.uid} className="p-3 sm:p-4 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{v.displayName}</div>
                <div className="text-xs text-gray-500 truncate">{v.email}</div>
                <div className="text-xs text-gray-500">
                  Turnos: {completed}{open && <span className="text-blue-700 ml-2">· en turno</span>}
                </div>
              </div>
              <div>
                {!open ? (
                  <button
                    disabled={isBusy}
                    onClick={() => handleCheckIn(v)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-60"
                  >
                    Entrada
                  </button>
                ) : (
                  <button
                    disabled={isBusy}
                    onClick={() => handleCheckOut(open)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm disabled:opacity-60"
                  >
                    Salida
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Últimos turnos</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="text-left py-2 px-3">Voluntario</th>
                <th className="text-left py-2 px-3">Entrada</th>
                <th className="text-left py-2 px-3">Salida</th>
                <th className="text-left py-2 px-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {shifts.slice(0, 20).map((s) => (
                <tr key={s.id} className="border-b border-gray-100">
                  <td className="py-2 px-3">{s.volunteerName}</td>
                  <td className="py-2 px-3 text-xs">{fmt(s.checkInAt)}</td>
                  <td className="py-2 px-3 text-xs">{s.checkOutAt ? fmt(s.checkOutAt) : "—"}</td>
                  <td className="py-2 px-3">
                    {s.checkOutAt ? (
                      <span className="text-green-700 text-xs font-medium">Completo</span>
                    ) : (
                      <span className="text-blue-700 text-xs font-medium">En turno</span>
                    )}
                  </td>
                </tr>
              ))}
              {shifts.length === 0 && (
                <tr><td colSpan={4} className="py-4 px-3 text-center text-gray-500">Sin turnos todavía.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function fmt(ts: any): string {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("es-BO");
}
