---
title: YouTube Links Ledger
slug: youtube-links-ledger
type: reference
status: active
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0589
pairs_with:
  - docs/knowledge/wiki/planning-ledger.md
  - docs/knowledge/wiki/reddit-links-ledger.md
  - docs/knowledge/wiki/chatgpt-links-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - governance
  - planning
  - link-intake
---

# YouTube Links Ledger

Raw-capture inbox of **YouTube videos** shared as planning material. Sibling of the
[Reddit](reddit-links-ledger.md) and [ChatGPT](chatgpt-links-ledger.md) link-ledgers; feeds the
[planning-ledger](planning-ledger.md) → goals-ledger (a captured video is raw material that
graduates to a `PL`/`G` row).

**Capture flow:** operator shares a YouTube link via Obsidian **QuickCapture** (phone) into the
vault's `youtube` inbox folder; rows are **promoted into this repo ledger to count** (repo is SoT —
ADR 0048).

**Row law:** `YLL-0NN` ids, append-only, mint = max+1 (verify by grep — D-049 class). Status:
`captured → triaged → routed (→ PL/G pointer) → done/rejected`. Wired into
`scripts/ledger-backlog.ts` (code `YLL`), `scripts/deferral-guard.ts`, and closing.md §6.7 by lane
L2 (`session-0591-ledger-wiring`).

## Rows

_None yet — seeded empty at SESSION_0589. First real capture promotes YLL-001._

## Cross-references

- [Planning Ledger](planning-ledger.md) — where captures graduate to.
- [Reddit Links Ledger](reddit-links-ledger.md) · [ChatGPT Links Ledger](chatgpt-links-ledger.md) — siblings.
