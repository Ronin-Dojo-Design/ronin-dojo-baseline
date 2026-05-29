---
title: "SESSION 0022 — Schema Pass 4 grill + runbook inventory + migration SOP"
slug: session-0022
type: session
status: closed-full
created: 2026-04-28
updated: 2026-04-28
last_agent: copilot-session-0022
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0021.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## Goal

Land Schema Wave A — the ~20 school-operations models from s2-schema-additions.md Pass 1 — into the Prisma schema as a clean migration. Validate Dirstarter alignment for all touched layers.

## Date

2026-04-28

## Operator

Brian Scott

## Status

in-progress

## What landed

- Grill audit of s2-schema-additions passes 1-3 against blackbeltlegacy.com features
- Identified 10 schema gaps (Media, Technique, Certificates, Favorites, StudentLists, etc.)
- Produced PETEY_PLAN_S2_SCHEMA_PASS4.md — 12 new models, 9 new enums, full spec
- SOP sweep across 08/09/10/11 baseline systems pack docs
- Gamification alignment matrix — every user action mapped to trigger chain
- TechniqueGraph component data contract documented
- Certificate product flow (digital + physical, purchasable) documented
- 4-wave migration execution plan defined
- Runbook inventory audit — 6 existing, 7 missing identified
- Created `docs/runbooks/schema-migration.md` — step-by-step Wave A–D migration SOP
- Added `use_count: 0` JETTY field to all 6 existing runbooks
- Updated PETEY_PLAN with runbook inventory + baseline pack coverage check

## Files touched

- `docs/architecture/PETEY_PLAN_S2_SCHEMA_PASS4.md` — NEW, full pass 4 plan + runbook inventory
- `docs/runbooks/schema-migration.md` — NEW, migration SOP
- `docs/runbooks/database.md` — added use_count to JETTY
- `docs/runbooks/dev-environment.md` — added use_count to JETTY
- `docs/runbooks/prisma-workflow.md` — added use_count to JETTY
- `docs/runbooks/sop-agent-workflows-and-rituals.md` — added use_count to JETTY
- `docs/runbooks/sop-data-and-wiring-flows.md` — added use_count to JETTY
- `docs/runbooks/sop-e2e-user-lifecycle.md` — added use_count to JETTY
- `docs/sprints/SESSION_0022.md` — this session

## Decisions resolved

- D1: Media uses MediaAttachment join table (not polymorphic nullable FKs) — recommended, pending formal sign-off
- D2: ContentAtomStatus stays at 6 states — recommended, pending formal sign-off
- D3: Content intake uses ContentAtom+INBOX, not separate model — recommended, pending formal sign-off
- All 8 decisions (D1–D8) written and recommended; Brian has not yet formally signed off

## Open decisions / blockers

- 8 architecture decisions in PETEY_PLAN D1–D8 await Brian sign-off before migration can begin
- s2-schema-additions.md sign-off checkboxes still unchecked — Pass 4 needs to be merged in after sign-off
- Launch strategy (Option A-plus) referenced but not formally locked by Brian this session
- SESSION_0021 was never activated (status: planned) — SESSION_0022 ran instead; 0021 can be closed-unclean or merged into 0023's Wave A scope

## Runbook assignments to future sessions

| Runbook | Assigned session | Lane | Lead agent |
| --- | --- | --- | --- |
| `deploy.md` | SESSION_0036 (Launch + support) | Launch + support | Cody + Doug |
| `seed-data.md` | SESSION_0023 (School ops) | School operations | Cody |
| `staging-smoke.md` | SESSION_0035 (QA hardening) | QA hardening | Doug |
| `stripe-setup.md` | SESSION_0024 (Billing) | School operations | Cody |
| `media-upload-setup.md` | SESSION_0026 (Content + curriculum) | Content + curriculum | Cody |
| `content-publish.md` | SESSION_0026 (Content + curriculum) | Content + curriculum | Cody + Brandon |

## Worktree + parallel lane plan

| Worktree | Lane | Can run in parallel? | Sessions |
| --- | --- | --- | --- |
| `wt-core-platform` | Schema migration Waves A–D | **Primary — must go first** | 0023 |
| `wt-school-ops` | Programs, schedules, attendance, billing | After Wave A lands | 0023–0025 |
| `wt-tournaments` | Brackets, matches, scoring | After Wave B lands | 0027–0029 |
| `wt-brand-launch` | Content, theming, media, SEO | **Can parallel with school-ops** | 0026, 0031–0034 |
| `wt-qa-hardening` | Tests, seeds, fixtures | **Can parallel with brand-launch** | 0035, 0038 |

Parallel execution: `wt-brand-launch` and `wt-school-ops` can run simultaneously once Wave A schema is in. `wt-qa-hardening` can run alongside `wt-brand-launch` once Wave C is in.

## Next session

**Goal:** Sign off PETEY_PLAN Pass 4 decisions (D1–D8), merge Pass 4 into s2-schema-additions.md, then execute Schema Wave A migration (Cody).

**Inputs to read:**
1. `docs/architecture/PETEY_PLAN_S2_SCHEMA_PASS4.md` — decision table
2. `docs/architecture/s2-schema-additions.md` — merge target
3. `docs/runbooks/schema-migration.md` — migration SOP
4. `apps/web/prisma/schema.prisma` — edit target

**First task:** Brian signs off D1–D8 → Cody merges Pass 4 into s2-schema-additions.md → Cody executes Wave A migration using schema-migration runbook.

---

## Reflections

### What went well

- The grill audit against blackbeltlegacy.com was the right call — surfaced 10 real gaps that would have been discovered painfully mid-sprint. Media, Technique, and Certificates are launch-blocking features that were completely missing.
- The gamification alignment matrix forced us to close every loop in the GamificationEvent chain. Before this session, attendance → points was documented in the SOP but not wired in the schema.
- Creating the schema-migration runbook before the actual migration means Cody has a repeatable SOP. No more ad-hoc "how do we push this?" during migration sessions.

### What almost broke

- SESSION_0021 was planned but never activated. SESSION_0022 effectively absorbed its scope (schema prep). Need to close 0021 as unclean or mark it superseded at next bow-in.
- The WORKFLOW_5.0 session calendar assigns SESSION_0022 to "Tenancy, roles, permissions, locations, org settings" but we used it for schema grill + runbooks. Calendar is a guide, not a mandate — but the drift should be acknowledged.

### Patterns observed

- Petey-before-Cody works. This entire session was Petey work (planning, gap analysis, spec writing) and produced a clean execution packet for Cody. No code was written, and that's correct — the spec wasn't ready.
- The baseline systems pack (files 08–12) proved valuable as a cross-check. They surface user flows that pure schema review misses.
- `use_count` on runbooks is a lightweight way to track which SOPs are actually being used vs. gathering dust. Worth extending to protocols and rituals.

### What I'd tell the next session

- Don't start Wave A migration until all 8 decisions are signed off. Partial sign-off = partial migration = pain.
- Consider doing Waves A+B+C+D as a single `db push` in local dev (they're all additive). Split into separate commits for git history, but the DB can take them all at once.
- The TechniqueGraph component will need sample technique data in seed.ts — flag this for the seed-data runbook session.
