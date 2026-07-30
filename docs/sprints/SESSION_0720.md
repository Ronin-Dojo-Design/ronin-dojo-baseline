---
title: "SESSION 0720 — Overnight orchestrator PILOT (2-lane, prove the loop)"
slug: session-0720
type: session--implement
status: closed
created: 2026-07-29
updated: 2026-07-30
last_agent: claude-session-0720
sprint: S13
lane: bbl
recipe: "overnight-orchestrator-waves"
goal_ids: []
tickets: []
next_session: docs/sprints/SESSION_0723.md
pairs_with:
  - docs/sprints/SESSION_0719.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0720 — Overnight orchestrator PILOT (2 lanes, 1 wave)

> **Staged by SESSION_0719** (operator elected autonomous-overnight-orchestration + pinned all four
> safety forks at bow-in). Adopt: flip `status:` → `in-progress`. **The next `/bow-in` IS the
> dispatch** — adopt this stub and dispatch both lanes below; do not re-plan or re-open a pinned fork.

Smallest useful overnight run: prove stub → dispatch → gates → PR → morning surface at minimum
blast radius before scaling to ~5 lanes / multi-wave. Reuses the proven recipe
[`overnight-orchestrator-waves`](../protocols/recipes/overnight-orchestrator-waves.md) (14 waves /
~40 lanes / zero unauthorized merges at SESSION_0635).

## Pinned forks (operator, SESSION_0719 bow-in — do not re-open)

- **(a) Push posture = PUSH.** Lanes push their own branch + open a PR; **NEVER merge, NEVER deploy**.
  PRs wait for the morning review. The MERGE gate is what's held, not the push gate (reconciled
  SESSION_0720). Server backstop: `main` PR-only (ADR 0056) + the SESSION_0718 required-check gate
  (`CI complete` + `Playwright complete`, fail-closed).
- **(b) AFK-safe = default split.** YES: test-coverage / docs / tooling / behavior-preserving DRY
  inside `apps/web`. NEVER: prod-DB migrations, payments/Stripe, secrets/RISK rotation, live email,
  human-in-loop onboarding (G-001/FI-001 Brian Truelson), cross-repo (ADR 0059 puts Mammoth
  out of scope anyway).
- **(c) Failure = HOLD.** On gate-fail / conflict / ambiguity → STOP the lane, record it, move on.
  **No unattended fixing loop.**
- **(d) Completion bar = gates+PR.** In-lane gates GREEN with `REAL_EXIT` captured (no pipe-mask,
  PL-010) + runtime proof if UI touched + PR open. Doug/Desi review = the **morning** pass, not
  overnight; CI + Playwright required-checks are the server backstop.

## Dispatch instruction (the bow-in adopter runs this)

1. Mint 2 lane SESSION numbers serially (`bun scripts/ledger-id-next.ts --prefix=SESSION`),
   sanity-check each (numeric, len-4, strictly `>` last, within +1..+20 — overnight-waves §1).
   Call them `<A>` and `<B>`.
2. Cut a worktree per lane from current `origin/main`:
   - `git fetch origin && git worktree add ../bbl-<A> -b auto/session-<A>-lineage-tier-itest origin/main`
   - `git worktree add ../bbl-<B> -b auto/session-<B>-stale-repo-name-skills origin/main`
3. Parent-shell bootstrap (NEVER inside a sandboxed driver):
   - **Lane A:** `/worktree-setup` (deps + prisma generate + local Postgres) AND copy canonical
     `apps/web/.env` with **`RESEND_API_KEY` stripped** (unit tests fire live Resend).
   - **Lane B:** docs-only — **SKIP bootstrap** (a fresh worktree has no node_modules/.env by design).
4. Dispatch both as `Agent(subagent_type: "cody", model: sonnet)` in one turn (genuinely disjoint).
   Each prompt below is self-contained — paste verbatim, do not summarize.
