---
title: "SESSION 0200 — Shared sortable.ts helper + searchTechniques allowlist + SchoolCardData dedup + FS-0021 runbook patch"
slug: session-0200
type: session--open
status: in-progress
created: 2026-05-19
updated: 2026-05-19
last_agent: claude-session-0200
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0199.md
  - docs/protocols/petey-plan.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/protocols/failed-steps-log.md
  - docs/runbooks/schema-migration.md
  - docs/runbooks/prisma-workflow.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0200 — Sortable helper + searchTechniques allowlist + SchoolCardData dedup + FS-0021 runbook patch

## Date

2026-05-19

## Operator

Brian + claude-session-0200 (Petey)

## Goal

Ship two PRs in parallel off post-SESSION_0199 main and triage two stale PRs in the wait-on-Vercel window:

- **PR A (code lane)** — Lift the SESSION_0198/0199 sort-allowlist pattern into a shared `apps/web/server/web/_shared/sortable.ts` helper (third occurrence triggers the lift per SESSION_0198 reflection). Refactor `searchCourses`, `searchOrganizations`, and `searchTechniques` to call it. Add `searchTechniques` allowlist (`["name", "curriculum_order"]`) — closes the URL-injection vector against `/techniques?sort=...`. Dedup the `SchoolCardData` type (export from `school-card.tsx`, import in `school-list.tsx`).
- **PR B (docs lane)** — Minimal accuracy patch to `docs/runbooks/schema-migration.md` + `docs/runbooks/prisma-workflow.md` per FS-0021 corrective action #2. Mark FS-0021 mitigated in `docs/protocols/failed-steps-log.md`.
- **Stale PR triage** — Diagnose Vercel FAILURE on PR #11 (`[WIP] Fix issue with pre-filling capacity-one division`) and PR #9 (`[WIP] Add entitlement and brand-membership fixtures`), both ~13 days stale. Decision per PR: close + ticket, retrigger, or queue for SESSION_0201.

## Bow-in notes

- **Latest previous session:** SESSION_0199 — Server-Query Cleanup Lane (ResultsCount + searchOrganizations allowlist + websiteUrl zod), closed-full at `25a4d2c`.
- **Previous next session goal:** Lineage v1 pickup + PR #22 Vercel-failure diagnosis. **Owner-deferred** at SESSION_0200 bow-in: lineage v1 reserved for SESSION_0201 unless something forces an earlier pickup.
- **Owner directives this session (bow-in args):**
  - Use Graphify queries + Graphify CLI for navigation, not repo-wide grep.
  - Petey plans via petey-plan.md and grills until mutual understanding before execution.
  - Use subagents to work in parallel where token-efficient and effective.
  - GitHub CLI authorized for self-merge / branch hygiene; Vercel CLI + Docker available if needed.
  - Bow-out is full-close — new components inventory, ADRs if triggered, graphify update after git hygiene.
  - Stage commit + push to main on completion.
- **Branch at bow-in:** `main` at `25a4d2c` (SESSION_0199 close).
- **Working tree:** clean.
- **Worktrees at bow-in:** main repo only (`/Users/brianscott/dev/ronin-dojo-app`).
- **Graphify status:** 6482 nodes / 11586 edges / 786 communities / 1262 tracked files (run during bow-in). Fresh — SESSION_0199 close ran `graphify update .`.
- **Graphify queries used during bow-in:**
  - `lineage v1 editor actions react canvas snapshot PR 22` — surfaced `editor-actions.ts`, `lineage-react-canvas-port-plan.md`. Confirms PR #22 surface is intact; out of scope this session per owner directive.
  - `schools card list duplication SchoolCardData` — confirmed `school-card.tsx` + `school-list.tsx` as the duplication sites.
- **PR state at bow-in:**
  - **PR #22 (lineage editor actions):** OPEN, base = `session-lineage-v1-react-canvas-from-lineage-snapshot`, Vercel FAILURE. **Out of scope.**
  - **PR #11 (`[WIP] Fix capacity-one division`):** OPEN, base = `main`, Vercel FAILURE since 2026-05-06, head = `claude/fix-capacity-one-division`. **Triage candidate.**
  - **PR #9 (`[WIP] Add entitlement and brand-membership fixtures`):** OPEN, base = `main`, Vercel FAILURE since 2026-05-06, head = `claude/add-entitlement-brand-membership-fixtures`. **Triage candidate.**
