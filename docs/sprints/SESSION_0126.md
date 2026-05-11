---
title: "SESSION 0126 — Seed Enrichment QA Data + Passport Profile Editor"
slug: session-0126
type: session
status: closed-quick
created: 2026-05-11
updated: 2026-05-11
last_agent: copilot-session-0126
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0125.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0126 — Seed Enrichment QA Data + Passport Profile Editor

## Date

2026-05-11

## Operator

Brian Scott + Copilot (Petey → Cody)

## Status

in-progress

## Failed Steps / Drift Check

- FS-0001 (component inventory gate): **active** — must read `dirstarter-component-inventory.md` before any new UI code.
- Carried blocker: 🔴 Resend domain DNS pending verification — 12th session carried.

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None — seed file extension + potential new server action |
| Extension or replacement | Extension (seed data + Passport profile improvements) |
| Why justified | Completing QA data gap identified in SESSION_0125 hostile review |
| Risk if bypassed | VideoCarousel and MemberCarouselByRank render empty; no visual QA proof |

## Graphify Check

- Graph refreshed in SESSION_0125 (91 nodes, 266 edges, 618 communities). No new code files added yet — **graph is current**.
- Skipping graphify update per operator instruction.

## Goal

1. Seed ContentAtom + ContentVariant records with `videoUrl` for ≥3 disciplines so `VideoCarousel` renders populated.
2. Ensure existing seed users have correct rank assignments on Memberships for `MemberCarouselByRank` to populate.
3. Visual QA: confirm both carousels render on `/disciplines/bjj`.
4. (Stretch) Scope Passport profile editor improvements per L2 spec §2.

---

## Task Plan (Petey)

### Analysis of current seed state

**What exists:**
- 5 test users: Sensei Demo (PUBLIC/ACTIVE/BJJ/Blue belt), Student Alpha (PUBLIC/ACTIVE/BJJ/White belt), Student Beta (MEMBERS_ONLY/ACTIVE/Eskrima/L3), Ghost User (HIDDEN/ACTIVE/Muay Thai/no rank), Pending Patty (PUBLIC/PENDING/BJJ/no rank)
- Memberships with `rankId` set for 3 of 5 users
- No `ContentAtom` or `ContentVariant` records exist at all

**What's missing for carousels:**
- `ContentAtom` records scoped to disciplines (bjj, muay_thai, eskrima)
- `ContentVariant` records with `videoUrl` (needed for `findDisciplineVideos`)
- Muay Thai user (Ghost) has HIDDEN visibility — need ≥1 PUBLIC Muay Thai member with rank for that carousel

### Task breakdown

| Task | Scope | Details |
| ---- | ----- | ------- |
| TASK_01 | **Seed ContentAtom + ContentVariant (video)** | Create ≥3 ContentAtom records (one per discipline: bjj, muay_thai, eskrima). Each atom gets 1–2 ContentVariant records with `videoUrl` + `thumbnailUrl` populated. Use `createdById` = Sensei Demo user. Channels: `YOUTUBE_LONG` or `YOUTUBE_SHORT`. |
| TASK_02 | **Fix Muay Thai member visibility gap** | Ghost User is the only Muay Thai member but has HIDDEN visibility. Add a new test user "Muay Thai Mike" with PUBLIC visibility, ACTIVE membership in Muay Thai discipline, and a rank assignment. This ensures MemberCarouselByRank has data for all 3 disciplines. |
| TASK_03 | **Visual QA** | `bun run dev`, browse `/disciplines/bjj`, confirm VideoCarousel + MemberCarouselByRank render with data. Screenshot or confirm in session log. |
| TASK_04 | **Type check** | `bun run typecheck` — 0 errors expected. |
| TASK_05 | **Scope Passport editor** | (Petey stretch) Read L2 spec §2, current Passport model, and inventory. Produce plan for next session if time remains. |

### Open Decisions — Resolved by Petey

1. **ContentAtom `canonicalId` format** → Follow existing pattern: `atom-2026-{topic}-{NNN}`. e.g. `atom-2026-bjj-basics-001`. **Resolved.**
2. **Video URLs for seed** → Use placeholder YouTube URLs (e.g. `https://www.youtube.com/watch?v=dQw4w9WgXcQ`) — these are seed-only, not production. **Resolved.**
3. **ContentAtom `createdById`** → Use Sensei Demo user (must query by email after creation). **Resolved.**

## First Task

TASK_01 — Seed ContentAtom + ContentVariant records in `seed.ts`.

## Task Log

- SESSION_0126_TASK_01 — ✅ done (4 ContentAtom + 5 ContentVariant with videoUrl seeded for bjj, muay_thai, eskrima)
- SESSION_0126_TASK_02 — ✅ done (Muay Thai Mike: PUBLIC/ACTIVE/ranked user added)
- SESSION_0126_TASK_03 — ✅ done (Visual QA: VideoCarousel shows 3 videos, MemberCarouselByRank shows 2 members, Related Content shows 2 atoms)
- SESSION_0126_TASK_04 — ✅ done (tsc 0 errors)
- SESSION_0126_TASK_05 — deferred to SESSION_0127

## What Landed

- ✅ 4 ContentAtom records seeded (2 BJJ, 1 Muay Thai, 1 Eskrima) with 5 ContentVariant records containing videoUrl + thumbnailUrl
- ✅ "Muay Thai Mike" test user with PUBLIC DirectoryProfile, ACTIVE Membership, and Prajioud rank
- ✅ Visual QA: `/disciplines/bjj` renders all 7 enrichment sections with data (Videos, Members by Rank, Related Content all populated)
- ✅ Type check passes

## Files Touched

- `apps/web/prisma/seed.ts` — added ContentAtom/ContentVariant video seed data + Muay Thai Mike user
- `apps/web/components/web/techniques/technique-filters.tsx` — removed Prisma runtime enum import (client component can't import Node.js modules); inlined enum values
- `package.json` — fixed pnpm filter: `--filter web` → `--filter dirstarter`
- `docs/sprints/SESSION_0126.md` — this file

## Decisions Resolved

- ContentAtom canonicalId format: `atom-2026-{topic}-{NNN}`
- Video URLs: placeholder YouTube URLs for seed data
- ContentAtom createdById: Sensei Demo user (queried by email)

## Open Decisions / Blockers

- 🔴 Resend domain DNS pending verification — 12th session carried
- 🟡 Passport profile editor scope — deferred to SESSION_0127

## Next Session

**Goal:** SESSION_0127 — Passport profile editor (view + edit form for authenticated user)

**Inputs to read:**

- `docs/architecture/source/chatgpt-original-plan.md` §2 — Passport spec
- `docs/knowledge/wiki/dirstarter-component-inventory.md` — form components
- `apps/web/server/web/disciplines/queries.ts` — pattern reference for server queries
- Current Passport model in schema

**First task:** Scope the Passport profile editor: what fields are editable, which Dirstarter form components to use, where the page lives in the app router.
