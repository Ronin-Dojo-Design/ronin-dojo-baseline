---
title: Autonomous Sessions Runbook
slug: autonomous-sessions
type: runbook
status: active
created: 2026-05-29
updated: 2026-06-27
last_agent: claude-session-0453
pairs_with:
  - docs/rituals/opening.md
  - docs/rituals/closing.md
  - docs/petey-plan-0305.md
  - docs/sprints/SESSION_0328.md
  - docs/runbooks/dev-environment/codex-cloud-bbl-waves-2-4.md
backlinks:
  - docs/runbooks/README.md
---

# Autonomous Sessions Runbook

Run N bow-in → bow-out sessions back-to-back from one command, each in a **cold
process** so context stays fresh, each landing as its own reviewable PR.

## Why this works (the key idea)

This repo is a **file-based state machine**. Bow-in
([`opening.md`](../../rituals/opening.md)) reads the highest-numbered
`docs/sprints/SESSION_NNNN.md`; bow-out ([`closing.md`](../../rituals/closing.md))
writes the next one and commits. The session-to-session handoff therefore lives in
the **SESSION files + git**, not in any conversation.

That means the right automation is **a fresh headless agent process per session** — not
a long-running loop or kept-alive chat. Each process is cold, reads the latest SESSION
file, does one session, closes, and the next cold process picks up the thread. No
context decay, because there is no shared context to decay.

## The driver

[`scripts/auto-session.sh`](../../../scripts/auto-session.sh):

```bash
scripts/auto-session.sh 3   # run 3 sessions back-to-back
```

What it does each iteration:

1. Computes the next SESSION number and creates a branch `auto/session-NNNN`,
   **stacked on the previous session's branch** (the first stacks on `main`).
2. Invokes `claude -p` headless with a bow-in → work → full-bow-out prompt. The agent
   does the next automatable code slice of [`petey-plan-0305.md`](../../petey-plan-0305.md),
   **skips operator-only device smoke**, runs the full close gates (`wiki:lint` must be
   0 errors, typecheck/lint, `graphify update` before the commit), and **commits to the
   current branch** — it does **not** push or open a PR.
3. Verifies two safety brakes: the tree is clean (the close succeeded) and exactly one
   new commit exists (the session produced work). Either failing **halts the loop**.
4. Pushes the branch and opens a PR with `gh pr create --fill`.

### Codex variant

[`scripts/auto-session-codex.sh`](../../../scripts/auto-session-codex.sh) is the Codex CLI
variant. It mirrors the stacked-PR flow above, but invokes a cold `codex exec` process
for each session and records `last_agent: codex-session-NNNN` through the normal bow-in /
bow-out ritual.

```bash
scripts/auto-session-codex.sh 3
CODEX_MODEL=gpt-5-codex scripts/auto-session-codex.sh 3
```

Codex does not currently have the same per-command allowlist shape as Claude, so the
script uses `--dangerously-bypass-approvals-and-sandbox` for unattended local runs. The
repo-level FS-0024 shell guard still blocks the read-only `dirstarter_template` path, and
the stacked PRs remain the human review gate before anything reaches `main`.

### Codex auto-merge variant — BBL waves 2-4

[`scripts/auto-session-codex-automerge.sh`](../../../scripts/auto-session-codex-automerge.sh) is
the Codex local auto-merge peer for the first three safe BBL `/app` migration waves after
SESSION_0374:

```bash
scripts/auto-session-codex-automerge.sh
CODEX_MODEL=gpt-5-codex scripts/auto-session-codex-automerge.sh
```

It defaults to `N=3`, runs each cold Codex session from fresh `main`, opens a PR, waits for CI,
auto-merges green PRs, pulls main, and continues. It refuses `N>3` unless
`CODEX_AUTO_SESSION_ALLOW_MORE=1` is set.

Safety brakes:

