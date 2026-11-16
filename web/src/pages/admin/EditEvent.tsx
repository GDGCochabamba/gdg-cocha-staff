import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getEventBySlug, updateEvent } from "../../lib/events";
import { DEFAULT_CATALOG } from "../../config/catalog";
import type { Commission, EventDoc } from "../../types";
import EventForm, { type EventFormValues } from "./EventForm";

export default function EditEvent() {
  const { slug = "" } = useParams();
  const nav = useNavigate();
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [initial, setInitial] = useState<EventFormValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const ev = await getEventBySlug(slug);
      setEvent(ev);
      if (!ev) return;
      const catalogIds = new Set(DEFAULT_CATALOG.map((c) => c.id));
      const selected = new Set<string>();
      const limits: Record<string, number> = {};
      const custom: Commission[] = [];
      for (const c of ev.commissions) {
        if (catalogIds.has(c.id)) {
          selected.add(c.id);
          limits[c.id] = c.limit ?? 5;
        } else {
          custom.push(c);
        }
      }
      setInitial({
        name: ev.name,
        dateISO: ev.dateISO,
        tagline: ev.tagline ?? "",
        description: ev.description ?? "",
        locationName: ev.location?.name ?? "",
        locationAddress: ev.location?.address ?? "",
        lat: ev.location?.lat,
        lng: ev.location?.lng,
        selectedCatalog: selected,
        commissionLimits: limits,
        custom,
        cancelHours: ev.cancelCutoffHours ?? 48,
        status: ev.status,
      });
    })();
  }, [slug]);

  async function save(v: EventFormValues) {
    if (!event) return;
    const commissions: Commission[] = [
      ...DEFAULT_CATALOG
        .filter((c) => v.selectedCatalog.has(c.id))
        .map((c) => ({
          id: c.id,
          name: c.name,
          roles: event.commissions.find((x) => x.id === c.id)?.roles ?? c.defaultRoles,
          schedule: event.commissions.find((x) => x.id === c.id)?.schedule ?? c.defaultSchedule,
          limit: v.commissionLimits[c.id] ?? 5,
        })),
      ...v.custom,
    ];
    if (commissions.length === 0) {
      setError("Mantén al menos una comisión");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateEvent(event.slug, {
        name: v.name.trim(),
        dateISO: v.dateISO,
        tagline: v.tagline.trim(),
        description: v.description.trim(),
        commissions,
        location: {
          name: v.locationName.trim(),
          address: v.locationAddress.trim(),
          lat: v.lat,
          lng: v.lng,
        },
        status: v.status,
        cancelCutoffHours: v.cancelHours,
      });
      nav(`/admin/eventos/${event.slug}`);
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (!event || !initial) return <div className="text-gray-500">Cargando…</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link to={`/admin/eventos/${event.slug}`} className="text-sm text-gray-500 hover:text-black">← Volver al evento</Link>
        <h1 className="text-xl sm:text-2xl font-semibold mt-2">Editar evento</h1>
      </div>
      <EventForm
        initial={initial}
        onSubmit={save}
        submitting={saving}
        error={error}
        submitLabel="Guardar cambios"
        lockName
      />
    </div>
  );
}
