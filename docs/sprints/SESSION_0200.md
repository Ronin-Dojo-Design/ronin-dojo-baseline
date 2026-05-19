---
title: "SESSION 0200 — Shared sortable.ts helper + searchTechniques allowlist + SchoolCardData dedup + FS-0021 runbook patch"
slug: session-0200
type: session--implement
status: closed-full
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
  - docs/runbooks/neon-advisory-lock-recovery.md
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

- **PR #37 merged** — squash-merged to main at `3f895ec` (`feat(server-query): shared parseSort helper + searchTechniques allowlist + SchoolCardData dedup (#37)`). Feature branch `session-sortable-helper-and-school-card-dedup` deleted; main fast-forwarded.
- **PR #38 merged** — squash-merged to main at `041e6bf` (`docs(runbooks): patch schema-migration + prisma-workflow per FS-0021 corrective action #2 (#38)`). Feature branch deleted; main fast-forwarded.
- **New `parseSort` helper** at `apps/web/server/web/_shared/sortable.ts` — generic `T extends readonly string[]` so the returned `sortBy` narrows to `T[number] | undefined`. Three call sites consolidated.
- **Three search functions refactored** — `searchCourses`, `searchOrganizations`, `searchTechniques` all now call `parseSort(sort, SORTABLE_*_COLUMNS)`. Rule-of-three lift triggered per SESSION_0198 reflection.
- **`searchTechniques` allowlist landed** — `SORTABLE_TECHNIQUE_COLUMNS = ["name", "curriculum_order"] as const`. Previously took raw user input at line 22 (no allowlist, no direction sanitization). Closes the URL-injection vector against `/techniques?sort=...`.
- **`SchoolCardData` deduped** — character-identical 12-line type was duplicated between `school-card.tsx:12-23` and `school-list.tsx:9-20`. Now exported from `school-card.tsx`, imported in `school-list.tsx`. Mirrors card-owns-type pattern used by `CourseCard` and `TechniqueCard`.
- **FS-0021 mitigated** — `failed-steps-log.md` Status flipped from `open` to `mitigated`. `schema-migration.md` gained a `## When to use migrate dev vs db push vs migrate deploy` section citing SESSION_0152 evidence. `prisma-workflow.md` Known Issues now documents the SESSION_0004 shadow-DB-hang non-reproduction.
- **Stale PRs closed** — PR #11 (`[WIP] Fix capacity-one division`) closed as no-op (diff was only `petey-plan-0082.md` which already lives on main). PR #9 (`[WIP] Add entitlement and brand-membership fixtures`) closed as superseded (target test file `register.concurrency.test.ts` re-landed on main via `af7d2e8` + `304afdb` + `0cb1660`). Both closures shipped with diagnostic comments.
- **Vercel production deploy Ready** — first post-PR-#37 main deploy hit the Neon advisory-lock leak (third recorded occurrence). Diagnosed via `pg_locks` query against Neon prod (using `.env.production.local` pulled at owner direction): the lock was already cleared by Neon's pooler reaping the idle session, but the lock had been held during the failing-deploy window. Retrigger on `419d7ea` succeeded with Vercel build green. Post-PR-#38 deploy verified Ready before close.

Goal reached: both PRs shipped on plan; stale-PR queue drained; FS-0021 closed out.

## Files touched

