---
title: "SESSION 0703 — WL triage sweep (4 rows)"
slug: session-0703
type: session--open
status: closed
created: 2026-07-25
updated: 2026-07-25
last_agent: cody-session-0703
sprint:
lane: repo
lane_seq:
recipe: "lane"
vault_session:
goal_ids: []
tickets: []
next_session:
pairs_with:

  - docs/sprints/SESSION_0692.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0703 — WL triage sweep (4 rows)

## Date

2026-07-25

## Operator

Brian + cody-session-0703

## Goal

Verify 4 triage-flag wiring-ledger rows (WL-P2-61, WL-P3-26, WL-P2-3, WL-P2-4) against current
`main` code in the `ronin-0703` worktree. Read-only triage — no app-code builds, no ledger edits
(proposals only, for the merge owner to apply).

## Status

Single source of truth is the frontmatter `status:` field. See `## Full close evidence` below.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0692.md` (email dryrun seam) — unrelated to this
  triage sweep; this lane was dispatched directly with its own scope.

### Branch and worktree

- Branch: `auto/session-0703-wl-triage-sweep`
- Worktree: `/Users/brianscott/dev/ronin-0703`
- Status at bow-in: clean, checked out at `main` `b615cd75`
- Current HEAD at bow-in: `b615cd75`

### Dirstarter alignment

Not applicable — docs-only triage lane, no code changes.

### Graphify check

Not run — this lane's discovery is 4 pre-specified ledger rows with pre-specified file:line
citations; no repo-wide sweep needed. Each cited file was opened directly and re-verified with
targeted `grep -n` inside those files.

## Petey plan

### Goal

Verify each of the 4 rows' cited files/lines against current `main`; produce a verdict
(STILL-VALID / STALE / RESCOPE) with file:line evidence per row.

### Tasks

#### SESSION_0703_TASK_01 — WL-P2-61 verify

- **Agent:** Cody
- **What:** Confirm the 5 select-column deviation surfaces still exist as described.
- **Steps:** Read `certificates`/`courses`/`programs`/`tournaments`-table-columns.tsx (base-UI
  `Checkbox`), `people-table-columns.tsx` (`RowCheckbox` + `disabled` gate), and
  `select-column.tsx`'s own docstring.
- **Done means:** Verdict + evidence recorded below.
- **Depends on:** nothing

#### SESSION_0703_TASK_02 — WL-P3-26 verify

- **Agent:** Cody
- **What:** Confirm `students-carousel.tsx:78` V1 rail + bake-off-frozen status.
- **Steps:** Read the file, confirm line 78 content, confirm V1/V2 toggle still live in
  `lineage-view-a-island.tsx`.
- **Done means:** Verdict + evidence recorded below.
- **Depends on:** nothing

#### SESSION_0703_TASK_03 — WL-P2-3 verify

- **Agent:** Cody
- **What:** Confirm the 3 cited `rounded-md border p-3` list-row blocks, and check the row's own
  "extract only if a 4th instance appears" threshold against current repo state.
- **Steps:** Read the 3 cited files/lines; grep the repo for the same class pattern to count
  live instances.
- **Done means:** Verdict + evidence recorded below.
- **Depends on:** nothing

#### SESSION_0703_TASK_04 — WL-P2-4 verify

- **Agent:** Cody
- **What:** Confirm `black-belt-rail.tsx` still reads `Rank.colorHex` with a muted fallback, and
  whether the "seed colorHex for all system rank sets" action item is still open.
- **Steps:** Read `black-belt-rail.tsx` + `black-belt-rail-list.tsx` + `belt-swatch.tsx`; grep
  `prisma/seed.ts` rank arrays for missing `colorHex`.
- **Done means:** Verdict + evidence recorded below.
- **Depends on:** nothing

### Parallelism

All 4 tasks are read-only file inspections on disjoint file sets; run sequentially in one pass
(single agent, no sub-agent fan-out needed for a triage this small).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0703_TASK_01..04 | Cody | Read-only verification against cited file:line evidence |

### Open decisions

None — this lane proposes ledger edits, it does not apply them.

### Risks

None at plan-lock.

### Scope guard

- No edits to `docs/knowledge/wiki/wiring-ledger.md` (shared ledger — merge owner applies).
- No app-code changes.
- No merge, no push to `main`, no deploy.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0703_TASK_01 | landed | WL-P2-61 verified STILL-VALID |
| SESSION_0703_TASK_02 | landed | WL-P3-26 verified STILL-VALID |
| SESSION_0703_TASK_03 | landed | WL-P2-3 verified RESCOPE (line drift + threshold crossed) |
| SESSION_0703_TASK_04 | landed | WL-P2-4 verified STILL-VALID |

## Per-row verdicts

| Row | Verdict | Evidence |
| --- | --- | --- |
| WL-P2-61 | STILL-VALID | `apps/web/app/app/certificates/_components/certificates-table-columns.tsx:19-29`, `courses-table-columns.tsx:21-31`, `programs-table-columns.tsx:21-31`, `tournaments-table-columns.tsx:18-28` — all 4 still use `~/components/common/checkbox` `Checkbox` (not `selectColumn`/`RowCheckbox`). `apps/web/app/app/users/_components/people-table-columns.tsx:58-80` — still `RowCheckbox` with `disabled={!hasAccount(row.original) \|\| isAdmin(row.original.user)}` (line 80). `apps/web/components/data-table/select-column.tsx:1-13` docstring explicitly names these 5 surfaces as intentionally-not-migrated. Row stands unchanged. |
| WL-P3-26 | STILL-VALID | `apps/web/components/web/lineage/students-carousel.tsx:78` is still `<section aria-label="Students">` (bare, no width guard) with `overflow-x-auto` on the inner row (line 93). `apps/web/components/web/lineage/lineage-view-a-island.tsx:129-137` — the `?cards=v2` bake-off toggle is still live, defaulting to `"v1"` (`studentsCarouselVariant` state), so V1 remains the frozen baseline exactly as the row states. `students-carousel-v2.tsx` confirmed present as the V2 sibling. Row stands unchanged. |
| WL-P2-3 | RESCOPE | Cited files still carry the pattern: `app/(web)/programs/[id]/schedules/[scheduleId]/page.tsx` — `<li>` block with `rounded-md border p-3 text-sm` now at line 126 (cited :130 is the `</span>` 4 lines later inside the same `<li>` — minor drift, same block). `components/web/schedules/schedule-instructor-list.tsx:81` — exact match, unchanged. `components/web/lineage/lineage-rank-history-tab.tsx` — the block moved from :97 to :111 (`RankAwardRow`'s `<article>`) and gained a `bg-background` insertion mid-className (`"relative overflow-hidden rounded-md border bg-background p-3"`), so the literal `rounded-md border p-3` substring no longer matches at that file (still the same conceptual row pattern, just with an extra utility class + drifted line number). **New evidence beyond the 3 cited files:** the same list-row block pattern (`rounded-md border ... p-3` inside a `.map()`) now also appears at `apps/web/app/app/tools/_components/tool-form.tsx:559` (`tierOptions.map`), `apps/web/app/(web)/dashboard/events/promotion-event-editor-form.tsx:233` (`rankAwards.map`), `apps/web/components/web/lineage/lineage-rank-progression-panel.tsx:93` (`ProgressionRow`, itself `.map()`-rendered), and `apps/web/app/(web)/lineage/[treeSlug]/claim/claim-form.tsx:247` (`fields.map`) — 4 additional instances, for 7 total repo-wide. The row's own stated action ("Extract a `ListRow` atom only if a 4th instance appears (YAGNI until then)") has its trigger condition **already met** — the count is 7, not 3. |
| WL-P2-4 | STILL-VALID | `app/(web)/disciplines/_components/black-belt-rail.tsx:22-34` still reads `getTopRankedMembersForDiscipline` (RankAward-backed) and renders via `BlackBeltRailList`. `black-belt-rail-list.tsx:34` passes `m.colorHex` into `<BeltSwatch colorHex={m.colorHex} />`. `components/common/belt-swatch.tsx` — `colorHex ?? BELTLESS_FILL` (`BELTLESS_FILL = "#6B7280"`, a fixed mid-gray) is the muted-token fallback described by the row (component has since grown a `dot`/`belt` variant system, SESSION_0539/0540, but the colorHex-driven-fallback substance is unchanged). Proposed action still open: `apps/web/prisma/seed.ts:850-876` (`pimaDenverRanks`, 22-rank Eskrima system) is typed `Array<{ name: string; shortName: string }>` — **no `colorHex` field at all** — confirming the "seed `Rank.colorHex` for all system rank sets" action item remains unaddressed. Row stands unchanged. |

## What landed

- 4 wiring-ledger rows re-verified against current `main` (`b615cd75`) from the `ronin-0703`
  worktree — 3 STILL-VALID, 1 RESCOPE. No ledger file edited (shared file; proposals below for the
  merge owner).

## Decisions resolved

None — triage only, no decisions required this lane.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0703.md` | New — this triage-sweep session file |

