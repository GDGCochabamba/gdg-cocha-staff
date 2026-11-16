import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import { DEFAULT_CATALOG } from "../../config/catalog";
import { createEvent } from "../../lib/events";
import type { Commission } from "../../types";
import { slugify } from "../../lib/slug";

export default function CreateEvent() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [dateISO, setDateISO] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [custom, setCustom] = useState<Commission[]>([]);
  const [customName, setCustomName] = useState("");
  const [customRoles, setCustomRoles] = useState("");
  const [customSchedule, setCustomSchedule] = useState("");
  const [cancelHours, setCancelHours] = useState(48);
  const [status, setStatus] = useState<"draft" | "open">("draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addCustom() {
    const n = customName.trim();
    if (!n) return;
    const id = slugify(n);
    if (!id) return;
    if (DEFAULT_CATALOG.some((c) => c.id === id) || custom.some((c) => c.id === id)) {
      setError(`Ya existe una comisión con id "${id}"`);
      return;
    }
    setCustom((c) => [
      ...c,
      { id, name: n, roles: customRoles.trim() || "—", schedule: customSchedule.trim() || "—" },
    ]);
    setCustomName("");
    setCustomRoles("");
    setCustomSchedule("");
    setError(null);
  }

  function removeCustom(id: string) {
    setCustom((c) => c.filter((x) => x.id !== id));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) return setError("Nombre requerido");
    if (!dateISO) return setError("Fecha requerida");
    const commissions: Commission[] = [
      ...DEFAULT_CATALOG
        .filter((c) => selected.has(c.id))
        .map((c) => ({ id: c.id, name: c.name, roles: c.defaultRoles, schedule: c.defaultSchedule })),
      ...custom,
    ];
    if (commissions.length === 0) return setError("Elige al menos una comisión");
    setError(null);
    setSaving(true);
    try {
      const slug = await createEvent(
        {
          name: name.trim(),
          dateISO,
          tagline: tagline.trim(),
          description: description.trim(),
          commissions,
          status,
          cancelCutoffHours: cancelHours,
        },
        user.uid,
      );
      nav(`/admin/eventos/${slug}`);
    } catch (err: any) {
      setError(err.message || "Error al crear");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl sm:text-2xl font-semibold">Nuevo evento</h1>

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="DevFest Cochabamba 2027"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
            {name && <p className="text-xs text-gray-500 mt-1">URL: /eventos/{slugify(name)}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tagline (opcional)</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Conecta · Crea · Construye · Comparte"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Margen para cancelar sin penalización (horas)</label>
            <input
              type="number"
              value={cancelHours}
              onChange={(e) => setCancelHours(parseInt(e.target.value) || 48)}
              min={1}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado inicial</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "open")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="draft">Borrador (no visible)</option>
              <option value="open">Postulaciones abiertas</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Comisiones del catálogo</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEFAULT_CATALOG.map((c) => (
              <label key={c.id} className="flex items-start gap-2 border border-gray-200 rounded-lg p-2 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={() => toggle(c.id)}
                  className="mt-0.5"
                />
                <span className="text-sm">{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Comisión custom (opcional)</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Nombre"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Rol"
              value={customRoles}
              onChange={(e) => setCustomRoles(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Horario"
              value={customSchedule}
              onChange={(e) => setCustomSchedule(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={addCustom}
            className="mt-2 px-3 py-1 border border-gray-300 rounded text-sm"
          >
            + Agregar custom
          </button>
          {custom.length > 0 && (
            <div className="mt-2 space-y-1">
              {custom.map((c) => (
                <div key={c.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm">
                  <span>{c.name}</span>
                  <button type="button" onClick={() => removeCustom(c.id)} className="text-red-700 text-xs">eliminar</button>
                </div>
              ))}
            </div>
          )}
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
          {saving ? "Creando…" : "Crear evento"}
        </button>
      </form>
    </div>
  );
}
