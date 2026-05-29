---
title: "SESSION 0032.5 - Full typecheck debt hardening"
slug: session-0032-5
type: session
status: closed-full
created: 2026-05-02
updated: 2026-05-02
last_agent: codex-session-0032-5
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0032.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/protocols/cody-preflight.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0032.5 - Full typecheck debt hardening

## Date

2026-05-02.

## Operator

Brian Scott + Codex playing Petey orchestrator, then Cody; Giddy owns
worktree/branch strategy; Doug owns verification.

## Status

closed-full

## Goal

Resolve `SESSION_0032_FINDING_01`: make the full app
`bunx tsc --noEmit --pretty false` pass before opening SESSION_0033 enrollment,
family, waiver, and trial lifecycle work.

## Bow-in audit

- Previous session: `docs/sprints/SESSION_0032.md`, status `closed-full`,
  landed attendance/check-in write surface on commit `0886361`.

- Owner instruction: preempt SESSION_0033 with full typecheck debt, pause after
  the debt is handled, then ask whether to bow out/close here or continue into
  SESSION_0033.

- Worktree: `/Users/brianscott/dev/wt-qa-hardening` on
  `session-0032-typecheck-debt`, forked from `session-0032-attendance` at
  `0886361`.
- FAILED_STEPS: FS-0006, FS-0007, and FS-0008 mitigations remain in force.
  This session records Petey plan and TASK_PLAN_LOG entries before code edits.

- Drift register: D-005 remains open but is not directly touched; this is a
  compile-safety pass, not a cache-strategy pass.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Next App Router generated types, content collections generation, Better Auth session typing, Prisma generated client typing, S3/media service typing |
| Extension or replacement | Extension/repair. Fix local typing assumptions to match the existing Dirstarter-derived app structure and generated-code conventions. |
| Why justified | Full typecheck debt blocks safe broad refactors and should be clean before the SESSION_0033 school-ops lifecycle slice adds more contracts. |
| Risk if bypassed | New enrollment/family/waiver work would land on top of noisy compiler debt, hiding real regressions and weakening Doug's verification gate. |

## Petey plan

### One task for this session

Clear the full TypeScript compile baseline without starting SESSION_0033
product work.

### Why this task now

SESSION_0032 closed with full typecheck debt as the loudest residual quality
issue, and the owner explicitly asked to take it first.

### Inputs needed

- `docs/sprints/SESSION_0032.md`
- `docs/protocols/WORKFLOW_5.0.md`
- `docs/protocols/cody-preflight.md`
- `docs/protocols/project-log.md`
- `apps/web/tsconfig.json`
- `apps/web/prisma/schema.prisma`
- Typecheck output from `bunx tsc --noEmit --pretty false`

### Steps

1. Create QA-hardening worktree from the SESSION_0032 commit.
2. Bootstrap the worktree (`bun install`, `.env`, Prisma generate).
3. Run full typecheck and categorize errors.
4. Use two bounded read-only explorer subagents:
   - Generated Next/content-collections type cluster.
   - Auth/passport/env/S3/media/Prisma-query cluster.
5. Cody applies the minimum code/type fixes needed to make full typecheck pass.
6. Doug reruns full typecheck plus targeted verification relevant to touched
   files.
7. Pause for owner decision before SESSION_0033 begins.

### Open decisions

None for the debt pass. Do not begin SESSION_0033 until owner confirms.

### Done means

`bunx tsc --noEmit --pretty false` passes in `apps/web`, with touched files
listed and verification recorded. SESSION_0033 product work remains untouched.

## Task log

| Task ID | Status |
| --- | --- |
| SESSION_0032_5_TASK_01 | landed |
| SESSION_0032_5_TASK_02 | landed |

## Pre-flight: Typecheck debt remediation

- **Petey invocation:** this SESSION file contains a Petey plan and task IDs.
- **Scope:** no new product feature, no schema migration, no new UI surface.
- **Existing source scan:** initial typecheck errors span App Router generated
  global types, content-collections generated imports, Better Auth user role
  typing/API assumptions, passport enum drift, DirectoryProfile payload drift,
  S3/media env typing, and one Prisma `include` stack-depth issue.

