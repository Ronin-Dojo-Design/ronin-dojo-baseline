---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

> **Repo scope (RDD-local preamble — MMB-D-021; not upstream).** The FIRST question of every
> grill is the goal election: "What is the /goal for this session?" — multiple-choice with a
> recommendation, one-letter answer:
> **A)** As-is — the pinned goal (prior `Next session` block / MMB pickup card) ·
> **B)** Pivot — operator names the new goal (yes/no Boolean pivots welcome) ·
> **C)** Triage — top-3 open lane/ledger items from the repo Loop-of-Loops
> (`bun scripts/ledger-backlog.ts` + `board-backlog`) ·
> **D)** Triage — top-3 from the brand-vault dashboard (one goal · one risk · one ledger lane,
> e.g. social media) ·
> **F)** Fix/fail lane — triage the fix ledgers (FS / fallow audit / hostile-close findings /
> open PRs / code-quality) and route to `/fallow-fix-loop` · `/pr-fix-loop` · `/code-quality`,
> mix-and-match (MMB-D-022).
> Only after the goal is elected does the branch-walk begin. MC-grill format throughout
> (options + recommendation, one-letter answers — the operator-loved 0572 format).

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time.

If a question can be answered by exploring the codebase, explore the codebase instead.
