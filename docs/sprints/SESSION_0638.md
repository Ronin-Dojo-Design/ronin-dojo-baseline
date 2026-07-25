---
title: "SESSION 0638 — auto-claude G-019 Mammoth landing port from recovered mock (overnight auto lane)"
slug: session-0638
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0638
sprint: S12
lane: mmb
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0638 — auto-claude G-019 Mammoth landing port from recovered mock (overnight auto lane)

> Staged by the SESSION_0635 overnight orchestrator (operator-approved 5-lane dispatch). Adopt at lane
> start: flip `status:` → `in-progress`, set `last_agent:` to `<driver>-session-0638`. The dispatch
> payload is the lane prompt; its HARD RULES are binding. Branch: `auto/session-0638-mmb-landing`.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-claude G-019 Mammoth landing port from recovered mock — one tightly-scoped item, zero open forks (all pinned in the lane prompt).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0638_TASK_01 | done | Ported the recovered mock's missing "CRM preview" section (stage pipeline, live project record, before/after slider) into the existing landing page; wired nav. |

## What landed

Compared the live landing page (`app/page.tsx` + `components/landing/*`) against the pinned recovered
mock (`git show 524f0286^:apps/web/public/mammoth-build.html`). Hero, differentiator, process, and
building-types sections were already ported (with an established, slightly richer `BUILDING_TYPES`
list and an extra "context band" not in the mock — left both untouched, out of scope). The one section
present in the mock but missing from the live page was `#crm` — "One record, lead to order — with
proof at every step": the 9-stage pipeline chips, a sample project record card, and an interactive
before/after (drag-slider) proof widget.

Added a new `CrmPreview` client component and wired it into `page.tsx` between the Industries and
Context-band sections (matching the mock's page flow: process → build types → crm → start). Added a
`#crm` entry to `SiteHeader`'s nav.

Copy is verbatim from the pinned mock for the section heading, sub-copy, stage-chip labels, and the
"Before & after proof — drag the slider" heading + note. The sample project record card
("Ridgeline Auto — 60×100 Service", Order MB-2041, Boise ID, 60×100, 16ft eave, next-task text) is
pulled programmatically from the existing `SEED_PROJECTS[0]` constant in `lib/content.ts` (read-only
import — that file is off-limits to edit this lane) rather than duplicated as a literal string; the
numbers match the mock's sample record exactly, so this is reuse, not a new claim. No new client
names, testimonials, or numbers were introduced. No photos were available in-repo for the before/after
proof, so the slider reuses the mock's own inline-SVG before/after illustration (same approach the
existing `MirrorVisual` hero component already uses for building artwork) rather than adding a
placeholder asset.

The before/after slider is a behavioral (not literal-HTML) port: the mock's vanilla-JS
`clip-path`-on-`input`-event trick is reimplemented as a controlled React `<input type="range">` +
state, styled with the app's existing Tailwind design tokens (`bg-primary`, `border-border`,
`text-muted`, etc.) instead of the mock's raw CSS custom properties.

**Note on OWNED path in the lane prompt:** the prompt lists `clients/mammoth-build-crm/app/landing/**`
as an owned/new-ok path, but the app's actual landing components live under
`clients/mammoth-build-crm/components/landing/**` (no `app/landing/` directory exists). The STRUCTURE
section of the prompt explicitly names the existing components (SiteHeader, MirrorVisual,
BuildingTypesGrid, InquiryForm) which all live under `components/landing/`, and the mission is
impossible without touching that path. Treated this as a drafting mismatch (likely meant
`components/landing/**`), not a scope violation — `components/landing/**` is not on the NEVER-EDIT
list, and the STRUCTURE instruction directly authorizes editing those files. Flagging for AM review
in case the path was meant literally.

