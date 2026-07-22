---
title: Incidents Log
slug: incidents
type: protocol
status: active
created: 2026-04-26
updated: 2026-07-18
last_agent: claude-session-0569
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
| 2026-07-16 | SESSION_0542 | local-data-recovery | A raw Prisma reset intended for disposable `ronindojo_e2e` resolved to local, non-disposable `ronindojo_prodsnap` because only `DATABASE_URL` was checked and the effective Prisma target was not pinned; remote production was never touched | Restored durable live state from a new read-only production dump, verified core counts, deliberately deployed reviewed migration 78, pinned both URLs, added guarded E2E target tests, and reconciled active destructive recipes. With no pre-incident local backup, any prodsnap-only drift is unknown/unrecoverable; retained artifacts preserve recovery evidence, not that prior local state. | SESSION_0542 |
| 2026-07-16 | SESSION_0543 | unclean-close | `codex-session-0543` crashed mid-TASK_04 (code-quality); bow-out never ran. Its completed TASK_01–03 review/fallow work (belt-review queue, RankEntry lock, DB-target guards, promoter-identity repoint) sat **uncommitted** in the canonical checkout working tree on branch `session-0542-belt-review-remediation` (41 modified + 11 untracked, incl. the SESSION_0543 record itself). `.codex/worktrees/b717` was empty; `ronin-0539` was a `.git`-less husk already on origin — the real at-risk asset was in the canonical tree, not a worktree | Inventoried read-only, classified each recovery-chain layer against origin/main (0541 owned by live lane, 0542 pushed as PR #210, only 0543 uncommitted), committed the salvage first to protect it (`3b6a800a`/`1fccbb7b`), re-verified the full gate fresh green (typecheck exit 0 — resolving the crash's 21-min inconclusive hang; build 207/207; pure/guard tests 21/21), completed TASK_04 code-quality (`562b9607`), pushed all three to update draft PR #210, and closed the session honestly | SESSION_0543 (Claude recovery) |
| 2026-07-17 | SESSION_0546 | session-limit-continuation | Claude hit its session limit after the five-commit quality lane landed and while Cody was building Wave 1; the SESSION remained open with review/build work in flight | Codex verified the committed branch, merged it locally into canonical `main`, completed the in-flight Wave 1 without losing edits, obtained Cody handoff plus Desi/Doug review, preserved responsive/export evidence, ran close gates, and closed SESSION_0546. Nothing pushed. | SESSION_0546 (Codex continuation) |
| 2026-07-18 | SESSION_0569 | session-limit-continuation | Claude hit its session limit mid-turn between the Desi audit/brief delivery and the Wave 2 build dispatch — second occurrence in the technique lane (first: SESSION_0546) | Operator resumed after reset; no edits were in flight (audit was read-only, prior work committed), build/review pipeline continued in-session and closed normally. Pattern note: both hits landed during long multi-sub-agent waves — commit-early discipline (already practiced) is the mitigation that made both recoveries lossless. | SESSION_0569 (same-session continuation) |
| 2026-07-22 | SESSION_0583 / 0585 / 0613 | unclean-close | Three sessions left `status: in-progress` after their work landed + pushed (commits `28b5fd95`, `9d4a397b`, `4632eabf`); each had full `What landed` + historical "push gate held" text. Surfaced by the State-of-Dojo `needs-you` feed flooding with resolved-but-open sessions | Verified work landed via git, flipped all three frontmatter `status:` → `closed` (docs-only). Root of the projection noise is stale source data, not the projection. | SESSION_0617 |
