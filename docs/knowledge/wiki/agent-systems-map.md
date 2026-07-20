---
title: "Agent Systems Map — the 5 pillars of how this repo runs agents"
slug: agent-systems-map
type: concept
status: active
created: 2026-06-29
updated: 2026-07-20
last_agent: claude-session-0584
pairs_with:
  - docs/protocols/WORKFLOW_6.0.md
  - docs/protocols/SOT_Cookbook.md
  - docs/rituals/opening.md
  - docs/rituals/closing.md
  - docs/agents/README.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - orchestration
  - agent-systems
  - repo-memory
  - discoverability
---

# Agent Systems Map — the 5 pillars

> **Why this exists (SESSION_0468).** The repo had built strong versions of every modern agent-reliability
> pattern, but they were scattered across rituals, protocols, agents, and ledgers — *built, not pointed.*
> This map is the one-glance conceptual index: each pillar → **our** concrete implementation (linked) → and,
> where we had the pieces but no single artifact, the **gap we filled here.** It is the conceptual companion
> to the exhaustive [`orchestration-hub`](../../runbooks/dev-environment/orchestration-hub.md) file-tree and to
> [WORKFLOW 6.0](../../protocols/WORKFLOW_6.0.md) (the governing OS; supersedes 5.0 as of SESSION_0584/G-023).
> Five pillars; nothing new invented, two gaps closed (the §1 router table has since **moved** to
> [`SOT_Cookbook.md`](../../protocols/SOT_Cookbook.md) — see §1 below).
>
> **How/when this is read (don't bulk-read it every session).** It's a *reference*, not hot-path context.
> Two triggers wire it into the read-path: the [opening ritual](../../rituals/opening.md) **step 4** points at
> [`SOT_Cookbook.md`](../../protocols/SOT_Cookbook.md)'s **task→workflow router** when you pick a skill/loop, and
> `CLAUDE.md`'s "How sessions run" flags the map for awareness + the §4 **allowed-vs-never** table. Consult a
> single pillar/table on demand — reading the whole map each session would violate the **context-discipline**
> pillar it describes. (Deliberately **not** wired into the SESSION template: that's a per-session work-ledger,
> not a guidance surface.)

| Pillar | One-line | Our maturity |
| --- | --- | --- |
| 1. Skill routing | route a task to the right workflow, don't just prompt harder | strong (router table lives at [`SOT_Cookbook.md`](../../protocols/SOT_Cookbook.md)) |
| 2. Context discipline | split work into focused agent contexts; bigger ≠ better | strong (the roster) |
| 3. Work ledgers | a persistent record so the next session continues, not restarts | **over-delivered** |
| 4. Trust boundaries | the question isn't "what *can* it do" — it's "what must it *never* do" | guards existed; **never-do table added below** |
| 5. Verification loops | most failures happen *after* code; verification creates reliability | strong (Doug + the gates) |

---

## 1. Skill routing — "teach the agent which workflow to run"

**Concept (image):** a new task is classified, then routed to the matching skill/workflow.

**Ours:** routing is real but lives across the rituals — [`opening.md`](../../rituals/opening.md) routes the
*lane* (BBL → the SoT set; domain-hub-first §3d; Graphify-first §3c; ledger-backlog → bundle 3–5 §1b; open PRs
→ `/pr-fix-loop` §1c), and [`closing.md`](../../rituals/closing.md) §6.7 is the **finding-router** (each
finding type → its canonical ledger). Plus ~35 skills and the [domain hubs](../../runbooks/domain-features/).

**The task → workflow router moved (G-023, SESSION_0584):** the one-screen table lived here as a
"gap filled" note; it now lives at [`SOT_Cookbook.md`](../../protocols/SOT_Cookbook.md) — the
canonical, actively-maintained router (recipe cards + sequence skills folded in as new rows). Read
that file for the live table; this section stays the *concept* anchor.

## 2. Context discipline — "each agent only sees what it needs"

**Concept (image):** Planner → Researcher → Writer → Reviewer, each with its own focused context window; a
bigger window isn't always better.

**Ours — the roster is exactly this** ([`agents/README`](../../agents/README.md)):

| Their role | Ours | In-context (what it should hold) |
| --- | --- | --- |
| Planner | [Petey](../../agents/petey.md) | the goal, open decisions, the ledger backlog, the plan |
| Researcher/Writer | [Cody](../../agents/cody.md) | the plan, cody-preflight scan, the L1 inventory, the touched files |
| Reviewer | [Doug](../../agents/doug.md) | the diff, the Verification contract, the evidence |
| (adversarial) | [Giddy](../../agents/giddy.md) | the whole-session/whole-repo lens (hostile close + repo review) |
| (design) | [Desi](../../agents/desi.md) | the brand surfaces, the card contract, the L1 primitives |
| (brand/rollout) | [Brandon](../../agents/brandon.md) | confirmed product truth, PRD/STORIES, public copy, message hierarchy |

Reinforced by `CLAUDE.md`'s sub-agent fan-out rule (parallelize only genuinely-disjoint work) and the
operator's **"fresh chat past the ~120K dumb zone"** discipline — bigger context ≠ better.

## 3. Work ledgers — "agents forget, ledgers don't"

**Concept (image):** a persistent Completed/Active/Blocked record of decisions, evidence, boundaries.

**Ours — the most-developed pillar.** Nine governance ledgers (FS / D / WL / FI / MB / TFF / INC / RISK / TD)
plus the [goals ledger](goals-ledger.md), aggregated by `scripts/ledger-backlog.ts` and projected onto the
**DB-backed `KanbanCard`** [loop-board](files/loop-board.md) (`/app/loop-board`, the literal
Completed/Active/Blocked board). The per-session [`SESSION_NNNN.md`](../../sprints/_template/SESSION_TEMPLATE.md)
is the canonical record (the cross-session `project-log` was retired); the
[loop-of-loops](../../protocols/loop-of-loops-ledger-driven-sessions.md) makes the ledgers *the* backlog that
`/bow-in` bundles. **SESSION_0476 closed the DB board's loop** (it was a write-only projection before): bow-in
reads its operator-set order (`apps/web/scripts/board-backlog.ts`) and bow-out marks resolved cards done
(`apps/web/scripts/board-mark-done.ts`), so drag-to-prioritize now drives session candidate order. This is
"ledgers don't forget" as built infrastructure.

## 4. Trust boundaries — "what should the agent *never* be allowed to do?"

**Concept (image):** a wall between the agent environment and production; allowed actions vs blocked actions.

**Ours:** the pieces are everywhere — the **FS-0024 git guard** + host shell-guards (block `git`/`gh`/`bun`/
`vercel` from the read-only template cwd), [explicit-push-authorization](../../protocols/recipes/merge-wave.md),
[`code-guardrails`](../../protocols/code-guardrails.md) G1–G9, the
[manual-boundary registry](manual-boundary-registry.md), the
[security risk register](../../security/ronin-security-risk-register.md) — but no single allowed-vs-never view.

**Gap filled — the agent allowed-vs-never table:**

| ✅ Allowed (the agent does this) | 🚫 Never without the operator's explicit word |
| --- | --- |
| Read, query, search, explore the repo | **Push / merge / deploy** (per-action authorization) |
| Plan, propose, design | **Force-push**; rewrite shared history |
| Build on a branch; stage + commit (conventional msg) | **Delete SESSION history** (append-only) |
| Run the gates (typecheck / lint / tests / wiki-lint) | Run an unshown codemod (show it first; node/TS, never Python) |
| Mutate git **only** from the `ronin-dojo-app` cwd | Mutate from the read-only template cwd (guard blocks it) |
| Rehearse prod flows off-prod (Stripe test-mode) | Touch **prod data** unrehearsed (Baseline prod is `sk_live`) |
| Overwrite a file you created/read | Overwrite/delete something that contradicts how it was described — surface it first |

> The senior framing the image gets right: design the **never-do** list first. Ours is enforced (shell-guards
> + hooks), not just documented — see `CLAUDE.md` and [[explicit-push-authorization]] / [[operator-script-caution]].

## 5. Verification loops — "reliability is created after the code is written"

**Concept (image):** Plan → Execute → Verify → Evidence → Update State, repeat until the goal is verified.

**Ours:** [`qa-runtime-verification`](../../protocols/qa-runtime-verification.md) is the check-record **schema**
(status vocab `PASS`/`FAIL`/`MANUAL`/`TODO` + evidence types) behind the SESSION `## Verification` table;
[`three-pass-loop`](../../protocols/three-pass-loop.md) is the score→fix→review **engine**;
[`hostile-close-review`](../../protocols/hostile-close-review.md) is the per-bow-out gate (the `## Update State`
step) that audits the Verification table for assertion-without-evidence; [Doug](../../agents/doug.md) owns
"prove, don't assume"; `/verify` and `/fallow-fix-loop` re-prove behavior after a change. The five image
stages map onto Petey-plan → Cody-build → Doug-verify → evidence-in-SESSION → bow-out-close.

---

## 5b. Epic lane recipe — the multi-slice build+verify chain (SESSION_0529, model-agnostic)

The proven composition for a **multi-slice feature epic** (ran full-cycle at SESSION_0529: technique
authoring 3B/3C — 6 commits, 3 reviewers, 5 distinct real defects caught pre-push, zero found after).
**The quality lives in this chain, not in any model** — every defect traced to a process artifact
(review-axis framing, adversarial live probes, hostile-close rules, gotcha-encoded constraints), so the
recipe survives model swaps unchanged. Steps:

1. **Gotcha-encoded brief.** The builder's dispatch carries the prior session's reviewer findings as
   **HARD CONSTRAINTS** (named files + line-level mechanics), not as background reading. Source: the
   previous SESSION's `Next session` block + the lane memory.
2. **Structured deliverable contract.** The builder returns data, not prose: files table · exact gate
   outputs · commit SHA · deviations-with-reasons · needs-sign-off flags. Every downstream handoff
   (reviewers, operator gate) consumes it cheaply.
3. **Parallel review wave — Giddy + Doug + (UI lane) Desi on the SAME commit.** Distinct lenses catch
   distinct defect classes (0529: predicate drift ↔ server-open authz ↔ dead-end happy path — no overlap).
   **Desi runs IN the wave whenever the diff touches member-facing UI** — dispatching her at close turns
   her P1 into a push-gate scramble (the 0529 lesson).
4. **One batched fix pass + the next slice in a single builder resume.** Collect all reviewer fix-nows
   into ONE package (each its own commit), and let the same agent continue — `SendMessage` resume keeps
   full context (0529: survived two session-limit kills with zero lost work). Don't respawn per fix.
5. **Delta verify.** The verifier re-checks only the new commits — independent gate re-run (always incl.
   `next build` if apps/web), adversarial probes on the NEW seams, commit-split integrity. Live-probe any
   error-shape/serialization seam: one live probe outranks a green suite (the D-043 lesson).
6. **Push gate.** Build + verify + show; the operator's explicit go releases the push
   (explicit-push-authorization).

**Model policy:** dispatches inherit the session model — `model:` overrides are *experiments*, recorded in
the SESSION file's Operator line so no future reader treats a model as load-bearing. The roster
(`.claude/agents/*.md`) stays model-unpinned.

---

## What we lifted from the images

1. **The skill-routing table** (§1) — we routed implicitly across the rituals; the explicit task→workflow
   table was the highest-leverage discoverability win here, and has since graduated to its own
   actively-maintained home: [`SOT_Cookbook.md`](../../protocols/SOT_Cookbook.md) (G-023, SESSION_0584).
2. **The allowed-vs-never table** (§4) — we enforced boundaries via guards/hooks but never showed them as one
   "never-do" list; a fresh agent should see it at a glance.
3. **Per-agent context-contents** (§2) — naming what each roster agent should hold in-context (borrowed from
   the image's per-agent context-window lists).

## Cross-references

- [WORKFLOW 6.0](../../protocols/WORKFLOW_6.0.md) — the governing OS this map sits under (supersedes 5.0).
- [SOT_Cookbook](../../protocols/SOT_Cookbook.md) — the live task→workflow router (moved from §1 here).
- [fan-out-session-recipe](../../protocols/fan-out-session-recipe.md) — the cross-session sibling of §5b:
  N parallel disjoint-lane sessions (disjointness proof, prompt skeleton, ledgered lane continuation).
- [orchestration-hub](../../runbooks/dev-environment/orchestration-hub.md) — the exhaustive file-tree companion (`bun run docs:hub`).
- [Opening](../../rituals/opening.md) · [Closing](../../rituals/closing.md) rituals — where routing + the finding-router live.
- [agents/README](../../agents/README.md) — the roster (pillar 2).
- [loop-of-loops](../../protocols/loop-of-loops-ledger-driven-sessions.md) · [loop-board](files/loop-board.md) — the ledgers (pillar 3).
