---
title: Incidents Log
slug: incidents
type: protocol
status: active
created: 2026-04-26
updated: 2026-07-16
last_agent: codex-session-0542
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
| 2026-05-04 | SESSION_0061 | unclean-close | Bow-out frontmatter `status` field never updated; work + handoff content present | Set frontmatter + body status to `closed-unclean` in SESSION_0073 | SESSION_0073 |
| 2026-05-04 | SESSION_0062 | unclean-close | Frontmatter `status` not updated; body shows `in-progress → closed-full` intent with full close evidence present | Set frontmatter + body status to `closed-unclean` in SESSION_0073 | SESSION_0073 |
| 2026-05-04 | SESSION_0066 | unclean-close | Frontmatter `status` not updated; body shows `in-progress → closed-full` intent with full close evidence + ADR 0013 + wiki page landed | Set frontmatter + body status to `closed-unclean` in SESSION_0073 | SESSION_0073 |
| 2026-05-04 | SESSION_0067 | unclean-close | Body marked `closed-quick` but frontmatter never matched | Set frontmatter + body status to `closed-unclean` in SESSION_0073 | SESSION_0073 |
| 2026-05-04 | SESSION_0068 | unclean-close | Body marked `closed-quick` but frontmatter never matched | Set frontmatter + body status to `closed-unclean` in SESSION_0073 | SESSION_0073 |
| 2026-05-04 | Pattern: 0061-0072 | governance-debt | Five sessions in 12-session window had frontmatter status drift from body intent. Root cause: bow-out steps written manually, frontmatter field treated as separate from body Status | Established habit: SESSION close must update frontmatter + body Status atomically. Add to closing.md step 2. | SESSION_0073 |
| 2026-07-15 | SESSION_0538 | unclean-close | Implementation, verification, PR #207, and full close evidence were complete, but frontmatter remained `in-progress` after the session ended | Set status to `closed`, added an explicit recovery note, confirmed the existing closed wiki-index entry, and preserved the shipped record | SESSION_0542 |
| 2026-07-15 | SESSION_0540 | unclean-close | Implementation and hostile close were complete and PR #209 later merged, but frontmatter remained `in-progress` | Set status to `closed`, updated merged/ledger evidence, added a recovery note, and restored wiki discoverability | SESSION_0542 |
| 2026-07-15 | SESSION_0541 | unclean-close | Claude hit its session limit after five clean commits landed and while the Doug/Giddy/Desi verify wave was running | Proved no source edits were lost, preserved the five-commit branch, backfilled partial verdicts/findings, closed the session honestly, and opened SESSION_0542 for remediation | SESSION_0542 |
