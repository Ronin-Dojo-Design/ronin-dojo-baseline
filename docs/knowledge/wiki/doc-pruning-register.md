---
title: "Doc Pruning Register"
slug: doc-pruning-register
type: registry
status: active
created: 2026-05-18
updated: 2026-06-20
author: Brian + Giddy
last_agent: claude-session-0298
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/knowledge/wiki/repo-truth-index.md
  - docs/knowledge/wiki/ronin-project-context.md
pairs_with:
  - docs/product/README.md
  - docs/product/baseline-martial-arts/PRD.md
  - docs/product/black-belt-legacy/PRD.md
tags:
  - docs
  - pruning
  - canon
  - archive
---

# Doc Pruning Register

This register tracks docs that may need to be consolidated, demoted to reference, or archived.

Do not delete or move a doc just because it feels stale. First preserve the useful summary in a canonical or active-supporting doc.

## Status vocabulary

| Status | Meaning | Default action |
| --- | --- | --- |
| canonical | Current source of truth for a domain | Keep indexed and maintained |
| active supporting | Useful and current, but not top authority | Keep and link from canonical docs |
| reference | Historical/raw source or implementation context | Keep out of primary load path |
| archive candidate | Superseded, duplicated, stale, or imported reference | Move only after summary is preserved |

## Candidate register

| Path / pattern | Current status | Recommended status | Canonical replacement / summary target | Reason | Action |
| --- | --- | --- | --- | --- | --- |
| `docs/architecture/source/Launch-OS-Baseline-Martial-Arts-.md` | reference | active supporting / later reference | `docs/product/baseline-martial-arts/PRD.md`, `docs/product/baseline-martial-arts/STORIES.md`, `docs/knowledge/wiki/ronin-project-context.md` | Useful Baseline launch/source material, but too broad to remain the active product truth now that Baseline has a canonical PRD/story pack. | Keep as source for now; demote after Baseline PRD is accepted. |
| `docs/architecture/source/*` | mixed | reference | `docs/knowledge/wiki/ronin-project-context.md`, product docs, ADRs | Raw planning/source material should not compete with accepted architecture/product docs. | Review one-by-one before archive moves. |
| `docs/_imports/*` | reference | reference (kept, excluded) | `docs/knowledge/wiki/repo-truth-index.md`, `docs/knowledge/wiki/ronin-project-context.md` | Imported packs often duplicate adopted wiki/registry content. | **RESOLVED (SESSION_0298):** kept in place. `_imports/` is excluded by directory name from both `wiki:lint` and the docs navigator, so it is **already out of the active load path**. A physical move to `_archive/` was rejected — zero active-load benefit, and it would push the cold files one level deeper, breaking their outbound relative links. Canonical replacements already carry the live content. |
| `docs/ronin_dojo_baseline_systems_pack/*` | reference | reference (kept, excluded) | existing wiki registries and project-context | Earlier generated systems pack appears duplicated by current repo-native wiki docs. | **RESOLVED (SESSION_0298):** kept in place, same rationale as `docs/_imports/*` above — excluded by dir name from lint + nav, already out of active load; physical relocation rejected as value-negative. |
| older deep research reports | reference | archive candidate | relevant product PRD, architecture spec, or wiki concept | Useful source material, but too heavy for active startup/context load. | Keep as source/archive, not active canon. |
| older launch reports superseded by `WORKFLOW_5.0` | mixed | reference/archive candidate | `docs/protocols/WORKFLOW_5.0.md`, latest session files | Avoid competing launch calendars and stale sprint plans. | Add superseded_by metadata before archive. |
| duplicate repo truth index imports | reference | reference (kept, excluded) | `docs/knowledge/wiki/repo-truth-index.md` | Canonical truth index already exists. | **RESOLVED (SESSION_0298):** these live under `docs/_imports/` — covered by the `docs/_imports/*` decision above (kept in place, excluded from active load). |
| duplicate alias/canonical-id imports | reference | reference (kept, excluded) | `docs/knowledge/wiki/aliases-and-canonical-ids.md` | Canonical alias ledger already exists. | **RESOLVED (SESSION_0298):** under `docs/_imports/` — covered by the `docs/_imports/*` decision above. |
| session-specific planning reports whose decisions landed elsewhere | mixed | reference | latest relevant `docs/sprints/SESSION_NNNN.md`, PRD, ADR, or architecture doc | Session planning is useful history, not always active product truth. | Demote only after landed decision is linked. |
| `docs/sprints/SESSION_0221..04xx.md` (closed sessions) | active | keep active | `docs/sprints/_archive/` available if needed | **SESSION_0423 hygiene sweep:** archive frontier sits at 0220 (0001–0220 already in `_archive/`); ~180 closed sessions linger in the active dir. 22 `in-progress` were reconciled in 0423 (21 retro-closed, only the live session left). | **SKIPPED (operator, SESSION_0423).** The 21 retro-closes were the real fix; closed sessions stay in the active dir (the index lists both active + `_archive/`, so they're not orphaned). Revisit only if active-dir size becomes a problem — then `git mv SESSION_0221..N → _archive/` + rewrite each index row path to `../../sprints/_archive/`. |

## Archive metadata rule

When a doc is archived or demoted, add or preserve metadata like:

```yaml
superseded_by: docs/path/to/canonical.md
summary_preserved_in: docs/path/to/summary.md
archive_reason: duplicated | stale | raw-source | superseded | imported-reference
```

## Giddy pruning rule

The goal is not fewer docs at any cost.

The goal is fewer active truths.

Keep useful history. Compress active canon.
