---
title: "SESSION 0212 — Base UI migration Phase 2c (Box)"
slug: session-0212
type: session--implement
status: closed-full
created: 2026-05-20
updated: 2026-05-20
last_agent: codex-session-0212
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0211.md
  - docs/sprints/petey-plan-0083.md
  - docs/knowledge/wiki/drift-register.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0212 — Base UI migration Phase 2c (Box)

## Date

2026-05-20

## Operator

Brian + codex-session-0212 (Petey orchestration, Cody implementation, Doug verification)

## Goal

Execute **Phase 2c** of `D-016`: migrate `apps/web/components/common/box.tsx` to upstream's `boxVariants`-only API and refactor every remaining `Box` / `BoxProps` consumer onto real elements that inline `boxVariants`.

## Bow-in notes

- **Previous session:** SESSION_0211 closed Phase 2b (Heading) and staged Phase 2c for Box.
- **Branch/worktree:** `main` at `c10a231`; worktree clean at bow-in; active repo is `/Users/brianscott/dev/ronin-dojo-app`.
- **Upstream pin:** `/Users/brianscott/Local Sites/DirStarter /dirstarter_template` @ `7e724b6`; read-only reference copy.
- **D-016 status:** Phase 1 + 2a + 2b complete; Phase 2c planned for this session.
- **FAILED_STEPS check:** FS-0001/FS-0014 (L1 primitive bypass), FS-0008 (primitive API spot-check), FS-0020 (Graphify-first discovery), and FS-0024 (Ronin cwd discipline) are in scope. Mitigation: Graphify ran before broad discovery; upstream + Ronin Box APIs were read directly; every command runs with repo `workdir` pinned to `/Users/brianscott/dev/ronin-dojo-app`.
- **Count discrepancy:** Prior handoff says "59 `<Box>` JSX call sites and 14 internal-primitive consumers." Graphify-first plus exact AST inspection over tracked `apps/web` TS/TSX files found 10 current `<Box>` JSX tags, 10 `Box` imports, 1 `BoxProps` import, and 3 existing `boxVariants` imports. Phase 2c stays one session; residual AST checks and typecheck are the source of truth.

## Graphify check

- **Graph status:** current enough for navigation at bow-in; `graphify stats` reported 6846 nodes / 10685 edges / 866 communities / 1297 files; repo `HEAD` was `c10a231`.
- **Queries used:**
  - `graphify query "D-016 Box boxVariants BoxProps Phase 2c"`
  - `graphify query --budget 4000 "graphify-repo-memory.md graphify memory CLI commands"`
  - `graphify query "opening.md ritual bow-in Petey graphify-repo-memory.md closing.md petey-plan.md"`
- **Files selected from graph:** `docs/sprints/SESSION_0211.md`, `docs/sprints/petey-plan-0083.md`, `docs/knowledge/wiki/drift-register.md`, `docs/runbooks/graphify-repo-memory.md`, `docs/rituals/opening.md`, `docs/rituals/closing.md`, `docs/protocols/petey-plan.md`, `apps/web/components/common/box.tsx`, upstream `dirstarter_template/components/common/box.tsx`.
- **Verification note:** Graphify selected the component cluster. Exact AST inspection over `apps/web` TS/TSX files is used for exhaustive current call-site counts and residual checks.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `components/common/box.tsx` from upstream `7e724b6`; common UI primitive API. |
| Extension or replacement | Replacement in place. Ronin drops the legacy `Box` wrapper and keeps upstream's exported `boxVariants`. |
| Why justified | Continuation of operator-directed `D-016` Radix -> Base UI primitive migration. Box still imports `radix-ui` Slot and blocks later dependency cleanup. |
| Risk if bypassed | `radix-ui` remains reachable through a common primitive; future primitive ports keep depending on a deleted upstream API. |

## Petey plan

### Goal

Ship `D-016` Phase 2c with Box aligned to upstream and all legacy `Box` / `BoxProps` consumers rewritten.

### Tasks

#### TASK_01 — Box primitive + consumer migration

- **Agent:** Cody
- **What:** Rewrite `apps/web/components/common/box.tsx` to upstream `boxVariants`-only shape and convert all current `Box` / `BoxProps` consumers to real elements using `boxVariants`.
- **Steps:**
  1. Replace the Ronin Box wrapper with upstream's `boxVariants` export.
  2. Rewrite each `<Box ...>` call site to the nearest semantic real element while preserving `hover`, `focus`, `focusWithin`, `className`, and pass-through props.
  3. Replace the lone `BoxProps` type consumer with real element props plus `VariantProps<typeof boxVariants>`.
  4. Re-run the AST residual check for `Box` JSX and `Box` / `BoxProps` imports.
