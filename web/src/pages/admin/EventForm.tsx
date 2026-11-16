import { useState } from "react";
import { DEFAULT_CATALOG } from "../../config/catalog";
import { slugify } from "../../lib/slug";
import MapPicker from "../../components/MapPicker";
import CustomQuestionsEditor from "./CustomQuestionsEditor";
import type { Commission, CustomQuestion, EventStatus } from "../../types";

export interface EventFormValues {
  name: string;
  dateISO: string;
  tagline: string;
  description: string;
  locationName: string;
  locationAddress: string;
  lat?: number;
  lng?: number;
  selectedCatalog: Set<string>;
  commissionLimits: Record<string, number>;
  custom: Commission[];
  customQuestions: CustomQuestion[];
  cancelHours: number;
  status: EventStatus;
}

interface Props {
  initial: EventFormValues;
  onSubmit: (v: EventFormValues) => void | Promise<void>;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  lockName?: boolean;
}

export default function EventForm({ initial, onSubmit, submitting, error, submitLabel, lockName }: Props) {
  const [v, setV] = useState<EventFormValues>(initial);
  const [customName, setCustomName] = useState("");
  const [customRoles, setCustomRoles] = useState("");
  const [customSchedule, setCustomSchedule] = useState("");
  const [customLimit, setCustomLimit] = useState(5);
  const [addErr, setAddErr] = useState<string | null>(null);

  function toggleCatalog(id: string) {
    setV((cur) => {
      const next = new Set(cur.selectedCatalog);
      const limits = { ...cur.commissionLimits };
      if (next.has(id)) {
        next.delete(id);
        delete limits[id];
      } else {
        next.add(id);
        if (limits[id] === undefined) limits[id] = 5;
      }
      return { ...cur, selectedCatalog: next, commissionLimits: limits };
    });
  }

  function setLimit(id: string, limit: number) {
    setV((cur) => ({ ...cur, commissionLimits: { ...cur.commissionLimits, [id]: limit } }));
  }

  function setCustomLimitFor(id: string, limit: number) {
    setV((cur) => ({
      ...cur,
      custom: cur.custom.map((c) => (c.id === id ? { ...c, limit } : c)),
    }));
  }

  function addCustom() {
    const n = customName.trim();
    if (!n) return;
    const id = slugify(n);
    if (!id) return;
    if (DEFAULT_CATALOG.some((c) => c.id === id) || v.custom.some((c) => c.id === id)) {
      setAddErr(`Ya existe una comisión con id "${id}"`);
      return;
    }
    setV((cur) => ({
      ...cur,
      custom: [
        ...cur.custom,
        {
          id,
          name: n,
          roles: customRoles.trim() || "—",
          schedule: customSchedule.trim() || "—",
          limit: customLimit,
        },
      ],
    }));
    setCustomName("");
    setCustomRoles("");
    setCustomSchedule("");
    setCustomLimit(5);
    setAddErr(null);
  }

  function removeCustom(id: string) {
    setV((cur) => ({ ...cur, custom: cur.custom.filter((x) => x.id !== id) }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(v);
  }

  return (
    <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={v.name}
            onChange={(e) => setV({ ...v, name: e.target.value })}
            placeholder="DevFest Cochabamba 2026"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
            disabled={lockName}
            required
          />
          {v.name && !lockName && <p className="text-xs text-gray-500 mt-1">URL: /eventos/{slugify(v.name)}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Fecha <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={v.dateISO}
            onChange={(e) => setV({ ...v, dateISO: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tagline</label>
        <input
          type="text"
          value={v.tagline}
          onChange={(e) => setV({ ...v, tagline: e.target.value })}
          placeholder="Conecta · Crea · Construye · Comparte"
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          value={v.description}
          onChange={(e) => setV({ ...v, description: e.target.value })}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium">Ubicación del evento</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={v.locationName}
            onChange={(e) => setV({ ...v, locationName: e.target.value })}
            placeholder="Nombre del lugar (ej: Universidad Católica)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="text"
            value={v.locationAddress}
            onChange={(e) => setV({ ...v, locationAddress: e.target.value })}
            placeholder="Dirección"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <MapPicker
          lat={v.lat}
          lng={v.lng}
          onChange={({ lat, lng }) => setV({ ...v, lat, lng })}
        />
        {v.lat !== undefined && v.lng !== undefined && (
          <p className="text-xs text-gray-500">
            Coordenadas: {v.lat.toFixed(5)}, {v.lng.toFixed(5)} ·{" "}
            <button type="button" onClick={() => setV({ ...v, lat: undefined, lng: undefined })} className="text-red-700 underline">
              borrar
            </button>
          </p>
        )}
        <p className="text-xs text-gray-500">Click en el mapa para marcar la ubicación.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cancelar sin penalización (horas antes)</label>
          <input
            type="number"
            value={v.cancelHours}
            onChange={(e) => setV({ ...v, cancelHours: parseInt(e.target.value) || 48 })}
            min={1}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select
            value={v.status}
            onChange={(e) => setV({ ...v, status: e.target.value as EventStatus })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="draft">Borrador (no visible)</option>
            <option value="open">Postulaciones abiertas</option>
            <option value="closed">Postulaciones cerradas</option>
            <option value="past">Finalizado</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Comisiones del catálogo</label>
        <p className="text-xs text-gray-500 mb-2">Marca las comisiones que tendrá este evento y define el cupo por cada una.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DEFAULT_CATALOG.map((c) => {
            const picked = v.selectedCatalog.has(c.id);
            return (
              <div key={c.id} className={`border rounded-lg p-2 ${picked ? "border-gBlue bg-blue-50/40" : "border-gray-200"}`}>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={picked}
                    onChange={() => toggleCatalog(c.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{c.name}</div>
                    {picked && (
                      <div className="mt-2 flex items-center gap-2">
                        <label className="text-xs text-gray-600">Cupos:</label>
                        <input
                          type="number"
                          min={1}
                          max={200}
                          value={v.commissionLimits[c.id] ?? 5}
                          onChange={(e) => setLimit(c.id, Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Comisión custom (opcional)</label>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="Nombre"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            type="text"
            placeholder="Rol"
            value={customRoles}
            onChange={(e) => setCustomRoles(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Cupos"
            min={1}
            value={customLimit}
            onChange={(e) => setCustomLimit(Math.max(1, parseInt(e.target.value) || 1))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <input
          type="text"
          placeholder="Horario"
          value={customSchedule}
          onChange={(e) => setCustomSchedule(e.target.value)}
          className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <button type="button" onClick={addCustom} className="mt-2 px-3 py-1 border border-gray-300 rounded text-sm">
          + Agregar custom
        </button>
        {addErr && <p className="text-xs text-red-700 mt-1">{addErr}</p>}
        {v.custom.length > 0 && (
          <div className="mt-2 space-y-1">
            {v.custom.map((c) => (
              <div key={c.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm">
                <span className="flex-1 truncate">{c.name}</span>
                <label className="text-xs text-gray-600">Cupos:</label>
                <input
                  type="number"
                  min={1}
                  value={c.limit}
                  onChange={(e) => setCustomLimitFor(c.id, Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 border border-gray-300 rounded px-2 py-1 text-xs"
                />
                <button type="button" onClick={() => removeCustom(c.id)} className="text-red-700 text-xs">eliminar</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className="block text-sm font-medium">Preguntas personalizadas para este evento</label>
        </div>
        <p className="text-xs text-gray-500 mb-2">
          Se muestran al postulante además de las preguntas estándar (nombre, teléfono, comisión, experiencia, disponibilidad, etc).
        </p>
        <CustomQuestionsEditor
          value={v.customQuestions}
          onChange={(customQuestions) => setV({ ...v, customQuestions })}
        />
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-gBlue text-white rounded-lg font-medium disabled:opacity-60"
      >
        {submitting ? "Guardando…" : submitLabel}
      </button>
    </form>
  );
}