- **FS log / drift register:** FS-0021 still `open` (target of PR B). All other FS entries `mitigated` or `closed`. Drift register has 15 standing entries; no live blocker for today's lane.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma server-query layer (sort allowlist hardening pattern, no schema change) + UI primitive type contract (`SchoolCardData` single source of truth) + Dirstarter-pattern runbooks (schema-migration / prisma-workflow accuracy update). No Dirstarter L1 layer replaced. |
| Extension or replacement | Extension. New `_shared/sortable.ts` helper consolidates a pattern already landed twice in-repo (SESSION_0198 + SESSION_0199). `SchoolCardData` re-export mirrors the standard "card owns the type, list imports it" pattern used elsewhere (`CourseCardData`, `TechniqueCardData`). FS-0021 runbook patch corrects in-repo documentation; no behavior change. |
| Why justified | Third occurrence of the sort-allowlist pattern triggers the rule-of-three lift (SESSION_0198 reflection). `SchoolCardData` is a character-identical 12-line duplication from SESSION_0198. FS-0021 is the lone OPEN failed-step and the runbook has been stale since SESSION_0152. |
| Risk if bypassed | Fourth copy of the sort-allowlist pattern lands stale; URL-injection of arbitrary column names against `/techniques?sort=...` stays open; type drift between `SchoolCardData` defs can desync at any time; FS-0021 stays open and the next schema change repeats the violation. None launch-critical; all WORKFLOW 5.0 hygiene. |

## Petey plan

### Goal

Two parallel PRs (code lane + docs lane) + stale PR triage in the wait-on-Vercel window. Single-session arc; full-close on completion.

### Tasks

#### SESSION_0200_TASK_01 — Branch cut + parallel Cody implementation

