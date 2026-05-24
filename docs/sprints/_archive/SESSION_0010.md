---
title: "SESSION 0010 — Adopt baseline systems pack into repo canon"
slug: session-0010
type: session
status: closed-unclean
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0010
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0009.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION_0010

**Date:** 2026-04-27
**Operator:** Brian + Claude (Petey orchestrating; parallel sub-agents as Cody)
**Goal:** Adopt the imported `ronin_dojo_baseline_systems_pack` docs into baseline repo canon, wire them into the wiki/protocol structure, and surface candidates for the next real execution target.
**Status:** closed-unclean
**Reason for unclean close:** Session ended without bow-out; closing recovered in SESSION_0011 via UNCLEAN_CLOSING protocol.

---

## Petey plan

### Source of work

User imported a 12-doc ChatGPT-produced governance/SOP/content-engine pack at `docs/ronin_dojo_baseline_systems_pack/` plus an explicit adoption checklist at `docs/ronin_dojo_baseline_systems_pack/baseline_repo_docs_adoption_checklist.md`.

### Strategy

Follow the adoption checklist in order. Phase 1 preserves raw imports. Phase 2 canonicalizes 11 docs into final paths with JETTY 3.0 frontmatter + required section stubs. Phase 3 wires them into the wiki index and injects cross-links into 5 existing canonical docs. Phase 4 closes this session. Phase 5 chooses the next real proof target.

### Parallelism plan

Three sub-agents run concurrently for Phase 2 — work is purely additive across disjoint files, so no merge risk and no need for git worktrees:

- **Agent A** — 6 control docs (truth-index, aliases, manual-boundary, jetty-3-profile, how-to-use, next-session-loading-order)
- **Agent B** — 3 SOPs under `docs/runbooks/`
- **Agent C** — 2 content-engine docs under `docs/knowledge/wiki/content-engine/`

Petey runs Phase 3 wiring sequentially because the wiki index and cross-link insertions edit shared files.

### Open decisions surfaced for user

