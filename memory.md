# Memory — InsForge Schema Foundation

Last updated: 2026-06-16 16:07 EDT

## What was built

Completed Phase 1 Feature 04 — Database Schema.

Created:
- `context/insforge-schema.sql` with the strict JobPilot InsForge schema.

Modified:
- `context/progress-tracker.md` now marks `04 Database Schema` complete and sets `05 Profile Page — Full UI` as next.
- `AGENTS.md` was repaired after the InsForge installer overwrote the project rules. It now preserves the original project instructions and adds a short note that InsForge MCP is configured for Codex.

Live InsForge backend now has:
- `profiles`
- `agent_runs`
- `jobs`
- `agent_logs`
- private `resumes` storage bucket

## Decisions made

- Feature 04 uses a strict foundation, not a loose MVP schema.
- Backend infrastructure tasks go through InsForge MCP/CLI tooling.
- The repo-local schema artifact lives at `context/insforge-schema.sql`.
- `profiles.id` is the app user id and references `auth.users(id)`.
- All other app-owned tables use `user_id` and RLS ownership policies based on `auth.uid()`.
- `jobs.source` supports both `'search'` and `'url'`, even though current app scope only creates `'search'` jobs.
- `ui-registry.md` was intentionally not updated because no UI component changed.

## Problems solved

- InsForge installer initially required an API key and then overwrote `AGENTS.md`; the project-specific instructions were restored and merged with a small InsForge tooling note.
- Verified the InsForge SQL environment before writing policies: `auth.uid()`, `auth.jwt()`, `auth.role()`, `auth.users`, and `pgcrypto` are available.
- Applied schema successfully through InsForge MCP and verified the live backend state afterward.

## Current state

- `npm run lint` passes.
- `npm run build` passes.
- InsForge MCP `get_backend_metadata` shows the four app tables with 0 records and the private `resumes` bucket.
- InsForge MCP `get_table_schema` confirms RLS is enabled and ownership policies exist on all four app tables.
- Working tree has expected local changes from this session:
  - `AGENTS.md`
  - `context/progress-tracker.md`
  - `context/insforge-schema.sql`
- The earlier auth trust-boundary concern still exists: `app/api/auth/session/route.ts` should be hardened before relying on auth in production.

## Next session starts with

Start by running `/remember restore`, then decide whether to:

1. Harden the auth trust boundary in `app/api/auth/session/route.ts` before moving on, or
2. Begin Phase 2 Feature 05 — Profile Page Full UI.

If touching InsForge code, re-fetch current InsForge docs through MCP first. If building UI, follow the required project context read order and update `ui-registry.md` plus `progress-tracker.md` after the feature.

## Open questions

- Should auth hardening happen before Feature 05, even though `progress-tracker.md` lists Profile Page UI as next?
- Should logout emit an explicit `auth_signed_out` event?
- Should returning authenticated users be identified on page load, not only immediately after OAuth callback?