- **Authorization/data boundary:** this pass must not relax auth checks or
  brand/org predicates. Any auth-related edit is typing alignment only.

- **FAILED_STEPS check:** FS-0006/FS-0007/FS-0008 mitigated; no inferred Prisma
  enum spelling is allowed without direct `schema.prisma` spot-check.

## Work in progress

Initial full typecheck failed on pre-existing baseline debt:

- Missing Next generated globals: `PageProps`, `LayoutProps`, `RouteContext`.
- Missing content-collections generated module declarations.
- Better Auth session `user.role` and one-time-token API type drift.
- Passport/Directory enum drift: `NON_BINARY` vs `NONBINARY`, `PRIVATE` vs
  schema-backed visibility values.

- DirectoryProfile payload drift: missing `coverPhotoUrl` and `videoIntroUrl`.
- Env-dependent typing in `lib/auth.ts`, `lib/media.ts`, and `services/s3.ts`.
- Prisma `ToolInclude` excessive stack-depth in `server/web/tools/queries.ts`.

## What landed

- Added `apps/web` `typecheck` script: `next typegen && tsc --noEmit --pretty
  false`. This generates Next App Router globals and content-collections types
  before raw TypeScript runs.

- Aligned Better Auth typing with runtime configuration: added
  `BETTER_AUTH_SECRET`, gated optional Google provider config, and preserved
  plugin tuple inference for admin role and one-time-token APIs.

- Aligned Passport/Directory literals with `schema.prisma`:
  `Gender.NONBINARY` and `DirectoryVisibility.HIDDEN`.
- Added the missing `coverPhotoUrl` and `videoIntroUrl` fields to the
  DirectoryProfile select payload used by `/me`.

- Normalized `Post` typing to the `content-collections` module alias.
- Replaced optional env values in S3/media code with explicit runtime guards or
  conditional AWS credentials.

- Narrowed public tool query argument types so Prisma does not compare the full
  `include` surface when a query always supplies its own `select`.

## Files touched

| Path | Note |
| --- | --- |
| `apps/web/package.json` | Added generated `typecheck` script. |
| `apps/web/tsconfig.json` | Added generated content-collections declarations to include list. |
| `apps/web/lib/auth.ts` | Better Auth secret, optional Google config, plugin tuple inference. |
| `apps/web/lib/media.ts` | Definite ScreenshotOne/S3 env values at use sites. |
| `apps/web/services/s3.ts` | Conditional AWS credentials object. |
| `apps/web/lib/structured-data.ts` | Use `content-collections` alias for `Post`. |
| `apps/web/server/web/passport/{payloads,schemas}.ts` | Schema literal and payload select alignment. |
| `apps/web/server/web/tools/queries.ts` | Narrow public query args to avoid Prisma stack-depth type comparison. |
| `docs/sprints/SESSION_0032_5.md` | Bow-in, plan, verification, pause gate. |
| `docs/protocols/project-log.md` | Task ledger for SESSION_0032.5. |
| `docs/protocols/petey-plan.md` | Added Dirstarter-first planning template and efficiency/no-regression planning rule. |
| `docs/protocols/hostile-close-review.md` | Tightened plan-sanity and Kaizen triage questions for Dirstarter-first planning and process efficiency. |
| `docs/knowledge/wiki/index.md` | SESSION_0032.5 index row. |

## Verification

| Command | Result |
| --- | --- |
| `bun install` | passed; generated Prisma client in fresh QA worktree |
| `bun biome check --write ...touched files` | passed; fixed 2 files |
| `bun run typecheck` | passed (`next typegen && tsc --noEmit --pretty false`) |
| `bunx tsc --noEmit --pretty false` | passed after typegen generated ignored artifacts |
| `bunx prisma validate --schema prisma/schema.prisma` | passed |
| `bun test server/web/schedule/ server/web/attendance/` | 22 pass / 0 fail |
| `bun scripts/smoke-attendance.ts` | passed full allow/deny/idempotency matrix |
| `bun run wiki:lint` | passed; 127 markdown files |
| `git diff --check` | passed |

