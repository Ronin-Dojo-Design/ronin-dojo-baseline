---
name: bow-out
description: End a session — run the BaselineDashboard closing ritual at docs/rituals/closing.md
---

Read and follow `docs/rituals/closing.md`. That doc is the source of truth; execute its steps as written.

Repo defaults (full standing directives in `CLAUDE.md`):

- **Start with the gate runner:** `bash scripts/bow-out-gates.sh` runs every deterministic close-gate in one
  pass (task-log, format-fix, wiki:lint, build-if-app-code, graphify, git state, ledger cross-off + backlog +
  fallow delta + hostile-review trigger) and prints a pre-filled evidence table + an LLM-remainder checklist.
  Work the checklist remainder; don't re-run gates by hand.
- Run the **full** close — the optional deep items (Reflections, hostile review, evidence table, ADR check,
  memory sweep, and documenting new components in `docs/knowledge/wiki/custom-component-inventory.md`).
- **Push is explicit per-action** (`explicit-push-authorization`): build, verify, show the diff, then **wait for
  the operator's "go"** before any push / merge / deploy. Gates must pass first; never force-push. (Overrides
  any older "standing authorization" wording.)
