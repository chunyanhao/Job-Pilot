<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
## Read Before Anything Else

Read in this exact order before any implementation:

1. context/project-overview.md
2. context/architecture.md
3. context/ui-tokens.md
4. context/ui-rules.md
5. context/ui-registry.md
6. context/code-standards.md
7. context/library-docs.md
8. context/build-plan.md
9. context/progress-tracker.md

## Rules That Never Change

- Never use hardcoded hex values or raw Tailwind color classes
- Update `progress-tracker.md` and `ui-registry.md` after every feature
- Before any third party library — load its installed skill first,
  then read `context/library-docs.md` for project-specific rules
- If the same problem persists after one corrective prompt —
  stop immediately and run /recover

## Available Skills

- `/architect` — before any complex feature. Think before building.
- `/imprint` — after any new UI component. Capture patterns.
- `/review` — before demo or when something feels off.
- `/recover` — when something breaks after one failed correction.
- `/remember save` — when a feature spans multiple sessions.
- `/remember restore` — when returning after a multi-session feature.

## InsForge Backend

This project uses InsForge as its backend platform.

Before writing or editing any InsForge integration code, call the InsForge MCP
`fetch-docs` or `fetch-sdk-docs` tool for the latest implementation guidance.
Start with:

- `fetch-docs` with `docType: "instructions"`

Use SDKs for application logic:

- Authentication
- Database CRUD
- Storage operations
- AI integration
- Serverless function invocation

Use MCP tools for infrastructure:

- Backend metadata
- Database schema changes
- Storage bucket management
- Serverless function deployment
- Frontend deployment

Important InsForge conventions:

- SDK calls return `{ data, error }`.
- Database inserts require array format: `[{ ... }]`.
- Serverless functions have one endpoint and do not support nested route paths.
- For custom auth UI, use auth SDK documentation.
- For prebuilt auth UI, use the framework-specific auth component documentation.
- Keep Tailwind CSS at 3.4; do not upgrade to Tailwind v4.

## Installed InsForge Tooling

- InsForge MCP is configured for Codex.
- Use the InsForge MCP tools for backend infrastructure tasks.
- Do not store InsForge API keys in this file.
