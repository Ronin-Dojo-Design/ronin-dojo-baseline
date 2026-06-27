---
description: "Closing ritual — end the current session (single close mode)"
mode: "agent"
---

# Bow Out — Closing Ritual

**Source of truth:** [`docs/rituals/closing.md`](../../docs/rituals/closing.md). **Read and execute it as
written** — agent-agnostic and binding for every agent (Claude, Copilot, **Codex**). This file is a **thin
pointer, not a second copy** of the steps (a duplicated step-list rots — leaned at SESSION_0453 per ADR 0033 D7).

When you stamp `last_agent` on touched docs, name the agent that executed (`claude-`/`copilot-`/`codex-session-NNNN`);
do not rewrite past values.

**One close mode.** Status is `in-progress` → `closed`. Single source of truth = the SESSION frontmatter
`status:` field (the body `## Status` is a pointer, SESSION_0342). The legacy `closed-quick` / `closed-full` /
`closed-unclean` values are **retired** — do not use them for new sessions.

## Must-not-skip gates (the ritual has the full, current procedure)

- **Update the SESSION file** (`docs/sprints/SESSION_NNNN.md`): `What landed`, `Files touched`,
  `Decisions resolved`, `Open decisions / blockers`, `Next session` (Goal + Inputs + First task), `Task log`.
  Set frontmatter `status: closed`.
- **SESSION-file gate** — the current file must have ≥1 `## Task log` entry before `closed`. The cross-session
  `project-log.md` is **retired (SESSION_0228)** — do not write to it.
- **JETTY 3.0 sweep** on every file in `Files touched` — bump `updated` + set `last_agent`; bidirectional
  backlinks; add this session's row to `docs/knowledge/wiki/index.md`. Then run `bun run wiki:lint` from the
  repo root and record the exact error/warning count (pre-existing vs introduced).
- **Finding router + ledger cross-off sweep (closing.md §6.7)** — route new findings to their canonical ledger
  (`wiring-ledger` WL / `drift-register` D / `failed-steps-log` FS / `incidents` / `manual-boundary-registry` /
  `POST_LAUNCH_SOT` FI / ADR), **and cross off** every ledger item this session resolved (FS→mitigated/resolved,
  D→resolved, WL→✅, FI→live/declined, risk→resolved). This is the outbound half of the
  [Loop of Loops](../../docs/protocols/loop-of-loops-ledger-driven-sessions.md).
- **Git hygiene** — branch check; `git add -A && git status` (no secrets, no `.env`, no `node_modules`);
  conventional commit (`feat:`/`fix:`/`docs:`/`chore:`), don't bundle unrelated changes. **Push only on the
  operator's explicit per-push authorization** (standing rule — build + verify + show, then wait for "go").
- **Graphify update** *before* the close commit (so the count lands in the single push) —
  `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .`; record node/edge/community counts. Skip only if Graphify
  is unavailable or no files changed.
- **Bow-out line** — `Bowed out — SESSION_NNNN closed. Next session goal: {one line}.`

## Optional deep items (recommended at end-of-day / sprint / milestone / when schema·auth·payments·prod·governance changed)

- **Reflections** (kaizen note in the SESSION file) · **Hostile close review** (Giddy + Doug, +Desi if UI) ·
  **Evidence table** (proof per close step) · **ADR + ubiquitous-language check** (create/update the ADR + glossary,
  or record "not needed") · **Memory sweep** (project-scoped facts only — not session content) ·
  document new components in `docs/knowledge/wiki/custom-component-inventory.md`.

## Cross-references

- [Closing ritual (source of truth)](../../docs/rituals/closing.md) · [Opening ritual](../../docs/rituals/opening.md)
- [Loop of Loops — ledger-driven sessions](../../docs/protocols/loop-of-loops-ledger-driven-sessions.md)
- [Hostile Close Review](../../docs/protocols/hostile-close-review.md) · [Review & Recommend](../../docs/protocols/review-recommend.md) · [FAILED_STEPS Log](../../docs/protocols/failed-steps-log.md) · [Graphify Repo Memory](../../docs/runbooks/dev-environment/graphify-repo-memory.md)
