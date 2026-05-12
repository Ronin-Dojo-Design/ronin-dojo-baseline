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

### Bow in (opening)

When the user says **"bow in"**, **"start session"**, or **"open session"**:

1. Find the highest-numbered `docs/sprints/SESSION_NNNN.md`. Read its `Goal`, `Open decisions / blockers`, and `Next session` section.
2. Skim `docs/architecture/program-plan.md` — find the current sprint row and its deliverable.
3. Create the next `SESSION_NNNN.md` with `Date`, `Operator`, `Goal`, `Status: in-progress`.
4. State the session goal and first task before starting work.

### Bow out (closing)

When the user says **"bow out"**, **"close session"**, or **"end session"**:

1. Stop new work. Let any in-flight tool calls finish.
2. Update the current `SESSION_NNNN.md`:
   - `What landed` — bullets of completed work
   - `Files touched` — paths + one-line note
   - `Decisions resolved` — anything signed off
   - `Open decisions / blockers` — anything unresolved
   - `Next session: Goal + Inputs to read + First task`
3. Default to **quick close** (`Status: closed-quick`). Escalate to **full close** (`Status: closed-full`) when the user says "full close", at end of day, end of sprint, or before context loss. Full close adds a `## Reflections` section.
4. State: "Bowed out — SESSION_NNNN closed. Next session goal: {one line}."

### Session macro (standard operating prompt)

The typical session follows this chain. Apply it automatically when the user says "bow in":

1. **Bow in** per `docs/rituals/opening.md`.
2. **Graphify-first navigation** — use `graphify query` and `graphify explain` for finding files and docs. Do NOT use raw grep for task planning or file discovery. Only fall back to grep for exact-string edits within a known file. If the graph is ≤1 commit behind HEAD and was updated at end of the last session, skip `graphify update`; otherwise run it. See `docs/runbooks/graphify-repo-memory.md`.
3. **Petey plans** — act as Petey (`docs/agents/petey.md`) to read the previous session's staged tasks, decompose if needed, then orchestrate and assign suitable agents (Cody for implementation, Doug for review). Manage handoffs between agents within the session.
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
