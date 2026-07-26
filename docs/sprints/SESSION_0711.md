---
title: "SESSION 0711 — Lineage-explorer quality epic: plan + dispatch (PL-030)"
slug: session-0711
type: session--open
status: in-progress
created: 2026-07-25
updated: 2026-07-25
last_agent: claude-session-0711
sprint: S12
lane: bbl
recipe: "epic-plan"
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0709.md
  - docs/knowledge/wiki/planning-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0711 — Lineage-explorer quality epic (PL-030)

> **Staged by SESSION_0709 (six-pack fan-out close; operator-elected mid-session).** Adopt: flip
> `status:` → `in-progress` and treat SESSION_0709 as the previous session. SESSION_0710 is a
> parallel sibling lane (email DRY_RUN + vault) — disjoint, possibly already run.

## Goal

**PART 1 — FIRST, before any epic work (operator directive at 0709 bow-out, near-verbatim):**
run the **immediate [`hostile-repo-review`](../protocols/hostile-repo-review.md)** — architecture,
systems design, agent workflows, and **PREVENTIVE measures** — plus **`fallow health` + `fallow
audit` as diagnosis (explicitly NOT the fix-loop)**, the already-planned
`/improve-codebase-architecture`, and **a hard long look at security, stability, and scalability**.
The operator's charge to answer, not to score around: *"most of our time is spent shipping fast,
scoring ourselves well, then a review finds a huge CRAP score, we refactor, and score ourselves
9.5 again — that's not right. I'm tired of review-and-refactor and chasing ghosts. I don't want
good enough, I want perfect."* Concretely: (a) why do reds keep appearing in a repo scoring 9+
(0709 exhibit: the WL-P2-82 flake was OBSERVED at 0692, written off as one-off, never routed — 3
CI cycles paid); (b) what **pre-code gates** exist vs needed — Cody preflight is reuse-focused,
nothing checks CI health / known-flake state / architecture conformance BEFORE code is written;
(c) does the scoring system measure systemic health or just process execution — propose matrix
changes so a 9+ is impossible while known-unrouted debt or red CI exists.

**PART 2 — then the lineage-explorer quality epic** (PL-030) — operator framing: "professionally
developing this with discipline and clean, understandable code that Apple would ship." Five public
surfaces: cohort timeline (default) · board view · mobile list · honor strip · galaxy.

