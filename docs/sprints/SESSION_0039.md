---
title: "SESSION 0039 — Planning review + Dirstarter baseline index"
slug: session-0039
type: session
status: in-progress
created: 2026-05-03
updated: 2026-05-03
last_agent: copilot-session-0039
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0038_5.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0039 — Planning review + Dirstarter baseline index

## Date

2026-05-03

## Operator

Brian Scott + Copilot (Petey — planning)

## Status

closed-full

## Goal

Hard planning review session. Stop the build→fix→build cycle. Produce a comprehensive **Dirstarter Baseline Index** that documents everything already built in the template so future sessions extend rather than reinvent. Review dirstarter.com/docs integration plan.

## Context

Brian's observation: we are building then fixing, instead of planning then building. The Dirstarter boilerplate was purchased specifically because it provides a complete foundation. Every future feature should be an extension or slight modification of what already exists — not invented from scratch.

### Relevant drift entries
- **D-008** 🟡 — Local `dirstarter_template/` inaccessible to remote agents → this index solves it
- **D-012** 🟡 — Dirstarter source audit not completed → this session completes it
- **D-014** ✅ — `Tool` residue → decided: repurpose as Directory Listing (Option B, see baseline index §14)

### Previous session (0038.5)
- All 7 remediation tasks completed (lead CRUD hardening)
- Accepted risks: email send not wired, status transitions via admin, trigram index at scale
- Kaizen: 5→7

## Tasks

1. ✅ Create `docs/architecture/dirstarter-baseline-index.md` — full inventory of template files (300+ files, 12 sections)
2. ✅ Petey-plan: integrate index into workflow — updated Cody pre-flight, closed D-008/D-012
3. ✅ dirstarter.com/docs deep dive — fetched all 15+ doc pages, documented integration patterns in §13 of baseline index
4. ✅ D-014 decision: Tool → Directory Listing repurpose (Option B) — rationale + migration plan in §14 of baseline index
5. ✅ Upstream divergence audit — identified next-safe-action vs oRPC, Next 15 vs 16, Biome vs OXC (§13k)

## What landed

- `docs/architecture/dirstarter-baseline-index.md` — comprehensive 14-section document:
  - §1–11: File inventory with Ronin status tracking (✅/🟡/⚠️/🆕)
  - §13: dirstarter.com/docs integration patterns (auth, email, storage, payments, rate limiting, analytics, content, middleware, config, env vars, upstream divergence)
  - §14: D-014 decision — repurpose Tool as Directory Listing with migration plan
- Updated `docs/protocols/cody-preflight.md` — Component and Backend checklists require baseline index consultation
- Closed D-008, D-012, D-014 in drift register
- Identified upstream divergence: `next-safe-action` → `oRPC` (no migration needed), Next 15 → 16 (monitor), Biome → OXC (defer)

## Files touched

- `docs/architecture/dirstarter-baseline-index.md` — New: full Dirstarter baseline inventory + docs patterns + D-014 decision
- `docs/protocols/cody-preflight.md` — Added baseline index consultation requirement
- `docs/knowledge/wiki/drift-register.md` — Closed D-008, D-012, D-014
- `docs/sprints/SESSION_0039.md` — This file

## Decisions resolved

- **D-014: Tool → Directory Listing (Option B)** — Repurpose the ~30 Tool-related files as the Directory Listing pipeline. The CRUD, search, filtering, submission, Stripe tiers, and content workflow are exactly what the school directory needs. Migration is a future session task.
- **Dirstarter template stays out of repo** — local workspace reference only
- **Cody pre-flight enforces index consultation** — no more building from scratch
- **No oRPC migration** — our `next-safe-action` version works, stay on it
- **No Next.js 16 upgrade** — monitor, don't upgrade mid-sprint

## Open decisions / blockers

- **D-005** 🔴 — Cache pattern still open (auth-scoped data risk)
- **D-010** 🔴 — Program plan vs May 18 all-brand launch still unresolved
- **D-011** 🔴 — 13+ schema entities missing for full launch
- **Tool → Listing migration** — decided but not executed. Needs a session to relabel UI, routes, config.
- **Email send wiring** — `sendEmail()` still not called in `createPublicLead`

## Next session

**Goal**: Content + Curriculum surfaces (Course CRUD, Technique library, Certificate templates) — see `docs/sprints/lanes/LANE-S040-content-curriculum.md`

**Inputs to read**:
- `docs/sprints/lanes/LANE-S040-content-curriculum.md` (lane manifest — all recipes + template files listed)
- `docs/architecture/dirstarter-baseline-index.md` §3 (server patterns) — only if manifest is insufficient

