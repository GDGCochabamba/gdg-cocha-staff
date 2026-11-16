import type { Tier } from "../types";

const map: Record<Tier, { label: string; cls: string }> = {
  none: { label: "Sin tier", cls: "bg-gray-100 text-gray-600" },
  T1: { label: "T1 · Core Staff", cls: "bg-green-100 text-green-800" },
  T2: { label: "T2 · Standby", cls: "bg-yellow-100 text-yellow-800" },
  T3: { label: "T3 · Blacklist", cls: "bg-red-100 text-red-800" },
};

export default function TierBadge({ tier }: { tier: Tier }) {
  const m = map[tier] ?? map.none;
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${m.cls}`}>{m.label}</span>;
}
