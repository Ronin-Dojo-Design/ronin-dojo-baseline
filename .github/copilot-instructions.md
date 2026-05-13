# Copilot Custom Instructions — Ronin Dojo

## Project context

This is a **multi-brand martial arts SaaS platform** built on the Dirstarter template (Next.js 15 / React 19 + Prisma + Better-Auth + Bun). Monorepo at `apps/web/`. Four brands: RONIN_DOJO_DESIGN, BASELINE_MARTIAL_ARTS, BBL, WEKAF.

### Dirstarter stack (L1 — don't fight these choices)

- **Next.js 15** with App Router, server actions over API routes
- **Prisma ORM** for all DB access (Postgres)
- **Better-Auth** for identity (magic link login, session management)
- **Tailwind CSS v4** with custom design system
- **React Hook Form + Zod v4** for form handling + validation
- **next-intl** for i18n / multi-language
- **Resend / Postmark** for transactional email via React Email templates (`emails/` dir)
- **S3-compatible storage** for media uploads (Mux/Cloudflare for video)
- **Stripe** for payments (wired in S10)
- **Content collections** for MDX blog posts (`content/posts/`)
- **Biome** for linting/formatting (not ESLint)

## Session rituals

The rituals are agent-agnostic. The trigger differs per environment (Copilot/Codex chat: the words; Claude Code: `/bow-in` / `/bow-out` skills; CLI: a make target), but the steps are identical and binding. Source of truth lives in `docs/rituals/opening.md` and `docs/rituals/closing.md` — those files override anything restated here if they ever drift.

When you stamp `last_agent` on touched docs, name the agent that actually executed (e.g., `copilot-session-NNNN`, `claude-session-NNNN`, `codex-session-NNNN`).

### Bow in (opening)

Trigger: **"bow in"**, **"start session"**, or **"open session"**. Execute `docs/rituals/opening.md` (or `.github/prompts/bow-in.prompt.md`). Minimum binding steps:

1. Read the latest `docs/sprints/SESSION_NNNN.md` — `Goal`, `Open decisions / blockers`, `Next session`.
2. Read `docs/protocols/WORKFLOW_5.0.md` — today's session-calendar row, primary lane, worktree; fill the Dirstarter alignment table. Skim `docs/architecture/program-plan.md` for context.
3. Skim cross-references on demand only (plan-vs-current, ADRs, runbooks, dirstarter-docs-inventory Alignment URLs).
4. Check `docs/protocols/failed-steps-log.md` and `docs/knowledge/wiki/drift-register.md` for `open` / `mitigated` entries in today's lane.
5. Graphify-first discovery for cross-area lanes (`graphify stats` + `graphify query "<lane nouns>" --budget 2000`). No repo-wide `grep` / `rg` / `find` for task planning. If a path is known, Read it directly.
6. Identify ONE task with explicit "done" criteria. If unclear or multi-part, invoke Petey (`docs/protocols/petey-plan.md`) first.
7. Number tasks in `docs/protocols/project-log.md` TASK_PLAN_LOG (`SESSION_NNNN_TASK_01`, …) before implementation starts.
8. Branch check: `git branch --show-current` + `git status --short`. Raise uncommitted changes or stale feature branches before starting.
9. Create `docs/sprints/SESSION_{NEXT}.md` with **full JETTY 3.0 frontmatter** — `title`, `slug`, `type: session--open`, `status: in-progress`, `created`, `updated`, `last_agent: <agent>-session-NNNN`, `sprint`, `pairs_with`, `backlinks`. Fill `Date`, `Operator: Brian + <agent>`, `Goal`.
10. State the goal and first task before any work. Proceed as Petey or Cody (Cody must complete `docs/protocols/cody-preflight.md` before writing code).

### Bow out (closing)

Trigger: **"bow out"**, **"close session"**, or **"end session"**. Execute `docs/rituals/closing.md` (or `.github/prompts/bow-out.prompt.md`). Default to **quick close**; escalate to **full close** when the user says "full close", at end of day / sprint / milestone, or when the session touched schema, auth, payments, deployment, production data, or governance protocols.

Quick close minimum binding steps:

