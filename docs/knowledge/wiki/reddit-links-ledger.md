---
title: Reddit Links Ledger
slug: reddit-links-ledger
type: reference
status: active
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0589
pairs_with:
  - docs/knowledge/wiki/planning-ledger.md
  - docs/knowledge/wiki/youtube-links-ledger.md
  - docs/knowledge/wiki/chatgpt-links-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - governance
  - planning
  - link-intake
---

# Reddit Links Ledger

Raw-capture inbox of **Reddit threads/posts** shared as planning material. Sibling of the
[YouTube](youtube-links-ledger.md) and [ChatGPT](chatgpt-links-ledger.md) link-ledgers; feeds the
[planning-ledger](planning-ledger.md) → goals-ledger the same way (a captured link is raw material
that graduates to a `PL`/`G` row).

**Capture flow:** operator shares a Reddit link via the Obsidian **QuickCapture** app (phone) into
the vault's `reddit` inbox folder; rows are **promoted into this repo ledger to count** (repo is the
SoT — ADR 0048; the vault inbox is optional raw capture).

**Row law:** `RLL-0NN` ids, append-only, mint = max+1 (verify by grep — D-049 class). Status:
`captured → triaged → routed (→ PL/G pointer) → done/rejected`. Wired into
`scripts/ledger-backlog.ts` (code `RLL`), `scripts/deferral-guard.ts`, and the closing.md §6.7
finding router by lane L2 (`session-0591-ledger-wiring`).

## Rows

_None yet — seeded empty at SESSION_0589. First real capture promotes RLL-001._

## Cross-references

- [Planning Ledger](planning-ledger.md) — where captures graduate to.
- [YouTube Links Ledger](youtube-links-ledger.md) · [ChatGPT Links Ledger](chatgpt-links-ledger.md) — siblings.
