import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth";
import { getEventBySlug } from "../lib/events";
import { createApplication, getApplication } from "../lib/applications";
import CustomQuestionFields from "../components/CustomQuestionFields";
import type { ApplicationDoc, Availability, CustomAnswerValue, EventDoc } from "../types";

const CLAUSE =
  'Entiendo que mi participación como Staff es fundamental para el evento. Si soy aceptado y falto a mi turno sin dar aviso con al menos 48 horas de anticipación, perderé la oportunidad de ser staff en futuros eventos del GDG Cochabamba y mi perfil será marcado en la base de datos de la comunidad.';

export default function Postulate() {
  const { slug = "" } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [apps, setApps] = useState<ApplicationDoc[]>([]);
  const [existing, setExisting] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [commissionId, setCommissionId] = useState("");
  const [secondary, setSecondary] = useState<Set<string>>(new Set());
  const [hasExperience, setHasExperience] = useState<"yes" | "no" | "">("");
  const [availability, setAvailability] = useState<Availability | "">("");
  const [skills, setSkills] = useState("");
  const [motivation, setMotivation] = useState("");
  const [customAnswers, setCustomAnswers] = useState<Record<string, CustomAnswerValue>>({});
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
    if (user?.email && !contactEmail) setContactEmail(user.email);
  }, [user, fullName, contactEmail]);

  function spotsLeft(cid: string): { count: number; limit: number; left: number } {
    const c = event?.commissions.find((x) => x.id === cid);
    const limit = c?.limit ?? 5;
    const count = apps.filter(
      (a) => a.commissionId === cid && (a.status === "approved" || a.status === "pending"),
    ).length;
    return { count, limit, left: Math.max(0, limit - count) };
  }

  function toggleSecondary(id: string) {
    setSecondary((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !event) return;
    const name = fullName.trim();
    if (!name || name.length < 3) return setError("Dinos cómo te llamas (mínimo 3 caracteres)");
    if (!phone.trim() || phone.trim().length < 6) return setError("Teléfono / WhatsApp es obligatorio");
    if (!commissionId) return setError("Elige la comisión en la que más te interesa participar");
    if (spotsLeft(commissionId).left <= 0) return setError("Esta comisión ya no tiene cupos.");
    if (!hasExperience) return setError("Indica si tienes experiencia previa");
    if (!availability) return setError("Indica tu disponibilidad el día del evento");
    const customQuestions = event.customQuestions ?? [];
    for (const q of customQuestions) {
      if (!q.required) continue;
      const v = customAnswers[q.id];
      const empty =
        v === undefined ||
        (typeof v === "string" && !v.trim()) ||
        (Array.isArray(v) && v.length === 0);
      if (empty) {
        setError(`Falta responder: ${q.label}`);
        return;
      }
    }
    if (!accepted) return setError("Debes aceptar el acuerdo de responsabilidad");
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
        contactEmail: contactEmail.trim(),
        commissionId,
        secondaryInterests: Array.from(secondary),
        hasPriorExperience: hasExperience === "yes",
        availability,
        skills: skills.trim(),
        motivation: motivation.trim(),
        customAnswers,
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
        <Section title="Datos personales">
          <Field label="Nombre completo" required>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej: María Pérez Rojas" className={inputCls} maxLength={80} required />
          </Field>
          <Field label="Correo de contacto" help="Si prefieres otro al de tu sesión">
            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="tu@correo.com" className={inputCls} />
          </Field>
          <Field label="Teléfono / WhatsApp" required>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+591 ..." className={inputCls} required />
          </Field>
        </Section>

        <Section title="Comisión">
          <Field label="¿En qué comisión te interesa más participar?" required>
            <select value={commissionId} onChange={(e) => setCommissionId(e.target.value)} className={inputCls} required>
              <option value="">— Elige una —</option>
              {event.commissions.map((c) => {
                const s = spotsLeft(c.id);
                return (
                  <option key={c.id} value={c.id} disabled={s.left <= 0}>
                    {c.name} ({s.count}/{s.limit}){s.left <= 0 ? " — llena" : ""}
                  </option>
                );
              })}
            </select>
            {selected && (
              <div className="mt-3 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
                <p><span className="font-medium">Rol:</span> {selected.roles}</p>
                <p><span className="font-medium">Horario:</span> {selected.schedule}</p>
                {selectedSpots && <p className="text-xs">Cupos disponibles: {selectedSpots.left} de {selectedSpots.limit}.</p>}
              </div>
            )}
          </Field>

          <Field label="¿Puedes ayudar en otras áreas también?" help="Opcional — la organización puede moverte si tu comisión principal se llena.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {event.commissions.filter((c) => c.id !== commissionId).map((c) => (
                <label key={c.id} className="flex items-start gap-2 text-sm">
                  <input type="checkbox" checked={secondary.has(c.id)} onChange={() => toggleSecondary(c.id)} className="mt-0.5" />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          </Field>
        </Section>

        <Section title="Sobre ti">
          <Field label="¿Tienes experiencia previa como staff en eventos tecnológicos?" required>
            <div className="flex gap-4 flex-wrap">
              {["yes", "no"].map((v) => (
                <label key={v} className="flex items-center gap-2 text-sm">
                  <input type="radio" name="exp" checked={hasExperience === v} onChange={() => setHasExperience(v as "yes" | "no")} />
                  <span>{v === "yes" ? "Sí" : "No"}</span>
                </label>
              ))}
            </div>
          </Field>

          <Field label={`¿Disponibilidad el día del evento (${fmtDate(event.dateISO)})?`} required>
            <div className="flex gap-4 flex-wrap">
              {[
                { v: "full", label: "Sí, todo el día" },
                { v: "partial", label: "Parcialmente" },
                { v: "none", label: "No, solo momentos puntuales" },
              ].map(({ v, label }) => (
                <label key={v} className="flex items-center gap-2 text-sm">
                  <input type="radio" name="avail" checked={availability === v} onChange={() => setAvailability(v as Availability)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Habilidad especial o herramienta que destaques" help="Opcional. Ej: manejo cámara profesional, diseño en Figma, redes, etc.">
            <textarea value={skills} onChange={(e) => setSkills(e.target.value)} rows={3} maxLength={600} className={inputCls} />
          </Field>

          <Field label="¿Por qué te gustaría ser parte del equipo?" help="Opcional. Cuéntanos qué te motiva.">
            <textarea value={motivation} onChange={(e) => setMotivation(e.target.value)} rows={3} maxLength={600} className={inputCls} />
          </Field>
        </Section>

        {event.customQuestions && event.customQuestions.length > 0 && (
          <Section title="Preguntas del evento">
            <CustomQuestionFields
              questions={event.customQuestions}
              answers={customAnswers}
              onChange={setCustomAnswers}
            />
          </Section>
        )}

        <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
          <p className="text-sm text-gray-800 italic">"{CLAUSE}"</p>
          <label className="mt-3 flex items-start gap-2 text-sm">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5" required />
            <span>Acepto el acuerdo de responsabilidad.</span>
          </label>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
        )}

        <button type="submit" disabled={saving} className="w-full py-3 bg-gBlue text-white rounded-lg font-medium disabled:opacity-60">
          {saving ? "Enviando…" : "Enviar postulación"}
        </button>
      </form>
    </div>
  );
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, required, help, children }: { label: string; required?: boolean; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {help && <p className="text-xs text-gray-500 mt-1">{help}</p>}
    </div>
  );
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00-04:00");
  return d.toLocaleDateString("es-BO", { day: "numeric", month: "long" });
}