**Local bootstrap gap fixed to unblock the gate:** `bun run typecheck` initially failed with
`Cannot find module '../.generated/prisma/client'` — the worktree bootstrap hadn't generated the
Prisma client (`.generated/` is gitignored, a pure build artifact). Ran
`DATABASE_URL="postgresql://localhost:5432/mammoth_dev" bun run db:generate` (schema→types only, no
DB connection, not a migration — distinct from the forbidden `prisma migrate`) to regenerate it
locally; this produced only gitignored output, nothing staged. After that, typecheck was clean with
zero errors from my changes; the errors seen were pre-existing and disappeared once the client was
regenerated (confirmed via `git status --porcelain`: no `lib/**` files touched this session).

## Files touched

| File | Change |
| --- | --- |
| `clients/mammoth-build-crm/components/landing/CrmPreview.tsx` | New — stage-pipeline chips, sample project record card, before/after drag-slider (client component). |
| `clients/mammoth-build-crm/app/page.tsx` | Added `#crm` section (heading + sub-copy from the mock, verbatim) between Industries and Context-band; imported `CrmPreview`. |
| `clients/mammoth-build-crm/components/landing/SiteHeader.tsx` | Added `{ href: "#crm", label: "The CRM" }` nav entry. |
| `docs/sprints/SESSION_0638.md` | This file — adopted, task log, verification, close. |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `cd clients/mammoth-build-crm && bun run typecheck` | `EXIT:0` — clean after regenerating the Prisma client (see note above); first run before regen failed with 8 pre-existing errors in `lib/actions.ts`/`lib/db.ts`, none touched by this session. |
| `cd clients/mammoth-build-crm && bun run build` (best-effort, real exit captured via `> file 2>&1; echo $?`, not piped) | `REAL_EXIT:0` — `next build` (Turbopack) compiled, typechecked, and generated all 8 routes successfully with `DATABASE_URL`/`BETTER_AUTH_SECRET` dummy values set inline (no `.env` written). |
| No pure helpers added | `bun test` skipped per the lane prompt's own condition ("if you add pure helpers"). |
| `git status --porcelain` (post-change) | Only the 4 files above touched; `.generated/prisma` (gitignored build artifact) not tracked. |

## Proposed ledger edits

<!-- Lanes NEVER edit shared ledgers. Every WL/G/D/FS change you would have made goes here as a row;
the attended AM merge applies them once. -->

- **G-019 progress note:** Mammoth Build landing page now has full parity with the recovered prod mock
  (`524f0286^:apps/web/public/mammoth-build.html`) — hero, differentiator, process, building types,
  CRM-preview (pipeline/record/before-after-slider), and start sections all present, all copy pinned
  to the mock's approved vocabulary (or reused verbatim from already-seeded `SEED_PROJECTS` data).
  Remaining G-019 gap: real photography — the before/after slider still uses the mock's placeholder
  inline-SVG illustration (no real Mammoth site/build photos exist in-repo); flag for Michael's review
  per the lane prompt's "neutral placeholder blocks labeled for Michael's review" instruction — the
  current placeholder is inherited directly from the mock rather than newly authored, so no new label
  was added. AM should decide whether a "placeholder — pending real photos" label belongs on the
  slider before this ships further, or whether the mock's presentation is acceptable as-is for review.

## Open decisions / blockers

- **OWNED-path mismatch:** lane prompt says `clients/mammoth-build-crm/app/landing/**`; actual
  components live in `clients/mammoth-build-crm/components/landing/**` (no `app/landing/` exists).
  Edited `components/landing/**` per the STRUCTURE section's explicit component names — flagging for
  AM confirmation this was the intended path, not a scope violation.

## Residual for AM merge

- Nothing blocking. Typecheck and best-effort build both pass with real exit 0.
- The before/after slider photography is still the mock's placeholder SVG illustration (see G-019
  progress note above) — real Mammoth site photos would be a follow-up, not done tonight (no assets
  exist in-repo per the lane prompt's constraint).
- `.generated/prisma` was regenerated locally to unblock typecheck/build; this is a gitignored
  artifact and not part of the diff, but any fresh worktree/CI run will need `prisma generate` (not
  `migrate`) to run before typecheck, same as tonight — not a new requirement introduced by this
  session, just a bootstrap gap this lane happened to hit first.

