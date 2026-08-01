---
title: "SESSION 0731 — All-hands polish pass on the 0730 diff (pre-#377): 9.2 → 9.8"
slug: session-0731
type: session--staged
status: staged
created: 2026-07-31
updated: 2026-07-31
last_agent: claude-fable-session-0730
sprint: S13
lane: bbl
recipe: "seq-review-wave"
goal_ids: ["G-011"]
tickets: ["#397", "#399"]
next_session:
pairs_with:
  - docs/sprints/SESSION_0730.md
  - docs/protocols/jetty-annotation-standard.md
  - docs/knowledge/wiki/files/design-system-grid-ratio-hierarchy.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0731 — All-hands polish pass (pre-#377): take the 0730 work from 9.2 to 9.8

> **Staged by SESSION_0730 (operator-directed at close).** The "all hands on deck review": every
> roster agent runs **two improvement passes** over the files the 0730 session touched (the #397 +
> #399 diffs). No canonical doc carries this name — the operator's spec below IS the spec; closest
> canon is `/seq-review-wave` + the SESSION_0305 Desi-design-review precedent. **#377 executes the
> session AFTER this (SESSION_0732)** — this pass sets the quality floor first.

## The target (why, ratified at 0730 close)

/ggr composite stands at **9.2**. The operator wants **9.8–10** before #377 locks the seam in.
Known caps to burn down (recorded in SESSION_0730 Review log + Codex/Giddy findings):
contract-only seam surface · 4 duplication clone families · Jetty-annotation gaps on changed
sites (under-described behavior changes) · Pocock self-documentation distance · verification-
process gaps (affected-e2e selection missed the lineage specs; no fallow baseline before Codex).

## The roster plan (Petey orchestrates; TWO passes per agent; grade at every step)

1. **Petey** — orchestrates; at each step reviews + **grades the PLANS + DOCUMENTATION** for the
   files involved (do the docs tell the truth the code tells? kill drift on sight; grade /10 per
   doc against plan-quality).
2. **Cody** — reviews + **grades the CODE + the SCHEMA** (functionality · no dead code · no dupes ·
   no complexity) with **one more `/fallow-fix-loop` pass**. Bar: Apple-quality — no god files;
   the **Matt Pocock concept**: the codebase ALONE tells the same story the docs do (module names,
   export surface, types encode the two-axis model / anchor / display law without prose); clean
   semantic **JETTY annotations** per [`jetty-annotation-standard.md`](../protocols/jetty-annotation-standard.md)
   (`@added/@why/@wired` on schema, JSDoc headers on modules — update `@wired` where consumers
   changed in #397).
3. **Desi** — **"Desi Design Review"** (SESSION_0305 precedent) on the SURFACES this session's work
   touched (directory profile ranks, lineage drawer/rank history, admin people, tournaments
   seeding surface, belt tab) against the **golden-ratio design system**:
   [`design-system-grid-ratio-hierarchy.md`](../knowledge/wiki/files/design-system-grid-ratio-hierarchy.md)
   (12-grid, golden ratio, visual hierarchy; canon = design-system-doctrine §3–§5, ADR 0040).
4. **Doug** — reviews + **grades the VERIFICATION PROCESS for each step of SESSION_0730's work**
   (grill → Codex → parity gate → policy build → CI loop → merge gate → prod verify → D-055
   response): what caught what, what should have caught it earlier, and the process fixes (e.g.
   affected-e2e selection law, fallow-baseline-before-refactor (FS-0042), the DB-blind-reviewer
   rule) — routed as ledger/protocol edits.
5. **Giddy** — final **`/ggr`** on the polished result. **Clear line for THIS session: 9.8+.**
   Record the composite; anything unreached routes to a ledger row, never silently dropped.

## Hard constraints (unchanged)

- Rank-awarded truth (ADR 0035/0058 display law) + status/provenance axes + belt-gate contracts +
  technique-media NO-LEAK. IMPORTED-lock stays LIFTED (operator ratification — a reviewer calling
  the missing lock a bug is wrong by ratification). Writes stay on RankAward until #380.
- **Schema stays FROZEN** (Fork 4 carries over) — DB-level provenance immutability is a #380 note.
- Behavior parity: polish must not change user-visible behavior; every refactor re-verified.
- #380 remains blocked on #398 (operator env-scoping). PR-only main; explicit push authorization.

## Baton (paste-ready)

```
/bow-in — All-hands polish pass (pre-#377), SESSION_0731. Adopt (flip status → in-progress).
Repo: black-belt-legacy. Scope = files touched by #397 + #399 (git show --stat 1c13dac9 + PR #399).
Petey orchestrates: TWO passes per agent, grade at every step. Cody: code+schema grade +
/fallow-fix-loop (Apple bar: no god files, Pocock code-tells-the-story, Jetty annotations per
docs/protocols/jetty-annotation-standard.md). Desi: design review of touched surfaces vs
docs/knowledge/wiki/files/design-system-grid-ratio-hierarchy.md (+doctrine §3–5). Doug: grade
SESSION_0730's verification process step-by-step; route process fixes. Petey: grade plans/docs
for the files (kill drift). Giddy: final /ggr — clear line 9.8+.
Constraints: behavior parity; schema frozen; IMPORTED-lock stays lifted; NO-LEAK; #380 blocked
on #398. HOLD every push. #377 is NEXT session (0732) — do not build the guard here.
```

## Next session

→ SESSION_0732 — **#377 CI read-guard** (build lane; stub staged by 0730, carried forward).
