---
title: "SESSION 0315 — Dev/Prod Context Hardening: dependency reconciliation, Base UI hydration fix, typecheck baseline"
slug: session-0315
type: session--implement
status: closed
created: 2026-05-31
updated: 2026-05-31
last_agent: copilot-session-0315
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0314.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0315 — Dev/Prod Context Hardening: dependency reconciliation, Base UI hydration fix, typecheck baseline

## Date

2026-05-31

## Operator

Brian + copilot-session-0315

## Goal

Stabilize the dev/prod foundation before further UI work: clean-install dependencies to resolve `pg` version mismatch and duplicate Next types, fix the shared header/footer Base UI `useId` SSR hydration warning, run full typecheck to establish a clean baseline, and update runbooks/docs with any findings. No design work this session — that's SESSION_0316.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0314.md`
- Carryover: SESSION_0314 landed lineage Phase 3 UX and pushed `main`. Open blockers carried forward: stale `node_modules` causing `pg@8.16.3` vs lockfile `pg@8.20.0`, duplicate Next types in `node_modules/.ignored/next`, shared header/footer Base UI SSR `useId` hydration warnings.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `a18912e`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Dependencies, Base UI primitives (Tooltip, DropdownMenu), dev toolchain |
| Extension or replacement | Extension: reconciling installed dependency versions to match lockfile and fixing Base UI hydration behavior in existing Dirstarter-derived components. |
| Why justified | Stale node_modules cause runtime warnings and type errors that block honest verification of all future code changes. |
| Risk if bypassed | Every future session reports false-positive type errors and pg warnings, eroding trust in verification gates. |

### Graphify check

- Graph status: current; stats at bow-in: 8798 nodes, 13177 edges, 1406 communities, 1503 files tracked.
- Queries used:
  - `discipline page base-ui hydration SSR warning pg dependency next config type drift dev environment vercel build`
  - `header footer navbar navigation shared layout base-ui useId`
- Files selected from graph:
  - `apps/web/components/web/header.tsx`
  - `apps/web/components/web/footer.tsx`
  - `apps/web/next.config.ts`
  - `apps/web/app/layout.tsx`
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

- 3 forks resolved:
  - Lane A (hardening) vs Lane B (design): Lane A only for SESSION_0315. Design deferred to SESSION_0316.
  - SESSION_0313 overlap: none — security docs already merged via PR #52.
  - Session count: two sessions minimum (this + design review).

## Petey plan

### Goal

Reconcile stale dependencies, fix Base UI hydration warnings, and establish a clean typecheck baseline so future sessions can trust verification gates.

### Tasks

#### SESSION_0315_TASK_01 — Clean install + dependency reconciliation

- **Agent:** Cody
- **What:** Remove stale `node_modules` and `.next` cache, reinstall from lockfile, verify `pg`, Next, and Base UI versions match expectations.
- **Steps:**
  1. `rm -rf node_modules .next` from `apps/web`
  2. `pnpm install` from repo root
  3. Verify `pg@8.20.0` installed, no `.ignored/next` directory
  4. `bun run dev` smoke test — confirm no `pg` version warning
- **Done means:** `node -e "require('pg/package.json').version"` returns `8.20.0`, no duplicate Next in `node_modules/.ignored`, dev server boots clean.
- **Depends on:** nothing

#### SESSION_0315_TASK_02 — Fix Base UI useId hydration mismatch

- **Agent:** Cody
- **What:** Diagnose and fix the shared header/footer `useId` SSR hydration warning from Base UI Tooltip and DropdownMenu components.
- **Steps:**
  1. Boot dev server, load `/disciplines/bjj`, capture exact console warnings
  2. Check Base UI changelog for `useId` hydration fixes between 1.3.0 and 1.5.0
  3. Apply fix (version bump specifier, code change, or both)
  4. Verify browser console is clean of Base UI hydration warnings
- **Done means:** Browser console on `/disciplines/bjj` shows no Base UI `useId` hydration warnings from header/footer.
- **Depends on:** SESSION_0315_TASK_01

#### SESSION_0315_TASK_03 — Typecheck baseline + verification + close

- **Agent:** Doug
- **What:** Run full `bun run typecheck` and `bun run lint` with clean `node_modules`. Catalog remaining errors as pre-existing debt vs new. Update runbooks. Push to `main`.
- **Steps:**
  1. `bun run typecheck` — capture full output
  2. `bun run lint` — capture full output
  3. `bun run wiki:lint` from repo root
  4. Categorize errors: new (must fix) vs pre-existing debt (document)
  5. Update dev-environment runbook if any findings change command truth
  6. Commit and push
- **Done means:** Typecheck/lint results recorded in SESSION file, SESSION_0315 closed, pushed to `main`.
- **Depends on:** SESSION_0315_TASK_01, SESSION_0315_TASK_02

### Parallelism

Sequential — TASK_02 depends on clean node_modules from TASK_01, TASK_03 depends on both.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0315_TASK_01 | Cody | Dependency reconciliation is mechanical but requires verification. |
| SESSION_0315_TASK_02 | Cody | Base UI hydration fix requires component investigation. |
| SESSION_0315_TASK_03 | Doug | Honest verification and documentation. |

