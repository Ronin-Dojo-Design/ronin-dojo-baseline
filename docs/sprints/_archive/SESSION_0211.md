---
title: "SESSION 0211 — Base UI migration Phase 2b (Heading)"
slug: session-0211
type: session--implement
status: closed-full
created: 2026-05-20
updated: 2026-05-20
last_agent: codex-session-0211
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0210.md
  - docs/sprints/petey-plan-0083.md
  - docs/knowledge/wiki/drift-register.md
  - docs/architecture/uplift/lane-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0211 — Base UI migration Phase 2b (Heading)

## Date

2026-05-20

## Operator

Brian + codex-session-0211 (Petey orchestration, Cody implementation, Doug verification)

## Goal

Execute **Phase 2b** of `D-016`: migrate `apps/web/components/common/heading.tsx` to the upstream `useRender` + `render={...}` API, rewrite every legacy Heading `as={...}` call site to `render={...}`, and verify no Heading `asChild` consumers remain.

## Bow-in notes

- **Previous session:** SESSION_0210 closed Phase 2a (utils + AnimatedContainer). Next session handoff explicitly targets Phase 2b Heading migration.
- **Branch/worktree:** `main` at `a65c83a`; worktree clean at bow-in; only active worktree is `/Users/brianscott/dev/ronin-dojo-app`.
- **Upstream pin:** `/Users/brianscott/Local Sites/DirStarter /dirstarter_template` @ `7e724b6`; read-only reference copy.
- **D-016 status:** Phase 1 + 2a complete; Phase 2b planned for this session.
- **FAILED_STEPS check:** FS-0001/FS-0014 (L1 primitive bypass), FS-0008 (primitive API spot-check), FS-0020 (Graphify-first discovery), and FS-0024 (Ronin cwd discipline) are in scope. Mitigation: Graphify ran before broad discovery; upstream + Ronin Heading APIs were read directly; every mutating command runs with repo `workdir` pinned to `/Users/brianscott/dev/ronin-dojo-app`.
- **Count discrepancy:** Prior handoff says "140 `<Hn as=...>` call sites." Graphify-first plus exact AST inspection found 126 files importing Heading primitives, 213 total Heading JSX tags, 61 current legacy `as=` usages, 0 `asChild` usages, and 0 existing `render=` usages. Implementation will treat the AST residual check and typecheck as the source of truth.

## Graphify check

- **Graph status:** current enough for navigation at bow-in; `graphify stats` reported 6799 nodes / 10824 edges / 825 communities / 1290 files; repo `HEAD` was `a65c83a`.
- **Queries used:**
  - `graphify query "D-016 heading useRender render asChild Phase 2b" --budget 3000`
  - `graphify query "components common heading H1 H2 H3 H4 H5 H6 as render" --budget 3000`
  - `graphify query "custom component inventory heading dirstarter component inventory" --budget 2400`
- **Files selected from graph:** `apps/web/components/common/heading.tsx`, upstream `dirstarter_template/components/common/heading.tsx`, `docs/sprints/petey-plan-0083.md`, `docs/knowledge/wiki/drift-register.md`, `docs/knowledge/wiki/dirstarter-component-inventory.md`, `docs/knowledge/wiki/custom-component-inventory.md`, `docs/architecture/uplift/lane-ledger.md`, `docs/protocols/project-log.md`.
- **Verification note:** Graphify selected the component cluster. Exact AST inspection over tracked `apps/web` TS/TSX files is used for exhaustive call-site count and residual checks.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `components/common/heading.tsx` from upstream `7e724b6`, including `@base-ui/react/use-render` consumer API. |
| Extension or replacement | Replacement in place. Ronin keeps the exported `Heading`, `H1`-`H6`, and `headingVariants` styling role, but drops legacy `as`/`asChild` in favor of upstream `render={...}`. |
| Why justified | Continuation of operator-directed `D-016` Radix -> Base UI primitive migration. Heading blocks later primitive cleanup because it still imports `radix-ui` Slot and exposes the old polymorphic API. |
| Risk if bypassed | `radix-ui` remains reachable through a common primitive; later Phase 8 dependency cleanup cannot remove `radix-ui`; consumer API drift keeps accumulating. |

## Petey plan

### Goal

Ship `D-016` Phase 2b with Heading aligned to upstream and all legacy Heading `as` call sites rewritten.

### Tasks

#### TASK_01 — Heading primitive + consumer migration

