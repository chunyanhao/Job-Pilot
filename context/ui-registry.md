# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Home Navbar

File: `components/layout/HomeNavbar.tsx`
Last updated: 2026-06-15

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-surface`                                                          |
| Border           | `border-b border-border`                                              |
| Border radius    | `none`                                                                |
| Text — primary   | `text-text-dark`                                                      |
| Text — secondary | `none`                                                                |
| Spacing          | `h-16 px-6 gap-10`                                                    |
| Hover state      | `hover:text-accent`, `hover:bg-overlay`                               |
| Shadow           | `shadow-card` on primary CTA                                          |
| Accent usage     | `hover:text-accent`; primary CTA uses `bg-text-slate text-surface`    |

**Pattern notes:**
Homepage navigation is a white full-width band with a 64px height. Nav links are text-only at `text-sm font-medium`; the dark CTA uses the text token rather than a raw black utility.

### Home Footer

File: `components/layout/HomeFooter.tsx`
Last updated: 2026-06-15

| Property         | Class                                   |
| ---------------- | --------------------------------------- |
| Background       | `bg-surface`                            |
| Border           | `border-t border-border`                |
| Border radius    | `none`                                  |
| Text — primary   | `text-text-secondary`                   |
| Text — secondary | `none`                                  |
| Spacing          | `px-10 py-14 gap-8`                     |
| Hover state      | `hover:text-accent`                     |
| Shadow           | `none`                                  |
| Accent usage     | `hover:text-accent`                     |

**Pattern notes:**
Footer links match navbar link weight and use muted secondary text by default. Footer stays unframed except for the top divider.

### Homepage Hero and CTA

File: `components/homepage/Hero.tsx`, `components/homepage/BottomCta.tsx`
Last updated: 2026-06-15

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-surface`, `hero-wash`, `bg-surface-secondary`                     |
| Border           | `border border-border`, `border-b border-border`, `border-x border-border` |
| Border radius    | `rounded-md` for buttons, `rounded-xl` for preview image              |
| Text — primary   | `text-text-slate`                                                     |
| Text — secondary | `text-text-secondary`                                                 |
| Spacing          | `px-6 py-16`, `px-6 py-20`, `mt-6`, `mt-8`, `gap-3`                  |
| Hover state      | `hover:bg-overlay`, `hover:bg-surface-secondary`                      |
| Shadow           | `shadow-card`, `shadow-preview`                                       |
| Accent usage     | `hero-wash` token-backed pastel wash                                  |

**Pattern notes:**
Hero sections use large, tight display headings and centered CTAs. Primary buttons use `bg-text-slate text-surface`; secondary buttons use `border-border bg-surface text-text-primary`.

### Homepage Feature Bands

File: `components/homepage/FeatureSections.tsx`
Last updated: 2026-06-15

| Property         | Class                                                   |
| ---------------- | ------------------------------------------------------- |
| Background       | `bg-surface`, `bg-surface-muted`, `section-grid`        |
| Border           | `border-x border-border`, `border-b border-border`      |
| Border radius    | `rounded-xl` for embedded image previews                |
| Text — primary   | `text-text-slate`, `text-text-dark`                     |
| Text — secondary | `text-text-secondary`                                   |
| Spacing          | `px-8 py-14`, `px-16 py-20`, `mt-12`, `py-7 pl-6`       |
| Hover state      | `none`                                                  |
| Shadow           | `shadow-card`                                           |
| Accent usage     | `border-accent-light`, `border-success-light`           |

**Pattern notes:**
Feature bands use a two-column editorial layout with token-backed grid lines, muted media panels, and one thin vertical accent rail for grouped feature copy.

### Homepage Testimonial

File: `components/homepage/Testimonial.tsx`
Last updated: 2026-06-15

| Property         | Class                                      |
| ---------------- | ------------------------------------------ |
| Background       | `bg-surface`                               |
| Border           | `border-x border-border`                   |
| Border radius    | `rounded-full` for avatar                  |
| Text — primary   | `text-text-slate`, `text-text-primary`     |
| Text — secondary | `text-text-muted`                          |
| Spacing          | `px-6 py-24`, `mt-8`, `gap-3`              |
| Hover state      | `none`                                     |
| Shadow           | `none`                                     |
| Accent usage     | `text-accent` for eyebrow label            |

