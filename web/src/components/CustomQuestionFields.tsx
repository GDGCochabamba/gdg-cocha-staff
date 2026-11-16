import type { CustomAnswerValue, CustomQuestion } from "../types";

interface Props {
  questions: CustomQuestion[];
  answers: Record<string, CustomAnswerValue>;
  onChange: (answers: Record<string, CustomAnswerValue>) => void;
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2";

export default function CustomQuestionFields({ questions, answers, onChange }: Props) {
  function set(id: string, v: CustomAnswerValue) {
    onChange({ ...answers, [id]: v });
  }

  function toggleCheckbox(id: string, option: string) {
    const cur = Array.isArray(answers[id]) ? (answers[id] as string[]) : [];
    const next = cur.includes(option) ? cur.filter((x) => x !== option) : [...cur, option];
    set(id, next);
  }

  if (!questions || questions.length === 0) return null;

  return (
    <div className="space-y-5">
      {questions.map((q) => {
        const val = answers[q.id];
        return (
          <div key={q.id}>
            <label className="block text-sm font-medium mb-1">
              {q.label} {q.required && <span className="text-red-500">*</span>}
            </label>

            {q.type === "short" && (
              <input
                type="text"
                value={(val as string) ?? ""}
                onChange={(e) => set(q.id, e.target.value)}
                className={inputCls}
                maxLength={200}
                required={q.required}
              />
            )}

            {q.type === "paragraph" && (
              <textarea
                value={(val as string) ?? ""}
                onChange={(e) => set(q.id, e.target.value)}
                rows={3}
                maxLength={1000}
                className={inputCls}
                required={q.required}
              />
            )}

            {q.type === "radio" && (
              <div className="flex gap-4 flex-wrap">
                {(q.options ?? []).filter((o) => o.trim()).map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={q.id}
                      checked={val === opt}
                      onChange={() => set(q.id, opt)}
                      required={q.required}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === "checkboxes" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {(q.options ?? []).filter((o) => o.trim()).map((opt) => {
                  const checked = Array.isArray(val) && val.includes(opt);
                  return (
                    <label key={opt} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCheckbox(q.id, opt)}
                        className="mt-0.5"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {q.type === "select" && (
              <select
                value={(val as string) ?? ""}
                onChange={(e) => set(q.id, e.target.value)}
                className={inputCls}
                required={q.required}
              >
                <option value="">— Elige —</option>
                {(q.options ?? []).filter((o) => o.trim()).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {q.help && <p className="text-xs text-gray-500 mt-1">{q.help}</p>}
          </div>
        );
      })}
    </div>
  );
}
