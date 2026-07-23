---
title: Skills Index (SSL)
slug: skills-index
type: reference
status: active
created: 2026-07-22
updated: 2026-07-22
last_agent: claude-session-0618
backlinks:
  - docs/knowledge/wiki/index.md
---

# Skills Index (SSL)

The canonical inventory of Claude Code skills in this repo, plus the
**discussed-not-built (SSL) backlog** — the fix for skills that get "discussed but
never built" (`/car` was raised in 11 past sessions and never built; `/cac`×4,
`/cas`×4, `/ppp`×2, `/ggr`×1).

Two halves, deliberately split by drift risk:

- **Built skills** — GENERATED from each `.claude/skills/*/SKILL.md` frontmatter by
  `bun scripts/skills-index.ts` (run at bow-out via the /gu-adjacent refresh), so the
  list can never drift from the source of truth. **Do NOT hand-edit inside the
  markers** — your edit will be overwritten on the next run.
- **Proposed / discussed-not-built (SSL backlog)** — hand-maintained below. `SSL-NNN`
  rows are parsed by `scripts/ledger-backlog.ts` (ledger code `SSL`) so an approved-
  but-unbuilt skill surfaces at bow-in instead of getting re-discussed for the Nth time.

## Built skills (generated — do not hand-edit)

<!-- GENERATED:skills START -->

