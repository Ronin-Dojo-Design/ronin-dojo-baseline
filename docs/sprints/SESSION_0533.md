---
title: "SESSION 0533 — FS-0031 e2e-infra fix + AdminCollection-ecosystem quality sweep"
slug: session-0533
type: session--open
status: in-progress
created: 2026-07-12
updated: 2026-07-12
last_agent: claude-session-0533
sprint: S53
pairs_with:

  - docs/sprints/SESSION_0532.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0533 — FS-0031 e2e-infra fix + AdminCollection-ecosystem quality sweep

## Date

2026-07-12

## Operator

Brian + claude-session-0533

## Goal

Two coherent lanes, sequenced: **(ITEM 1)** land the FS-0031 e2e-infra fix so the affected
`admin-collection-conformance.spec.ts` can be RUN locally + green (the UI-contract gate the sweep depends
on); then **(ITEM 2)** a behavior-preserving AdminCollection-ecosystem quality sweep across the
`/app/tools`-pattern family + the shared `useDataTable` kit, landing WL-P2-54..58, proven by fallow deltas
DOWN and no functional regression.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0532.md` (Giddy Learning Records docs lane; the e2e fix #3
  landed green at `33e7b275`).
- Carryover: FS-0031 is **mitigated** (rule + recipe shipped) but its **infra mechanization is OPEN** —
  a small seeded e2e DB (not the prodsnap) so heavy pages render locally, + an `e2e/`-diff pre-push guard.
  The AdminCollection sweep (WL-P2-54..58) was queued at 0531/0532.

### Branch and worktree

- Branch: `session-0533-admincoll-sweep`
- Worktree: `/Users/brianscott/dev/ronin-0533` (off `origin/main` @ `7562c59d`)
- Status at bow-in: clean (fresh worktree; bootstrapped via copied `.env` + `bun install` + prisma generate)
- Current HEAD at bow-in: `7562c59d`

### Bow-in facts established (discovery)

- **main e2e is currently GREEN** — `Playwright E2E … success` on the `33e7b275` fix (run 29220600598).
  FS-0031's mitigation already landed; ITEM 1 is the *infra*, not a red-main fix.
- **CI e2e** (`.github/workflows/playwright.yml`): fresh `postgres:16` service DB `ronindojo_test` +
  `prisma migrate deploy` + the tournament fixture (`global-setup.ts`) — **no heavy seed**. That's why CI
  renders fine.
- **Local** `.env` → `ronindojo_prodsnap` (the heavy DB). FS-0031 (b): `/app/blog` list `$transaction`
  times out cold-hit on prodsnap → page never renders locally → authors default to "verified by inspection."
- `apps/web` `dev` script is already `next dev --turbo` (FS-0002-compliant); the playwright.config
  `webServer.command` is `bun run dev` (runs that script) — the DB weight is the real local-run blocker.
- The affected UI-contract gate = `apps/web/e2e/admin/admin-collection-conformance.spec.ts` (5-route
  conformance loop + Posts Drafts-default + clear-to-All + Tools clear + Org sort). Minimal data it needs:
  a few Published posts + ≥2 orgs; admin user is minted per-test.

## Petey plan

### Goal

Sequence: FS-0031 infra fix (verified by a green LOCAL run of the affected spec) → AdminCollection sweep
(§5b epic lane, Desi in the review wave) landing WL-P2-54..58.

### Tasks

#### SESSION_0533_TASK_01 — FS-0031 e2e-infra fix (local-runnable e2e)

- **Agent:** Cody (build + self-verify) → Doug (independent verify)
- **What:** make the affected e2e locally runnable + green, and prevent shipping unrun e2e assertions.
- **Steps (pending operator fork sign-off):**
  1. Dedicated small seeded e2e DB `ronindojo_e2e` (mirror CI: migrate deploy + minimal seed = a few
     Published posts + ≥2 orgs) provisioned by an idempotent `e2e:db:setup` script (bun/pg, no psql).
  2. `.env.e2e` (or `DATABASE_URL` override) + a `test:e2e:local` script that runs the affected spec
     against that DB via the reuse-existing-server recipe.
  3. Harden `webServer.command`/doc the recipe so "run the e2e" is a reflex.
  4. A pre-push / bow-out guard that blocks an `e2e/`-touching diff without run-evidence (or a waiver).
- **Done means:** `CI= npx playwright test admin-collection-conformance --project=chromium` runs GREEN
  locally against the small DB; guard demonstrated; no change to prod/CI behavior.
- **Depends on:** worktree bootstrap.

#### SESSION_0533_TASK_02 — AdminCollection-ecosystem quality sweep (WL-P2-54..58)

- **Agent:** Petey brief → parallel review wave (Giddy + Doug + **Desi**) → Cody batch-fix → Doug delta verify
- **What:** behavior-preserving quality pass across `/app/tools`, `/app/claims`, `/app/media`,
  `/app/organizations`, `/app/techniques`, `/app/blog` + the shared `useDataTable`/`admin-collection` kit.
- **Steps:** fallow BASELINE first (CRAP/dupes/dead-code across `app/app/*/_components/*-table*.tsx` +
  `server/admin/*`); `/code-quality` each surface (Class A, ADR 0045); land the surfaced extractions —
  WL-P2-54 shared `RowActions`, WL-P2-55 `post-status` helper (mirror `tool-status.ts`), WL-P2-56 post
  default-sort DRY, WL-P2-57 techniques Draft-badge `outline`→`soft`, WL-P2-58 seed drafts + decide the
  empty-default product Q; prove fallow deltas DOWN; affected e2e green (ITEM 1 makes this real).
- **Done means:** extractions landed, fallow CRAP/dupes/dead-code DOWN, e2e green, zero behavior regression.
- **Depends on:** SESSION_0533_TASK_01 (the e2e gate must be runnable to verify TASK_02).

### Parallelism

TASK_01 → TASK_02 sequential (the e2e gate gates the sweep's verification). Within TASK_02 the review wave
fans out (disjoint per-surface reads); the batch-fix is one coherent Cody.

### Open decisions

- **[FORK — operator sign-off] FS-0031 provisioning approach** (see chat): dedicated small seeded e2e DB
  (recommended) vs. config-only + guard (rely on CI) vs. diagnose+fix the prodsnap `/app/blog` timeout.
- **WL-P2-58 product Q:** is Drafts-first the right `/app/blog` default when the draft queue is empty, or
  default to All? (signpost mitigates; operator decides.)

### Risks

- **Concurrency:** the FI-027 techniques lane and the blog lane may be live in sibling worktrees — the sweep
  edits shared files (`use-data-table.ts`, `admin-collection.tsx`, `*-table*.tsx`). Flag + hold/coordinate
  before editing a file a live lane owns.
- Behavior regression on a shared-kit refactor (blast radius across all AdminCollection consumers) —
  mitigated by the ITEM-1 e2e gate + fallow delta + Doug live smoke.

### Scope guard

- No functional/behavior changes (quality-only sweep). No new admin surfaces. FI-001 / Brian Truelson email
  STAYS PARKED (no send, no grant). `../ronin-dojo-monorepo` READ-ONLY. Hand-authored migrations only.
  No push/deploy without explicit operator "go".

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0533_TASK_01 | landed | FS-0031 e2e-infra fix (Cody `07b56e8d` + P2 fix `f91d3a61`; Doug GO 9.0; e2e 9 passed local) |
| SESSION_0533_TASK_02 | in-progress | AdminCollection sweep Phase A (WL-P2-54..58 + Desi conformance) |
| SESSION_0533_TASK_03 | pending | AdminCollection sweep Phase B (ecosystem `selectColumn`/`actionsColumn` — operator EXPANDED) |

## Wave findings (SESSION_0533_TASK_02) — Giddy · Doug · Desi (all GO, convergent)

Load-bearing corrections to the ledgered plan:

- **WL-P2-54** — NOT one god `RowActions`; split into `RowActionsMenu` (kebab shell; children = per-surface
  items) + `RowDeleteButton`. Lead keeps delete-in-menu. Kebab/delete flow has **zero e2e** → add assertion
  **A1** BEFORE touching `*-actions.tsx`. Migrate blog/tools/leads only; do NOT touch `*DeleteDialog`
  (shared by row + bulk toolbar); do NOT fold in Membership/Invite/org row-actions.
- **WL-P2-56** — DRY the default-sort **constant only** (in a 3rd module to avoid a schema↔queries runtime
  cycle); keep `resolvePostSort` **multi-column** (converging onto techniques' single-column resolver would
  REGRESS posts). Fix the techniques twin (`techniques/schema.ts` ↔ `scope.ts`) for symmetry.
- **WL-P2-55** — `components/common/post-status.tsx` mirroring `tool-status.tsx`; SEPARATE helper (not a
  generic god-map); raw-enum badge text + `Record` exhaustiveness.
- **WL-P2-57** — `techniques-table-columns.tsx:56` `outline`→`soft` (1 line).
- **WL-P2-58** — ratified (not a bug); operator decision = KEEP Drafts-first + seed draft fixtures.
- **Desi in-6-surface conformance (fold in):** Tools OFF `AdminCollection` (migrate) · claims date
  `toLocaleDateString`→`formatDate` · media delete → row-action contract · orgs empty-state dead-end.
- **Phase B (operator EXPANDED):** ecosystem `selectColumn`/`actionsColumn` helpers across ~24 admin
  columns files + migrate the remaining ~15 kebabs onto `RowActionsMenu`.
- **Verification bar:** `queries.test` + `scope.test` + full `bun run test` + `next build` + e2e gate
  (local, with A1) + repo `format:check`.

## What landed

- **ITEM 1 — FS-0031 e2e-infra fix (`07b56e8d` + `f91d3a61`):** a dedicated small seeded e2e DB
  `ronindojo_e2e` (`scripts/setup-e2e-db.ts`, idempotent, refuses non-e2e DB names), a local-run launcher
  (`scripts/run-e2e-local.ts` + `.env.e2e` overlay) that sidesteps the prodsnap tx-timeout, and an
  `e2e/**`-diff run-evidence guard (`scripts/check-e2e-run-evidence.ts`, wired into `closing.md` §4c — NOT
  an installed hook). The affected spec now runs GREEN locally (Doug independently reproduced 9 passed +
  runtime-proved the server queries `ronindojo_e2e`). Doug **GO 9.0**.
- **ITEM 2 — AdminCollection ecosystem sweep (12 commits, `0f7668e5`→`85e739d8`):** behavior-preserving.
  - **A1** e2e guard (Posts destructive row-action path) — added BEFORE the WL-P2-54 refactor.
  - **WL-P2-54** `RowActionsMenu` + `RowDeleteButton` (two thin primitives, NOT a god-component) → post/tool/lead/media.
  - **WL-P2-55** `components/common/post-status.tsx` (separate helper). **WL-P2-56** default-sort DRY'd to
    `posts/constants.ts` + `techniques/constants.ts` (`resolvePostSort` kept multi-column — avoided the
    ledger's regression trap). **WL-P2-57** techniques Draft `outline`→`soft`. **WL-P2-58** draft-post dev seed.
  - **Phase B (operator EXPANDED): WL-P2-59** `selectColumn<TData>()` (20 surfaces; 5 genuine deviations left
    inline). **WL-P2-60** 16 kebabs → `RowActionsMenu` (4 genuine deviations left inline). **B2**
    `actionsColumn()` skipped (fallow: zero measurable dedup — KISS/YAGNI).
  - **Desi conformance:** Tools→`AdminCollection` (operator RATIFIED keep), claims `formatDate`, orgs
    empty-state, media delete conform, content-atom conform (last outlier), 11 dead imports stripped,
    `.fallow/` gitignored.

## Files touched

| File(s) | Change |
| --- | --- |
| `apps/web/scripts/{setup-e2e-db,run-e2e-local,check-e2e-run-evidence}.ts` · `.env.e2e.example` · `.gitignore` · `package.json` | NEW FS-0031 e2e infra + scripts |
| `apps/web/e2e/admin/admin-collection-conformance.spec.ts` | +A1 destructive-row-action guard |
| `apps/web/components/admin/{row-actions-menu,row-delete-button}.tsx` | NEW row-action primitives (WL-P2-54) |
| `apps/web/components/data-table/select-column.tsx` | NEW `selectColumn<TData>()` (WL-P2-59) |
| `apps/web/components/common/post-status.tsx` | NEW post-status helper (WL-P2-55) |
| `apps/web/server/admin/{posts,techniques}/constants.ts` | NEW default-sort constants (WL-P2-56) |
| ~40 `app/app/*/_components/*-{actions,columns,table}.tsx` | migrate onto primitives + selectColumn (WL-P2-54/59/60) |
| `apps/web/scripts/seed-draft-posts.ts` | NEW dev draft fixtures (WL-P2-58) |
| `docs/rituals/closing.md` | +§4c FS-0031 guard wiring |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run test` (full, `--parallel=1`) | **1381 pass / 0 fail** (Doug re-ran; stripe P2034 = pre-existing load flake, 10/10 isolated) |
| e2e `admin-collection-conformance` (local, `ronindojo_e2e`) | **10 passed** incl. A1 + Posts-kebab + Tools-clear (Doug reproduced) |
| `typecheck` (apps/web) · `build` · `format:check` · `lint:check` | all PASS (re-run post-cleanup) |
| Fallow delta | **701→693 groups, 23,254→22,518 dup lines (−736), 10.11%→9.82%** — down |
| Live pixel check (isolated chromium, admin, `ronindojo_e2e`) | 6 routes 200; /app/blog shows full conformed system (soft badge + kebab + red trash + select col + Drafts-first seed); Tools frame migration renders clean |

## Decisions resolved

- Scope: operator chose **EXPANDED** (fold the ecosystem `selectColumn` extraction in). WL-P2-58: **keep
  Drafts-first + seed drafts**. Tools→AdminCollection migration: operator **RATIFIED keep** (reference impl
  now consumes the ADR-0045 law; behavior-verified identical).
- FS-0031 provisioning: spec-decided (corrective action (d)) — no fork.

## Open decisions / blockers

- None at close. Deferred follow-ons routed to ledgers (see below).

## Review log

- **Sweep wave (pre-build):** Giddy (arch) · Doug (behavior) · Desi (UX) — all GO, convergent; corrected the
  ledger's WL-P2-54 shape (two primitives) + WL-P2-56 trap (constant-only, keep multi-column).
- **Delta-verify (post-build):** Doug **GO 9.6** (0 P1/P2) · Giddy **9.2** · Desi **9.0**. All inline-left
  deviations verified genuine. Cleanup (content-atom conform + 11 imports + gitignore) added post-verify,
  re-gated green.

## Hostile close review

- Shared-kit blast radius across ~21 admin collections — mitigated: `selectColumn` hoist is byte-identical
  (provably equivalent), kebab migration is a mechanical shell swap, the e2e gate + A1 pin the destructive
  path, and Doug diff-audited the risky non-e2e surfaces (person/user role-submenu, tournament-role
  conditional-disabled, registration disabled). No `*DeleteDialog` touched. Data untouched (code-only).

## ADR / ubiquitous-language check

- No new ADR (operates under **ADR 0045** — AdminCollection is the admin law; Tools migration conforms the
  reference to it). New shared terms recorded in `custom-component-inventory.md`: `RowActionsMenu`,
  `RowDeleteButton`, `selectColumn`, `post-status`. Load-bearing invariant: `RowActionsMenu` must never grow
  an `items`/`kind` prop (that's the god-component boundary).

## Reflections

- **The ledger text was a trap in two places** — WL-P2-54 ("one RowActions") would have built a
  god-component; WL-P2-56 ("centralize like `resolveTechniqueOrderBy`") would have regressed posts from
  multi- to single-column sort. The pre-build review wave caught both *before* code. Reviewing the plan, not
  just the diff, paid for itself.
- **The FS-0031 fix proved itself in-session** — the sweep's UI-contract gate could only be verified because
  ITEM 1 made the e2e locally runnable; the A1 guard (added before the risky refactor) then pinned the exact
  destructive path WL-P2-54 rewired. Guard-first, as FS-0031 prescribes.
- **"Empty ≠ deleted"** — the operator's `/app/tools` catch was a live reminder that an e2e-DB screenshot
  reads as data loss to anyone who doesn't know the seed is tiny. Worth a caption next time.

## Full close evidence

| Step | Proof |
| --- | --- |
| Frontmatter/index sweep | wiki/index +SESSION_0533 row; `updated`/`last_agent` bumped |
| Ledger cross-off | FS-0031 infra→landed; WL-P2-54..58 done; WL-P2-59/60 added+done; follow-ons ledgered |
| Component inventory | 4 new shared components recorded |
| Wiki lint | (run at close) |
| Kaizen reflection | yes — 3 (ledger-trap, guard-first, empty≠deleted) |
| Review & Recommend | Next session = deferred ecosystem follow-ons + FI-028 |
| Memory sweep | none needed — captures are the ledgers + inventory (session-scoped → docs) |
| Git hygiene | branch `session-0533-admincoll-sweep`; single close commit; pushed on operator "Go" |

## Next session

### Goal

Drain the deferred AdminCollection ecosystem follow-ons + hardening surfaced this session, or pivot to
**FI-028 community-posts freemium** (its own grill) per operator priority.

### First task

Pick up the ledgered follow-ons: **AC-ECOSYSTEM-1** (migrate the 4 remaining bespoke kebabs + the different
`Checkbox`/shift-select surfaces where behavior-safe), the **person/user `AccountActionItems` menu-item
dupe** (gated on the WL-P2-35 user-actions-lifecycle question), the **FS-0031 dev-server `NODE_OPTIONS`
recipe-hardening** (the `bun --env-file next dev` form poisons Turbopack's PostCSS worker — closing.md §4c
recipe should use a `loadEnvFile` launcher), and the **kebab-codemod-should-drop-empty-imports** FS note.
