import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth";
import { COMMISSIONS } from "../config/commissions";
import type { UserDoc } from "../types";

const CLAUSE =
  'Entiendo que mi participación como Staff es fundamental para el DevFest. Si soy aceptado y falto a mi turno sin dar aviso con al menos 48 horas de anticipación, perderé la oportunidad de ser staff en futuros eventos del GDG Cochabamba y mi perfil será marcado en la base de datos de la comunidad.';

export default function Postulate() {
  const { user, profile } = useAuth();
  const nav = useNavigate();
  const [commissionId, setCommissionId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) nav("/mi-estado", { replace: true });
  }, [profile, nav]);

  useEffect(() => {
    if (user?.displayName && !fullName) setFullName(user.displayName);
  }, [user, fullName]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const name = fullName.trim();
    if (!name) {
      setError("Dinos cómo te llamas");
      return;
    }
    if (name.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }
    if (!commissionId) {
      setError("Elige una comisión");
      return;
    }
    if (!accepted) {
      setError("Debes aceptar el acuerdo de responsabilidad");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const data: Partial<UserDoc> = {
        uid: user.uid,
        email: user.email ?? "",
        displayName: name,
        photoURL: user.photoURL ?? "",
        phone: phone.trim(),
        commissionId,
        role: "volunteer",
        status: "pending",
        tier: "none",
      };
      await setDoc(doc(db, "users", user.uid), {
        ...data,
        acceptedClauseAt: serverTimestamp(),
        appliedAt: serverTimestamp(),
      });
      nav("/mi-estado");
    } catch (err) {
      console.error(err);
      setError("No pudimos guardar tu postulación. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  const commission = COMMISSIONS.find((c) => c.id === commissionId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Postulación de Staff</h1>
        <p className="text-sm text-gray-500">
          Sesión: <span className="font-medium">{user.email}</span>
        </p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
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
          <p className="text-xs text-gray-500 mt-1">
            Como te conocen. Es el nombre que verán los organizadores y aparecerá en tu certificado si llegas a Tier 1.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Comisión a la que postulas</label>
          <select
            value={commissionId}
            onChange={(e) => setCommissionId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          >
            <option value="">— Elige una comisión —</option>
            {COMMISSIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {commission && (
            <div className="mt-3 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
              <p><span className="font-medium">Rol:</span> {commission.roles}</p>
              <p><span className="font-medium">Horario:</span> {commission.schedule}</p>
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
