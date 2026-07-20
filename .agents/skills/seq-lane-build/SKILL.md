---
name: seq-lane-build
description: Sequence skill — the parallel-lane worktree build recipe as an ordered step list for a dispatched Cody. Use when dispatching (or acting as) a build lane in its own worktree off a fan-out plan; the dispatch prompt supplies only lane specifics (goal, owned files, pinned grill outcomes) and points here for the invariant sequence.
---

Ordered sequence for a worktree build lane. The dispatch prompt carries the LANE SPECIFICS
(goal, owned-file contract, non-goals, pinned grill outcomes, session number); this file
carries the invariant steps. Subagents: `Read` this file and follow in order.

**Pre-dispatch gate (Petey, before any lane launches):** every operator-owned fork in the
lane's plan is resolved and PINNED in the dispatch prompt. A dispatched builder never
re-opens or resolves operator forks.

1. **Worktree claim + bootstrap.** From the canonical checkout: `git fetch origin`; verify
   the reservation branch has no unique commits (`git log --oneline main..<branch>` EMPTY,
   else STOP and report); `git worktree add /Users/brianscott/dev/ronin-<NNNN> <branch>`;
   inside it `git reset --hard origin/main`. Bootstrap: copy canonical `apps/web/.env` in,
   `bun install`, `cd apps/web && bunx prisma generate --no-hints`. All work stays inside
   the worktree; never write to canonical or sibling worktrees.
2. **Recon.** Graphify-first per `.claude/skills/graphify-query/SKILL.md` (query the
   CANONICAL checkout — worktree graph is 0 nodes by design). Read the plan docs the
   dispatch names; verify every load-bearing claim against source before building on it.
3. **Pre-flight.** Complete `docs/protocols/cody-preflight.md` before writing code.
4. **Build** within the owned-file contract only. Adjacent debt gets named, not fixed.
5. **Gates** (in the worktree): `bun run typecheck` · `bun run lint:check` (`bun run lint`
   WRITES files) · `cd apps/web && bun run format:check` when adding files ·
   `bun run test` (NEVER bare multi-file `bun test`) · `cd apps/web && npx next build`.
   Under parallel-lane host contention, note load average with any test flake and queue a
   clean rerun as a sweep item rather than hand-waving failures.
6. **Runtime proof** when a runtime surface changed: dev server via Bash
   (`cd apps/web && npx next dev --turbo -p 3<NNN>` — unique port per lane;
   preview_start cannot serve a worktree); headless probes (own Playwright chromium /
   `bun -e` fetch). Class presence ≠ behavior — probe computed values. Record evidence.
7. **Session record.** `cp docs/sprints/_template/SESSION_TEMPLATE.md
   docs/sprints/SESSION_<NNNN>.md` in the worktree; fill frontmatter (lane facet,
   last_agent, pairs_with), task log, Verification table, and a **"Proposed ledger
   edits"** section. NEVER edit shared ledgers from a lane — the merge sweep applies
   proposals once, conflict-free.
8. **Close.** Commit everything on the lane branch locally (conventional message,
   `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`). NO push, NO PR, NO deploy.
   Self-review honestly; return files touched, gate outputs verbatim, runtime evidence,
   proposed ledger edits, and anything deliberately not done.

**Gotcha floor (never trim from a dispatch):** hand-authored migrations only, NEVER
`prisma migrate dev` (worktrees share ONE local DB) · `../ronin-dojo-monorepo` READ-ONLY ·
technique-media NO-LEAK invariant is law · Rank.brand is nullable — never scope rank/belt
queries by it · Prisma never in `"use client"` modules · unit tests can fire REAL Resend
emails — none through email paths · sibling lanes are LIVE — never touch their files · on
limit/config/sandbox errors STOP and report the EXACT error verbatim · unknown = "I don't
know", never theorize.
