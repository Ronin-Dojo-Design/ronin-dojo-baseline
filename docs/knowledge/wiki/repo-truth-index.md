---
title: Repo Truth Index
slug: repo-truth-index
type: concept
status: active
created: 2026-04-27
updated: 2026-04-29
author: Brian + ChatGPT
last_agent: codex-session-0025
health: 7
pairs_with:
  - aliases-and-canonical-ids
  - manual-boundary-registry
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/architecture/program-plan.md
  - docs/knowledge/wiki/baseline-docs-adoption-checklist.md
  - docs/knowledge/how-to-use-these-registries.md
needs_fix:
  - "Needs backlinks added to any newly linked docs"
tags:
  - governance
  - canon
  - architecture
---

## Summary

Map the source of truth for the **new baseline repo**, not the old monorepo. This file answers where truth lives, what is active vs reference, what is code truth vs behavioral truth vs operational truth, and what should not be confused with something else.

## Status

Active, adopted SESSION_0010.

## Key Idea

Truth in this repo is split across distinct canonical domains (stack, behavior, schema, brand, auth, session, ritual, knowledge, public content, operational, legacy). When domains conflict, resolve them in a fixed order — ADR > schema > program plan > auth doc > latest session > legacy.

Quick rule set:

- **Schema truth beats nostalgia**
- **ADR truth beats habit**
- **Latest session truth beats memory**
- **MDX is current public content truth**
- **Content atoms are emerging structured editorial truth**
- **Wiki pages are repo memory, not clutter**
- **Legacy monorepo is reference, not active canon**

## Structure

### 1. Canonical truth domains

#### A. Stack / framework truth
**Canonical source:** repo root README + `apps/web/` + `apps/mobile/`

Confirms:
- Next.js web app
- Expo mobile app
- Postgres backend
- Prisma schema
- MDX blog content
- package structure

**Rule:** Do not use old WP/PODS assumptions when the repo README or package layout says otherwise.

#### B. Behavioral product truth
**Canonical source:**
- `docs/architecture/program-plan.md`
- `docs/architecture/plan-vs-current.md`
- `docs/architecture/source/chatgpt-original-plan.md`

These files answer what the system is supposed to do, what the Passport + Shells architecture means, and what is already covered vs still pending.

**Rule:** When code and behavior feel disconnected, start here before editing the schema or UI.

#### C. Schema truth
**Canonical source:** `apps/web/prisma/schema.prisma`

The schema is the platform spine for: identity, memberships, tournaments, registrations, content-atom direction, subscriptions, lineage, certifications, waivers.

**Rule:** If a behavior needs durable data, the Prisma schema wins over old architectural sketches.

#### D. Brand truth
**Canonical source:**
- `docs/architecture/decisions/0004-multi-brand-as-column.md`
- host-derived brand behavior in middleware
- `activeBrandId` logic in auth/brand context docs

Brand is a data and routing concern, not a separate backend stack.

Current truth:
- `BASELINE_MARTIAL_ARTS` = flagship outward training brand
- `BBL` = Black Belt Legacy
- `WEKAF` = WEKAF USA
- `RONIN_DOJO_DESIGN` = umbrella/admin/studio lane
- `TUFFBUFFS` is intentionally not first-class in the new enum right now

**Rule:** Do not casually reintroduce TuffBuffs as a first-class new-platform enum without an explicit migration reason.

#### E. Auth truth
**Canonical source:** `docs/architecture/auth.md`

Defines: Better-Auth as auth base, host brand vs active app brand distinction, authorization model, mobile auth decision boundary, future Prisma brand-scope enforcement.

**Rule:** Do not create auth assumptions outside this file without updating it.

#### F. Session / handoff truth
**Canonical source:** latest `docs/sprints/SESSION_NNNN.md`

The active state file for: what landed, what blocked, next session, files touched, decisions resolved.

**Rule:** There is no separate giant dashboard state file here. The latest session file is the living handoff.

#### G. Ritual / protocol truth
**Canonical source:**
- `docs/rituals/opening.md`
- `docs/rituals/closing.md`
- `docs/protocols/chat-handoff.md`
- supporting protocol docs

The control-plane ritual and workflow layer for the baseline repo.

**Rule:** Use these instead of porting the old dashboard rituals over blindly.

#### H. Knowledge / documentation truth
**Canonical source:** `docs/knowledge/wiki/index.md` + wiki pages under `docs/knowledge/wiki/`

The repo follows an LLM-wiki pattern: index, concept pages, file pages, sessions, protocols, runbooks, templates.

**Rule:** Treat the wiki as repo-native structured memory, not as disposable commentary.

#### I. Public content truth
**Canonical source today:** `apps/web/content/blog/` MDX

Current content truth is split into:
1. **Public long-form content today** = MDX in repo
2. **Knowledge/process truth** = wiki/docs/sessions
3. **Future structured reusable editorial truth** = ContentAtom / ContentTask / content-variant direction

**Rule:** Do not pretend the content engine has already replaced MDX if it has not.

#### J. Operational truth
**Canonical source:** Postgres + Prisma models + runbooks + session files

Includes durable user/app state, membership state, registrations, publication state when implemented, workflow state recorded in sessions/runbooks.

**Rule:** If the state must survive retries, runtime, or release flow, it belongs in the app/database/runbook layer — not just in chat.

#### K. Legacy reference truth
**Canonical source:** old monorepo and older external planning artifacts

Useful for: UI reference, migration comparison, historical intent, legacy behavior lookup.

**Rule:** Legacy docs are reference-only unless explicitly promoted into this repo.

### 2. Active vs reference

**Active**
- repo README
- current Prisma schema
- current ADRs
- current program plan
- current plan-vs-current doc
- current auth doc
- current rituals/protocols
- current wiki index
- latest session file

**Reference only**
- old monorepo dashboard structures
- old WP/PODS architectural assumptions
- older planning packets not imported into this repo
- style systems that were never promoted into ADR/program docs

### 3. Truth resolution order

When there is conflict, resolve in this order:

1. latest ADR / accepted architecture decision
2. current Prisma schema for durable data shape
3. current program plan / plan-vs-current docs
4. current auth doc for auth/brand context
5. latest session file for in-flight operational state
6. legacy/reference docs only if needed

## Relationships

- Pairs with: [Aliases and Canonical IDs](aliases-and-canonical-ids.md), [Manual Boundary Registry](manual-boundary-registry.md)
- Backlinks: [wiki index](index.md), [program-plan](../../architecture/program-plan.md)

## Sources

- Raw import: `docs/_imports/baseline-systems-pack/02_REPO_TRUTH_INDEX_BASELINE.md`

## Open Questions

_TBD during next adoption pass_
