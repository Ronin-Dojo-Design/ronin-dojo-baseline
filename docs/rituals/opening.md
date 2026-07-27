---
title: Opening Ritual
slug: opening
type: protocol
status: active
created: 2026-04-25
updated: 2026-07-27
last_agent: claude-session-0712
pairs_with:
  - docs/rituals/closing.md
  - docs/protocols/WORKFLOW_6.0.md
  - docs/protocols/SOT_Cookbook.md
  - docs/protocols/project-log.md
  - docs/runbooks/graphify-repo-memory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Opening ritual — bow in

Run this at the start of every session, before any code is touched. Load just enough context to
act, then commit to one task.

## Agent-agnostic

This ritual is the source of truth for any agent that opens a session (Claude, Copilot, Codex, …).
The trigger differs per environment (Claude Code: `/bow-in`; chat: the words "bow in"); the steps
are identical and binding. `last_agent` convention: `<agent>-session-NNNN` naming the LLM/runtime
that actually executed — record yours accurately, never rewrite history.

## Trigger

Any of: "Bow in" / starting a fresh session / opening a new chat / picking up after a break.

## Steps

### Before Step 0 — Fresh-worktree bootstrap (environment readiness)

> If this session runs in a **fresh git worktree** (a `../ronin-NNNN` created off `main`, not the
> canonical `/Users/brianscott/dev/black-belt-legacy`), it is **not set up**: no `node_modules`, no
> `apps/web/.env`, no generated Prisma client, and **`graphify` returns 0 nodes** (the graph lives in
> the canonical checkout). Every gate — `tsc`, `oxlint`, `bun test`, `next dev` — fails on module
> resolution until you bootstrap, and "graphify-first discovery" silently no-ops. **Do NOT read these
> as code errors or a broken repo — bootstrap first.** (This is the "built-not-pointed" failure from
> SESSION_0468 LR 0007: the bootstrap was always documented but never in the bow-in read-path.)
>
> **Detect:** if `apps/web/node_modules` is absent → bootstrap before any gate. Run **`/worktree-setup`**
> (it executes the sequence), or follow the canonical
> [`dev-environment.md` § Fresh worktree bootstrap](../runbooks/dev-environment/dev-environment.md#fresh-worktree-bootstrap).
> In short: `bun install` (its prisma `postinstall` needs a `DATABASE_URL` — copy the canonical
> `apps/web/.env` first, or export a throwaway one) → `bunx prisma generate --no-hints`.
>
> **Graphify caveat:** an empty `graphify stats`/`query` in a worktree means "graph not built here," NOT
> "no matches" — never assert a negative from it.
>
> **PATH note:** the sandbox shell has no `curl` / `psql` / `tr` / `timeout` — use `bun` (built-in
> `fetch`) for HTTP smoke-checks and `bun -e` / scripts for DB pokes.

### Before Step 0b — Canonical-occupancy guard (parallel-session safety, FS-0035)

> **Two interactive sessions must never share the canonical checkout.** A second orchestrator that
> initializes in canonical while a first session has uncommitted work there strands/clobbers it
> (FS-0034 @ SESSION_0593, recurred @ 0610/0611). This is the *enforced* gate the old prose-only rule lacked.
>
> Once you know (or have minted) your session number **NNNN**, run this before touching anything:
>
> ```bash
> bash scripts/canonical-claim.sh check --session NNNN
> bash scripts/githooks/doctor.sh        # ADR 0053 — prove the push guards are live BEFORE you work
> ```
>
> `doctor.sh` is here, not at bow-out, on purpose: it verifies `core.hooksPath` is absolute, that the
> `pre-push` hook is present and carries RULE B, and that the server ruleset `main-pr-only` is active. Run it
> **from whatever worktree you are actually in** — FS-0040 was a hook that was installed, looked correct, and
> ran in no worktree at all. Non-zero exit prints the one command that fixes it.
>
> - **✅ free →** `bash scripts/canonical-claim.sh claim --session NNNN`, then work in canonical as normal.
> - **⛔ OCCUPIED (exit 3) →** another live session owns canonical. **Do NOT work here.** Bootstrap your own
>   worktree and run the ENTIRE session there — dispatch, merge-sweep into your branch, then **push your
>   branch and land it with a PR** (ADR 0053 — `main` is PR-only; the old "ff-to-main behind the merge lock"
>   move is exactly the `HEAD:main` push that is now blocked, server-side and by the pre-push hook):
>   `git worktree add ../ronin-NNNN -b session-NNNN-<lane> main`, then `/worktree-setup`.
>   Canonical (and `preview_start`, which is canonical-locked) stays the other session's; run your own
>   `next dev` on an alt port via Bash if you need a live check.
>
> **Never `git add -A` in canonical** — a sibling lane's untracked files live in the shared tree; stage explicit
> paths. Bow-out runs `release` (closing.md §4). Refs: FS-0035, FS-0034, LR 0018.

### 0. BBL / launch work — read the SoT set FIRST (and nothing else first)

> For any Black Belt Legacy or launch work, the **source-of-truth set is the only thing to open first**,
> in this order — do **not** go hunting the wider wiki:
>
> 1. [`BBL-SOT-Spec.md`](../product/black-belt-legacy/BBL-SOT-Spec.md) — the build blueprint.
> 2. [`SOT-ADR.md`](../product/black-belt-legacy/SOT-ADR.md) — consolidated decisions D1–D7 (**supersedes** the scattered ADRs).
> 3. [`PRD.md`](../product/black-belt-legacy/PRD.md) · 4. [`STORIES.md`](../product/black-belt-legacy/STORIES.md) · 5. [`CUTOVER_CHECKLIST.md`](../product/black-belt-legacy/CUTOVER_CHECKLIST.md) · 6. [`GAP_MATRIX.md`](../product/black-belt-legacy/GAP_MATRIX.md) (**re-verify against the live app — known stale**).
>
> If any other doc contradicts the SoT set, **the SoT set + the live app win.** The steps below still run.

### 1. Read the latest SESSION file

Find the highest-numbered file in `docs/sprints/`. That's the previous session.

> **ADR 0049 — staged stubs + number minting.** If the highest-numbered file has
> `status: staged`, it is the pre-staged stub for **this** session: adopt it (flip `staged` →
> `in-progress`; skip the step-6 `cp`) and treat the next-highest closed file as the previous
> session. Mint/verify your number with `bun scripts/ledger-id-next.ts --prefix=SESSION` — it
> scans canonical sprints ∪ every worktree's sprints ∪ `session-*` branch refs. On a parallel
> lane, create `session-NNNN-<lane-slug>` at bow-in to claim the number. Gaps stay burned.

Read at minimum: the previous `Goal` (achieved?), `Open decisions / blockers` (any block today?),
and `Next session: Goal` + `First task` (likely your starting point).

### 1b. Scan the open ledgers — bundle 3–5 coherent items (inbound loop)

The ledgers ARE the backlog ([`loop-of-loops-ledger-driven-sessions.md`](../protocols/loop-of-loops-ledger-driven-sessions.md)).
Run the aggregators instead of hand-scanning eight files:

```bash
bun scripts/ledger-backlog.ts          # ranked open items across FS/D/WL/FI/MB/TFF/INC/RISK/TD
bun scripts/ledger-backlog.ts --ledger=WL   # one ledger · --top=N to cap · --json for tooling
( cd apps/web && bun scripts/board-backlog.ts --top=10 )  # the operator's PRIORITIZED board order
```

**Board wins over raw ledger rank** — `board-backlog` reads the operator's `/app/loop-board`
drag-to-prioritize order (SESSION_0476); fall back to ledger rank when the board is empty/unreachable
(in a fresh worktree with no DB it prints a clean one-liner and is safely skipped).

Then **bundle 3–5 items on ONE coherence axis** — by domain hub, by risk class, or by deploy unit —
so the session is one reviewable lane, not a grab-bag (fits one close's review + one PR, stays under
the ~120K "dumb zone"). **Precedence:** the operator's `/goal` and the prior `Next session` block win;
the ledger scan supplements, never overrides.

### 1c. Open PRs are a live backlog source — route to `/pr-fix-loop` (G-007)

`ledger-backlog.ts` also emits each open PR as a live backlog item (red-CI / changes-requested =
**P1**, draft / clean = **P2**, oldest-first). **If open PRs exist and the operator hasn't pinned a
different lane, the default lane is [`/pr-fix-loop`](../../.claude/skills/pr-fix-loop/SKILL.md)** —
one pass (review → score → fix mechanical blockers → verdict), pause-on-merge, bundled as the
session's coherent lane. Precedence unchanged: an operator `/goal` or the prior `Next session` block
still wins. See [`pr-review-score-fix-loop.md`](../protocols/pr-review-score-fix-loop.md).

### 1d. Parallel-lane assessment (additive, G-023)

Before committing to a single lane: **scan whether 2+ candidates from 1b/1c are genuinely disjoint**
(distinct file sets, independently reviewable — the [`fan-out-session-recipe.md`](../protocols/fan-out-session-recipe.md)
§1 test). If yes, route to [`recipes/epic-plan.md`](../protocols/recipes/epic-plan.md) instead of
picking one and queueing provably-parallel work. If not, proceed single-lane — this is a cheap check,
not a mandate. Note the assessment result in the SESSION file's Bow-in section.

### 2. Read WORKFLOW 6.0 + SOT_Cookbook

[`WORKFLOW_6.0.md`](../protocols/WORKFLOW_6.0.md) is the governing operating system (SESSION_0584
forward; supersedes 5.0 — its rituals-read is dead canon). Read the hard rules once if you haven't
recently; then use [`SOT_Cookbook.md`](../protocols/SOT_Cookbook.md)'s task→workflow router to pick
today's skill/loop. The [goals ledger](../knowledge/wiki/goals-ledger.md) + the step-1b aggregators
are the live backlog; each parallel lane gets its own `../ronin-NNNN` worktree
([`seq-lane-build`](../../.claude/skills/seq-lane-build/SKILL.md)). Dirstarter-alignment is a
build-time gate owned by [`cody-preflight.md`](../protocols/cody-preflight.md). Then skim
[`program-plan.md`](../architecture/program-plan.md) for broader context (partially superseded;
layered-architecture + brand-sequencing sections remain valid).

### 3. Routed discovery — ONE table (replaces the old steps 3/3b/3c/3d)

Don't bulk-read. Route by what today's task touches, reach for rows as the work surfaces a need:

| When today's task touches… | Read / run | Why |
| --- | --- | --- |
| Schema or data behavior | [`plan-vs-current.md`](../architecture/plan-vs-current.md) | spec-vs-impl reality check |
| An architectural choice | [`decisions/`](../architecture/decisions/) + `ls -t docs/architecture/decisions/ \| head` | a ratified decision may already exist |
| People, rank, schools, lineage | Identity canon: [`passport-and-shells`](../knowledge/wiki/concepts/passport-and-shells.md) · [`ronin-project-context`](../knowledge/wiki/ronin-project-context.md) · [lineage SOP](../product/black-belt-legacy/lineage-data-wiring-flow.md) · [`repo-truth-index`](../knowledge/wiki/repo-truth-index.md) (ADR 0025) | don't re-derive the identity model |
| DB / deploys / environment | [`docs/runbooks/`](../runbooks/) (start at the [domain hub](../runbooks/README.md)) | operational SoT |
| Any of the 10 L1 areas (storage, payments, media, content, monetization, blog, auth, theming, Prisma, hosting) | [`dirstarter-docs-inventory`](../knowledge/wiki/dirstarter-docs-inventory.md) **Alignment URLs** | extend, never bypass |
| An area with prior failures | [`failed-steps-log.md`](../protocols/failed-steps-log.md) `open`/`mitigated` rows + [`drift-register.md`](../knowledge/wiki/drift-register.md) | acknowledge the failure + confirm mitigation BEFORE proceeding |
| A lane a past session learned from | [Learning records](../learning/ddd/learning-records/README.md) + recent ADRs: `ls -t docs/learning/ddd/learning-records/ docs/architecture/decisions/ \| head` | the anti-rediscovery layer — skipping the record re-incurs the lesson ([LR 0007](../learning/ddd/learning-records/0007-the-discoverability-heuristic-and-built-not-pointed.md)) |
| A named domain/entity (ANY lane) | `graphify query "<lane nouns>" --budget 1500` (per [`graphify-repo-memory.md`](../runbooks/dev-environment/graphify-repo-memory.md)) | cheapest pull of captured knowledge — the graph indexes docs too (ledger rows, ADRs, LRs surface as nodes); skip only for a trivial single-file edit |
| Cross-area / search-heavy work (porting, security review, "search everything" lanes) | `graphify stats` + `graphify query "<terms>" --budget 2000` **before any repo-wide grep/rg/find** | open the exact files the graph names, verify by direct inspection; graph = navigation, not proof |
| A feature domain with a domain hub | The hub **first**, then the SOP/ADR it points to, then its route inventory: [Lineage hub](../runbooks/domain-features/lineage-hub.md) · [Directory/Org/Profile hub](../runbooks/domain-features/directory-org-profile-hub.md) | prevents re-discovering existing capability (SESSION_0356); no hub yet = build one as part of the work |
| Doc-only, full-text lookup | `bun run docs:nav` → `docs/index.html`, or the [runbooks hub](../runbooks/README.md) | the navigator answers "what *docs* exist about X"; Graphify answers "what *code* relates to X" |

**Never assert a capability is missing from an errored/empty search** — confirm against the hub +
route inventory first. Record any graph query that changed what you opened in the SESSION file.

### 4. Identify ONE task for this session

State the task explicitly: what is it, why now (one sentence), and what does "done" look like?

**Classify, then dispatch — don't role-play the roster.** Do a **named read** of
[`SOT_Cookbook.md`](../protocols/SOT_Cookbook.md)'s **task → workflow router** and the
**allowed-vs-never table** (§4) in [`agent-systems-map`](../knowledge/wiki/agent-systems-map.md),
classify the task, then **dispatch the matched flow as real sub-agents** (`Agent` tool
`subagent_type`; roster in `.claude/agents/*.md`):

- **Unclear / multi-part / open decisions →** [`/pp`](../../.claude/skills/pp/SKILL.md) (plan only) or
  [`/ppp`](../../.claude/skills/ppp/SKILL.md) (plan + paste-ready baton) — grill the open forks first —
  then dispatch `cody` (build) → [`/ggr`](../../.claude/skills/ggr/SKILL.md) (the QAR gate).
- **Clear build →** dispatch [`cody`](../agents/cody.md) — **Cody completes the
  [pre-flight protocol](../protocols/cody-preflight.md), including its §0 arch-gate, before writing
  any code** — then [`doug`](../agents/doug.md) to verify the diff.
- **Other lanes** (bug → `/diagnose`, review → `/code-review`, cleanup → `/fallow-fix-loop`, new
  client → `/new-client-recipe`, …) → run the router's matched skill/loop.

Reserve fan-out for genuinely-disjoint work; a one-file change is a single inline Cody. **Dispatch
builds and verifies — it never pushes/merges/deploys**; hold at the push gate for the operator's
explicit word (explicit-push-authorization).

### 4b. Number tasks in the SESSION file

Every planned task gets a stable ID (`SESSION_NNNN_TASK_01`, `_02`, …) in the SESSION file's
`## Petey plan` + task-log sections before implementation starts. The SESSION file is the canonical
audit ledger (project-log retired at SESSION_0228; archive at [`docs/_archive/project-log/`](../_archive/project-log/)).

### 5. Branch check

`git branch --show-current` + `git status --short`. On `main` and expected → proceed. Uncommitted
changes from a previous session → raise them before new work. Stale feature branch → discuss
merge/rebase/abandon with the user first.

### 6. Create the new SESSION file

Copy the template — do NOT generate from scratch:

```bash
cp docs/sprints/_template/SESSION_TEMPLATE.md docs/sprints/SESSION_NNNN.md
```

Fill every `<placeholder>`, delete the HTML comments, set `Date`/`Operator`/`Goal`, frontmatter
`status: in-progress`. `type` defaults to `session--open`; narrow at bow-out to `session--plan` /
`session--implement` / `session--review` if the session was clearly one mode (legacy `session` is
pre-0139 only). **ADR 0049:** if bow-in found a `status: staged` stub (step 1), this step is just
the flip `staged` → `in-progress` — no `cp`. Either way fill the lane facet keys: `lane`
(`repo | rdd | mmb | bbl | bma | usa`), optional `lane_seq` / `vault_session` / `goal_ids` /
`tickets`. Frontmatter is the cross-ref source of truth.

If you skip this step, you've also skipped the bow-out — the closing ritual depends on this file.

### 6b. Petey's three bow-in questions + the State-of-Dojo ask (MANDATORY — ask before Begin work)

Before step 7, **ask the operator these via `AskUserQuestion`** — a hard step, not optional prose. Petey may
answer ①–③ from the context already loaded, but the ask is what surfaces a course-correction and forces the
SotD decision to be the operator's:

0. **Was the previous session's goal accomplished?** — state the verdict (YES / NO / EXTENDED + one
   line) from its record/`## Goal verdict`; an unmet goal is today's first lane candidate
   (operator ask, SESSION_0712).
