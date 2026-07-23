---
title: "Parallel-lane shared state — the inventory"
slug: parallel-lane-shared-state
type: reference
status: active
created: 2026-07-23
updated: 2026-07-23
last_agent: claude-session-0624
pairs_with:
  - docs/protocols/failed-steps-log.md
  - docs/knowledge/wiki/wiring-ledger.md
  - docs/architecture/decisions/0053-main-is-pr-only.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Parallel-lane shared state — the inventory

**What two `git worktree` lanes share, what that costs, and which guard covers it.**

## Why this page exists

Every parallel-lane failure in this repo has been found the same way: a lane broke something, an
FS entry was written, and a guard was added for *exactly that surface*. FS-0034 → FS-0035 →
FS-0038 → FS-0039 → FS-0040 → WL-P3-65 → WL-P3-67. Six guards, six incidents, in that order.

That is a mop, not a hardening program — each incident finds the next unguarded surface, so the
work never converges. **Nobody had ever written down what worktrees actually share.** This page is
that list. New guards should come from auditing this table, not from the next outage.

The single sentence that generates most of the table: **a linked worktree gets its own working
tree, index, and HEAD — everything else in `.git/` is shared.**

## The inventory

| Shared surface | Shared? | Failure it causes | Guard | Status |
| --- | --- | --- | --- | --- |
| **`refs/heads/*`** (branches) | **yes** | `git push origin main` from a lane pushes the *shared* `main` ref — publishing a sibling's unpushed work (FS-0039) | server ruleset `main-pr-only` (ADR 0053) + `pre-push` RULE A/B | **closed** |
| **HEAD (per worktree, but reachable from anywhere)** | own, but retargetable | a stale-cwd `git checkout -b` retargets a *sibling's* worktree (SESSION_0588, SESSION_0624) | shell guard `_ronin_moves_head` (prevent) + `post-checkout` (detect) | **closed** (WL-P3-65) |
| **`refs/stash`** | **yes — one stack for all lanes** | `stash pop`/`drop` in lane B destroys lane A's uncommitted work. **The only surface that loses work unrecoverably.** | shell guard `_ronin_stash_is_foreign` | **closed** (WL-P3-67) |
| **`.git/config`** | **yes** (unless `extensions.worktreeConfig` + `--worktree`) | one lane's `git config` rewrites `core.hooksPath` / `user.email` / remotes for every lane. `githooks/install.sh` does this by design. | none | **OPEN — WL-P3-68** |
| **ID minting** (`G`/`WL`/`PL`/`FS`…) | ledger files are per-tree | two lanes mint the same id (`G-026`, SESSION_0598) | `ledger-id-next` now scans sibling worktrees for **every** prefix | **closed** (WL-P3-66) |
| **`SESSION_NNNN` numbering** | filenames + branch refs | two lanes adopt the same stub (the `SESSION_0622` duplicate) | `ledger-id-next --prefix=SESSION` (already cross-branch) + FS-0038 "mint, don't increment" | **closed** |
| **Canonical checkout occupancy** | one canonical tree | two sessions working in canonical strand each other's uncommitted work (FS-0034) | `canonical-claim.sh` | **closed** (FS-0035) |
| **Shared ledger *files*** (`wiring-ledger`, `failed-steps-log`, `index.md`) | per-tree, collide at merge | two lanes append at the same anchor → merge conflict or duplicate id (the double `FS-0038`) | convention: append-only, one merge owner | **partial — convention only** |
| **Local Postgres / test DBs** | **yes** | concurrent `bun test` / e2e runs contend; the `ronindojo_e2e` fixture is disposable but singular | convention: CI is authoritative | **partial — convention only** |
| **Dev-server ports (3000)** | **yes** | second lane's `next dev` collides; `preview_start` is canonical-locked | convention: alt port via Bash | **partial — convention only** |
| **`git gc` / `prune` / `reflog expire`** | **yes, repo-wide** | one lane's maintenance rewrites shared object/ref state under a sibling | none | **OPEN — low risk, no incident yet** |
| Working tree | **no** — own | — | — | n/a |
| Index / staging area | **no** — own | — | — | n/a |
| Rebase/merge sequencer state | **no** — own | — | — | n/a |

## How to read this

- **closed** = an executable guard exists AND has been tested against the bypass, not just the
  happy path (the FS-0040 lesson).
- **partial — convention only** = a documented rule with nothing enforcing it. Per FS-0035/0037,
  assume it does not fire. These are the next candidates.
- **OPEN** = known, unguarded, tracked by a WL row.

## The structural alternative

Every "yes" in the first column exists because worktrees **share one `.git/`**. That is the whole
point of worktrees (cheap, instant, one object store) and also the entire hazard class.

`git clone --reference` gives each lane a *separate* `.git/` while still sharing the object store
on disk: separate refs, separate stash, separate config — and therefore **no** `refs/heads`,
stash, or config hazard at all, guard or no guard. The cost is slower lane setup and a second
`.env`/`node_modules` per lane (which `/worktree-setup` already provisions anyway).

That trade would delete four rows of this table rather than guarding them one at a time. It is an
ADR-level decision and deliberately **not** made here — this page exists so the decision can be
made against the real list instead of against the most recent incident.

## Verify the guards are live

```bash
bash scripts/githooks/doctor.sh
```

Checks the hook path, both hooks, the shell guard's rules, and the server ruleset. Run it **from
the worktree you are actually in** — FS-0040 was a guard that was installed, looked correct, and
ran nowhere.
