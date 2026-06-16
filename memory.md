# Memory — Homepage Feature

Last updated: 2026-06-15 16:05 America/New_York

## What was built

Completed Phase 1 Feature 01 — Homepage.

Created:
- `components/layout/HomeNavbar.tsx`
- `components/layout/HomeFooter.tsx`
- `components/homepage/Hero.tsx`
- `components/homepage/FeatureSections.tsx`
- `components/homepage/Testimonial.tsx`
- `components/homepage/BottomCta.tsx`

Modified:
- `app/page.tsx` now composes the complete homepage.
- `app/layout.tsx` metadata now uses JobPilot title and description.
- `app/globals.css` now includes token-backed homepage utilities: `hero-wash`, `section-grid`, `diagonal-band`, plus `shadow-card` and `shadow-preview`.
- `context/ui-registry.md` was updated with homepage component patterns.
- `context/progress-tracker.md` marks `01 Homepage` complete and sets `02 Auth` as next.

The homepage uses provided public assets:
- `/logo.png`
- `/images/dashboard-demo.png`
- `/images/jobs-lists.png`
- `/images/agnet-log.png`
- `/images/user-icon.png`

## Decisions made

- Built the homepage as static server-rendered UI first, matching the project build plan before auth or data wiring.
- Kept all component colors on project tokens. No raw Tailwind color classes or hardcoded component hex values were introduced.
- Used `next/link` for navigation and `next/image` for public assets, after checking the installed Next.js 16 docs.
- Primary homepage CTAs use `bg-text-slate text-surface`; secondary CTAs use `border-border bg-surface text-text-primary`.
- Reusable visual effects that need gradients or patterns live in `app/globals.css` as token-backed utilities instead of inline styles in components.

## Problems solved

- Replaced the starter homepage placeholder that used raw `bg-blue-500 text-white`, which violated the project UI token rules.
- `npm run dev` could not start because a stale Next dev lock claimed port 3000. Production server verification was used on port 3001 instead.
- Starting a local server required escalated permission because the sandbox blocked port binding.
- The in-app browser automation runtime was not exposed in this session, so automated screenshot verification was unavailable.

## Current state

- `npm run build` passes.
- `npm run lint` passes.
- Local production server responded `200 OK` at `http://127.0.0.1:3001`.
- Homepage markup includes all major sections from `context/designs/landing-page.png`: navbar, hero, dashboard preview, two feature bands, testimonial, bottom CTA, and footer.
- Manual visual inspection in a browser is still recommended because automated screenshot verification was unavailable.
- Worktree still includes pre-existing modified/untracked files outside the homepage work, including `AGENTS.md` and several `.agents/skills/tailwind-*` directories. Do not assume those were created by the homepage implementation.

## Next session starts with

Start Phase 1 Feature 02 — Auth.

Before implementation:
1. Read `AGENTS.md` and the required context files in order.
2. Check the installed Next.js 16 docs for middleware, route handlers, redirects, and auth-related App Router APIs.
3. Check whether an InsForge skill or MCP tool is available before using InsForge APIs.
4. Inspect the current homepage manually at `http://localhost:3001` if visual confirmation is still needed.

## Open questions

- Need manual browser confirmation that the homepage exactly matches `context/designs/landing-page.png` at the intended desktop viewport.
- Need to resolve or ignore the stale Next dev lock on port 3000 before relying on `npm run dev`.
- Auth implementation depends on current InsForge package/API availability; verify before coding.
