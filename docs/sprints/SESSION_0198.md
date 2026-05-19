---
title: "SESSION 0198 — Server-Query Lane v1 (Organization Contact Fields + searchCourses Sort)"
slug: session-0198
type: session--open
status: in-progress
created: 2026-05-18
updated: 2026-05-18
last_agent: claude-session-0198
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0197.md
  - docs/agents/desi.md
  - docs/protocols/petey-plan.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/knowledge/wiki/custom-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0198 — Server-Query Lane v1

## Date

2026-05-18

## Operator

Brian + claude-session-0198 (Petey)

## Goal

Consume two of three SESSION_0196 server-query backlog items in a single PR off main: (a) add `phoneE164` + `email` columns to the `Organization` model via a Prisma migration, surface them through `organizationManyPayload` + `searchOrganizations`, render them on the `SchoolCard` hover overlay alongside `websiteUrl`, and wire the admin org form so the new fields are write-capable; (b) make `searchCourses` consume the URL-tracked `sort` param (`title.asc` / `title.desc` only — matches current UI) instead of hardcoding `title asc`. Defer the `courses/page.tsx` `IntroDescription` count line restoration. Merge PR #34 first, then branch off the new main head.

## Bow-in notes

- **Latest previous session:** SESSION_0197 — Listings Parity i18n Cleanup, closed-full.
- **Previous next session goal:** Pick the next lane — server-query lane (default) or lineage v1. Owner picked server-query lane at bow-in.
- **Owner directive this session:** Use Graphify (not repo-wide grep) for navigation; promote Desi already done in SESSION_0196; merge PR #34 first; ship items 2 + 3 from SESSION_0197 Open decisions (SchoolCard contact field, searchCourses sort consumption); defer item 4 (courses count line); single bundled PR; single sequential Cody pass.
- **Branch at bow-in:** `main` at `f53aea4` (PR #34 squash-merge close).
- **Working tree:** clean.
- **Worktrees at bow-in:** main repo only (`/Users/brianscott/dev/ronin-dojo-app`).
- **Graphify status:** `graphify stats` reported 6462 nodes, 11606 edges, 792 communities, 1261 tracked files. Drift from SESSION_0197 close (6379 / 11501 / 812 / 1251) reflects PR #34 squash-merge content. No `graphify update` run during bow-in — graph is current within tolerance.
- **Graphify queries used:**
  - `courses techniques schools disciplines listing page card category` — verified server-query target files are reachable from existing graph.
  - `tool-listing categories ToolListing tool-card category-card category listing primitives` — confirmed reference primitives for the Desi review pass.
- **PR state at bow-in:** PR #34 squash-merged at `f53aea4` per Round 1 grill decision. PR #22 (lineage editor actions) still OPEN, base=`session-lineage-v1-react-canvas-from-lineage-snapshot`, Vercel FAILURE; explicitly out of SESSION_0198 scope.
- **FS log / drift register:** no `open` entries; all `mitigated`. Drift register has no live items affecting Organization model or `searchCourses`.
- **Verification note:** Graphify served as the navigation aid; the target files (`searchOrganizations`, `organizationManyPayload`, `searchCourses`, `course-query`, `school-card`) were verified by direct file reads during the planning grill.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma model extension (Organization columns) + payload + server-query layer + admin form. This is the first SESSION_0198+ touch on the Prisma/data layer since the listings parity sequence. |
| Extension or replacement | Extension. Adds two optional nullable columns (`phoneE164 String?`, `email String?`) to the existing Organization model; mirrors the existing Dirstarter pattern of optional contact fields on Org-shaped tables. No replacement of any Dirstarter capability. |
| Why justified | Public SchoolCard hover overlay needs contact fields per owner-ratified UX direction; existing Organization payload exposes only `websiteUrl` directly. Without the columns, the SchoolCard hover overlay would render only website or leak `owner.email` (a User PII field). Migration is the correct path. The `searchCourses` sort orphan flagged in SESSION_0196 Open decisions is a known smell (visible Sort UI that doesn't change results); landing server-side consumption closes the orphan. |
| Risk if bypassed | SchoolCard hover overlay stays website-only (lower information density on a flagship public surface); `courseFilterParams.sort` stays an orphan URL-tracked-only parameter (continued UX smell + audit-debt). Both blocking SESSION_0196 cleanup expectations. |

## Petey plan

### Goal

Ship the two-item server-query lane (Organization contact fields + `searchCourses` sort consumption) as a single bundled PR off post-PR-#34 main. Defer the courses count line restoration.

### Tasks

#### SESSION_0198_TASK_01 — PR #34 squash-merge + branch cut

- **Agent:** Petey
- **What:** Squash-merge PR #34 to `main`, pull main, cut feature branch.
- **Steps:**
  1. `gh pr merge 34 --squash --delete-branch --subject "feat(listings): per-domain i18n namespaces + DisciplineCard ICU plurals (#34)"` ✅ — done at `f53aea4`.
  2. `git checkout main && git pull --ff-only` ✅ — done.
  3. `git checkout -b session-org-contact-and-course-sort` ✅ — done.
- **Done means:** PR #34 status MERGED; main HEAD = `f53aea4`; feature branch `session-org-contact-and-course-sort` cut off new main.
- **Depends on:** nothing. **COMPLETE.**

#### SESSION_0198_TASK_02 — Desi server-query lane review

- **Agent:** Desi (subagent)
- **What:** Focused review on the three axes of this lane: (a) SchoolCard hover overlay copy/layout for phone+email+website, (b) admin org form parity with the two new contact field inputs, (c) `searchCourses` sort wiring + alignment with `searchOrganizations` split-by-dot precedent. Produce the 9-section structured review with file:line citations.
- **Steps:**
  1. Read `apps/web/components/web/schools/school-card.tsx` hover overlay structure.
  2. Read the admin org form (likely `apps/web/app/admin/organizations/_components/...`) for existing field-pattern precedent.
  3. Read `apps/web/server/web/courses/queries.ts` + `apps/web/server/web/courses/schema.ts` + `apps/web/components/web/courses/course-query.tsx` + `apps/web/components/web/courses/course-search.tsx`.
  4. Compare `searchOrganizations` split-by-dot sort pattern against the existing `searchCourses` shape.
  5. Output prioritized fix list (HIGH/MEDIUM/LOW) with exact files + lines for Cody.
- **Done means:** Desi 9-section block returned; HIGH/MEDIUM/LOW catalogue ready; recorded under `## Review pass 1 — Desi`.
- **Depends on:** TASK_01.

#### SESSION_0198_TASK_03 — Cody implementation

- **Agent:** Cody (subagent — `general-purpose`, single sequential)
- **What:** Implement Desi's fix list. Land Prisma migration; payload + searchOrganizations + SchoolCard wire-up; admin form wiring for the two new fields; `searchCourses` sort consumption.
- **Steps:**
  1. **Prisma migration.** Edit `apps/web/prisma/schema.prisma` Organization model to add `phoneE164 String?` and `email String?` columns (optional, nullable; sit alongside existing `websiteUrl`). Run `pnpm --filter dirstarter prisma migrate dev --name add_organization_contact_fields`. Verify the generated migration SQL is column-add only (no constraint changes, no defaults beyond null).
  2. **Prisma client.** Run `pnpm --filter dirstarter prisma generate` if not auto-triggered by step 1.
  3. **Payload.** Edit `apps/web/server/web/organization/payloads.ts` `organizationManyPayload` to include `phoneE164: true, email: true`. Update `organizationOnePayload` and `organizationDetailPayload` similarly so admin views can read them. Re-derive the inferred types.
  4. **searchOrganizations map.** Edit `apps/web/server/web/directory/search-organizations.ts` mapping to include `phoneE164: org.phoneE164, email: org.email`. Type the return shape via the existing inferred payload.
  5. **SchoolCard.** Edit `apps/web/components/web/schools/school-card.tsx` `SchoolCardData` type to add `phoneE164: string | null` + `email: string | null`. Render three lines in the hover overlay (below the existing description): phone, email, website. Use existing Dirstarter primitives (`<a href="tel:">`, `<a href="mailto:">`, `<Link>` for website). Gracefully handle nulls (omit a line if its field is null; render nothing if all three are null).
  6. **Admin org form.** Locate the admin organization form (path TBD by Desi review — likely `apps/web/app/admin/organizations/_components/organization-form.tsx`). Add two `Input` fields for `phoneE164` (with phone input UX or simple text) + `email` (email-type input). Wire through the existing form-schema validator (likely zod schema in `apps/web/server/web/organization/schemas.ts` or admin-actions schema). Preserve existing form-section grouping conventions.
  7. **searchCourses sort consumption.** Edit `apps/web/server/web/courses/queries.ts` `searchCourses` to accept a `sort?: string` param. Split by `.` like `searchOrganizations` does (`const [sortBy, sortOrder] = sort ? sort.split(".") : [undefined, undefined]`). Use it in the Prisma `orderBy`: `sortBy ? { [sortBy]: sortOrder } : { title: "asc" }`. Restrict allowed `sortBy` values to `title` only this session (no `publishedAt`, no name) — owner-locked at grill round 2.
  8. **CourseQuery.** Edit `apps/web/components/web/courses/course-query.tsx` to pass `sort: params.sort` to `searchCourses`.
  9. **Lint + typecheck.** Run `bun biome check --write` from `apps/web`; run `pnpm --filter dirstarter typecheck`.
  10. **Local smoke.** Verify `/schools` renders SchoolCard hover overlay correctly for a populated org (manually populate one via Prisma Studio if no seed has phone/email yet). Verify `/courses?sort=title.desc` returns Z→A ordering and `/courses?sort=title.asc` returns A→Z. **DO NOT edit any file under `docs/sprints/`** — Cody briefs from SESSION_0196 and SESSION_0197 both flagged this guardrail.
- **Done means:** Migration applied locally; payload + map updated; SchoolCard hover overlay renders three contact lines (null-safe); admin org form accepts and persists the two new fields; `searchCourses` sort consumption verified by URL toggle; typecheck clean; biome clean.
- **Depends on:** TASK_02.

#### SESSION_0198_TASK_04 — Doug verification (lighter + migration check)

- **Agent:** Doug
- **What:** Lifecycle gate before PR open. Lighter shape than SESSION_0197 (no lineage regression suite — irrelevant to this lane) plus an explicit migration-replay check.
- **Steps:**
  1. `pnpm install --frozen-lockfile`
  2. `pnpm --filter dirstarter typecheck`
  3. `bun biome check .` from `apps/web`
  4. `pnpm --filter dirstarter prisma migrate deploy --schema=apps/web/prisma/schema.prisma` against the dev DB to prove the migration replays cleanly (catches drift between `prisma migrate dev` and `migrate deploy` semantics).
  5. Smoke under Baseline brand: `/schools` (verify hover overlay; populate one org with all three contact fields via Prisma Studio if no seed exists). Smoke `/courses?sort=title.desc` + `/courses?sort=title.asc` to confirm orderBy flips. Smoke admin org form: create/edit an org, set phone + email, persist, reload.
  6. Open PR against `main` from `session-org-contact-and-course-sort` branch; wait for Vercel + CodeRabbit; post Doug verification comment on PR with the migration-replay evidence.
- **Done means:** All four static commands pass; smoke passes; PR has Vercel SUCCESS (which proves the migration replays under Vercel prebuild) + CodeRabbit SUCCESS; Doug comment posted with explicit migration-replay verification.
- **Depends on:** TASK_03.

#### SESSION_0198_TASK_05 — Petey/Giddy full-close

- **Agent:** Petey + Giddy
- **What:** Bow-out per `docs/rituals/closing.md`. Hostile close review, frontmatter sweep, wiki index, project-log entries, drift/FS log sweep, ADR + component inventory check, wiki lint, post-hygiene Graphify refresh, commit, push.
- **Steps:**
  1. Hostile close review block in this SESSION file.
  2. `docs/protocols/project-log.md` task plan + review + finding entries.
  3. `docs/knowledge/wiki/index.md` SESSION_0198 row.
  4. **ADR check:** adding two optional nullable columns to Organization is a column-extension, not an architectural choice; the contact-field semantics already exist elsewhere in the model space (User, Lead, Passport). Expected: no new ADR needed. Re-confirm at close.
  5. `docs/knowledge/wiki/custom-component-inventory.md` — add or update entries for SchoolCard contract shift (now reads phone/email/website) and admin org form input additions.
  6. `bun run wiki:lint` — green.
  7. `graphify update .` — capture new payload + form node edges.
  8. Commit + push; comment on PR with bow-out marker.
- **Done means:** SESSION_0198 status `closed-full`; project-log + wiki index reflect this session; PR merged or owner-approved-and-queued; graphify refreshed.
- **Depends on:** TASK_04.

### Parallelism

- All tasks sequential. TASK_02 sequential after TASK_01 (Desi needs the post-PR-#34 main state). TASK_03 sequential after TASK_02 (Cody works from Desi's brief). TASK_04 sequential after TASK_03. TASK_05 sequential after TASK_04.
- No parallel subagents this session — locked at grill round 1. SESSION_0196 + SESSION_0197 reflections both flagged single-worktree parallel as merge-risk-without-benefit for tightly-clustered one-day lanes.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Petey | Authorized destructive action (squash-merge); owner ratified gh CLI path via Round 1. |
| TASK_02 | Desi | Cross-axis UX + design-consistency review on hover overlay layout, admin form parity, and server-query alignment. |
| TASK_03 | Cody (general-purpose) | Mechanical migration + payload + component wire-up with a clear Desi brief; single-pass sequential. |
| TASK_04 | Doug | Lifecycle gate (lighter + migration check) per Round 2/3 grill ratify. |
| TASK_05 | Petey + Giddy | Full close with git hygiene + project-log + wiki + ADR/component sweep. |

### Open decisions

- **Courses `IntroDescription` count line restoration** — owner-deferred at grill round 2; queued for a later session if launch-critical.
- **Admin form: new-field placement** — Desi to decide whether phone + email join the existing "Contact" section (if one exists) or get their own group; Cody to follow.
- **Field validation strictness** — `email` field can be loose (`String?` in Prisma + simple `z.string().email().optional()` zod) or strict. Cody to keep loose validation this session; tightening to E.164 phone normalization is a future lane.
- **PR #22 lineage editor actions** — Vercel FAILURE on a non-main base. Out of scope this session; pairs with the lineage v1 next-task pickup.

### Risks

- **Neon advisory lock leak (memory `feedback_prisma_advisory_lock_neon_leak.md`).** If a prior Vercel build was SIGKILL'd, `pg_advisory_lock(72707369)` may still be held on Neon and cause `prisma migrate deploy` to P1002 timeout. Mitigation: diagnose via `pg_locks` query, release via `pg_terminate_backend`, retry. Likely fine since SESSION_0197 PR #34 just deployed green, but worth flagging.
- **`.npmrc enable-pre-post-scripts=true`** (memory `feedback_pnpm_pre_post_scripts_npmrc.md`). Vercel needs this to fire `prebuild` → `prisma migrate deploy`. Mitigation: SESSION_0181-era fix should still be in place; verify `.npmrc` content before relying on it.
- **Loose phone validation.** `phoneE164` column is named for E.164 but this session takes free-text input. Future cleanup: add a normalizer + zod refine. Flagged in Open decisions.
- **Public surface PII risk.** `email` on a public school card is intended-public (school's contact email, not personal). Form labeling must reflect that — Desi to verify the admin form copy makes this clear so owners don't paste personal emails.
- **Skeleton drift.** If `SchoolCardSkeleton` gets out of sync with the new three-line hover overlay shape, the loading flash will mismatch. Skeleton is not visible during hover (overlay is hidden until `:hover`), so this is a LOW concern.

### Scope guard

Per `petey-plan.md` rule 5: items surfaced during execution (e.g., E.164 normalization, count line restoration, ownership of additional contact fields like `address`) go into Open decisions / blockers, not inline fixes.

### Dirstarter implementation template

- **Docs read first:** Prisma docs (column extension on existing model — standard `prisma migrate dev` flow, no need to re-load Dirstarter docs since the pattern is identical to existing `websiteUrl String?` on the same Organization model). Dirstarter URLs not opened this session — pattern is already proven in-repo and matches Dirstarter base.
- **Baseline pattern to extend:** `apps/web/prisma/schema.prisma` Organization model + `apps/web/server/web/organization/payloads.ts` + `apps/web/server/web/directory/search-organizations.ts` + `apps/web/components/web/schools/school-card.tsx`. Sort consumption mirrors `searchOrganizations` split-by-dot pattern exactly.
- **Custom delta:** two new Organization columns (`phoneE164`, `email`) and `searchCourses` sort consumption.
- **No-bypass proof:** uses existing Prisma + payload + Card pattern end-to-end; admin form uses existing field-input primitives. No competing data-fetch or form pattern introduced.

## Status

in-progress

## Task Log

| Task ID | Status |
| --- | --- |
| SESSION_0198_TASK_01 | complete |
| SESSION_0198_TASK_02 | complete |
| SESSION_0198_TASK_03 | in-progress |
| SESSION_0198_TASK_04 | pending |
| SESSION_0198_TASK_05 | pending |

## TASK_01 — PR #34 merge + branch cut proof

- `gh pr merge 34 --squash --delete-branch --subject "feat(listings): per-domain i18n namespaces + DisciplineCard ICU plurals (#34)"` → squash commit `f53aea4` on `main`, branch deleted.
- `git pull --ff-only` → main at `f53aea4`; pulled SESSION_0197's 12 file changes (`courses.json`, `disciplines.json`, `schools.json`, `techniques.json` plus 8 component edits).
- `git checkout -b session-org-contact-and-course-sort` → feature branch cut off `f53aea4`.
- SESSION plan commit `453ec03` pushed to main; feature branch rebased to inherit it.

## Review pass 1 — Desi

### Desi — SESSION_0198 server-query lane design review

#### Section 1 — High-Level UX/UI Summary

Three axes, three surfaces, one PR.

- **SchoolCard hover overlay (Axis A).** Card already has a working two-layer overlay (`group-hover:opacity-0` base layer / `group-hover:opacity-100` description layer). Adding contact rows is a pure additive extension. The single real risk is the existing whole-card `<Link>` overlay at `school-card.tsx:35` (`<span className="absolute inset-0 z-10" />`), which intercepts every click in the card region — including any nested `tel:` / `mailto:` / website anchors on the hover face. Without explicit `relative z-20`-style escapes, the new contact rows will look clickable but route to `/schools/[slug]` instead. This is the highest-impact finding in the entire review.
- **Admin org form parity (Axis B).** There is **no** `/admin/organizations` form in the repo. The owner-facing organization form lives at `apps/web/app/(web)/dashboard/school-form.tsx` (dashboard tab), and the public creation form is `apps/web/components/web/organizations/create-organization-form.tsx`. Both must be touched. Additionally, `school-form.tsx` already carries a `contactEmail` field plus mis-named `address`/`region` fields that **do not exist** on the Prisma `Organization` model (model has `addressLine1`/`addressLine2` and `state`), and `updateOrganization` at `apps/web/server/web/school/actions.ts:13-19` blindly forwards them to `db.organization.update`. This is a latent Prisma runtime bug exposed by this session — fix scope or flag explicitly.
- **searchCourses sort (Axis C).** Pure mechanical port of the `searchOrganizations` split-by-dot pattern (`search-organizations.ts:21,44`). Sort UI already exists with `title.asc` / `title.desc` only (`course-search.tsx:21-23`). One real concern: `sortBy` from URL is unsanitized in the reference pattern (`search-organizations.ts:44` does `{ [sortBy]: sortOrder }`), which lets a caller URL-inject any column name. This session is an opportunity to whitelist proactively.

The SchoolCard contact rows + the click-interception fix are the only items that change UX behavior. Everything else is plumbing.

#### Section 2 — UI Hierarchy & Clarity Issues

**2.1 — Card-wide link blocks contact-row anchors (HIGH).** `apps/web/components/web/schools/school-card.tsx:34-37` wraps the school name in `<Link href={`/schools/${slug}`}>` and uses `<span className="absolute inset-0 z-10" />` to make the entire card a clickable region. This span sits at `z-10` and the description overlay container at `school-card.tsx:61` (`<div className="absolute inset-0 …">`) has no z-index, so it renders **below** the click-shield. Today the description is read-only text so it doesn't matter. As soon as `tel:` / `mailto:` / website anchors land on the hover face, the click-shield will swallow every click. **Fix:** wrap the hover-face container (or the contact-row block specifically) in `relative z-20` so the anchors paint above `z-10`.

**2.2 — Description overlay layout has no defined gap (MEDIUM).** `school-card.tsx:60-64` renders only `<CardDescription className="line-clamp-3">`. Inserting three contact rows below will need a `<Stack direction="column" size="sm">` wrapper to enforce the existing tight vertical rhythm.

**2.3 — Description `line-clamp-3` steals lines from contact rows (MEDIUM).** Drop to `line-clamp-2` when any contact field is non-null, or accept height bloat (Card auto-expands).

**2.4 — `min-h-10` baseline only set on location, not description (LOW).** Adding contact rows shouldn't disturb this.

#### Section 3 — UX Flow & Friction Points

**3.1 — Contact rows tappable, not just visible (HIGH).** The whole point of the lane. Mobile fallback (no hover) is a future surface; flag at smoke time.

**3.2 — Empty-state when all three contact fields are null (MEDIUM).** Render the contact `<Stack>` conditional on `school.phoneE164 || school.email || school.websiteUrl`, not unconditionally — empty Stack allocates flex gap.

**3.3 — `tel:` / `mailto:` on public card with no masking (LOW).** Public by design; flag for Brandon's later masking decision.

**3.4 — `target="_blank"` for website link (LOW).** External link; `target="_blank" rel="noopener noreferrer"`. Mirrors `footer.tsx:62`.

#### Section 4 — Design System Consistency Report

**4.1 — Contact-row primitives.** Use `<Stack direction="column" size="sm">` (gap-y-1, matches `school-card.tsx:82` skeleton). Plain `<a>` for `tel:` and `mailto:` (Dirstarter `Link` is for internal routes only). Plain `<a target="_blank">` for website to match `directory/[slug]/page.tsx:135` precedent.

**4.2 — Iconography decision: text-only this session (MEDIUM).** Reference cards (`tool-card.tsx`, `category-card.tsx`) carry zero lucide icons on the hover/base face. Don't set a new precedent for two-card consistency. Promote to icons in a later cross-card sweep if cross-brand parity demands it.

**4.3 — Admin form: there is no `/admin/organizations` form (HIGH).** The two real targets:

- `apps/web/app/(web)/dashboard/school-form.tsx` — owner-facing "edit my school" form.
- `apps/web/components/web/organizations/create-organization-form.tsx` — public/onboarding "create org" form.

Both need the two new fields.

**4.4 — Field grouping precedent (MEDIUM).** `lead-form.tsx:115-143` puts `email` + `phoneE164` side-by-side in `<div className="grid gap-4 sm:grid-cols-2">`. **Cleanest precedent for this lane.** Reuse pattern in both target forms placed directly after `websiteUrl`.

**4.5 — Input types.** `<Input type="email">` for email (matches `lead-form.tsx:123`); `<Input type="tel">` for phone (mobile numeric keypad; no validation impact).

**4.6 — Label copy (LOW).** Recommend `Contact Email` + `Contact Phone` to disambiguate from owner's personal contact. Apply consistently across both forms.

**4.7 — Validation strictness (owner-locked loose).** Reuse `z.string().email().max(200).optional().or(z.literal(""))` for email (matches `school-form.tsx:33`, `school/actions.ts:15`). Reuse `z.string().max(32).optional().or(z.literal(""))` for phone (matches `lead-capture-form.tsx:27`).

#### Section 5 — Component Reuse & Missed Opportunities

**5.1 — Don't introduce `<ContactRow>` primitive this session (KISS).** Three rows in one card; inline.

**5.2 — Dashboard `school-form.tsx` has dead/broken fields (REUSE / FIX-SCOPE).** `school-form.tsx:33,80,173` declares + binds `contactEmail`; `school-form.tsx:81,84,189-220` declares `address` + `region`. None exist on the Organization Prisma model (model has `addressLine1`/`addressLine2` + `state`, no `contactEmail`). Action at `school/actions.ts:13-19` forwards them all to `db.organization.update`. Recommend **inline rename**: `contactEmail` → `email`, `address` → `addressLine1`, `region` → `state`. Closes latent bug while landing new fields.

**5.3 — `searchOrganizations` mapping must surface the new fields (MECHANICAL).** `apps/web/server/web/directory/search-organizations.ts:54-62` maps a 6-key card shape. Add `phoneE164`, `email`, **`websiteUrl`** — note `websiteUrl` is missing today even though it's the only contact column on the model (real gap, not just an add).

**5.4 — Sort allowlist guardrail (HIGH).** `search-organizations.ts:44` does `orderBy: sortBy ? { [sortBy]: sortOrder } : { name: "asc" }` with no allowlist. Mirror with allowlist: add `SORTABLE_COURSE_COLUMNS = ["title"] as const` constant in `searchCourses` and gate sortBy on it. Closes URL-injection of arbitrary column names.

**5.5 — `sortOrder` direction validation.** One-liner: `sortOrder === "desc" ? "desc" : "asc"`. Freebie.

#### Section 6 — Registration / Onboarding Review

**6.1 — `createOrganizationSchema` must accept the two new fields (HIGH).** `apps/web/server/web/organization/schemas.ts:6-25` — add `phoneE164` + `email` adjacent to `websiteUrl`.

**6.2 — Create-org form: add two inputs after `websiteUrl` (HIGH).** `create-organization-form.tsx:241-253` — insert two `FormField`s in 2-col grid wrapper. Placeholders: `"contact@school.com"` / `"+1 555 123 4567"`.

**6.3 — Field order.** Mental model on both forms: `Identity → Type → Location → Contact → Disciplines`. `websiteUrl` is the last "Contact" item; inserting `email` + `phoneE164` adjacent keeps coherence.

**6.4 — Drop-off risk.** Both optional. None added.

#### Section 7 — Delight & Micro-UX Suggestions

**7.1 — Transitions sync automatically** inside the existing `duration-200` overlay.

**7.2 — No phone-link confirmation custom dialog.** Browser handles `tel:` prompt.

**7.3 — `truncate` on long emails / websites.** Mirror H4 truncate at `school-card.tsx:33`.

**7.4 — Keyboard focus on hover-only anchors.** Real a11y concern but contact channels are also reachable via the card-wide `Link` → detail page. Future a11y lane.

#### Section 8 — Simplification Opportunities (KISS / DRY / YAGNI)

- **8.1** Don't extract `<ContactLinkRow>` (YAGNI).
- **8.2** Don't add E.164 regex normalization (owner-locked loose).
- **8.3** Don't add `<FormSection>` header for two fields (KISS).
- **8.4** Don't preemptively lift `SORTABLE_COLUMNS` to a shared helper — wait for a third occurrence.
- **8.5** Don't add lucide icons for three contact rows (YAGNI).

#### Section 9 — Prioritized Recommendations (High → Low)

##### HIGH

**H-1 — SchoolCard hover overlay: render contact rows with click-escape from card-wide link.**

- **File:** `apps/web/components/web/schools/school-card.tsx`
- **Brief:**
  - Extend `SchoolCardData` (`:12-20`): add `phoneE164: string | null`, `email: string | null`, `websiteUrl: string | null`.
  - Replace single `<CardDescription>` overlay child (`:60-64`) with the structure below. The `relative z-20` on the contact-row Stack is **load-bearing** — lifts anchors above the `z-10` click-shield at `:35`. Description drops to `line-clamp-2`. Conditional render avoids empty-Stack gap when all three null.

```tsx
<div className="absolute inset-0 opacity-0 duration-200 group-hover:opacity-100">
  <Stack direction="column" size="sm" className="w-full">
    {school.description && (
      <CardDescription className="line-clamp-2">{school.description}</CardDescription>
    )}
    {(school.phoneE164 || school.email || school.websiteUrl) && (
      <Stack direction="column" size="sm" className="relative z-20 w-full text-sm text-muted-foreground">
        {school.phoneE164 && (
          <a href={`tel:${school.phoneE164}`} className="hover:text-primary hover:underline truncate">
            {school.phoneE164}
          </a>
        )}
        {school.email && (
          <a href={`mailto:${school.email}`} className="hover:text-primary hover:underline truncate">
            {school.email}
          </a>
        )}
        {school.websiteUrl && (
          <a href={school.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline truncate">
            {school.websiteUrl.replace(/^https?:\/\//, "")}
          </a>
        )}
      </Stack>
    )}
  </Stack>
</div>
```

**H-2 — `organizationManyPayload` + `organizationOnePayload` must include `phoneE164`, `email`, `websiteUrl`.**

- **File:** `apps/web/server/web/organization/payloads.ts:15-29` + `:31-52`
- **Brief:** Add `phoneE164: true, email: true, websiteUrl: true` to `organizationManyPayload`. Add `phoneE164: true, email: true` to `organizationOnePayload` (already has `websiteUrl: true` at `:45`). `websiteUrl` was missing from Many payload — real gap.

**H-3 — `searchOrganizations` map must surface the three contact fields.**

- **File:** `apps/web/server/web/directory/search-organizations.ts:54-62`
- **Brief:** Extend mapped object with `phoneE164: org.phoneE164, email: org.email, websiteUrl: org.websiteUrl`.

**H-4 — `createOrganizationSchema` + create-org form: accept and surface the two new fields.**

- **Files:** `apps/web/server/web/organization/schemas.ts:6-25` + `apps/web/components/web/organizations/create-organization-form.tsx:241-253` + `:49-62` defaultValues + `apps/web/server/web/organization/actions.ts`
- **Brief:**
  - `schemas.ts` after `:22` `websiteUrl`: add `phoneE164: z.string().max(32).optional()` + `email: z.string().email().max(200).optional().or(z.literal(""))`.
  - `create-organization-form.tsx` after the `websiteUrl` FormField (ends `:253`): insert 2-col grid with `email` (left, `type="email"`, placeholder `"contact@school.com"`) and `phoneE164` (right, `type="tel"`, placeholder `"+1 555 123 4567"`).
  - Add `email: ""` and `phoneE164: ""` to `defaultValues` (`:49-62`).
  - `createOrganization` server action: thread new fields into `db.organization.create`.

**H-5 — Dashboard `school-form.tsx`: rename broken fields + add the two new ones.**

- **Files:** `apps/web/app/(web)/dashboard/school-form.tsx` + `apps/web/server/web/school/actions.ts`
- **Brief:**
  - `schoolFormSchema` (`:25-38`): `contactEmail` → `email`; `address` → `addressLine1`; `region` → `state`; add `phoneE164: z.string().max(32).optional().default("")`.
  - `OrganizationData` (`:42-54`), `defaultValues` (`:75-85`), FormFields (`:115-234`): apply renames + add `phoneE164` next to `email` in a 2-col grid wrapper directly after `websiteUrl` (`:157-169`) following `lead-form.tsx:115-143`.
  - `school/actions.ts:6-20`: mirror schema rename + add `phoneE164`.
  - **Without this rename, the form is broken** (Prisma rejects unknown columns at `update.data`). Fix lands a real latent bug.

**H-6 — `searchCourses` sort consumption with allowlist guardrail.**

- **File:** `apps/web/server/web/courses/queries.ts`
- **Brief:**
  - Signature (`:6-9`): add `sort?: string` to params type.
  - Destructure (`:15`): include `sort`.
  - Before findMany, add the snippet below.
  - Replace `:35` `orderBy: [{ title: "asc" }]` with `orderBy: sortBy ? { [sortBy]: sortOrder } : { title: "asc" }`.

```ts
const SORTABLE_COURSE_COLUMNS = ["title"] as const
const [rawSortBy, rawSortOrder] = sort ? sort.split(".") : [undefined, undefined]
const sortBy = (SORTABLE_COURSE_COLUMNS as readonly string[]).includes(rawSortBy ?? "") ? rawSortBy : undefined
const sortOrder = rawSortOrder === "desc" ? "desc" : "asc"
```

**H-7 — Thread `params.sort` through `CourseQuery`.**

- **File:** `apps/web/components/web/courses/course-query.tsx:27-30`
- **Brief:** Change `searchCourses({ q: params.q, page: params.page, perPage: params.perPage }, brand)` to include `sort: params.sort`. One-line.

##### MEDIUM

- **M-1** Description `line-clamp-3` → `line-clamp-2`. Folded into H-1.
- **M-2** Text-only contact rows (no lucide icons this session).
- **M-3** Label copy: `Contact Email` + `Contact Phone` (disambiguates from owner's personal contact). Both forms.
- **M-4** `phoneE164` placeholder `"+1 555 123 4567"`. Both forms.
- **M-5** `type="tel"` on phone input. Both forms.
- **M-6** Validation snippets reuse existing email/phone idioms (loose).

##### LOW

- **L-1** `target="_blank" rel="noopener noreferrer"` on website row. Folded into H-1.
- **L-2** `truncate` on email/website rows. Folded into H-1.
- **L-3** Note `search-organizations.ts:44` has the same sort hole. Queue as Open decision (out of scope this session).
- **L-4** Keyboard a11y on hover-only contact rows. Future a11y lane.
- **L-5** `SchoolCardSkeleton` drift — skeleton doesn't render hover overlay; no update needed.
- **L-6** `sortOrder` direction sanitization. Folded into H-6.

#### Files Cody touches this session (canonical list)

1. `apps/web/prisma/schema.prisma` (Organization model — add `phoneE164 String?` + `email String?`)
2. `apps/web/server/web/organization/payloads.ts` (Many + One payload extensions)
3. `apps/web/server/web/directory/search-organizations.ts` (mapping extension)
4. `apps/web/components/web/schools/school-card.tsx` (type + hover overlay)
5. `apps/web/server/web/organization/schemas.ts` (createOrg schema)
6. `apps/web/components/web/organizations/create-organization-form.tsx` (defaultValues + FormFields)
7. `apps/web/server/web/organization/actions.ts` (createOrganization action data)
8. `apps/web/app/(web)/dashboard/school-form.tsx` (rename broken fields + add new ones)
9. `apps/web/server/web/school/actions.ts` (updateOrganization rename + new fields)
10. `apps/web/server/web/courses/queries.ts` (sort + allowlist)
11. `apps/web/components/web/courses/course-query.tsx` (thread sort)

#### Files Cody does NOT touch

- `apps/web/components/web/courses/course-search.tsx` — sort UI already correct (`title.asc` / `title.desc`).
- `apps/web/server/web/courses/schema.ts` — `sort` param already wired into `courseFilterParams`.
- Any file under `docs/sprints/`.

#### Findings the operator should be aware of (context, not fixes)

- Dashboard `school-form.tsx` is the highest-impact discovery this session — three field names don't match the Prisma model. H-5 closes the latent bug.
- `organizationManyPayload` is missing `websiteUrl` today; SchoolCard cannot render the website even though the column exists. H-2 closes this gap.
- `searchOrganizations` has the same unsanitized `sortBy` hole that `searchCourses` is about to inherit. Out of scope this session (owner-scoped to courses); queue as Open decision so the hardening lands in a follow-up.

**Handoff:** Cody owns all HIGH + MEDIUM items in a single sequential pass on the 11 files above. LOW items either fold into HIGH (L-1/L-2/L-6) or defer (L-3/L-4/L-5).
