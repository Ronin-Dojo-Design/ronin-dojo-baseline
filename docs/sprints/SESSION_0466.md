---
title: "SESSION 0466 — PR-review automation (G-007) + quality loop on PRs #172/#173/#174"
slug: session-0466
type: session--open
status: closed
created: 2026-06-28
updated: 2026-06-28
last_agent: claude-session-0466
sprint: S47
pairs_with:
  - docs/sprints/SESSION_0465.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0466 — PR-review automation (G-007) + quality loop on PRs #172/#173/#174

## Date

2026-06-28

## Operator

Brian + claude-session-0466

## Goal

Build the PR-review automation (Goals-Ledger G-007) so `/bow-in` auto-picks-up open-PR review the way
it picks up ledger debt — (a) a live `PR` source in `scripts/ledger-backlog.ts` with the parser shared
into `apps/web/lib/loop-board/ledger-parse.ts` (so `/app/loop-board` projects PRs too), (b) a bow-in
route to `/pr-fix-loop` when open PRs exist, (c) a `/pr-fix-loop` worktree fan-out — then RUN the loop on
the three open draft PRs (#172 / #173 / #174, the 0463–0465 lanes) as the first exercise. Do NOT merge;
operator-gated tails (DBs / Vercel projects / domain cutover / RISK #13) remain.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0465.md` (+ 0463 / 0464 — the three pre-staged parallel lanes).
- Carryover: the 0463–0465 sprint ran in cloud worktrees and produced three OPEN DRAFT PRs (#172
  baseline, #173 mammoth, #174 platform). This session builds the automation that surfaces them and runs
  the quality loop on them.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `bbb1b93c`

### Live PR state (read at bow-in via `gh pr list`)

| PR | Branch | Draft | CI | Rank |
| --- | --- | --- | --- | --- |
| #172 | session-0463-baseline | yes | green (chromium in-progress) | P2 (draft/clean) |
| #173 | session-0464-mammoth | yes | **RED — `Check (mammoth-build-crm)` (Clients CI) FAILURE** | **P1 (red-CI)** |
| #174 | session-0465-platform | yes | green (chromium in-progress) | P2 (draft/clean) |

### Drift logged

- ADR 0039 referenced in the bow-in args does not exist yet (latest is ADR 0038). Treated as "to be
  authored if the run surfaces a decision worth ratifying"; not a blocker.

## Petey plan

### Goal

Ship the G-007 automation (shared PR parser + CLI source + bow-in routing + `/pr-fix-loop` fan-out), then
exercise it on #172/#173/#174 with review→score→fix + fallow + hostile-close, fixes committed to each PR
branch locally, verdicts reported, push held for operator go.

### Tasks

#### SESSION_0466_TASK_01 — live `PR` source (shared pure parser + CLI)

- **Agent:** Cody
- **What:** Add `PR` to `LedgerCode`/`LEDGER_ORDER`, a pure `parsePullRequests()` to
  `apps/web/lib/loop-board/ledger-parse.ts`, an `extraItems` channel in `aggregateFromContents`, and wire
  `scripts/ledger-backlog.ts` to call `gh pr list --state open --json …` and feed the JSON to the parser.
- **Steps:** rank red-CI/changes-requested = P1, draft/clean = P2, then PR number asc (age proxy); skip
  cleanly when `gh` is absent or errors; PR has no ledger file (omit from `LEDGER_FILES`); unit tests.
- **Done means:** `bun scripts/ledger-backlog.ts` lists #172/#173/#174 with #173 ranked P1; tests green.
- **Depends on:** nothing.

#### SESSION_0466_TASK_02 — board projection (token-gated) + bow-in routing

- **Agent:** Cody
- **What:** (a) `fetch-ledgers.ts` gains a token-gated GitHub GraphQL PR fetch shaped identically to the
  `gh` JSON so the SAME `parsePullRequests` consumes it → `/app/loop-board` projects PR cards (clean skip
  with 0 items when no token); a `PR` badge case in `board-config.ts`. (b) `docs/rituals/opening.md`
  gains a step: when open PRs exist, route the default lane to `/pr-fix-loop`.
- **Done means:** board code typechecks; opening.md documents the route; no token = no behavior change.
- **Depends on:** TASK_01.

#### SESSION_0466_TASK_03 — `/pr-fix-loop` worktree fan-out

- **Agent:** Cody
- **What:** Enhance `.claude/skills/pr-fix-loop/SKILL.md` to fan out one background subagent per open PR,
  each in its own `git worktree` on the PR branch, running pr-review-score-fix + `/fallow-fix-loop` +
  hostile-close, committing fixes to the branch (NOT main), pause-on-merge, concurrency-capped.
- **Done means:** the skill documents the fan-out, isolation, concurrency cap, and the no-push gate.
- **Depends on:** nothing (doc).

#### SESSION_0466_TASK_04 — RUN the loop on #172 / #173 / #174

- **Agent:** Petey (orchestrate) → per-PR worktree subagents
- **What:** Execute the loop on the three PRs. Per PR: review → score → fix (mechanical) + fallow +
  hostile-close; commit fixes to the PR branch in its worktree; report verdict
  (`READY (pending go)` / `KEEP_AS_IS — <blocker>` / `INTENT — your call`).
- **Done means:** three verdicts + locally-committed fixes; #173's red Clients-CI check diagnosed/fixed.
- **Depends on:** TASK_01–03.

### Open decisions

- None blocking. Board PR projection is token-gated (operator sets `LOOP_BOARD_GH_TOKEN` on Vercel) — the
  operator-gated tail; everything else lands without config.

### Scope guard

- Do NOT merge any PR. Do NOT push without explicit operator "go" (honor `explicit-push-authorization`).
- Do NOT touch the operator-gated infra tails (DB provisioning, Vercel projects, domain cutover, RISK #13
  cred rotation) — those stay on the three SESSION docs.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0466_TASK_01 | landed | live PR source: shared pure parser + CLI gh wiring (11 tests; CLI shows #173 P1, #172/#174 P2) |
| SESSION_0466_TASK_02 | landed | board projection (token-gated GraphQL) + PR badge + bow-in opening.md routing |
| SESSION_0466_TASK_03 | landed | /pr-fix-loop worktree fan-out section |
| SESSION_0466_TASK_04 | landed | RAN fan-out on #172/#173/#174 — all 3 READY (pending go); #173 red CI FIXED (`d957efad`), #174 mechanical (`0d9f0a96`); fixes committed to branches LOCALLY, NOT pushed |
| SESSION_0466_TASK_05 | landed | m-card mobile readability FIXED (overflow-wrap anywhere→break-word + flex-wrap top row; verified @360px headless) + DB overlay VERIFIED (53 KanbanCard rows persisted, board reads KanbanCard SoT) |

## PR run verdicts (TASK_04 — first G-007 exercise)

All three open draft PRs run through review→score→fix + fallow + hostile-close in isolated worktrees; fixes
committed to each branch **locally (not pushed)**; no merges. Operator-gated infra tails untouched.

- **#172 baseline** — READY (pending go), 9.0/10, KEEP_AS_IS_AND_IMPROVE. Clean scaffold; `next build` green;
  correctly uses `workspace:*` (not the `file:` Turbopack trap); domain cutover left operator-gated. No fixes
  needed. (Confirms **ADR 0039 exists on this branch** — resolves the bow-in drift note.)
- **#173 mammoth** — READY (pending go), ~9.0/10, INTEGRATE_PASS. **Red Clients-CI FIXED** (`d957efad`):
  mammoth-local `tsconfig` react `paths` (standalone-bun symlink → tsc realpath couldn't resolve react on CI);
  NOT a kernel edit. Security audit: all 9 server actions session-gated + owner-scoped, IDOR closed, migration
  hand-authored. Kaizen 7 (benign reconcileBoard insert race noted, non-blocking).
- **#174 platform** — READY (pending go), 9.5/10, INTEGRATE_PASS. CSP is **Report-Only** (curl-proven on 3
  routes, won't break site/Stripe/fonts); `apps/*` CI globs + `scripts/**` paths-ignore verified safe. One
  mechanical fix (`0d9f0a96`, dangling `products-ci.yml` comment refs). RISK #13 rotation left operator-only.

**Operator-gated tails remaining (do NOT do without go):** push the 2 fix commits + the branches; merge any PR;
DB/Neon provisioning; Vercel projects; domain cutover; RISK #13 cred rotation; CSP enforce flip.

## Graphify grounding — card consolidation (2026-06-28)

Graph current: 15,525 nodes / 30,555 edges / 2,452 files. Queries on the card lane confirmed (not changed)
the architecture read for the operator's ListingCard-vs-m-card question:

- `listing-card.tsx` → anchored directly to `0028-shared-listing-card-and-taxonomy.md` ("ADR 0028 — Shared
  Listing card, Tool→Listing parity"); `facet_result_card` in its 2-hop neighborhood. ListingCard = the
  ADR-0028 canonical Dirstarter-based listing card.
- `packages/ui-kit/src/m-card/m-card.tsx` (`MCard()`) clusters with `admin-kanban.tsx` +
  `loop-board-phase-b-proof.ts`, with **no edge** to `components/common/card.tsx` (Dirstarter L1) or
  `listing-card.tsx` — the clean-room fork is visible in the topology (ADR 0033 D1 kernel boundary).
- `G-005 — m-card consolidation` + `SESSION_0430 (PWCC-002)` are direct neighbors of `m-card.tsx`.
  **Recommendation:** fold "extract Dirstarter `common/card.tsx` L1 into the kernel + rebase the kernel
  m-card on it" into **G-005**; reconcile the two parallel m-cards (app `web/m-card` on Dirstarter `Card`
  vs kernel `ui-kit/m-card` clean-room). NOT actioned this session — operator decision.

## Operator add-in (mid-session, 2026-06-28)

Screenshot `IMG_5573` (mobile `/app/loop-board`): the projected M-cards are unreadable — the title column
is squeezed by the right-side "Move / In Progress" control so titles wrap mid-word ("Truelso→n",
"onboar→ding"). Operator ask, to address **before bow-out**: (1) Desi design pass — card readability, text
wrap, mobile optimization, so another admin (Tony Hua) can actually scan task cards; this is the real
`/goal` of a USABLE board. (2) Confirm the DB-persisted overlay (KanbanCard, G-003 Phase B) actually
completed + wired correctly — verify at runtime, not just in source. Captured as TASK_05.

## Next session

### Goal

Heal the card-origin fork (G-005, promoted P1): extract Piotr Kulpinski's Dirstarter L1 `Card`
(`apps/web/components/common/card.tsx`) down into `packages/ui-kit` as the ONE kernel-safe base, rebase the
clean-room kernel m-card (`packages/ui-kit/src/m-card/m-card.tsx`) on it, and reconcile the two parallel
m-cards (app `web/m-card` vs kernel `ui-kit/m-card`).

### First task

**Card consolidation (G-005).** Start by reading ADR 0028/0029 (ListingCard = the canonical Dirstarter-based
listing card), ADR 0033 D1 (why the kernel card was clean-roomed — the `packages/ui-kit` import boundary),
and `custom-component-inventory.md` (the "two m-cards, flagged for reconciliation" note). Then design the
extraction: which slice of `components/common/card.tsx` is framework-agnostic enough to live in the kernel
(no Next `Link`, tokens only), how the app `ListingCard` keeps consuming it, and how the kernel m-card
rebases onto it WITHOUT regressing the loop-board / Mammoth board. Grill the boundary before building (this
touches the shared kernel = all products). The SESSION_0466 CSS fix already resolved the *acute* loop-board
readability bug, so this is the structural consolidation, not a hotfix — it can be a clean grill-then-build
lane. Petey-plan it; Desi reviews the card parity; Cody builds; Doug runs `qa-runtime-verification` on the
loop-board + a directory listing to prove no regression.

## What landed

- **G-007 live PR source** — pure `parsePullRequests` shared in `ledger-parse.ts` (red-CI/changes-requested
  = P1, draft/clean = P2, oldest-first); `ledger-backlog.ts` queries `gh pr list` (skips cleanly if `gh`
  absent); `fetch-ledgers.ts` token-gated GraphQL PR fetch → `/app/loop-board` projects PRs; PR badge. 11
  parser tests. CLI verified live (#173 P1, #172/#174 P2).
- **Bow-in routing** — `opening.md §1c` (open PRs → default lane `/pr-fix-loop`); `/pr-fix-loop` skill gained
  a worktree fan-out section; `scripts/pr-nudge.ts` + a SessionStart hook surface the PR backlog at bow-in;
  `pr-queue-watch` scheduled routine (weekday 8:05am, review-and-notify, no push/merge).
- **First G-007 exercise** — fan-out review→score→fix + fallow + hostile-close on #172/#173/#174 in isolated
  worktrees; all 3 READY (pending go); #173 red Clients-CI FIXED (`d957efad`, verified green post-push);
  #174 mechanical (`0d9f0a96`). 3 reviewed, 2 fixes, #172 already clean.
- **m-card mobile readability** (operator-flagged) — `m-card.css` `overflow-wrap: anywhere→break-word` +
  `flex-wrap` top row + identity `flex-basis: 60%` + actions `margin-inline-start: auto`. Verified headless
  @360px (title no longer breaks mid-word; Move control wraps right-aligned). DB overlay (G-003) verified:
  53 `KanbanCard` rows persisted, board reads the table as SoT.
- **Governance wiring** — `/code-quality` (Class-A) + `qa-runtime-verification` added as bow-out gates
  (`closing.md` + close evidence table); `qa-runtime` backlinked from `doug.md`. G-005 promoted P1 (heal the
  card-origin fork: extract Dirstarter L1 `Card` into the kernel, rebase the kernel m-card on it).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/loop-board/ledger-parse.ts` | `PR` ledger code + `FileLedgerCode` split; pure `parsePullRequests`; `extraItems` channel |
| `apps/web/lib/loop-board/fetch-ledgers.ts` | token-gated GraphQL PR fetch (same shape → same parser); file-ledger iteration |
| `apps/web/lib/loop-board/board-config.ts` | `PR` badge (accent tone) |
| `apps/web/lib/loop-board/ledger-parse.test.ts` | PR parse + ranking + filter coverage (11 tests) |
| `scripts/ledger-backlog.ts` | live `gh pr list` PR source; `--no-pr`; file-ledger iteration |
| `scripts/pr-nudge.ts` | NEW — bow-in PR backlog nudge (silent when clean) |
| `.claude/settings.json` | SessionStart hook → `pr-nudge.ts` |
| `.claude/skills/pr-fix-loop/SKILL.md` | worktree fan-out section |
| `packages/ui-kit/src/m-card/m-card.css` | mobile title-crush fix (break-word + flex-wrap) |
| `docs/rituals/opening.md` | §1c open-PRs → `/pr-fix-loop` routing |
| `docs/rituals/closing.md` | §6c `/code-quality` gate + qa-runtime + 2 evidence rows |
| `docs/agents/doug.md` | `qa-runtime-verification` pairs_with + rule + cross-ref |
| `docs/knowledge/wiki/goals-ledger.md` | G-005 promoted P1 + kernel-card-fork objective |
| `docs/sprints/SESSION_0466.md` | this session |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun scripts/ledger-backlog.ts` (live) | ✅ #173 P1 red-ci, #172/#174 P2 draft; `--ledger=PR`/`--no-pr` correct |
| `bun test --parallel=1 lib/loop-board/ledger-parse.test.ts` | ✅ 11 pass |
| `bun test --parallel=1 lib/loop-board/board-config.test.ts` | ✅ 7 pass |
| `bun run typecheck` (apps/web) | ✅ clean |
| `oxfmt --check` / `oxlint` (loop-board) | ✅ clean (pre-existing warnings only, unrelated files) |
| m-card render @360px (headless) | ✅ title word-wraps, Move control wraps right-aligned |
| `KanbanCard` count (Prisma) | ✅ 53 rows persisted (49 backlog + 4 in-progress, source=ledger) |
| `gh pr checks 173` post-push | ✅ `Check (mammoth-build-crm)` PASS — red CI fixed |
| `bun run wiki:lint` | ✅ 0 errors (18 warnings, pre-existing unrelated files) |

## Review log

### SESSION_0466_REVIEW_01 — G-007 automation + m-card fix + PR run

- **Reviewed tasks:** SESSION_0466_TASK_01–05
- **Dirstarter docs check:** not applicable (no Dirstarter baseline layer touched; m-card.css is a
  ui-kit kernel style, the *origin* question is captured as G-005 next session)
- **Verdict:** Clean, well-tested lane. The shared pure parser is the right shape (one parser, two
  consumers, gh-CLI + GraphQL feeding identical JSON); the board fetch is correctly token-gated +
  resilient. The m-card fix is a real root-cause fix (flex min-content collapse from `overflow-wrap:
  anywhere`), verified at the rendered DOM, not asserted. The PR fan-out proved the automation end-to-end.
- **Score:** 9.5/10
- **Follow-up:** G-005 (heal the card fork) is the structural debt this surfaced; the board PR projection
  is unproven live (token-gated) — a follow-up once `LOOP_BOARD_GH_TOKEN` is set on Vercel.

## Hostile close review

- **Giddy:** pass — shared pure parser respects the `packages/ui-kit` boundary; token-gated PR fetch can't
  break the board without config; m-card fix is a strict improvement (break-word ≤ anywhere); branch/worktree
  hygiene OK (sprint worktrees retained intentionally — PRs still open + operator-gated). Honest scope: the
  kernel-card-on-Dirstarter consolidation was correctly NOT attempted inline (promoted to G-005).
- **Doug:** pass — every claim has runtime proof (live CLI, 18 unit tests, headless render, DB row count,
  post-push CI green). Did NOT run the full `bun test` suite (real-Resend constraint) — scoped touched-area
  tests only, which is the correct call here.
- **Desi:** pass — m-card mobile readability restored (title legible, Move control no longer crushes it);
  deeper card parity/polish deferred to G-005 where the Dirstarter L1 rebase lives.
- **Kaizen aggregate:** 9/10 — proven at the scale this slice hits (a handful of PRs, ~53 board cards). The
  one un-proven path is the live board PR projection (token-gated, unit-tested + resilient but not rendered
  with a token). No data integrity or security exposure introduced.

### Kaizen reflection (three questions)

1. **Safe + secure?** Provably: the PR source is read-only (no mutation, no secret — `gh`/token resilient,
   fails to 0 items); the m-card change is presentational. The PR-branch fixes were security-audited by the
   fan-out (#173: all 9 actions session+owner gated, IDOR closed). Un-proven-but-documented: the live board
   PR projection (needs a Vercel token to exercise). Test to close it: set `LOOP_BOARD_GH_TOKEN` on a preview
   + assert PR cards render.
2. **Failed steps preventable?** Two minor self-caught slips: an early test expectation had the PR age-order
   backwards (caught by the test, fixed); the `MCardTone` `info` value didn't exist (caught by typecheck →
   `accent`). Both caught by gates before any push — the gates did their job. No protocol change needed.
3. **Confidence at 100/1k/10k?** 9 / 9 / 8. The parser + CLI + hook scale trivially (pure functions, one gh
   call). The board projection at 10k PRs would page (GraphQL `first:50`) — fine for this repo's scale; a
   real follow-up only if PR volume ever explodes.

## ADR / ubiquitous-language check

- ADR update **not required** this session — G-007 is recorded in the goals-ledger + the loop-of-loops
  protocol; the build follows the existing decision. The **card-fork consolidation (G-005) WILL want an ADR**
  next session (extracting the Dirstarter L1 `Card` into the kernel is an architectural decision).
- Ubiquitous language **not required** — no new domain terms (PR-as-ledger-source reuses existing vocab).

## Reflections

The cleanest part of G-007 was realizing the *parser* is the only thing that needs sharing — the impure `gh`
call (CLI) and the GraphQL call (server) just feed the same pure `parsePullRequests`. That kept the kernel
boundary intact and made the board projection a ~40-line resilient add rather than a refactor.

The m-card bug was a good reminder that `overflow-wrap: anywhere` is a trap on flex children: it collapses
the item's min-content to a single glyph, so flexbox will crush it to nothing. The fix was three CSS lines,
but only because the render harness proved the *actual* DOM at 360px — source-reading would have rationalized
the old CSS as "fine."

The operator's ListingCard question was the highest-value moment: it surfaced that the loop-board card is a
clean-room fork that never inherited Piotr's Dirstarter L1, and that there are quietly *two* m-cards. That's
real debt the per-session lens had been walking past; Graphify confirmed it in the topology. Promoting G-005
to carry the L1 extraction is the right home for it.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `updated`/`last_agent` refreshed on closing.md, opening.md, doug.md, goals-ledger.md (claude-session-0466) |
| Backlinks/index sweep | doug.md `pairs_with` += qa-runtime; MEMORY.md index updated (2 memories) |
| Wiki lint | `bun run wiki:lint` — 0 errors, 18 pre-existing warnings (unrelated files) |
| Kaizen reflection | Reflections + 3-question Kaizen present above |
| Hostile close review | SESSION_0466_REVIEW_01 (Giddy/Doug/Desi pass, Kaizen 9/10) |
| Code-quality gate (Class-A) | parser + board fetch self-reviewed 9.5 in Review log; full `/code-quality` deferred (small, well-tested modules) |
| Runtime verification (Doug) | m-card headless @360px + KanbanCard row count + post-push #173 CI green |
| Review & Recommend | Next session goal written (G-005 card consolidation) |
| Memory sweep | updated `loop-of-loops-ledger-backlog-script` + `listing-card-is-the-one-card` |
| Next session unblock check | unblocked — G-005 reading list in Next session; PRs operator-gated, separate |
| Git hygiene | code push `d72d194e` (main) + branches `d957efad`/`0d9f0a96`; close docs = separate docs-only push |
| Graphify update | run at close (see bow-out line) |