5. Concurrency: 2 lanes (A counts, B is docs) — well under the ~5 cap. Foreground gates only.
6. On BOTH lanes' completion notification → run the morning surface step (bottom).

## Cody dispatch — LANE A (verbatim)

```
You are Cody, an autonomous build lane in the black-belt-legacy repo
(remote Ronin-Dojo-Design/black-belt-legacy). Five-repo era, ADR 0059: this repo only.

HARD RULES (obey throughout):
- IDENTITY: work ONLY in worktree ../bbl-<A> on branch auto/session-<A>-lineage-tier-itest.
  Run the FS-0024 guard before any mutating git: `pwd` shows the worktree path + `git remote`
  is black-belt-legacy (never dirstarter_template). Canonical checkout is READ-ONLY reference.
- OWNED FILES (WRITE ONLY): apps/web/server/web/entitlements/lineage-tier-policy.integration.test.ts (NEW).
  Plus your own SESSION_<A>.md. Nothing else. Read-only refs:
  apps/web/server/web/entitlements/lineage-tier-policy.ts (subject) and
  apps/web/server/web/entitlements/queries.integration.test.ts (setup/teardown pattern to mirror).
- FORBIDDEN: ALL shared ledgers (docs/knowledge/wiki/**, FS/WL/D/goals/index) — findings go
  in SESSION_<A>.md under `## Proposed ledger edits`. Sibling-owned files. .github/**,
  scripts/**, apps/web/e2e/** (SESSION_0719 owns those). schema.prisma. Any prod-deploying edit
  beyond the one new test file.
- GATES ARE FOREGROUND ONLY (no background monitors — SESSION_0681). Capture REAL exit codes;
  NEVER pipe a gate through `| tail`/`| grep` (masks $? — PL-010). Record REAL_EXIT per gate.

GOAL (ADDITIVE, behavior-locking — no runtime change):
Add ONE integration test driving the REAL Prisma query in
server/web/entitlements/lineage-tier-policy.ts — cover getLineageListingRenderPolicyForUser
+ the batch getLineageListingRenderPoliciesForUsers + the profile-detail variants, for a
free-tier (no active entitlement) session AND an entitled session. This pins the free-vs-paid
lineage render boundary. Mirror queries.integration.test.ts for unique per-run ids +
FK-ordered teardown. VERIFY current policy before pinning; if any behavior looks like a defect,
do NOT fix it — flag in Proposed ledger edits and pin current behavior.

GATE (needs local Postgres):
  cd apps/web && bun run test server/web/entitlements/lineage-tier-policy.integration.test.ts   # REAL_EXIT
  then full: bun run test    # --parallel=1, must stay green; REAL_EXIT

EXIT CONTRACT (fork a = PUSH; quoted grant): commit locally on the lane branch (conventional
message + `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`), then
`git push -u origin HEAD` and `gh pr create --fill`. Branch push + PR creation are
operator-authorized this session (fork a). STOP after the PR — NEVER merge, NEVER deploy.
If any gate fails / conflict / ambiguity → HOLD (fork c): STOP, leave state, record it, do NOT
loop-fix. Return the minimum-output contract: files touched · verbatim gate output + REAL_EXIT
· "no runtime surface" (test-only) · Proposed ledger edits · commit sha · PR url ·
deliberately-not-done list.
```

## Cody dispatch — LANE B (verbatim)

```
You are Cody, an autonomous DOCS lane in the black-belt-legacy repo
(remote Ronin-Dojo-Design/black-belt-legacy). Five-repo era, ADR 0055/0059: this repo only.

HARD RULES:
- IDENTITY: worktree ../bbl-<B>, branch auto/session-<B>-stale-repo-name-skills. FS-0024 guard
  before any mutating git (`pwd` = worktree, `git remote` = black-belt-legacy, never
  dirstarter_template). Canonical is READ-ONLY. DOCS-ONLY — no bootstrap, no dev server, no gates
  that need node_modules.
- OWNED FILES (WRITE ONLY): .agents/skills/code-quality/SKILL.md ·
  .claude/skills/code-quality/SKILL.md · .agents/skills/fallow-fix-loop/SKILL.md ·
  .claude/skills/fallow-fix-loop/SKILL.md. Plus your own SESSION_<B>.md. Nothing else.
- HARDLINK TWINS (D-053): each .agents/.claude pair is ONE inode. Edit in place so both update;
  if your editor breaks the link (atomic save), re-establish byte-identity
  (`ln -f .agents/skills/<name>/SKILL.md .claude/skills/<name>/SKILL.md` after content matches).
- FORBIDDEN: shared ledgers (findings → SESSION_<B>.md `## Proposed ledger edits`), archived
  SESSION files (docs/sprints/_archive/** — append-only history), CLAUDE.md, .github/**,
  scripts/**, apps/web/**.

GOAL (drift, five-repo era ADR 0055/0059): both skills' "Repo context" line names the dead
pre-fork repo `ronin-dojo-app`. Repoint to `black-belt-legacy` (the current repo — MEMORY
five-repo-era):
  - .agents/skills/code-quality/SKILL.md:15    `ronin-dojo-app` -> `black-belt-legacy`
  - .agents/skills/fallow-fix-loop/SKILL.md:13 `ronin-dojo-app` -> `black-belt-legacy`
Change ONLY the repo name; leave all other prose (invocation forms, apps/web cwd, FS-0042 note)
byte-for-byte. VERIFY-FIRST per file: if a line already says `black-belt-legacy`, note "already
done" and skip. Do NOT decide whether skills should be repo-agnostic for kernel cherry-pick
(rdd-monorepo upstream) — that's an operator fork: FLAG it in `## Proposed ledger edits` (propose
a new D-row) and HOLD, do not act on it.

GATE (foreground, REAL_EXIT — docs-only, no build/test):
  grep -rn "ronin-dojo-app" .agents/skills/code-quality/SKILL.md .claude/skills/code-quality/SKILL.md \
    .agents/skills/fallow-fix-loop/SKILL.md .claude/skills/fallow-fix-loop/SKILL.md ; echo "REAL_EXIT=$?"
    # MUST return zero matches (grep REAL_EXIT=1 = clean)
  git diff --no-index .agents/skills/code-quality/SKILL.md .claude/skills/code-quality/SKILL.md ; echo "REAL_EXIT=$?"     # empty (twin identical)
  git diff --no-index .agents/skills/fallow-fix-loop/SKILL.md .claude/skills/fallow-fix-loop/SKILL.md ; echo "REAL_EXIT=$?"  # empty

EXIT CONTRACT (fork a = PUSH): commit locally on the lane branch (conventional message +
`Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`), then `git push -u origin HEAD` and
`gh pr create --fill`. Branch push + PR creation are operator-authorized this session (fork a).
STOP after the PR — NEVER merge, NEVER deploy. On any gate fail / ambiguity → HOLD (fork c):
STOP, leave state, record it, do NOT loop-fix. Return the minimum-output contract: files touched ·
verbatim gate output + REAL_EXIT · "no runtime surface" (docs-only) · Proposed ledger edits (incl.
the new D-row + the repo-agnostic fork) · commit sha · PR url · deliberately-not-done list.
```

## Morning surface (am-coffee-merge-review — runs on BOTH lanes' completion)

Completion-triggered, NOT cron (a scheduler can't reach local worktrees). On both lanes landing:

1. Recon: `git worktree list` + both PRs. Re-check disjointness vs CURRENT `main`
   (`git diff --name-only <lane-base>..main` ∩ owned set) — trunk moved overnight (0719 may have merged).
2. Per lane: read `SESSION_<A>`/`SESSION_<B>` Verification tables + `REAL_EXIT`; confirm PR open,
   gates green, CI + Playwright required-checks status on each PR (SESSION_0718 backstop).
3. Apply BOTH lanes' `## Proposed ledger edits` in ONE canonical commit (reverse-check: nothing
   unsupported, nothing dropped) — held local until the operator's word.
4. Verdict table (per lane + sweep) recorded here; ntfy.sh "verdicts ready, 2 PRs open."
5. Terminal state: **MERGE gate HELD — awaiting operator's word.** Never merge/deploy unattended.

## Goal verdict

**YES** — the overnight-orchestrator loop is proven end-to-end at 2-lane / 1-wave minimum blast
radius: staged stub → `/bow-in` dispatch (2 disjoint worktree lanes) → in-lane foreground gates
(REAL_EXIT) → branch push + PR → AM_Coffee_Merge_Review (merged-tree gate + Doug/Giddy review wave)
→ operator-gated merge. Both lanes landed, zero unauthorized merge/deploy, zero cross-lane
collision, no HOLD triggered. All three PRs merged clean on the operator's word.

## Run record

**Dispatch (bow-in):** minted 0721/0722 serially (`ledger-id-next`, each sanity-checked: numeric,
len-4, strictly `>` last, within +1..+20); cut worktree-per-lane off `origin/main` (bfc27a1f) +
an orchestrator worktree; bootstrapped Lane A (deps + prisma + local PG, **ALL `RESEND_*` stripped**),
Lane B docs-only skip. Dispatched 2× `Agent(cody, sonnet)` in one turn, owned-file sets pairwise-empty.

| Lane | Branch | Deliverable | In-lane gate | PR |
| --- | --- | --- | --- | --- |
| 0721 | `auto/session-0721-lineage-tier-itest` | NEW integration test pinning the free-vs-paid lineage render boundary (real Prisma query) | 9/9 · full suite 1934 pass · tsc+lint clean · REAL_EXIT=0 | #364 |
| 0722 | `auto/session-0722-stale-repo-name-skills` | skill "Repo context" drift fix → **repo-agnostic** (operator decision) | grep clean · twins identical · REAL_EXIT=1/0 | #363 |
| orch | `orchestrator/session-0720` | overnight-orchestration glossary terms (`repo-code-glossary.md`) | wiki:lint 0 err | #365 |

**AM sweep (am-coffee-merge-review):** `main` unmoved since dispatch (no rebase needed). Merged-tree
octopus gate (all 3 branches): typecheck 0 · full suite **1934 pass / 0 fail** (208s) · all
REAL_EXIT=0. Review wave: **Doug GO** · **Giddy GO** · Desi n/a (no UI). Cleanups applied mid-sweep:
repo-agnostic amend to #363, SESSION_0722 reconciled to the shipped diff, glossary ephemeral-PR
example generalized.

**Merge (operator "go"):** squash-merged **#364 → #363 → #365**, remote branches deleted, worktrees
removed, canonical fast-forwarded to `fe59a788`.

## Review log

**/ggr composite: 9.2/10 — CLEARS (≥9.0).** The QAR gate was satisfied by the AM_Coffee review wave,
which exceeds a standard single /ggr pass: two independent reviewers on the exact merged diff plus
the authoritative uncontended merged-tree gate.