## Verification

| Command / smoke | Result |
| --- | --- |
| `grep -n "WL-P2-61\|WL-P3-26\|WL-P2-3\|WL-P2-4" docs/knowledge/wiki/wiring-ledger.md` | Located source rows 81, 82, 104, 143 |
| Manual `Read`/`grep -n` of every cited file:line | All 4 rows' citations opened and inspected (see Per-row verdicts evidence) |
| `grep -rln "rounded-md border p-3\|rounded-md border bg-background p-3"` repo sweep | 7 files total (was 3 at row-write time) — see WL-P2-3 evidence |

## Artifacts

None.

## Open decisions / blockers

- WL-P2-3's ledger text needs the merge owner's ratification on the proposed rescope below
  (line-number drift + the 4th-instance threshold already crossed).
- No blockers for the other 3 rows — proposals are close-outs only where noted (none of the 4
  rows close outright; all remain open with updated text).

## Proposed ledger edits

For the merge owner to apply to `docs/knowledge/wiki/wiring-ledger.md`. No row closes outright —
all 4 remain open, with WL-P2-3 getting a rescoped body; the other 3 are confirmed as-written
(no edit needed beyond an optional "reconfirmed SESSION_0703" note).

### WL-P2-61 — no edit needed

Reconfirmed exactly as written (SESSION_0703). Optional append to the notes cell:
`Reconfirmed still-open — SESSION_0703 (all 5 surfaces + selectColumn docstring unchanged).`

