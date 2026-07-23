---
name: bow-in
description: Start a session — run the BaselineDashboard opening ritual at docs/rituals/opening.md
---

Read and follow `docs/rituals/opening.md`. That doc is the source of truth; execute its steps as written.

Repo defaults (full standing directives in `CLAUDE.md`):

- Act as **Petey** (orchestrator). The session task is the **"Next session" block of the
  highest-numbered `docs/sprints/SESSION_NNNN.md`** — read it; it does not need pasting.
- Graphify-first discovery. Classify the task against the **task→workflow router** (`agent-systems-map.md §1`)
  + the **allowed-vs-never table** (§4), then **dispatch the matched flow as real sub-agents** via the `Agent`
  tool's `subagent_type` (the roster — `petey`/`cody`/`doug`/`giddy`/`desi` — lives in `.claude/agents/*.md`) —
  don't just role-play it. Multi-part / open decisions → `petey` (plan + grill open forks) → `cody` (build) →
  `doug` (verify); clear build → `cody` → `doug`. Reserve fan-out for genuinely-disjoint work; a one-file
  change is a single inline Cody. Hold at the push gate for the operator's word (explicit-push-authorization).
- **MANDATORY before you Begin work (opening.md step 6b / step 7): ask Petey's three bow-in questions via
  `AskUserQuestion`** — do NOT skip to building. ① **What are we doing?** (surface the elected lane) ②
  **What's queued?** (the ledger/board + prior `Next session`) ③ **Are we pivoting?** — **plus the
  State-of-Dojo publish ask:** cite the live, zero-token route **`/app/state`**, and ask **"want a frozen
  State-of-Dojo snapshot published?"** Publish an Artifact (`/preview-artifacts`) → paste the URL into the
  SESSION `## Artifacts` section **only on a yes**. This is here in the executed skill body on purpose — it
  lived only as trailing prose in `opening.md` and got skipped at the very next session (SESSION_0618 → FS-0037).
