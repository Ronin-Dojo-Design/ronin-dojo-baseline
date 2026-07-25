---
title: "SESSION 0678 — v0 client preview area on apps/rdd (env-gated, deploy-gated) (auto lane, wave 13/14)"
slug: session-0678
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0678
sprint: S12
lane: rdd
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0678 — v0 client preview area on apps/rdd (env-gated, deploy-gated) (auto lane, wave 13/14)

> Staged by the SESSION_0635 orchestrator (waves 13+14, operator-directed). Adopt at lane start:
> flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0678-rdd-client-preview-v0`.

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

v0 client preview area on apps/rdd (env-gated, deploy-gated).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0678_TASK_01 | done | `middleware.ts` Basic Auth gate scoped to `/clients/*`, fail-closed (404) when env unset |
| SESSION_0678_TASK_02 | done | `/clients` neutral index — no client names, back-link to `/` |
| SESSION_0678_TASK_03 | done | `/clients/mammoth` — status page (CRM/site/SEO/automations research/deck/3D prototype) + documents section (mailto CTAs) |
| SESSION_0678_TASK_04 | done | `/clients/bbl` — status page (technique graph/curriculum journey/inbox module) + real `/app/state` link |
| SESSION_0678_TASK_05 | done | noindex/nofollow via `app/clients/layout.tsx` `metadata.robots`, inherited by all three pages |
| SESSION_0678_TASK_06 | done | gates: typecheck, build, dev smoke (404-without-env / 401-without-creds / 200-with-creds) |

## What landed

**v0 of the client preview area** — an honest stopgap so Michael (Mammoth) and Tony (BBL) have
something to look at today, while the real portal is specced in the parallel 0677 lane.

- `apps/rdd/middleware.ts` (new) — HTTP Basic Auth against `CLIENT_PREVIEW_USER` /
  `CLIENT_PREVIEW_PASS`, matcher scoped to `/clients/:path*` only (root `/` and every other route
  are untouched — verified live). **Fail-closed by omission**: either env var unset → every
  `/clients/*` route 404s, identical to a route that doesn't exist, so a missing env var can
  never leak this area. Runs on the Edge runtime (Next's middleware default) — no Node
  `crypto`/`Buffer`; decodes the `Authorization` header with `atob`.
  - **Honesty note, also in the file's own header comment**: this is preview-grade access
    control, not real auth — one shared credential pair for every client, no sessions, no
    per-client scoping, no audit trail, non-timing-safe string comparison. It is Phase-0
    scaffolding that the 0677 spec's Phase 1 replaces outright, not extends.
  - Next.js 16.2.9 prints a build-time deprecation warning: *"The 'middleware' file convention is
    deprecated. Please use 'proxy' instead."* Build still succeeds (exit 0) and the gate works
    correctly at runtime — left as `middleware.ts` because that's the filename this lane was
    explicitly scoped to write; renaming to `proxy.ts` is a natural fold-in for whichever lane
    replaces this gate.
- `apps/rdd/app/clients/layout.tsx` (new) — segment-scoped `metadata.robots = { index: false,
  follow: false, nocache: true }`, inherited by `/clients`, `/clients/mammoth`, `/clients/bbl`.
  Does not touch the owned root `app/layout.tsx`.
- `apps/rdd/app/clients/_components/client-status-page.tsx` (new) — the shared status-page shell
  (phase summary / delivered-work grid with `Live`/`In review` badges only / optional
  documents-with-mailto section / optional extra-links slot / contact CTA), styled from the
  existing `app/globals.css` tokens (`bg-bg`, `text-ink`, `text-muted`, `bg-surface`,
  `border-border`, `text-primary`) and mirroring `app/page.tsx`'s section language — read-only,
  never edited.
- `apps/rdd/app/clients/page.tsx` (new) — neutral index, no client names, per the lane spec.
- `apps/rdd/app/clients/mammoth/page.tsx` (new) — "Mammoth Build × Ronin Building Design." Six
  delivered-work areas per the lane spec (CRM, site, SEO, automations research, deck, 3D
  prototype). **All six default to `In review`** — see "Honest-limits note" below for why, rather
  than guessing a Live/In-review split I couldn't verify. Documents section: State of the
  Building / pitch deck / pricing one-pager, each a `mailto:welcome@ronindojodesign.com` link
  with a per-document subject line, note text "Available at your review meeting." No numbers, no
  prices, no fabricated URLs — the artifacts are not web-hosted.
- `apps/rdd/app/clients/bbl/page.tsx` (new) — "Black Belt Legacy." Three delivered-work areas:
  technique graph (`Live` — genuinely public at `/techniques/graph`, still `beta`-labeled pending
  GA per goals-ledger G-022), curriculum journey (`In review` — Wave 3 item on G-013, not yet
  landed), inbox module (`In review` — G-024, tracked lanes staged, no component landed yet per
  the ledger). A "Live views" section links to the real `https://blackbeltlegacy.com/app/state`
  route with an explicit "BBL sign-in required" badge — this is the one non-mailto external link
  on either page, and it resolves to a route that actually exists (verified in
  `apps/web/app/app/state/page.tsx`, read-only).

## Honest-limits note

- **Mammoth's six areas are all `In review`, not a mix of `Live`/`In review`.** I read
  `docs/product/mammoth-build/{CONTEXT,PRD,OPERATING_SYSTEM,BRAND_HEART_BEAT,STORIES}.md`,
  `docs/business/leads/mammoth-build-michael-flores.md`,
  `docs/business/leads/project-mammoth-build-crm.md`, and the goals-ledger's Mammoth rows
  (G-017/G-019/G-021). None states a definitive per-area Live/In-review split for CRM / site / SEO
  / automations research / deck / 3D prototype, and the one concrete signal (G-019: the Mammoth
  landing "was briefly live on BBL prod" and was taken **off**) argues against marking anything
  `Live` without confirmation. Defaulting to `In review` everywhere is the conservative,
  non-overclaiming read — **this needs an operator pass on the actual per-area status before
  Michael sees this page** (also flagged inline in the page's own header comment).
- **"State of the Building" AREAS (CRM, site, SEO, automations research, deck, 3D prototype) and
  the BBL items (technique-graph wave, curriculum journey, inbox module) came from the dispatch
  prompt itself** — a `deck`/`pitch deck`/`3D prototype`/`pricing one-pager`/`automations
  research` keyword search across `docs/` returned no hits, so those artifacts likely exist
  outside this repo (Figma/Blender/slides). Nothing about them was invented beyond the generic
  "available at your review meeting" framing the lane spec itself supplied.
- **`/app/state/bbl` doesn't exist as a literal route** — `apps/web/app/app/state/page.tsx` has no
  `[brand]` dynamic segment; it's one global `/app/state` view. Linked to the real
  `https://blackbeltlegacy.com/app/state` (BBL's production domain, confirmed via the existing
  `blackbeltlegacy.com` link already live on `apps/rdd/app/page.tsx`) rather than a path that
  would 404.

## Files touched

| File | Change |
| --- | --- |
| `apps/rdd/middleware.ts` | new — Basic Auth gate, `/clients/*` only, fail-closed on missing env |
| `apps/rdd/app/clients/layout.tsx` | new — segment-scoped `noindex, nofollow, nocache` metadata |
| `apps/rdd/app/clients/page.tsx` | new — neutral `/clients` index |
| `apps/rdd/app/clients/mammoth/page.tsx` | new — Mammoth status page |
| `apps/rdd/app/clients/bbl/page.tsx` | new — BBL status page |
| `apps/rdd/app/clients/_components/client-status-page.tsx` | new — shared status-page shell |
| `docs/sprints/SESSION_0678.md` | this file — adopted + closed out |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `bun run --filter rdd typecheck` | exit 0 |
| `bun run --filter rdd build` | exit 0 — Turbopack build; route table shows `○ /clients`, `○ /clients/bbl`, `○ /clients/mammoth`, `ƒ Proxy (Middleware)`; one deprecation warning (middleware→proxy convention, see above), no errors |
| Dev smoke — `npx next dev --turbo -p 3152`, **no env creds set** | `/clients` → 404, `/clients/mammoth` → 404, `/clients/bbl` → 404, `/` (root) → 200 — confirms fail-closed default and confirms the gate doesn't touch the rest of the app |
| Dev smoke — same server, **`CLIENT_PREVIEW_USER`/`CLIENT_PREVIEW_PASS` set for the dev process only**, no `Authorization` header | `/clients/mammoth` → 401 with `WWW-Authenticate: Basic` |
| Dev smoke — correct `-u previewtest:s3cr3t-test` | `/clients` → 200, `/clients/mammoth` → 200, `/clients/bbl` → 200 |
| Dev smoke — wrong password, then wrong username | both → 401 |
| Dev smoke — response-body spot check (authed) | `<meta name="robots" content="noindex, nofollow, nocache"/>` present; `<title>Mammoth Build · Ronin Dojo Design</title>`; BBL page contains `blackbeltlegacy.com/app/state`; Mammoth page contains three `mailto:welcome@ronindojodesign.com?subject=Requesting…` links | 
| Server teardown | both dev instances killed, port 3152 confirmed free after each |

## Proposed ledger edits

- **Pointer, not a new row**: this v0 gate and its three pages are explicitly superseded by the
  **0677 portal program** (real per-client accounts, real auth, real artifact hosting) — whoever
  merges/continues 0677 should treat `apps/rdd/middleware.ts` and everything under
  `apps/rdd/app/clients/` as the thing Phase 1 replaces, not extends. No goals-ledger row opened
  here; route this note into whatever tracking 0677 already has.

## Open decisions / blockers

- Mammoth's per-area Live/In-review split (see "Honest-limits note") needs an operator call
  before this page is shown to Michael.
- Next.js 16's `middleware.ts` → `proxy.ts` rename is a real, current deprecation (build-time
  warning, not yet an error) — worth folding in whenever this gate is next touched.

## Residual for AM merge

1. **Set `CLIENT_PREVIEW_USER` / `CLIENT_PREVIEW_PASS` in the Vercel `rdd` project env BEFORE
   merge.** Without them, every `/clients/*` route 404s post-deploy — safe by design, but it means
   the feature is invisible until those two env vars are set.
2. **Operator content review** — confirm the Mammoth per-area statuses (currently all
   conservative `In review`) and the BBL statuses/notes read accurately before either client is
   sent a link.
3. **Deploy gate** — merging this PR auto-deploys prod `ronindojodesign.com` (per `vercel.json`'s
   `ignoreCommand`, `apps/rdd` changes trigger a deploy). Confirm the two env vars from (1) are in
   place first, or the merge will ship a 404'd feature (safe, but pointless) rather than a broken
   one.