## Findings

- `next typegen` emits a non-blocking content-collections deprecation warning:
  the collection relies on the package's implicit `content` property. This does
  not fail typecheck; it is a future cleanup candidate.

- Including all generated `.next/types/**/*.ts` despite `exclude: [".next"]`
  surfaces a larger typed-routes/link-validation debt class. This session did
  not take that on because the handoff finding was raw `tsc` baseline debt and
  SESSION_0033 is waiting on that specific compiler gate. Treat typed-routes
  validator cleanup as a separate QA-hardening candidate if/when `next build`
  becomes the gate.

## Pause status

Full typecheck debt from SESSION_0032_FINDING_01 is handled. Product work for
SESSION_0033 has not started.

## Decisions resolved

- Owner chose to bow out and close SESSION_0032.5 here instead of running into
  SESSION_0033.

- `SESSION_0032_FINDING_01` is addressed by this session. The clean command is
  now `bun run typecheck`, which runs `next typegen` before TypeScript so the
  ignored generated artifacts exist. The exact raw
  `bunx tsc --noEmit --pretty false` also passes after typegen.
- Planning protocol improvement landed: Petey plans that touch a
  Dirstarter-owned layer must use live `dirstarter.com/docs` pages as the
  implementation template before Cody starts. Hostile close still checks those
  same docs after the work lands.

- Kaizen efficiency improvement landed: planning/review protocols now require
  process simplifications to preserve proof, security, Dirstarter alignment,
  and workflow honesty before they are accepted.

## Open decisions / blockers

- No blocker remains for the full `apps/web` generated typecheck gate.
- The pre-staged `docs/sprints/SESSION_0033.md` exists on the pushed
  `session-0032-attendance` branch at commit `d1981fa`, not in this
  `session-0032-typecheck-debt` worktree. Do not duplicate it here.
- PR #1 for SESSION_0032 is open at
  `https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/1`. Start the
  fresh SESSION_0033 branch from `main` after PR #1 merges, or from
  `session-0032-attendance` if the PR is still open and owner approves.
- Future QA-hardening candidate: full typed-routes validator cleanup if/when
  `next build` or `.next/types/validator.ts` becomes the gate. That is separate
  from the raw generated typecheck debt closed here.

## Next session

- **Goal:** Fresh bow-in for SESSION_0033: Program enrollments, family groups,
  waivers, and trial lifecycle.

- **Inputs to read:** the pre-staged `docs/sprints/SESSION_0033.md` from
  `session-0032-attendance` commit `d1981fa`, `docs/protocols/petey-plan.md`,
  `docs/protocols/cody-preflight.md`,
  `docs/architecture/security-privacy-payments-monitoring-plan.md`,
  `docs/architecture/decisions/0011-entitlement-first-commerce.md`.
- **First task:** update SESSION_0033 OD-1 to reflect that
  `SESSION_0032_FINDING_01` is resolved by SESSION_0032.5, then fill
  `## Petey plan` using the new Dirstarter implementation template before any
  code.

## Hostile close review

**Reviewed tasks:** SESSION_0032_5_TASK_01 and SESSION_0032_5_TASK_02.

**Score: 10.0/10** - no hard caps triggered.

**Dirstarter docs check:** live docs checked.

**Sources:** `https://dirstarter.com/docs/codebase/structure`,
`https://dirstarter.com/docs/database/prisma`,
`https://dirstarter.com/docs/authentication`,
`https://dirstarter.com/docs/environment-setup`,
`https://dirstarter.com/docs/integrations/media`.

**Verdict:** The implementation extends the purchased Dirstarter baseline
instead of bypassing it: modular `server/web/*` and `services/*` organization,
Prisma generated typing, Better Auth plugin/config typing, type-safe env
validation, and media/S3 integration assumptions are all preserved. Verification
is credible for the stated gate: generated typecheck, raw TypeScript after
typegen, Prisma validate, schedule+attendance regressions, attendance smoke,
wiki lint, and diff check all pass. The session did not begin SESSION_0033
product work.

