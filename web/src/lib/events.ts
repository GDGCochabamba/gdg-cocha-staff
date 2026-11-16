import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Commission, CustomQuestion, EventDoc, EventStatus } from "../types";
import { slugify } from "./slug";

const COLL = "events";

export async function listEvents(filter?: { status?: EventStatus | "all" }): Promise<EventDoc[]> {
  const col = collection(db, COLL);
  const q = filter?.status && filter.status !== "all"
    ? query(col, where("status", "==", filter.status))
    : col;
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as EventDoc)
    .sort((a, b) => (b.dateISO || "").localeCompare(a.dateISO || ""));
}

export async function getEventBySlug(slug: string): Promise<EventDoc | null> {
  const snap = await getDoc(doc(db, COLL, slug));
  return snap.exists() ? (snap.data() as EventDoc) : null;
}

export interface CreateEventInput {
  name: string;
  dateISO: string;
  startTime?: string;
  endTime?: string;
  tagline?: string;
  description?: string;
  commissions: Commission[];
  customQuestions?: CustomQuestion[];
  location?: {
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  whatsappGroupUrl?: string;
  status?: EventStatus;
  cancelCutoffHours?: number;
}

export async function createEvent(input: CreateEventInput, createdBy: string): Promise<string> {
  const slug = slugify(input.name);
  if (!slug) throw new Error("Name produces empty slug");

  const existing = await getEventBySlug(slug);
  if (existing) throw new Error(`Ya existe un evento con slug "${slug}"`);

  const data: Omit<EventDoc, "id" | "createdAt"> & { id: string } = {
    id: slug,
    slug,
    name: input.name.trim(),
    dateISO: input.dateISO,
    startTime: input.startTime ?? "",
    endTime: input.endTime ?? "",
    tagline: input.tagline?.trim() || "",
    description: input.description?.trim() || "",
    status: input.status ?? "draft",
    commissions: input.commissions,
    customQuestions: input.customQuestions ?? [],
    location: input.location,
    whatsappGroupUrl: input.whatsappGroupUrl?.trim() || "",
    cancelCutoffHours: input.cancelCutoffHours ?? 48,
    createdBy,
  };

  await setDoc(doc(db, COLL, slug), {
    ...data,
    createdAt: serverTimestamp(),
  });

  return slug;
}

export async function updateEvent(slug: string, patch: Partial<EventDoc>): Promise<void> {
  await updateDoc(doc(db, COLL, slug), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEvent(slug: string): Promise<void> {
  await deleteDoc(doc(db, COLL, slug));
}
