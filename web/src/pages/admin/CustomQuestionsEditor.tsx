import { useState } from "react";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import type { CustomQuestion, QuestionType } from "../../types";
import { slugify } from "../../lib/slug";

interface Props {
  value: CustomQuestion[];
  onChange: (next: CustomQuestion[]) => void;
}

const typeLabels: Record<QuestionType, string> = {
  short: "Respuesta corta",
  paragraph: "Párrafo",
  radio: "Opción única (radio)",
  checkboxes: "Múltiple (checkboxes)",
  select: "Desplegable",
};

export default function CustomQuestionsEditor({ value, onChange }: Props) {
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<QuestionType>("short");
  const [newRequired, setNewRequired] = useState(false);

  function add() {
    const label = newLabel.trim();
    if (!label) return;
    const baseId = slugify(label) || `q-${Date.now()}`;
    let id = baseId;
    let n = 1;
    while (value.some((q) => q.id === id)) id = `${baseId}-${++n}`;
    const q: CustomQuestion = {
      id,
      label,
      type: newType,
      required: newRequired,
      options: newType === "radio" || newType === "checkboxes" || newType === "select" ? [""] : undefined,
    };
    onChange([...value, q]);
    setNewLabel("");
    setNewType("short");
    setNewRequired(false);
  }

  function update(id: string, patch: Partial<CustomQuestion>) {
    onChange(value.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function remove(id: string) {
    onChange(value.filter((q) => q.id !== id));
  }

  function move(id: string, dir: -1 | 1) {
    const idx = value.findIndex((q) => q.id === id);
    if (idx < 0) return;
    const next = [...value];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  function updateOption(qid: string, idx: number, text: string) {
    const q = value.find((x) => x.id === qid);
    if (!q || !q.options) return;
    const opts = [...q.options];
    opts[idx] = text;
    update(qid, { options: opts });
  }

  function addOption(qid: string) {
    const q = value.find((x) => x.id === qid);
    if (!q) return;
    update(qid, { options: [...(q.options ?? []), ""] });
  }

  function removeOption(qid: string, idx: number) {
    const q = value.find((x) => x.id === qid);
    if (!q || !q.options) return;
    const opts = q.options.filter((_, i) => i !== idx);
    update(qid, { options: opts.length > 0 ? opts : [""] });
  }

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <div className="text-xs text-gray-500">No hay preguntas personalizadas. Agrega una abajo.</div>
      )}

      {value.map((q, i) => (
        <div key={q.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">#{i + 1}</span>
            <input
              type="text"
              value={q.label}
              onChange={(e) => update(q.id, { label: e.target.value })}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <select
              value={q.type}
              onChange={(e) => {
                const type = e.target.value as QuestionType;
                const needsOptions = type === "radio" || type === "checkboxes" || type === "select";
                update(q.id, { type, options: needsOptions ? q.options ?? [""] : undefined });
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {Object.entries(typeLabels).map(([t, label]) => (
                <option key={t} value={t}>{label}</option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={q.required} onChange={(e) => update(q.id, { required: e.target.checked })} />
              <span>Obligatoria</span>
            </label>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(q.id, -1)} className="px-2 py-1 border border-gray-300 rounded" aria-label="Subir">
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => move(q.id, 1)} className="px-2 py-1 border border-gray-300 rounded" aria-label="Bajar">
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => remove(q.id)} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">eliminar</button>
            </div>
          </div>

          <input
            type="text"
            placeholder="Ayuda / nota (opcional)"
            value={q.help ?? ""}
            onChange={(e) => update(q.id, { help: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
          />

          {(q.type === "radio" || q.type === "checkboxes" || q.type === "select") && (
            <div className="pl-4 space-y-1">
              <div className="text-xs text-gray-500">Opciones:</div>
              {(q.options ?? []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(q.id, idx, e.target.value)}
                    placeholder={`Opción ${idx + 1}`}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <button type="button" onClick={() => removeOption(q.id, idx)} className="text-red-700" aria-label="Eliminar opción">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addOption(q.id)} className="text-xs text-gBlue">+ Agregar opción</button>
            </div>
          )}
        </div>
      ))}

      <div className="border border-dashed border-gray-300 rounded-lg p-3 space-y-2">
        <div className="text-sm font-medium">Agregar pregunta</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="¿Cuál es tu nivel de inglés?"
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as QuestionType)}
            className="border border-gray-300 rounded px-2 py-2 text-sm"
          >
            {Object.entries(typeLabels).map(([t, label]) => (
              <option key={t} value={t}>{label}</option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-xs whitespace-nowrap">
            <input type="checkbox" checked={newRequired} onChange={(e) => setNewRequired(e.target.checked)} />
            <span>Obligatoria</span>
          </label>
          <button type="button" onClick={add} className="px-3 py-2 bg-black text-white rounded text-sm">+ Agregar</button>
        </div>
      </div>
    </div>
  );
}
