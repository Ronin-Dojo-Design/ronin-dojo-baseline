# CLAUDE.md — ronin-dojo-app

Standing context for every Claude Code session in this repo. Two parts:
**Session operations** (how to run a session) and the original **LLM Wiki Schema**
(how to maintain the knowledge wiki). Kept tight — this loads into context each session,
so it does not need re-pasting at bow-in.

## Session operations (bow-in / bow-out / orchestration)

### Repo & environment

- Repo: **ronin-dojo-app** (`/Users/brianscott/dev/ronin-dojo-app`, remote
  `Ronin-Dojo-Design/ronin-dojo-baseline`). VSCode's primary cwd is the **read-only**
  `dirstarter_template` boilerplate — never git/build/write there. Every Bash call
  operates from the ronin-dojo-app cwd; run the FS-0024 `pwd` + `git remote` guard
  before any mutating git (the shell guard blocks `git`/`gh`/`bun`/`vercel`/`graphify`
  from the template dir).
- App lives in `apps/web` (Next.js + Prisma + Better Auth, pnpm/bun workspace). Dev
  server: `cd apps/web && npx next dev --turbo` (FS-0002 — not `bun dev`/`pnpm dev`).
- Tooling available: **Vercel CLI, GitHub CLI (`gh`), Docker, MCP servers** — use for
  PRs/merges/rebases (`gh`), deploy checks (`vercel`), local S3 (MinIO via Docker).

### How sessions run

- **Bow-in and bow-out are mandatory** (`/bow-in`, `/bow-out` → the rituals in
  `docs/rituals/`). The default task is the **"Next session" block of the
  highest-numbered `docs/sprints/SESSION_NNNN.md`** — read it; it does not need pasting.
- **Discovery is Graphify-first**: `graphify stats`/`query` before repo-wide
  `grep`/`find`/`ls` on cross-area work (`docs/runbooks/graphify-repo-memory.md`).
- **Default to Petey orchestration** for multi-part or unclear lanes: plan via
  `docs/protocols/petey-plan.md` (grill open decisions first), then Cody builds and
  Doug verifies. Parallelize with sub-agents only when the work is genuinely disjoint;
  do single coherent changes inline.

### Bow-out = full close (default)

- Run the **full** closing ritual including optional deep items: Reflections, hostile
  close review, evidence table, ADR check, memory sweep, and documenting new components
  in `docs/knowledge/wiki/custom-component-inventory.md`.
- After git hygiene, refresh Graphify: `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .`.
- Route findings to their canonical ledger via the **finding router** (closing.md §6.7):
  wiring→`wiring-ledger` (WL), drift→`drift-register` (D), SOP miss→`failed-steps-log` (FS),
  unclean close→`incidents`, smoke boundary→`manual-boundary-registry`, decision→ADR.
- **Standing authorization: stage, commit (conventional message), and push to `main`
  on completion** — trunk-based flow for this repo. Gates (typecheck / biome / tests /
  wiki-lint) must pass first; never force-push; run the FS-0024 git guard.
  *(Remove this bullet if you'd rather confirm each push.)*
- **Push cadence:** one push per session at close — don't push mid-session. Production
  deploys are decoupled from pushes: `vercel.json`'s `ignoreCommand` skips the prod build
  unless `apps/web` / `pnpm-lock.yaml` / `package.json` / `vercel.json` changed, so docs /
  governance / CI / `scripts` sessions push without deploying. App-code sessions deploy on
  push as before. (SESSION_0335 — see `docs/runbooks/dev-environment/verification-and-testing.md`.)

---

## LLM Wiki Schema

This section defines how AI agents should behave when maintaining the Ronin Dojo Baseline knowledge wiki.

## Purpose

The goal of this wiki is to build a persistent, structured, and continuously improving knowledge base.

The AI should not repeatedly rediscover knowledge from raw sources. Instead, it should:

1. Read sources once
2. Synthesize them into structured pages
3. Link those pages together
4. Update them over time
5. Maintain consistency and accuracy

## Core rules

### 1. Never overwrite raw sources

Files under `raw/` are immutable.

- Do not edit them
- Do not summarize directly over them
- Always create or update wiki pages instead

### 2. Always write to the wiki layer

All synthesized knowledge must live in `wiki/`.

- Concepts go in `wiki/concepts/`
- People go in `wiki/people/`
- Arts go in `wiki/arts/`
- Architecture goes in `wiki/architecture/`
- Content engine knowledge goes in `wiki/content-engine/`

### 3. Link aggressively

Every page must:

- link to related concepts
- link to parent topics
- link to child topics when appropriate

No isolated pages.

### 4. Maintain index and log

After each ingestion or update:

- update `wiki/index.md`
- append a new entry to `wiki/log.md`

### 5. Handle contradictions explicitly

If two sources conflict:

- do not silently merge
- document the contradiction
- note possible interpretations

### 6. Prefer synthesis over duplication

If a concept already exists:

- update the existing page
- do not create a near-duplicate page

### 7. Respect the ubiquitous language

All wiki content must align with the repo’s domain language:

- Passport
- DirectoryProfile
- Organization
- Discipline
- RankSystem
- Rank
- Membership
- RegistrationEntry

Do not introduce alternative names without updating the glossary.

### 8. Do not expand product scope

The wiki is not the product.

- Do not create requirements implicitly
- Do not change schema or API design from wiki edits
- Surface new ideas as notes, not decisions

### 9. Keep pages structured

Preferred format:

```md
# Title

## Summary

Short explanation of the concept.

## Key Ideas

- bullet points

## Relationships

- links to related pages

## Sources

- references to raw material

## Open Questions

- unresolved ideas or contradictions
```

### 10. Periodic linting

The AI should occasionally:

- find orphan pages (no inbound links)
- find duplicated concepts
- find outdated terminology
- find missing relationships

## Workflow

1. New source added to `raw/`
2. AI reads and extracts key concepts
3. AI creates or updates wiki pages
4. AI links pages together
5. AI updates index and log
6. AI flags contradictions or gaps

## Relationship to repo development

This system supports the codebase by:

- preserving architectural decisions
- organizing research
- supporting content creation
- preventing repeated AI rediscovery loops

It does NOT replace:

- Prisma schema
- backend services
- frontend components
- sprint planning

Those remain governed by SESSION docs and architecture files.

## Final rule

Clarity over completeness.

The goal is a growing, connected map of knowledge, not a perfectly exhaustive encyclopedia on day one.
