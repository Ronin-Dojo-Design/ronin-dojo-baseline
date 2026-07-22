---
name: gu
description: Refresh the repo's Graphify graph so /gq and /ge read current code. Run at bow-out or after a large structural change (moves/renames/new subsystems). This is the update half the bow-out ritual already calls.
---

Rebuild the Graphify graph data in `.graphify/` (consumed by `/gq`, `/ge`, `graphify stats`)
from the **canonical checkout** — details in
`docs/runbooks/dev-environment/graphify-repo-memory.md`.

1. Run the incremental refresh (AST-only, fast, no API cost):

   ```bash
   cd /Users/brianscott/dev/ronin-dojo-app && GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .
   ```

   The env var lifts the default 5000-node viz cap so the whole codebase indexes.

**When to run:**

- **Bow-out** — this is the same command the closing ritual runs (`docs/rituals/closing.md`);
  running it here IS the bow-out graph refresh, don't double it.
- **After a large structural change** — file moves/renames, a new subsystem, or a big
  extraction, so the next `/gq` / `/ge` isn't reading a stale map.

Notes:

- `update` refreshes graph **data**, not the dashboard viz. The `/graphify.html` artifact is a
  separate `graphify export --format html` output (`bun run graphify:viz`) — `update` never
  touches it.
- Skip for tiny single-file edits; the graph is worth refreshing only when structure moved.
