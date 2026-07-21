---
title: "SESSION 0588 — merged-trunk code-quality suite over the 0583–0586 sweep range"
slug: session-0588
type: session--review
status: closed
created: 2026-07-20
updated: 2026-07-21
last_agent: claude-session-0588
next_session: session-0589
sprint: S12
lane: repo
recipe: review
goal_ids: [G-022, G-023]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0587.md
  - docs/protocols/page-code-review.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0588 — merged-trunk code-quality suite

> **Pre-staged stub (ADR 0049).** Created at SESSION_0587 bow-out. Reservation branch
> `session-0588-quality-suite-review`. The operator holds the finalized bow-in prompt (delivered
> in the 0587 chat); adopt this stub, verify the number via FS-0030, and run.

## Date

2026-07-20

## Operator

Brian + claude-session-0588

## Goal

Run the **merged-trunk variant** of the code-quality suite (`docs/protocols/page-code-review.md`,
SESSION_0567 shape) over the SESSION_0587 merged trunk (0583–0586 on local `main`): fallow
baseline → scored review (`/code-quality` + Desi UX lens) → `/fallow-fix-loop` for Class-A /
hard-cap fixes (behavior-preserving) → re-verify → prove the fallow delta. **First:** review/tweak
the page-code-review recipe with the operator — possibly conform it into a
`docs/protocols/recipes/quality-suite.md` card (0584 recipe-card format).

## First task

