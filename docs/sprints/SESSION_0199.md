---
title: "SESSION 0199 — Server-Query Cleanup Lane (ResultsCount Primitive + searchOrganizations Sort Allowlist + websiteUrl Empty-String Zod)"
slug: session-0199
type: session--open
status: in-progress
created: 2026-05-19
updated: 2026-05-19
last_agent: claude-session-0199
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0198.md
  - docs/protocols/petey-plan.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/knowledge/wiki/custom-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0199 — Server-Query Cleanup Lane

## Date

2026-05-19

## Operator

Brian + claude-session-0199 (Petey)

## Goal

Drain the three remaining items from SESSION_0198 Open decisions in a single bundled PR off post-PR-#35 main:

1. **Courses count line.** Build a new generic server-renderable `<ResultsCount>` primitive at `apps/web/components/web/ui/results-count.tsx` and adopt it across all four public listings (courses, schools, techniques, disciplines) for cross-listing parity. The primitive accepts `total` + a pre-localized `label` so consumers stay flexible. Render position inside each Query component above its Listing wrapper (above the Grid in DisciplineList).
2. **`searchOrganizations` sort allowlist hardening.** Mirror this session's locked-in pattern from SESSION_0198 (`SORTABLE_COURSE_COLUMNS = ["title"] as const`). For organizations the sort UI exposes only `name.asc / name.desc` (`school-search.tsx:21-24`), so allowlist = `["name"]`. Add `sortOrder` direction sanitization at the same time. Closes the matching URL-injection hole flagged in SESSION_0198 Open decisions.
3. **`createOrganizationSchema.websiteUrl` empty-string zod fix.** One-line `.or(z.literal(""))` extension at `apps/web/server/web/organization/schemas.ts:22`. The `email` field at `:24` already received this treatment via PR #35; `websiteUrl` is the last form input still rejecting `""` from defaultValues.

## Bow-in notes

- **Latest previous session:** SESSION_0198 — Server-Query Lane v1 (Organization Contact Fields + searchCourses Sort), closed-full.
- **Previous next session goal:** Pick the next lane — server-query cleanup default (these three items) or lineage v1. Owner picked the server-query cleanup lane at bow-in.
- **Owner directive this session:**
  - Squash-merge PR #35 first (mirror SESSION_0198 PR #34 flow). ✅ done at `ce867db`.
  - Use Graphify (not repo-wide grep) for navigation. Done.
  - Skip the Desi review pass this session — items are small and clean; rely on Petey/Cody review + hostile close. Locked Round 3 grill.
  - Single sequential Cody pass (no parallel subagents) on disjoint files — same as SESSION_0198.
  - Doug lighter gates (typecheck + biome + URL smoke); no migrate-replay needed (zero schema changes this session). Locked Round 3.
  - Self-squash-merge PR after green checks (gh CLI authorized by bow-in args); push SESSION close to main. Mirrors PR #34 flow.
