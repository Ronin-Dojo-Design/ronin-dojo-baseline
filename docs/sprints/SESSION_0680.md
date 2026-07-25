---
title: "SESSION 0680 — /process feature page — agent-OS showcase (pipeline SVG, roster, craft copy) (auto lane, wave 13/14)"
slug: session-0680
type: session--implement
status: done
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0680
sprint: S12
lane: rdd
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0680 — /process feature page — agent-OS showcase (pipeline SVG, roster, craft copy) (auto lane, wave 13/14)

> Staged by the SESSION_0635 orchestrator (waves 13+14, operator-directed). Adopt at lane start:
> flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0680-rdd-process-page`.

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

/process feature page — agent-OS showcase (pipeline SVG, roster, craft copy).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0680_TASK_01 | done | Build `/process` — agent-OS showcase page (pipeline visual, roster, craft copy) |

## What landed

`apps/rdd/app/process/page.tsx` — the public "how we build" page on `ronindojodesign.com`, standing
alone (no nav/layout edits — layout.tsx/page.tsx are frozen per lane scope):

- **Hero** — the one-platform / industry-editions thesis restated in process terms ("One platform.
  Many industry editions. Built the same way.") plus a light `← Ronin Dojo Design` breadcrumb back
  to `/` (self-contained on this page, no shared-nav dependency).
- **Pipeline** (`_components/pipeline.tsx`) — Plan → parallel build lanes → Gates → Independent
  review → Human approval (visually emphasized, primary-ring card) → Ship. Built as CSS-grid stage
  cards (real, crawlable DOM text — not an image) with small decorative connector SVGs
  (`aria-hidden`) drawing the fan-out (1→3) and converge (3→1) shape explicitly requested. The
  human-approval connector renders in the primary accent to carry "that human gate is the story."
- **Roster** — Petey/Cody/Doug/Desi/Giddy/Brandon/Larry/Iggy with one-liners, framed as "our senior
  team, on demand," plus one tight paragraph on the customization angle (brand-specific crews, e.g.
  a construction client's own roster) — phrased as the *model*, not a claim that a named crew
  already ships.
- **Discipline** — gated / reviewed independently / evidence-logged / human sign-off as a 4-card
  grid, plus the "what would Apple do" design-law paragraph and a closing answer-shaped statement
  ("gated, reviewed by people other than the one who built it, logged, shipped only after a human
  approves it").
- **SEO/GEO** — page-local `metadata` export (title/description/OG/twitter/canonical; layout's `%s ·
  Ronin Dojo Design` template applies), semantic h1→h2→h3 hierarchy, and answer-shaped declarative
  sentences throughout (quotable "what/how/who" statements) rather than any prompt-injection-style
  SEO trick.
- **Footer CTA** → `welcome@ronindojodesign.com` (mailto, matches home page's exact button markup).
- **No-numbers compliance** — no lane/PR/reviewer counts, no hours, no percentages, no token costs
  anywhere in copy; qualities expressed as words ("gated," "evidence-logged," "on the record")
  instead. One clearly-marked HTML comment in `page.tsx` (Discipline section) notes where
  operator-ratified numbers could later slot in as a 5th discipline card — not added here.
- No client name other than **BBL** appears (BBL isn't named on this page at all — it wasn't needed
  for the copy that landed).

## Files touched

| File | Change |
| --- | --- |
| `apps/rdd/app/process/page.tsx` | New — the `/process` route: hero, pipeline section, roster section, discipline section, contact CTA, footer. Own `metadata` export. |
| `apps/rdd/app/process/_components/pipeline.tsx` | New — `Pipeline` component: stage cards + decorative fan-out/converge/arrow connector SVGs. |
| `docs/sprints/SESSION_0680.md` | This file — adopted (`status: staged` → `done`) and closed out. |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `bun run --filter rdd build` | Exit 0. Route table shows `└ ○ /process` (static). TypeScript ran inline as part of the Next build and passed. |
| `bun run --filter rdd typecheck` | Exit 0. |
| `npx oxlint apps/rdd/app/process/page.tsx apps/rdd/app/process/_components/pipeline.tsx` | Exit 0 (ad-hoc — no `lint` script wired for `apps/rdd` in `package.json`, so this isn't a repo-enforced gate, just an extra check). |
| Dev smoke — `npx next dev --port 3153` (apps/rdd), `curl localhost:3153/process` | `HTTP_STATUS=200`. Body contains `<title>How we build · Ronin Dojo Design</title>`, marker strings `"How we build"` and `"Human approval"` both present. Server killed after the check (`pkill`, confirmed port 3153 clear). |

## Proposed ledger edits

- **Pointer for the goals ledger**: the Ronin-bots / per-brand-crew concept (agent-OS
  customization — "your brand gets its own crew") needs a goals-ledger row once the parallel
  Ronin-bots doc lands (referenced but not owned by this lane). This page's roster section already
  carries the public-facing one-paragraph version; the ledger row should point back here
  (`apps/rdd/app/process/page.tsx`, "Your brand gets its own crew" heading) as the shipped surface
  once merged.
- No other ledger edits proposed — this lane touched only the new route dir + this SESSION file, no
  wiring/drift/failed-step findings surfaced during the build.

## Open decisions / blockers

- None blocking. Copy choices (hero wording, roster one-liners, discipline framing) are this lane's
  best-effort match to the operator's dictated brief + the home page's established voice — flagged
  for operator sign-off below, not a blocker to opening the PR.

## Residual for AM merge

- **Operator copy sign-off required** — hero thesis wording, roster one-liners (esp. Larry/legal and
  Iggy/social, which have no `docs/agents/*.md` file yet, only the names+roles given in this lane's
  dispatch), and the "Your brand gets its own crew" paragraph should get an explicit read before
  merge.
- **Desi (design review) pass** — this lane built to visually match `app/page.tsx` (`Section`
  pattern, button/card markup, token classes) but no independent design-review pass ran in-lane.
- **Deploy gate** — merging this PR auto-deploys prod `ronindojodesign.com` (RDD's
  `vercel.json` `ignoreCommand` triggers on any `apps/**` change). Do not merge without confirming
  that's intended for this content.
- **Nav-link follow-up** — `/process` currently has no inbound link from the site (layout/home nav
  is frozen for this lane, and PR #274's footer work is still pending). Once that footer merges, add
  a `/process` link there — tracked here as a pointer, not built in this lane.

