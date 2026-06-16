# Memory — PostHog, Auth Shell, and Logout

Last updated: 2026-06-16 14:20 America/New_York

## What was built

Completed and verified the current PostHog/auth shell work.

Created:
- `components/analytics/PostHogProvider.tsx`
- `components/analytics/TrackedLink.tsx`
- `components/auth/LogoutButton.tsx`
- `lib/posthog-client.ts`
- `lib/posthog-server.ts`
- `lib/posthog-events.ts`
- `posthog-setup-report.md` from the PostHog wizard

Modified:
- `app/layout.tsx` wraps the app in `PostHogProvider`.
- `components/auth/LoginPanel.tsx` tracks OAuth sign-in start and safe failure states.
- `components/auth/AuthCallback.tsx` tracks OAuth success/failure and identifies the user on successful session persistence.
- `components/layout/HomeNavbar.tsx`, `components/layout/AppNavbar.tsx`, `components/layout/HomeFooter.tsx`, `components/homepage/Hero.tsx`, and `components/homepage/BottomCta.tsx` use `TrackedLink` for explicit navigation/CTA tracking.
- `components/layout/AppNavbar.tsx` now includes `LogoutButton`.
- `next.config.ts` includes PostHog `/ingest/*` rewrites and `allowedDevOrigins: ["127.0.0.1"]`.
- `context/project-overview.md`, `context/code-standards.md`, `context/ui-registry.md`, and `context/progress-tracker.md` were updated for PostHog events and the logout pattern.
- `package.json` / `package-lock.json` include `posthog-js` and `posthog-node`.

## Decisions made

- PostHog browser traffic routes through `/ingest` rewrites instead of direct browser calls to PostHog.
- Browser PostHog is initialized in a small client provider inside the server root layout, keeping `app/layout.tsx` server-rendered.
- Explicit click events are used for current navigational actions because relying only on PostHog autocapture made action tracking unclear.
- Custom event names currently include `navigation_clicked`, `cta_clicked`, `auth_sign_in_started`, `auth_sign_in_completed`, `auth_sign_in_failed`, plus the planned business events.
- Logout is implemented as a small client component inside the authenticated navbar, not by converting the whole navbar to a client component.

## Problems solved

- The user could not see a logout option because authenticated pages only rendered Dashboard, Find Jobs, and Profile. Added `LogoutButton` to the right side of `AppNavbar`.
- The user could not see PostHog action events because most current app actions were plain `Link`s and explicit custom events existed only for pageviews/auth. Added `TrackedLink` for nav and CTA clicks.
- Local testing from `127.0.0.1` triggered a Next dev-origin warning. Added `allowedDevOrigins` for `127.0.0.1`.
- Verified the PostHog proxy path reaches PostHog: `/ingest/e/` returns PostHog's expected empty-request `400`, showing the rewrite is active.

## Current state

- `npm run lint` passes.
- `npm run build` passes.
- Local dev server was active at `http://localhost:3000` and root returned `200 OK`.
- Reliable current events to test: `$pageview`, `navigation_clicked`, `cta_clicked`, `auth_sign_in_started`, `auth_sign_in_completed`, `auth_sign_in_failed`.
- Planned product events `job_search_started`, `job_found`, `profile_completed`, and `company_researched` are typed but not fully wired because those feature surfaces are not built yet.
- Review found the PostHog/logout work broadly aligned, but auth is not production-safe yet because `app/api/auth/session/route.ts` still accepts client-supplied access/refresh tokens and writes them directly into cookies.

## Next session starts with

Fix the auth trust boundary before moving to the next product feature.

Specifically:
1. Re-read current InsForge docs before editing auth/session code.
2. Change `app/api/auth/session/route.ts` so cookies are only minted from a server-verified token or from a server-side OAuth exchange response.
3. Re-run `npm run lint`, `npm run build`, and protected-route smoke tests.
4. After auth hardening, continue with Phase 1 Feature 04 — Database Schema.

## Open questions

- Should logout also emit an explicit `auth_signed_out` event? If yes, add it first to `context/code-standards.md` and `lib/posthog-events.ts`.
- Should returning authenticated users be identified on page load, not only immediately after OAuth callback?
- Should PostHog `ui_host` and rewrites be made environment-aware for non-US PostHog hosts, or is the current US project fixed for this app?
