---
title: Chat Handoff Protocol — SUPERSEDED (folded into SESSION_TEMPLATE)
slug: chat-handoff
type: protocol
status: superseded
created: 2026-04-25
updated: 2026-07-25
last_agent: claude-session-0711
pairs_with:
  - docs/sprints/_template/SESSION_TEMPLATE.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Chat handoff protocol — superseded

**Folded into [`docs/sprints/_template/SESSION_TEMPLATE.md`](../sprints/_template/SESSION_TEMPLATE.md)
at SESSION_0711 (template v2).** The still-true content lives there as the template's conventions
block: the single-state-file doctrine (one `SESSION_NNNN.md` per session, no parallel handoff files),
what does NOT belong in a SESSION file, the numbering rules (now ADR 0049 — mint via
`ledger-id-next`, gaps burn), and the bow-in minimum read. The unclosed-session recovery it described
is [`unclean-close-recovery.md`](../runbooks/dev-environment/unclean-close-recovery.md); the
quick/full close split it preserved was merged into one close at SESSION_0241
([`closing.md`](../rituals/closing.md)).

This tombstone stays so inbound links resolve. Do not extend it — edit the template.
