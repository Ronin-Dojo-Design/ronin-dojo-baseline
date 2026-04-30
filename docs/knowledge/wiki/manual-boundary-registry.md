---
title: Manual Boundary Registry
slug: manual-boundary-registry
type: runbook
status: active
created: 2026-04-27
updated: 2026-04-30
author: Brian + ChatGPT
last_agent: codex-directory-monetization-roadmap
pairs_with:
  - repo-truth-index
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/chat-handoff.md
  - docs/rituals/closing.md
  - docs/sprints/SESSION_0023.md
  - docs/protocols/task-review-log.md
  - docs/knowledge/wiki/baseline-docs-adoption-checklist.md
  - docs/knowledge/how-to-use-these-registries.md
tags:
  - blockers
  - ops
  - proof
---

## Summary

Track every important thing in the new baseline repo that still depends on human signoff, credentials, environment proof, runtime validation, release approval, or a deferred architectural choice. Manual work is not weakness — hidden manual work is.

## Status

Active, adopted SESSION_0010.

## When to use

Open this registry:

- at bow-in for planning-heavy sessions
- before declaring a milestone closed
- before staging/prod readiness
- whenever someone says "manual step" or "smoke pending"

Status vocabulary:
- `open`
- `waiting_on_owner`
- `waiting_on_credentials`
- `waiting_on_env`
- `scheduled`
- `verified`
- `archived`

Blocker classes:
- `auth_decision`
- `runtime_proof`
- `brand_migration`
- `docs_wiring`
- `data_model_decision`
- `deploy_env`
- `mobile_contract`
- `content_system_decision`
- `cleanup`
- `qa_proof`

## Steps

### 1. Read the registry

| ID | Lane | Boundary | Owner | Blocker class | Proof required | Status |
|---|---|---|---|---|---|---|
| MB-001 | S2 auth | Lock mobile auth path: Better-Auth mobile SDK vs JWT bridge fallback | owner + Cody | mobile_contract | one explicit architecture decision + implementation target | open |
| MB-002 | brand scope hardening | Decide and implement Prisma brand-scope enforcement layer | Cody | auth_decision | code path + test evidence + updated auth doc | open |
| MB-003 | brand switcher | Finish `activeBrandId` persistence + switch flow + smoke proof | Cody | runtime_proof | working end-to-end flow, session survives reload | open |
| MB-004 | S2 Passport bootstrap | Convert "code complete / smoke pending" into verified flow | Cody + Doug | qa_proof | signup -> Passport stub -> DirectoryProfile stub smoke proof | verified |
| MB-005 | transitional cleanup | Remove Dirstarter reference models before prod or formally quarantine them | Petey + Cody | cleanup | tracked removal plan or quarantine ADR | open |
| MB-006 | Baseline rollout | Approve Baseline-first public rollout surfaces and alias rules | Brandon + owner | brand_migration | approved alias map + rollout checklist | open |
| MB-007 | staging deploy | Vercel + Neon staging environment proof | Cody + Doug | deploy_env | deploy succeeds + smoke checklist passes | open |
| MB-008 | docs/wiki quality | Backlinks and doc health upgrades on key pages | Petey + Doug | docs_wiring | wiki lint pass + index updates | open |
| MB-009 | content engine path | Decide current truth split: MDX-only now vs ContentAtom-backed intake-to-publish path | Petey + Iggy + owner | content_system_decision | written policy + phased adoption plan | open |
| MB-010 | legacy migration | Clarify when BBL/WEKAF porting resumes relative to Baseline-first milestone | Petey + owner | brand_migration | updated program lane note | open |
| MB-011 | directory monetization | Decide whether paid listings stay on Dirstarter `Tool` or become a Ronin-native listing model | Petey + Cody + Brandon | content_system_decision | ADR or roadmap decision plus migration/quarantine plan | open |
| MB-012 | local environment cleanup | Remove or archive accidental Local by Flywheel WordPress public directory from the working context | owner + Cody | cleanup | explicit owner approval + path verification before delete/archive | open |

### 2. Notes by boundary

**MB-001 — Mobile auth path.** Current auth documentation explicitly preserves two viable mobile options. That means the mobile contract is not fully closed.

**MB-002 — Brand scope enforcement.** The docs already describe a future Prisma extension for stronger brand scoping. Until that is real, the safety posture is partly procedural and partly architectural.

SESSION_0023 update: Wave A added operational and billing tables (`Invoice`, `MembershipContract`, `Attendance`, `CheckIn`, `PayoutSplit`, etc.). No routes/actions expose them yet, but every future query/mutation touching these tables must prove brand scope plus organization membership/role checks before this boundary can close.

**MB-003 — Active brand persistence.** The auth doc names the behavior clearly. What matters now is operational proof.

**MB-004 — Passport bootstrap.** ~~Program plan notes this is code complete but still needs smoke proof. That makes this a perfect tracked manual boundary instead of a vague "almost done."~~ **VERIFIED SESSION_0011:** `scripts/smoke-passport.ts` proves User→Passport→DirectoryProfile creation, read, update, re-read, and default verification. Proof artifact: `apps/web/scripts/smoke-passport.ts` + passing run log.

**MB-005 — Dirstarter residue.** The schema literally marks template models for future removal before production. That should stay visible until handled.

**MB-009 — Content system path.** The repo has MDX blog content now, ContentAtom-style schema direction, and a wiki/docs/session knowledge layer. This needs a crisp operating rule so the system does not fork into three half-truths.

**MB-011 — Directory monetization model.** The roadmap intentionally reuses Dirstarter `Tool` and `Ad` for near-term paid listing proof. Before production, decide whether that remains the canonical paid listing substrate, gets renamed/promoted into a generic `DirectoryListing`, or is replaced by paid overlays on `Organization`, `Program`, and `Event`.

**MB-012 — Local WordPress public directory cleanup.** The session began in `/Users/brianscott/Local Sites/ronin-dojo/app/public/` because VS Code was opened from the Local by Flywheel WordPress site. ADR 0005 already says that install is abandoned and irrelevant to the new stack. Do not delete it silently; verify the path and get owner approval first.

### 3. Closure rule

A boundary may only become `verified` when:

1. the choice/action is complete,
2. proof artifact exists,
3. owner is known,
4. next-state docs are updated.

If proof does not exist, it stays open.

## Rollback

If a boundary was closed prematurely (no proof artifact, owner unknown, or downstream docs not updated), reopen it by setting status back to `open` and recording why in the boundary's notes section. Never silently archive an unverified boundary.

## Last verified

2026-04-27 — MB-004 (Passport bootstrap) verified in SESSION_0011 via `scripts/smoke-passport.ts`.
