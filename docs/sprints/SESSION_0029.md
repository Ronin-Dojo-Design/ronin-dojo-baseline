---
title: "SESSION 0029 — Commerce Learning Path Specs"
slug: session-0029
type: session
status: closed-full
created: 2026-04-30
updated: 2026-04-30
last_agent: codex-session-0029
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0028.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0029 — Commerce Learning Path Specs

## Date

2026-04-30

## Operator

Brian Scott + Codex acting as Petey

## Status

closed-full

## Goal

Pause the planned School Ops CRUD continuation for one session and lock the Programs, Curriculum, Certification, Monetization, Entitlements, and Dirstarter commerce alignment specs before more implementation.

## Bow-in audit

- Opening ritual read: `docs/rituals/opening.md`
- Previous session read: `docs/sprints/SESSION_0028.md` (closed-full, score 9.5/10)
- Previous goal achieved: yes — calendar repair and Program CRUD landed.
- Carryover change from Brian: push the planned School Ops CRUD continuation back one session and make SESSION_0029 a spec/design session.
- Failed steps checked: `docs/protocols/failed-steps-log.md`
  - FS-0006 mitigated: multi-part schema/spec work requires Petey first.
  - FS-0007 mitigated: task ledger and workflow artifacts must be created before implementation.
- Drift register checked: `docs/knowledge/wiki/drift-register.md`
  - D-005 cache policy remains open; this session does not alter query caching.
  - D-014 Dirstarter `Tool` residue remains open and directly affects monetization alignment.
- Branch/worktree:
  - Source branch: `main`
  - Session worktree: `/Users/brianscott/dev/ronin-dojo-app`
  - Reason: docs/spec-only session on a clean main worktree; `wt-school-ops` remains reserved for the next CRUD implementation slice.
- Primary lane: Core platform governance with dependent Content + curriculum / School operations spec coverage.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth, DB/Prisma, payments/Stripe, content management, monetization, automation, blog/SEO, theming, cron jobs |
| Extension or replacement | Extension. Ronin keeps Dirstarter's Better Auth, Prisma, Stripe, admin/content, SEO, theme, and cron patterns, then adds martial-arts-specific Programs, Courses, Certifications, and Entitlements. |
| Why justified | The next feature slices need one commercial access contract so Program, Course, Certification, PricingPlan, Stripe, and certificate workflows do not diverge. |
| Risk if bypassed | Schema duplication, parallel payment flows, access booleans scattered across UI/actions, and launch-blocking mismatch with Dirstarter baseline capabilities. |

Live Dirstarter docs checked during bow-in:

- `https://dirstarter.com/docs/codebase/structure`
- `https://dirstarter.com/docs/database/prisma`
- `https://dirstarter.com/docs/authentication`
- `https://dirstarter.com/docs/integrations/payments`
- `https://dirstarter.com/docs/content`
- `https://dirstarter.com/docs/monetization`
- `https://dirstarter.com/docs/automation`
- `https://dirstarter.com/docs/blog`
- `https://dirstarter.com/docs/seo`
- `https://dirstarter.com/docs/theming`
- `https://dirstarter.com/docs/cron-jobs`

## Petey plan

### Goal

Preserve the raw ChatGPT design source, audit it against the current repo for DRY/schema conflicts, and create the minimum architecture docs needed before implementing monetized learning paths.

### Tasks

#### SESSION_0029_TASK_01 — Preserve raw source and re-sequence session calendar

- **Agent:** Petey + Giddy
- **What:** Add the pasted ChatGPT source to `docs/architecture/source/raw/` and update `WORKFLOW_5.0.md` so SESSION_0029 is this spec session while the planned School Ops CRUD continuation moves to SESSION_0030.
- **Done means:** Raw source exists verbatim; calendar and launch board reflect the inserted spec session.

#### SESSION_0029_TASK_02 — Schema DRY and Dirstarter baseline review

- **Agent:** Cody + Giddy
- **What:** Compare the raw schema examples to current Prisma and Dirstarter docs before recommending any future model changes.
- **Done means:** Specs explicitly name existing models, DRY risks, authoritative Dirstarter docs, and future deltas instead of blindly duplicating raw examples.

#### SESSION_0029_TASK_03 — Create commerce learning path specs

- **Agent:** Petey + Cody + Doug
- **What:** Create:
  - `docs/architecture/programs-curriculum-certification-spec.md`
  - `docs/architecture/monetization-entitlements-spec.md`
  - `docs/architecture/dirstarter-commerce-alignment.md`