- **Doug (QA/verify): GO** — Lane A's integration test genuinely drives the real Prisma free-vs-paid
  query (no mock), substantive discriminating assertions (the lane's own first-attempt correction
  proves discriminating power), hermetic (unique per-run ids, FK-ordered teardown, find-or-create
  entitlement safe on a fresh CI DB), CI-proven green on migrated+seeded postgres, behavior-lock with
  no defect asserted as correct.
- **Giddy (architecture/git): GO** — pairwise-disjoint, `.agents`/`.claude` twin integrity holds,
  repo-agnostic drop-the-name is the correct anti-re-drift move for a cherry-picked kernel skill, no
  ADR breach, named merge order.
- **Code-quality-matrix** (one code unit — the test): correctness/security/simplicity/readability/
  maintainability all clean; mirrors the on-main `queries.integration.test.ts` pattern (reuse-fit);
  no hard caps. Docs deliverables (skills, glossary) are prose — no code-quality surface.
- *A separate third review pass was deliberately NOT spawned* — the sweep already exceeds /ggr's scope
  on already-merged, already-green code; re-reviewing would be redundant.

## Reflections

- **The overnight loop's morning half is now proven too.** SESSION_0635 proved the dispatch half at
  scale; this pilot proves the AM_Coffee_Merge_Review half (merged-tree gate + review wave +
  operator-gated merge) at minimum blast radius. The system is end-to-end. → route: recipe already
  canonical, no new doc.
