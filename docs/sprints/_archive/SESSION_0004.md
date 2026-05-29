# SESSION_0004 — S1 schema rev: review design doc, write migration, update references

**Date:** 2026-04-26
**Operator:** Brian + Copilot (Petey → Cody)
**Goal:** Review `s1-schema-design.md` for correctness, rewrite `schema.prisma` with all 31 models + enums, run migration, update `authz.ts` + `middleware.ts`, verify with `prisma generate` + `tsc --noEmit`.
**Status:** closed-full

---

## Task breakdown (Petey plan)

### Phase 1 — Design doc review (Petey, sequential)

Read `s1-schema-design.md` top-to-bottom. Validate:

- All 31 model definitions match resolved Q1–Q8 + Gaps 1–6
- All FK cross-references are consistent (every `@relation` has a matching reverse)
- All enum usages are correct (no stale `MembershipRole` references)
- `@@unique` / `@@index` constraints are sensible

Flag issues before writing any code.

### Phase 2 — Schema rewrite (Cody, single task)

Rewrite `apps/web/prisma/schema.prisma`:

- Keep Dirstarter template models (User core shape, Session, Account, Verification, Tool, Category, Tag, Report, Ad) intact
- Replace all Ronin Dojo models with S1 design doc definitions
- Remove `MembershipRole` enum
- Add all new enums (17 new + 1 existing `CertificationType`)
- Add all new models (21 changes per summary list)

### Phase 3 — Migration (Cody, sequential after Phase 2)

1. `dropdb ronindojo_dev && createdb ronindojo_dev`
2. `bun db:migrate dev` (or `npx prisma migrate dev --name s1-schema-rev`)
3. `npx prisma generate`

### Phase 4 — Reference updates (Cody, can parallelize across files)

- `lib/authz.ts` — rename School→Organization, MembershipRole→Role table queries, Belt→Rank, canEditSchool→canEditOrganization, canAwardBelt→canAwardRank, canViewSchoolRoster→canViewOrgRoster
- `middleware.ts` — minimal (only has a comment referencing BBL)
- Any other files with stale model name imports

### Phase 5 — Verify (Cody, sequential)

- `npx prisma generate` (clean)
- `tsc --noEmit` (clean or only pre-existing errors)

### Phase 6 — Doc updates (Cody, parallel-safe)

- Update `data-model.md` to match new naming

---

## Persona assignments

| Phase | Persona | Notes |
|---|---|---|
| 1 | Petey | Review only, no code |
| 2–5 | Cody | Execute sequentially |
| 6 | Cody | Can run after Phase 5 |

No parallel worktrees needed — this is a single-branch, single-migration task. The phases are sequential because Phase 3 depends on Phase 2, Phase 4 depends on Phase 3 (generated client types), and Phase 5 validates everything.

---

## What landed

- **Full S1 schema rewrite** — `schema.prisma` rewritten from ~450 lines to ~1080 lines. 31 models, 18 enums, all relations cross-referenced and validated.
- **Migration successful** — `prisma db push` clean (1.03s), `prisma generate` clean (768ms). Shadow DB issue documented (use `db push` for dev, not `migrate dev`).
- **`authz.ts` updated** — 3 functions renamed (School→Organization, Belt→Rank, SchoolRoster→OrgRoster), all Role queries switched from enum to table joins.
- **TypeScript clean** — `tsc --noEmit` passes (only pre-existing Dirstarter template errors).
- **ChatGPT divergence resolved** — 5 divergent commits from phone session evaluated. Doc commits cherry-picked (`ce5c0a2`), schema/seed commits discarded, force-pushed to `origin/main`.
- **Enum vs table decision confirmed** — detailed analysis produced; tables win for multi-role correctness + brand extensibility.
- **Ubiquitous language glossary created** — all 31 model terms defined with legacy name mappings and naming rules.
- **LLM Wiki bootstrapped** — JETTY 3.0 annotation standard, 4 templates (concept/file/decision/runbook), master index, `passport-and-shells.md` retrofitted with full frontmatter.

## Files touched

