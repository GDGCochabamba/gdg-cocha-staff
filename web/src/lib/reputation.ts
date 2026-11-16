import type { ApplicationDoc, EventDoc, ShiftDoc, Tier } from "../types";

export function computeTierForApplication(
  app: ApplicationDoc,
  event: EventDoc,
  shifts: ShiftDoc[],
): Tier {
  const cutoffHours = event.cancelCutoffHours ?? 48;
  const cutoffMs = cutoffHours * 3600000;
  const eventStart = new Date(event.dateISO + "T00:00:00-04:00").getTime();

  if (app.status === "cancelled") {
    const cancelAt = app.cancelledAt?.toDate?.().getTime() ?? 0;
    const hoursBefore = eventStart - cancelAt;
    return hoursBefore >= cutoffMs ? "T2" : "T3";
  }

  if (app.status !== "approved") return app.tier;

  const past = Date.now() > eventStart + 4 * 3600000;
  if (!past) return app.tier;

  const completed = shifts.some(
    (s) => s.volunteerId === app.uid && s.checkInAt && s.checkOutAt,
  );
  if (!completed) return "T3";
  return "T1";
}

export interface UserReputationSummary {
  totalApplications: number;
  approved: number;
  completed: number;
  cancelled: number;
  ghosted: number;
  highestTier: Tier;
}

export function summarizeUser(apps: ApplicationDoc[]): UserReputationSummary {
  let completed = 0;
  let ghosted = 0;
  const approved = apps.filter((a) => a.status === "approved").length;
  const cancelled = apps.filter((a) => a.status === "cancelled").length;
  for (const a of apps) {
    if (a.tier === "T1") completed++;
    if (a.tier === "T3") ghosted++;
  }
  const tierOrder: Tier[] = ["none", "T3", "T2", "T1"];
  let highestTier: Tier = "none";
  for (const a of apps) {
    if (tierOrder.indexOf(a.tier) > tierOrder.indexOf(highestTier)) {
      highestTier = a.tier;
    }
  }
  return {
    totalApplications: apps.length,
    approved,
    completed,
    cancelled,
    ghosted,
    highestTier,
  };
}