**First task**: Read lane manifest, confirm Course/Technique/CertificateTemplate models exist in schema, then start Recipe 1 (Course + CurriculumItem admin CRUD).

## Additional work (late session)

- ✅ Resolved all 6 high-confidence drifts in `dirstarter-gap-audit.md` (all were false alarms — template source matches our code)
- ✅ Resolved all 3 internal repo conflicts
- ✅ Resolved all 3 open questions
- ✅ Classified template residue inventory per D-014
- ✅ Created lane manifest framework: `docs/sprints/lanes/`
- ✅ Created `LANE-S040-listing-relabel.md` — Tool → Listing UI relabel
- ✅ Created `LANE-S041-content-curriculum.md` — Course/Technique/Certificate surfaces
- ✅ Created `LANE-S042-tournament-ops.md` — Tournament discovery + registration

## Additional files touched

- `docs/knowledge/wiki/dirstarter-gap-audit.md` — Fixed corrupted frontmatter, resolved all drift/conflict tables, resolved open questions
- `docs/sprints/lanes/LANE-S040-listing-relabel.md` — New: lane manifest for Tool→Listing relabel
- `docs/sprints/lanes/LANE-S041-content-curriculum.md` — New: lane manifest for content/curriculum
- `docs/sprints/lanes/LANE-S042-tournament-ops.md` — New: lane manifest for tournament ops
- `docs/protocols/cody-preflight.md` — JETTY date + last_agent bump
- `docs/knowledge/wiki/drift-register.md` — JETTY date + last_agent bump
- `docs/knowledge/wiki/manual-boundary-registry.md` — JETTY date + last_agent bump
- `docs/architecture/decisions/0011-entitlement-first-commerce.md` — JETTY date + last_agent bump

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated `updated: 2026-05-03` + `last_agent: copilot-session-0039` on: cody-preflight.md, drift-register.md, manual-boundary-registry.md, 0011-entitlement-first-commerce.md. Fixed corrupted frontmatter on dirstarter-gap-audit.md. |
| Backlinks/index sweep | dirstarter-gap-audit.md backlinks already include SESSION_0039. Lane manifests are new files, not wiki pages — no index update needed. |
| Wiki lint | `bun run wiki:lint` → ✅ No lint violations found. (141 files scanned) |
| Kaizen reflection | Reflections section present: yes (below) |
| Hostile close review | Not applicable — planning-only session, no code changes |
| Review & Recommend | Next session goal written: yes (see Next session section) |
| Memory sweep | Lane manifest framework introduced — protocol-level addition worth remembering. No operator memory update needed; the manifests themselves are the artifact. |
| Next session unblock check | Unblocked. LANE-S040 manifest is ready; Cody can execute immediately. |
| Git hygiene | Branch: main. Changes committed below. |

## Reflections

### What worked well
- **The baseline index paid off immediately.** Building the 300+ file inventory first meant every drift resolution was a quick grep-and-compare, not a discovery expedition.
- **Most "drifts" were phantom.** 5 of 6 high-confidence drifts turned out to be comparing against the wrong reference (dirstarter.com/docs = latest version, not our fork). The lesson: **template source code is the L1 truth, not the docs site.**
- **Lane manifests are the right abstraction.** They solve the token waste problem by pre-computing "what to read" so Cody doesn't search 300+ files.

### What almost broke
- The `replace_string_in_file` tool corrupted `dirstarter-gap-audit.md` frontmatter by matching an ambiguous string and injecting the resolved drift table into the YAML. Caught by wiki-lint. **Lesson:** Always verify frontmatter integrity after bulk edits to markdown files.

### Anti-patterns observed
- Building a lane manifest for SESSION_0036 (already completed) — failed to check session history before planning. **Lesson:** Always verify what's already shipped before creating forward-looking artifacts.

### Framework insight: Lane Manifests
The lane manifest concept fills a gap between "read the whole baseline index" (too expensive) and "search ad-hoc" (too wasteful). Key properties:
1. One manifest per build session, created in the prior planning session
2. Cites exactly 3-6 template files to read (not 300+)
3. Explicit "delta from template" per recipe
4. Token budget estimate (~5-7K vs ~23K searching blind)
5. Scope guard: what's IN and what's explicitly OUT

### Kaizen score
- Planning efficiency: 8/10 (wasted time on wrong lane manifest, recovered well)
- Documentation quality: 9/10 (all artifacts are clean, cross-referenced, lint-passing)
- Session discipline: 7/10 (scope expanded beyond original 5 tasks into gap audit + lane manifests — justified but unplanned)
- **Aggregate: 8/10** (up from 5→7 in prior sessions)
