---
name: graphify-explain
description: Explain a subsystem/domain from the repo graph — communities, hubs, and the exact file set — instead of bulk-reading or grepping to build a mental map. Use for "explain how X works", "map the Y subsystem", onboarding a lane onto unfamiliar territory, or pre-plan recon.
---

Build a subsystem explanation FROM the graph, then verify — never from a grep sweep or
bulk file reads (CLAUDE.md Graphify-first rule; runbook:
`docs/runbooks/dev-environment/graphify-repo-memory.md`).

Steps:

1. From the **canonical checkout** (`/Users/brianscott/dev/ronin-dojo-app` — worktree
   graphs are empty by design, 0 nodes ≠ no matches):

   ```bash
   graphify stats
   graphify query "<subsystem nouns — code AND doc terms>" --budget 2500
   ```

2. From the result, name: the hub files (highest-degree nodes), the community/cluster
   boundaries, the doc nodes (ADRs, ledger rows, runbooks, domain hubs) that govern the
   area. If a domain hub exists in `docs/runbooks/domain-features/`, read it before
   explaining — hub → SOP/ADR → route inventory order.

3. Open ONLY the hub files + governing docs (typically 3–6 files), read the load-bearing
   parts, and verify every claim you are about to make against source. Graph = navigation,
   source = proof.

4. Deliver the explanation as: one-paragraph shape → hub files with roles (`file:line`
   refs) → data flow → governing decisions (ADR/ledger) → known gotchas from memory/ledger
   nodes the query surfaced. State what you did NOT verify.

5. If the query surfaced nothing for a claimed capability, say "not found via graph" and
   confirm against the domain hub/route inventory before asserting it is missing.
