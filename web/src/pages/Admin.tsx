import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { COMMISSIONS, commissionName } from "../config/commissions";
import type { ShiftDoc, UserDoc } from "../types";
import StatusBadge from "../components/StatusBadge";
import TierBadge from "../components/TierBadge";
import { computeTier } from "../lib/reputation";

export default function Admin() {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [shifts, setShifts] = useState<ShiftDoc[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const qUsers = query(collection(db, "users"), orderBy("appliedAt", "desc"));
    const u1 = onSnapshot(qUsers, (snap) =>
      setUsers(snap.docs.map((d) => d.data() as UserDoc)),
    );
    const u2 = onSnapshot(collection(db, "shifts"), (snap) =>
      setShifts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as ShiftDoc) }))),
    );
    return () => {
      u1();
      u2();
    };
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (filter !== "all" && u.commissionId !== filter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, filter, statusFilter]);

  const counts = useMemo(() => {
    const byComm: Record<string, number> = {};
    let pending = 0, approved = 0, cancelled = 0, rejected = 0;
    for (const u of users) {
      byComm[u.commissionId] = (byComm[u.commissionId] ?? 0) + 1;
      if (u.status === "pending") pending++;
      else if (u.status === "approved") approved++;
      else if (u.status === "cancelled") cancelled++;
      else if (u.status === "rejected") rejected++;
    }
    return { byComm, pending, approved, cancelled, rejected, total: users.length };
  }, [users]);

  async function approve(u: UserDoc) {
    await updateDoc(doc(db, "users", u.uid), {
      status: "approved",
      approvedAt: serverTimestamp(),
    });
  }
  async function reject(u: UserDoc) {
    await updateDoc(doc(db, "users", u.uid), {
      status: "rejected",
      rejectedAt: serverTimestamp(),
    });
  }
  async function promote(u: UserDoc) {
    await updateDoc(doc(db, "users", u.uid), { role: "leader" });
  }
  async function demote(u: UserDoc) {
    await updateDoc(doc(db, "users", u.uid), { role: "volunteer" });
  }
  async function toggleInitiative(u: UserDoc) {
    await updateDoc(doc(db, "users", u.uid), { initiative: !u.initiative });
  }
  async function recomputeTier(u: UserDoc) {
    const t = computeTier(u, shifts);
    await updateDoc(doc(db, "users", u.uid), { tier: t });
  }
  async function recomputeAll() {
    for (const u of users) {
      const t = computeTier(u, shifts);
      if (t !== u.tier) {
        await updateDoc(doc(db, "users", u.uid), { tier: t });
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Panel de administración</h1>
          <p className="text-sm text-gray-500">
            {counts.total} postulaciones · {counts.pending} pendientes · {counts.approved} aprobados · {counts.cancelled} cancelados · {counts.rejected} rechazados
          </p>
        </div>
        <button
          onClick={recomputeAll}
          className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm hover:brightness-110"
        >
          Recalcular tiers para todos
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Todas las comisiones</option>
            {COMMISSIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({counts.byComm[c.id] ?? 0})
              </option>
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="text-left py-2 pr-2">Persona</th>
                <th className="text-left py-2 pr-2">Comisión</th>
                <th className="text-left py-2 pr-2">Estado</th>
                <th className="text-left py-2 pr-2">Tier</th>
                <th className="text-left py-2 pr-2">Rol</th>
                <th className="text-right py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.uid} className="border-b border-gray-100 align-top">
                  <td className="py-2 pr-2">
                    <div className="font-medium">{u.displayName}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                    {u.phone && <div className="text-xs text-gray-500">{u.phone}</div>}
                  </td>
                  <td className="py-2 pr-2">{commissionName(u.commissionId)}</td>
                  <td className="py-2 pr-2"><StatusBadge status={u.status} /></td>
                  <td className="py-2 pr-2"><TierBadge tier={u.tier} /></td>
                  <td className="py-2 pr-2 text-xs capitalize">{u.role}</td>
                  <td className="py-2 text-right space-x-1 whitespace-nowrap">
                    {u.status === "pending" && (
                      <>
                        <button onClick={() => approve(u)} className="text-xs px-2 py-1 bg-green-600 text-white rounded">Aprobar</button>
                        <button onClick={() => reject(u)} className="text-xs px-2 py-1 bg-red-600 text-white rounded">Rechazar</button>
                      </>
                    )}
                    {u.status === "approved" && u.role !== "leader" && (
                      <button onClick={() => promote(u)} className="text-xs px-2 py-1 bg-purple-600 text-white rounded">Hacer líder</button>
                    )}
                    {u.role === "leader" && (
                      <button onClick={() => demote(u)} className="text-xs px-2 py-1 bg-gray-500 text-white rounded">Quitar líder</button>
                    )}
                    {u.status === "approved" && (
                      <button
                        onClick={() => toggleInitiative(u)}
                        className={`text-xs px-2 py-1 rounded ${u.initiative ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-700"}`}
                        title="Marca iniciativa para tier T1"
                      >
                        {u.initiative ? "★ Iniciativa" : "☆ Iniciativa"}
                      </button>
                    )}
                    <button onClick={() => recomputeTier(u)} className="text-xs px-2 py-1 bg-gray-800 text-white rounded">Recalc</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    No hay postulaciones que coincidan con el filtro.
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
