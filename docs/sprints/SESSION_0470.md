---
title: "SESSION 0470 — G-005: extract the L1 Card surface into the kernel + named cards"
slug: session-0470
type: session--open
status: in-progress
created: 2026-06-28
updated: 2026-06-28
last_agent: claude-session-0470
sprint: S48
pairs_with:
  - docs/sprints/SESSION_0468.md
  - docs/knowledge/wiki/design-system-doctrine.md
  - docs/architecture/decisions/0040-design-system-doctrine-and-card-architecture.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0470 — G-005: extract the L1 Card surface into the kernel + named cards

## Date

2026-06-28

## Operator

Brian + claude-session-0470

## Goal

S48 G-005 code lane (the pivot-to-code alternative from SESSION_0468's Next-session block). Heal the
"3 cards / 2 foundations" drift against the ratified `design-system-doctrine.md` §5–§6: **extract the
Dirstarter L1 `Card` surface contract DOWN into `packages/ui-kit` (Option B — tokens travel, Tailwind
doesn't), rebase the kernel `m-card` (the BoardCard) onto it, guard it with an anti-drift parity test**,
and apply the cheap §5 cleanup (demote the app `m-card` `kind` god-union to the record/person card,
dropping the dead `task|loop|generic` placeholders). Folding the 5 catalog cards onto `ListingCard`
(§5 catalog half) is the app-only follow-up slice — sequenced after the kernel heal, pending the grill.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0468.md`
- Carryover: SESSION_0468 (S48 session 1) executed the hostile-repo-review lean-out (~3.3M/117 files
  reclaimed, agent-systems-map added). Its Next-session block offered two lanes; the operator pinned the
  **Alternative/pivot lane — G-005 code** for this window. This is 1 of 2 concurrent S48 windows (the
  sibling SESSION_0469 runs the lean-out continuation in `../ronin-0469`, touching `docs/**` +
  `apps/web/scripts/**` — disjoint from this window's `packages/ui-kit` + `apps/web` component files).

### Branch and worktree

- Branch: `session-0470-card`
- Worktree: `/Users/brianscott/dev/ronin-0470`
- Status at bow-in: clean
- Current HEAD at bow-in: `022afc4f`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | **Theming** (the L1 `Card` surface primitive + the `--color-*`/`--mk-*` token model) |
| Extension or replacement | Extension: ports the L1 `Card` *surface contract* (padding/radius/border/bg/hover/shadow/focus) into the kernel's plain-CSS/`--mk-*` idiom so the shared kernel inherits Piotr's debugged surface instead of a clean-room parallel. |
| Why justified | The kernel can't import the app-coupled Tailwind/Base-UI L1 (`packages/ui-kit` is framework-agnostic, consumed by a standalone-bun client); Option B (one contract, two renderers) is the doctrine-ratified way to share it (ADR 0040 D4). |
| Risk if bypassed | The clean-room kernel card keeps drifting + re-introducing solved bugs (the 0466 mobile title-crush) — the exact debt G-005 heals. |

Live docs checked during planning: Theming (the doctrine §1/§6 is the local SoT; `dirstarter.com/docs/theming` is the upstream reference — not re-fetched, cached doctrine sufficient).

### Graphify check

- Graph status: current (refreshed at SESSION_0468 close — 15,651 nodes / 30,815 edges / 2,357 files).
- Discovery was direct-file, not graph-led: the doctrine §6 + `[[listing-card-is-the-one-card]]` +
  `[[kernel-extracts-dirstarter-l1-not-cleanroom]]` named the exact files; verified by reading them.
- Files confirmed: L1 `apps/web/components/common/card.tsx`; app `apps/web/components/web/m-card/m-card.tsx`
  (`roster|rank|task|loop|generic`, task/loop/generic = dead placeholders — confirmed by consumer grep);
  kernel `packages/ui-kit/src/m-card/{m-card.tsx,m-card.css,m-card.types.ts}` (`task|deal|record`);
  kernel exports `.`/`./kanban`/`./tokens.css`/`./m-card.css`.
- Kernel blast radius (consumers of the `--mk-*` surface): `apps/web/app/app/loop-board/`,
  `clients/mammoth-build-crm/`, `packages/ui-kit/src/kanban/admin-kanban.tsx` — **3 board surfaces**.

### Grill outcome

2 forks resolved (operator, bow-in):

- **Scope cut → Full G-005 this window.** Kernel surface port + rebase + parity test + app `m-card`
  demotion **+ fold all 5 catalog cards (course/post/merch/tournament/facet-result) onto `ListingCard`**.
  (Petey recommended kernel-port-first; operator chose the full lane.)
- **Radius → reconcile now (12px→8px).** Close doctrine §6 gap #4 in this port; the parity test pins 8px.

## Petey plan

### Goal

Extract the L1 `Card` surface contract into the kernel (Option B), rebase the kernel `m-card` onto it
with an anti-drift parity guard, reconcile the radius drift (12px→8px), and demote the app `m-card`
god-union to the record/person card — proving no regression across the 3 board surfaces.

### Tasks

#### SESSION_0470_TASK_01 — Petey: grill the extraction boundary + lock scope

- **Agent:** Petey
- **What:** Resolve the scope fork (kernel-surface-port-first vs full G-005) + the radius reconcile, then lock the slice.
- **Steps:** present the boundary read + recommendation; grill the operator on the scope cut; record the decision.
- **Done means:** Open-decisions resolved; slice locked; Cody preflight unblocked.
- **Depends on:** nothing

#### SESSION_0470_TASK_02 — Cody: port the L1 Card surface contract into the kernel

- **Agent:** Cody
- **What:** Add `packages/ui-kit/src/card/card.css` (+ thin surface primitive if warranted) carrying the L1 visual contract in `--mk-*` plain CSS; record the provenance chain (L1 → ported surface) in the header.
- **Steps:** translate the L1 `cardVariants` base (`flex flex-col gap-4 w-full border bg-card p-5 rounded-lg` + hover/focus/highlight/reveal) into a `mk-surface` base class; reconcile `--mk-r-card` 12px→8px; bridge `--mk-*`↔host `--color-*` so there is ONE token SoT; export `./card.css`.
- **Done means:** kernel has a ported surface contract; typecheck + lint green.
- **Depends on:** TASK_01

#### SESSION_0470_TASK_03 — Cody: rebase the kernel m-card (BoardCard) onto the ported surface

- **Agent:** Cody
- **What:** `.mk-card` composes the `mk-surface` base; reconcile radius; keep the board's uniform-stream contract; header records BoardCard role (doctrine §5).
- **Done means:** kernel `m-card` builds on the ported surface; the 3 board surfaces render unchanged (minus the intended 8px radius); kernel tests green.
- **Depends on:** TASK_02

#### SESSION_0470_TASK_04 — Cody: anti-drift parity test

- **Agent:** Cody
- **What:** A guard test that fails if the kernel surface contract drifts from the L1 (the doctrine §6 requirement).
- **Done means:** a parity test exists + passes; documents which contract values are pinned.
- **Depends on:** TASK_02

#### SESSION_0470_TASK_05 — Cody: demote the app m-card god-union to record/person card

- **Agent:** Cody
- **What:** Narrow `MCardKind` `roster|rank|task|loop|generic` → drop dead `task|loop|generic` placeholders; header reframes as the **record/person** card (doctrine §5); update consumers/types as needed.
- **Done means:** the `kind` union no longer spans catalog/board; only the wired `roster|rank` remain; app typecheck + touched-area tests green.
- **Depends on:** TASK_01 (independent of the kernel tasks — app-only)

#### SESSION_0470_TASK_07 — Cody: fold the 5 catalog cards onto ListingCard

- **Agent:** Cody
- **What:** course/post/merch/tournament/facet-result → render through `ListingCard` (the §5 catalog half). Each becomes a thin adapter; the directory/catalog grids render byte-comparably.
- **Steps:** read `ListingCard`'s slot API + each of the 5 cards; map native props → `ListingCard` slots (media/title/tagline/categories/save/view); preserve per-entity Save subjectType; delete bespoke markup.
- **Done means:** the 5 cards are adapters over `ListingCard`; app typecheck + touched-area tests green; catalog grids unregressed.
- **Depends on:** TASK_01 (app-only; disjoint from the kernel chain)

#### SESSION_0470_TASK_06 — Desi + Doug: parity review + qa-runtime no-regression

- **Agent:** Desi (card parity across surfaces) + Doug (qa-runtime-verification)
- **What:** Desi audits card parity across loop-board/kanban/Mammoth + the catalog grids vs the doctrine §8 checklist; Doug proves the board + catalog surfaces render with no regression (headless/curl, not eyeball).
- **Done means:** Desi fix-list (if any) triaged; Doug evidence that the boards + catalog grids are unbroken.
- **Depends on:** TASK_03, TASK_05, TASK_07

### Parallelism

TASK_02→03→04 are sequential (kernel surface chain). TASK_05 (app m-card demotion) is app-only and
**disjoint** from the kernel chain — can run concurrently. TASK_06 gates on both chains landing.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0470_TASK_01 | Petey | scope fork is operator-owned (blast radius + session size) |
| SESSION_0470_TASK_02 | Cody | core kernel port |
| SESSION_0470_TASK_03 | Cody | rebase on the port |
| SESSION_0470_TASK_04 | Cody | parity guard |
| SESSION_0470_TASK_05 | Cody | app-only cleanup |
| SESSION_0470_TASK_06 | Desi + Doug | parity review + runtime proof |

### Open decisions

- **RESOLVED — Scope cut → Full G-005.** Operator chose the full lane (kernel port + app demotion +
  fold all 5 catalog cards onto `ListingCard`) over Petey's kernel-port-first recommendation. TASK_07
  added for the catalog fold.
- **RESOLVED — Radius reconcile now (12px→8px).** Doctrine §6 gap #4 closed in the port; parity test pins 8px.

### Risks

- Shared-kernel blast radius: a kernel surface regression breaks loop-board + AdminKanban + Mammoth at
  once. Mitigation: TASK_04 parity test + TASK_06 Doug runtime proof before any push.
- Standalone-bun `file:` ui-kit link / Turbopack symlink fragility (see `[[separation-separate-dbs-per-product]]`)
  — verify the kernel CSS export resolves in the app build, not just in isolation.

### Scope guard

- Do NOT touch `docs/architecture/source|uplift` or `apps/web/scripts/**` (the sibling SESSION_0469 owns those).
- Do NOT drag Tailwind/cva/Base-UI into the kernel (breaks the standalone-bun client — the whole point of Option B).
- Do NOT clean-room a parallel surface (that is the drift this lane heals).
- Catalog-card fold is deferred unless the grill says otherwise; WEKAF token drift (§6 gap #5) is out of this slice.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0470_TASK_01 | landed | Petey grill — scope=Full G-005, radius 12→8 |
| SESSION_0470_TASK_02 | landed | Ported L1 surface → kernel `card/card.css` (.mk-surface) + export |
| SESSION_0470_TASK_03 | landed | Kernel m-card rebased on .mk-surface; radius 8px; loop-board import |
| SESSION_0470_TASK_04 | landed | `card.css.test.ts` parity guard (10 pass) + `card-surface-contract.ts` |
| SESSION_0470_TASK_05 | landed | App m-card demoted to record/person (`roster\|rank`); dead kinds dropped |
| SESSION_0470_TASK_08 | landed | §6 gap #3 fix — Mammoth `--mk-*` bridge + kernel CSS import (was unwired) |
| SESSION_0470_TASK_07 | landed | Fold 5 catalog cards onto ListingCard (+ mediaTop/footer density) |
| SESSION_0470_TASK_06 | in-progress | Desi parity + Doug qa-runtime |

## What landed

- **Kernel surface heal (§6):** ported the L1 `Card` contract → `packages/ui-kit/src/card/card.css`
  (`.mk-surface`) + pinned `card-surface-contract.ts` + `card.css.test.ts` parity guard; rebased the
  kernel `m-card` (BoardCard) onto `.mk-surface`; radius reconciled 12→8px (gap #4); `./card.css` export.
- **App `m-card` demotion (§5):** god-union `roster|rank|task|loop|generic` → record/person card
  (`roster|rank`); dropped dead `task|loop|generic` + `PlaceholderCard` + `LifecycleStatus` + dead `Stack` import.
- **Catalog fold (§5):** ListingCard grew backward-compatible `mediaTop` (top-hero density) + `footer`
  slots; the 5 bespoke cards (course/post/merch/tournament/facet-result) are now thin adapters over it.
- **§6 gap #3 (Mammoth bridge):** see finding below — fixed a real wiring bug (board had no kernel CSS).

## Decisions resolved

- Scope = Full G-005 (operator). Radius reconcile now, 12→8px (operator).
- Catalog fold approach = enhance ListingCard (density, not a fork) then fold all 5 preserving identity (operator).
- Facet-result (person) folds onto ListingCard per the §5 table, person-tuned (operator).

## Files touched

| File | Change |
| --- | --- |
| `packages/ui-kit/src/card/card.css` | **new** — ported L1 `.mk-surface` shell (Option B) |
| `packages/ui-kit/src/card/card-surface-contract.ts` | **new** — pinned contract constants |
| `packages/ui-kit/src/card/card.css.test.ts` | **new** — anti-drift parity guard (10 tests) |
| `packages/ui-kit/src/tokens/tokens.css` | `--mk-r-card` 12px→8px (gap #4) |
| `packages/ui-kit/src/m-card/m-card.{tsx,css}` | rebased onto `.mk-surface`; header reframed as BoardCard |
| `packages/ui-kit/src/index.ts` · `package.json` | `./card.css` export + load-order doc |
| `apps/web/components/web/listing/listing-card.tsx` | + `mediaTop` (hero density) + `footer` slots |
| `apps/web/components/web/m-card/m-card.tsx` | demoted to record/person card (`roster\|rank`) |
| `apps/web/components/web/{courses/course,posts/post,tournaments/tournament,tuffbuffs/merch,directory/facet-result}-card.tsx` | folded → thin `ListingCard` adapters |
| `apps/web/app/app/loop-board/_components/loop-board.tsx` | + `card.css` import (load order) |
| `clients/mammoth-build-crm/app/{layout.tsx,globals.css}` | §6 gap #3 — `--mk-*` bridge + kernel CSS imports |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bunx tsc --noEmit` (packages/ui-kit) | **clean** |
| `bun run test` (packages/ui-kit) | **30 pass / 0 fail** (incl. new parity guard) |
| `bunx tsc --noEmit` (apps/web) | **0 errors** |
| `bun test --parallel=1` map-rank·map-roster·facet-result | **17 pass / 0 fail** |
| `oxlint .` + `oxfmt --check .` (apps/web) | touched files **clean** (1694 fmt-ok; only pre-existing warns elsewhere) |
| `oxlint`/`oxfmt --check src` (packages/ui-kit) | **clean** |
| Runtime (Doug qa-runtime) | in progress — dev server + curl board/catalog surfaces |

## Open decisions / blockers

- **SESSION_0470_FINDING_01 (§6 gap #3, Mammoth board) — addressed (static), needs Mammoth-staging runtime proof.**
  The Mammoth AdminKanban board had **no kernel CSS loaded at all** (`admin-kanban.tsx` imports none;
  Mammoth imported neither `tokens.css` nor `m-card.css`), and `globals.css`'s comment ("the kernel reads
  ONLY `--surface`/`--border`/`--accent`") was confidently wrong — the kernel reads `--mk-*`. Fixed by
  importing the kernel CSS (ordered) + adding the `--mk-*` bridge block. The BBL loop-board is the wired
  reference; Mammoth's own staging should confirm the orange re-skin renders.

## Next session

### Goal

TBD at bow-out.

### First task

TBD at bow-out.