- **Next-target tension:** SESSION_0009 said next was S3 org create+join flow. The adoption checklist (#10) recommends "Passport bootstrap smoke proof" as next real execution target. Both are recorded under "Next session: candidates" — pick at bow-out.
- **Worktrees:** declined for this session (additive doc work, zero conflict risk). Re-evaluate when the next session involves overlapping code changes.

---

## What landed

- **Phase 1 — preserve:** 14 raw imports copied verbatim into `docs/_imports/baseline-systems-pack/` and committed as `1b21e6e` so the raw source is frozen in git history before any normalization.
- **Phase 2 — canonicalize:** 11 canonical files written at their final repo paths with JETTY 3.0 frontmatter and required section stubs. Three sub-agents ran in parallel against disjoint file sets (control docs, SOPs, content-engine).
- **Phase 3 — wire repo memory:** wiki index updated with new entries under Meta, Concepts, Sessions, Protocols, and Runbooks. Cross-links injected into 5 existing canonical docs.
- **Phase 4 — sessionize:** this file. Status flips to `closed-full` when Brian picks the next-target.

## Files touched

### New canonical (Phase 2)

- `docs/knowledge/wiki/repo-truth-index.md` — concept; what each part of the repo is the truth for
- `docs/knowledge/wiki/aliases-and-canonical-ids.md` — concept; historical → canonical names across brands, models, enums
- `docs/knowledge/wiki/manual-boundary-registry.md` — runbook; "smoke pending / code complete / verified" registry, drives next proof target
- `docs/knowledge/jetty-3-baseline-systems-profile.md` — protocol; baseline-repo extension of JETTY 3.0
- `docs/knowledge/how-to-use-these-registries.md` — protocol; daily usage pattern for the new registries
- `docs/protocols/next-session-loading-order.md` — protocol; explicit tier-1/2/3 file load order at bow-in
- `docs/runbooks/sop-data-and-wiring-flows.md` — runbook
- `docs/runbooks/sop-e2e-user-lifecycle.md` — runbook
- `docs/runbooks/sop-agent-workflows-and-rituals.md` — runbook; pairs with petey/cody/opening/closing
- `docs/knowledge/wiki/content-engine/command-center-and-intake.md` — concept
- `docs/knowledge/wiki/content-engine/video-shortcuts-and-iggy-flow.md` — concept

### Preservation (Phase 1)

- `docs/_imports/baseline-systems-pack/*` — 14 files; raw imports frozen unchanged

### Wiki page (the checklist itself)

- `docs/knowledge/wiki/baseline-docs-adoption-checklist.md` — protocol; the adoption checklist promoted from `_imports/` into wiki canon

### Modified (Phase 3 wiring)

- `docs/knowledge/wiki/index.md` — added entries under Meta (×2), Concepts (×4), Sessions (×1: SESSION_0010), Protocols (×1), Runbooks (×4); bumped `last_agent` and `updated`
- `docs/architecture/program-plan.md` — added "Governance and canon registries" subsection with 3 links
- `docs/architecture/plan-vs-current.md` — added Cross-references with 3 links
- `docs/protocols/chat-handoff.md` — added Cross-references with 2 links
- `docs/rituals/opening.md` — extended Cross-references with 2 links (Next Session Loading Order, Repo Truth Index)
- `docs/rituals/closing.md` — extended Cross-references with 2 links (Manual Boundary Registry, SOP Agent Workflows and Rituals)

## Decisions resolved

- **Adoption order:** Phase 1 → 2 → 3 → 4 → (Phase 5 deferred to next session).
- **Worktrees declined:** purely additive doc work has no merge conflict surface; parallel sub-agents on `main` was sufficient.
- **Raw imports kept twice (intentionally, temporarily):** `docs/ronin_dojo_baseline_systems_pack/` (original drop) AND `docs/_imports/baseline-systems-pack/` (preservation copy). Both remain until next session; archival/deletion of the original drop is a Phase-5 concern.
- **Petey-style sign-offs ("OSSS", "Planned Passion Produces Purpose") dropped from canonical docs.** They live in the preserved raw imports if anyone wants them back.

## Open decisions / blockers

- **Pick next-target.** Two candidates listed below; user chooses at bow-out.
- **Original drop directory `docs/ronin_dojo_baseline_systems_pack/` still present.** Per checklist Phase 5: "archive or delete the raw duplicates afterward." Recommend deferring archive/deletion until canonical files have been used in a real session, then removing in a single sweep.
- **Pre-existing markdownlint warnings** surfaced by the IDE on `program-plan.md`, `chat-handoff.md`, `opening.md` — these warnings exist on lines untouched by SESSION_0010 edits (table column spacing, MD025 multiple-h1, MD032 blank-line). Out of scope for this session; can be cleaned in a wiki-lint sweep.

## Next session

- **Goal:** Passport bootstrap smoke proof + S3 org create/join if space allows
- **Inputs to read:** `docs/sprints/SESSION_0010.md`, `docs/knowledge/wiki/manual-boundary-registry.md`, `docs/protocols/next-session-loading-order.md`, `docs/architecture/program-plan.md`
- **First task:** Run UNCLEAN_CLOSING recovery for SESSION_0010, then begin Passport bootstrap smoke proof

### Candidates for next-target

1. **Passport bootstrap smoke proof** — checklist's recommended next real execution target; promotes the just-shipped S2 work from "code complete / smoke pending" to "verified" via the manual-boundary registry.
2. **S3 — Organization create + join flow (T2)** — `server/web/organization/actions.ts` with `createOrganization` action (Org + Membership + OrganizationDiscipline in transaction).

---

## Reflections

### What went well

- **Parallel sub-agents on disjoint file sets** — 3 agents wrote 11 canonical files in roughly the time of the longest single agent. Worktrees would have added overhead with zero conflict benefit.
- **Raw-source checkpoint commit before mutation** (commit `1b21e6e`) — clean rollback path if any canonical file turned out to be a poor port; the pristine import is one `git show` away.
- **Adoption checklist itself was the work plan.** No re-derivation of order; we executed the checklist's Phases 1–4 verbatim.

### What to watch

- **Two parallel copies of the raw imports** (the original drop at `docs/ronin_dojo_baseline_systems_pack/` and the preservation copy at `docs/_imports/baseline-systems-pack/`) violate the "no two near-duplicate files active forever" rule from the adoption checklist. This is intentional during the in-progress phase; close the loop next session by archiving or deleting the original drop directory.
- **Section-header demotion** was applied by all three sub-agents to fit raw `##` headers under canonical section stubs. Content preserved; structure changed. If a doc reads oddly, the raw import at `_imports/` is the diff target.

### Patterns to codify

- **"Adopt → preserve → canonicalize → wire → sessionize" pattern** is now generalized in `docs/knowledge/wiki/baseline-docs-adoption-checklist.md`. Reuse for any future external doc pack drop.