1. Pause the work; let in-flight tool calls finish.
2. Update the current `SESSION_NNNN.md`: `What landed`, `Files touched`, `Decisions resolved`, `Open decisions / blockers`, `Next session: Goal + Inputs to read + First task`, `Task Log` (TASK_PLAN_LOG IDs), `Review Log`, `Hostile close review`, `ADR / ubiquitous-language check`. **Atomicity rule (FS-0015):** YAML `status:` and body `### Status` line update together in one edit pass.
3. **Project-log gate.** Verify current session has at least one entry in `docs/protocols/project-log.md` via Graphify discovery + exact-file count (`awk 'index($0, "SESSION_NNNN") { count++ } END { print count + 0 }' docs/protocols/project-log.md`). Must return >= 1 before any closed status. No repo-wide text search for this gate.
4. JETTY 3.0 sweep on touched files — frontmatter, bidirectional backlinks, wiki-index completeness (FS-0019), `bun run wiki:lint` (record exact count + whether failures are pre-existing), G8/R8 incremental markdown fix.
5. Refine session type if clearly one mode: `session--plan`, `session--implement`, or `session--review`. Mixed sessions stay `session--open`.
6. Git hygiene — branch check, worktree check, stage/review, conventional commit, push only if authorized. *(Full close defers this to the end.)*
7. `graphify update .` after git hygiene (if installed and files changed); report node/edge/community counts.
8. State: "Bowed out — SESSION_NNNN closed. Next session goal: {one line}."

Full close adds: `## Reflections`, Giddy + Doug Hostile Close Review + Review & Recommend, `## Full close evidence` table with proof per row, ADR/ubiquitous-language check, memory sweep, next-session unblock confirmation. Full close execution order defers git hygiene + Graphify + bow-out line to the very end to avoid a two-pass commit cycle. `closed-full` is a proof state — missing evidence means status stays `in-progress` or `closed-quick`.

### Session macro (standard operating prompt)

The typical session follows this chain. Apply it automatically when the user says "bow in":

1. **Bow in** per `docs/rituals/opening.md`.
2. **Graphify-first navigation** — `graphify query` and `graphify explain` for finding files and docs. No raw `grep` / `rg` / `find` for task planning or file discovery. Only fall back to text search for exact-string edits within a known file. If the graph is ≤1 commit behind HEAD and was updated at end of the last session, skip `graphify update`; otherwise run it. See `docs/runbooks/graphify-repo-memory.md`.
3. **Petey plans** — act as Petey (`docs/agents/petey.md`) to read the previous session's staged tasks, decompose if needed, then orchestrate and assign suitable agents (Cody for implementation, Doug for review). Manage handoffs between agents within the session. Parallelize independent reads/searches via subagents or worktrees when it pays off.
4. **Cody executes** — hand off to Cody for implementation tasks, one at a time, type-check between tasks. Cody runs `docs/protocols/cody-preflight.md` before writing code.
5. **Petey closes** — hand back to Petey for `docs/rituals/closing.md` bow-out:
   - **Full close** if docs were touched, or if the user requests it, or at end of day/sprint/milestone.
   - **Quick close** if only code files were touched in a `session--implement` or `session--review`.
   - In full close mode, defer git hygiene until after all content/review steps (see closing.md execution order).
   - Run `graphify update .` **after** git commit so the graph has the latest work.

## Agent roles

- **Petey** — planner. Invoked when scope is ambiguous, multi-part, or has open decisions. Produces a plan, not code. Reads: user message → latest SESSION file → program-plan.md → plan-vs-current.md → relevant ADRs.
- **Cody** — builder + self-reviewer. Invoked when a plan exists and execution can begin. One task at a time, small commits, run type checker/linter before declaring done, don't expand scope.

## ⛔ HARD RULE: Component Inventory Gate

**Before writing ANY UI code**, read `docs/knowledge/wiki/dirstarter-component-inventory.md`. Every heading, input, select, card, badge, button, dialog, form, and layout wrapper has a provided Dirstarter component. Using raw HTML (`<h3>`, `<input>`, `<select>`, `<div className="flex">`, `<div className="rounded-lg border bg-card">`) when the inventory provides a component is a **FS-0001 class violation**. See `docs/protocols/code-guardrails.md` rule G6.