- **Done means:** `box.tsx` no longer imports `radix-ui`; no `Box` / `BoxProps` exports remain; zero `<Box>` JSX tags and zero `Box` / `BoxProps` imports remain.
- **Depends on:** nothing.

#### TASK_02 — Verification

- **Agent:** Doug
- **What:** Prove the migration did not introduce type, lint, test, or build regressions.
- **Steps:**
  1. Run exact AST residual checks for Box.
  2. Run `pnpm --filter dirstarter typecheck`.
  3. Run `bun run lint` from `apps/web`.
  4. Run app tests and build at the current D-016 baseline.
  5. Run `bun run wiki:lint` after docs updates.
- **Done means:** Verification evidence is recorded with pass/fail counts and any pre-existing warnings called out.
- **Depends on:** TASK_01.

#### TASK_03 — Docs, ledger, and close

- **Agent:** Petey + Doug
- **What:** Mark `D-016` Phase 2c complete and update the Dirstarter uplift audit trail.
- **Steps:**
  1. Append a Phase 2c partial-port note to `apps/web/.dirstarter-upstream`.
  2. Tick `D-016` Phase 2c in `docs/knowledge/wiki/drift-register.md`.
  3. Update `docs/sprints/petey-plan-0083.md`, component inventory, lane ledger, project log, wiki index, and this SESSION file.
  4. Full-close, commit, push to `main`, and refresh Graphify after git hygiene.
- **Done means:** Session closes `closed-full`; project-log gate passes; commit is pushed to `origin/main`; Graphify stats refreshed or reported.
- **Depends on:** TASK_01 and TASK_02.

### Parallelism

- Explorer subagent `Nash` runs a read-only Box consumer migration map in parallel with Petey's local session setup.
- Implementation is small and touches shared primitive consumers, so Cody owns code edits locally rather than splitting overlapping write scopes.
- Doug verification runs after Cody's edits and before Petey closes docs.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Clear code execution with AST-backed mechanical residual checks. |
| TASK_02 | Doug | Independent verification and failure-mode review. |
| TASK_03 | Petey + Doug | Governance, ledger, and full-close evidence. |

### Open decisions

None. The local count discrepancy is handled by residual AST and typecheck gates.

### Risks

- Some consumers spread props into replaced elements; the replacement must keep prop and ref behavior compatible.
- `hover`, `focus`, and `focusWithin` are variant props, not DOM props, so every rewrite must remove them from the DOM spread and feed them into `boxVariants`.
- `Card` currently uses `BoxProps` as a type alias; replacing it incorrectly could weaken card prop compatibility.

### Scope guard

Do not migrate Badge, Card useRender API, Stack, Button, Tooltip, or popover-family primitives in this session. Only remove Box wrapper usage and keep Phase 3+ API changes queued.

### Dirstarter implementation template

- **Docs read first:** `docs/knowledge/wiki/dirstarter-component-inventory.md`, `docs/knowledge/wiki/drift-register.md` D-016, upstream `components/common/box.tsx`. Live Dirstarter docs are not required because upstream source is the primitive contract.
- **Baseline pattern to extend:** Dirstarter upstream `boxVariants` utility with real-element consumers.
- **Custom delta:** Ronin has current residual Box wrapper consumers across common primitives plus a few web/admin components.
- **No-bypass proof:** Existing primitive is replaced by upstream primitive shape; no scratch wrapper component is introduced.

## Pre-flight: Box

### 1. Existing component scan

- Graphify query for: `D-016 Box boxVariants BoxProps Phase 2c`.
- Found: `apps/web/components/common/box.tsx`; exact AST scan found 10 `<Box>` JSX tags, 10 `Box` imports, 1 `BoxProps` import, and 3 existing `boxVariants` imports.

### 2. L1 template scan (via Dirstarter Component Inventory)

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes.
- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs: not applicable; no live UI primitive docs page defines Box, so upstream source is the contract.
- Searched upstream exact file: `/Users/brianscott/Local Sites/DirStarter /dirstarter_template/components/common/box.tsx`.
- Closest L1 pattern: upstream `components/common/box.tsx`.
- **Primitive API spot-check:** Upstream exports `boxVariants` only. Variant props are `hover?: boolean`, `focus?: boolean`, and `focusWithin?: boolean`; the base class is `border outline-transparent transition duration-100 ease-out`. Legacy `Box` and `BoxProps` are absent.

### 3. Composition decision

- [x] Extending existing component: `apps/web/components/common/box.tsx`.
- [x] Composing existing components: `boxVariants` with native real elements.
- [ ] New component, no L1 match exists: not applicable.

### 4. Lane docs loaded

- [x] Prior SESSION "Next session" section read: SESSION_0211.
- [x] Wiki entries for target area read: `drift-register.md` D-016, `dirstarter-component-inventory.md`.
- [x] Runbook consulted: `graphify-repo-memory.md`.