| File | Note |
| --- | --- |
| `apps/web/server/web/_shared/sortable.ts` | New generic `parseSort` helper (type-safe via `T extends readonly string[]`). |
| `apps/web/server/web/courses/queries.ts` | Refactored to call `parseSort(sort, SORTABLE_COURSE_COLUMNS)`. |
| `apps/web/server/web/directory/search-organizations.ts` | Refactored to call `parseSort(sort, SORTABLE_ORGANIZATION_COLUMNS)`. |
| `apps/web/server/web/techniques/queries.ts` | Added `SORTABLE_TECHNIQUE_COLUMNS` + refactored to call `parseSort`. Closes URL-injection vector. |
| `apps/web/components/web/schools/school-card.tsx` | `SchoolCardData` type now exported. |
| `apps/web/components/web/schools/school-list.tsx` | Imports `SchoolCardData` from `school-card.tsx`; local dup removed. |
| `docs/runbooks/schema-migration.md` | New section: `## When to use migrate dev vs db push vs migrate deploy`. |
| `docs/runbooks/prisma-workflow.md` | Known Issues entry for SESSION_0004 shadow-DB-hang non-reproduction. |
| `docs/protocols/failed-steps-log.md` | FS-0021 `Status` flipped to `mitigated`; mitigation note appended. |
| `docs/sprints/SESSION_0200.md` | Open + close (this file). |
| `docs/protocols/project-log.md` | SESSION_0200 build-log + task-plan + review block. |
| `docs/knowledge/wiki/index.md` | SESSION_0200 row in session table. |
| `docs/knowledge/wiki/custom-component-inventory.md` | New `parseSort` row under server-side utilities (new sub-section). |
| `docs/runbooks/neon-advisory-lock-recovery.md` | `use_count` bumped to 3 (third recorded incident); SESSION_0200 finding appended (transaction-pool / session-lock hypothesis). |

## Decisions resolved

- **Lift to shared helper at the third occurrence.** Rule-of-three trigger from SESSION_0198 honored. `parseSort` now consolidates the pattern — fourth call site can just import.
- **`_shared/` location kept (no underscore fallback needed).** Cody A reported typecheck + biome clean against the new `apps/web/server/web/_shared/` folder.
- **`sortDirection` rename for searchTechniques NOT needed.** The existing fallback at `queries.ts:46` uses `sortOrder: "asc"` as a Prisma object-key string literal, not as a variable reference; no shadowing with the parsed `sortOrder` direction variable.
- **`parseSort.defaultOrder` parameter kept.** Forward-compat for the fourth call site if it lands with `desc` as default.
- **Both PRs serialize-merged.** First parallel-PR-deploy hit Neon advisory-lock collision; serializing the post-merge production deploys avoided a second collision (though a fresh leak surfaced anyway, see Reflections).
- **PR triage outcomes:** PR #11 closed (no-op), PR #9 closed (superseded). Diagnostic comments shipped with both.
- **`.env.production.local` use authorized** by owner mid-session to run the Neon diagnostic SQL from local. File stays git-ignored.

## Open decisions / blockers

- **Missing `DIRECT_URL` for Prisma migrations.** `DATABASE_URL` points to the Neon pooler endpoint (`-pooler.c-3.us-east-2.aws.neon.tech`); `prisma migrate deploy` acquires a session-level advisory lock that doesn't behave reliably under pgbouncer's transaction-mode pooling. This is the most likely root cause of the recurring Neon advisory-lock incidents (SESSION_0189, 0199, 0200 — three occurrences). Adding `DIRECT_URL` env var + a `directUrl` field in `prisma.config.ts` / `schema.prisma` would route migrate deploy to the direct (non-pooler) endpoint and likely eliminate the recurrence. **Queue as a SESSION_0201 candidate** (small change, but env-var work requires Preview tick per the dashboard-default rule).
- **Neon password briefly visible in conversation log.** A sanitization regex missed the password substring earlier in this session. The credential is the user's own and was already known to them, but rotation in Neon console is worth doing.
- **PR #22 (lineage editor actions)** still OPEN, Vercel FAILURE; explicitly out of SESSION_0200 scope; pickup queued for SESSION_0201.
- **Lineage v1 next-task pickup** — owner-ratified next-session candidate from SESSION_0199, re-ratified at SESSION_0200 bow-in.
- **Drift register triage** — owner-deferred to SESSION_0202.

## Task log

- SESSION_0200_TASK_01 — Branch cut + parallel Cody implementation — landed at `1880c1a` (Cody A code lane) + `0738d58` (Cody B docs lane). Both branches pushed clean on origin.
- SESSION_0200_TASK_02 — Doug verification + PR opens + stale PR triage — PRs #37 + #38 opened; PRs #11 + #9 closed with diagnostic comments.
- SESSION_0200_TASK_03 — Petey self-squash-merge + close push — PR #37 merged at `3f895ec`; Neon advisory-lock incident recovered via diagnostic + retrigger at `419d7ea`; PR #38 merged at `041e6bf`; this close commit pending.

