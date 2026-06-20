# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 4 — Job Details Page
**Last completed:** 13 Company Research Agent
**Next:** 14 Dashboard Page — Full UI

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [x] 09 Find Jobs Page — Full UI
- [x] 10 Adzuna Job Discovery
- [x] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [x] 12 Job Details Page — Full UI
- [x] 13 Company Research Agent

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
- 2026-06-16 — Profile Save Logic implemented with `actions/profile.ts`, server-side `/profile` prefill, authenticated InsForge profile insert/update, PDF resume upload to the `resumes` bucket, completion calculation, and first-completion `profile_completed` capture.
- 2026-06-17 — AI Profile Extraction from Resume implemented with a protected `/api/resume/extract` route, server-side PDF text extraction via `pdf-parse`, GPT-4o structured JSON extraction via the OpenAI SDK, profile-output sanitization, and client-side form population before manual save.
- 2026-06-17 — Resume PDF Generation from Profile restored to scope as a download-only export from saved profile fields. Generated PDFs do not replace uploaded resumes and are not saved to InsForge Storage or the database.
- 2026-06-17 — Resume PDF Generation from Profile implemented with authenticated `/api/resume/generate`, server-side PDFKit rendering from the saved `profiles` row, and a Profile page download action. Generated PDFs stream directly to the browser and do not write to InsForge Storage or database.
- 2026-06-19 — Find Jobs Page Full UI built from `context/designs/find-jobs.png` as mock-data UI only. The existing authenticated navbar was intentionally left unchanged; the page body now has local mock search controls, success banner, filter toolbar, jobs table, source badge coverage, Adzuna credit, and pagination.
- 2026-06-19 — Adzuna Job Discovery implemented with protected `POST /api/agent/find`, `lib/adzuna.ts` API client, `agent/matcher.ts` GPT-4o scoring, `agent/adzuna.ts` run orchestration, InsForge `agent_runs`/`jobs`/`agent_logs` persistence, approved PostHog events, and Find Jobs button loading/success/error states. Search saves all successfully scored jobs and counts strong matches separately.
- 2026-06-19 — Filter + Sort + Pagination implemented as a DB-backed Find Jobs list. `/find-jobs` now reads URL search params, loads the authenticated user's saved `jobs` rows from InsForge, supports text search across company/title, match-score filters, score/newest/oldest sorting, exact-count pagination at 20 jobs per page, and refreshes to newest/all/page 1 after successful Adzuna discovery so newly saved jobs appear in the list.
- 2026-06-19 — Find Jobs search-result refinement: after a completed Adzuna run, `/find-jobs` scopes the visible table to the completed `run` URL param, keeps the in-card success banner mounted, and shows a visible latest-search notice with a `View all saved jobs` action. Profile-derived default search location now ignores remote-only values because Adzuna expects geographic `where` terms.
- 2026-06-19 — Job Details Page Full UI implemented from `context/designs/job-details.png` with authenticated real `jobs` row loading by `id` and `user_id`, a centered 872px details body, header/stat/reasoning/skills/description/research/apply sections, external apply links, and a Feature 13-ready company research empty state.
- 2026-06-19 — Company Research Agent implemented with protected `POST /api/agent/research`, `agent/research.ts` Browserbase/Stagehand/GPT-4o orchestration, `lib/browserbase.ts` and `lib/stagehand.ts` client wrappers, scoped `jobs.company_research` updates, `agent_logs` fallback logging, `company_researched` capture, and a Job Details research card that renders all 9 dossier fields. Browserbase/Stagehand credentials are optional for fallback synthesis, but OpenAI is required to create a dossier.

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
- 2026-06-16 — Profile Save verification: `npm run lint` and `npm run build` pass. Local route smoke test: `/login` returns `200 OK`; unauthenticated `/profile` still redirects to `/login?next=%2Fprofile`.
- 2026-06-17 — Resume upload fix: aligned Next Server Action body size with the 5MB UI limit by setting `serverActions.bodySizeLimit` to `6mb`, and added selected/saved resume feedback in the profile upload panel.
- 2026-06-17 — Profile extraction verification: `npm run lint` passes; `npm run build` passes and includes the dynamic `/api/resume/extract` route.
- 2026-06-17 — Resume access polish: saved resume feedback now opens `/api/resume/current` in a new tab instead of the raw private InsForge storage URL. The app route authenticates the user, downloads the current PDF from the private `resumes` bucket, and streams it inline.
- 2026-06-17 — Resume generation runtime fix: externalized `pdfkit` with `serverExternalPackages` so Next/Turbopack does not rewrite PDFKit's built-in font asset paths. `npm run lint` and `npm run build` pass.
- 2026-06-19 — Find Jobs UI verification: `npm run lint` and `npm run build` pass. Existing dev server on `http://localhost:3000` returns the expected protected-route redirect for `/find-jobs` to `/login?next=%2Ffind-jobs`. In-app browser automation was not exposed in this session, so visual verification should be done manually in the browser.
- 2026-06-19 — Adzuna Job Discovery verification: `npm run lint` and `npm run build` pass, and the production build includes dynamic `/api/agent/find`. Shell `curl` could not connect to the local dev server even though Next reported an existing server/ready state, so authenticated end-to-end browser/API verification remains manual.
- 2026-06-19 — Filter + Sort + Pagination verification: `npm run lint` and `npm run build` pass. Production build marks `/find-jobs` as dynamic and includes the existing protected API routes. Authenticated browser verification is still recommended to confirm the live InsForge rows render after a real user search.
- 2026-06-19 — Find Jobs search-result refinement verification: `npm run lint` and `npm run build` pass. Authenticated browser verification is still recommended to confirm the latest-run banner and cleared all-saved view against live InsForge data.
- 2026-06-19 — Job Details Page verification: `npm run lint` and `npm run build` pass. Production build marks `/find-jobs/[id]` as dynamic; authenticated browser verification is recommended with a live saved job row to confirm exact populated content.
- 2026-06-19 — Company Research Agent verification: `npm run lint` passes; `npm run build` passes and includes dynamic `/api/agent/research`. Installed `@browserbasehq/sdk` and `@browserbasehq/stagehand`; npm reported 18 audit findings in the expanded dependency tree, not auto-fixed to avoid unrelated churn. Local curl smoke test could not connect because no dev server was reachable, so authenticated end-to-end Browserbase/OpenAI verification remains manual with a running local app and live credentials.
