---
title: "Feature Intake Ledger — post-launch requests, bugs, polish"
slug: feature-intake-ledger
type: reference
status: active
created: 2026-06-20
updated: 2026-06-20
last_agent: claude-session-0423
pairs_with:
  - docs/knowledge/wiki/wiring-ledger.md
  - docs/knowledge/wiki/test-fail-fix-ledger.md
  - docs/protocols/reusable-prompts.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Feature Intake Ledger — post-launch requests, bugs, polish

## Summary

**The repo's canonical running list of incoming work now that BBL is live.** Feature
requests, bug reports, and polish asks land here first — from the in-app **DojoBots
feature-request modal**, the operator, end users, or ops — get triaged (type · priority ·
status), and are linked out to the SESSION that ships them. This is the *intake* layer; it
complements the existing ledgers rather than duplicating them:

- **This ledger** — net-new feature/bug/polish intake (the "what should we build/fix next" list).
- [Wiring Ledger](wiring-ledger.md) — incomplete wiring / handroll slips on existing surfaces.
- [Test Fail-Fix Ledger](test-fail-fix-ledger.md) — flaky/broken test tracking.
- [Doc Pruning Register](doc-pruning-register.md) — doc lifecycle (consolidate/demote/archive).

Append rows; resolve in place (don't delete). Each shipped row links the SESSION + the
public surface it landed on (`FEATURES.md`, `/changelog`).

## Key Ideas

- **One front door.** Anything a user or the operator wants that isn't already tracked in
  another ledger starts as a row here — so nothing lives only in chat history.
- **Triage before build.** A row is not actionable until it has a `Type`, `Priority`, and a
  one-line `Summary`. Triage sets those; the operator green-lights priority.
- **Close the loop to the public surface.** When a row ships, record the SESSION and add it
  to `apps/web` `FEATURES.md` / the `/changelog` so users see it.

## Conventions

- **ID:** `FI-NNN` (monotonic, never reused).
- **Source:** `dojobots` (in-app modal) · `operator` · `user` · `ops`.
- **Type:** `feature` · `bug` · `polish`.
- **Priority:** `P0` (broken/blocking live users) · `P1` (important, schedule soon) ·
  `P2` (nice-to-have).
- **Status:** `intake` (raw) → `triaged` (typed + prioritized) → `in-session` (SESSION_NNNN) →
  `shipped` (+ changelog) · `declined` (with reason).

## Ledger

| ID | Date | Source | Type | Priority | Summary | Status | Session / notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FI-001 | 2026-06-20 | operator | — | — | _Seed row — replace when the first real request lands. DojoBots modal + FEATURES.md are wired (SESSION_0422); route their submissions here._ | intake | — |

<!-- Append new rows above this comment. Resolve in place: set Status to shipped/declined and add the SESSION ref. -->