1. **What are we doing?** — the elected lane for this session (one sentence).
2. **What's queued?** — the ledger/board backlog (step 1b) + the prior `Next session` block.
3. **Are we pivoting?** — is the elected lane still right, or has the operator changed direction?

**Plus the State-of-Dojo publish ask:** cite the live, zero-token route **`/app/state`** (see the section
below for why) and ask **"want a frozen State-of-Dojo snapshot published?"** Only on a *yes* do you publish an
Artifact (`/preview-artifacts`) and paste the URL into the SESSION `## Artifacts` section.

> **Why this is a numbered step and also in the skill body:** it lived *only* as the trailing "State-of-Dojo
> at bow-in" section (after step 7) and was skipped the very next session after it was added — prose the
> executed read-path never reaches does not fire (FS-0037, the sibling of FS-0035/0036's "enforced-but-broken"
> / LR 0007 "built-not-pointed"). The `/bow-in` skill body carries the same ask so it can't be missed.

### 7. Begin work

The opening ritual is done. If anything in the previous SESSION file or the program plan looks stale
or contradictory, raise it before starting — two minutes confirming beats two hours building against
the wrong understanding.

## State-of-Dojo at bow-in — cite the live route; publish only on ask

**The zero-token default (SESSION_0617, [`research-review-state-of-dojo-automation`](../architecture/research/research-review-state-of-dojo-automation.md)).**
The always-current State-of-Dojo lives at the deployed route **`/app/state`** (`StatePanel`
self-fetches `main`, ~5-min cache) — the operator sees the landscape for **0 agent tokens**. Do not
agent-publish an Artifact every session; the render is deterministic (`bun scripts/state-of-project.ts`
in the bow-out gate runner), and **the publish ask is owned by step 6b**. Projection-only — reads
`docs/sprints/*` + `goals-ledger.md`, never writes a ledger
([`state-of-project-projection.md`](../protocols/state-of-project-projection.md)).

