---
title: "SESSION 0166 - MCP Usage Runbook"
slug: session-0166
type: session--implement
status: closed-full
created: 2026-05-14
updated: 2026-05-14
last_agent: codex-session-0166
sprint: S6
pairs_with:
  - docs/runbooks/mcp-usage-runbook.md
  - docs/runbooks/vercel-domain-setup-runbook.md
  - docs/runbooks/database.md
  - docs/runbooks/stripe-setup-runbook.md
  - docs/runbooks/graphify-repo-memory.md
  - docs/protocols/project-log.md
  - docs/rituals/closing.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/runbooks/mcp-usage-runbook.md
---

# SESSION 0166 - MCP Usage Runbook

## Date

2026-05-14

## Operator

Brian Scott + Codex (Petey -> Cody -> Doug -> Giddy -> Petey)

## Goal

Turn the MCP tooling recommendation into a durable runbook with provider data flows, decision trees, safety gates, and full-close evidence.

## Graphify check

- Queries used:
  - `graphify query --graph . "MCP usage runbook Vercel Playwright Chrome DevTools Neon Supabase Stripe data flow decision tree runbook wiki index project log SESSION_0166" --depth 3 --budget 8000`
  - `graphify query --graph . "closing full close current session SESSION_0166 project log wiki index runbook backlinks JETTY frontmatter" --depth 2 --budget 6000`
- Files selected from graph and verified directly: `docs/runbooks/vercel-domain-setup-runbook.md`, `docs/runbooks/dev-environment.md`, `docs/runbooks/stripe-setup-runbook.md`, `docs/runbooks/database.md`, `docs/runbooks/graphify-repo-memory.md`, `docs/protocols/project-log.md`, `docs/knowledge/wiki/index.md`, and `docs/rituals/closing.md`.
- Verification note: Graphify update runs after git hygiene so the new runbook and SESSION_0166 are indexed from the latest commit.

## Provider docs checked

| Provider | Source |
| --- | --- |
| Vercel MCP | `https://vercel.com/docs/agent-resources/vercel-mcp` |
| Playwright MCP | `https://playwright.dev/docs/getting-started-mcp` |
| Chrome DevTools MCP | `https://github.com/ChromeDevTools/chrome-devtools-mcp` |
| Neon MCP | `https://neon.com/docs/ai/neon-mcp-server` |
| Supabase MCP | `https://supabase.com/docs/guides/ai-tools/mcp` |
| Stripe MCP | `https://docs.stripe.com/mcp` |

## Petey plan

### Goal

Create a concise MCP usage runbook that keeps provider MCPs in the right lane and closes with full documentation hygiene.

### Tasks

#### TASK_01 - Draft MCP usage runbook

- **Agent:** Cody
- **What:** Add `docs/runbooks/mcp-usage-runbook.md` with source links, provider matrix, data flows, decision trees, safety gates, and install/use order.
- **Done means:** Runbook exists and records the current Neon-first/Supabase-platform decision boundary.
- **Depends on:** nothing.

#### TASK_02 - Wire JETTY links and indexes

- **Agent:** Cody + Petey
- **What:** Add reciprocal backlinks on touched runbooks, add the wiki row, add the session row, and append project-log task/review entries.
- **Done means:** Wiki index and project-log discover SESSION_0166 and the new runbook.
- **Depends on:** TASK_01.

#### TASK_03 - Full-close verification

- **Agent:** Doug + Giddy + Petey
- **What:** Run close checks, record hostile review, verify docs-only scope, commit, and refresh Graphify.
- **Done means:** `git diff --check`, `bun run wiki:lint`, project-log exact count, git hygiene, and Graphify update are complete or honestly reported.
- **Depends on:** TASK_01 and TASK_02.

### Parallelism

Sequential. The new runbook drives the backlink, wiki, and project-log entries.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Direct documentation implementation |
| TASK_02 | Petey | Close-hygiene and cross-link ownership |
| TASK_03 | Doug + Giddy + Petey | QA evidence, architecture boundary review, and ritual close |

### Scope guard

No MCP installs, no provider mutations, no Vercel/Stripe/DB account changes, no runtime code, and no Dirstarter upstream merge in this session.