### 5. Dev environment confirmed

- Dev server command: `pnpm --filter dirstarter dev`.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: local app via configured brand hosts if browser smoke becomes necessary; primary verification for this primitive is typecheck/lint/test/build.

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001, FS-0008, FS-0014, FS-0020, FS-0024.
- Mitigation acknowledged: yes. Graphify-first discovery ran, primitive API spot-check is recorded, and no new wrapper component is being created.

## What landed

- `apps/web/components/common/box.tsx` now matches upstream's `boxVariants`-only API and no longer imports `radix-ui` or exports `Box` / `BoxProps`.
- All current `Box` JSX consumers now apply `boxVariants` directly to the existing real element: input, textarea, Radix primitive root/trigger/item, `ExternalLink`, `Avatar`, and the CTA form field wrapper.
- `Button`, `Card`, and `Input` now consume `focusWithin` explicitly when their props allow `VariantProps<typeof boxVariants>`, preventing variant props from leaking into DOM spreads.
- `D-016`, `petey-plan-0083`, `.dirstarter-upstream`, `lane-ledger`, `dirstarter-component-inventory`, `project-log`, and wiki index were updated for Phase 2c.

## Decisions resolved

- **No replacement wrapper:** We did not add a new `Box` wrapper. The old `Box` used `Slot.Root` and did not render a DOM wrapper; applying `boxVariants` directly to the real element preserves the prior DOM shape while matching upstream's deleted-wrapper contract.
- **Count source of truth:** The SESSION_0211 handoff's 59-call-site count was treated as an estimate. Close proof uses exact AST residual counts after migration: 0 `<Box>` JSX tags, 0 `Box` imports, 0 `BoxProps` imports, and 12 `boxVariants` import consumers.
- **Formatter discipline:** After the initial mechanical pass, `bun run lint` fixed 2 files. The code was then reviewed in post-Biome shape and a second `bun run lint` pass reported no fixes, matching the operator preference to author patches in formatter-ready form.

## Files touched

| File/group | Note |
| --- | --- |
| `apps/web/components/common/box.tsx` | Rewritten to upstream `boxVariants`-only API; removed `radix-ui` Slot, `Box`, and `BoxProps`. |
| `apps/web/components/admin/row-checkbox.tsx` | Replaced `<Box hover focus>` with direct `boxVariants` on the checkbox input. |
| `apps/web/components/common/{checkbox,input,radio-group,select,switch,textarea}.tsx` | Inlined `boxVariants` on form/control primitives; preserved focus/hover/focusWithin behavior on the same rendered element. |
| `apps/web/components/common/{button,card}.tsx` | Kept existing `boxVariants` use and consumed `focusWithin` explicitly to avoid DOM prop leakage. |
| `apps/web/components/web/{cta-form,overlay-image,user-menu}.tsx` | Inlined `boxVariants` on the existing CTA wrapper, external link, and avatar trigger. |
| `apps/web/.dirstarter-upstream` | Phase 2c partial-port note appended. |
| `docs/knowledge/wiki/drift-register.md` | `D-016` Phase 2c ticked. |
| `docs/knowledge/wiki/dirstarter-component-inventory.md` | Box row updated to upstream `boxVariants`-only guidance. |
| `docs/sprints/petey-plan-0083.md` | Phase 2c marked complete and SESSION_0212 cross-linked. |
| `docs/architecture/uplift/lane-ledger.md` | L6 Phase 2c row appended. |
| `docs/protocols/project-log.md` | SESSION_0212 task/review entries added. |
| `docs/knowledge/wiki/index.md` | SESSION_0212 row added. |
| `docs/sprints/SESSION_0212.md` | This file. |

## Verification evidence

- Exact AST bow-in count — current tree before edits: 10 `<Box>` JSX tags, 10 `Box` imports, 1 `BoxProps` import, and 3 existing `boxVariants` imports across 1077 `apps/web` TS/TSX files.
- Exact AST residual check — passed after edits: 0 `<Box>` JSX tags, 0 `Box` imports, 0 `BoxProps` imports, and 12 `boxVariants` import consumers.
- `git diff --check` — passed.
- `pnpm --filter dirstarter typecheck` — passed after implementation and again after Biome formatting (`next typegen && tsc --noEmit --pretty false`).
- `bun run lint` from `apps/web` — first pass fixed 2 formatting-only files; second verifier pass passed with "No fixes applied" across 979 files.
- `bun test --isolate --path-ignore-patterns='e2e/**' --concurrency=1` from `apps/web` — passed 244/244 tests, 872 assertions across 51 files in 55.07s.
- `pnpm --filter dirstarter build` — passed. `prisma migrate deploy` had no pending migrations; Next build and `next-sitemap` completed. The known pre-existing Turbopack/NFT warning for `server/admin/storage/monitoring/queries.ts` appeared again.
- `bun run wiki:lint` — passed with 0 errors / 497 warnings. Warning profile matches the current baseline; touched `petey-plan-0083.md` still trips existing R8 table false positives on phase rows.