- **Agent:** Cody
- **What:** Rewrite `apps/web/components/common/heading.tsx` to upstream `useRender` shape and convert every legacy `as="tag"` Heading call site to `render={...}` while preserving sizing, classes, children, and non-Heading props.
- **Steps:**
  1. Update `heading.tsx` from upstream, preserving Ronin's existing public exports.
  2. Run an AST-backed transform across Heading consumers that imports from `~/components/common/heading`.
  3. Re-run the AST residual check for `as`, `asChild`, and `render` counts.
- **Done means:** `heading.tsx` imports `@base-ui/react/use-render`; no Heading JSX tags pass `as` or `asChild`; former `as` call sites pass `render={...}`.
- **Depends on:** nothing.

#### TASK_02 — Verification

- **Agent:** Doug
- **What:** Prove the migration did not introduce type or lint regressions.
- **Steps:**
  1. Run `pnpm --filter dirstarter typecheck`.
  2. Run `bun run lint`.
  3. Run app tests and build at the current D-016 baseline unless an earlier verifier exposes a blocking failure.
  4. Run `bun run wiki:lint` after docs updates.
- **Done means:** Verification evidence is recorded with pass/fail counts and any pre-existing failures called out.
- **Depends on:** TASK_01.

#### TASK_03 — Docs, ledger, and close

- **Agent:** Petey + Doug
- **What:** Mark `D-016` Phase 2b complete and update the Dirstarter uplift audit trail.
- **Steps:**
  1. Append a Phase 2b partial-port note to `apps/web/.dirstarter-upstream`.
  2. Tick `D-016` Phase 2b in `docs/knowledge/wiki/drift-register.md`.
  3. Append L6 Phase 2b to `docs/architecture/uplift/lane-ledger.md`.
  4. Update `docs/protocols/project-log.md`, wiki index, and this SESSION file.
  5. Full-close, commit, push to `main`, and refresh Graphify after git hygiene.
- **Done means:** Session closes `closed-full`; project-log gate passes; commit is pushed to `origin/main`; Graphify stats refreshed or reported.
- **Depends on:** TASK_01 and TASK_02.

### Parallelism

- Explorer subagent `Linnaeus` runs a read-only Heading consumer inventory in parallel with Petey's local session setup.
- Implementation touches one shared primitive and many consumer files, so Cody owns the code edits locally rather than splitting overlapping write scopes.
- Doug verification can run after Cody's transform and before Petey closes docs.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Clear code execution with AST-backed mechanical rewrite. |
| TASK_02 | Doug | Independent verification and failure-mode review. |
| TASK_03 | Petey + Doug | Governance, ledger, and close evidence. |

### Open decisions

None. The local count discrepancy is handled by exhaustive residual checks.

### Risks

- `render` cases that use `strong` are semantically valid but differ from heading tags; preserve them exactly rather than normalizing.
- `Heading` base component call sites with both `size` and former `as` must keep the visual `size` while changing only the rendered tag.
- Typecheck is the hard gate because removing `as` from `HeadingProps` should expose any missed legacy consumer.

### Scope guard

Do not migrate `Box`, `Button`, `Stack`, `Card`, Tooltip, or popover-family primitives in this session. Any adjacent Base UI drift stays in `Open decisions / blockers`.

### Dirstarter implementation template

- **Docs read first:** `docs/knowledge/wiki/dirstarter-component-inventory.md`, `docs/knowledge/wiki/dirstarter-docs-inventory.md` (no live UI primitive docs page; upstream source is the contract), upstream `components/common/heading.tsx`.
- **Baseline pattern to extend:** Dirstarter upstream `useRender` Heading primitive with `render={...}` consumer API.
- **Custom delta:** Ronin consumer tree is larger than upstream; migration is mostly call-site compatibility.
- **No-bypass proof:** Existing primitive is replaced by upstream primitive shape; no scratch typography component or raw heading abstraction added.

## Pre-flight: Heading

### 1. Existing component scan

- Graphify query for: `components common heading H1 H2 H3 H4 H5 H6 as render`.
- Found: `apps/web/components/common/heading.tsx`; 126 import files from exact AST scan; 213 Heading JSX tags; 61 legacy `as` usages; 0 `asChild` usages.

