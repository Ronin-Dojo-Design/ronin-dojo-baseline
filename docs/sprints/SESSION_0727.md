---
title: "SESSION 0727 — Chart the RankEntry-unification Wayfinder (HITL) + size the roster backfill"
slug: session-0727
type: session--plan
status: in-progress
created: 2026-07-30
updated: 2026-07-30
last_agent: claude-session-0727
sprint: S13
lane: bbl
recipe: "wayfinder-epic-charting"
goal_ids: ["G-011"]
tickets: ["#372", "#374", "#375", "#376", "#377", "#378", "#379", "#380", "#381"]
next_session: SESSION_0728
pairs_with:
  - docs/sprints/SESSION_0723.md
  - docs/product/black-belt-legacy/rankentry-unification-epic.md
  - docs/sprints/plans/petey-plan-0727-rankentry-wayfinder.md
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

## ⚡ Done ahead in SESSION_0723 (read this first — don't redo it)

- **`/to-spec` already ran** → the epic spec is **published: issue #372** (`ready-for-agent`) —
  problem/solution, 22 user stories, implementation + testing decisions, out-of-scope. **Do NOT re-run
  `/to-spec`.** 0727 starts FROM #372.
- **Seam decided (operator):** **one canonical rank-read seam** — collapse all rank READS onto a single
  `memberRanks`/`memberTopRank` module built on `RankEntry` (LR-0008 "one source read everywhere"),
  repointing the **~29** current `RankAward` readers (identity · belt · directory · passport ·
  promotion-events · lineage — NOT the "one surface" the stale July-10 epic doc claims).
- **Revised pipeline:** `/wayfinder` map (anchored on #372) → **`/to-issues` #372** into the AFK lanes →
  **`/prototype`** the one open shape (the `RankEntry` provenance field vs. the belt-gate). `/to-spec` +
  `/to-prd` are satisfied by #372.

## Goal

Chart the RankAward→RankEntry epic as a `wayfinder:map` (HITL), size the roster VERIFIED-status
backfill against **real prod** state, and seed the autonomous `quick` tickets (ADR-0058 read-sweep,
test-gate fix, backfill script — dry-run only) so they can fan out cold.

## Bow-in

- Adopted this staged stub (ADR 0049); canonical claimed for 0727 (FS-0035 check: free).
  Githooks doctor FAILED at start → `install.sh` re-run, all checks now pass (ADR 0053/0056).
- Prior sessions: 0726 (ACL viewer) **YES** — merged #369; staging parent 0723 **EXTENDED YES**.
- Parallel-lane assessment (G-023): single-lane — only PR #361 open (settings parity, no
  RankEntry overlap); no live 07xx branches/worktrees; no merge owner needed (docs-plan lane).
