---
name: graphify-query
description: Graphify-first discovery — budget-capped graph query instead of repo-wide grep/find/ls. Use before any cross-area code/doc search, when asked "what relates to X", or when a lane needs discovery in a fresh worktree (worktree graph is empty — query the canonical checkout).
---

Run a budget-capped Graphify query INSTEAD of repo-wide `grep`/`rg`/`find`/`ls` discovery
(CLAUDE.md standing rule; details in `docs/runbooks/dev-environment/graphify-repo-memory.md`).

Steps:

1. **Always query from the canonical checkout** — the graph lives there only:

   ```bash
   cd /Users/brianscott/dev/ronin-dojo-app && graphify stats
   cd /Users/brianscott/dev/ronin-dojo-app && graphify query "<lane nouns + domain terms>" --budget 1500
   ```

   A fresh worktree reads **0 nodes = graph not built there, NEVER "no matches"** — never
   assert a negative from a worktree/empty/errored query.

2. Open the exact files the graph names and verify by direct read. Graph output is
   navigation, not proof.

3. Targeted `grep -n` INSIDE a file you already opened is fine; what this skill replaces is
   repo-wide discovery sweeps. If the graph query misses, widen the budget to 2000–3000 or
   re-noun the query before falling back to one scoped `rg` on the graph-suggested directory.

4. Graph indexes docs too — ledger rows (D-NNN/WL/G), ADRs, learning records surface as
   nodes. Query for captured knowledge before re-deriving it.

5. Record the query + selected files in the SESSION file when it changed what you opened.
