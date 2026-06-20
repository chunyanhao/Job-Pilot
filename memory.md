# Memory — Profile Features 6-8

Last updated: 2026-06-18

## What was built

Completed Phase 2 profile functionality through Feature 08.

Created:
- `actions/profile.ts` for authenticated profile save, profile upsert, resume upload, completion calculation, and first-completion `profile_completed` capture.
- `agent/profile-extractor.ts` for server-side PDF text extraction plus GPT-4o profile-field extraction.
- `app/api/resume/extract/route.ts` for protected resume extraction.
- `app/api/resume/current/route.ts` for opening the saved private resume through an authenticated app route instead of a raw InsForge storage URL.
- `app/api/resume/generate/route.ts` for authenticated generated-resume PDF download.
- `lib/profile.ts`, `types/profile.ts`, and `lib/resume-pdf.ts`.

Modified:
- `app/profile/page.tsx` now loads the authenticated user's saved profile and redirects unauthenticated users to login.
- `components/profile/ProfilePageContent.tsx` is now a live editable profile form with save, upload, extraction, current-resume link, completion state, and generated-resume download.
- `next.config.ts` now sets Server Action body size to `6mb` and externalizes `pdfkit`.
- `package.json`/`package-lock.json` now include `pdf-parse`, `openai`, `pdfkit`, and `@types/pdfkit`.
- `context/build-plan.md`, `context/progress-tracker.md`, `context/ui-registry.md`, and `context/library-docs.md` were updated for Features 06-08.

## Decisions made

- Profile starts empty except for the authenticated account email fallback; no predefined examples.
- Email is displayed as read-only and comes from auth/user profile fallback.
- Profile completeness is calculated from actual required fields and starts low/empty when the user has not filled anything.
- Uploaded resume remains the user-managed current resume in the private `resumes` bucket.
- Saved current resume opens through `/api/resume/current` in a new tab so private storage access stays authenticated.
- AI resume extraction fills the form from the selected PDF, then the user reviews and saves manually.
- Resume PDF generation was restored to scope as a download-only export from saved profile data.
- Generated PDFs do not use GPT, do not save to InsForge Storage or DB, and do not overwrite `resume_pdf_url`.
- PDFKit must be listed in `serverExternalPackages` because Next/Turbopack otherwise rewrites its built-in Helvetica font asset path.

## Problems solved

- Removed profile mock prefill and fixed the incorrect 70% completion issue on an empty profile.
- Fixed email editing confusion by making email auth-derived/read-only and ensuring it is populated from the signed-in user.
- Fixed private resume access returning `AUTH_INVALID_CREDENTIALS` by replacing raw storage links with `/api/resume/current`.
- Fixed generated-resume runtime error: `ENOENT ... pdfkit/js/data/Helvetica.afm` by adding `serverExternalPackages: ["pdfkit"]` in `next.config.ts`.
- Removed the earlier generated-resume-from-profile action, then restored it with the new agreed scope: save first, download-only, no backend persistence.
- Cleared a stale Next dev lock and restarted the dev server on `http://localhost:3000`.

## Current state

- `context/progress-tracker.md` marks Feature 08 complete.
- Next planned feature is `09 Find Jobs Page — Full UI`.
- `npm run lint` passes.
- `npm run build` passes and includes `/api/resume/current`, `/api/resume/extract`, and `/api/resume/generate`.
- The dev server was restarted on `http://localhost:3000` after the PDFKit config fix.
- Shell `curl` could not connect to localhost in this environment even while the Next process reported ready, so browser verification is still the practical signal.
- User had reported "Something went wrong while generating your resume"; the root cause was fixed, but the user has not yet confirmed the browser retry after the restart.
- Working tree contains the expected uncommitted feature changes for Profile Features 06-08 and supporting context/package updates.

## Next session starts with

Run `/remember restore`, then ask whether the user was able to download the generated resume after the PDFKit fix.

If not confirmed, inspect `.next/dev/logs/next-development.log` immediately after they retry `/api/resume/generate`; look for any new `[api/resume/generate]` error. If confirmed, begin Feature 09 — Find Jobs Page Full UI, following the required project context read order and updating `ui-registry.md` plus `progress-tracker.md`.

## Open questions

- Did the generated resume download work in the browser after the PDFKit `serverExternalPackages` fix and dev-server restart?
- Should Feature 06 be tightened later to save the InsForge storage key and use explicit upsert semantics for the uploaded current resume?
- Should auth/session trust-boundary hardening happen before deeper job-search features rely on authenticated DB data?