| Skill | Description | Alias of |
| --- | --- | --- |
| `/bow-in` | Start a session — run the BaselineDashboard opening ritual at docs/rituals/opening.md | — |
| `/bow-out` | End a session — run the BaselineDashboard closing ritual at docs/rituals/closing.md | — |
| `/caveman` | Ultra-compressed communication mode. Cuts token usage ~75% by dropping filler, articles, and pleasantries while keeping full technical accuracy. Use when user says "caveman mode", "talk like caveman", "use caveman", "less tokens", "be brief", or invokes /caveman. | — |
| `/code-quality` | Score a unit of code against the repo's code-quality-matrix (the code-gold-standard) — a /10 across correctness, security, simplicity, readability, maintainability, scalability, and Dirstarter/custom reuse-fit, with hard caps, then answer "is this Apple/Facebook-grade?" and apply the fixes that close the gap (no behavior regression). Use when the user says "/code-quality", "score this code", "is this gold-standard / Apple-Facebook quality", "run the code-quality matrix", "grade this module", or asks how well-written (not just functional) recently-touched code is. | — |
| `/design-an-interface` | Generate multiple radically different interface designs for a module using parallel sub-agents. Use when user wants to design an API, explore interface options, compare module shapes, or mentions "design it twice". | — |
| `/diagnose` | Disciplined diagnosis loop for hard bugs and performance regressions. Reproduce → minimise → hypothesise → instrument → fix → regression-test. Use when user says "diagnose this" / "debug this", reports a bug, says something is broken/throwing/failing, or describes a performance regression. | — |
| `/domain-modeling` | Build and sharpen a project's domain model. Use when the user wants to pin down domain terminology or a ubiquitous language, record an architectural decision, or when another skill needs to maintain the domain model. | — |
| `/edit-article` | Edit and improve articles by restructuring sections, improving clarity, and tightening prose. Use when user wants to edit, revise, or improve an article draft. | — |
| `/fallow-fix-loop` | Goal-driven quality loop on the current diff — fallow audit + health for CRAP/dupes/dead-code/complexity diagnosis, a multi-angle code review, implement the fixes, then re-verify (headless browser) that refactors didn't break behavior AND re-run fallow to prove complexity/duplication/dead-code dropped. Use when the user says "/fallow-fix-loop", "run the fallow loop", "fallow fix", "clean up this diff", or asks to audit + fix CRAP/dupes/dead code/complexity on what was just built. | — |
| `/game-off` | Close a lean Mammoth (MMB) work session. Use when the operator says /game-off, finishes MMB/client-ops work, or wants the token-lean closing overlay that routes repo-touch work through the canonical bow-out ritual. | — |
| `/game-on` | Start a lean Mammoth (MMB) work session. Use when the operator says /game-on, starts MMB/client-ops work, or wants the token-lean opening overlay that routes repo-touch work through the canonical bow-in ritual. | — |
| `/ge` | Explain a subsystem/domain from the repo graph — communities, hubs, and the exact file set — instead of bulk-reading or grepping to build a mental map. Use for "explain how X works", "map the Y subsystem", onboarding a lane onto unfamiliar territory, or pre-plan recon. Aliases the former /graphify-explain. | — |
| `/ggr` | Giddy Gate Review — the universal QAR closing gate. Score the lane's output against the lane-appropriate rubric (Build → code-quality-matrix /10; Plan → plan-quality; Intake → framing), then gate — ≥9.0 clears · 7.0–8.9 auto-loops ≤2 Giddy passes then the operator gate · hard caps always loop. Uses /fallow-fix-loop for the objective metrics and as the loop's fix executor. Use when the operator says "/ggr", "giddy gate", "gate review", "QAR", "is this good enough to ship/close", or at bow-out as the closing gate. | — |
| `/git-guardrails-claude-code` | Set up Claude Code hooks to block dangerous git commands (push, reset --hard, clean, branch -D, etc.) before they execute. Use when user wants to prevent destructive git operations, add git safety hooks, or block git push/reset in Claude Code. | — |
| `/gq` | Graphify-first discovery — budget-capped graph query instead of repo-wide grep/find/ls. Use before any cross-area code/doc search, when asked "what relates to X", or when a lane needs discovery in a fresh worktree (worktree graph is empty — query the canonical checkout). Aliases the former /graphify-query. | — |
| `/graphify-explain` | Renamed to /ge. Explain a subsystem/domain from the repo graph instead of bulk-reading. See .claude/skills/ge/SKILL.md. | `/ge` |
| `/graphify-query` | Renamed to /gq. Budget-capped Graphify graph query instead of repo-wide grep/find. See .claude/skills/gq/SKILL.md. | `/gq` |
| `/grill-me` | Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me". | — |
| `/grill-with-docs` | Grilling session that challenges your plan against the existing domain model, sharpens terminology, and updates documentation (CONTEXT.md, ADRs) inline as decisions crystallise. Use when user wants to stress-test a plan against their project's language and documented decisions. | — |
| `/grilling` | Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases. | — |
| `/gu` | Refresh the repo's Graphify graph so /gq and /ge read current code. Run at bow-out or after a large structural change (moves/renames/new subsystems). This is the update half the bow-out ritual already calls. | — |
| `/hallmark` | Anti-AI-slop design skill for greenfield pages, audits, redesigns, and design extraction from URLs or screenshots. Use when the user asks to build a new app or landing page, wants to redesign something, invokes Hallmark by name, or uses audit/redesign/study. | — |
| `/handoff` | Compact the current conversation into a handoff document for another agent to pick up. | — |
| `/improve-codebase-architecture` | Find deepening opportunities in a codebase, informed by the domain language in CONTEXT.md and the decisions in docs/adr/. Use when the user wants to improve architecture, find refactoring opportunities, consolidate tightly-coupled modules, or make a codebase more testable and AI-navigable. | — |
| `/migrate-to-shoehorn` | Migrate test files from `as` type assertions to @total-typescript/shoehorn. Use when user mentions shoehorn, wants to replace `as` in tests, or needs partial test data. | — |
| `/new-client-recipe` | Stand up a new client product inside the monorepo with its own database. Use when the user says "/new-client-recipe", "new client", "onboard a client", "set up <name> as a new product/app", or wants to scaffold a new app under clients/* with a separate DB. Runs the repeatable new-client onboarding recipe (ADR 0034 + 0038). | — |
| `/obsidian-vault` | Search, create, and manage notes in the Obsidian vault with wikilinks and index notes. Use when user wants to find, create, or organize notes in Obsidian. | — |
| `/pp` | Petey Plan (Parse → Plan). Produce a session/lane plan from the current request + latest SESSION file + the live ledgers, grilling the open forks first — plan only, no dispatch. Use when the operator says "/pp", "petey plan", "plan this", "parse and plan", or a bow-in/bow-out task is unclear or multi-part. For the plan PLUS the paste-ready baton, use /ppp. | — |
| `/ppp` | /pp + Prompt — run the Petey plan, THEN emit the paste-ready baton (the handoff prompt a fresh session/agent/Cody adopts to execute the lane without re-deriving the plan). Use when the operator says "/ppp", "plan and prompt", "plan + baton", "stage the next session", or wants a plan they can hand straight to a builder. For plan-only, use /pp. | — |
| `/pr-fix-loop` | On-call PR review→score→fix loop. Run via /loop to keep open PRs merge-ready — a goal-driven loop that triages open PRs, runs the pr-review-score-fix loop on each as tracked tasks, fixes mechanical blockers on the branch, and reports verdicts. Pause-on-merge. Use when the user says "go on call", "babysit the PRs", "/pr-fix-loop", or runs it under /loop. | — |
| `/preview-artifacts` | Publish a visual review as ONE self-contained HTML Artifact — screenshot gallery, live design mock, or before/after comparison — and return the private link. Inline widgets and file attachments do NOT render in the operator's client; the published artifact is the proven operator-review channel (SESSION_0539). Use when the user says "/preview-artifacts", "publish a preview", "artifact gallery", "show me the screenshots", asks for a before/after or design-mock review, or when any lane (especially autonomous) needs operator sign-off on visual work. | — |
| `/prototype` | Build a throwaway prototype to answer a design question. Use when the user wants to sanity-check whether a state model or logic feels right, or explore what a UI should look like. | — |
| `/qa` | Interactive QA session where user reports bugs or issues conversationally, and the agent files GitHub issues. Explores the codebase in the background for context and domain language. Use when user wants to report bugs, do QA, file issues conversationally, or mentions "QA session". | — |
| `/request-refactor-plan` | Create a detailed refactor plan with tiny commits via user interview, then file it as a GitHub issue. Use when user wants to plan a refactor, create a refactoring RFC, or break a refactor into safe incremental steps. | — |
| `/research` | Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent. | — |
| `/review` | Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes — Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/PRD asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X". | — |
| `/scaffold-exercises` | Create exercise directory structures with sections, problems, solutions, and explainers that pass linting. Use when user wants to scaffold exercises, create exercise stubs, or set up a new course section. | — |
| `/seq-lane-build` | Sequence skill — the parallel-lane worktree build recipe as an ordered step list for a dispatched Cody. Use when dispatching (or acting as) a build lane in its own worktree off a fan-out plan; the dispatch prompt supplies only lane specifics (goal, owned files, pinned grill outcomes) and points here for the invariant sequence. | — |
| `/seq-research-recommend` | Sequence skill — "research first, recommend, don't build" (the /rr move). Use when the operator asks to look into something, evaluate an option, or check for prior art before any code/doc is written; also the default move when a plan step turns out to be "does this already exist? | — |
| `/seq-review-wave` | Sequence skill — the parallel review wave (Doug + Desi + Giddy on ONE commit) followed by batched-fix resume and delta re-verify. Use after a build lands to verify it launch-safe: dispatching reviewers on a diff, folding findings back, and recording verdicts. | — |
| `/setup-matt-pocock-skills` | Sets up an `## Agent skills` block in AGENTS.md/CLAUDE.md and `docs/agents/` so the engineering skills know this repo's issue tracker (GitHub or local markdown), triage label vocabulary, and domain doc layout. Run before first use of `to-issues`, `to-prd`, `triage`, `diagnose`, `tdd`, `improve-codebase-architecture`, or `zoom-out` — or if those skills appear to be missing context about the issue tracker, triage labels, or domain docs. | — |
| `/setup-pre-commit` | Set up Husky pre-commit hooks with lint-staged (Prettier), type checking, and tests in the current repo. Use when user wants to add pre-commit hooks, set up Husky, configure lint-staged, or add commit-time formatting/typechecking/testing. | — |
| `/tdd` | Test-driven development with red-green-refactor loop. Use when user wants to build features or fix bugs using TDD, mentions "red-green-refactor", wants integration tests, or asks for test-first development. | — |
| `/teach` | Teach the user a new skill or concept, within this workspace. | — |
| `/to-issues` | Break a plan, spec, or PRD into independently-grabbable issues on the project issue tracker using tracer-bullet vertical slices. Use when user wants to convert a plan into issues, create implementation tickets, or break down work into issues. | — |
| `/to-prd` | Turn the current conversation context into a PRD and publish it to the project issue tracker. Use when user wants to create a PRD from the current context. | — |
| `/triage` | Triage issues through a state machine driven by triage roles. Use when user wants to create an issue, triage issues, review incoming bugs or feature requests, prepare issues for an AFK agent, or manage issue workflow. | — |
| `/ubiquitous-language` | Extract a DDD-style ubiquitous language glossary from the current conversation, flagging ambiguities and proposing canonical terms. Saves to UBIQUITOUS_LANGUAGE.md. Use when user wants to define domain terms, build a glossary, harden terminology, create a ubiquitous language, or mentions "domain model" or "DDD". | — |
| `/wayfinder` | Plan a huge chunk of work — more than one agent session can hold — as a shared map of decision tickets on your issue tracker, and resolve them one at a time until the way to the destination is clear. | — |
| `/worktree-setup` | Bootstrap a fresh git worktree so gates and the dev server run — installs deps, copies the canonical apps/web .env, creates a placeholder apps/baseline .env, and generates Prisma clients. Use when a worktree has no node_modules / .env / Prisma client, when tsc/oxlint/bun test/next dev fail on module resolution, or when the user says "/worktree-setup", "bootstrap this worktree", or "set up the worktree". | — |
| `/write-a-skill` | Create new agent skills with proper structure, progressive disclosure, and bundled resources. Use when user wants to create, write, or build a new skill. | — |
| `/writing-beats` | Shape an article as a journey of beats, choose-your-own-adventure style. The user picks a starting beat from the raw material, you write only that beat, then offer options for where to pivot next, beat by beat, until the article reaches a natural end. Use when the user has raw material and wants to assemble it as a narrative rather than an argument. | — |
| `/writing-fragments` | Grilling session that mines the user for fragments — heterogeneous nuggets of writing (claims, vignettes, sharp sentences, half-thoughts) — and appends them to a single document as raw material for a future article. Use when the user wants to develop ideas before imposing structure, or mentions "fragments", "ideate", or "raw material" for writing. | — |
| `/writing-shape` | Take a markdown file of raw material and shape it into an article through a conversational session — drafting candidate openings, growing the piece paragraph by paragraph, arguing about format (lists, tables, callouts, quotes) at each step. Use when the user has a pile of notes, fragments, or a rough draft and wants help turning it into something publishable. | — |
| `/zoom-out` | Tell the agent to zoom out and give broader context or a higher-level perspective. Use when you're unfamiliar with a section of code or need to understand how it fits into the bigger picture. | — |

<!-- GENERATED:skills END -->

## Proposed / discussed-not-built (SSL backlog)

Hand-maintained. Each entry: `### SSL-NNN — <title>` + a `- **Status:**` line (status —
priority). Closed rows (resolved/built) drop out of the backlog scan. When a skill here
gets built, its SKILL.md lands in `.claude/skills/` and it appears in the generated table
above — retire its `SSL-NNN` row at that point.

<!-- SSL-001 (/pp), SSL-002 (/ppp), SSL-003 (/ggr) retired SESSION_0618 — built; now in the generated
     table above. G-031 slices S2/S3 landed. -->

### SSL-004 — /car — discussed in 11 past sessions, never built; purpose needs triage

- **Status:** open — P2

### SSL-005 — /cac — discussed 4 sessions, never built; needs triage

- **Status:** open — P2

### SSL-006 — /cas — discussed 4 sessions, never built; needs triage

- **Status:** open — P2
