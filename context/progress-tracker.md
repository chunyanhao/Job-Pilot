# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** 05 Profile Page — Full UI
**Next:** 06 Profile Save Logic

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [ ] 06 Profile Save Logic
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- 2026-06-15 — Homepage built as static server-rendered UI first, matching the build-plan sequence before auth/data wiring.
- 2026-06-15 — Reused public assets for design fidelity: `/logo.png`, `/images/dashboard-demo.png`, `/images/jobs-lists.png`, `/images/agnet-log.png`, and `/images/user-icon.png`.
- 2026-06-15 — Added token-backed global utilities `hero-wash`, `section-grid`, `diagonal-band`, `shadow-card`, and `shadow-preview` so homepage components avoid hardcoded colors.
- 2026-06-16 — Auth implemented with the current InsForge MCP guidance using `@insforge/sdk` plus `@insforge/sdk/ssr`; older local docs still mention `@insforge/ssr`.
- 2026-06-16 — Next.js 16 route protection uses `proxy.ts` with InsForge `updateSession()` instead of the older `middleware.ts` convention.
- 2026-06-16 — OAuth callback exchanges `insforge_code` with the browser-held PKCE verifier, then persists app-domain SSR cookies through `/api/auth/session`.
- 2026-06-16 — Authenticated app navbar includes a client-only Logout button that clears `/api/auth/session`, resets PostHog, and returns the user to `/login`.
- 2026-06-16 — PostHog initialized with a small client provider inside the server root layout. Browser events use `posthog-js`; server-side future events use `posthog-node` with `flushAt: 1`, `flushInterval: 0`, and `shutdown()` in the helper.
- 2026-06-16 — Current app analytics track manual `$pageview` events plus safe OAuth lifecycle events: `auth_sign_in_started`, `auth_sign_in_completed`, and `auth_sign_in_failed`.
- 2026-06-16 — PostHog action debugging found that homepage/app links were plain server `Link`s, so clicks relied on autocapture. Added explicit `navigation_clicked` and `cta_clicked` tracking via `TrackedLink`, plus `allowedDevOrigins` for 127.0.0.1 local testing.
- 2026-06-16 — Database schema applied through InsForge MCP as a strict foundation. The live backend now has `profiles`, `agent_runs`, `jobs`, and `agent_logs` with ownership columns, constraints, indexes, foreign keys, triggers, and RLS policies using `auth.uid()`.
- 2026-06-16 — Added `context/insforge-schema.sql` as the repo-local schema artifact for future comparison and reapplication.
- 2026-06-16 — Created the private InsForge `resumes` storage bucket for authenticated resume PDF storage.
- 2026-06-16 — Profile Page Full UI built from `context/designs/profile.png` as mock-data UI only. Save logic, resume upload persistence, extraction, and generation remain scoped to Features 06-08.
- 2026-06-16 — Closed the prior open questions for Feature 05: auth hardening is deferred until before production reliance on auth/session data, logout-specific `auth_signed_out` is not added because it is not in the approved event list, and returning-user identification remains part of a future auth/session polish pass rather than Profile UI.

---

## Notes

- 2026-06-15 — `npm run build` and `npm run lint` both pass after homepage implementation.
- 2026-06-15 — Local production server responds with `200 OK` at `http://127.0.0.1:3001`. In-app browser automation was not exposed in this session, so visual verification should be done manually in the browser.
- 2026-06-15 — `npm run dev` found a stale Next dev lock for port 3000; production server was used for local response verification on port 3001.
- 2026-06-16 — Auth verification: `npm run lint` passes; `npm run build` passes.
- 2026-06-16 — Dev smoke test: `/login` returns `200 OK`; unauthenticated `/dashboard` redirects to `/login?next=%2Fdashboard`.
- 2026-06-16 — In-app browser automation was not exposed after tool discovery; visual auth verification remains manual.
- 2026-06-16 — `npm install @insforge/sdk@latest` completed; npm reported 6 audit issues already present after install, not auto-fixed to avoid unrelated dependency churn.
- 2026-06-16 — Security audit follow-up: resolved all 6 npm audit findings with targeted overrides for `ws@8.21.0` and `postcss@8.5.15`; `npm audit`, `npm run lint`, and `npm run build` pass.
- 2026-06-16 — Auth recover pass: fixed Google sign-in startup by normalizing the existing InsForge env names. `.env.local` uses `INSFORGE_PROJECT_URL` for the backend URL and `NEXT_PUBLIC_INSFORGE_PROJECT_KEY` for the public anon key, while `NEXT_PUBLIC_INSFORGE_PROJECT_URL` is not a URL. Added `/api/auth/config` so browser auth receives the normalized config.
- 2026-06-16 — PostHog verification: `npm run lint` and `npm run build` pass after adding `posthog-js`, `posthog-node`, the browser analytics provider, and server capture helper.
- 2026-06-16 — Database verification: InsForge MCP `get_backend_metadata` shows all four tables with 0 records and the private `resumes` bucket. `get_table_schema` confirms RLS is enabled on all four tables and ownership policies are present.
- 2026-06-16 — Profile UI verification: `npm run lint` and `npm run build` pass. Local dev server serves `/login` with `200 OK`; unauthenticated `/profile` still redirects to `/login?next=%2Fprofile`.