- **Agent:** Petey (branch cut) + two parallel Cody subagents (general-purpose)
- **What:** Cut two feature branches off `main`. Fan out Cody A (code lane → PR A) and Cody B (docs lane → PR B) in parallel — disjoint files, no merge conflict surface.
- **Steps:**
  1. `git checkout main && git pull --ff-only` (verify HEAD = `25a4d2c` or descendant).
  2. Commit + push this SESSION_0200 plan to `main`.
  3. `git checkout -b session-sortable-helper-and-school-card-dedup` → return to main → `git checkout -b session-fs-0021-schema-migration-runbook-patch` → return to main. (Both branches cut at the same parent commit; Cody subagents each `git switch` to their assigned branch.)
  4. **Cody A (PR A — code lane):**
     - Create `apps/web/server/web/_shared/sortable.ts` exporting:
       ```ts
       export const parseSort = <T extends readonly string[]>(
         sort: string | undefined,
         columns: T,
         defaultOrder: "asc" | "desc" = "asc",
       ): { sortBy: T[number] | undefined; sortOrder: "asc" | "desc" } => {
         const [rawSortBy, rawSortOrder] = sort ? sort.split(".") : [undefined, undefined]
         const sortBy = (columns as readonly string[]).includes(rawSortBy ?? "")
           ? (rawSortBy as T[number])
           : undefined
         const sortOrder = rawSortOrder === "desc" ? "desc" : defaultOrder === "desc" ? "desc" : "asc"
         return { sortBy, sortOrder }
       }
       ```
       Type-safe: the returned `sortBy` is narrowed to `T[number] | undefined` so Prisma `orderBy: { [sortBy]: sortOrder }` stays sound.
     - Refactor `apps/web/server/web/courses/queries.ts`:
       - Keep `SORTABLE_COURSE_COLUMNS = ["title"] as const` (in-file constant).
       - Replace lines 26–30 with `const { sortBy, sortOrder } = parseSort(sort, SORTABLE_COURSE_COLUMNS)`.
       - Leave the orderBy fallback (`{ title: "asc" }`) unchanged.
     - Refactor `apps/web/server/web/directory/search-organizations.ts`:
       - Keep `SORTABLE_ORGANIZATION_COLUMNS = ["name"] as const`.
       - Replace lines 23–27 with `const { sortBy, sortOrder } = parseSort(sort, SORTABLE_ORGANIZATION_COLUMNS)`.
     - Refactor `apps/web/server/web/techniques/queries.ts`:
       - Add `const SORTABLE_TECHNIQUE_COLUMNS = ["name", "curriculum_order"] as const` near the top (matches the i18n options at `messages/en/techniques.json:9` — `name_asc`, `name_desc`, `curriculum_order`).
       - Replace line 22 (`const [sortBy, sortOrder] = sort.split(".")`) with `const { sortBy, sortOrder } = parseSort(sort, SORTABLE_TECHNIQUE_COLUMNS)`.
       - Existing fallback `[{ isFoundational: "desc" }, { sortOrder: "asc" }, { name: "asc" }]` at lines 41–43 stays — covers the `sortBy === undefined` branch.
     - **SchoolCardData dedup:** edit `apps/web/components/web/schools/school-card.tsx` — change `type SchoolCardData = {...}` at line 12 to `export type SchoolCardData = {...}`. Edit `apps/web/components/web/schools/school-list.tsx` — remove the local `type SchoolCardData = {...}` block at lines 9–20 and add `import { SchoolCard, SchoolCardSkeleton, type SchoolCardData } from "~/components/web/schools/school-card"` (extending the existing import).
     - Static gates from `apps/web` directory: `pnpm --filter dirstarter typecheck` and `bun biome check .`. Apply auto-fixes if any biome issues.
     - **DO NOT touch** any file under `docs/sprints/`. Stay strictly in app code.
     - Commit on the code branch: `feat(server-query): shared parseSort helper + searchTechniques allowlist + SchoolCardData dedup` (no Co-Authored-By line in subagent commits — Cody is the author of record).
     - Push the branch.
  5. **Cody B (PR B — docs lane):**
     - Edit `docs/runbooks/schema-migration.md`: remove blanket "never use `prisma migrate dev`" guidance; add a "When to use `migrate dev` vs `db push` vs `migrate deploy`" sub-section with the SESSION_0152 finding (migrate dev creates the migration file needed for Neon prod, db push is dev-only iteration, migrate deploy is the Vercel prebuild step). Bump frontmatter `updated` + `last_agent`.
     - Edit `docs/runbooks/prisma-workflow.md`: add a "Known issues" entry noting the shadow-DB hang from SESSION_0004 did **not** reproduce in SESSION_0152, leaving the door open for a future Prisma 7.x retest. Bump frontmatter.
     - Edit `docs/protocols/failed-steps-log.md`: change FS-0021 `Status: open` → `Status: mitigated` with a one-line note linking SESSION_0200_TASK_03 + the corrective-action #2 paragraph. Bump file frontmatter.
     - Run `bun run wiki:lint` — must pass.
     - **DO NOT touch** any file under `docs/sprints/` or `apps/web/`.
     - Commit on the docs branch: `docs(runbooks): patch schema-migration + prisma-workflow per FS-0021 corrective action #2`.
     - Push the branch.
- **Done means:** Both feature branches pushed with green local typecheck + biome (PR A) / wiki-lint (PR B). PR A's diff = 1 new file (sortable.ts) + 3 query refactors + 2 components. PR B's diff = 3 docs files.
- **Depends on:** nothing.

#### SESSION_0200_TASK_02 — Doug verification + PR opens + stale PR triage

