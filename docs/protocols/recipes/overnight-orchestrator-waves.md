---
title: "Recipe — Overnight Orchestrator Waves (rolling multi-wave autonomous fan-out)"
slug: recipe-overnight-orchestrator-waves
type: protocol
status: active
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0679
pairs_with:
  - docs/protocols/recipes/orchestrator.md
  - docs/protocols/recipes/pm-planning-lane.md
  - docs/protocols/recipes/am-coffee-merge-review.md
  - docs/protocols/recipes/lane.md
  - docs/protocols/recipes/merge-wave.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - orchestration
  - overnight
  - autonomous
  - recipe
---

# Recipe — Overnight Orchestrator Waves

Extends [orchestrator](orchestrator.md) (one planned fan-out, dispatched once) into a **rolling
multi-wave overnight operation**: one long-lived orchestrator session dispatches wave after wave of
autonomous worktree lanes through the night, plans each continuation wave from the *results* of the
prior one, and steers off nothing but the operator's minimal text messages. Proven at the
SESSION_0635 run (2026-07-23→24): **14 waves, ~40 autonomous lanes (0636–0680), PRs #264 onward,
zero unauthorized merges/deploys, one mid-run course of operator texts.** Operator verdict: "the
gold standard of sessions… This is the system. This is the agent's OS." This card makes that run
repeatable law.

## When to use

- The operator wants an evening/overnight block converted into landed, reviewable PRs without
  attending each lane.
- There is a stock of already-planned or plannable-disjoint work (ledger backlog, /rr research
  questions, doc packs, well-specified builds) — enough for 2+ waves.
- The operator has given the **standing dispatch authorization**: own-branch pushes + PR opens
  only; no merges, no deploys, no `main`, no shared-ledger writes. Without that standing word,
  use plain [orchestrator](orchestrator.md) and hold at G3.

## Persona pack

- **Petey (orchestrator)** — plans each wave, mints numbers, writes dispatch prompts, babysits,
  records results, plans the continuation.
- **Cody ×N per wave** — one per lane, each a full [lane](lane.md) citizen in its own worktree;
  driver may be Claude (Fable/Sonnet) or codex (see Driver selection).
- **Operator** — asleep or on the phone; steers by short texts; the ONLY authority for merges,
  deploys, and anything beyond the standing authorization.
- **AM merge owner** — a *different, attended* session that inherits the whole run via
  [AM_Coffee_Merge_Review](am-coffee-merge-review.md).

## Load-set

1. [orchestrator](orchestrator.md) — the single-wave dispatch/babysit mechanics this card loops.
2. [lane](lane.md) + `.claude/skills/seq-lane-build/SKILL.md` — what each dispatched worktree runs.
3. [merge-wave](merge-wave.md) — the G0→G4 ladder; overnight lanes stop at G3-equivalent (PR open).
4. `[[explicit-push-authorization]]` — the standing word covers branch pushes + PR opens ONLY.
5. Memory: `codex-exec-authenticates-from-sandbox` + `codex-sandbox-keychain-blocks-build` —
   the codex driver's proven incantation and its hard boundary.

## Preconditions

- Canonical-occupancy check (FS-0035): the orchestrator runs from its OWN worktree/branch if
  canonical is held; canonical is read-only reference for every lane regardless.
- The AM merge-session stub is stage-able (see AM-stub-as-baton below) — if you can't stage the
  baton, you can't hand off the run; don't start.
- Operator's standing authorization is explicit and in-session (not inferred from a prior night).

## The wave loop (steps)

Each wave runs steps 1–7; step 8 closes the loop into the next wave.

### 1. Mint serial numbers — with sanity guards (the FS-0038 killer)

Session numbers come from `ledger-id-next` **serially, one at a time**, per ADR 0049: branch =
claim, gaps burn, and **highest number ≠ most recent** (FS-0038) — never infer the next number by
scanning `docs/sprints/`. Guards, mandatory since the 0635 run's near-miss:

- Parse the mint output with an explicit pattern and **sanity-check it** (numeric, length-4,
  strictly greater than the last minted number, within +1..+20 of it) **before** any branch
  creation or file write keyed on it.
- Mint → create the reservation branch → stage the stub → THEN mint the next. Never batch-mint
  in a loop whose parse you haven't proven on one iteration.
- If a mint looks wrong, STOP the loop; verify state by `git branch --all` + the ledger, not by
  re-running.

### 2. Worktree per lane + parent-shell bootstrap

Every lane gets its own worktree and branch, cut from current `origin/main`:

```bash
git fetch origin
git worktree add ../ronin-NNNN -b auto/session-NNNN-<slug> origin/main
```

Bootstrap from the **parent shell** (never inside a sandboxed driver): `bun install`, copy the
canonical `apps/web/.env` **with `RESEND_API_KEY` stripped** (unit tests fire live Resend sends —
an overnight lane must not be able to email humans), `prisma generate` only for lanes that run
DB-backed gates. **Docs-only lanes skip bootstrap entirely** — declare "docs-only, no bootstrap"
in the prompt so the lane doesn't burn tokens discovering a bare worktree (fresh worktrees have
no node_modules/.env/prisma client — that's by design, not breakage).