- leaves Prisma changes open for human review instead of auto-merging;
- leaves server-flatten-like `server/web|server/admin` moves/deletes open for human review;
- stops on dirty tree, no-op, multi-commit session, or CI red after one rerun;
- prompt forbids Prisma, `server/<entity>` flattening, Phase 3 identity re-root, DNS, Vercel
  production-domain, and Stripe rehearsal work.

For these BBL waves, **local is preferred over Codex Cloud** because local has Graphify, `bbl.local`
smoke capability, `gh`, ntfy, and the repo's full close ritual. Codex Cloud remains useful as a
fallback; use [Codex Cloud Handoff — BBL `/app` Waves 2-4](codex-cloud-bbl-waves-2-4.md) and expect
Graphify/browser proof to be deferred.

#### SESSION_0328 preflight — `petey-plan-0305` Claude/Codex run

SESSION_0328 preflighted the next 3-session lineage epic run for both autonomous drivers. Use one
of these commands from a clean `main` after SESSION_0328 is committed and pushed:

```bash
# Claude driver
scripts/auto-session.sh 3

# Codex driver
scripts/auto-session-codex.sh 3
```

Both prompts now carry the same hard gates: write SESSION task IDs before edits, run the relevant
Cody pre-flight, use Graphify-first discovery for lineage work, and treat Trophy.so/points/
gamification/RankAward persistence as schema/backend work before vendor UI.

The three cold Codex sessions are staged as:

1. **Phase 3c actions menu proof:** bow in against `docs/petey-plan-0305.md`, run Graphify queries
   over lineage canvas/drawer/action-menu/panel terms, create SESSION task IDs and Cody UI
   pre-flight before edits, then verify public read-only behavior and dashboard/editor behavior
   separately. Preflight note: `LineageMemberActionsMenu` already appears on full cards and compact
   rows; the likely gap is wiring `Change promoter...` as a distinct capability-gated action instead
   of falling back to View Profile.
2. **Phase 3d persistent profile panel:** finish/polish the mobile bottom-sheet plus desktop
   persistent side-panel contract. Preflight note: `LineageProfileDrawer` already contains a
   desktop-panel direction, `LineageRankHistoryTab`, and a belt-color header progress bar, so the
   run should harden and browser-prove those surfaces instead of duplicating them.
3. **Trophy.so rank-progression proof:** treat this as schema/backend-aware work before vendor UI.
   Read `docs/runbooks/database/schema-migration.md`, `docs/runbooks/database/prisma-workflow.md`,
   `docs/protocols/cody-preflight.md`, `docs/runbooks/domain-features/lineage-hub.md`, ADR 0016,
   and `apps/web/prisma/schema.prisma` before editing. Existing `GamificationEventType`,
   `GamificationEvent`, and `RankAward.gamificationEvents` are already present; reuse them or record
   why they are insufficient before adding any achievement/points schema.

Path drift note: older handoffs may say `docs/runbooks/schema-migration.md` or
`docs/runbooks/prisma-workflow.md`. The live runbooks are under `docs/runbooks/database/`. Record the
drift in the SESSION file if it affects a schema run.

Runner brakes: both autonomous drivers now reject `N=0` and assert that each cold session leaves a
clean tree with **exactly one** new commit on its branch. A no-op session and a multi-commit session
both halt the loop.

Run 3 is a human-review PR before merge if it touches `apps/web/prisma/`, `prisma/migrations/`, or
the rank/gamification persistence contract.

### Stacked PRs — why, and how to merge

PR-per-session + back-to-back forces stacking: if session 2 re-branched from an
unchanged `main` it would not see session 1's new SESSION file and would redo its task.
So session k+1 branches from session k. You get one focused PR per session.

**Merge bottom-up:** merge the oldest PR (base `main`) first; GitHub auto-retargets the
next PR onto `main` as you go. Or squash-merge the stack in order.

## Prerequisite — run from a real terminal (auth), then permissions