**Pattern notes:**
Testimonials are centered, spacious, and use the accent token only for the small uppercase eyebrow. Author metadata stays compact at `text-sm` and `text-xs`.

### Auth Login Panel

File: `components/auth/LoginPanel.tsx`
Last updated: 2026-06-16

| Property         | Class                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Background       | `bg-background`, `bg-surface`, `bg-surface-secondary`                 |
| Border           | `border border-border`                                                |
| Border radius    | `rounded-xl` for auth card, `rounded-md` for buttons and alerts       |
| Text — primary   | `text-text-slate`, `text-text-primary`                                |
| Text — secondary | `text-text-secondary`, `text-text-muted`                              |
| Spacing          | `px-6 py-16`, `p-6`, `mt-8`, `gap-3`, `px-4`                          |
| Hover state      | `hover:bg-surface-secondary`                                          |
| Shadow           | `shadow-card`                                                         |
| Accent usage     | `text-accent` for uppercase product label, `text-error` for failures  |

**Pattern notes:**
Auth cards use the standard white surface card with a compact centered layout. OAuth buttons are secondary-style full-width buttons with token-backed borders and hover states.

### Auth Callback Panel

File: `components/auth/AuthCallback.tsx`
Last updated: 2026-06-16

| Property         | Class                                                                |
| ---------------- | -------------------------------------------------------------------- |
| Background       | `bg-background`, `bg-surface`                                        |
| Border           | `border border-border`                                               |
| Border radius    | `rounded-xl` for callback card, `rounded-md` for retry CTA           |
| Text — primary   | `text-text-slate`                                                    |
| Text — secondary | `text-text-secondary`                                                |
| Spacing          | `px-6 py-16`, `p-6`, `mt-3`, `mt-6`                                  |
| Hover state      | `hover:bg-overlay`                                                   |
| Shadow           | `shadow-card`                                                        |
| Accent usage     | `text-accent` for uppercase product label                            |

**Pattern notes:**
Callback states reuse the auth card pattern but center all content. Retry actions use the same dark CTA treatment as homepage primary buttons.

### App Navbar

File: `components/layout/AppNavbar.tsx`
Last updated: 2026-06-16

| Property         | Class                                      |
| ---------------- | ------------------------------------------ |
| Background       | `bg-surface`                               |
| Border           | `border-b border-border`                   |
| Border radius    | `none`                                     |
| Text — primary   | `text-text-dark`                           |
| Text — secondary | `none`                                     |
| Spacing          | `h-16 px-6 gap-10`, `gap-6`                |
| Hover state      | `hover:text-accent`, `hover:bg-surface-secondary` |
| Shadow           | `none`                                     |
| Accent usage     | `hover:text-accent`                        |

**Pattern notes:**
Authenticated app navigation mirrors the homepage navbar height, logo sizing, link weight, and token-backed hover color. It includes a compact secondary-style Logout button on the right side.

### Logout Button

File: `components/auth/LogoutButton.tsx`
Last updated: 2026-06-16

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-surface` |
| Border           | `border border-border` |
| Border radius    | `rounded-md` |
| Text — primary   | `text-text-primary`, `disabled:text-text-muted` |
| Text — secondary | `none` |
| Spacing          | `px-4 py-2` |
| Hover state      | `hover:bg-surface-secondary` |
| Shadow           | `none` |
| Accent usage     | `none` |

**Pattern notes:**
Logout uses the standard secondary button treatment so the authenticated navbar gains an account action without competing with primary app navigation. Pending and retry states reuse the same fixed button footprint.

### Protected Placeholder Cards

File: `app/dashboard/page.tsx`, `app/find-jobs/page.tsx`, `app/find-jobs/[id]/page.tsx`
Last updated: 2026-06-16

| Property         | Class                                                        |
| ---------------- | ------------------------------------------------------------ |
| Background       | `bg-background`, `bg-surface`                                |
| Border           | `border border-border`                                       |
| Border radius    | `rounded-xl`                                                 |
| Text — primary   | `text-text-slate`                                            |
| Text — secondary | `text-text-secondary`                                        |
| Spacing          | `px-6 py-8`, `p-6`, `mt-3`                                   |
| Hover state      | `none`                                                       |
| Shadow           | `shadow-card`                                                |
| Accent usage     | `text-accent` for uppercase section label                    |

**Pattern notes:**
Temporary protected pages use one standard white surface card inside the authenticated app shell. Keep these placeholders compact and token-only until the full dashboard, profile, jobs, and job-details UIs replace them in later phases.

### Profile Page Full UI

File: `components/profile/ProfilePageContent.tsx`
Last updated: 2026-06-17

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-background`, `bg-surface`, `bg-surface-secondary`, `bg-accent-muted` |
| Border           | `border border-border`, `border border-error/20`, `border border-dashed border-border`, `border-b border-border`, `border-t border-border` |
| Border radius    | `rounded-xl` for page cards, `rounded-lg` for embedded panels and upload zone, `rounded-md` for inputs/buttons/tags |
| Text — primary   | `text-text-primary` |
| Text — secondary | `text-text-secondary`, `text-text-muted` |
| Spacing          | `max-w-[872px]`, `px-4 py-8`, `p-6`, `p-4`, `py-8`, `gap-3`, `gap-4`, `gap-6`, `mt-6` |
| Hover state      | `hover:bg-surface-muted`, `hover:bg-accent-dark`, `hover:text-accent-dark`, `hover:text-success-dark` |
| Shadow           | `shadow-card` |
| Accent usage     | `bg-accent text-accent-foreground`, `text-accent`, `accent-accent`, `stroke-accent-light`, `stroke-error`, `stroke-success` |