When unsure which role to play: if the task is clear → Cody. If it needs decomposition or has open decisions → Petey first.

## Layered architecture

Four layers, each with its own source of truth. They don't bleed into each other.

| Layer | Source of truth | Governs |
|---|---|---|
| **L1 — Code patterns** | Dirstarter template (`apps/web/` at upstream `c42e8bb`) | File org, framework choices, HOC patterns, action client chain |
| **L2 — Data & behavioral spec** | `docs/architecture/source/chatgpt-original-plan.md` §1–7 | What the system DOES: Passport, Shells, Org×Discipline×Membership, Tournaments, Directory |
| **L3 — Multi-tenant** | ADRs 0004, 0006, 0008 | `brand` column, host→brand middleware, per-brand themes |
| **L4 — UX/theming** | Legacy frontends in monorepo | Visual tokens, branded copy, screen layouts |

## Architecture rules

- **Brand scoping**: Every brand-scoped model uses a `brand: Brand` column (ADR 0004). Never use separate tables per brand.
- **Enum vs table**: If a brand admin should customize the values → use a table with `isSystem` + nullable `brand` columns. If it's internal system state → enum is fine.
- **Dirstarter patterns**: Match existing conventions — HOC chains, action client patterns, content collections, Prisma extension chaining. Don't invent new patterns.
- **No scope creep**: If you find adjacent tech debt during a task, note it in the SESSION file — don't fix it inline.
- **Cross-brand data leakage is a critical bug class.** Enforce via Prisma client extension that requires `brandId` filter on authenticated queries.

## Current sprint context

- **12-sprint MVP plan** targeting Baseline Martial Arts public launch (~3 months).
- **Brand build order**: Baseline Martial Arts → Ronin Dojo Design → BBL → WEKAF.
- **S1 (current)**: Phase 1 schema rev — 31 models, all enums. Design doc signed off; migration pending.
- **Active personas**: Petey (planner), Cody (builder). Doug (QA) activates when needed.

## Database conventions

- **Local dev**: Postgres.app on macOS, `postgresql://brianscott@localhost:5432/ronindojo_dev`
- **Production**: Neon (managed Postgres 16)
- **Never pre-install extensions** — Prisma manages `citext` via schema's `extensions` declaration
- **Reset**: `dropdb ronindojo_dev && createdb ronindojo_dev` then `bun db:migrate dev`

## SESSION file format

Every session has one file: `docs/sprints/SESSION_NNNN.md` (4-digit zero-padded). Required sections: `Goal`, `Status`, `What landed`, `Files touched`, `Decisions resolved`, `Open decisions / blockers`, `Next session` (Goal + Inputs + First task). Full close adds `Reflections`. See `docs/protocols/chat-handoff.md` for the full spec.

## Key files

| File | Purpose |
|---|---|
| `docs/knowledge/wiki/dirstarter-component-inventory.md` | **MANDATORY PRE-FLIGHT.** Exhaustive inventory of every L1 component, hook, HOC, and admin pattern. Consult BEFORE planning or building any UI. |
| `docs/architecture/program-plan.md` | 12-sprint MVP plan, current sprint scope |
| `docs/architecture/s1-schema-design.md` | S1 schema design doc (31 models, all enums) |
| `docs/architecture/plan-vs-current.md` | Gap analysis: plan spec vs current schema |
| `docs/architecture/data-model.md` | Human-readable data model rationale (needs update) |
| `docs/architecture/decisions/` | ADRs — architectural decisions |
| `docs/sprints/SESSION_NNNN.md` | Session tracking files |
| `docs/rituals/opening.md` | Full bow-in ritual reference |
| `docs/rituals/closing.md` | Full bow-out ritual reference |
| `docs/agents/petey.md` | Petey role definition |
| `docs/agents/cody.md` | Cody role definition |
| `apps/web/prisma/schema.prisma` | Prisma schema (source of truth for data model) |

## Code style

- TypeScript strict mode. No `any` unless absolutely necessary.
- Prisma for all DB access. No raw SQL unless Prisma can't express it.
- Use `cuid()` for all IDs.
- Prefer server actions over API routes where Dirstarter does.
- When editing markdown docs: use fenced code blocks with language tags (` ```prisma `, ` ```typescript `, etc.).
