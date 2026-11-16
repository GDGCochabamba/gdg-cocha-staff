import type { ShiftDoc, Tier, UserDoc } from "../types";
import { EVENT_DATE, CANCEL_CUTOFF_MS } from "../config/event";

export function computeTier(user: UserDoc, shifts: ShiftDoc[]): Tier {
  if (user.role === "admin") return user.tier;

  if (user.status === "cancelled") {
    const cancelAt = user.cancelledAt?.toDate?.() ?? new Date(0);
    const hoursBefore = EVENT_DATE.getTime() - cancelAt.getTime();
    return hoursBefore >= CANCEL_CUTOFF_MS ? "T2" : "T3";
  }

  if (user.status !== "approved") return user.tier;

  const eventStart = EVENT_DATE.getTime();
  const past = Date.now() > eventStart + 4 * 60 * 60 * 1000;
  if (!past) return user.tier;

  const completed = shifts.some(
    (s) => s.volunteerId === user.uid && s.checkInAt && s.checkOutAt,
  );

  if (!completed) return "T3";
  if (user.initiative) return "T1";
  return "T1";
}
