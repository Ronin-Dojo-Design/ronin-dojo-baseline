---
title: "Doc Pruning Register"
slug: doc-pruning-register
type: registry
status: active
created: 2026-05-18
updated: 2026-05-18
author: Brian + Giddy
last_agent: chatgpt-giddy
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
| `docs/_imports/*` | reference | archive candidate | `docs/knowledge/wiki/repo-truth-index.md`, `docs/knowledge/wiki/ronin-project-context.md` | Imported packs often duplicate adopted wiki/registry content. | Preserve summaries, then move cold. |
| `docs/ronin_dojo_baseline_systems_pack/*` | reference | archive candidate | existing wiki registries and project-context | Earlier generated systems pack appears duplicated by current repo-native wiki docs. | Compare before moving. |
| older deep research reports | reference | archive candidate | relevant product PRD, architecture spec, or wiki concept | Useful source material, but too heavy for active startup/context load. | Keep as source/archive, not active canon. |
| older launch reports superseded by `WORKFLOW_5.0` | mixed | reference/archive candidate | `docs/protocols/WORKFLOW_5.0.md`, latest session files | Avoid competing launch calendars and stale sprint plans. | Add superseded_by metadata before archive. |
| duplicate repo truth index imports | reference | archive candidate | `docs/knowledge/wiki/repo-truth-index.md` | Canonical truth index already exists. | Archive duplicated imports after check. |
| duplicate alias/canonical-id imports | reference | archive candidate | `docs/knowledge/wiki/aliases-and-canonical-ids.md` | Canonical alias ledger already exists. | Archive duplicated imports after check. |
| session-specific planning reports whose decisions landed elsewhere | mixed | reference | latest relevant `docs/sprints/SESSION_NNNN.md`, PRD, ADR, or architecture doc | Session planning is useful history, not always active product truth. | Demote only after landed decision is linked. |

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
