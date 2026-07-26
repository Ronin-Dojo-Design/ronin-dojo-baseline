# 0059 — Multi-repo daily operating model

**Status:** accepted (SESSION_0711 grill, operator-ratified)
**Context:** ADR 0055 split the portfolio into five sibling repos. A solo operator + agent
fleet needs one daily operating model or five drifting ones will emerge.

## Decision

1. **Entry:** goal-pinned days open the brand repo directly; unpinned days run **portfolio
   triage** — open RDD-Monorepo, run the portfolio-status command (all five repos: open PRs,
   CI, top ledger items), elect the goal, switch. A command (~5 min), never a session.
2. **Environment ladder:** `local dev → PR preview (= staging) → main (= prod)` in every repo.
   No persistent staging branch/env anywhere — Vercel per-PR previews are staging; migrations
   rehearse on prodsnap pre-merge. Revisit only on a real incident (YAGNI).
3. **Ritual:** the lean ritual (trimmed bow-in/bow-out + template v2) travels into every repo
   with its own SESSION spine + ledgers; RDD holds canonical copies; updates cherry-pick
   downstream, never fork.
4. **Sync:** one scheduled weekly RDD sync session batches kernel/process cherry-picks out as
   small per-repo sync PRs; urgent fixes go immediately. Automation waits until the weekly
   session proves the pattern (abstraction ladder).
5. **Parallelism:** session = one repo. Cross-repo days = separate sessions (naturally safe —
   no shared canonical). Worktrees are for in-repo fan-outs only.

## Consequences

- The canonical-occupancy machinery shrinks to in-repo scope; cross-repo collisions vanish.
- One new artifact owed: `portfolio-status` script in RDD-Monorepo.
- Drift risk concentrates in ritual copies — mitigated by cherry-pick-only updates + the
  weekly sync session as the standing checkpoint.

**Supersedes:** the single-canonical daily model implied by the monorepo-era rituals.
