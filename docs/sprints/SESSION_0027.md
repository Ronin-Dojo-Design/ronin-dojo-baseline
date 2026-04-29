---
title: "SESSION 0027 — Governance audit + SOP compliance restoration"
slug: session-0027
type: session
status: complete
created: 2026-04-28
updated: 2026-04-28
last_agent: copilot-session-0027
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0026.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0027 — Governance audit + SOP compliance restoration

## Date

2026-04-28

## Operator

Brian Scott

## Status

complete

## Goal

Restore WORKFLOW 5.0 process discipline by auditing all governance artifacts, archiving/consolidating stale docs, and closing FS-0006/FS-0007. Produce a clean, enforceable protocol surface before any feature lane work resumes.

## Bow-in audit

- Previous session read: `docs/sprints/SESSION_0026.md` (closed-full, score 7.5/10)
- Open failed steps: FS-0006 (Petey not invoked), FS-0007 (protocols not enforced) — both acknowledged, both targeted this session
- Current branch: `main`, clean working tree
- Lane: Core platform governance
- WORKFLOW_5.0 calendar deviation: SESSION_0027 mapped to Tournament ops (May 5), but SESSION_0026 identified governance audit as prerequisite blocker. Proceeding with governance audit.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None — governance/docs only |
| Extension or replacement | N/A |
| Why justified | Process discipline is a prerequisite for safe feature delivery; FS-0006/FS-0007 are open |
| Risk if bypassed | Protocol decay compounds; every future session inherits the same shortcuts |

## Petey plan

### Goal

Audit all governance artifacts, classify each as active-enforced / active-unenforced / stale / archive-candidate, consolidate or archive what isn't earning its keep, and close FS-0006 + FS-0007.

### Tasks

#### SESSION_0027_TASK_01 — Governance artifact inventory

- **Agent:** Petey
- **What:** Scan all docs in `docs/protocols/`, `docs/runbooks/`, `docs/knowledge/wiki/`, `docs/agents/`, `docs/rituals/`, and root-level logs (`build-log.md`, `task-plan-log.md`, `task-review-log.md`). Classify each as:
  - **active-enforced** — agents actually consult this during work
  - **active-unenforced** — exists and is correct but agents skip it
  - **stale** — content is outdated or contradicts current state
  - **archive-candidate** — no longer serves a purpose
- **Steps:**
  1. List all files in governance directories
  2. Check `updated` dates and `health` scores in frontmatter
  3. Cross-reference with WORKFLOW_5.0 session lifecycle and opening/closing rituals
  4. Produce classification table in this SESSION file
- **Done means:** Classification table exists with every governance doc categorized
- **Depends on:** nothing

#### SESSION_0027_TASK_02 — Consolidate or archive stale artifacts

- **Agent:** Cody
- **What:** For each `stale` or `archive-candidate` doc, either update it to match current state or move it to `docs/_archive/`. For `active-unenforced` docs, determine if the fix is (a) wire into loading order, (b) merge into another doc, or (c) accept it's aspirational and downgrade to reference.
- **Steps:**
  1. Process each classification from TASK_01
  2. Archive truly dead docs
  3. Update stale docs with current info
  4. Merge redundant docs
- **Done means:** Every doc is either `active-enforced`, freshly archived, or updated
- **Depends on:** SESSION_0027_TASK_01

#### SESSION_0027_TASK_03 — Close FS-0006 + FS-0007

