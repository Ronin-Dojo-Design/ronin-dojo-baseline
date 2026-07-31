---
title: "SESSION 0727 — Chart the RankEntry-unification Wayfinder (HITL) + size the roster backfill"
slug: session-0727
type: session--staged
status: staged
created: 2026-07-30
updated: 2026-07-30
last_agent: claude-session-0723
sprint: S13
lane: bbl
recipe: "wayfinder-epic-charting"
goal_ids: []
tickets: []
next_session:
pairs_with:
  - docs/sprints/SESSION_0723.md
  - docs/product/black-belt-legacy/rankentry-unification-epic.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0727 — Chart the RankEntry-unification Wayfinder + size the roster backfill

> **Staged by SESSION_0723** (the 3-lane claim-loop wave). SESSION_0725's related-profiles rail
> exposed that the entire BBL public roster has **0 rank rows in either model** (RankEntry or
> RankAward) on the local prodsnap — so the discipline signal is dark. Operator elected to treat
> the whole **"Retire RankAward, unify on RankEntry"** epic (`rankentry-unification-epic.md`,
> ADR 0058) as a **Wayfinder** map (Pocock-style epic charting): get the HITL decisions done
> attended, then fan the mechanical work out to autonomous Claude/codex sessions via the
> `Weight: full|quick` ticket routing. **This is a PLAN/CHART-first HITL session — do NOT run the
> prod backfill here.** Adopt: flip `status:` → `in-progress`.

## Goal

Chart the RankAward→RankEntry epic as a `wayfinder:map` (HITL), size the roster VERIFIED-status
backfill against **real prod** state, and seed the autonomous `quick` tickets (ADR-0058 read-sweep,
test-gate fix, backfill script — dry-run only) so they can fan out cold.

## Resolved forks (operator, SESSION_0723 — do not re-open)