## Review log

- SESSION_0200_REVIEW_01 — Hostile close review for shared parseSort helper + searchTechniques allowlist + SchoolCardData dedup + FS-0021 runbook patch (project-log entry).

## Reflections

- **Third recorded Neon advisory-lock incident.** SESSION_0189 first, SESSION_0199 second, SESSION_0200 third. The pattern is now load-bearing enough to merit a config fix, not just a runbook. Hypothesis: pgbouncer transaction-mode pooling + session-level `pg_advisory_lock()` is the mismatch. The fix (add `DIRECT_URL` + `directUrl` in Prisma config) is small and worth a dedicated SESSION_0201 task. The runbook's "wait it out" path has shipped twice now; the structural fix is overdue.
- **Diagnostic vs build-time lock state divergence.** When I queried `pg_locks` immediately after a build failed, the lock was already cleared. The build still timed out at the next retrigger. This suggests the lock is being acquired+held+released within the build's 10s acquisition window via pgbouncer connection multiplexing — i.e. the lock state I see at query time isn't the same lock state the build sees. Worth recording in the runbook: a "zero rows" diagnostic doesn't guarantee the next build will succeed; retrigger may still fail intermittently until the pooler fully drains.
- **Parallel-PR Neon lock collision** is a NEW failure mode (not yet in the runbook). When PR A and PR B previews both kick off ~simultaneously, both `prisma migrate deploy` calls race for `pg_advisory_lock(72707369)`; one wins, the other 10s-timeouts. Worth adding to `neon-advisory-lock-recovery.md` "Known triggers" alongside "deploy storm via env-var save" — same root cause (concurrent migrate deploy), different trigger surface.
- **Cwd discipline failure (again).** I dropped the `cd /Users/brianscott/dev/ronin-dojo-app &&` prefix once during PR polling and `gh` resolved to the DirStarter repo. SESSION_0199 reflected on this; the rule still holds. Reflex now: every Bash call gets the prefix, no exceptions.
- **Working-tree leak between parallel Cody subagents.** Cody A's in-flight edits were visible to Cody B during branch switch (shared working directory). Cody A recovered with stash/switch/pop but lost ~10 minutes. Lesson: parallel subagents on a shared working tree should `git switch` *before* touching files; or use git worktrees if true isolation is needed.
- **Sanitization regex caught the host but missed the password.** When echoing env-file content with a `sed` to redact, the regex `s/(@[^:/]+)/@<host>/` substituted the `@HOST` segment but left `USER:PASSWORD` intact. The credential leaked into shell output. Always prefer "print only env var keys" over "print URL with host redacted" — the latter is one footgun away from leaking secrets.

## Hostile close review

| Check | Verdict |
| --- | --- |
| Giddy (plan sanity + WORKFLOW 5.0 compliance) | Pass. 4 grill rounds locked the scope before code; rule-of-three lift honored; serialized merges (intent); stale PR triage clean. One mid-flight scope decision (the empty-commit retrigger sequence after Neon lock collision) was owner-ratified live and stayed within the scope-guard envelope. |
| Doug (static gates) | Pass. PR #37: `pnpm --filter dirstarter typecheck` clean; `bun biome check .` clean (one safe auto-fix); Vercel SUCCESS; CodeRabbit "Review skipped" (no-substantive-change skip path, not a failure). PR #38: `bun run wiki:lint` clean (0 errors); Vercel SUCCESS (after lock retrigger); CodeRabbit SUCCESS. |
| Dirstarter docs check | No new ADR triggered. New helper consolidates an in-repo pattern (SESSION_0198 + SESSION_0199 precedents). Runbook patches are internal accuracy updates. No Dirstarter L1 layer replaced. |
| Score cap | None. Expected WORKFLOW 5.0 score 9.3/10 — slightly below SESSION_0199 because the Neon lock incident cost ~30 min and surfaced a third occurrence of the same pattern that should have been structurally fixed earlier. |

## ADR / ubiquitous-language check