- **Done means:** Each doc has JETTY frontmatter, cross-links, MVP cut line, examples/flows from the raw source, DRY warnings, and Dirstarter alignment.

#### SESSION_0029_TASK_04 — Bow-out hardening and worktree cleanup

- **Agent:** Petey + Giddy + Doug
- **What:** Remove merged clean worktrees, harden `closing.md` so future full closes include worktree cleanup and ADR/Dirstarter proof, add needed ubiquitous-language terms, and record the entitlement-first decision as an ADR.
- **Done means:** Only the main worktree remains; `closing.md`, `ubiquitous-language.md`, and ADR 0011 are updated; wiki/project/session close records include evidence.

### Agent and worktree assignments

| Role | Assignment |
| --- | --- |
| Petey | Owns session scope, compression, calendar change, and final score gate. |
| Giddy | Owns worktree/branch posture, Dirstarter compliance, and DRY review. |
| Cody | Owns repo/schema inspection and spec implementation. |
| Doug | Owns verification evidence and honest residual-risk callout. |
| Desi | Deferred; no UI surface in this session. |
| Brandon | Deferred; brand launch messaging will use these specs later. |

Subagent used:

- **Fermat:** local schema/docs explorer for existing models, DRY risks, and cross-link candidates.

### Scope guard

Docs/specs only. Do not add Prisma models, migrations, server actions, UI, Stripe products, or entitlement enforcement code in SESSION_0029.

## Pre-flight

Pre-flight: waived by Petey for code/backend/component checklists because this is a docs/spec-only session. The schema checklist's Petey gate is still honored by this plan, and schema discovery is recorded in the resulting specs before any future Prisma changes.

## Task log

| Task ID | Status |
| --- | --- |
| SESSION_0029_TASK_01 | landed |
| SESSION_0029_TASK_02 | landed |
| SESSION_0029_TASK_03 | landed |
| SESSION_0029_TASK_04 | landed |

## What landed

- Preserved Brian's pasted ChatGPT source at `docs/architecture/source/raw/SESSION_0029_programs_curriculum_monetization_chatgpt_raw.md`.
- Created `docs/architecture/programs-curriculum-certification-spec.md`.
  - Defines Program vs Course vs Certification.
  - Defines enrollment lifecycle, curriculum hierarchy, completion rules, instructor approval, certificate issuance, paid/free access, and public preview behavior.
  - Records DRY warnings against current Prisma: do not duplicate `Program`, `Course`, `PricingPlan`, `Certification`, certificate, progress, or rank prerequisite models.
- Created `docs/architecture/monetization-entitlements-spec.md`.
  - Defines Product, PricingPlan, Subscription, Payment, Invoice, Entitlement, UserEntitlement, refund/revoke behavior, Stripe mapping, and access-control flow.
  - Makes entitlement layer the next monetization spine before paid UI.
- Created `docs/architecture/dirstarter-commerce-alignment.md`.
  - Maps Ronin commerce/curriculum work to current Dirstarter docs areas.
  - Records current Dirstarter paths for content and SEO docs.
- Updated `docs/protocols/WORKFLOW_5.0.md`.
  - SESSION_0029 is now the inserted commerce learning path spec session.
  - Planned School Ops CRUD continuation moves to SESSION_0030.
  - SESSION_0033 now calls out the entitlement layer with billing.
- Patched stale schema-status docs:
  - `docs/architecture/data-model.md`
  - `docs/architecture/plan-vs-current.md`
  - `docs/knowledge/wiki/dirstarter-docs-inventory.md`
- Updated wiki index/log and Project Log.
- Removed clean merged worktrees:
  - `/Users/brianscott/dev/wt-school-ops`
  - `/Users/brianscott/dev/wt-core-platform`
- Deleted local merged branches:
  - `session-0028-school-ops`
  - `session-0023-core-platform`
- Hardened `docs/rituals/closing.md`.
  - Full close now records worktree cleanup in git hygiene.
  - Full close now requires ADR and ubiquitous-language checks.
  - ADRs that touch Dirstarter baseline layers now require compact live Dirstarter docs proof links.
- Added `docs/architecture/decisions/0011-entitlement-first-commerce.md`.
- Added commerce glossary terms to `docs/architecture/ubiquitous-language.md`.

## Files touched

