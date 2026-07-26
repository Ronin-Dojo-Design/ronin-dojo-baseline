---
title: "ADR 0002 — main is PR-only"
slug: adr-lean-0002-main-is-pr-only
type: decision
status: accepted
created: 2026-07-26
updated: 2026-07-26
last_agent: claude-session-0711
---

# 0002 — Nothing lands on `main` except through a PR

## Status

Accepted — re-states [legacy ADR 0053](../architecture/decisions/0053-main-is-pr-only.md)
(SESSION_0624) for the lean corpus. The server ruleset is live.

## Context

Worktrees share one ref store, so `git push origin main` from any lane can publish another
session's unpushed work to trunk (FS-0039 — it happened). Four consecutive local guards failed
silently (FS-0035/0036/0037/0040): every local control either isn't installed, isn't on the
branch, or is bypassed by the operator credential every agent holds.

## Decision

**`main` accepts nothing except pull requests**, enforced by the GitHub ruleset `main-pr-only` —
not by hooks or docs. Load-bearing parameters:

- `required_approving_review_count: 0` (solo seat — GitHub forbids self-approval; ≥1 bricks main).
- `bypass_actors: []` (an admin exemption would exempt every agent; break-glass = one auditable
  `gh api` toggle, documented in `hot-fix-protocol.md`).
- **No required status checks** (`paths-ignore` means docs-only PRs never report `ci`; a required
  check that never arrives blocks forever). Gates run locally per `closing.md` §4a.
- `non_fast_forward` + `deletion` also enforced.

The local `pre-push` hook remains as fast local failure only. Flow:
`git push -u origin HEAD` → `gh pr create --fill` → `gh pr merge --squash --delete-branch`,
still gated on explicit operator push authorization, one push per session at close.

## Consequences

- Trunk-based flow survives intact; only the last 30 seconds of bow-out changed.
- A red CI matrix now fires before trunk, never after a burned prod deploy.
- Canonical stops committing to local `main` (fetch-only mirror) — removes the fuel; the ruleset
  removes the outcome.
- Verify layers with `scripts/githooks/doctor.sh`; test any guard by trying to defeat it.