## What this ritual is NOT

- Not a context dump — you're not loading every file in the repo.
- Not a meta-philosophical exercise — operator-side memory holds the philosophy.
- Not a checklist for the user — "are we ready to work" is a fine substitute for steps 1–3 if they trust the operator.

## Cross-references

- [Closing ritual](closing.md) — pairs with this; ends the session.
- [WORKFLOW 6.0](../protocols/WORKFLOW_6.0.md) — governing operating system (supersedes 5.0).
- [SOT_Cookbook](../protocols/SOT_Cookbook.md) — the task→workflow router.
- [SESSION_TEMPLATE](../sprints/_template/SESSION_TEMPLATE.md) — the SESSION file format (absorbed `chat-handoff.md`).
- [Next Session Loading Order](../protocols/next-session-loading-order.md) — tier-1/2/3 load order at bow-in.
- [Cody Pre-flight Protocol](../protocols/cody-preflight.md) — enforceable checklist (+ §0 arch-gate) before writing code.
- [FAILED_STEPS Log](../protocols/failed-steps-log.md) — append-only SOP-violation record.
- [Petey Plan protocol](../protocols/petey-plan.md) — structured planning for unclear/multi-part tasks.
- [Repo Truth Index](../knowledge/wiki/repo-truth-index.md) — authoritative source map.
- [Petey](../agents/petey.md), [Cody](../agents/cody.md) — the roles you'll play next.