- `docs/sprints/SESSION_0029.md` — session plan, evidence, review, closeout.
- `docs/architecture/source/raw/SESSION_0029_programs_curriculum_monetization_chatgpt_raw.md` — raw source preservation.
- `docs/architecture/programs-curriculum-certification-spec.md` — accepted learning path and certification spec.
- `docs/architecture/monetization-entitlements-spec.md` — accepted commercial access and entitlement spec.
- `docs/architecture/dirstarter-commerce-alignment.md` — Dirstarter baseline alignment map.
- `docs/protocols/WORKFLOW_5.0.md` — session calendar and launch board resequenced.
- `docs/protocols/project-log.md` — task plan statuses and review entry.
- `docs/architecture/data-model.md` — schema count/status corrected after Waves A-D.
- `docs/architecture/plan-vs-current.md` — S2/Wave status corrected from migration-pending to schema-live/feature-pending.
- `docs/knowledge/wiki/dirstarter-docs-inventory.md` — current content/SEO Dirstarter docs paths patched.
- `docs/knowledge/wiki/index.md` — new specs/raw source/session indexed.
- `docs/knowledge/wiki/log.md` — wiki change log entry added.
- `docs/rituals/closing.md` — bow-out worktree cleanup plus ADR/glossary proof rule.
- `docs/architecture/ubiquitous-language.md` — Product, PricingPlan, Entitlement, UserEntitlement, EntitlementGrant terms.
- `docs/architecture/decisions/0011-entitlement-first-commerce.md` — accepted entitlement-first commerce ADR with Dirstarter proof links.
- `docs/architecture/README.md` — architecture index updated with commerce specs and ADR 0011.

## Decisions resolved

- SESSION_0029 is a spec/design session, not the originally planned School Ops CRUD continuation.
- The raw ChatGPT schema examples are source material only. They are not accepted Prisma migrations.
- `Product` is a commercial abstraction for now; an internal Prisma `Product` table is deferred until a unified catalog is proven necessary.
- Entitlements are the next required monetization substrate before more paid UI.
- `PricingPlan` should be extended rather than replaced.
- `CurriculumItem` remains the MVP lesson-like unit; `CourseModule`/`Lesson` are deferred.
- Current certificate models (`CertificateTemplate`, `CertificateOrder`, `CertificateIssuance`) are reused rather than duplicated.
- Raw `RankRequirement` is deferred until belt-test implementation proves current prerequisite models are insufficient.
- ADR 0011 accepts entitlement-first commerce and keeps internal `Product` deferred until implementation proves a unified catalog is needed.
- Full close now requires an ADR/glossary check and compact Dirstarter proof links for ADRs touching baseline layers.

## Open decisions / blockers

- Future implementation must decide whether internal `Product` lands with entitlements or after `PricingPlan` gains Stripe IDs.
- Future implementation must decide whether certificate purchases stay on `CertificateTemplate.priceCents` or move to `PricingPlan`.
- Future implementation must decide whether credential cataloging needs `CertificationDefinition`/`CredentialDefinition`.
- D-014 remains open: production stance for Dirstarter `Tool` residue is not resolved by this session.
- No code or schema migration was performed in SESSION_0029.
- Remote branches for the removed worktrees were not deleted; only local worktree directories and local merged branches were removed.

## Verification

- `git diff --check` — passed.
- `bun run wiki:lint` — passed; 121 markdown files; no lint violations.
- `bunx prisma validate --schema apps/web/prisma/schema.prisma` — passed; schema valid.
- `rg` stale-doc check for old Dirstarter content/SEO paths and S2 migration-pending claims — only intentional stale-alias notes remain.
- `git worktree list --porcelain` — passed; only `/Users/brianscott/dev/ronin-dojo-app` remains.

## Review log

- `SESSION_0029_REVIEW_01` recorded in `docs/protocols/project-log.md`.
- `SESSION_0029_REVIEW_02` recorded in `docs/protocols/project-log.md`.

## Hostile close review

### SESSION_0029_REVIEW_01 — Commerce learning path specs hostile review

**Reviewed tasks:** SESSION_0029_TASK_01, SESSION_0029_TASK_02, SESSION_0029_TASK_03

**Dirstarter docs check:** live docs checked on 2026-04-30.

**Sources:** `https://dirstarter.com/docs/codebase/structure`, `https://dirstarter.com/docs/database/prisma`, `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/docs/integrations/payments`, `https://dirstarter.com/docs/content`, `https://dirstarter.com/docs/monetization`, `https://dirstarter.com/docs/automation`, `https://dirstarter.com/docs/blog`, `https://dirstarter.com/docs/seo`, `https://dirstarter.com/docs/theming`, `https://dirstarter.com/docs/cron-jobs`