### WL-P3-26 — no edit needed

Reconfirmed exactly as written (SESSION_0703). Bake-off still live, `?cards=v2` still opt-in,
V1 still default. Optional append: `Reconfirmed frozen/open — SESSION_0703 (bake-off unresolved,
V1 still default).`

### WL-P2-3 — RESCOPE (replace the notes + action cells)

Replace the notes cell (currently: `Repeated \`rounded-md border p-3\` list-row blocks (3+
instances). These are _rows_, not cards — acceptable today.`) with:

```
Repeated `rounded-md border p-3`-family list-row blocks — now **7 instances**, not 3
(SESSION_0703 recount): the original 3 (`schedules/[scheduleId]/page.tsx:126`,
`schedule-instructor-list.tsx:81`, `lineage-rank-history-tab.tsx:111` — moved from :97, gained
a `bg-background` class) plus 4 more found this pass (`tool-form.tsx:559`,
`promotion-event-editor-form.tsx:233`, `lineage-rank-progression-panel.tsx:93`,
`claim-form.tsx:247`). These are still _rows_, not cards — acceptable today, but the row's own
"4th instance" trigger has fired.
```

Replace the action cell (currently: `Extract a \`ListRow\` atom only if a 4th instance appears
(YAGNI until then).`) with:

```
Trigger condition met (7 ≥ 4) — extract a shared `ListRow` atom the next time one of these 7
surfaces is touched; do not do a standalone sweep-and-extract PR for this alone (still YAGNI
against a dedicated slice, but the next incidental edit to any of the 7 should fold it in).
```

### WL-P2-4 — no edit needed

Reconfirmed exactly as written (SESSION_0703). `pimaDenverRanks` (22-rank Eskrima system,
`prisma/seed.ts:850-876`) still has zero `colorHex` coverage — the seed action item is still
open. Optional append: `Reconfirmed still-open — SESSION_0703 (pimaDenverRanks still 0/22
colorHex-seeded).`