### 3. The HARD-RULES preamble (anatomy)

Every dispatch prompt opens with a HARD-RULES block. The anatomy, all parts mandatory:

1. **Identity** — worktree path + branch name + "verify `pwd` + branch before writes"; canonical
   is READ-ONLY reference.
2. **Owned paths (WRITE ONLY)** — the exhaustive file allowlist, including the lane's own
   `SESSION_NNNN.md`.
3. **Forbidden set** — everything else, *named explicitly* where collision risk exists: ALL
   shared ledgers (`docs/knowledge/wiki/**` FS/WL/D/goals/index/planning), sibling-owned files,
   frozen files, prod-deploying paths. Shared ledgers are NEVER written in-lane — parallel
   append = merge conflict + id collision.
4. **Proposed-ledger-edits discipline** — findings go in the lane's SESSION file under
   `## Proposed ledger edits`; the AM merge owner assigns ids via `ledger-id-next` and applies
   ALL lanes' edits in ONE canonical commit.
5. **Real exit codes** — no piped gate commands (`| tail` masks `$?` — PL-010); capture and
   record `REAL_EXIT`.
6. **Explicit-path staging** — never `git add -A`.
7. **Exit contract** — verbatim commit message (with `Co-Authored-By` trailer), `git push -u
   origin HEAD`, `gh pr create --fill`, **STOP. Never merge.**

The preamble is what makes unattended dispatch safe: every judgment call is made before dispatch,
and the blast radius of a confused lane is its own worktree + branch.

### 4. Driver selection (Claude vs codex)

| Driver | Use for | Constraints |
| --- | --- | --- |
| Claude Fable | judgment-heavy: /rr research with open forks, build-ready specs, anything touching money/legal/consent framing | full capability; most expensive |
| Claude Sonnet | well-specified builds, doc packs, content drafting, checklists | needs a tight prompt; escalation valve in the preamble |
| codex `gpt-5.6-sol` | mechanical/bounded code work when Claude budget is the constraint | **commit-only**; see below |

**The codex boundary (Keychain):** the codex sandbox cannot reach the macOS Keychain, so
`prisma generate` / `next build` SIGSEGV in-lane. Therefore codex lanes are **commit-only**: the
orchestrator runs the build gate in a **normal shell** from the lane worktree (recording
`REAL_EXIT`), then pushes the branch and opens the PR itself. Proven incantation (memory
`codex-exec-authenticates-from-sandbox`):

```bash
codex exec --cd /Users/brianscott/dev/ronin-NNNN -s workspace-write \
  --add-dir <canonical>/.git \
  --ignore-user-config -m gpt-5.6-sol -c 'model_reasoning_effort="high"' \
  [-c 'sandbox_workspace_write.network_access=true'] \
  -o lane-final.md - < lane-prompt.md
```

(`--ignore-user-config` because a newer `~/.codex/config.toml` fails older-CLI parse; auth still
reads from disk. Default reasoning effort is NONE — always set it. `--add-dir` on canonical
`.git` because a linked worktree's gitdir lives there.)

**Salvage rule:** if codex hits a usage/limit wall mid-lane, a Claude session picks up **the same
worktree** (disk truth first: read actual state before continuing). Standing rule from the 0635
run; salvage was never needed across waves 5–8, but it's pre-authorized so a stall never strands
a lane.

### 5. Stacking: forbidden by default, declared when needed

Default: every lane branches from `origin/main` — genuinely disjoint files, zero merge-order
coupling. When a lane MUST build on an unmerged sibling, it is a **declared stack**: branch from
the sibling's head, and mark **MERGE-AFTER #NNN** in the PR body AND the dispatch record (proven:
0663's cards-v2 stacked on #288; 0673's deck v2 stacked on #276). The AM merge owner sequences
from those declarations. An undeclared stack is a quarantine offense at the sweep.

### 6. Reference-reads instead of stacking

A lane that only needs to **read** unmerged sibling work does NOT stack — it reads via

```bash
git show origin/<sibling-branch>:<path>
```

This decoupled waves 5+6 from waves 3+4 entirely: continuation lanes consumed prior-wave research
deliverables with zero merge-order dependencies.

### 7. The AM stub as baton

Before wave 1, the orchestrator stages the AM merge-session stub (`SESSION_NNNN.md`,
`recipe: AM_Coffee_Merge_Review`) carrying: the **lane inventory table** (session · branch ·
driver · item · expected state at AM) and the **merge-owner checklist** (recon → quarantine check
→ per-lane rebase + full gates → specials → ledger apply in ONE commit → cleanup). Then, after
**every** wave: append the wave's launch record and results to the stub, commit, and push it on
the **orchestrator's own PR**. The PR is the run's live dispatch record — readable from the
operator's phone mid-run, and the AM session's complete work order. Nothing about the run lives
only in the orchestrator's context window.

### 8. Wave pacing — continuations planned from outcomes

Waves launch in small batches (the 0635 run settled into pairs). The next wave is planned from
the **prior wave's results**, not from the original evening plan: escalations become lanes (a
wave-2 lane's "needs E1" finding became wave 3's 0649), research conclusions become execution
lanes (wave 4's GBP finding became wave 5's template pack), and stale assumptions get corrected
before they propagate. Reject continuation candidates that would collide (stacking on frozen
files, same-path ownership) — record the rejection in the stub. The operator steers between
waves with short texts; each authorization covers the batch it names. When the operator says
done (or the queue is empty): post the final grand-total record, mark **THE ORCHESTRATOR IS
DONE** in the stub, go quiet.