## Files touched

| Path | Note |
| --- | --- |
| `docs/runbooks/mcp-usage-runbook.md` | New MCP policy/runbook with data flows, decision trees, provider matrix, safety gates, and source links. |
| `docs/runbooks/vercel-domain-setup-runbook.md` | Added reciprocal link to the MCP usage runbook. |
| `docs/runbooks/dev-environment.md` | Added reciprocal link to the MCP usage runbook. |
| `docs/runbooks/stripe-setup-runbook.md` | Added reciprocal link and normalized touched frontmatter indentation. |
| `docs/runbooks/database.md` | Added reciprocal link to the MCP usage runbook. |
| `docs/runbooks/graphify-repo-memory.md` | Added reciprocal link to the MCP usage runbook. |
| `docs/protocols/project-log.md` | Added SESSION_0166 task/review entries and backlinks. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0166 and MCP Usage Runbook rows. |
| `docs/sprints/SESSION_0166.md` | Session plan, evidence, and full-close artifact. |

## What landed

- Added `docs/runbooks/mcp-usage-runbook.md` as the durable MCP usage policy for Vercel, browser QA, Stripe, Neon, Supabase, and Graphify.
- Recorded the provider boundary: MCP for provider state/logs/guided ops; CLI for repeatable runbooks, CI, and release proof.
- Captured the current database posture: Neon is the default fit for today's Prisma/Better Auth/Vercel architecture; Supabase needs an ADR if Ronin chooses the broader platform model.
- Added safety gates for human confirmation, no production DB mutation through MCP, least privilege, no secrets in docs, and prompt-injection awareness.

## Decisions resolved

- Vercel MCP is worth adding before the next production smoke/debug session.
- Playwright MCP and Chrome DevTools MCP have separate jobs: flow proof versus console/network/performance diagnosis.
- Stripe MCP is useful in test mode, but webhook proof stays CLI/app-log based.
- Neon MCP and Supabase MCP should not both be installed before the database/platform decision is explicit.

## Open decisions / blockers

- Whether Vercel MCP should be installed globally or scoped to the Ronin project.
- Whether Chrome DevTools MCP should be project-local or user-global on this machine.
- Whether Ronin production Postgres is definitively Neon.
- Whether the future iOS app remains API-first or adopts Supabase direct-client/Auth/RLS.
- Production user-journey smoke from SESSION_0162 remains open.

## Next session

- **Goal:** Install/authorize the provider MCP needed for the next proof lane, then run production smoke if credentials are ready; otherwise continue env/deploy comparison without runtime changes.
- **Inputs to read:**
  - `docs/runbooks/mcp-usage-runbook.md`
  - `docs/runbooks/vercel-domain-setup-runbook.md`
  - `docs/sprints/SESSION_0162.md`
  - `docs/sprints/SESSION_0165.md`
  - `docs/architecture/dirstarter-baseline-index.md`
- **First task:** Decide Vercel MCP install scope (`project` versus `global`) and authorize it only if the next action is production smoke/debug.

## Task log

| Task ID | Description | Status |
| --- | --- | --- |
| SESSION_0166_TASK_01 | Draft MCP usage runbook | done |
| SESSION_0166_TASK_02 | Wire JETTY links and indexes | done |
| SESSION_0166_TASK_03 | Full-close verification | done |

## Review log

### SESSION_0166_REVIEW_01 - Full Close Review

- **Reviewed tasks:** SESSION_0166_TASK_01 through SESSION_0166_TASK_03.
- **Dirstarter docs check:** not applicable; this session changed provider-ops documentation only and did not touch Dirstarter runtime code, Dirstarter-derived schema, or upstream port lanes.
- **Sources:** official Vercel MCP, Playwright MCP, Chrome DevTools MCP, Neon MCP, Supabase MCP, and Stripe MCP docs checked 2026-05-14.
- **Verdict:** Aligned. The runbook keeps MCPs as provider-state and debugging tools, preserves CLI as the repeatable proof lane, and prevents accidental database/platform drift by separating Neon-first from Supabase-platform adoption.
- **Kaizen aggregate:** 8.0. Docs are actionable; confidence is capped until the chosen MCPs are installed and tested in a real production smoke/debug session.