| Category | Weight | Score | Note |
| --- | ---: | ---: | --- |
| Dirstarter alignment | 2.5 | 2.5 | Live docs checked; fixes align with Dirstarter's modular project, Prisma, Better Auth, env, and media patterns. |
| Data and architecture integrity | 2.0 | 2.0 | No schema changes; enum literals now match `schema.prisma`; Prisma query typing narrowed without changing query semantics. |
| Lifecycle coverage | 1.5 | 1.5 | QA-hardening lifecycle goal was the compile gate before SESSION_0033; achieved. |
| Test evidence | 2.0 | 2.0 | Full generated typecheck, raw tsc after typegen, Prisma validate, regression tests, smoke, wiki lint, diff check. |
| Merge and docs readiness | 1.0 | 1.0 | SESSION, Project Log, wiki index, Petey Plan, and hostile-review protocol updated. |
| Launch usefulness | 1.0 | 1.0 | Removes noisy compiler debt before enrollment/family/waiver work. |
| **Total** | **10.0** | **10.0** | No cap. |

## Reflections

- The root issue was not one monolithic "TypeScript debt" bucket. It split into
  generated-artifact prerequisites and real source drift. Running `next typegen`
  first was the key planning move; it prevented editing blog/page code for
  errors that were only symptoms of missing generated files.

- Dirstarter docs should guide the plan before implementation starts. The old
  flow checked Dirstarter alignment at hostile close, which catches bypasses
  late. The updated Petey plan protocol now makes the live docs the initial
  implementation template, then hostile close verifies that the implementation
  stayed aligned.

- The most useful planning improvement for SESSION_0033 is a short
  "implementation template" block before task decomposition: docs read,
  baseline pattern to extend, custom delta, no-bypass proof. That makes it
  clear what is being built and how before Cody writes code.

- Efficiency matters, but only if proof does not regress. The process
  improvement here is not more ceremony; it is moving Dirstarter alignment
  earlier and making `typecheck` generate prerequisites automatically. Fewer
  false failures, same or better proof.

- Kaizen confidence: 100-user and 1,000-user tiers are 10/10 for this QA gate;
  10,000-user tier is 9/10 because typed-routes validator cleanup remains a
  possible future `next build` gate, but it is outside the raw generated
  typecheck debt closed here. Aggregate: 9/10.

## ADR / ubiquitous-language check

No ADR needed: this session repaired implementation/type assumptions and
protocol sequencing, but did not make a new architecture decision. No
ubiquitous-language update needed: no product/domain term changed.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `docs/sprints/SESSION_0032_5.md` set to `closed-full`; `docs/protocols/project-log.md`, `docs/protocols/petey-plan.md`, `docs/protocols/hostile-close-review.md`, and `docs/knowledge/wiki/index.md` stamped `updated: 2026-05-02` / `last_agent: codex-session-0032-5` where touched. Code files carry no frontmatter. |
| Backlinks/index sweep | `docs/knowledge/wiki/index.md` updated from SESSION_0032.5 `in-progress` to `closed-full`; no new wiki concept pages created. |
| Wiki lint | `bun run wiki:lint` passed; 127 markdown files, no lint violations. |
| Kaizen reflection | `## Reflections` present with Dirstarter-first planning and efficiency/no-regression lesson integrated into protocols. |
| Hostile close review | Inline review above; `SESSION_0032_5_REVIEW_01` appended to `docs/protocols/project-log.md`. |
| Review & Recommend | `## Next session` points to the pre-staged SESSION_0033 skeleton on `session-0032-attendance` and names the first task. |
| Memory sweep | No operator memory update needed; durable lesson captured in `docs/protocols/petey-plan.md` and `docs/protocols/hostile-close-review.md`. |
| Next session unblock check | Unblocked for a fresh SESSION_0033 bow-in after PR #1 merge or owner-approved branch from `session-0032-attendance`. |
| Git hygiene | Branch `session-0032-typecheck-debt`; worktree list checked; generated `.next`, `.content-collections`, `next-env.d.ts`, and `tsconfig.tsbuildinfo` remain ignored; `git diff --check` passed; local commit created, not pushed. |