⚠️ **Launch from your own terminal where `claude` is logged in — never nested inside an active
Claude Code session.** A cold `claude -p` spawned from within a Claude Code Bash sandbox inherits no
oauth credentials and dies immediately with `401 Invalid authentication credentials` (the wrapper
waits for green, creates `auto/session-NNNN`, then the first `claude -p` 401s and the safety brake
halts the loop — observed SESSION_0453). Verify `claude --version` + that you're logged in, then run
`scripts/auto-session.sh N` (or `scripts/await-green-then-session.sh N`) from that shell.

A headless `claude -p` agent also **cannot answer permission prompts**. Before an unattended
run, satisfy one of:

- **Allowlist (recommended):** pre-allow the close-gate commands (`bun …`, `git …`,
  `gh …`, `graphify …`) in `.claude/settings.json`. The `/fewer-permission-prompts`
  skill generates this from your transcripts. The FS-0024 shell-guard still blocks the
  read-only `dirstarter_template` dir, so this stays safe.
- **`--dangerously-skip-permissions`** in the script — simplest, but removes the guardrail
  while the loop pushes branches. Not recommended.

## Hands-off mode: auto-merge + phone notifications

For "laptop up, walk away" runs, use [`scripts/auto-session-automerge.sh`](../../../scripts/auto-session-automerge.sh):

```bash
caffeinate -i scripts/auto-session-automerge.sh 4   # keeps the laptop awake for the run
```

It runs N sessions and **auto-merges each green PR before the next branches from a fresh
`main`** — so sessions never stack, which sidesteps the doc-collision conflicts the manual
stacked flow hits (see lesson below). It **stops and pings you instead of auto-merging** when
a human decision is needed:

- the session touched `apps/web/prisma/` (schema/migration → review required);
- CI stays red after one automatic flake re-run;
- a safety brake trips (dirty tree / no-op session).

**Phone pings** go through [`scripts/notify.sh`](../../../scripts/notify.sh) → ntfy.sh. Set the
topic in the gitignored `.claude/notify.env` (`NTFY_TOPIC=...`) and subscribe to it in the ntfy
app. Pings fire from the bash driver directly, so they work even if no Claude chat session is
open. (Inside an active Claude session, the `PushNotification` tool also pushes to a paired phone
via Remote Control, but only when you've been idle >60s.)

For Codex local auto-merge on the current BBL `/app` migration lane, use:

```bash
caffeinate -i scripts/auto-session-codex-automerge.sh
```

`caffeinate -i` is not needed for Codex Cloud, but it is still recommended for a local unattended run
because it prevents idle sleep while the laptop is open.

**Stacked-PR lesson (SESSION_0306):** when running the manual `auto-session.sh` in PR-stacked
mode, merge the PRs **one at a time promptly** and do **not** push unrelated commits to shared
docs (wiki index/log, the epic plan) while they're open, nor `--delete-branch` a stacked base
(it auto-closes the PRs stacked on it). The auto-merge driver above avoids all of this by merging
before the next session starts.

## Safety model & limits

- **PR gate:** nothing reaches `main` unattended — you review each PR. The self-assessed
  hostile-close score is a weak signal with no human in the loop; the PR is the real gate.
- **Halts on failure:** a dirty tree or a no-op session stops the loop instead of
  compounding errors onto a bad base.
- **Finite plan:** `petey-plan-0305.md` is Phases 2→4 (~4–7 sessions), then it's done.
  Pass an `N` that matches the remaining automatable work; the loop invents nothing on
  its own beyond the SESSION "Next session" pointer.
- **Can't automate the human bits:** operator device/browser smoke (e.g. the Phase 1
  pinch-zoom phone check) is flagged and skipped, never faked.
- **Local only:** the close ritual needs the local `graphify` CLI (+ DB for some smokes),
  which a cloud runner won't have — run this on the operator machine. For calendar-spread
  unattended runs use `/schedule`, accepting that cloud sessions defer `graphify update`
  to the next local session.

## Cross-references

- [Opening ritual](../../rituals/opening.md)
- [Closing ritual](../../rituals/closing.md)
- [Petey Plan 0305 — Lineage epic](../../petey-plan-0305.md)
- [Graphify Repo Memory Runbook](graphify-repo-memory.md)