- **Backfill rank status = VERIFIED** (session-0522 precedent: "everyone on the canonical tree is
  verified"). Surface the deeper *provenance* question separately (see open decisions).
- **Autonomous executor = either** — write the `quick` batons model-agnostic (Claude OR codex).
  Codex Keychain **build wall**: codex may edit, but final `next build`/gate verification runs on
  Claude or a foreground gate. Note the hand-off in each baton.

## Tasks

### SESSION_0727_TASK_01 — Verify real prod RankEntry coverage (read-only)
- **Agent:** Petey (HITL) · **Depends on:** nothing
- **Steps:** Query **prod** (not the local snapshot) for how many BBL-tree passports carry a
  RankEntry; identify whose the existing ~14 RankEntry / ~15 RankAward rows are (did SESSION_0522 /
  SESSION_0524 belt-backfills actually apply?). Local snapshot showed **0/78** — confirm whether
  that's a stale-snapshot artifact or genuine.
- **Done means:** a real prod number + a sizing verdict (already-done / small / full-roster backfill).

### SESSION_0727_TASK_02 — Create the RankEntry-epic Wayfinder map (`/wayfinder`)
- **Agent:** Petey + operator (HITL charting) · **Depends on:** TASK_01
- **Steps:** New `wayfinder:map` GitHub issue from `rankentry-unification-epic.md` + ADR 0058 +
  `rank-entry-unified-data-flow.md` + TASK_01's numbers. **Destination:** *"RankAward retired,
  RankEntry the ONE model, all reads migrated, roster ranks backfilled VERIFIED, IMPORTED-provenance
  preserved, table-drop (G-011) sequenced."* Weight + agent-route every ticket. Then the Pocock
  pipeline runs the destination through `/to-spec` → `/to-prd` → `/prototype` as tickets **on** the
  map (not this session).
- **`full` (HITL) tickets to seed:**
  1. **IMPORTED-provenance preservation** — `rankEntryStatusForAward` collapses `IMPORTED→VERIFIED`,
     discarding the provenance the belt-gate depends on (imported = authority-owned/read-only). Decide:
     a `provenance`/`source` column on RankEntry vs. accept the collapse. **Do not silently backfill
     past this.**
  2. **Backfill scope** — full BBL roster vs. `rigan-machado-lineage` only (status already VERIFIED).
  3. **Table-drop sequencing** — confirm still parked post-FI-001-send (G-011).
- **`quick` (autonomous) tickets to seed:** ADR-0058 read-sweep + guard · lineage test-gate fix ·
  the backfill **script** (dry-run only until an attended `--apply`).
- **Done means:** map issue exists; full/quick tickets enumerated with `Weight:`/`Agent:` lines;
  the two ready `quick` lanes below have paste-ready batons.

## Staged autonomous lanes (model-agnostic — dispatch after the map exists)

Both AFK-safe, provably-disjoint file sets — fan out to Claude OR codex:

- **LANE Q-④ — ADR-0058 read-sweep + CI guard.** Repoint remaining `RankAward` **readers** →
  `RankEntry` (`apps/web/server/web/disciplines/top-ranked-queries.ts` + any others found via
  `grep -rn 'rankAward' apps/web/server apps/web/app`) and add a grep gate to `scripts/githooks` /
  CI that fails on **new** `RankAward` *reads*. **Writes still legitimately use RankAward** (the
  `RankEntry.rankAwardId` anchor is required until the G-011 cutover) — sweep READS only. Owned:
  the stale-reader files + a new guard script. AFK-safe (no migration).
- **LANE Q-⑤ — lineage test-gate fix** (chip `task_6beb8b80`). Fix the `slice(0,16)` Discipline-code
  truncation-collision in `apps/web/server/web/lineage/node-profile-actions.test.ts` (unique
  collision-free codes) + stabilize the P2002/P2034 cross-suite concurrency flakes in
  `lineage-member-placement.test.ts` + `reconcile-pending-claims.test.ts`. Acceptance: full
  `bun test --parallel=1 --path-ignore-patterns='e2e/**'` green across 3 repeats. Owned: those
  test/fixture/seed-helper files only. AFK-safe (test-only).

## Open decisions (route as `full` tickets — do NOT pre-resolve)

- IMPORTED-provenance on RankEntry (belt-gate authority) · backfill scope · table-drop timing.

## Risks

- **IMPORTED→VERIFIED collapse** silently drops belt-gate provenance — a decision ticket, never a
  backfill default.
- Backfill = **prod-DB write = AFK-NEVER** → dry-run always; `--apply` only attended.
- `/to-spec` (module-impact quiz → spec) lives in the **mattpocock-skills plugin** (upstream Pocock —
  screenshot-confirmed SESSION_0723). The local `.agents/skills/` Pocock family is a **stale sync
  missing it**; run `/plugin install mattpocock-skills` (interactive Claude Code) before 0727 to get
  `/to-spec` + refreshed `/wayfinder` · `/to-prd` · `/prototype`. Pipeline = `/wayfinder` → `/to-spec`
  → `/to-prd` → `/prototype`.
- Local prodsnap may be stale vs SESSION_0522/0524 → TASK_01 is the guard.

## Scope guard

0727 **charts + sizes only.** It does NOT run the prod backfill, the read-sweep, or the test-fix —
those are tickets/lanes that fan out after.

## Baton (paste-ready — a fresh session/agent adopts this to run 0727 cold)

```
/bow-in — HITL Wayfinder-charting session. Adopt SESSION_0727 (flip status → in-progress). Repo:
black-belt-legacy (ONE repo, ADR 0059). This CHARTS an epic; it does NOT run any prod write.

FIRST: open the RankEntry epic SoT — docs/product/black-belt-legacy/rankentry-unification-epic.md +
docs/adr/0058-rankentry-is-rank-truth.md + rank-entry-unified-data-flow.md. Run /gq "RankEntry
RankAward retire epic reads migration provenance" to map remaining consumers.

TASK 1 (read-only, HITL): verify PROD RankEntry coverage for the BBL roster (not the local snapshot).
How many BBL-tree passports have a RankEntry in prod? Whose are the existing ~14 RankEntry / ~15
RankAward rows — did SESSION_0522/0524 belt-backfills apply? Report a sizing verdict (done / small /
full-roster). Prod read only — no writes.

TASK 2 (HITL, /wayfinder): create the wayfinder:map GitHub issue for the epic. Destination = "RankAward
retired, RankEntry the ONE model, reads migrated, roster ranks backfilled VERIFIED, IMPORTED-provenance
preserved, G-011 table-drop sequenced." Seed tickets with Weight:/Agent: lines —
  full (HITL, operator-answered, never self-answer): (1) IMPORTED-provenance on RankEntry — column vs
    IMPORTED→VERIFIED collapse (belt-gate authority); (2) backfill scope (full roster vs
    rigan-machado-lineage; status already VERIFIED); (3) table-drop timing (post-FI-001-send).
  quick (autonomous, model-agnostic Claude/codex): (4) ADR-0058 read-sweep + CI guard (repoint
    RankAward READERS→RankEntry incl. top-ranked-queries.ts; guard new RankAward reads; writes keep
    RankAward until G-011); (5) lineage test-gate fix (task_6beb8b80); (6) backfill SCRIPT (extend
    session-0522-belt-backfill.ts pattern; dry-run ONLY, --apply is a later attended ticket).
Then run the destination through /to-spec → /to-prd → /prototype as tickets ON the map. (Requires
/plugin install mattpocock-skills first — the local Pocock skills are a stale sync missing /to-spec.)

RESOLVED (don't re-open): backfill status = VERIFIED (0522 precedent); autonomous exec = either
(codex build-wall → gates on Claude/foreground). HITL invariant: prod backfill is AFK-NEVER —
dry-run→attended --apply only; never self-answer a full ticket. Merge/prod actions HOLD for operator.
```

## Next session

<!-- staged by 0727 at its own bow-out -->