## Gates

- **Per lane:** the lane's own gate set with `REAL_EXIT` recorded in its SESSION file's
  Verification table. Codex lanes get their first real build gate at orchestrator push time.
- **Per wave:** the orchestrator verifies each PR opened + records done/blocked/crashed per the
  [orchestrator](orchestrator.md) minimum-output contract before planning the continuation.
- **At AM:** in-lane green predates the rebase — the merge owner re-runs full gates after rebase
  onto current main, per lane. Overnight gates are evidence, never a merge pass.
- **The operator gate (LAW):** the run produces **branches + PRs only** — the MERGE gate, not the
  push gate, is what's held (reconciled SESSION_0720). `main` is PR-only, server-enforced (ADR
  0056); the SESSION_0718 required-check gate (`CI complete` + `Playwright complete`, fail-closed)
  is the server backstop that makes an unattended PR-open safe. A lane that holds at
  the PR gate out of caution exhibits **CORRECT behavior** — the orchestrator opens the PR under
  the operator's standing word (proven: 0666/#294, where the lane held and the orchestrator
  opened). PRs whose merge would auto-deploy prod (e.g. `apps/rdd` → live ronindojodesign.com)
  carry an explicit warning in the PR body and the lane inventory.

## Failure modes (all hit on the proving run — honest list)

1. **The mint-parse clobber.** The first batch-mint loop had a parse bug that briefly clobbered
   the orchestrator's own SESSION file (restored from its last pushed commit) and created 5 stray
   branches (deleted via a deliberate, documented guard bypass). Fix: serial minting + the step-1
   sanity guards, proven on one iteration before looping. This is also why the stub-push cadence
   matters — the restore source was the pushed PR.
2. **Pipe-masked failure exit.** `vercel deploy … | tail` read as exit 0 while the JSON said
   `deploy_failed` (PL-010 recurrence). Capture `$?` before any pipe; require `REAL_EXIT` in
   every lane Verification row and every orchestrator-run gate.
3. **Stale-spec hazard (the verify-first law).** Dispatch prompts encode ledger/repo state as of
   planning time; overnight that goes stale fast — the run surfaced a goal superseded mid-run
   (G-013 → G-022), 5 stale WL rows, an "outstanding" graph wave that had already landed, and a
   red-prod finding that had self-healed. Law: build-lane prompts say **verify current state
   before building**; research findings get re-verified before a continuation lane executes them.
4. **Browser-pane contention.** The browser MCP is a singleton — when a lane owned the pane, the
   orchestrator's own smoke had to defer (0647 vs 0648). Assign browser-needing verification to
   at most one concurrent owner, or defer the eyeball to the AM sweep; `qlmanage`/own-Playwright
   fallbacks exist for rasterize/measure needs.
5. **Codex Keychain SIGSEGV.** An in-sandbox build attempt died exactly as the memory predicts
   (#286) — the orchestrator re-ran in a normal shell, `REAL_EXIT=0`. Never accept an in-sandbox
   build failure as a lane verdict; never skip the normal-shell gate on codex lanes.

## Minimum-output contract

Everything in [orchestrator](orchestrator.md)'s contract, plus per wave: launch record + results
appended to the AM stub and **pushed** (the baton is only a baton if it's on the remote), running
grand totals (waves / lanes / PR range), the operator decision-batch accumulating open forks for
the morning, and the final DONE marker.

## Cross-references

- [Recipe — Orchestrator](orchestrator.md) — the single-wave engine this card loops.
- [Recipe — PM Planning Lane](pm-planning-lane.md) / [AM Coffee Merge Review](am-coffee-merge-review.md) — the evening/morning halves this run stretches between.
- [Recipe — Lane](lane.md) — what each dispatched worktree runs.
- [Recipe — Merge Wave](merge-wave.md) — the gate ladder the AM sweep enforces.
- `docs/sprints/SESSION_0635.md` + `docs/sprints/SESSION_0641.md` (on `session-0635-rdd-golive` until merged) — the proving run's full record.
- `docs/architecture/research/ronin-bots-concept.md` — the client-facing naming layer over this same agent OS.
