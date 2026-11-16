import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth";
import { commissionName } from "../config/commissions";
import type { ShiftDoc, UserDoc } from "../types";

export default function Leader() {
  const { user, profile } = useAuth();
  const [volunteers, setVolunteers] = useState<UserDoc[]>([]);
  const [shifts, setShifts] = useState<ShiftDoc[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const commissionId = profile?.commissionId ?? "";

  useEffect(() => {
    if (!commissionId) return;
    const qUsers = query(
      collection(db, "users"),
      where("commissionId", "==", commissionId),
      where("status", "==", "approved"),
    );
    const u1 = onSnapshot(qUsers, (snap) =>
      setVolunteers(snap.docs.map((d) => d.data() as UserDoc)),
    );
    const qShifts = query(
      collection(db, "shifts"),
      where("commissionId", "==", commissionId),
      orderBy("checkInAt", "desc"),
    );
    const u2 = onSnapshot(qShifts, (snap) =>
      setShifts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as ShiftDoc) }))),
    );
    return () => {
      u1();
      u2();
    };
  }, [commissionId]);

  const openShiftByVolunteer = useMemo(() => {
    const m = new Map<string, ShiftDoc>();
    for (const s of shifts) {
      if (!s.checkOutAt && !m.has(s.volunteerId)) m.set(s.volunteerId, s);
    }
    return m;
  }, [shifts]);

  const completedByVolunteer = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of shifts) {
      if (s.checkInAt && s.checkOutAt) {
        m.set(s.volunteerId, (m.get(s.volunteerId) ?? 0) + 1);
      }
    }
    return m;
  }, [shifts]);

  async function checkIn(v: UserDoc) {
    if (!user || !profile) return;
    setBusy(v.uid);
    try {
      await addDoc(collection(db, "shifts"), {
        volunteerId: v.uid,
        volunteerName: v.displayName,
        commissionId,
        leaderId: user.uid,
        leaderName: profile.displayName,
        checkInAt: serverTimestamp(),
      });
    } finally {
      setBusy(null);
    }
  }

  async function checkOut(shift: ShiftDoc) {
    if (!shift.id) return;
    setBusy(shift.volunteerId);
    try {
      await updateDoc(doc(db, "shifts", shift.id), {
        checkOutAt: serverTimestamp(),
      });
    } finally {
      setBusy(null);
    }
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Panel de líder</h1>
        <p className="text-sm text-gray-500">
          Comisión: <span className="font-medium">{commissionName(commissionId)}</span> · {volunteers.length} voluntarios aprobados
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {volunteers.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            Aún no tienes voluntarios aprobados en tu comisión.
          </div>
        )}
        {volunteers.map((v) => {
          const open = openShiftByVolunteer.get(v.uid);
          const completed = completedByVolunteer.get(v.uid) ?? 0;
          const isBusy = busy === v.uid;
          return (
            <div key={v.uid} className="p-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{v.displayName}</div>
                <div className="text-xs text-gray-500">{v.email}</div>
                <div className="text-xs text-gray-500">
                  Turnos completos: {completed}
                  {open && <span className="ml-2 text-blue-700">· en turno</span>}
                </div>
              </div>
              <div className="flex gap-2">
                {!open ? (
                  <button
                    disabled={isBusy}
                    onClick={() => checkIn(v)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-60"
                  >
                    Entrada
                  </button>
                ) : (
                  <button
                    disabled={isBusy}
                    onClick={() => checkOut(open)}
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
                <tr>
                  <td colSpan={4} className="py-4 px-3 text-center text-gray-500">
                    Aún no hay turnos registrados.
                  </td>
                </tr>
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
