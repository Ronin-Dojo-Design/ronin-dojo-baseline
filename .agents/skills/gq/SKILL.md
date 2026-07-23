---
name: gq
description: Graphify-first discovery — budget-capped graph query instead of repo-wide grep/find/ls. Use before any cross-area code/doc search, when asked "what relates to X", or when a lane needs discovery in a fresh worktree (worktree graph is empty — query the canonical checkout). Aliases the former /graphify-query.
---

Run a budget-capped Graphify query INSTEAD of repo-wide `grep`/`rg`/`find`/`ls` discovery
(CLAUDE.md standing rule; details in `docs/runbooks/dev-environment/graphify-repo-memory.md`).

1. **Always query from the canonical checkout** — the graph lives there only:

   ```bash
   cd /Users/brianscott/dev/ronin-dojo-app && graphify query "<lane nouns + domain terms>" --budget 1500
   ```

   Widen to `--budget 2000` if the first pass misses. A fresh worktree reads **0 nodes = graph
   not built there, NEVER "no matches"** — never assert a negative from a worktree/empty/errored
   query.

2. **Navigation aid, not proof.** Open the exact files the graph returns and verify by direct
   read before making any claim or edit.

3. Targeted `grep -n` INSIDE a file you already opened is fine; what this skill replaces is
   repo-wide discovery sweeps. If the query still misses, re-noun it or run ONE scoped `rg` on
   the graph-suggested directory before a repo-wide fallback.

4. The graph indexes docs too — ADRs, ledger rows (D-NNN/WL/G), learning records surface as
   nodes. Query for captured knowledge before re-deriving it.

5. Record the query + selected files in the SESSION file when it changed what you opened.
