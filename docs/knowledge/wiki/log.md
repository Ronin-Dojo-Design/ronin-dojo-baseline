---
title: Wiki Change Log
slug: log
type: protocol
status: active
created: 2026-04-26
updated: 2026-04-29
last_agent: codex-session-0025
---

# Wiki Change Log

Append-only log of wiki changes per CLAUDE.md rule 4.

## 2026-04-26 — SESSION_0004

- Created `JETTY_3.0.md` — annotation standard v1
- Created 4 templates: `_template-concept`, `_template-file`, `_template-decision`, `_template-runbook`
- Created `wiki/index.md` — master index linking all docs
- Retrofitted `passport-and-shells.md` with JETTY 3.0 frontmatter, mermaid diagram, backlinks
- Registered all existing `docs/` files in index with status + health scores

## 2026-04-26 — SESSION_0006

- Added JETTY 3.0 frontmatter to 15 docs: all architecture, rituals, protocols, runbooks, agents files
- Created `docs/protocols/code-guardrails.md` — coding SOP (no nested ternaries, lint, conventional commits)
- Created `docs/knowledge/wiki/incidents.md` — append-only unclean close incident log
- Added unclean close recovery mode to `docs/rituals/closing.md` with `closed-unclean` status
- Updated `plan-vs-current.md` — all entities ✅, behavioral requirements with S1 coverage, phases updated
- Updated `program-plan.md` — S1 and S5 marked ✅
- Updated wiki index: session statuses, health scores, new Obsidian vault + wiki-lint + code guardrails + incidents sections

## 2026-04-26 — SESSION_0007

- **S2 implemented**: Better-Auth post-signup hook, Passport + DirectoryProfile server actions/queries, `/me` page + editor
- Added JETTY 3.0 frontmatter to SESSION_0005, SESSION_0006, SESSION_0007
- Updated `docs/rituals/opening.md` step 6: SESSION files must include JETTY 3.0 frontmatter template at creation
- Added G8 (Zod `.optional()` for form strings) and G9 (`z.record()` v4 arity) to code guardrails
- Kaizen: `str()` helper pattern, check-before-build habit, Zod v4 gotchas documented
- Updated `program-plan.md` — S2 marked code complete (smoke test pending)

## 2026-04-26 — SESSION_0008 through SESSION_0013

- **S3 implemented**: Organization create + join flow, CRUD pages, membership lifecycle
- Sessions 0008–0013 covered org create, detail, list pages; join button; smoke testing
- Updated `program-plan.md` — S3 marked ✅

## 2026-04-26 — SESSION_0014 + SESSION_0015

- **S4 implemented**: Directory search with privacy-aware listing, filters, seed data
- Created `server/web/directory/` queries + schema + components
- Seed script expanded with directory profiles and org memberships
- S4 code complete, browser verification deferred to SESSION_0017

## 2026-04-27 — SESSION_0016

- Added ADR 0009 for mobile auth strategy (Better-Auth mobile SDK chosen)
- Created `packages/api-client/` scaffold for mobile auth
- Created `docs/architecture/dirstarter-architecture-map.md` — master L1 execution contract
- Created `docs/architecture/s2-s4-pattern-audit.md` — pattern compliance gap analysis
- Identified SESSION_0017 prework: S4 browser verification and Dirstarter pattern remediation

## 2026-04-27 — SESSION_0017

- Browser-verified S4 directory — fixed `localhost` brand mapping in `proxy.ts`
- **S4 formally closed.** Plan Milestone 1 (S1–S4) complete ✅
- Created payload files: `passport/payloads.ts`, `organization/payloads.ts`, `directory/payloads.ts`
- Refactored all org/passport/directory queries from inline `include` to payload-based `select`
- Updated `/me/page.tsx` to use Dirstarter `<Intro>/<Section>` pattern
- Updated `program-plan.md` — S4 marked ✅
- Updated wiki log (this entry)

## 2026-04-29 — SESSION_0023 through SESSION_0025

- Implemented Wave A schema substrate in `apps/web/prisma/schema.prisma`
- Created numbered accountability ledgers: `TASK_PLAN_LOG` and `TASK_REVIEW_LOG`
- Added hostile close review protocol and wired it into `closing.md`
- Tightened full-close mode contract with required full-close evidence artifact
- Added executable wiki lint command: `bun run wiki:lint`
- Updated ubiquitous language for quick close, full close, JETTY sweep, wiki lint, Kaizen reflection, and hostile close review
- Cleaned active wiki backlinks until `bun run wiki:lint` returned no violations