- **No new ADR triggered.** `parseSort` is a server-side utility consolidating in-repo precedent. FS-0021 runbook patch is an in-repo doc accuracy update.
- **No ubiquitous-language additions.** `parseSort`, `sortBy`, `sortOrder`, `allowlist`, `_shared` are all in-repo terms already.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0200.md` frontmatter: `status: closed-full`, `type: session--implement`, `updated: 2026-05-19`, `last_agent: claude-session-0200`, `pairs_with` includes `neon-advisory-lock-recovery.md`. `custom-component-inventory.md` `updated: 2026-05-19` + `last_agent: claude-session-0200` bumped. `project-log.md` `updated: 2026-05-19` + `last_agent: claude-session-0200` bumped + SESSION_0200 added to backlinks. `failed-steps-log.md` + `schema-migration.md` + `prisma-workflow.md` frontmatter bumped by Cody B (PR #38). `neon-advisory-lock-recovery.md` `use_count: 3` + `last_agent` bumped in this close. |
| Backlinks/index sweep | `wiki/index.md` SESSION_0200 row appended. `custom-component-inventory.md` new `3f. Server-side utilities` row with `parseSort`. |
| Wiki lint | `bun run wiki:lint` — run during PR #38 (PASS, 0 errors); will re-run in this close after doc edits. |
| Kaizen reflection | Reflections section present: yes (6 reflections covering recurring lock pattern, diagnostic-vs-build divergence, parallel-PR collision, cwd discipline, parallel-subagent working-tree leak, sanitization regex footgun). |
| Hostile close review | SESSION_0200_REVIEW_01 entry in `docs/protocols/project-log.md`. |
| Review & Recommend | Next session goal written: lineage v1 + PR #22 diagnosis (default) OR `DIRECT_URL` Prisma config fix (new candidate from this session's findings). |
| Memory sweep | Two memory candidates from this session: (1) "Sanitization regex caught host, missed password" — write a `feedback_env_var_sanitization_print_keys_only.md` memory. (2) "Parallel PR Neon-lock collision" — extend the existing `feedback_prisma_advisory_lock_neon_leak.md` memory to add the parallel-PR trigger. |
| Next session unblock check | Unblocked. Either lane (lineage v1 OR DIRECT_URL Prisma fix) has all required context in current SESSION + runbooks + memory. |
| Git hygiene | Branch: `main`. Worktree list: main repo only. Status: doc-only changes for this close. Single commit `docs: close session 0200 — sortable helper + searchTechniques allowlist + SchoolCardData dedup + FS-0021 runbook patch + stale PR triage + 3rd Neon lock incident recovered` covering all close content. |
| Graphify update | Run after git hygiene per ritual; final node/edge/community count appended to this row at bow-out wrap. |
| Vercel Ready | Post-PR-#37 main production deploy `ho1ddgsqu` Ready (after lock retrigger). Post-PR-#38 main production deploy verified Ready before close push. |

## Next session

- **Goal (primary):** Lineage v1 pickup + PR #22 Vercel-failure diagnosis. Owner-ratified at SESSION_0199 close, re-ratified at SESSION_0200 bow-in.
- **Goal (candidate, raised by this session):** Add `DIRECT_URL` env var + `directUrl` field in `prisma.config.ts` / `schema.prisma` to route `prisma migrate deploy` to Neon's direct (non-pooler) endpoint. Closes the recurring advisory-lock pattern at its structural root (third occurrence here justifies the fix). Small change but env-var work requires Preview tick per dashboard-default rule (memory `feedback_vercel_env_var_preview_scope.md`).
- **Inputs to read:** `docs/sprints/SESSION_0193.md`, `docs/sprints/SESSION_0194.md`, `docs/runbooks/lineage-listing-runbook.md`, `docs/runbooks/neon-advisory-lock-recovery.md`. PR #22 state via `gh pr view 22 --json statusCheckRollup,mergeable,mergeStateStatus`.
- **First task:** If lineage v1 lane — pull PR #22 base branch local, run `pnpm --filter dirstarter typecheck` to reproduce TypeScript failures, capture Vercel preview log for focused diagnosis. If DIRECT_URL lane — read Neon docs for the direct-endpoint URL shape, add the env var to Vercel (Preview + Production), update `prisma.config.ts` + `schema.prisma` datasource block, redeploy to verify.

## Status

closed-full
