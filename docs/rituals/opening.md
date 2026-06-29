---
title: Opening Ritual
slug: opening
type: protocol
status: active
created: 2026-04-25
updated: 2026-06-27
last_agent: claude-session-0453
pairs_with:
  - docs/rituals/closing.md
  - docs/protocols/project-log.md
  - docs/runbooks/graphify-repo-memory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Opening ritual — bow in

Run this at the start of every session, before any code is touched.

> v5.0 refresh of the legacy `opening_v4.5.md`. Heavy machinery (JETTY metadata, multi-tier auto-load packs, session-numbered handoff packets) has been dropped. What remains is the operational core: load just enough context to act, then commit to one task.

## Agent-agnostic

This ritual is the source of truth for any agent that opens a session: Claude, Copilot, Codex, or otherwise. The ritual itself never depends on a specific LLM, IDE, or CLI. The trigger may differ per environment (Claude Code: `/bow-in` skill; Copilot/Codex chat: the words "bow in"; CLI script: a make target), but the steps below are identical and binding.

Convention for the `last_agent` SESSION-file field is `<agent>-session-NNNN` where `<agent>` names the LLM/runtime that ran the session (e.g., `claude-session-0031`, `copilot-session-0028`, `codex-session-0030`). Past sessions in this repo use whichever agent actually executed; do not rewrite history, only record yours accurately on the new SESSION file.

## Trigger

Any of: "Bow in" / starting a fresh session / opening a new chat / picking up after a break.

## Steps

### 0. BBL / launch work — read the SoT set FIRST (and nothing else first)

> For any Black Belt Legacy or launch work, the **source-of-truth set is the only thing to open first**,
> in this order — do **not** go hunting the wider wiki (that re-discovery loop is the problem this set fixes):
>
> 1. [`BBL-SOT-Spec.md`](../product/black-belt-legacy/BBL-SOT-Spec.md) — the build blueprint: phases 0–7, exact files, done-means, session roadmap.
> 2. [`SOT-ADR.md`](../product/black-belt-legacy/SOT-ADR.md) — consolidated decisions D1–D7 (**supersedes** the scattered ADRs; those are historical).
> 3. [`PRD.md`](../product/black-belt-legacy/PRD.md) · 4. [`STORIES.md`](../product/black-belt-legacy/STORIES.md) · 5. [`CUTOVER_CHECKLIST.md`](../product/black-belt-legacy/CUTOVER_CHECKLIST.md) · 6. [`GAP_MATRIX.md`](../product/black-belt-legacy/GAP_MATRIX.md) (**re-verify against the live app — known stale**).
>
> If any other doc contradicts the SoT set, **the SoT set + the live app win.** The steps below still run
> (latest SESSION file, branch check, new SESSION file), but the SoT set is your task context.

### 1. Read the latest SESSION file

Find the highest-numbered file in `docs/sprints/`. That's the previous session.

Read at minimum:

- The previous session's `Goal` (was it achieved?)
- `Open decisions / blockers` (any block today?)
- `Next session: Goal` and `First task` (likely your starting point)

### 1b. Scan the open ledgers — bundle 3–5 coherent items (inbound loop)

The ledgers ARE the backlog. After reading the prior SESSION's `Next session` block, pull the open
ledger items and bundle **3–5 coherent ones** into this session's Petey plan — per
[`loop-of-loops-ledger-driven-sessions.md`](../protocols/loop-of-loops-ledger-driven-sessions.md).

Run the aggregator instead of hand-scanning eight files:

```bash
bun scripts/ledger-backlog.ts          # ranked open items across FS/D/WL/FI/MB/TFF/INC/RISK/TD
bun scripts/ledger-backlog.ts --ledger=WL   # one ledger · --top=N to cap · --json for tooling
```

Then **bundle on one coherence axis** so the session is one reviewable lane, not a grab-bag:

