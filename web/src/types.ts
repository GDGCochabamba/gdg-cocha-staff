import type { Timestamp } from "firebase/firestore";

export type ApplicationStatus = "pending" | "approved" | "rejected" | "cancelled";
export type Tier = "none" | "T1" | "T2" | "T3";
export type EventStatus = "draft" | "open" | "closed" | "past";
export type ApplicationRole = "volunteer" | "leader";
export type Availability = "full" | "partial" | "none";

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  isGlobalAdmin: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Commission {
  id: string;
  name: string;
  roles: string;
  schedule: string;
  limit: number;
}

export interface EventLocation {
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface EventDoc {
  id: string;
  slug: string;
  name: string;
  dateISO: string;
  tagline?: string;
  description?: string;
  status: EventStatus;
  commissions: Commission[];
  location?: EventLocation;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt?: Timestamp;
  cancelCutoffHours?: number;
}

export interface ApplicationDoc {
  uid: string;
  eventId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  contactEmail?: string;
  commissionId: string;
  secondaryInterests?: string[];
  hasPriorExperience?: boolean;
  availability?: Availability;
  skills?: string;
  motivation?: string;
  role: ApplicationRole;
  status: ApplicationStatus;
  tier: Tier;
  initiative?: boolean;
  acceptedClauseAt: Timestamp;
  appliedAt: Timestamp;
  approvedAt?: Timestamp;
  cancelledAt?: Timestamp;
  rejectedAt?: Timestamp;
  notes?: string;
}

export interface ShiftDoc {
  id?: string;
  eventId: string;
  volunteerId: string;
  volunteerName: string;
  commissionId: string;
  leaderId: string;
  leaderName: string;
  checkInAt: Timestamp;
  checkOutAt?: Timestamp;
}

export interface CatalogEntry {
  id: string;
  name: string;
  defaultRoles: string;
  defaultSchedule: string;
}
