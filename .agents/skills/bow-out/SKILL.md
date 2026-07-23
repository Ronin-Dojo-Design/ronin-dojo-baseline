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
- Run the **full** close — the optional deep items (Reflections, evidence table, ADR check, memory sweep, and
  documenting new components in `docs/knowledge/wiki/custom-component-inventory.md`).
- **MANDATORY: run `/ggr` (the QAR gate) as the close review** (this IS `closing.md` §6.5 — do NOT also run a
  separate hostile-close; `/ggr` wraps it, one review not two). Enforces ADR 0052 policy: **≥9.0 clears ·
  7.0–8.9 auto-loops ≤2 Giddy passes then the operator gate · hard-caps always loop.** **Record the composite
  in the SESSION `## Review log` before the push gate.** In the skill body on purpose so it fires — not left to
  `closing.md` prose (FS-0037 pattern; `bow-out-gates` Gate 12d detects a missing score on a code session).
- **Push is explicit per-action** (`explicit-push-authorization`): build, verify, show the diff, then **wait for
  the operator's "go"** before any push / merge / deploy. Gates must pass first; never force-push. (Overrides
  any older "standing authorization" wording.)
- **MANDATORY at close: ask Petey's three bow-out questions via `AskUserQuestion`** (symmetric to bow-in; do
  NOT skip straight to committing): ① **Did we hit the goal / what landed?** ② **What's the next lane?** (stage
  the ADR 0049 stub) ③ **Publish a frozen State-of-Dojo snapshot + push?** — cite the live `/app/state`
  (zero-token); on a *yes* to (3) publish an Artifact (`/preview-artifacts`) and paste the URL into `##
  Artifacts`. This is in the executed skill body on purpose (closing.md §6d prose alone got skipped — FS-0037).