- **By domain hub** — all lineage, or all directory/org items (reuse one mental model + one hub read).
- **By risk class** — all authz/public-surface (one PR, one security pass), or all docs-only (one free push).
- **By deploy unit** — all `apps/web` app-code (one CI matrix), or all governance/docs (no deploy).

Why **3–5**: one coherent lane fits one close's review + one PR, and stays under the ~120K "dumb zone".
Fewer = under-utilized; more = the close can't honestly verify them all.

**Precedence:** the operator's `/goal` and the prior `Next session` block win. The ledger scan
*supplements* them (fills the session, surfaces what's overdue) — it does not override an operator
directive. The symmetric bow-out **cross-off sweep** (closing.md) flips resolved rows to done.

### 1c. Open PRs are a live backlog source — route to `/pr-fix-loop` (G-007)

The aggregator's `PR` rows are **live state**, not a markdown ledger: `scripts/ledger-backlog.ts` queries
`gh pr list --state open` and emits each open PR as a backlog item (red-CI / changes-requested = **P1**,
draft / clean = **P2**, then oldest-first). So the bow-in scan already surfaces open PRs alongside ledger
debt (and `/app/loop-board` projects them when a GitHub token is configured).

**If open PRs exist and the operator hasn't pinned a different lane, the default lane is `/pr-fix-loop`** —
keep the open-PR queue merge-ready before opening new build work. Run one pass (review → score → fix the
mechanical blockers on each PR branch → verdict), pause-on-merge. Bundle the PRs as the session's coherent
lane (one risk class: "open PRs"). This is the outbound half of the Loop-of-Loops: inbound ledger debt and
outbound open-PR review become one auto-surfaced backlog. See the [`pr-fix-loop`](../../.claude/skills/pr-fix-loop/SKILL.md)
skill (worktree fan-out) and [`pr-review-score-fix-loop.md`](../protocols/pr-review-score-fix-loop.md).

Precedence is unchanged: an operator `/goal` or the prior `Next session` block still wins; PR-pickup is the
default *only when nothing else is pinned*.

### 2. Read WORKFLOW 5.0 + program plan

[`docs/protocols/WORKFLOW_5.0.md`](../protocols/WORKFLOW_5.0.md) is the governing operating system for SESSION_0021 forward. Read:
- The **session calendar** — find today's session row, confirm the primary lane and main outcome.
- The **worktree map** — confirm which worktree this session operates in.
- The **Dirstarter alignment table** — you must fill this during bow-in.

Then skim [`docs/architecture/program-plan.md`](../architecture/program-plan.md) for broader context (partially superseded by WORKFLOW 5.0 but layered architecture and brand sequencing sections remain valid).

### 3. Skim relevant cross-references on demand

Only the ones that bear on today's task:

- [`docs/architecture/plan-vs-current.md`](../architecture/plan-vs-current.md) — if the task touches schema or data behavior.
- [`docs/architecture/decisions/`](../architecture/decisions/) — if the task touches an architectural choice.
- **Identity canon** — if the task touches people, rank, schools, or lineage, read these *before* re-deriving the model: [`passport-and-shells`](../knowledge/wiki/concepts/passport-and-shells.md) (Passport = identity SoT), [`ronin-project-context`](../knowledge/wiki/ronin-project-context.md), the [lineage SOP](../runbooks/sops/lineage-data-wiring-flow.md), and the [repo-truth-index canonical-entity layer](../knowledge/wiki/repo-truth-index.md) (entity → source-of-truth table). Ratified in [ADR 0025](../architecture/decisions/0025-passport-identity-source-of-truth.md).
- [`docs/runbooks/`](../runbooks/) — if the task involves the database, deploys, or environment.
- [`docs/knowledge/wiki/dirstarter-docs-inventory.md`](../knowledge/wiki/dirstarter-docs-inventory.md) — **Alignment URLs section.** If the task touches any of the 10 L1 areas (storage, payments, media, content, monetization, blog, auth, theming, Prisma, hosting), check alignment before proceeding.

Don't bulk-read. Reach for these as the work surfaces a need.

### 3b. Check FAILED_STEPS log + Drift Register

Read [`docs/protocols/failed-steps-log.md`](../protocols/failed-steps-log.md). Check for any `open` or `mitigated` entries in the area you're about to work in. If found, acknowledge the prior failure and confirm the mitigation is in place before proceeding.

Also skim [`docs/knowledge/wiki/drift-register.md`](../knowledge/wiki/drift-register.md) for open drift entries relevant to today's lane. If a drift item directly affects the task, note it in the SESSION file.

### 3c. Graphify-first discovery for search-heavy lanes

Use [`docs/runbooks/graphify-repo-memory.md`](../runbooks/dev-environment/graphify-repo-memory.md) when today's task is likely to cross multiple repo areas: component porting, Dirstarter updates, auth/payment/security review, hostile repo review, old-monorepo mapping, or any lane where the agent would otherwise "search everything."

For those lanes, run Graphify before any repo-wide text search:

```bash
graphify stats
graphify query "<lane nouns and domain terms>" --budget 2000
```

Then open the exact files Graphify identifies and verify them by direct source/doc inspection. Do not use repo-wide `grep`, `rg`, or `find` for task planning before the graph query. If a path is already known, open that exact file directly.

**Doc discovery aids (optional, not gates):** when a task touches an operational area, start from the [runbooks domain hub](../runbooks/README.md) and jump to the relevant module instead of guessing filenames. For doc-only, full-text lookup, regenerate and search the navigator: `bun run docs:nav` then open `docs/index.html`. Division of labor — Graphify answers "what *code* relates to X"; the navigator answers "what *docs* exist about X."

Record the query and selected files in the SESSION file if Graphify changes what you open. Skip this for small, obvious, single-file tasks. Graphify is a navigation aid, not proof.

### 3d. Domain-hub-first for feature lanes (read before grilling/planning)

When today's task touches a **feature domain that has a domain hub**, read it **before** you grill or plan — in this order: **domain hub → the SOP/ADR it points to → the route inventory** in the hub. The hub is a surface-index that prevents re-discovering capability that already exists (the SESSION_0356 "are we querying in the right workflow timeline?" fix; FINDING_02). Querying Graphify by a narrow task noun *after* you know the surface beats guessing the surface from the noun.

Current domain hubs (`docs/runbooks/domain-features/`):

- [Lineage Domain Hub](../runbooks/domain-features/lineage-hub.md) — promotion provenance, trees, canvas, claim.
- [Directory / Organization / Profile Domain Hub](../runbooks/domain-features/directory-org-profile-hub.md) — discovery, org/school/person profiles, the register vs claim funnels.

If the lane touches a domain with **no** hub yet, that is a signal to build one as part of the work (mirror an existing hub). **Never assert a capability is missing from an errored/empty search** — confirm against the hub + route inventory first.

### 4. Identify ONE task for this session

State the task in chat (or in your notes) before you start. Be explicit:

- What is the task?
- Why this task now? (one sentence connecting to program plan or user request)
- What does "done" look like?

If the task is unclear, multi-part, or has unresolved decisions: invoke [Petey](../agents/petey.md) to plan first, using the [Petey Plan protocol](../protocols/petey-plan.md).

If the task is clear: invoke [Cody](../agents/cody.md) (or yourself) to execute. **Cody must complete the [pre-flight protocol](../protocols/cody-preflight.md) before writing any code.**

### 4b. Number tasks in the SESSION file

For every task in the session plan, add or update an entry in the current SESSION file's `## Petey plan` and `## Task log` sections before implementation starts.

Use stable IDs:

```text
SESSION_NNNN_TASK_01
SESSION_NNNN_TASK_02
SESSION_NNNN_TASK_03
```

The SESSION file is now the canonical audit ledger that lets Giddy/Doug verify ownership, done criteria, status, and review coverage. The legacy cross-session `project-log.md` ledger was retired at SESSION_0228; the historical archive lives at [`docs/_archive/project-log/`](../_archive/project-log/) and is read-only.

### 5. Branch check

Verify the current git branch (`git branch --show-current`) and working tree status (`git status --short`).

- If on `main` and that's expected: proceed.
- If uncommitted changes from a previous session exist: raise them before starting new work.
- If on a stale feature branch: discuss with the user whether to merge/rebase/abandon before starting.

### 6. Create the new SESSION file

Copy the template — do NOT generate from scratch:

```bash
cp docs/sprints/_template/SESSION_TEMPLATE.md docs/sprints/SESSION_NNNN.md
```

Then fill in every `<placeholder>` and delete the HTML comment blocks. The template is the source of truth for section order, frontmatter shape, and lint compliance. See [`docs/sprints/_template/SESSION_TEMPLATE.md`](../sprints/_template/SESSION_TEMPLATE.md).

**Session type values (SESSION_0139+):**

| Type | When to use |
| --- | --- |
| `session--open` | **Default at bow-in.** Use when the session scope isn't clear yet, or when it ends up being a mix of planning, implementation, and review. Stays as-is at bow-out if the session was mixed. |
| `session--plan` | Petey-led planning, gap analysis, task staging — no code written. Set at bow-out if the session was purely planning. |
| `session--implement` | Cody-led code execution against an existing plan. Set at bow-out. |
| `session--review` | Doug/Giddy-led QA, hostile review, test-only sessions. Set at bow-out. |
| `session` | Legacy (pre-0139). Do not use for new sessions. |

Refine `type` at bow-out: if the session was clearly one mode, narrow it. If it was mixed, leave it `session--open`. No backfill needed — old sessions stay `type: session`.

Then fill in `Date`, `Operator`, `Goal`. Set frontmatter `status: in-progress`. The rest gets filled during/at end of session.

If you skip this step, you've also skipped the bow-out — the closing ritual depends on this file already existing.

### 7. Begin work

The opening ritual is done. From here forward, you are operating as Petey or Cody (or both, sequentially) for the duration of the session.

## Optional: brief alignment check

If anything in the previous SESSION file or the program plan looks stale or contradictory, raise it before starting work. Better to spend two minutes confirming than two hours building against the wrong understanding.

## What this ritual is NOT

- Not a context dump. You're not loading every file in the repo.
- Not a meta-philosophical exercise. Operator-side memory holds the philosophy; this ritual is just operational.
- Not a checklist for the user. The user can ask "are we ready to work" — that's a fine substitute for steps 1–3 if they trust the operator.

## Cross-references

- [Closing ritual](closing.md) — pairs with this; ends the session.
- [WORKFLOW 5.0](../protocols/WORKFLOW_5.0.md) — governing operating system for SESSION_0021+; session calendar, lane model, worktree map.
- [Chat handoff protocol](../protocols/chat-handoff.md) — describes the SESSION file format.
- [Next Session Loading Order](../protocols/next-session-loading-order.md) — explicit tier-1/2/3 file load order at bow-in.
- [Cody Pre-flight Protocol](../protocols/cody-preflight.md) — enforceable checklist before writing any new component.
- [FAILED_STEPS Log](../protocols/failed-steps-log.md) — append-only record of SOP violations and corrective actions.
- [Graphify Repo Memory Runbook](../runbooks/dev-environment/graphify-repo-memory.md) — optional graph check for search-heavy lanes.
- [Petey Plan protocol](../protocols/petey-plan.md) — structured planning when the task is unclear or multi-part.
- [Repo Truth Index](../knowledge/wiki/repo-truth-index.md) — authoritative source map; consult when you're unsure which file to trust.
- [Petey](../agents/petey.md), [Cody](../agents/cody.md) — the roles you'll play next.
