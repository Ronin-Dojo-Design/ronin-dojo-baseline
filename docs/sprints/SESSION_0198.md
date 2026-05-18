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
