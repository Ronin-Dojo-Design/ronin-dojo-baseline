---
title: "ADR 0049 — Session numbering: one global spine, lane facet, ref-claim mint, pre-staged stubs"
slug: adr-0049-session-numbering-lane-facet-and-ref-claim-mint
type: decision
status: accepted
created: 2026-07-19
updated: 2026-07-19
last_agent: claude-session-0574
pairs_with:
  - docs/rituals/opening.md
  - docs/rituals/closing.md
  - docs/sprints/_template/SESSION_TEMPLATE.md
  - docs/architecture/decisions/0048-two-repo-vault-kit-and-client-ops-projections.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - architecture
  - governance
  - sessions
---

# ADR 0049 — Session numbering: one global spine, lane facet, ref-claim mint, pre-staged stubs

## Status

Accepted in SESSION_0574 (operator MC grill, Lane B — answers A·B·A·A·A·A across the six forks;
vault-side capture: `MMB_DECISIONS` row MMB-D-029). Prompted by 24 hours of independent partial
solutions to the same problem: the 0574 number-gap leak, the 0575/0576 same-checkout close race,
0577/0578 claiming numbers invisibly in worktrees, 0578's prose reservation protocol, 0575's
FS-0030 ID allocator, and 0576's Bases frontmatter-only finding. This ADR wires them together.

## Context

Sessions run in parallel lanes (platform governance, MMB, BBL, fan-out build lanes) across the
canonical checkout and git worktrees. `docs/sprints/SESSION_NNNN.md` numbering was claimed by
eyeball; worktree claims are invisible to siblings until merge; gaps leak and get manually
recycled; the MMB vault already runs a de-facto second sequence (`MMB_SESSION_NNNN`) paired to
repo sessions only in prose table cells, invisible to Obsidian Bases (which reads frontmatter
only). The operator proposed lane-prefixed session files (`RDD_`/`MMB_`/`BBL_`/`BMA_`/`USA_`) +
pre-staged next-session links. A prior lane file family (`docs/sprints/lanes/LANE-S0NN-*.md`)
was built and abandoned — evidence against a second file tree.

## Decision

1. **One file family.** `SESSION_NNNN.md` stays the only session file family and the global
   spine (total order across lanes). Lane identity is a **frontmatter facet**, not a filename:
   `lane: repo | rdd | mmb | bbl | bma | usa` (all five product lanes registered now;
   `usa` = WEKAF-USA), optional `lane_seq` (per-lane ordinal, renders as e.g. `MMB_0006`),
   optional `vault_session` (vault twin id). Vault session files carry the reverse key
   `repo_session:`. Per-lane index pages, when wanted, are script-GENERATED — never hand-edited.
2. **Ref-claim mint.** `bun scripts/ledger-id-next.ts --prefix=SESSION` prints the next free
   number over the union of canonical `docs/sprints/`, every mounted worktree's `docs/sprints/`,
   and `session-*` branch names. The bow-in branch (`session-NNNN-<lane-slug>`) IS the claim —
   visible from every checkout pre-merge. Canonical-checkout sessions are claimed by the file
   itself.
3. **Reservations are branches; gaps burn.** Fan-out plans reserve numbers by creating the lane
   branches at plan time (0579–0581 conformed at ratification). Leaked gaps are retired, never
   recycled (the manual 0574 recycle that opened this session is grandfathered as the last).
4. **Pre-staged next session = a real staged stub.** At bow-out, mint N+1 and create
   `SESSION_NNNN+1.md` with `status: staged` and Goal/First-task filled from the closer's
   `## Next session` block; set `next_session:` in the closer's frontmatter. Bow-in step 1 finds
   the stub as the highest-numbered file and **adopts** it (flip `staged` → `in-progress`; no
   `cp`). Skip pre-staging only when the lane explicitly ends.
5. **Cross-ref grammar: frontmatter is SoT.** `goal_ids` (goals-ledger IDs), `tickets`
   (wayfinder issue numbers), `lane`, `lane_seq`, `vault_session`/`repo_session`,
   `next_session`, plus existing `pairs_with`. Section headers MAY carry `[[wikilinks]]`/issue
   links as human sugar; lint and tooling never parse headers (Bases reads frontmatter only —
   SESSION_0576 finding).

## Consequences

- Forward-only: no renames of SESSION_0001…0578 or MMB_SESSION_0002…0005; vault twins gained
  additive `repo_session:` keys at ratification.
- opening.md (steps 1, 6), closing.md (§2, §6.5), and SESSION_TEMPLATE.md carry the mechanics;
  the read-path consumes the artifacts (0476 push-vs-pull law) — nothing depends on memory.
- The old "highest-numbered file" bow-in rule keeps working unchanged; a staged stub simply IS
  that file.
- Dirstarter proof: not applicable — session governance process, no baseline layer touched.