## Next session

### Goal

Merge owner applies the WL-P2-3 rescope (and optional reconfirm notes on the other 3 rows) to
`docs/knowledge/wiki/wiring-ledger.md`; separately, someone picks up the still-open
`Rank.colorHex` seed gap for `pimaDenverRanks` (WL-P2-4) as its own small data task.

### First task

Apply the `## Proposed ledger edits` block above verbatim to the wiring ledger from the
canonical checkout, then close this row-tracking loop.

## Review log

### SESSION_0703_REVIEW_01 — Self-review (Cody, triage-only lane)

- **Reviewed tasks:** SESSION_0703_TASK_01, SESSION_0703_TASK_02, SESSION_0703_TASK_03, SESSION_0703_TASK_04
- **Dirstarter docs check:** not applicable (docs-only triage, no UI/component work)
- **Verdict:** All 4 rows checked against live file:line evidence, not vibes. 3/4 hold exactly
  as written; WL-P2-3 genuinely drifted (both a citation-line shift and, more importantly, its
  own stated re-evaluation trigger firing). No scope creep — did not touch the ledger file, did
  not build the `ListRow` extraction, did not seed `colorHex`.
- **Score:** 9.2/10
- **Follow-up:** Merge owner applies the WL-P2-3 rescope text.

## Hostile close review

- **Giddy:** pass — no silent negative assertions; every verdict backed by an opened file, not an
  errored grep.
- **Doug:** pass — no code changed, no authz/security surface touched.
- **Desi:** not applicable — no UI/UX touched (triage-only lane).
- **Kaizen aggregate:** 9.2/10 — clean, scoped, evidence-first triage; the one interesting find
  (WL-P2-3's crossed threshold) was chased down with a real repo grep instead of assumed.

### Findings (severity ≥ medium)

None.

## ADR / ubiquitous-language check

- ADR update not required — no architectural decision made, only a ledger-row status
  verification.
- Ubiquitous language update not required — no new domain terms introduced.

## Reflections

Two of the four rows (WL-P2-61, WL-P3-26) hold up nearly word-for-word months after they were
written — a good sign the original authors cited precise, load-bearing evidence rather than
vague description. WL-P2-3 is the interesting case: it's not that the row's *claim* went stale
(the pattern is still real), it's that the row *itself* set a numeric re-evaluation trigger
("4th instance appears") and nobody was watching for it to fire — the count quietly grew to 7
across four unrelated feature areas (tool tiers, promotion-event evidence checklists, rank
progression, lineage claim evidence) without anyone connecting them back to this row. That's a
process gap worth naming: rows with a numeric/conditional trigger need either a periodic sweep
or a grep-based check baked into the next surface that adds the pattern, not just a "come back
later" note.

WL-P2-4's `pimaDenverRanks` gap was easy to confirm because the seed helper's own TypeScript
type signature narrows to exclude `colorHex` for that one array — the absence is structurally
visible, not just an empty string. That's a nice property of this codebase's seed-data shape.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Frontmatter filled: `lane: repo`, `recipe: "lane"`, `last_agent: cody-session-0703`, `status: closed` |
| Backlinks/index sweep | Not applicable — no wiki page created/edited this lane (docs-only session file, ledger untouched per dispatch boundary) |
| Wiki lint | Not run — no `docs/knowledge/wiki/*` file edited this session |
| Kaizen reflection | See `## Reflections` above |
| Hostile close review | `SESSION_0703_REVIEW_01` above |
| Review & Recommend | Next session goal written above (merge owner applies WL-P2-3 rescope) |
| Memory sweep | No new standing rule surfaced worth a MEMORY.md entry — single-session triage finding, routed via the SESSION file's Proposed ledger edits instead |
| Next session unblock check | Next task is self-contained (apply the proposed edit block verbatim) |
| Git hygiene | Commit created this session (see PR) — see closing commit sha in the dispatch reply |
| Graphify update | Not run — canonical-only step, out of scope for a worktree triage lane per dispatch (`Worktree graphs read 0 nodes by design`) |
