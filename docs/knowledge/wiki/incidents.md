---
title: Incidents Log
slug: incidents
type: protocol
status: active
created: 2026-04-26
updated: 2026-04-27
health: 7
---

# Incidents Log

Append-only log of session incidents — unclean closes, data recovery, and operational surprises.

See [closing ritual — unclean close recovery](../../rituals/closing.md#unclean-close-recovery) for the protocol.

## Entries

| Date | Session | Type | Reason | Recovery | Resolved by |
| --- | --- | --- | --- | --- | --- |
| 2026-04-26 | SESSION_0005 | unclean-close | Compaction ate context before bow-out could run; too many tool calls in large seed/schema session | Backfilled SESSION_0005 in SESSION_0006; updated plan-vs-current, program-plan, wiki index | SESSION_0006 |
| 2026-04-26 | SESSION_0008 | unclean-close | Copilot API error mid-session: `thinking: Input tag 'adaptive' found using 'type' does not match any expected tags` | proxy.ts merge had landed on disk; backfilled SESSION_0008 in SESSION_0009; verified all changes intact via git | SESSION_0009 |
| 2026-04-27 | SESSION_0010 | unclean-close | Bow-out skipped; session ended after commit `1c7d22b` with status still `awaiting-bow-out` | Backfilled next-target decision, set status to `closed-unclean` in SESSION_0011 | SESSION_0011 |
| 2026-04-27 | SESSION_0013 | unclean-close | Bow-out skipped; all tasks complete but closing ritual never ran | Backfilled Files touched, Decisions resolved; set status `closed-unclean` in SESSION_0014 | SESSION_0014 |