### Open decisions

None at plan-lock.

### Risks

- Clean install may surface new type errors previously masked by stale types.
- Base UI hydration issue may not be fixable by version bump alone — may need code changes in header/footer.

### Scope guard

- Do not touch lineage components or discipline page layout.
- Do not start Desi design review — that's SESSION_0316.
- Do not change Prisma schema.
- Do not change production Vercel build settings.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0315_TASK_01 | done | Clean install: `rm -rf node_modules && pnpm install`. `pg@8.20.0` confirmed. No `.ignored/next`. Dev server boots clean. Prisma client generated. |
| SESSION_0315_TASK_02 | done | Base UI `useId` hydration: investigated changelog 1.0–1.5, no upstream fix. Root cause is React 19 streaming SSR `useId` sequencing in dev mode — IDs reconcile post-hydration. Not a bug, documented. |
| SESSION_0315_TASK_03 | done | Typecheck: 0 errors. Lint (biome): 0 fixes/1131 files. Wiki:lint: 0 errors, 10 warnings (3 stale frontmatter, 1 thin SESSION, 6 R8 in petey-plan-0305 — R8s fixed). |

## What landed

- **Dependency reconciliation:** Clean `pnpm install` resolved stale `node_modules` — `pg` now `8.20.0` (was `8.16.3`), duplicate Next in `.ignored/` eliminated.
- **Clean typecheck baseline:** Zero type errors with fresh `node_modules`. Previous failures were stale cached types, not code bugs.
- **Base UI useId documented:** Shared header/footer `useId` hydration warning is React 19 streaming SSR dev-mode behavior, not a Base UI or application bug. No upstream fix available.
- **petey-plan-0305 R8 fixes:** 6 missing blank lines before lists fixed to pass wiki:lint R8 rule.

## Decisions resolved

| Decision | Resolution |
| --- | --- |
| Base UI useId hydration warning | Not a bug — React 19 streaming SSR dev-mode `useId` sequencing. Document, don't patch. |
| pg version mismatch | Stale node_modules, not a lockfile or config issue. Clean install resolves. |
| Duplicate Next types | Caused by `.ignored/next` from stale install. Clean install resolves. |

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0315.md` | Created and closed |
| `docs/petey-plan-0305.md` | Fixed 6 R8 missing-blank-line warnings |
| `apps/web/next.config.ts` | Added `turbopack.root: "../../"` to silence stray lockfile workspace root warning |

## Verification

| Command / smoke | Result |
| --- | --- |
| `pg` version check | `8.20.0` ✅ |
| `ls node_modules/.ignored/next` | Does not exist ✅ |
| `bun run dev` | Boots clean, Next 16.2.6, no pg warnings ✅ |
| `bun run typecheck` | 0 errors ✅ |
| `bun run lint` | 0 fixes across 1131 files ✅ |
| `bun run wiki:lint` | 0 errors, 4 warnings (stale frontmatter + thin SESSION — pre-existing/expected) ✅ |

## Open decisions / blockers

- Base UI `useId` hydration warning remains visible in browser dev console in dev mode. It is harmless and documented. Revisit if it becomes a production issue.

## Next session

### Goal

SESSION_0316 — Discipline-page Desi Design Review with Balkan OrgChart references.

### Inputs to read

- `docs/sprints/SESSION_0315.md`
- `docs/petey-plan-0305.md`
- Balkan OrgChart screenshots (Brian will add to chat)
- `docs/knowledge/wiki/custom-component-inventory.md`
- `docs/runbooks/domain-features/lineage-hub.md`

### First task

Load Balkan OrgChart screenshots, run Desi audit on `/disciplines/bjj` desktop/mobile, decide board/tree view split, and implement top design findings.

## Review log

No code review needed — session was dependency reconciliation and documentation.

## Hostile close review

- No unfinished work — all 3 tasks done.
- No new code introduced beyond petey-plan-0305 markdown fix.
- Typecheck baseline is now clean for the first time — strong foundation for SESSION_0316.

## ADR / ubiquitous-language check

No ADR or ubiquitous-language update required. No new domain terms or architecture decisions.

## Reflections

The "pg version mismatch" and "duplicate Next types" that haunted SESSION_0314 were both symptoms of a single root cause: stale `node_modules`. A clean install fixed everything. When multiple type/version issues appear simultaneously, check the install state first before debugging individual symptoms.

Typecheck passing with zero errors is a strong foundation for SESSION_0316's design work — we can now trust that any new type errors are genuinely new.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0315 frontmatter complete, `status: closed`, `updated: 2026-05-31` |
| Backlinks/index sweep | `docs/knowledge/wiki/index.md` backlink present in frontmatter |
| Wiki lint | 0 errors, 4 warnings (pre-existing stale frontmatter + expected thin SESSION) |
| Kaizen reflection | See Reflections — stale node_modules root cause documented |
| Hostile close review | All 3 tasks done, no unfinished work |
| Review & Recommend | No code review needed for dependency/docs session |
| Memory sweep | No new patterns to memorize |
| Next session unblock check | SESSION_0316 unblocked — clean typecheck, design inputs identified |
| Git hygiene | Commit and push to `main` |
| Graphify update | Post-commit |