### 2. L1 template scan (via Dirstarter Component Inventory)

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes.
- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs: yes; live Dirstarter docs do not define common Heading primitive API, so upstream source is the contract.
- Searched upstream exact file: `/Users/brianscott/Local Sites/DirStarter /dirstarter_template/components/common/heading.tsx`.
- Closest L1 pattern: upstream `components/common/heading.tsx`.
- **Primitive API spot-check:** Upstream `HeadingProps = Omit<useRender.ComponentProps<"h2">, "size"> & VariantProps<typeof headingVariants>`. Public props include `render`, `className`, standard heading props, and `size: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"`. Legacy `as` and `asChild` are absent. Default tag is `size ?? "h2"`. Exports remain `Heading`, `H1`, `H2`, `H3`, `H4`, `H5`, `H6`.

### 3. Composition decision

- [x] Extending existing component: `apps/web/components/common/heading.tsx`.
- [x] Composing existing components: `useRender` from `@base-ui/react/use-render` and `cva`/`cx` from `~/lib/utils`.
- [ ] New component, no L1 match exists: not applicable.

### 4. Lane docs loaded

- [x] Prior SESSION "Next session" section read: SESSION_0210.
- [x] Wiki entries for target area read: `drift-register.md` D-016, `dirstarter-component-inventory.md`, `custom-component-inventory.md`.
- [x] Runbook consulted: `graphify-repo-memory.md`.

### 5. Dev environment confirmed

- Dev server command: `pnpm --filter dirstarter dev`.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: local app via configured brand hosts if browser smoke becomes necessary; primary verification for this primitive is typecheck/lint/test/build.

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0008, FS-0014, FS-0020, FS-0024.
- Mitigation acknowledged: yes. Graphify-first discovery ran, primitive API spot-check is recorded, and no new raw/scratch typography component is being created.

## What landed

- `apps/web/components/common/heading.tsx` now matches upstream's `useRender` API shape and no longer imports `radix-ui` or exposes `as`/`asChild`.
- Legacy rendered-tag overrides were migrated to function-form `render` callbacks. This preserves the prior rendered element (`h1`/`h2`/`h3`/`h4`/`h5`/`h6`/`strong`) while keeping the visual `size` prop unchanged.
- The indirect `IntroTitle` wrapper path was covered: its single remaining `as` consumer on `/advertise` now uses `render`.
- `D-016`, `petey-plan-0083`, `.dirstarter-upstream`, `lane-ledger`, `dirstarter-component-inventory`, `project-log`, and wiki index were updated for Phase 2b.

## Decisions resolved

- **Count source of truth:** The SESSION_0210 handoff's 140-call-site count was treated as an estimate. Close proof uses exact AST residual counts after migration: 211 direct Heading JSX tags, 60 `IntroTitle` wrapper tags, 0 `as`, 0 `asChild`, 61 direct Heading render callbacks, and 1 `IntroTitle` render callback.
- **Render callback form:** Initial element-form `render={<h3 />}` typechecked but failed Biome `useHeadingContent`. Function-form callbacks (`render={(props) => <h3 {...props}>{props.children}</h3>}`) are now the local pattern for Heading rendered-tag overrides because the content is explicit to both React and Biome.

## Files touched

| File/group | Note |
| --- | --- |
| `apps/web/components/common/heading.tsx` | Rewritten to upstream `useRender` API; removed `radix-ui` Slot and `as`/`asChild` props. |
| 44 Heading consumer files under `apps/web/` | Legacy `as="tag"` overrides rewritten to function-form `render` callbacks. |
| `apps/web/.dirstarter-upstream` | Phase 2b partial-port note appended. |
| `docs/knowledge/wiki/drift-register.md` | `D-016` Phase 2b ticked. |
| `docs/knowledge/wiki/dirstarter-component-inventory.md` | Heading row updated from legacy `as` API to Base UI `render` API. |
| `docs/sprints/petey-plan-0083.md` | Phase 2b marked complete and SESSION_0211 cross-linked. |
| `docs/architecture/uplift/lane-ledger.md` | L6 Phase 2b row appended. |
| `docs/protocols/project-log.md` | SESSION_0211 task/review entries added. |
| `docs/knowledge/wiki/index.md` | SESSION_0211 row added. |
| `docs/sprints/SESSION_0211.md` | This file. |

## Verification evidence