**Verdict:** Sound and ready to guide the next implementation sessions. The specs correctly treat raw ChatGPT Prisma blocks as source material, not accepted schema. They identify existing `Program`, `Course`, `PricingPlan`, `Certification`, certificate, and progress models before proposing deltas. The main architectural decision is explicit: build entitlements before paid UI so access does not leak into scattered plan checks.

**Score: 9.6/10** — No hard caps triggered. Minor residual risk remains because Product/entitlement implementation decisions are queued for the future implementation session.

### SESSION_0029_REVIEW_02 — Bow-out hardening and worktree cleanup review

**Reviewed tasks:** SESSION_0029_TASK_04

**Dirstarter docs check:** live docs checked on 2026-04-30.

**Sources:** `https://dirstarter.com/docs/codebase/structure`, `https://dirstarter.com/docs/database/prisma`, `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/docs/integrations/payments`, `https://dirstarter.com/docs/monetization`

**Verdict:** Safe and useful governance hardening. The old feature worktrees were clean and already merged into `main`, so removing them and deleting their local branches was appropriate. ADR 0011 now records the entitlement-first decision with Dirstarter proof links, and the glossary has the terms future implementation sessions need.

**Score: 9.7/10** — No hard caps triggered. Residual risk is limited to future implementation choices for Product and entitlement schema.

## Reflections

- The biggest catch was that the raw source was directionally useful but not schema-aware. Blindly adding it would have duplicated multiple landed models.
- The local docs still carried stale "migration pending" language after Waves A-D. Fixing that was necessary before the new specs could be trusted.
- Dirstarter docs paths changed for Content Management and SEO; the session now records the current live paths and treats older paths as stale aliases.
- The next paid-access work should start with entitlements, not UI, because UI-first monetization would repeat the exact coupling the specs are trying to avoid.
- The extra worktrees were clean and already merged into `main`; close should explicitly check that state instead of leaving stale checkout directories around.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | New docs include JETTY frontmatter; touched architecture/wiki/session docs have `updated: 2026-04-30` and `last_agent: codex-session-0029` where applicable. |
| Backlinks/index sweep | New specs, raw source, ADR 0011, closing ritual, and glossary link to SESSION_0029; wiki index now lists the three specs, raw source, ADR 0011, and SESSION_0029. |
| Wiki lint | `bun run wiki:lint` passed; 121 markdown files; no lint violations. |
| Kaizen reflection | Reflections section present: yes. |
| Hostile close review | `SESSION_0029_REVIEW_01` and `SESSION_0029_REVIEW_02` recorded in this SESSION and `docs/protocols/project-log.md`. |
| Review & Recommend | Next session goal written below: Class schedules vertical slice. |
| Memory sweep | Durable project facts captured in architecture docs and ADR 0011: raw snippets are source only; entitlement layer precedes paid UI; Dirstarter content/SEO paths patched; future close requires ADR/glossary check. No external memory update needed. |
| Next session unblock check | Unblocked. SESSION_0030 can resume School Ops with ClassSchedule CRUD using Program CRUD patterns and the new entitlement specs as billing guardrails. |
| Git hygiene | Branch `main`; `git worktree list` now shows only the main worktree; local merged branches `session-0028-school-ops` and `session-0023-core-platform` deleted; changes left uncommitted because no commit/push was requested. `git status --short` reviewed; no secrets or env files touched. |

## Next session

- **Goal:** Resume the School Ops vertical slice with Class schedules, class sessions, and instructor assignments.
- **Inputs to read:**
  1. `docs/sprints/SESSION_0029.md`
  2. `docs/protocols/WORKFLOW_5.0.md`
  3. `docs/architecture/programs-curriculum-certification-spec.md`
  4. `docs/architecture/monetization-entitlements-spec.md`
  5. `apps/web/server/web/program/`
  6. `apps/web/prisma/schema.prisma` (`ClassSchedule`, `ClassSession`, `ClassInstructorAssignment`, `Program`)
- **First task:** Run Cody backend/component pre-flight for ClassSchedule CRUD, using Program CRUD as the vertical-slice pattern and keeping brand/org auth predicates server-side.

Bowed out — SESSION_0029 closed. Next session goal: Class schedules vertical slice.
