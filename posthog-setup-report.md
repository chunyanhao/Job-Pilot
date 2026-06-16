<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into JobPilot. The following changes were made:

- **Reverse proxy**: Added `/ingest/*` rewrites to `next.config.ts` so PostHog traffic routes through the Next.js server, improving ad-blocker resilience and bundle performance. `skipTrailingSlashRedirect: true` was also enabled as required by PostHog.
- **Improved init config**: Updated `lib/posthog-client.ts` to use `api_host: "/ingest"` (the reverse proxy path), `ui_host: "https://us.posthog.com"` (for the PostHog toolbar), `defaults: "2026-01-30"` (required by PostHog for consistent defaults), and `capture_exceptions: true` (enables automatic error tracking).
- **Environment variables**: Set `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` in `.env.local`.
- **Auth event capture** (already wired in Phase 1 code):
  - `components/auth/LoginPanel.tsx` fires `auth_sign_in_started` on OAuth button click and `auth_sign_in_failed` on config or provider errors.
  - `components/auth/AuthCallback.tsx` fires `auth_sign_in_completed` on success (with `identifyPostHogUser`) and `auth_sign_in_failed` with a structured `reason` + `stage` for every failure path (provider error, missing code, missing verifier, exchange failure, missing token, session persist failure, unexpected error).
- **Business events** (`job_search_started`, `job_found`, `profile_completed`, `company_researched`) are typed in `lib/posthog-events.ts` and the server/client capture helpers are ready. They will be wired when their host components are built in Phases 2–5.

| Event | Description | File |
|---|---|---|
| `auth_sign_in_started` | OAuth sign-in button clicked | `components/auth/LoginPanel.tsx` |
| `auth_sign_in_completed` | Sign-in succeeded; user identified | `components/auth/AuthCallback.tsx` |
| `auth_sign_in_failed` | Sign-in failed at any stage with structured reason | `components/auth/AuthCallback.tsx` |
| `job_search_started` | Find Jobs button clicked (Phase 3) | `components/find-jobs/SearchControls.tsx` |
| `job_found` | Job discovered and saved by agent (Phase 3) | `app/api/agent/find/route.ts` |
| `profile_completed` | User saves a fully complete profile (Phase 2) | `actions/profile.ts` |
| `company_researched` | Company dossier generated (Phase 4) | `app/api/agent/research/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/467976/dashboard/1721439)
- [Sign-in funnel](https://us.posthog.com/project/467976/insights/YVLSB6Wd)
- [Jobs found over time](https://us.posthog.com/project/467976/insights/RBEOYyc9)
- [Job search activity](https://us.posthog.com/project/467976/insights/FtKSuwKh)
- [Company research activity](https://us.posthog.com/project/467976/insights/z4oTmK2l)
- [Profile completions](https://us.posthog.com/project/467976/insights/9reYvjZX)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — a handler that only identifies on fresh login can leave returning sessions on anonymous distinct IDs.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