- **"Drop-the-name" beats "fix-the-name" for any cherry-picked kernel file.** Replacing stale
  `ronin-dojo-app` with `black-belt-legacy` would have re-drifted on the next sync; repo-agnostic
  converges. Generalizes to every synced process-OS / ui-kit file. → route: D-row + upstream ADR.
- **The `.agents`/`.claude` "hardlink twins" canon is factually wrong** — they are directory symlinks,
  not per-file hardlinks (Lane B + Giddy F4). → route: D-row.
- **AFK + pre-pinned forks = don't block on the bow-in question card.** The three-question ritual
  exists to prevent building the wrong thing; when the operator has staged + pinned everything and
  stepped away, surfacing the answers as text and dispatching is correct — blocking would strand the
  run. → route: no-action (judgment note).

## Routed findings (finding-router, closing.md §6.7)

| Finding | Type | Route |
| --- | --- | --- |
| Synced skills should carry NO repo name (drop-the-name); read identity from the FS-0024 `git remote` guard only if ever needed | decision | **ADR upstream in rdd-monorepo** (process-OS upstream-of-record) + D-row here — ADR deferred by ADR 0059 |
| `.agents`/`.claude` skill twins are directory **symlinks**, not "hardlink twins / ONE inode" — canon wording drifted (petey-plan-tier1, 0720 stub) | drift | **D-row** here + reconcile canon wording upstream |