- Exact AST residual check — passed: 211 direct Heading JSX tags, 0 `as`, 0 `asChild`, 61 `render`; 60 `IntroTitle` JSX tags, 0 `as`, 0 `asChild`, 1 `render`.
- `git diff --check` — passed.
- `pnpm --filter dirstarter typecheck` — passed (`next typegen && tsc --noEmit --pretty false`).
- `bun run lint` from `apps/web` — passed after formatting 44 transformed files; 979 files checked.
- `bun test --isolate --path-ignore-patterns='e2e/**' --concurrency=1` from `apps/web` — passed 244/244 tests, 872 assertions across 51 files in 49.57s.
- `pnpm --filter dirstarter build` — passed. `prisma migrate deploy` had no pending migrations; Next build and `next-sitemap` completed. The known pre-existing Turbopack/NFT warning for `server/admin/storage/monitoring/queries.ts` appeared again.
- `bun run wiki:lint` — passed with 0 errors / 497 warnings. Warning profile matches current baseline; touched `petey-plan-0083.md` still trips R8 table false positives on phase rows.

## Review log

### SESSION_0211_REVIEW_01 — Base UI migration Phase 2b

- **Reviewed tasks:** SESSION_0211_TASK_01, SESSION_0211_TASK_02, SESSION_0211_TASK_03.
- **Dirstarter docs check:** upstream `7e724b6` `components/common/heading.tsx` directly compared against Ronin `apps/web/components/common/heading.tsx`. Live `dirstarter.com` docs not required because upstream source is the primitive contract.
- **Verdict:** Pass. No P0/P1 findings. Heading no longer depends on `radix-ui`, no Heading/IntroTitle legacy `as` or `asChild` props remain, and typecheck/lint/test/build are green at the D-016 baseline.
- **Residual risk:** Phase 2c remains the next call-site-heavy primitive migration. `radix-ui` stays installed until later D-016 phases remove remaining primitive consumers.

## Task log

- SESSION_0211_TASK_01 — complete.
- SESSION_0211_TASK_02 — complete.
- SESSION_0211_TASK_03 — complete.

## Open decisions / blockers

None.

## Reflections

- The highest-value guard this session was removing `as` from the type surface early and letting typecheck find the indirect wrapper case. `IntroTitle` was outside the direct Heading import residual query, and the compiler caught it cleanly.
- The upstream element-form render style (`render={<h3 />}`) is not directly compatible with this repo's Biome a11y rule when used on headings. Function-form render callbacks are noisier but better proof: they preserve Base UI composition and make children explicit.
- Graphify was useful for selecting the component cluster, but exact AST checks were the real close gate. The prior "140" handoff estimate did not match the current tree, and that was fine because the verifier was residual-state based.

## Next session

SESSION_0212 = **Phase 2c** of `D-016`: `apps/web/components/common/box.tsx` migration. Upstream deletes the `Box` component and leaves only `boxVariants`; refactor 59 `<Box>` JSX call sites and 14 internal-primitive consumers to inline `boxVariants` on real elements.

- **Inputs to read:** `docs/sprints/SESSION_0211.md`, `docs/sprints/petey-plan-0083.md`, `docs/knowledge/wiki/drift-register.md` D-016, upstream `components/common/box.tsx`, Ronin `apps/web/components/common/box.tsx`.
- **First task:** Graphify query `D-016 Box boxVariants BoxProps Phase 2c` and run an exact AST count of `<Box>` JSX plus `Box`/`BoxProps` imports before deciding whether to split Phase 2c.

## ADR / ubiquitous-language check

No ADR needed. No new domain terms introduced.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated frontmatter on SESSION_0211, petey-plan-0083, drift-register, dirstarter-component-inventory, lane-ledger, project-log, and wiki index. |
| Backlinks/index sweep | SESSION_0211 added to wiki index; petey-plan-0083 `pairs_with` now includes SESSION_0211; SESSION_0211 links D-016, lane-ledger, project-log, and petey-plan-0083. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors / 497 warnings. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | `SESSION_0211_REVIEW_01` appended to project-log and summarized above. |
| Review & Recommend | Next session section stages SESSION_0212 / D-016 Phase 2c. |
| Memory sweep | No operator memory update needed; the reusable pattern is documented in D-016, petey-plan-0083, project-log, and dirstarter-component-inventory. |
| Next session unblock check | Unblocked; Phase 2c starts from Box source and AST count. |
| Git hygiene | Pending final git status, commit, and push to `main`; final response will report commit hash. |
| Graphify update | Pending post-commit `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .`; final response will report stats. |

## Status

closed-full