**Pattern notes:**
Profile UI uses a narrow centered app workspace that matches the supplied mockup instead of the full 1440px content width. Form controls share the token-backed `.profile-input` utility in `app/globals.css`; keep future profile form fields on this utility so the save/extraction phases do not drift visually. Completion is now rendered from live profile state with token-backed SVG strokes rather than a static mock ring. Resume upload feedback keeps selected-file text inside the dashed upload zone using `text-text-primary`; when a resume is saved, the saved-state label appears directly below the upload zone and opens the authenticated `/api/resume/current` PDF route in a new tab with `text-success-foreground` and `hover:text-success-dark`. Resume extraction appears as a compact `bg-surface-secondary` panel after a PDF is selected, with the primary `bg-accent` button and token-backed success/error/loading messages immediately below the upload zone. Generated resume export appears as a separate compact `bg-surface-secondary` panel with a secondary-style `border-border bg-surface text-text-primary` download action that streams `/api/resume/generate` without replacing the uploaded resume.

### Analytics Provider

File: `components/analytics/PostHogProvider.tsx`
Last updated: 2026-06-16

| Property         | Class |
| ---------------- | ----- |
| Background       | `none` |
| Border           | `none` |
| Border radius    | `none` |
| Text — primary   | `none` |
| Text — secondary | `none` |
| Spacing          | `none` |
| Hover state      | `none` |
| Shadow           | `none` |
| Accent usage     | `none` |

**Pattern notes:**
Non-visual client provider mounted inside the server root layout. It initializes PostHog and captures manual pageviews without adding layout wrappers, classes, or visible UI.

### Tracked Link

File: `components/analytics/TrackedLink.tsx`
Last updated: 2026-06-16

| Property         | Class |
| ---------------- | ----- |
| Background       | `inherited from caller` |
| Border           | `inherited from caller` |
| Border radius    | `inherited from caller` |
| Text — primary   | `inherited from caller` |
| Text — secondary | `inherited from caller` |
| Spacing          | `inherited from caller` |
| Hover state      | `inherited from caller` |
| Shadow           | `inherited from caller` |
| Accent usage     | `inherited from caller` |

**Pattern notes:**
Client wrapper around `next/link` for explicit PostHog click events. It does not add styling; callers pass the same token-backed classes they would pass to `Link`.

### Find Jobs Page Full UI

