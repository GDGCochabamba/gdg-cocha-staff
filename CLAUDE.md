# CLAUDE.md — GDG Cocha Staff

## What this is

Multi-event staff management platform for **GDG Cochabamba community**. Admin creates events (DevFest, I/O Extended, WTM Fest, etc.), picks commissions per event, approves postulations, promotes leaders. Volunteers postulate to any open event with Google. Reputation (T1/T2/T3) accrues across events.

Original source spec for the first event (DevFest 2026 · 2026-12-05) lives in Google Doc `12zjDc8m0cS5BHXRO7i4W15HV6Ykl2jccCynGZcmnpsg`.

Working method: Epic Flow kit v0.3.1. The `.workflow/` folder keeps a versioned copy; do not modify to change behavior — update the kit in `/Users/angel/Ventures/epic-flow/` and re-import.

## Stack

- **Frontend:** Vite + React 19 + TypeScript + Tailwind v3, in `web/`. Mobile-first, responsive.
- **Backend:** Firebase (Firestore + Auth Google-only + Hosting). No Cloud Functions — tier recomputation is a button in the admin panel.
- **Repo:** https://github.com/GDGCochabamba/gdg-cocha-staff (public, MIT).
- **Live:** https://devfest-staff-cocha.web.app (Firebase project ID is legacy; UI branding is "GDG Cocha Staff").
- **Firebase project:** `devfest-staff-cocha` (region `southamerica-east1`), owned by `flores1102angel266@gmail.com`. Project ID cannot be renamed in Firebase; cosmetic debt deferred until custom domain is set.

## Firestore model

- `users/{uid}` — identity only. `uid`, `email`, `displayName`, `photoURL`, `phone`, `isGlobalAdmin`, `createdAt`.
- `events/{eventId}` — event. `slug` (used as doc id + url segment), `name`, `dateISO`, `tagline`, `description`, `status` (draft/open/closed/past), `commissions: Commission[]`, `cancelCutoffHours`.
- `events/{eventId}/applications/{uid}` — per-event postulation. `commissionId`, `role` (volunteer/leader), `status` (pending/approved/rejected/cancelled), `tier`, `initiative`, timestamps.
- `events/{eventId}/shifts/{sid}` — per-event check-in/out records. `volunteerId`, `leaderId`, `commissionId`, `checkInAt`, `checkOutAt`. Shift counts for reputation only if both timestamps exist.
- `meta/{doc}` — public read, admin write. Reserved.

Roles are **global** on the user doc (`isGlobalAdmin`) and **per-event** on the application doc (`role: volunteer | leader`). A user can be leader of event A, volunteer of event B.

## Routes

Public: `/`, `/eventos/:slug`
User: `/eventos/:slug/postular`, `/mis-postulaciones`, `/lider/:slug`
Admin: `/admin`, `/admin/eventos/nuevo`, `/admin/eventos/:slug`

## Commissions catalog

`web/src/config/catalog.ts` holds the default 12-entry catalog. When creating an event, admin ticks which catalog entries to include and can add ad-hoc commissions. Changes to the catalog don't affect existing events — each event stores its own frozen commissions array.

## Auth bootstrap

`web/src/config/admins.ts` and `firestore.rules` both hardcode `flores1102angel266@gmail.com` as the bootstrap global admin. When this email signs in for the first time, `AuthProvider` sets `isGlobalAdmin: true` on their user doc. Other admins are promoted from the admin panel (writes `isGlobalAdmin: true` on another user's doc).

Normal users: sign in → see events list → postulate → admin approves → maybe gets promoted to leader of that specific event.

## Account traps on this machine

- `firebase` and `gcloud` CLIs default to `angel.flores@comocom.com`. **Always switch** before any command:
  ```bash
  firebase login:use flores1102angel266@gmail.com
  gcloud config set account flores1102angel266@gmail.com
  ```
- `gh` is fine, logged in as `Angel1104` personal.

## Dev loop

```bash
cd web && npm run dev          # localhost:5173
npm run build                  # verify tsc + vite build
```

Deploy from project root:

```bash
firebase deploy --only hosting
firebase deploy --only firestore
firebase deploy
```

## Known gaps

- No Cloud Function for tier automation. Tier recompute is a client-side button. Acceptable for ~30-person events.
- No CI. Manual `firebase deploy`. Acceptable while single-maintainer.
- No email notifications on status change. Users check the site.
- Bundle ~870 KB (Firebase SDK). Dynamic import would help first paint but not critical.
- No per-event edit page (just create + status change via dropdown in ManageEvent). Edit full event is future work.
- No commissions catalog editor UI (edit the file + redeploy for now). Future work.
- No cross-event user stats page for admin (planned Phase 4).
- Firestore project ID is `devfest-staff-cocha` not `gdg-cocha-staff` — cosmetic. New project would require manual Firebase console work to re-enable Google provider; deferred.

## Multi-event pivot (done 2026-11-16)

Original build was single-event (DevFest hardcoded). Rewrote to multi-event:
- Dropped collections: old `users/*` with embedded `status/commissionId`, flat `shifts/*`.
- New collections documented above.
- Old pages deleted: `Admin.tsx`, `Leader.tsx`, `MyStatus.tsx`, `config/event.ts`, `config/commissions.ts`.
- Any residual single-event user docs from pre-pivot test runs in Firestore are not migrated — admin re-logs in and new auth bootstrap merges `isGlobalAdmin: true` into whatever's there.
