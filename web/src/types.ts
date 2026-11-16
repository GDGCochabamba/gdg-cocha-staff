import type { Timestamp } from "firebase/firestore";

export type Role = "volunteer" | "leader" | "admin";
export type Status = "pending" | "approved" | "rejected" | "cancelled";
export type Tier = "none" | "T1" | "T2" | "T3";

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  commissionId: string;
  role: Role;
  status: Status;
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
  volunteerId: string;
  volunteerName: string;
  commissionId: string;
  leaderId: string;
  leaderName: string;
  checkInAt: Timestamp;
  checkOutAt?: Timestamp;
}

export interface Commission {
  id: string;
  name: string;
  roles: string;
  schedule: string;
}