File: `components/find-jobs/FindJobsPageContent.tsx`, `components/find-jobs/SearchControls.tsx`, `components/find-jobs/JobFilters.tsx`, `components/find-jobs/JobsTable.tsx`, `components/find-jobs/JobsPagination.tsx`
Last updated: 2026-06-19

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-background`, `bg-surface`, `bg-surface-secondary`, `bg-success-lightest`, `bg-success`, `bg-info-medium`, `bg-warning`, `bg-accent-muted` |
| Border           | `border border-border`, `border-b border-border`, `border-x border-border`, `border-success-light`, `border-accent-light`, `border-error/20` |
| Border radius    | `rounded-xl` for search/filter/table containers, `rounded-lg` for inputs/buttons/pagination controls, `rounded-full` for source badges and score bars |
| Text — primary   | `text-text-primary`, `text-text-dark`, `text-error` |
| Text — secondary | `text-text-secondary`, `text-text-muted` |
| Spacing          | `max-w-[1440px]`, `px-6 py-8`, `p-6`, `px-5 py-3`, `px-5 py-4`, `px-11 py-5`, `gap-3`, `gap-4`, `gap-6` |
| Hover state      | `hover:bg-accent-dark`, `hover:bg-surface-secondary`, `disabled:bg-accent-dark` |
| Shadow           | `shadow-card` |
| Accent usage     | `bg-accent text-accent-foreground`, `bg-accent-muted text-accent`, `focus:border-accent focus:ring-1 focus:ring-accent` |

**Pattern notes:**
Find Jobs follows `context/designs/find-jobs.png` for the page body while keeping the shared authenticated navbar unchanged. The page uses a wide operational workspace with a search controls card, separate filter toolbar, table card, and attached pagination footer. Feature 09 used local mock rows only; Feature 10 wires the search card to `/api/agent/find`; Feature 11 replaces the table data with authenticated InsForge `jobs` rows loaded from URL-driven filters. After a successful search, the URL `run` param scopes the table to the latest agent run, a compact `border-accent-light bg-surface` notice appears below the filter toolbar, and the secondary-style `View all saved jobs` link clears the run scope. Search location defaults from the user's preferred/profile location while skipping remote-only terms before sending Adzuna `where`. Search feedback appears inside the top card: loading and success use the existing success banner treatment, and errors use `border-error/20 bg-surface-secondary text-error`. Match score bars use token-backed fills: `bg-success` for 80+, `bg-info-medium` for 60-79, and `bg-warning` below 60. Real score bar widths snap to 5-point increments so arbitrary GPT scores render without inline styles. The table supports `Search` and `URL` source badges, and the Adzuna credit appears in the pagination footer.

### Job Details Page Full UI

File: `components/job-details/JobDetailsPageContent.tsx`, `components/job-details/JobDetailsHeaderCard.tsx`, `components/job-details/JobInfoCards.tsx`, `components/job-details/AiMatchReasoningCard.tsx`, `components/job-details/SkillsComparisonCard.tsx`, `components/job-details/JobDescriptionCard.tsx`, `components/job-details/CompanyResearchCard.tsx`, `components/job-details/JobApplyCta.tsx`
Last updated: 2026-06-19

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-background`, `bg-surface`, `bg-surface-secondary`, `bg-success-lightest`, `bg-info-lightest`, `bg-accent-muted` |
| Border           | `border border-border`, `border-b border-border` |
| Border radius    | `rounded-xl` for cards and icon containers, `rounded-lg` for buttons, `rounded-full` for score and skill badges |
| Text — primary   | `text-text-primary`, `text-error` |
| Text — secondary | `text-text-secondary`, `text-text-muted` |
| Spacing          | `max-w-[872px]`, `px-6 py-8`, `p-6`, `p-4`, `px-6 py-4`, `px-6 py-5`, `px-6 py-6`, `px-6 py-12`, `gap-2`, `gap-3`, `gap-4`, `gap-5`, `gap-6` |
| Hover state      | `hover:text-accent`, `hover:bg-surface-secondary`, `hover:bg-accent-dark`, `disabled:bg-accent-dark` |
| Shadow           | `shadow-card` |
| Accent usage     | `bg-accent text-accent-foreground`, `text-accent`, `bg-accent-muted text-accent`, `bg-success-lightest text-success-foreground` |

**Pattern notes:**
Job Details follows `context/designs/job-details.png` for the page body while keeping the shared authenticated navbar unchanged. The route loads the authenticated user's real `jobs` row by `id` and `user_id`; missing or inaccessible rows use the same centered details column with a compact error card. The page body uses the Profile-width `max-w-[872px]` column, stacked white cards, four compact info cards, green matched-skill badges, accent gap-skill badges, and a full-width primary apply CTA. Feature 13 turns Company Research into a client action: the button calls `/api/agent/research`, uses the primary `bg-accent` button with disabled loading text, shows token-backed success/error status strips, refreshes the server route after save, and renders the saved 9-field dossier inside the same white card. Dossier tech stack items use `bg-info-lightest text-info-foreground`; Your Edge bullets use `bg-success`; source links use `text-accent`.