Bow-in per ADR 0049; grill the operator on the recipe before running. Carry in: **0583's C5
selected→hover neighborhood-glow redesign needs a Desi/operator design sign-off** (0587 Giddy P3);
and the **apps/web fixture-ownership test class** (0587: 47 fail, proven non-regression; the fix is
unmerged `session-0551-test-infra` `9d845bdd`; if 0587's trunk is still held on that, note it).
Read `docs/sprints/SESSION_0587.md` (§Full close evidence + Open decisions) first.

## Bow-in

- **Branch:** reservation `session-0588-quality-suite-review` was **stale** (pointed at early-0587
  `b7ec83ae`; local `main` was not its ancestor). Reconciled: `git branch -f` moved it onto local
  `main` (e56a0701) — carried no unique work (verified `merge-base --is-ancestor b7ec83ae main`).
- **Repo state (confirmed):** origin/main at `85f61a9a` (through the 0586 merge — docs/scripts/clients
  pushed); local `main` at `e56a0701` carries the full 0587 trunk incl. the **HELD 0583 apps/web
  merge**. Push still held pending `session-0551-test-infra` (`9d845bdd`) + local-green.
- **FS-0030:** `ledger-id-next --prefix=SESSION` → 366 numbers claimed, highest SESSION_0589; 0588 valid.
- **Scope of review = the four-lane trunk diff** `9059a640..1e9799bf` (pre-sweep base → last lane
  merge; excludes the 0587 close-writer bookkeeping): **69 files, +5212/−764**. Code-bearing = **24
  files** (21 source + 5 test): 0583 apps/web ×6, 0585 scripts ×6, 0586 MMB ×12. Docs/`.claude` = 45
  (0584 governance — wiki-lint/pointer lens).

## Grill outcome (recipe finalized)

Grilled the operator on adapting `page-code-review.md` (per-page) into the merged-trunk variant.
Four decisions pinned:

1. **Scope = whole diff, all four lanes** (0584 docs get a wiki-lint / pointer-discipline lens, not
   `/code-quality`).
2. **Depth = score + fix** — full `/fallow-fix-loop`, prove the fallow delta down.
3. **Fix push = split by deploy unit** — 0584 docs + 0585 scripts fixes may push independently; 0583
   apps/web rides the 0551/BBL-prod hold; 0586 MMB rides its own deploy.
4. **Write the card** — conform into `docs/protocols/recipes/quality-suite.md` (0584 card format);
   `page-code-review.md` stays the per-page SoT, the new card is its merged-trunk sibling. This run = the card's test case.

Two locked assumptions: **re-verify bar = delta-neutral** (no NEW failing files vs 0587's documented
fixture-ownership set — absolute green blocks on 0551, out of scope); **Desi C5 hover-glow = a design
recommendation only** (any behavior change is a logged Step-3 exception needing operator ratification).

## Fallow baseline (Step 1 — captured before any edit)

`npx fallow audit --changed-since 9059a640 --gate all` (JSON at scratchpad `fallow-baseline.json`):

| Metric | Total | Scoped hotspots (maxCRAP) |
| --- | --- | --- |
| Complexity | 23 findings | `technique-graph.tsx` 9×/**306** · MMB `sales/page.tsx` 3×/156 · MMB `actions.ts` 6×/110 · MMB `app/page.tsx` 1×/90 · `ledger-id-next.ts` 2×/42 · `ledger-backlog.ts` 1×/42 |
| Duplication | 2 clone groups | MMB `seed.ts` ↔ `apps/baseline/prisma/seed.ts` (cross-product seed) · MMB `sales/loading.tsx` ↔ `sales/page.tsx` (skeleton) |
| Dead code | 34 issues | 0 within the 24-file scope (all out-of-scope churn) |

## Petey plan

Execution shape (fan-out justified — disjoint deploy-unit file sets):

- **Review pass (read-only, scored):** 0583 apps/web → Desi (UX + C5 hover-glow sign-off) + `/code-quality`
  (highest scrutiny — member-facing, BBL-prod, CRAP 306); 0586 MMB → `/code-quality` + Doug (client gates);
  0585 scripts → `/code-quality` (+ optional D-051 parser pickup in `state-of-project-parse.ts`); 0584
  docs → wiki-lint + pointer/backlink discipline (Giddy-lens lite).
- **Fix pass:** `/fallow-fix-loop`, behavior-preserving, per deploy unit; re-verify delta-neutral; prove fallow delta down.
- **Deliverable:** the `recipes/quality-suite.md` card + logged baseline→final deltas.

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0588_TASK_01 | done | Grill + finalize recipe (4 decisions pinned); scope + fallow baseline captured |
| SESSION_0588_TASK_02 | done | Wrote `recipes/quality-suite.md` card (0584 format); lint-clean |
| SESSION_0588_TASK_03 | done | Review wave (Desi/0583 + Doug/0586+0585 + Giddy/structural+seed) — verdicts below |
| SESSION_0588_TASK_04 | done | Fixes landed (6 commits): docs (`f03daa62`), MMB (`f9ef17f1`), apps/web (`9d116d0e` + re-verify fix `b89960d0`) |
| SESSION_0588_TASK_05 | done | Re-verify (Doug GO · live C5 PASS · delta-neutral · fallow neutral) → rebased onto origin → **pushed `63f686c4` (BBL+MMB deploys fired)** |

## Fix pass — commits (on `session-0588-quality-suite-review`)

| Commit | Deploy unit | What |
| --- | --- | --- |
| `f03daa62` | docs (free) | D-051 RESOLVED (parser already correct, verified) + D-053 (skill-pair hardlink drift) |
| `f9ef17f1` | MMB | Lead Source facet counts refresh after board save (P2) + parity note + P3s (attemptsByProject, types.ts) |
| `9d116d0e` | apps/web (BBL) | PNG-export → `graph-png-export.ts` · 4 color-maps → 1 `NODE_TYPE_STYLES` · `@why` · inventory · **C5 two-stage tap (ratified behavior change)** |
| `b89960d0` | apps/web (BBL) | re-verify fix: `withExportSafeStyles` module-private (removed the +1 dead-code the extraction introduced) |

## Re-verify (Step 4)

- **Doug: GO** — PNG-export byte-identical (crop math + html2canvas call + OKLab-can't-reach-capture); color-map identical across all 4 `GraphNodeType` members; C5 state machine correct on all 6 scenarios; NO-LEAK intact (`node-tooltip.ts` untouched); MMB `onAfterSave`/`aliveRef` sound; MMB typecheck clean.
- **Live C5 touch (real Playwright `hasTouch`):** fresh first-tap → select+glow, NO dialog ✓ · second-tap → dialog opens ✓ · different-node tap → selection moves, no dialog ✓ · Esc → dialog+selection cleared ✓ · mouse click → opens immediately ✓ (Claude_Browser). The one ratified behavior change is verified working.
- **apps/web delta test: 1554 pass / 3 fail** — all 3 (`drift-audit`, `lead-country`, `node-profile-actions`) are the documented DB-adapter/hook-timeout contention class, **zero in the diff → delta-neutral** (far cleaner than 0587's contaminated 47).
- MMB client gates: typecheck ✓ · test 40 pass ✓ · build ✓ · oxlint clean. wiki-lint 0 errors.

## Fallow delta (Step 5) — `9059a640..HEAD`

| Metric | Baseline | Final | Note |
| --- | --- | --- | --- |
| dead-code | 34 | **34** | +1 from the extraction (unused export) caught + fixed in re-verify → neutral |
| duplication | 2 | 2 | seed dupe = intentional-leave (ADR 0038); skeleton dupe = pre-existing P3 |
| complexity findings | 23 | 23 | **redistributed**: `technique-graph.tsx` 9→7 (1003→895 LOC), export mass isolated to `graph-png-export.ts` |
| `technique-graph.tsx` maxCRAP | 306 | 306 | **honest caveat:** the 306 fn is `TechniqueGraph` itself (component body) + 210 `handleNodeLayerKeyDown`, NOT the PNG-export — a further render-decomposition = ticket, not this pass |

## Push — DONE (operator "push it")

The 0587-trunk hold cleared mid-close: origin/main had advanced to `8b26c537` (0587 trunk merged — the
0583 apps/web already on origin), so the stacking block dissolved. **Note: the 0551 fixture-ownership fix
is still NOT on origin** — the 0587 trunk was pushed without it, waiving that condition; 0588's bar is the
same delta-neutral standard (met). Rebased my 6 commits onto origin/main (zero conflicts — disjoint file
sets), re-gated (typecheck ✓ · `next build` ✓ green in 3.0min · wiki-lint 0 err), and **pushed on the
operator's explicit "push it": `8b26c537..63f686c4 HEAD -> main`** (clean fast-forward, no force). Post-rebase
commit hashes: docs `69cbe7a3`, MMB `7cb7a112`, apps/web `d633d456` + `c9b5a453`, session records `f5e91d2f`/`63f686c4`.
**Deploys fired automatically:** BBL prod (`blackbeltlegacy.com`, apps/web → C5 touch + PNG refactor LIVE) + Mammoth (facet-counts fix).

## Review wave — verdicts + scores

| Lane | Reviewer | Verdict / scores |
| --- | --- | --- |
| 0583 apps/web | Desi | SHIP, no P1. graph 7.0 (CRAP-306, separable PNG-export) · curriculum 7.7 · tooltip 9.0 · utils 9.3 (flag-only). **C5 hover-glow = KEEP.** |
| 0586 MMB | Doug | SHIP 8.3. lead-source/facet 9.2–9.3 gold. P2 = stale facet counts after intake. Parity = by-design. |
| 0585 scripts | Doug | SHIP 9.0. **D-051 already done in code** (verified). |
| 0584 docs | Giddy | Structural PASS (no P1). Pointer-discipline PASS. seq-research-recommend skill = unlinked copies → D-053. |
| seed dupe | Giddy `/rr` | **Leave — intentional divergence** (ADR 0038: seeds are per-product; "clone" = ~5 lines boilerplate). No build. |

## Decisions resolved (operator, SESSION_0588)

- **C5 hover-glow: KEEP + build touch-parity now** (first-tap selects+glows, second-tap opens) — ratified
  behavior change (Step-4 exception; the only non-behavior-preserving item this pass).
- **Cross-surface facet parity = BY DESIGN** (cockpit = active-only; board = all projects) — document in-code, no behavior change.
- **0583 scope = all P2 incl. PNG-export extraction.**
- **D-051 → RESOLVED** (parser already correct); **D-053 opened** (skill-pair hardlink drift — durable-guard fix direction).

## What landed

- **Ran the merged-trunk quality suite** over the 0583–0586 trunk (24 code files) end-to-end and **conformed
  it into a reusable recipe card** `docs/protocols/recipes/quality-suite.md` (0584 format) — this run = its test case.
- **3-reviewer wave** (Desi/0583, Doug/0586+0585, Giddy/structural + seed `/rr`): no P1 blockers, all lanes SHIP.
- **Fixes (6 commits, pushed `63f686c4`):** D-051 closed (parser already correct — verified) + D-053/D-054 opened ·
  MMB facet-counts refresh-after-save + parity note + 2 P3s · apps/web PNG-export extraction + color-map
  consolidation + inventory + `@why` + **C5 two-stage touch tap (ratified behavior change)** + re-verify un-export fix.
- **Verified:** Doug GO · live C5 touch PASS (real Playwright) · delta-neutral apps/web test (1554/3, none in diff)
  · fallow delta neutral · MMB gates green · build green.
- **Pushed** (operator "push it") after the 0587 hold cleared → BBL prod + Mammoth deploys fired.

## Files touched (this session's commits)

- `docs/protocols/recipes/quality-suite.md` — NEW recipe card (merged-trunk quality suite).
- `docs/knowledge/wiki/drift-register.md` — D-051 RESOLVED; NEW D-053 (skill hardlink), D-054 (graph god-component).
- `docs/knowledge/wiki/custom-component-inventory.md` — 3 technique-graph component rows (Cody).
- `apps/web/components/web/techniques/graph-png-export.ts` — NEW (extracted PNG-export hook).
- `apps/web/components/web/techniques/technique-graph.tsx` — color-map consolidation + `@why` + C5 two-stage tap.
- `clients/mammoth-build-crm/{app/app/page.tsx,app/app/sales/page.tsx,lib/actions.ts,lib/board-store-db.ts,lib/types.ts}` — facet-counts refresh + parity note + P3s.
- `docs/sprints/SESSION_0588.md` — this record.

## Reflections

- **Verify a reviewer's ledger claim before editing the ledger.** Doug flagged D-051's "Remaining" note as
  factually wrong; I confirmed against the actual parser (`/^closed/i`) + tests + corpus grep before closing it.
- **The CRAP-306 assumption was wrong — the delta proved it.** Everyone (Desi, Cody, me) assumed the PNG-export
  was the 306 mass; the fallow delta showed the export was CRAP-240 and the 306 is the component body itself.
  A delta measurement is worth more than a plausible pre-assumption. → D-054.
- **The re-verify caught what the build didn't.** typecheck + build were green, but the fallow delta caught a
  +1 dead-code (an unused export left by the extraction). Gates ≠ delta-neutral; run the delta.
- **Synthetic pointer events don't reach React — real touch does.** My `dispatchEvent(PointerEvent)` left the
  `pointerType` ref stale ("mouse"), producing a false failure; Playwright `hasTouch` + `touchscreen.tap` was
  the faithful vehicle and confirmed all C5 scenarios. For a ratified interaction change, emulate real input.
- **Two sessions in one canonical checkout WILL collide.** The parallel 0589 planning session checked out its
  branch in the shared tree, so my first commit landed on 0589's branch. Worktree isolation is not optional for
  parallel lanes — I moved 0588 to `../ronin-0588` and the rest was clean. (See memory.)

## Review log

### SESSION_0588_REVIEW_01 — quality-suite review wave (Desi + Doug + Giddy)

- **Range:** the 0583–0586 trunk + the fix diff. **Verdicts:** all SHIP, no P1. Scores — 0583 graph 7.0 /
  curriculum 7.7 / tooltip 9.0 / utils 9.3; 0586 MMB 8.3 (facet 9.2–9.3); 0585 scripts 9.0. Covers TASK_03/04/05.
- **Re-verify:** Doug GO (behavior-preservation A–E all PASS); live C5 touch PASS; delta-neutral test; fallow
  neutral. Unresolved → ledger: D-053 (skill hardlink guard), D-054 (graph render-decomposition). C5 mobile
  touch-parity was BUILT this session (not deferred). Seed dupe = leave (Giddy `/rr`, ADR 0038).

## ADR / ubiquitous-language check

- **No ADR this session.** ADR 0051 (portfolio taxonomy) landed via the parallel 0589 lane, not here. The
  quality-suite recipe is a protocol card, not an architectural decision. No new domain terms.

## Full close evidence

| Step | Proof |
| --- | --- |
| Task log | 5 rows, all done (gate runner PASS). |
| JETTY/frontmatter sweep | `drift-register.md` bumped `last_agent`→0588; recipe card + inventory carry fresh frontmatter. |
| Backlinks/index sweep | `quality-suite.md` `pairs_with` page-code-review/review-wave/fallow-fix-loop/code-quality (reciprocal via SOT_Cookbook backlink). No new index rows needed. |
| Wiki lint | `bun run wiki:lint` → **0 errors / 61 warnings** (all pre-existing R8 in unrelated files; none introduced). |
| Kaizen reflection | Present (`## Reflections`, 5 notes). |
| Hostile close review | Giddy structural pass ran IN the wave (PASS, no P1); Doug GO on the fix diff. Not re-run at close. |
| Code-quality gate (Class-A) | `/code-quality` scored per file in the wave (technique-graph 7.0, etc.) — the session's core deliverable. |
| Runtime verification (Doug) | Live C5 touch (real Playwright `hasTouch`) PASS; mouse path PASS (Claude_Browser); MMB gates green. |
| Evidence-artifact URL | n/a — live verification was pass/fail behavioral assertions (no visual artifact worth publishing); screenshots were interim only. |
| Review & Recommend | Next session written below. |
| Memory sweep | Appended the parallel-checkout-collision lesson to `adr-0049-session-numbering` memory. |
| Next session unblock check | Unblocked (follow-ups are ledgered D-053/D-054; not blocking). |
| Git hygiene | branch `session-0588-quality-suite-review` (merged to origin/main via `HEAD:main`); pushed `63f686c4`; worktree `../ronin-0588` to be removed post-close-docs push. Secret scan clean. |
| Graphify update | nodes=15190 · edges=33080 · communities=1742 (gate runner). |

## Next session

### Goal

Follow-ups from the 0588 quality suite (both ledgered, low-priority — pick when the backlog surfaces them,
or defer to the 0589-planned pipeline 0590–0596): **D-054** — extract `GraphNodeLayer` from `TechniqueGraph`
to cut the CRAP-306 god-component (behavior-preserving, re-verify with the C5 touch pass); **D-053** — a durable
`.agents`↔`.claude` skill-pair byte-identical guard (gate or bootstrap re-link). Neither blocks; the live
backlog (`board-backlog.ts` / the 0590–0596 stubs) governs the actual next pick.

### First task

Per the operator's `/goal` or the top board-backlog item at next bow-in. No dedicated stub minted — the
0589 fan-out already staged 0590–0596; these two follow-ups live as D-053/D-054 in the drift-register.
