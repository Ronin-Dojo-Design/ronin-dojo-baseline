---
title: "SESSION 0506 — public-surface polish bundle (WL-P2-1 · WL-P3-25a · FI-005 stale-resolved)"
slug: session-0506
type: session--implement
status: closed
created: 2026-07-06
updated: 2026-07-06
last_agent: claude-session-0506
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0505.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0506 — public-surface polish bundle (WL-P2-1 · WL-P3-25a · FI-005 stale-resolved)

## Date

2026-07-06

## Operator

Brian + claude-session-0506

## Goal

Ship a coherent public-surface polish bundle (one `apps/web` deploy unit): the visible
"unfinished-feel" items on the surfaces the first tester will land on — FI-005 (rank-badge
overlap · EmailCapture theme · FormLabel wrap), WL-P2-1 (inert "Manage verification (coming
soon)" drawer item), WL-P3-25a (mobile student-count wrap). Operator picked this lane over
the operator/infra-gated top-of-board P0/P1s.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0505.md` (highest on `origin/main`).
- Carryover: 0505 shipped BBL PWA icons + favicon/apple-touch parity (live on prod). No
  pinned successor → this session's lane chosen from the inbound scan.

### Inbound scan (ledger + board)

- `ledger-backlog.ts` → 56 open (WL 21 · MB 11 · RISK 10 · GL 5 · FI 5 · TFF 2 · FS/D 1).
- `board-backlog.ts` (operator drag-order) top 3 = FI-001/G-001 (P0) + G-002 (P1) — all
  **operator/infra-gated** (see gating table below), not agent-buildable this session.
- `gh pr list --state open` → 0 open PRs → `/pr-fix-loop` default N/A.

| Board item | State | Blocker |
| --- | --- | --- |
| FI-001 / G-001 (P0) | build-complete | Only operator "send Brian now" remains (manual). |
| G-002 (P1) | Phase 1 + local landed | Cloud half (Neon + Vercel) operator/SHIP-gated. |
| G-007 (P1) | (a)+(b) shipped | 0 open PRs → nothing to exercise. |

Operator picked the **public-surface polish bundle**; FI-001 pre-send readiness deferred to
the immediate next lane (SESSION_0507).

### Branch and worktree

- Branch: `session-0506-public-surface-polish` (off `origin/main` @ `203bb1d1`)
- Worktree: `/Users/brianscott/dev/ronin-0506` (fresh; bootstrapped `bun install` +
  `prisma generate`; `.env` copied from canonical)
- No active sibling worktrees registered at bow-in (0503/0504 not present).

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None (leaf lineage components + inert-item removal + CSS overflow classes) |
| Extension or replacement | Neither — behavior-preserving polish |
| Why justified | Visible unfinished-feel items on public/claimant surfaces |
| Risk if bypassed | Permanent "coming soon" promise ships; student-count wraps on mobile |

## Petey plan

Operator-picked lane; single coherent bundle, built inline (Petey→Cody) + inline verify.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0506_TASK_01 | done | Inbound scan + gating analysis + buildable-lane menu (operator picked polish bundle) |
| SESSION_0506_TASK_02 | done | WL-P2-1 — removed permanent inert "Manage verification (coming soon)" drawer item + orphaned separator + 2 unused imports |
| SESSION_0506_TASK_03 | done | WL-P3-25a — student-count no-wrap fix in BOTH carousel variants (V2 cited + V1 default) |
| SESSION_0506_TASK_04 | done | FI-005 (a/b/c) verified already-resolved (stale ledger row) — 1 render-verified + 2 source-confirmed |

## What landed

**Three items already resolved (stale ledger rows → crossed off, no code):**

- **FI-005a** rank-badge overlap — `ProfileHero` already wraps rank tags (`flex-wrap` +
  `max-w-full whitespace-normal break-words min-w-0`). **Render-verified @390px** on
  `/directory/bob-bass`: the flagged "Coral Belt (Red/Black) - 7th Degree" badge wraps to
  two lines inside its chip, `docScrollW=390`, zero horizontal overflow.
- **FI-005b** EmailCapture theme — already follows `prefers-color-scheme` w/ dark fallback
  (`useResolvedTheme`, SESSION_0420).
- **FI-005c** FormLabel wrap — already `min-w-0 break-words` (SESSION_0420 #128/#129).

**Two real fixes (+ one parity extension):**

- **WL-P2-1** — removed the permanently-`disabled` "Manage verification (coming soon)"
  dropdown item from the lineage drawer header Admin group (+ its orphaned
  `DropdownMenuSeparator`, + the now-unused `ShieldCheckIcon` / `DropdownMenuSeparator`
  imports). Doctrine: don't ship a permanent no-ETA "coming soon". (Operator chose *remove*
  over admin-gate/roadmap.)
- **WL-P3-25a** — student-count no longer wraps/squeezes under long belt labels: `min-w-0`
  on the truncating belt label so it yields space, `shrink-0 whitespace-nowrap` on the count
  so it stays one line. Applied to **both** `students-carousel-v2.tsx` (the ledger-cited
  file, `?cards=v2` opt-in) AND `students-carousel.tsx` (V1, the **default** users see) — so
  the visible default is covered, not just the opt-in variant.

## Decisions resolved

- **WL-P2-1 = remove** (not admin-gate/roadmap): the item was inert for everyone with no
  scheduled work; a permanent "coming soon" is UI debt. Resolves the wiring-ledger open
  question.
- **WL-P3-25a scope = both carousel variants**: the ledger cited V2, but V2 is `?cards=v2`
  opt-in and V1 is the default — fixing the *class* of layout bug in both covers the visible
  surface. Rest of the WL-P3-25 bundle (country-validator consolidation, registration-spec
  timeout, passport `.trim()` parity, memberSchool null unit) is non-visible refactor/test
  debt on a different axis — left OPEN, out of this lane.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/lineage/lineage-profile-drawer/drawer-header.tsx` | Removed inert "Manage verification (coming soon)" item + separator + 2 unused imports |