1. **Sort filter (product):** user-facing sort on the cohort-timeline explorer offering BOTH
   chronological and belt order (PL-026 "both as a filter" call; belt-order read model landed
   SESSION_0704, PR #336). Grill fork: timeline-only or all five surfaces? Placement? Persisted?
2. **Explorer filter review:** the cinematic explorer's filter system generally.
3. **Per-surface quality:** hostile code review + `/code-quality` score per surface.
4. **`/fallow-fix-loop` + `/improve-codebase-architecture`** over the explorer family
   (behavior-preserving; WL-P2-3 ListRow fold-in when its surfaces are touched).
5. **Expo/iOS readiness research-recommend** — feeds on PL-031 gap 2 (API-contract extraction);
   assess Next-coupling, `next/cache` in read paths, auth/media flows.

Reference (operator-provided): monorepo-template article + 0709 gap assessment — see
SESSION_0709 `## Next session → Reference` and PL-031.

## First task

Open `docs/protocols/hostile-repo-review.md` and run Part 1 (the repo-wide hostile review +
preventive-measures audit + fallow health/audit diagnosis + security/stability/scalability pass).
Its findings then reshape Part 2's plan — /pp the explorer epic AFTER, informed by what the review
surfaces (inventory the five surfaces via `/ge`, grill sort-filter forks, dispatch per epic-plan).
Standing riders: WL-P2-82 flake spec fix (4 sightings — a prime "preventive measures" exhibit;
fix early, it taxes every apps/web PR) · WL-P3-69 tooling trio · TFF-010 recurrence code fix
(`tag(...).slice(0,16)` sweep).

## Bow-in (SESSION_0711)

- **Canonical claim (FS-0035):** free → claimed by 0711. `git status` clean except pre-existing
  untracked `slide-01-title.png` (not mine — left alone; never `git add -A`).
- **Push-guard doctor (ADR 0053):** ⛔ 2 FAILED at bow-in — `core.hooksPath` pointed at a
  **removed worktree** `/Users/brianscott/dev/ronin-0708/scripts/githooks`, so local hooks were
  dead (server ruleset still enforced PR-only + force-push block ✓). **Fixed** via
  `scripts/githooks/install.sh` from canonical → re-doctor all-green. **FINDING — FS-0040
  recurrence:** `install.sh` pins `core.hooksPath` to `git rev-parse --show-toplevel`, so running
  it from a *linked worktree* pins the shared config to that worktree's path, which dies on
  worktree cleanup. Preventive-gate candidate for Part 1 (install.sh should resolve the MAIN
  worktree, or doctor should self-heal). → route at bow-out.
- **Open PRs:** none (`gh pr list --state open` empty) → default `/pr-fix-loop` lane N/A; merge
  owner 0641 / standby 0681 own nothing open right now.
- **Live worktrees:** 0641-tidy (mmb-inbox), 0681 (gold-standby), 0682 (mmb-mvp-plan), 0710
  (email-dryrun — 0711's disjoint sibling), + codex-smoke / wl-lane base. Canonical is 0711's.
- **Backlog (ledger-backlog):** 119 open — WL 43 · PL 29 · RISK 9 · GL 23. Board-backlog skipped
  (read-only diagnosis session; canonical DB not needed yet).
- **Parallel-lane assessment (1d):** Part 1 (repo-wide review/diagnosis) and Part 2 (explorer
  epic) are sequential-by-directive (Part 1 reshapes Part 2), NOT a fan-out at the session level.
  Within Part 1, the review dimensions (architecture / security-stability-scalability / fallow
  diagnosis / preventive-gates) ARE disjoint → candidate parallel review wave (pending operator
  shape choice).

## Part 1 — hostile-repo-review + preventive diagnosis (interim record)

**Operator /goal (mid-session, supersedes Part 2 staging):** clean up the repo, consolidate
information, clear path forward. Ultracode on; parallel wave elected.

**Wave (all READ-ONLY, dispatched as real sub-agents):** Petey meta-diagnosis · Giddy architecture
HRR · Doug security/stability/scalability · Explore deepening (/improve-codebase-architecture) ·
memory assessment · governance-sprawl · 17-agent cleanup workflow (/rr, per-corpus verdicts +
adversarial delete-verify → manifest; runId `wf_7598e239-7f4`).

**Scores:** Giddy HRR **7.3/10 (repo-memory cap fired)** · Doug security **6.5** / stability
**7.5** / scalability **7.5** · fallow: MI 89.6 "good" BUT 9.0% duplication (24,220 lines / 123
clone families), 56 refactoring targets · memory: 136 files → 115 (14 memory-vs-repo
contradictions, repo right every time).

**Headline findings:**
- **SEC-01 (P1, live Stripe):** `products/actions.ts` accepts client-priced `price_data` + free
  metadata; `stripe-webhook.ts` fulfills program/tournament/merch/tool/ads from that metadata with
  no amount verification. Exact fix scoped (server-derive, kill union arm, verify `amount_total`).
- **WL-P2-82 is NOT a flake — production staleness bug:** org-claim approve never revalidated the
  `organization-{slug}` cache tag. **FIXED this session** (`claim-review-actions.ts` — revalidate
  on grant; tsc green). Spec was right all 4 sightings.
- **Why reds recur in a 9+ repo (meta):** findings die in prose (no routing); guards pass silently
  while broken (FS-0035→0042 = ONE shape, 6 rows); "mitigated" never re-verified; Kaizen
  write-only (3/14 lessons became gates); scoring caps blind to red CI/unrouted debt/FS
  recurrence; zero pre-code gates for CI-health/flake/architecture conformance.
- **Matrix proposal:** four new 8.9 caps (red CI · unrouted debt · FS-pattern recurrence · flake
  write-off) + mandatory Systemic-health evidence line. Proposals #1–8 pending operator word.
- **Giddy:** CLAUDE.md confidently wrong (~170 getRequestBrand → 0; **fixed this session**); ADR
  0024 "FULL oRPC" 3% real (4 routers vs 231 safe-action files); Brand residue 518 sites/224
  files; ~22/55 skills unwired; ~35MB docs reclaimable; graphify serves phantom nodes (HRR-09).
- **Governance:** 17 ledgers → 6 proposed (GL·PL·WL·RISK·PR·History); goals WIP 11 → cap 3;
  4:1 meta:product doc ratio (61MB/1,251 files); wayfinder issues one-shot → close.
- **Architecture (9 candidates, 5 Strong):** Prisma selects ARE the UI contract (26 files — the
  PL-031 Expo blocker); showRanks redaction hand-rolled 7× w/ beltless false-positive; claim
  concept-bounce 36 modules; explorer read model has no module; api-client = re-home target.
- **Ritual fat:** 1,764-line per-session ritual read-path; trim plan T1–T6 (~45% cut) pending.

**Fixed in this session's diff (Part 1 riders):** WL-P2-82 root cause · TFF-010 recurrence ×2
(`seed-lineage-rank-redaction-db.ts`, `seed-lineage-comp-fixture-db.ts`) · FS-0042 minted (bare
`fallow` read-path failure; memory + docs-sweep routed) · WL-P3-69(b) root-guard in
`format-check-clients.sh` · CLAUDE.md getRequestBrand truth-fix · hooksPath repair (FS-0040
recurrence — install.sh run from a since-deleted worktree had killed all local hooks; doctor now
green).

**Open decisions pending operator word:** #0 SEC-01 fix-now · #1–8 gates/matrix · #9 ui-kit
format pin · T1–T6 ritual trim · G1–G5 governance consolidation · CAND pick · cleanup manifest
(workflow in flight).

## Artifacts

- State-of-Dojo snapshot (bow-in, operator-elected): <https://claude.ai/code/artifact/ad14e1ae-5a73-4787-876b-fe604f78de55>
- Architecture review (9 deepening candidates, /improve-codebase-architecture): <https://claude.ai/code/artifact/dcd046d6-c770-42ac-81c3-80a3c44adfe2>

## Next session

### Goal

### First task
