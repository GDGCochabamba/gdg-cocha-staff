import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import type { ShiftDoc } from "../types";

export function shiftsCollection(eventId: string) {
  return collection(db, "events", eventId, "shifts");
}

export async function checkIn(eventId: string, input: {
  volunteerId: string;
  volunteerName: string;
  commissionId: string;
  leaderId: string;
  leaderName: string;
}): Promise<void> {
  await addDoc(shiftsCollection(eventId), {
    eventId,
    volunteerId: input.volunteerId,
    volunteerName: input.volunteerName,
    commissionId: input.commissionId,
    leaderId: input.leaderId,
    leaderName: input.leaderName,
    checkInAt: serverTimestamp(),
  });
}

export async function checkOut(eventId: string, shiftId: string): Promise<void> {
  await updateDoc(doc(db, "events", eventId, "shifts", shiftId), {
    checkOutAt: serverTimestamp(),
  });
}

export function subscribeShifts(
  eventId: string,
  commissionId: string | null,
  cb: (shifts: ShiftDoc[]) => void,
): () => void {
  const base = shiftsCollection(eventId);
  const q = commissionId
    ? query(base, where("commissionId", "==", commissionId), orderBy("checkInAt", "desc"))
    : query(base, orderBy("checkInAt", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as ShiftDoc) }))),
  );
}