Both routed to [drift-register](../knowledge/wiki/drift-register.md) this close.

## Full close evidence

| Gate | Result |
| --- | --- |
| Task log | PASS |
| Format-fix (code) | 0 code files (docs/close only) |
| wiki:lint | 0 err / 115 warn (pre-existing, other files) |
| Build | skipped (no app-code diff on close branch; merged code CI-green) |
| /ggr composite | **9.2/10 — CLEARS** (AM sweep: Doug GO + Giddy GO + merged-tree 1934/0) |
| Merged-tree gate | typecheck 0 · test 1934 pass / 0 fail · REAL_EXIT=0 |
| Graphify | nodes=15055 edges=33649 communities=1758 |
| Secret scan | PASS (clean) |
| Git state | `close/session-0720` · clean |
| PRs merged | #364 → #363 → #365 (squash, branches deleted) · canonical @ `fe59a788` |

## Next session

→ [SESSION_0723](SESSION_0723.md) (staged)

### Goal

Scale the overnight orchestrator from the proven 2-lane / 1-wave pilot to **~5 lanes / multi-wave**,
and point it at **BBL product / claim-loop work** (the north-star asset/moat), not process tooling —
use the now-proven machinery (dispatch half @ 0635, morning half @ 0720) to drive real product lanes.

### First task

Petey discovery + slice: query the ledger/backlog (`bun scripts/ledger-backlog.ts`, board
`apps/web/scripts/board-backlog.ts`) + the BBL SoT set (`docs/product/black-belt-legacy/`) for
un-started **claim-loop** work; cut ~5 genuinely-disjoint lanes (prove pairwise-empty owned-file
sets), pin every operator fork, stage reservation branches, then dispatch per
[`overnight-orchestrator-waves`](../protocols/recipes/overnight-orchestrator-waves.md). Hold the
~5-lane concurrency cap + foreground gates (SESSION_0681); merge owner stays the operator.