- **Agent:** Doug (static gates) + Petey (PR opens + stale PR triage)
- **What:** Lifecycle gate before merges; use wait-on-Vercel window for stale PR diagnosis.
- **Steps:**
  1. From `apps/web`: `pnpm install --frozen-lockfile` (PR A) + `pnpm --filter dirstarter typecheck` + `bun biome check .` from `apps/web` (PR A).
  2. URL smoke (deferred to Vercel preview, owner-ratified path):
     - `/courses?sort=title.desc` → Z→A (proven SESSION_0198).
     - `/schools?sort=name.desc` → flips ordering (proven SESSION_0199).
     - `/techniques?sort=name.desc` → flips ordering. `/techniques?sort=curriculum_order.asc` → curriculum order. `/techniques?sort=evil.asc` → silent fallback to default fallback array (no 500).
     - All four public listings continue to render `ResultsCount` (no regression from SESSION_0199).
  3. Open PR A: `gh pr create --title "feat(server-query): shared parseSort helper + searchTechniques allowlist + SchoolCardData dedup" --body <heredoc>`.
  4. Open PR B: `gh pr create --title "docs(runbooks): patch schema-migration + prisma-workflow per FS-0021 corrective action #2" --body <heredoc>`.
  5. **Stale PR triage (PR #11, PR #9)** — runs in parallel with Vercel polling:
     - `gh pr view 11 --json statusCheckRollup,mergeable,mergeStateStatus,headRefName,updatedAt`. If Vercel target URL is reachable, `vercel inspect <deployment-domain> --logs` (use the deployment domain, NOT the `vercel.com/...` dashboard URL — per SESSION_0199 reflection).
     - Same for PR #11.
     - **Per-PR decision:**
       - If Vercel failure is the Neon advisory-lock leak (P1002 on `pg_advisory_lock(72707369)`): retrigger via empty commit on the PR branch and continue triage.
       - If Vercel failure is a real build/type error against current main: comment on the PR with the diagnosis + close with `gh pr close <N> --comment "<reason>"` and capture intent in SESSION_0200 Open decisions for SESSION_0201 pickup.
       - If Vercel failure is unreachable (deployment GC'd): re-run with empty commit and re-evaluate.
  6. Wait for PR A + PR B green checks (Vercel SUCCESS + CodeRabbit SUCCESS).
- **Done means:** Both PRs opened, Doug gates green, stale PRs each have a clear disposition (closed-with-ticket, retriggered, or queued).
- **Depends on:** TASK_01.

#### SESSION_0200_TASK_03 — Petey self-squash-merge both PRs + close push

- **Agent:** Petey
- **What:** Self-merge per bow-in authorization. Push close commit.
- **Steps:**
  1. `gh pr merge <PR_A> --squash --delete-branch --subject "feat(server-query): shared parseSort helper + searchTechniques allowlist + SchoolCardData dedup (#<N>)"`.
  2. `gh pr merge <PR_B> --squash --delete-branch --subject "docs(runbooks): patch schema-migration + prisma-workflow per FS-0021 corrective action #2 (#<N>)"`.
  3. `git checkout main && git pull --ff-only`.
  4. Write SESSION_0200 close content (What landed / Files touched / Decisions resolved / Open decisions / Reflections / Hostile close review / ADR check / Full close evidence / Next session).
  5. Project-log entries (build-log + task-plan + review block) for SESSION_0200.
  6. Wiki index row + custom-component-inventory entry for the new `_shared/sortable.ts` helper (server-side utility, not a UI primitive — may or may not warrant a wiki entry; decide at close).
  7. `bun run wiki:lint` — green.
  8. `graphify update .` — capture the new helper file + dedup re-export + refactored search functions + runbook patches.
  9. Commit + push close to `main`.
- **Done means:** SESSION_0200 status `closed-full`; both PRs merged; main reflects all session work; graphify refreshed; FS-0021 marked mitigated; stale PRs disposed.
- **Depends on:** TASK_02.

### Parallelism

- **TASK_01 sub-A (code lane) and sub-B (docs lane) run in parallel** — disjoint file sets (no overlap between `apps/web/**` and `docs/runbooks/**` + `docs/protocols/failed-steps-log.md`). Two general-purpose subagents on disjoint feature branches. Confirms owner directive on parallel subagents.
- TASK_02 triage of PR #11 and #9 runs in the wait-on-Vercel window for TASK_01 PRs — true wall-clock overlap.
- TASK_03 sequential (depends on green checks).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 sub-A | Cody (general-purpose, parallel) | Mechanical refactor + new helper + small dedup. Locked spec. |
| TASK_01 sub-B | Cody (general-purpose, parallel) | Pure docs patch with precise diff intent. Locked spec. |
| TASK_02 | Doug (static gates) + Petey (PR opens + stale PR triage) | Doug runs the gates; Petey shepherds the PRs + uses the wait-on-Vercel slot for triage. |
| TASK_03 | Petey | Self-merge + close hygiene per bow-in authorization. |

### Open decisions

- **`parseSort` `defaultOrder` parameter.** Default is `"asc"`. All three call sites use `asc` fallback today, so the parameter is forward-compat. Drop the parameter if it stays unused after a fourth call site lands.
- **`sortable.ts` location.** `apps/web/server/web/_shared/sortable.ts` — there's no `_shared` folder today (current `shared/` exists but lives outside `web/`). Cody A creates the folder. If owner prefers `apps/web/server/web/shared/` (no underscore), Cody A renames before commit.
- **Custom-component-inventory entry for `parseSort`.** It's a server-side query helper, not a UI primitive. Default is "skip the UI inventory; add a one-line wiki/server-utilities entry instead." Final decision at close.
- **Stale PR triage outcomes.** Disposition decided per-PR during TASK_02. Default for non-recoverable failures = close + ticket.

### Risks

- **Type narrowing on `parseSort`.** Generic `T extends readonly string[]` with `(columns as readonly string[]).includes(...)` must narrow to `T[number] | undefined`. TypeScript inference around `as const` literals can be brittle — Cody must verify the typecheck output across all three call sites (the prisma `orderBy: { [sortBy]: sortOrder }` literal-key pattern is the strict check).
- **`searchTechniques` `sortOrder` parameter binding to Prisma column name.** Existing fallback at line 43 uses `sortOrder` as a Prisma field name (technique.sortOrder column). The new parsed `sortOrder` variable is the **asc/desc direction**. Risk of variable-shadowing if Cody A is sloppy — keep them distinct via destructure naming (`const { sortBy, sortOrder: sortDirection } = parseSort(...)` if needed) OR confirm the line-43 fallback is in the `sortBy === undefined` branch only.
- **Stale PR #11 / #9 branch staleness.** Heads are 13 days behind main; retrigger may surface main-side breakage. Diagnosis-only this session — no rebases.
- **FS-0021 status flip.** Marking FS-0021 mitigated when the Prisma 7.x shadow-DB retest hasn't been run could feel premature. Mitigation = "guidance now matches reality from SESSION_0152 evidence." Retest stays as a future follow-up note, not a blocker on status flip.

### Scope guard

Per `petey-plan.md` rule 5: any item surfaced during execution (PR #22 nudge, lineage v1 pickup, drift-register entry resolution, fourth allowlist surface) goes into Open decisions / blockers, not inline fixes. Lineage v1 reserved for SESSION_0201.

### Dirstarter implementation template

- **Docs read first:** Not applicable for `parseSort` — the pattern is already in-repo (SESSION_0198 + SESSION_0199 precedents). Runbook patches consult only in-repo runbook content (`schema-migration.md`, `prisma-workflow.md`).
- **Baseline pattern to extend:** `SORTABLE_*_COLUMNS = [...] as const` + URL-injection-safe parseSort gating (SESSION_0198/0199 in-repo precedent). Card-owns-type pattern (existing in `CourseCard` + `TechniqueCard`).
- **Custom delta:** New `_shared/sortable.ts` helper consolidates the in-repo pattern. searchTechniques allowlist is the third instance (rule-of-three lift trigger).
- **No-bypass proof:** Uses existing server-query layer, existing Prisma orderBy contract, existing card-owns-type convention. No new abstraction without three in-repo precedents.

## What landed

_(filled at bow-out)_

## Files touched

_(filled at bow-out)_

## Decisions resolved

_(filled at bow-out)_

## Open decisions / blockers

_(filled at bow-out)_

## Task log

- SESSION_0200_TASK_01 — Branch cut + parallel Cody implementation — _in-progress_.
- SESSION_0200_TASK_02 — Doug verification + PR opens + stale PR triage — _pending_.
- SESSION_0200_TASK_03 — Petey self-squash-merge + close push — _pending_.

## Review log

_(filled at bow-out)_

## Reflections

_(filled at bow-out)_

## Hostile close review

_(filled at bow-out)_

## ADR / ubiquitous-language check

_(filled at bow-out)_

## Full close evidence

_(filled at bow-out)_

## Next session

_(filled at bow-out — lineage v1 pickup + PR #22 diagnosis is the default per SESSION_0199 close)_

## Status

in-progress
