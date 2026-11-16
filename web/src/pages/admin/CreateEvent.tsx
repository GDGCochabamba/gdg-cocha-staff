import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import { DEFAULT_CATALOG } from "../../config/catalog";
import { createEvent } from "../../lib/events";
import type { Commission } from "../../types";
import { slugify } from "../../lib/slug";
import EventForm, { type EventFormValues } from "./EventForm";

export default function CreateEvent() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initial: EventFormValues = {
    name: "",
    dateISO: "",
    tagline: "",
    description: "",
    locationName: "",
    locationAddress: "",
    lat: undefined,
    lng: undefined,
    selectedCatalog: new Set<string>(),
    commissionLimits: {},
    custom: [] as Commission[],
    customQuestions: [],
    cancelHours: 48,
    status: "draft",
  };

  async function save(v: EventFormValues) {
    if (!user) return;
    if (!v.name.trim()) return setError("Nombre requerido");
    if (!v.dateISO) return setError("Fecha requerida");
    const commissions: Commission[] = [
      ...DEFAULT_CATALOG
        .filter((c) => v.selectedCatalog.has(c.id))
        .map((c) => ({
          id: c.id,
          name: c.name,
          roles: c.defaultRoles,
          schedule: c.defaultSchedule,
          limit: v.commissionLimits[c.id] ?? 5,
        })),
      ...v.custom,
    ];
    if (commissions.length === 0) return setError("Elige al menos una comisión");
    setError(null);
    setSaving(true);
    try {
      const slug = await createEvent(
        {
          name: v.name.trim(),
          dateISO: v.dateISO,
          tagline: v.tagline.trim(),
          description: v.description.trim(),
          commissions,
          customQuestions: v.customQuestions,
          location: {
            name: v.locationName.trim(),
            address: v.locationAddress.trim(),
            lat: v.lat,
            lng: v.lng,
          },
          status: v.status,
          cancelCutoffHours: v.cancelHours,
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
      <p className="text-sm text-gray-500">
        Preview del slug: {slugify("evento ejemplo")}
      </p>
      <EventForm
        initial={initial}
        onSubmit={save}
        submitting={saving}
        error={error}
        submitLabel="Crear evento"
      />
    </div>
  );
}