## Hostile close review

1. **Plan sanity:** Good. The scope was a single runbook plus close hygiene; no provider installation or account mutation was mixed into the doc session.
2. **Dirstarter compliance:** Not applicable for implementation. No Dirstarter baseline code or upstream runtime lane changed.
3. **Security:** Good for documentation. The runbook explicitly requires human confirmation, least privilege, no secrets in docs, no production DB mutation through MCP, and read-only/dev DB posture.
4. **Data integrity:** No schema, migrations, or database state changed.
5. **Lifecycle proof:** The runbook does not claim production smoke proof. It stages MCP use for future smoke/debug work.
6. **Verification honesty:** Provider docs were checked live; runtime smokes were not run or claimed.
7. **Workflow honesty:** Graphify-first discovery was used for repo planning; project-log/wiki/session close artifacts were updated.
8. **Merge readiness:** Ready to commit as docs-only. Push still requires explicit owner authorization.

### SESSION_0166_FINDING_01 - MCP install scope remains an operator decision

- **Severity:** low
- **Task:** SESSION_0166_TASK_01
- **Evidence:** `mcp-usage-runbook.md` leaves Vercel and Chrome DevTools MCP install scope open.
- **Impact:** Future sessions can lose time deciding whether MCPs should be global or project-local.
- **Required follow-up:** Decide install scope before the first MCP install session.
- **Status:** open

### SESSION_0166_FINDING_02 - Database provider decision still needs ADR if Supabase is chosen

- **Severity:** medium
- **Task:** SESSION_0166_TASK_01
- **Evidence:** Supabase adoption would shift Auth/RLS/Realtime/Storage/iOS SDK posture beyond a simple Postgres hosting choice.
- **Impact:** Installing Supabase MCP prematurely could bias Ronin toward a broader platform migration without architecture approval.
- **Required follow-up:** Write an ADR before adopting Supabase as more than a Postgres host.
- **Status:** open

## ADR / ubiquitous-language check

- **No new ADR.** This session documented tool-selection policy only. A future Supabase adoption choice would require an ADR.
- **No ubiquitous-language update.** No new domain term was introduced.

## Reflections

- The important distinction is not MCP versus CLI; it is interactive provider state versus repeatable release proof.
- The database decision should stay explicit. Neon fits the current architecture, while Supabase is a larger platform posture that should not sneak in through tooling.
- Browser MCPs are complementary: Playwright is better for flow interaction, Chrome DevTools is better for why-it-failed evidence.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Touched docs have current `updated: 2026-05-14` where frontmatter was changed and `last_agent: codex-session-0166`. SESSION_0166 frontmatter `status` and body status are closed together. |
| Backlinks/index sweep | New runbook pairs with dev environment, Vercel, database, Stripe, Graphify, and SESSION_0166; reciprocal backlinks were added. Wiki index has MCP Usage Runbook and SESSION_0166 rows. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors / 487 R8 markdown-formatting warnings across 324 markdown files. Touched-file R8 warnings in `dev-environment.md` and `database.md` were fixed; remaining warnings are pre-existing docs backlog. |
| Kaizen reflection | `## Reflections` section present. |
| Hostile close review | `SESSION_0166_REVIEW_01`, `SESSION_0166_FINDING_01`, and `SESSION_0166_FINDING_02` present. |
| Review & Recommend | `## Next session` stages MCP install scope before production smoke/debug or env/deploy comparison. |
| Memory sweep | No operator memory update needed; durable preference captured in the MCP usage runbook. |
| Next session unblock check | Blocked on MCP install-scope decision for provider setup and still blocked on production smoke credentials if smoke is selected; env/deploy comparison remains unblocked. |
| Git hygiene | `git diff --check` passed; Graphify project-log query found the active ledger; exact-file count for `SESSION_0166` returned 11. Final response will report branch, worktree, commit, and push status. |
| Graphify update | Pending after git hygiene; final response will report node/edge/community counts. |

## Status

closed-full