## Review log

### SESSION_0212_REVIEW_01 — Base UI migration Phase 2c

- **Reviewed tasks:** SESSION_0212_TASK_01, SESSION_0212_TASK_02, SESSION_0212_TASK_03.
- **Dirstarter docs check:** upstream `7e724b6` `components/common/box.tsx` directly compared against Ronin `apps/web/components/common/box.tsx`. Live `dirstarter.com` docs not required because upstream source is the primitive contract.
- **Sources:** Graphify query `D-016 Box boxVariants BoxProps Phase 2c`; upstream Box source; Ronin Box source; exact AST residual scripts; read-only explorer migration map; typecheck/lint/test/build/wiki-lint gates.
- **Verdict:** Pass. No P0/P1 findings. Box no longer depends on `radix-ui`, no deleted wrapper API remains, and consumers preserve prior slotted behavior by applying `boxVariants` directly to real elements.
- **Residual risk:** The pre-existing Turbopack/NFT storage monitoring warning still appears during build. It is unrelated to Box and should be fixed in a dedicated hardening follow-up rather than mixed into this primitive migration.

## Task log

- SESSION_0212_TASK_01 — complete.
- SESSION_0212_TASK_02 — complete.
- SESSION_0212_TASK_03 — complete.

## Open decisions / blockers

- **Residual follow-up:** Fix the long-standing Turbopack/NFT warning where `server/admin/storage/monitoring/queries.ts` traces through `next.config.ts` during `next build`. This is not a Phase 2c blocker but should be scheduled as hardening debt.

## Next session

SESSION_0213 = **Phase 3** of `D-016`: migrate Slot-only primitives with `asChild` consumer migration: `badge.tsx`, `card.tsx`, `stack.tsx`, `form.tsx` audit, and `button.tsx`.

- **Inputs to read:** `docs/sprints/SESSION_0212.md`, `docs/sprints/petey-plan-0083.md`, `docs/knowledge/wiki/drift-register.md` D-016, upstream `components/common/{badge,card,stack,form,button}.tsx`, Ronin `apps/web/components/common/{badge,card,stack,form,button}.tsx`.
- **First task:** Graphify query `D-016 Badge Card Stack Form Button asChild render Phase 3` and run exact AST counts of `asChild` consumers and imports before deciding whether to split Phase 3.
- **Separate hardening follow-up:** Schedule the persistent Turbopack/NFT storage monitoring warning as its own focused fix if it should interrupt D-016 sequencing.

## ADR / ubiquitous-language check

No ADR needed. No new domain terms introduced.

## Reflections

- The high-value move was treating the prior 59-site count as advisory and making the AST count the planning gate. Current tree had only 10 real JSX sites, so Phase 2c stayed bounded.
- The old `Box` API looked like a wrapper but behaved like a class-slotter. Preserving the rendered element was the right migration proof: it removed the abstraction without silently changing form controls, Radix triggers, or layout behavior.
- Nash's read-only map caught a useful adjacent issue: `focusWithin` was allowed by `Button`, `Card`, and `Input` props but not consumed. Fixing that kept the Box variant props honest without expanding into Phase 3 API changes.
- The persistent Turbopack/NFT warning deserves a focused fix, but mixing it into this primitive migration would blur verification and make the session less reviewable.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated frontmatter on SESSION_0212, petey-plan-0083, drift-register, dirstarter-component-inventory, lane-ledger, project-log, and wiki index. |
| Backlinks/index sweep | SESSION_0212 added to wiki index; petey-plan-0083 `pairs_with` now includes SESSION_0212; project-log and lane-ledger backlink SESSION_0212; dirstarter-component-inventory backlinks SESSION_0212. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors / 497 warnings. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | `SESSION_0212_REVIEW_01` appended to project-log and summarized above. |
| Review & Recommend | Next session section stages SESSION_0213 / D-016 Phase 3 and separates the Turbopack warning as hardening debt. |
| Memory sweep | No operator memory update needed; reusable facts are captured in D-016, petey-plan-0083, project-log, component inventory, and this SESSION. |
| Next session unblock check | Unblocked for Phase 3; Turbopack warning is a separate hardening follow-up, not a D-016 blocker. |
| Git hygiene | Pending final git status, commit, and push to `main`; final response will report commit hash. |
| Graphify update | Pending post-commit `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .`; final response will report stats. |

## Status

closed-full
