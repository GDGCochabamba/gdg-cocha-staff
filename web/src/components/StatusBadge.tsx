import type { Status } from "../types";

const map: Record<Status, { label: string; cls: string }> = {
  pending: { label: "Pendiente", cls: "bg-gray-100 text-gray-700" },
  approved: { label: "Aprobado", cls: "bg-blue-100 text-blue-800" },
  rejected: { label: "Rechazado", cls: "bg-red-100 text-red-800" },
  cancelled: { label: "Cancelado", cls: "bg-orange-100 text-orange-800" },
};

export default function StatusBadge({ status }: { status: Status }) {
  const m = map[status] ?? map.pending;
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${m.cls}`}>{m.label}</span>;
}
