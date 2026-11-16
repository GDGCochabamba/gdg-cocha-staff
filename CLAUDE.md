# CLAUDE.md — DevFest Cochabamba 2026 Staff

## What this is

Staff postulation + check-in/out + reputation system for **DevFest Cochabamba 2026**, event date **2026-12-05**. Owned by GDG Cochabamba community. Source spec lives in the Google Doc `12zjDc8m0cS5BHXRO7i4W15HV6Ykl2jccCynGZcmnpsg`.

Working method: Epic Flow kit v0.3.1. The `.workflow/` folder keeps a versioned copy of the method; do not modify it to change behavior, update the kit in `/Users/angel/Ventures/epic-flow/` and re-import.

## Stack

- **Frontend:** Vite + React 19 + TypeScript + Tailwind v3, in `web/`.
- **Backend:** Firebase (Firestore + Auth Google-only + Hosting). No Cloud Functions yet — tier recomputation is a client-side button in the admin panel.
- **Repo:** https://github.com/GDGCochabamba/devfest-staff (public, MIT).
- **Live:** https://devfest-staff-cocha.web.app
- **Firebase project:** `devfest-staff-cocha` (region `southamerica-east1`), owned by `flores1102angel266@gmail.com`.

## Firestore model

- `users/{uid}` — one doc per signed-in Google account. Fields: `role` (volunteer/leader/admin), `status` (pending/approved/rejected/cancelled), `tier` (none/T1/T2/T3), `commissionId`, `initiative` (admin-set flag for T1), timestamps. Rules in `firestore.rules`.
- `shifts/{autoId}` — one doc per check-in. `volunteerId`, `leaderId`, `commissionId`, `checkInAt`, `checkOutAt`. A shift counts for reputation only when BOTH timestamps exist.
- `meta/{doc}` — public read, admin write. Reserved for event config overrides.
- `audit/{entry}` — admin-only reads.

## Auth bootstrap

The admin email is hardcoded in `web/src/config/admins.ts` (`flores1102angel266@gmail.com`) AND in `firestore.rules` (the allowlist inside the `users/{uid}` create rule). Changing it needs edits in both places + a rules redeploy.

When an admin-email user signs in for the first time, `AuthProvider` auto-creates their user doc with `role=admin, status=approved` — no postulation needed.

Normal users: sign in with Google → fill form at `/postular` → doc written with `role=volunteer, status=pending` → admin approves → admin may promote to leader.

## Account traps on this machine

- `firebase` and `gcloud` CLIs default to `angel.flores@comocom.com`. **Always switch** before any command:
  ```bash
  firebase login:use flores1102angel266@gmail.com
  gcloud config set account flores1102angel266@gmail.com
  ```
- `gh` is fine, logged in as `Angel1104`.

## Dev loop

```bash
cd web
npm run dev          # localhost:5173
npm run build        # verify tsc + vite build
```

Deploy:

```bash
cd ..                            # project root
firebase deploy --only hosting   # from root, uses firebase.json
firebase deploy --only firestore # rules + indexes
firebase deploy                  # everything
```

## Things NOT done yet (known gaps)

- No Cloud Function for tier automation. Tier is computed client-side when admin clicks "Recalcular tiers". Reason: adds infra complexity for a one-time event. Revisit for 2027.
- No CI (no GitHub Actions deploy). Manual `firebase deploy` from Angel's machine. Acceptable for one event.
- No email notifications on status change. Users must open the site to see status.
- Bundle is 846 KB (Firebase SDK). Consider dynamic import of Firestore if first-paint matters.

## Open authorizations needed from Angel

- **Google Auth provider enabled** in Firebase Console (one-time click): https://console.firebase.google.com/project/devfest-staff-cocha/authentication/providers → Google → enable.