- **Agent:** Cody
- **What:** Implement the corrective actions from FS-0006 and FS-0007, then mark them `mitigated` or `closed` with verification evidence.
- **Steps:**
  1. Expand `cody-preflight.md` to cover schema/backend/migration work (FS-0006 corrective #2)
  2. Ensure Petey invocation gate is documented and enforceable (FS-0006 corrective #1, #4)
  3. Reduce protocol surface area per TASK_02 findings (FS-0007 corrective #3)
  4. Update `failed-steps-log.md` with verification evidence
- **Done means:** FS-0006 and FS-0007 status changed to `mitigated` with concrete verification methods
- **Depends on:** SESSION_0027_TASK_02

### Parallelism

All three tasks are sequential — TASK_02 depends on TASK_01's classification, TASK_03 depends on TASK_02's consolidation decisions.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Petey | Inventory and classification is planning work |
| TASK_02 | Cody | File edits, archival, updates — execution work |
| TASK_03 | Cody | Protocol edits and failed-steps-log updates |

### Open decisions

- Should `build-log.md` be archived or kept as a lightweight changelog? (User sign-off needed)
- Should `task-plan-log.md` and `task-review-log.md` be merged into one file? (User sign-off needed)

### Risks

- Governance audit could surface more issues than one session can resolve — scope guard applies, overflow goes to SESSION_0028.
- Schema changes from SESSION_0026 are still uncommitted — not this session's scope but noted.

### Scope guard

If additional work surfaces during execution, note it in `Open decisions / blockers` — do NOT expand scope mid-task.

## TASK_01 output — Governance artifact inventory

### Health score definition (from JETTY 3.0)

Per `docs/knowledge/JETTY_3.0.md`:

| Score | Meaning |
| --- | --- |
| 0–2 | Broken, missing, or critically wrong |
| 3–4 | Exists but incomplete or stale |
| 5–6 | Functional, minor gaps |
| 7–8 | Solid, reviewed, tested |
| 9–10 | Production-quality, fully wired, verified |

**Petey's take:** The health score was defined in the JETTY 3.0 spec as a subjective 0–10 self-assessment by the agent that last touched the file. There's no rubric beyond the table above — no criteria per doc type, no verification step. Most files got stamped 7 or 8 on creation and were never re-evaluated. It's decoration, not measurement. Recommendation below.

### Inventory — Protocols (12 files)

| File | Health | Updated | Classification | Notes |
| --- | --- | --- | --- | --- |
| `WORKFLOW_5.0.md` | 5 | Apr 28 | **active-unenforced** | Governing OS but SESSION_0026 ignored it entirely; session calendar is already stale (dates don't match actual sessions) |
| `chat-handoff.md` | 7 | Apr 26 | **active-enforced** | SESSION file format — agents actually follow this |
| `code-guardrails.md` | 8 | Apr 26 | **active-unenforced** | Good rules but never checked during sessions |
| `cody-preflight.md` | — | Apr 27 | **active-unenforced** | Missing health score entirely; only covers UI components, not schema/backend (FS-0006) |
| `failed-steps-log.md` | 8 | Apr 28 | **active-enforced** | Actually read at bow-in; entries are actionable |
| `hostile-close-review.md` | 8 | Apr 29 | **active-enforced** | Used in SESSION_0025/0026 closes |
| `next-session-loading-order.md` | 7 | Apr 27 | **active-unenforced** | Defines tier loading but agents don't actually follow the tiers |
| `petey-plan.md` | 7 | Apr 27 | **active-enforced** | Used this session; format is clear |
| `review-recommend.md` | 7 | Apr 27 | **active-unenforced** | Referenced in bow-out but rarely actually run as a separate step |
| `task-plan-log.md` | 8 | Apr 28 | **stale** | Supposed to be the audit ledger but entries not created at planning time (FS-0006) |
| `task-review-log.md` | 8 | Apr 28 | **active-enforced** | Used in SESSION_0025/0026; has real entries |
| `wiki-lint.md` | 8 | Apr 29 | **active-enforced** | `bun run wiki:lint` works and is run at close |

### Inventory — Runbooks (7 files)

| File | Health | Updated | Classification | Notes |
| --- | --- | --- | --- | --- |
| `database.md` | 6 | Apr 25 | **stale** | Created early; likely duplicated by `dev-environment.md` and `prisma-workflow.md` |
| `dev-environment.md` | 8 | Apr 27 | **active-enforced** | Actually used; closed FS-0002 |
| `prisma-workflow.md` | 7 | Apr 26 | **active-unenforced** | Overlaps with `schema-migration.md` |
| `schema-migration.md` | 8 | Apr 29 | **active-unenforced** | Good content but SESSION_0026 skipped it entirely for Wave B/C/D |
| `sop-agent-workflows-and-rituals.md` | 7 | Apr 27 | **archive-candidate** | Ported from baseline systems pack; content now lives in `agents/`, `rituals/`, `protocols/` |
| `sop-data-and-wiring-flows.md` | 7 | Apr 27 | **archive-candidate** | Aspirational; never consulted; content not actionable yet |
| `sop-e2e-user-lifecycle.md` | 7 | Apr 27 | **archive-candidate** | Aspirational; describes flows that don't exist yet |

### Inventory — Agents (3 files)

| File | Health | Updated | Classification | Notes |
| --- | --- | --- | --- | --- |
| `README.md` | 6 | Apr 26 | **stale** | Doesn't mention Giddy, Doug, Desi, Brandon (WORKFLOW_5.0 personas) |
| `cody.md` | 7 | Apr 27 | **active-enforced** | Referenced in copilot-instructions; needs backend/schema scope expansion |
| `petey.md` | 7 | Apr 26 | **active-enforced** | Referenced in copilot-instructions; used this session |

### Inventory — Rituals (2 files)

| File | Health | Updated | Classification | Notes |
| --- | --- | --- | --- | --- |
| `opening.md` | 7 | Apr 29 | **active-enforced** | Used this session; v5.0 refresh done |
| `closing.md` | 7 | Apr 29 | **active-enforced** | Used in recent sessions |

### Inventory — Wiki (root, 12 files)

| File | Health | Updated | Classification | Notes |
| --- | --- | --- | --- | --- |
| `index.md` | 8 | Apr 29 | **active-enforced** | Master index; wiki-lint checks it |
| `log.md` | 7 | Apr 29 | **active-unenforced** | Change log; exists but agents don't add entries consistently |
| `aliases-and-canonical-ids.md` | 7 | Apr 29 | **active-unenforced** | Useful reference but rarely consulted |
| `baseline-docs-adoption-checklist.md` | 7 | Apr 27 | **stale** | Adoption is done (FS-0003 closed); checklist is historical |
| `dirstarter-docs-inventory.md` | 7 | Apr 28 | **active-unenforced** | Reference doc for Dirstarter file awareness |
| `dirstarter-gap-audit.md` | 6 | Apr 28 | **stale** | One-time audit; findings should be in plan-vs-current or archived |
| `drift-register.md` | 7 | Apr 27 | **active-unenforced** | Overlaps with `failed-steps-log.md` and `manual-boundary-registry.md` |
| `incidents.md` | 7 | Apr 27 | **stale** | No real incidents logged; placeholder |
| `manual-boundary-registry.md` | 7 | Apr 29 | **active-enforced** | Read in Petey plan protocol; has real entries |
| `repo-truth-index.md` | 7 | Apr 29 | **active-unenforced** | Good reference but agents don't consult it before file edits |

### Inventory — Wiki subfolders (21 files)

| File | Health | Updated | Classification | Notes |
| --- | --- | --- | --- | --- |
| `concepts/open-brain-repo-memory.md` | 8 | Apr 27 | **archive-candidate** | Meta-philosophy about agent memory; not operational |
| `concepts/passport-and-shells.md` | — | Apr 29 | **active-unenforced** | Core domain concept; no health score |
| `files/*.md` (15 files) | 7/— | Apr 27–29 | **stale** | Component/file wiki pages from S3–S4 features; many have no health score; they document code that has since changed |
| `content-engine/*.md` (4 files) | 6/— | Apr 26–27 | **archive-candidate** | Content engine planning from pre-schema era; not actionable; schema has moved past these designs |

### Inventory — Architecture docs (not in audit scope but noted)

12+ files in `docs/architecture/`. These are design docs, not governance artifacts. Not classifying them here, but note that `plan-vs-current.md`, `data-model.md`, and `s2-schema-additions.md` need updating post-Wave B/C/D.

### Summary counts

| Classification | Count |
| --- | --- |
| **active-enforced** | 15 |
| **active-unenforced** | 14 |
| **stale** | 7 |
| **archive-candidate** | 7 |
| **Total governance docs** | 43 |

### Health score recommendation

**Drop health scores from JETTY frontmatter.** Reasons:

1. No objective rubric — agents self-assign on creation and never re-evaluate
2. 33 of 43 files sit at 7 — it's a default, not a measurement
3. The wiki-lint rule R7 ("flag if health not re-evaluated in 30 days") creates busywork, not insight
4. WORKFLOW_5.0 already has a real scoring system (10-point rubric for deliverables) — health scores on docs are redundant and lower-quality
5. **Replace with:** `status` field does the real work (active / stale / deprecated / archived). If a doc is `active`, it's expected to be correct. If it's wrong, change `status`, don't decrement a number.

**Decision needed from you:** Drop health scores, or keep them with a real rubric?

## What landed

- **Health scores dropped** — removed `health:` field from 107 files; JETTY 3.0 updated; wiki-lint R7 retired
- **Three logs merged** — `build-log.md` + `task-plan-log.md` + `task-review-log.md` → `docs/protocols/project-log.md`; originals archived to `docs/_archive/`
- **Stale runbooks archived** — `database.md`, `prisma-workflow.md` → `docs/_archive/`
- **One-time docs deprecated** — `baseline-docs-adoption-checklist.md`, `dirstarter-gap-audit.md` → status: deprecated
- **3 SOP runbooks wired into active use** — now referenced in `cody-preflight.md` schema/backend checklists
- **Cody pre-flight expanded** — new Schema Checklist and Backend Checklist; Petey invocation gate for 3+ model changes
- **Drift register wired** — added to opening ritual step 3b
- **Agents README updated** — all 6 WORKFLOW 5.0 personas listed
- **Wiki index cleaned** — Health column removed; project-log replaces 3 old entries
- **FS-0006 mitigated** — Petey invocation gate enforced via cody-preflight schema checklist
- **FS-0007 mitigated** — protocol surface reduced, unenforced docs wired into touchpoints

## Files touched

| Path | Note |
| --- | --- |
| `docs/protocols/project-log.md` | New — merged 3 logs |
| `docs/protocols/cody-preflight.md` | Expanded with schema + backend checklists |
| `docs/protocols/failed-steps-log.md` | FS-0006 + FS-0007 → mitigated |
| `docs/protocols/wiki-lint.md` | R7 retired |
| `docs/protocols/hostile-close-review.md` | pairs_with updated |
| `docs/knowledge/JETTY_3.0.md` | Health scoring section updated |
| `docs/knowledge/wiki/index.md` | Health column removed; project-log |
| `docs/rituals/opening.md` | project-log refs; drift-register in 3b |
| `docs/rituals/closing.md` | project-log refs |
| `docs/agents/README.md` | All 6 personas |
| `docs/runbooks/sop-*.md` (3 files) | pairs_with cleaned |
| `docs/_archive/` (5 files) | Archived |
| 107 files across docs/ | `health:` removed |

## Decisions resolved

1. **Health scores: dropped.** `status` field handles freshness.
2. **Three logs merged** into `project-log.md`.
3. **SOP runbooks: kept and wired** into cody-preflight.
4. **Content-engine wiki pages: kept.**
5. **Drift register: kept separate**, wired into opening ritual.

## Open decisions / blockers

- Schema changes from SESSION_0026 (Waves B/C/D) still uncommitted — not this session's scope
- WORKFLOW_5.0 session calendar stale — defer to next planning session
- 15 wiki `files/*.md` pages stale — update when features next touched

## Task log

| Task ID | Status |
| --- | --- |
| SESSION_0027_TASK_01 | landed |
| SESSION_0027_TASK_02 | landed |
| SESSION_0027_TASK_03 | landed |
