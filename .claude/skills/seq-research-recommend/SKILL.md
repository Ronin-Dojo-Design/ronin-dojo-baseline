---
name: seq-research-recommend
description: Sequence skill — "research first, recommend, don't build" (the /rr move). Use when the operator asks to look into something, evaluate an option, or check for prior art before any code/doc is written; also the default move when a plan step turns out to be "does this already exist?"
---

Thin pointer over [`docs/protocols/review-recommend.md`](../../../docs/protocols/review-recommend.md)
plus a mandatory prior-art step. Read this file and follow in order; it carries no judgment calls
of its own — the protocol it points at does.

1. **Graphify prior-art query FIRST** — from the CANONICAL checkout, before any repo-wide
   `grep`/`rg`/`find`/`ls`: `cd /Users/brianscott/dev/ronin-dojo-app && graphify query "<nouns>"
   --budget 1500` per [`graphify-query`](../graphify-query/SKILL.md). This is the step that makes
   "research first" real — SESSION_0582's `/rr` found `scripts/auto-session.sh` (an existing
   headless driver) before anyone reinvented it; a research pass that skips this step is just
   guessing with extra steps.
2. **Open what the graph names and read it.** Graph output is navigation, not proof — verify by
   direct read before citing it as prior art.
3. **Run [`review-recommend.md`](../../../docs/protocols/review-recommend.md) steps 1–4:** review
   what already landed/exists, check the [manual boundary registry](../../../docs/knowledge/wiki/manual-boundary-registry.md),
   check the [program plan](../../../docs/architecture/program-plan.md) / the relevant goals-ledger
   row, then produce **one** recommendation with alternatives named (not five options dumped on
   the operator).
4. **Route, don't build.** The output of this skill is a recommendation + a routed ledger entry
   (or a `Next session` staging per review-recommend.md §5) — never new code or a new doc family.
   If the operator ratifies the recommendation, that's a *separate* dispatch (Petey plan → Cody
   build), not an extension of this skill's run.
5. **Record** the query + the recommendation + where it was routed in the current SESSION file,
   so the next reader doesn't re-run the same research.