| File | Note |
| --- | --- |
| `apps/web/prisma/schema.prisma` | Full S1 rewrite — 31 models, 18 enums |
| `apps/web/lib/authz.ts` | 3 functions renamed, Role table joins |
| `docs/architecture/ubiquitous-language.md` | New — domain glossary, 31 terms |
| `docs/knowledge/wiki/concepts/passport-and-shells.md` | Retrofitted with JETTY 3.0 frontmatter + mermaid diagram |
| `docs/knowledge/wiki/index.md` | New — master wiki index |
| `docs/knowledge/JETTY_3.0.md` | New — annotation standard |
| `docs/knowledge/templates/_template-concept.md` | New — concept page template |
| `docs/knowledge/templates/_template-file.md` | New — file annotation template |
| `docs/knowledge/templates/_template-decision.md` | New — decision page template |
| `docs/knowledge/templates/_template-runbook.md` | New — runbook template |
| `docs/knowledge/README.md` | Cherry-picked from ChatGPT, existing |
| `docs/knowledge/wiki/concepts/passport-and-shells.md` | Cherry-picked + expanded |
| `CLAUDE.md` | Cherry-picked from ChatGPT |
| `docs/sprints/SESSION_0004.md` | This file |

## Decisions resolved

- **Enum vs table for roles**: Tables win. Multi-role correctness (avoiding duplicate Memberships) is decisive. `Role` and `TournamentRole` are tables with `isSystem` + `brand` columns.
- **ChatGPT schema discarded**: Phone-session schema used wrong patterns (kept MembershipRole enum, missing ~10 models). Only docs cherry-picked.
- **`prisma db push` for dev**: Shadow DB hangs `migrate dev`. Use `db push --accept-data-loss` until `shadowDatabaseUrl` is configured.
- **JETTY 3.0 adopted**: Lean annotation standard for LLM Wiki pages. YAML frontmatter with health scores, backlinks, wiring info.

## Open decisions / blockers

- **Shadow DB config** — need `shadowDatabaseUrl` in `.env` before `prisma migrate dev` works (required for production migration history)
- **Seed file** — needs full rewrite using Role/TournamentRole table pattern (ChatGPT's version used wrong enums)
- **`data-model.md`** — still uses old naming (School, Style, Belt, Profile); needs alignment
- **`plan-vs-current.md`** — stale after S1 rewrite, needs refresh
- **Wiki backlinks** — existing `docs/architecture/` files not yet retrofitted with JETTY 3.0 frontmatter
- **MD025 lint warnings** — YAML `title:` + `# Title` triggers markdownlint MD025. Consider disabling for wiki pages or dropping the H1.

## Next session

**Goal:** Write seed file with all system defaults, update `data-model.md`, configure shadow DB.

**Inputs to read:**

- `docs/sprints/SESSION_0004.md` (this file)
- `apps/web/prisma/schema.prisma` (for seed data shape)
- `docs/knowledge/JETTY_3.0.md` (for any new wiki pages created during seed work)

**First task:** Write `apps/web/prisma/seed.ts` — seed 7 disciplines, rank systems, Role defaults (STUDENT/INSTRUCTOR/OWNER/COACH/ORG_ADMIN/STYLE_APPROVER), TournamentRole defaults, GamificationEventType defaults, SubscriptionTier defaults.

---

## Reflections

This was a high-complexity session with an unexpected fork: ChatGPT pushed 5 commits from a phone session while we were mid-schema-rewrite. The right call was to evaluate honestly (tables > enums for multi-role), cherry-pick the useful docs, and force-push. The enum-vs-table analysis was the most valuable artifact — it's a decision that would have been painful to reverse later.

The JETTY 3.0 standard and wiki index are a force multiplier. Every future session now has a canonical place to register what it produced, and agents can assess page health at a glance. The frontmatter contract (`health`, `needs_fix`, `wiring`, `backlinks`) gives structure to what was previously just "scattered markdown files."

Key learning: `prisma migrate dev` hangs on Postgres.app because shadow DB creation requires superuser-like permissions. `prisma db push` is the right tool for local dev iteration. Shadow DB config is a prerequisite for formal migration history before production.

Commits this session: `ce5c0a2` (cherry-pick docs), `766ea0f` (schema rewrite + authz), plus upcoming wiki/JETTY commit.