- **FS-0048 read-before-build sweep** (schema-validity verified by opening the real files, not
  names): spec [#372](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/372) ·
  ADR 0058 · `rank-entry-unified-data-flow.md` · `prisma/schema.prisma` (RankEntry +
  `rankAwardId` anchor + both status enums) · `server/belt/queries.ts`
  (`rankEntryStatusForAward` IMPORTED→VERIFIED collapse) · `server/belt/belt-gate.ts` (authority
  rule reads `award.verificationStatus` — the provenance dependency) ·
  `rank-entry-compatibility.ts` (`syncRankEntryFromAward`) · `scripts/session-0522-belt-backfill.ts`
  (the proven backfill pattern) · LineageNode/LineageTreeMember models (no belt fields on nodes;
  promotion edges carry `rankAwardId`). Graphify query mapped the epic docs/goal nodes (G-011).
- `/wayfinder` is vendored locally (`.claude/skills/wayfinder`) — used as the charting authority.

## Bow-in verdict (Petey Qs)

⓪ prev goal YES (0726, merged) · ① this lane = 0727 wayfinder charting · ② queue = FI-001/G-001
P0, PL-024, PR #361, 125 open ledger items · ③ no pivot (operator confirmed) · SotD publish: NO
(live `/app/state` cited).

## Resolved forks (operator, SESSION_0723 — do not re-open)

- **Backfill rank status = VERIFIED** (session-0522 precedent: "everyone on the canonical tree is
  verified"). Surface the deeper *provenance* question separately (see open decisions).
- **Autonomous executor = either** — write the `quick` batons model-agnostic (Claude OR codex).
  Codex Keychain **build wall**: codex may edit, but final `next build`/gate verification runs on
  Claude or a foreground gate. Note the hand-off in each baton.
- **Read seam = one canonical rank-read** (SESSION_0723 to-spec checkpoint) — build a single
  `memberRanks`/`memberTopRank` module on `RankEntry` and repoint all ~29 readers through it; test
  behavior once at that seam. (Rejected: repoint-in-place, which keeps the sprawl.) See #372.

## Tasks

### SESSION_0727_TASK_01 — Verify real prod RankEntry coverage (read-only)

- **Agent:** Petey (HITL) · **Depends on:** nothing
- **Steps:** Query **prod** (not the local snapshot) for how many BBL-tree passports carry a
  RankEntry; identify whose the existing ~14 RankEntry / ~15 RankAward rows are (did SESSION_0522 /
  SESSION_0524 belt-backfills actually apply?). Local snapshot showed **0/78** — confirm whether
  that's a stale-snapshot artifact or genuine.
- **Done means:** a real prod number + a sizing verdict (already-done / small / full-roster backfill).
- **✅ DONE (2026-07-30):** prod (via `DIRECT_URL` — pooler creds stale, P1000): **RankEntry 111**
  (99 VERIFIED / 12 UNVERIFIED), RankAward 111 (27 VERIFIED / **72 IMPORTED** / 12 UNVERIFIED),
  0 award-only orphans. **Canonical tree 95/95 covered — the 0522/0524 backfills applied; the
  "0/78 dark roster" was a stale local prodsnap artifact.** Gap: 7 side-tree passports.
  **Verdict: already-done** (canonical); sweep the 7 → ticket #379. Evidence + detail:
  [petey-plan-0727-rankentry-wayfinder](plans/petey-plan-0727-rankentry-wayfinder.md).

### SESSION_0727_TASK_02 — Create the RankEntry-epic Wayfinder map (`/wayfinder`)

- **Agent:** Petey + operator (HITL charting) · **Depends on:** TASK_01
- **Steps:** New `wayfinder:map` GitHub issue from `rankentry-unification-epic.md` + ADR 0058 +
  `rank-entry-unified-data-flow.md` + TASK_01's numbers. **Destination:** *"RankAward retired,
  RankEntry the ONE model, all reads migrated, roster ranks backfilled VERIFIED, IMPORTED-provenance
  preserved, table-drop (G-011) sequenced."* Weight + agent-route every ticket. The spec is already
  published (**#372**, `ready-for-agent`) — anchor the map on it; then `/to-issues` #372 → `/prototype`
  (the provenance shape) become tickets **on** the map. Do NOT re-run `/to-spec`.
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
- **✅ DONE (2026-07-30):** map = [#374](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/374)
  (anchored on #372; `/to-spec` NOT re-run; `/to-issues` satisfied by the child tickets). 7 weighted
  children: #375 provenance shape (`full`/prototype) · #376 seam+sweep (`quick`, blocked by #375) ·
  #377 CI read-guard (`quick`, blocked by #376) · #378 test-gate fix (`quick`) · #379 straggler
  sweep (`quick`, attended `--apply`) · #380 table-drop grill (`full`, blocked by #376+#377) ·
  #381 env hygiene (`quick`, attended). Blocked-by wired create-then-in-order (one pass).

## Staged autonomous lanes (model-agnostic — dispatch after the map exists)

> **Superseded by the map (2026-07-30):** Q-④ became [#376](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/376)
> and is now **blocked by #375** (the seam exposes provenance — don't dispatch it early);
> Q-⑤ became [#378](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/378) and stays
> immediately dispatchable. The map's frontier is the dispatch truth, not this section.

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
- **✅ ALL GRILLED (operator one-word picks, 2026-07-30 — do not re-open):** provenance =
  **COLUMN** (shape → #375) · backfill = canonical DONE + **sweep the 7** (#379) · table-drop =
  **sequenced now** on the map with blockers (#380; still post-FI-001-send) · map home =
  **GitHub issues now** (#374). Record: [petey-plan-0727-rankentry-wayfinder](plans/petey-plan-0727-rankentry-wayfinder.md).

## Risks

- **IMPORTED→VERIFIED collapse** silently drops belt-gate provenance — a decision ticket, never a
  backfill default.
- Backfill = **prod-DB write = AFK-NEVER** → dry-run always; `--apply` only attended.
- `/to-spec` already ran (SESSION_0723, via `npx skills use ".../mattpocock/skills" --skill to-spec`) →
  spec **#372** published. 0727 still needs **`/to-issues`** + **`/prototype`** from the mattpocock-skills
  family; the local `.agents/skills/` copy is a **stale sync**, so install/refresh first via
  `/plugin install mattpocock-skills` (interactive) or `npx skills use "https://github.com/mattpocock/skills"
  --skill "<name>"`. Effective pipeline now = `/wayfinder` (anchor #372) → `/to-issues` → `/prototype`.
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
The spec is ALREADY published: issue #372 (ready-for-agent) — do NOT re-run /to-spec. Anchor the
wayfinder:map on #372, then /to-issues #372 into the AFK lanes + /prototype the RankEntry provenance
shape. (If /to-issues or /prototype are missing here, install via /plugin install mattpocock-skills or
npx skills use "https://github.com/mattpocock/skills" --skill "<name>" — the local copy is a stale sync.)

RESOLVED (don't re-open): backfill status = VERIFIED (0522 precedent); autonomous exec = either
(codex build-wall → gates on Claude/foreground); read seam = ONE canonical rank-read on RankEntry
(repoint ~29 readers, per #372). HITL invariant: prod backfill is AFK-NEVER —
dry-run→attended --apply only; never self-answer a full ticket. Merge/prod actions HOLD for operator.
```

## Artifacts

- Wayfinder map: [#374 — Retire RankAward: RankEntry the ONE model](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/374)
  (7 weighted children #375–#381; spec anchor #372).
- Ratified plan: [petey-plan-0727-rankentry-wayfinder](plans/petey-plan-0727-rankentry-wayfinder.md).
- Prod sizing script (scratchpad, read-only; not committed): `prod-rank-sizing.ts` — output
  recorded in the plan doc.

## Next session

- **Goal:** work the map's first `full` ticket — [#375 provenance field shape](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/375)
  (HITL `/prototype`). Staged as [SESSION_0728](SESSION_0728.md) (ADR 0049 stub).
- **First task:** claim #375 (self-assign), open the map #374 Decisions-so-far, then prototype
  the provenance column shape against `belt-gate.ts` + `queries.ts` + the migration path.
- Optional parallel fan-out (model-agnostic, AFK): #378 test-gate fix · #379 straggler-sweep
  dry-run · #381 env hygiene (attended, secrets). Never resolve more than one non-research
  ticket in the attended session (wayfinder discipline).