- **Branch at bow-in:** `main` at `ce867db` (PR #35 squash-merge close).
- **Working tree:** clean.
- **Worktrees at bow-in:** main repo only (`/Users/brianscott/dev/ronin-dojo-app`).
- **Graphify status:** `graphify stats` reported 6470 nodes, 11622 edges, 1261 tracked files (run during bow-in). Drift from SESSION_0198 close (6462 / 11606 / 1261) reflects PR #35 squash-merge content. No `graphify update` run during bow-in — graph is current within tolerance.
- **Graphify queries used:**
  - `courses page IntroDescription count Stats CourseQuery course-list` — found `apps/web/components/web/stats.tsx` (hardcoded marketing widget, not the right primitive) + confirmed `course-query.tsx` is the data-fetching boundary.
  - `searchOrganizations sort allowlist directory orderBy SORTABLE columns` — found project-log node for the matching-hole finding (SESSION_0198_FINDING_02).
  - `createOrganizationSchema websiteUrl zod optional empty string organization schemas` — confirmed `schemas.ts` is the only file edit needed for item 3.
- **PR state at bow-in:** PR #35 squash-merged at `ce867db` per Round 1 grill decision. PR #22 (lineage editor actions) still OPEN, base=`session-lineage-v1-react-canvas-from-lineage-snapshot`, Vercel FAILURE; explicitly out of SESSION_0199 scope.
- **FS log / drift register:** no `open` entries; all `mitigated`. Drift register has no live items affecting today's lane.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | UI primitive surface (`components/web/ui/` — Dirstarter primitive pattern) + Prisma server-query layer (sort allowlist hardening, no schema change) + zod form schema (one-line). No Dirstarter-baseline replacement of payments, auth, media, storage, content, or theming — strictly cleanup over the existing layers. |
| Extension or replacement | Extension. New `ResultsCount` joins the existing `~/components/web/ui/` primitive set alongside `Stat`, `Intro`, `Grid`, `Breadcrumbs`. The sort allowlist mirrors the pattern already landed in `searchCourses` (SESSION_0198). The zod fix mirrors the pattern already landed for `email` in PR #35. |
| Why justified | Three queued items from SESSION_0198 Open decisions, all flagged as cleanup-debt-payable-in-this-lane. `ResultsCount` is intentionally generic so the four public listings (courses, schools, techniques, disciplines) gain the same parity without coupling to any domain. The sort allowlist closes a URL-injection hole. The zod fix closes a form-submit reject for users who leave the website URL blank. |
| Risk if bypassed | Three items continue to drift; URL-injection of arbitrary column names against `searchOrganizations` remains open; admins/owners can't save the create-organization form with an empty website URL; cross-listing UX consistency stays partial. None are launch-critical but all are SESSION_0198-flagged backlog. |

## Petey plan

### Goal

Ship the three-item server-query cleanup lane (`ResultsCount` primitive + 4-listing adoption + `searchOrganizations` sort allowlist + `websiteUrl` empty-string zod fix) as a single bundled PR off post-PR-#35 main.

### Tasks

#### SESSION_0199_TASK_01 — PR #35 squash-merge + branch cut

- **Agent:** Petey
- **What:** Squash-merge PR #35 to `main`, pull main, cut feature branch.
- **Steps:**
  1. `gh pr merge 35 --squash --delete-branch --subject "feat(server-query): Organization contact fields + searchCourses sort consumption (#35)"` ✅ — done at `ce867db`.
  2. `git checkout main && git pull --ff-only` ✅ — done.
  3. Commit + push this SESSION_0199 plan to main, then `git checkout -b session-results-count-and-server-query-cleanup`.
- **Done means:** PR #35 status MERGED; main HEAD = post-SESSION_0199-plan commit; feature branch cut.
- **Depends on:** nothing.

#### SESSION_0199_TASK_02 — Cody implementation (single sequential, no Desi pass)

- **Agent:** Cody (general-purpose subagent — single sequential)
- **What:** Build `ResultsCount` primitive, add `results` ICU plural key to four i18n namespaces, wire into four listings, harden `searchOrganizations` sort, fix `websiteUrl` zod.
- **Steps:**
  1. **Build the primitive.** Create `apps/web/components/web/ui/results-count.tsx` as a generic server component:
     ```tsx
     import type { ComponentProps } from "react"
     import { cx } from "~/lib/utils"

     export type ResultsCountProps = ComponentProps<"p"> & {
       total: number
       label: string
     }

     export const ResultsCount = ({ total: _total, label, className, ...props }: ResultsCountProps) => {
       return (
         <p className={cx("text-sm text-muted-foreground", className)} {...props}>
           {label}
         </p>
       )
     }
     ```
     Notes: `total` is in the API for forward parity (animated variant later) but the static render delegates the count to the ICU plural inside `label`. Keep the `total` prop required so consumers always pass it (defensive against label-only mistakes that lose the count).
  2. **i18n key additions.** Append a `results` ICU plural key to each of these four files (en namespace only — no other locales exist yet):
     - `apps/web/messages/en/courses.json` → `"results": "{count, plural, =0 {No courses} one {1 course} other {# courses}}"`
     - `apps/web/messages/en/schools.json` → `"results": "{count, plural, =0 {No schools} one {1 school} other {# schools}}"`
     - `apps/web/messages/en/techniques.json` → `"results": "{count, plural, =0 {No techniques} one {1 technique} other {# techniques}}"`
     - `apps/web/messages/en/disciplines.json` → `"results": "{count, plural, =0 {No disciplines} one {1 discipline} other {# disciplines}}"`
     Preserve existing keys; merge cleanly.
  3. **Wire `ResultsCount` into `CourseQuery`.** Edit `apps/web/components/web/courses/course-query.tsx`:
     - Add `import { getTranslations } from "next-intl/server"` and `import { ResultsCount } from "~/components/web/ui/results-count"`.
     - Inside the async function, after the `searchCourses` call: `const t = await getTranslations("courses")`.
     - Wrap the return in a fragment with `<ResultsCount total={total} label={t("results", { count: total })} />` rendered above `<CourseListing>`.
  4. **Wire `ResultsCount` into `SchoolQuery`.** Edit `apps/web/components/web/schools/school-query.tsx` — same pattern, namespace `"schools"`.
  5. **Wire `ResultsCount` into `TechniqueQuery`.** Edit `apps/web/components/web/techniques/technique-query.tsx` — same pattern, namespace `"techniques"`.
  6. **Wire `ResultsCount` into `DisciplineList`.** Edit `apps/web/app/(web)/disciplines/_components/discipline-list.tsx`:
     - DisciplineList is structurally different (no Query/Listing wrapper, no pagination — just a flat server component returning a `<Grid>`).
     - Use `disciplines.length` as total. The existing `getTranslations("disciplines")` call at `:13` already grabs the namespace.
     - Render `<ResultsCount total={disciplines.length} label={t("results", { count: disciplines.length })} />` above the `<Grid>` in both the empty-state branch and the populated branch (or hoist a single Stack with results-count + grid).
  7. **`searchOrganizations` sort allowlist hardening.** Edit `apps/web/server/web/directory/search-organizations.ts`:
     - Add `const SORTABLE_ORGANIZATION_COLUMNS = ["name"] as const` near the top.
     - Replace the existing `:21` destructure with the same pattern landed in `searchCourses`:
       ```ts
       const [rawSortBy, rawSortOrder] = sort ? sort.split(".") : [undefined, undefined]
       const sortBy = (SORTABLE_ORGANIZATION_COLUMNS as readonly string[]).includes(rawSortBy ?? "")
         ? rawSortBy
         : undefined
       const sortOrder = rawSortOrder === "desc" ? "desc" : "asc"
       ```
     - Keep the existing `:44` orderBy fallback (`{ name: "asc" }`).
  8. **`createOrganizationSchema.websiteUrl` empty-string zod fix.** Edit `apps/web/server/web/organization/schemas.ts:22`:
     - Replace `websiteUrl: z.string().url().max(2048).optional(),` with `websiteUrl: z.string().url().max(2048).optional().or(z.literal("")),`.
     - Mirrors the `email` treatment at `:24` already landed via PR #35.
  9. **Static gates.** Run `pnpm --filter dirstarter typecheck` and `bun biome check .` from `apps/web`. Apply auto-fixes if any are biome-reported.
  10. **DO NOT edit any file under `docs/sprints/`** — Cody guardrail honored across SESSION_0196 / 0197 / 0198.
- **Done means:** Primitive file exists; four i18n namespaces have `results` ICU plural; four listings render `<ResultsCount>` above their grid/listing; `searchOrganizations` has the allowlist + direction sanitization; `websiteUrl` zod accepts `""`; typecheck clean; biome clean.
- **Depends on:** TASK_01.

#### SESSION_0199_TASK_03 — Doug verification (lighter gates, no migrate-replay)

- **Agent:** Doug
- **What:** Lifecycle gate before PR open. Lighter than SESSION_0198 (no migration this session, so no replay needed).
- **Steps:**
  1. `pnpm install --frozen-lockfile`
  2. `pnpm --filter dirstarter typecheck`
  3. `bun biome check .` from `apps/web`
  4. Local smoke (deferred to Vercel preview if cluttered — owner-ratified path):
     - `/courses` shows count line above the listing search row.
     - `/schools` shows count line.
     - `/techniques` shows count line.
     - `/disciplines` shows count line above the grid.
     - `/courses?sort=name.asc` (non-allowlisted) silently falls back to default order (no 500). `/courses?sort=title.desc` already proven by SESSION_0198 — re-confirm here.
     - `/schools?sort=name.desc` flips to Z→A; `/schools?sort=name.asc` flips back to A→Z; `/schools?sort=evil.asc` falls back to default (no 500).
     - Public org create form: leave website blank, submit; form accepts (no zod reject).
  5. Open PR against `main` from `session-results-count-and-server-query-cleanup`; wait for Vercel + CodeRabbit; post Doug verification comment.
- **Done means:** All three static commands pass; smoke passes (or queued to Vercel preview); PR has Vercel SUCCESS + CodeRabbit SUCCESS; Doug comment posted.
- **Depends on:** TASK_02.

#### SESSION_0199_TASK_04 — Petey self-squash-merge + close push

- **Agent:** Petey
- **What:** After Doug green + Vercel SUCCESS + CodeRabbit SUCCESS, self-squash-merge PR per bow-in authorization. Push SESSION_0199 close commit to main.
- **Steps:**
  1. `gh pr merge <N> --squash --delete-branch --subject "feat(listings): ResultsCount primitive + searchOrganizations sort allowlist + websiteUrl empty-string zod (#<N>)"`.
  2. `git checkout main && git pull --ff-only` → expect post-merge HEAD.
  3. Write SESSION_0199 close content (What landed, Files touched, Decisions resolved, Open decisions / blockers, Reflections, Hostile close review, ADR check, Full close evidence, Next session).
  4. Project-log + wiki index + custom-component-inventory entries appended.
  5. `bun run wiki:lint` — green.
  6. `graphify update .` — capture new primitive + 4-listing wiring.
  7. Commit + push close to main.
- **Done means:** SESSION_0199 status `closed-full`; PR merged; main reflects all session work; graphify refreshed.
- **Depends on:** TASK_03.

### Parallelism

- All tasks sequential. TASK_02 single-pass Cody on disjoint files but tightly clustered (one new primitive + 4 wirings + 2 server-query files = small enough to be one commit-set). Skip Desi review pass per Round 3 grill decision — items are individually small and the primitive contract was locked in the grill.
- No parallel subagents this session — same as SESSION_0198 reflection ratify.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Petey | Authorized destructive action (squash-merge) per bow-in args. |
| TASK_02 | Cody (general-purpose) | Mechanical primitive build + 4-listing adoption + two server-query files; single-pass sequential. |
| TASK_03 | Doug | Lifecycle gate (lighter shape — no schema change → no migrate-replay). |
| TASK_04 | Petey | Self-squash-merge + close hygiene per bow-in args. |

### Open decisions

- **No locale fan-out beyond `en`.** Only the `en` namespace has files; if additional locales are introduced later, the `results` ICU plural key will need to ship per-locale. Out of scope this session.
- **`ResultsCount.total` is required but unused in the static render.** Kept in the API for forward parity with a future animated variant (NumberFlow / `<Stat>` integration). If we decide the prop is dead weight, simplify in a later lane.
- **`searchTechniques` already has `curriculum_order` as a sort option** (`techniques.json:sort.curriculum_order`). Adding allowlist hardening to `searchTechniques` would need to allow `["name", "curriculum_order"]` (or its underlying column). **Out of scope this session** — owner-deferred; queue for a follow-up if a third copy of the pattern surfaces (per SESSION_0198 reflection: don't lift to shared helper until third occurrence).
- **`SchoolCardData` duplication** between `school-card.tsx` and `school-list.tsx` from SESSION_0198 — still queued; not addressed this session.

### Risks

- **i18n message JSON merge.** Adding `results` to four files — keep insertion mechanical (after `empty`, before `filters` if present) so the diff stays tight. Biome JSON formatting should handle indentation.
- **`getTranslations` server call in Query components.** All three (Course/School/Technique) Query components are server async — `getTranslations` is the correct API (not `useTranslations`). Cody must not mix client/server imports.
- **`DisciplineList` two-branch render.** The empty-state branch and the populated branch both need the count line. Easier to hoist a single fragment that always renders ResultsCount + the conditional Grid/EmptyList.
- **Sort allowlist regression on existing organization URLs.** Anyone with a bookmark `/schools?sort=foo.bar` will fall back to default ordering silently. This is desired (closes URL-injection) but worth flagging in the PR description.
- **`websiteUrl` empty-string fix touches the public create-org form contract.** Form already passes `""` from defaultValues; this fix ensures the form actually submits. Zero behavioral regression risk.

### Scope guard

Per `petey-plan.md` rule 5: items surfaced during execution (e.g., extending allowlist hardening to `searchTechniques`, `<Stats>` migration to the new primitive, `SchoolCardData` dedup, lineage v1 pickup) go into Open decisions / blockers, not inline fixes.

### Dirstarter implementation template

- **Docs read first:** Not applicable — `~/components/web/ui/` primitive folder is a Dirstarter-pattern surface (existing `Stat`, `Intro`, `Grid`, `Breadcrumbs` all live there). Pattern is already proven in-repo. Server-query allowlist hardening is a copy of the pattern locked in SESSION_0198 (in-repo precedent). Zod `.or(z.literal(""))` is the pattern already landed for `email` in PR #35 (in-repo precedent).
- **Baseline pattern to extend:** `~/components/web/ui/` primitive composition + `getTranslations` server-side i18n + per-namespace ICU plural keys (SESSION_0197 precedent) + `SORTABLE_*_COLUMNS = [...] as const` allowlist (SESSION_0198 precedent) + zod `.or(z.literal(""))` (PR #35 precedent).
- **Custom delta:** New `ResultsCount` primitive (generic, server-renderable, label-as-prop). Adoption across four heterogeneous listings (3 share Query/Listing pattern, DisciplineList is flat).
- **No-bypass proof:** Uses existing primitive folder, existing i18n pattern, existing server-query pattern, existing zod pattern. No competing primitive introduced; no parallel i18n system; no schema change.

## Status

in-progress
