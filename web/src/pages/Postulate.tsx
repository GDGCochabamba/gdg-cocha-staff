import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth";
import { getEventBySlug } from "../lib/events";
import { createApplication, getApplication } from "../lib/applications";
import type { ApplicationDoc, EventDoc } from "../types";

const CLAUSE =
  'Entiendo que mi participación como Staff es fundamental para el evento. Si soy aceptado y falto a mi turno sin dar aviso con al menos 48 horas de anticipación, perderé la oportunidad de ser staff en futuros eventos del GDG Cochabamba y mi perfil será marcado en la base de datos de la comunidad.';

export default function Postulate() {
  const { slug = "" } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [apps, setApps] = useState<ApplicationDoc[]>([]);
  const [existing, setExisting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [commissionId, setCommissionId] = useState("");
  const [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const ev = await getEventBySlug(slug);
      setEvent(ev);
      if (!ev) return;
      if (user) {
        const app = await getApplication(ev.id, user.uid);
        if (app) setExisting(true);
      }
      const snap = await getDocs(collection(db, "events", ev.id, "applications"));
      setApps(snap.docs.map((d) => d.data() as ApplicationDoc));
    })();
  }, [slug, user]);

  useEffect(() => {
    if (user?.displayName && !fullName) setFullName(user.displayName);
  }, [user, fullName]);

  function spotsLeft(cid: string): { approved: number; pending: number; limit: number; left: number } {
    const c = event?.commissions.find((x) => x.id === cid);
    const limit = c?.limit ?? 5;
    const approved = apps.filter((a) => a.commissionId === cid && a.status === "approved").length;
    const pending = apps.filter((a) => a.commissionId === cid && a.status === "pending").length;
    return { approved, pending, limit, left: Math.max(0, limit - (approved + pending)) };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !event) return;
    const name = fullName.trim();
    if (!name || name.length < 3) {
      setError("Dinos cómo te llamas (mínimo 3 caracteres)");
      return;
    }
    if (!commissionId) {
      setError("Elige una comisión");
      return;
    }
    const s = spotsLeft(commissionId);
    if (s.left <= 0) {
      setError("Esta comisión ya no tiene cupos disponibles.");
      return;
    }
    if (!accepted) {
      setError("Debes aceptar el acuerdo de responsabilidad");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createApplication({
        eventId: event.id,
        uid: user.uid,
        email: user.email ?? "",
        displayName: name,
        photoURL: user.photoURL ?? "",
        phone: phone.trim(),
        commissionId,
      });
      nav(`/mis-postulaciones`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "No pudimos guardar tu postulación.");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return <div className="text-gray-500">Debes iniciar sesión.</div>;
  if (!event) return <div className="text-gray-500">Cargando evento…</div>;
  if (event.status !== "open") return <div className="text-gray-500">Postulaciones cerradas para este evento.</div>;
  if (existing) {
    return (
      <div className="max-w-xl mx-auto bg-white border rounded-xl p-6 text-center space-y-3">
        <p className="text-gray-700">Ya tienes una postulación para este evento.</p>
        <button onClick={() => nav("/mis-postulaciones")} className="px-5 py-2 bg-gBlue text-white rounded-lg">
          Ver mis postulaciones
        </button>
      </div>
    );
  }

  const selected = event.commissions.find((c) => c.id === commissionId);
  const selectedSpots = commissionId ? spotsLeft(commissionId) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Postular a {event.name}</h1>
        <p className="text-xs sm:text-sm text-gray-500 break-all">Sesión: {user.email}</p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ej: María Pérez Rojas"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            maxLength={80}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Como te conocen. Aparecerá en tu certificado si llegas a Tier 1.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Comisión</label>
          <select
            value={commissionId}
            onChange={(e) => setCommissionId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
            <option value="">— Elige una comisión —</option>
            {event.commissions.map((c) => {
              const s = spotsLeft(c.id);
              const full = s.left <= 0;
              return (
                <option key={c.id} value={c.id} disabled={full}>
                  {c.name} ({s.approved + s.pending}/{s.limit}){full ? " — llena" : ""}
                </option>
              );
            })}
          </select>
          {selected && (
            <div className="mt-3 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
              <p><span className="font-medium">Rol:</span> {selected.roles}</p>
              <p><span className="font-medium">Horario:</span> {selected.schedule}</p>
              {selectedSpots && (
                <p className="text-xs">
                  Cupos: <span className="font-medium">{selectedSpots.left}</span> de {selectedSpots.limit} disponibles.
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono / WhatsApp (opcional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+591 ..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
          <p className="text-sm text-gray-800 italic">"{CLAUSE}"</p>
          <label className="mt-3 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5"
              required
            />
            <span>Acepto el acuerdo de responsabilidad.</span>
          </label>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-gBlue text-white rounded-lg font-medium disabled:opacity-60"
        >
          {saving ? "Enviando…" : "Enviar postulación"}
        </button>
      </form>
    </div>
  );
}
