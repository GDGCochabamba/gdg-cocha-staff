import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import type { ApplicationDoc } from "../types";

export function applicationRef(eventId: string, uid: string) {
  return doc(db, "events", eventId, "applications", uid);
}

export async function getApplication(eventId: string, uid: string): Promise<ApplicationDoc | null> {
  const snap = await getDoc(applicationRef(eventId, uid));
  return snap.exists() ? (snap.data() as ApplicationDoc) : null;
}

export interface CreateApplicationInput {
  eventId: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone: string;
  contactEmail?: string;
  commissionId: string;
  secondaryInterests?: string[];
  hasPriorExperience: boolean;
  availability: "full" | "partial" | "none";
  skills?: string;
  motivation?: string;
}

export async function createApplication(input: CreateApplicationInput): Promise<void> {
  await setDoc(applicationRef(input.eventId, input.uid), {
    uid: input.uid,
    eventId: input.eventId,
    email: input.email,
    displayName: input.displayName,
    photoURL: input.photoURL ?? "",
    phone: input.phone,
    contactEmail: input.contactEmail ?? "",
    commissionId: input.commissionId,
    secondaryInterests: input.secondaryInterests ?? [],
    hasPriorExperience: input.hasPriorExperience,
    availability: input.availability,
    skills: input.skills ?? "",
    motivation: input.motivation ?? "",
    role: "volunteer",
    status: "pending",
    tier: "none",
    acceptedClauseAt: serverTimestamp(),
    appliedAt: serverTimestamp(),
  });
}

export async function approveApplication(eventId: string, uid: string): Promise<void> {
  await updateDoc(applicationRef(eventId, uid), {
    status: "approved",
    approvedAt: serverTimestamp(),
  });
}

export async function rejectApplication(eventId: string, uid: string): Promise<void> {
  await updateDoc(applicationRef(eventId, uid), {
    status: "rejected",
    rejectedAt: serverTimestamp(),
  });
}

export async function cancelApplication(eventId: string, uid: string): Promise<void> {
  await updateDoc(applicationRef(eventId, uid), {
    status: "cancelled",
    cancelledAt: serverTimestamp(),
  });
}

export async function promoteToLeader(eventId: string, uid: string): Promise<void> {
  await updateDoc(applicationRef(eventId, uid), { role: "leader" });
}

export async function demoteFromLeader(eventId: string, uid: string): Promise<void> {
  await updateDoc(applicationRef(eventId, uid), { role: "volunteer" });
}

export async function toggleInitiative(eventId: string, uid: string, current?: boolean): Promise<void> {
  await updateDoc(applicationRef(eventId, uid), { initiative: !current });
}

export async function setTier(eventId: string, uid: string, tier: ApplicationDoc["tier"]): Promise<void> {
  await updateDoc(applicationRef(eventId, uid), { tier });
}

export function subscribeApplications(
  eventId: string,
  cb: (apps: ApplicationDoc[]) => void,
): () => void {
  const q = collection(db, "events", eventId, "applications");
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data() as ApplicationDoc)));
}

export async function getUserApplications(uid: string): Promise<ApplicationDoc[]> {
  const q = query(collectionGroup(db, "applications"), where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ApplicationDoc);
}