| `apps/web/components/web/lineage/students-carousel-v2.tsx` | `min-w-0` label + `shrink-0 whitespace-nowrap` count |
| `apps/web/components/web/lineage/students-carousel.tsx` | Same parity fix (V1 default rail) |
| `docs/knowledge/wiki/wiring-ledger.md` | WL-P2-1 resolved; WL-P3-25 student-count sub-item done; open-question resolved |
| `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md` | FI-005 marked resolved (stale) |
| `docs/sprints/SESSION_0506.md` | this record |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | ✓ clean |
| `bunx oxlint` (3 touched files) | ✓ exit 0 |
| `bunx oxfmt --check` (3 files) | ✓ correct format |
| FI-005a render @390px (own isolated Chromium; MCPs sibling-locked) | ✓ no overflow, badge wraps, screenshot captured |
| e2e assertion audit (`explore-view`, `authenticated-lifecycle`) | ✓ neither asserts the removed/changed UI (menu items targeted by name: "Change promoter", "Copy focus link"; no "Manage verification") |

**Not run:** full lineage e2e suite — both browser MCPs were profile-locked by siblings; the
changes are an inert-item removal + pure-CSS overflow classes that no spec asserts, verified
via gates + the e2e assertion audit + the isolated-Chromium render. (Honest-close note.)

## Open decisions / blockers

- None carried. WL-P3-25's non-visible sub-items remain OPEN (different axis).

## Next session

### Goal

**FI-001 pre-send readiness** (SESSION_0507) — verify the lifetime-Elite comp path + claim
magic-link + welcome/thank-you email are all wired & green so the operator's real "send Brian
now" is a confident one-click. Operator noted extra items to fold in.

### First task

Read `petey-plan-0457` + the comp/claim/email wiring; prove each seam green; surface the
exact send trigger + any gaps.

## Review log

## Hostile close review

- **Giddy:** pass — no schema/shared-primitive/app-logic touched; leaf lineage components +
  inert removal + additive CSS classes; net −10 LOC.
- **Doug:** pass — gates green; FI-005a render-verified @390px; e2e assertion audit clean; V1
  (default) covered alongside the cited V2.
- **Desi:** pass — removes a permanent "coming soon" promise; student-count reads cleanly
  next to long belt labels; rank badge wraps.
- **Kaizen:** 9/10 — clean behavior-preserving polish; −1 for full e2e not run (browser MCPs
  sibling-locked) and 3/5 items being stale-resolved (ledger hygiene debt, now paid).

## ADR / ubiquitous-language check

- ADR update not required (behavior-preserving UI polish; no decision reversed).
- Ubiquitous language update not required.

## Reflections

Three of the five "bundle" items were already resolved in SESSION_0419/0420/0501 but never
crossed off — the same "ledgers overstate remaining work" pattern as the #186 belt lane. The
lane's real value was as much **ledger hygiene** (verify + cross off) as new code. The one
non-obvious scope catch: the ledger cited `students-carousel-v2.tsx`, but V2 is `?cards=v2`
opt-in and V1 is the default — fixing only the cited file would have left the visible surface
unfixed. Reading the render path (who actually mounts the component) before trusting the
ledger's file pointer caught it.

## Full close evidence

| Step | Proof |
| --- | --- |
| Fixes applied | git diff — 3 files, +7/−17 |
| Gates | typecheck ✓ · oxlint ✓ · oxfmt ✓ |
| Render | FI-005a @390px, docScrollW=390, no overflow |
| Git hygiene | see commit below |
