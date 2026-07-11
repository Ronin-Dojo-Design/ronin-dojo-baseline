---
title: "SESSION 0525 — BBL Design & Experience epic: plan → build → ship (5 streams + freemium) + finished Codex 0524 belt-backfill"
slug: session-0525
type: session--implement
status: closed
created: 2026-07-10
updated: 2026-07-11
last_agent: claude-session-0525
pairs_with:
  - docs/product/black-belt-legacy/design-experience-epic.md
  - docs/product/black-belt-legacy/BBL_PARITY_SPEC.md
  - docs/sprints/SESSION_0524.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0525 — BBL Design & Experience epic (plan → build → ship)

Started as a **Petey planning** session (grill + slice the operator's 5 design/experience streams), then
the operator said **"dispatch Cody builds"** and it became a full **build + ship** session — everything
below is **live on `blackbeltlegacy.com` and verified**. Mid-session the operator also handed off the
parallel **Codex SESSION_0524 WP-belt-backfill** ("ran out of credits before pushing") to finish; that is
applied + pushed too. Fired off `origin/main` @ `2bf6c06b`; closed at `a385f2ae`.

## What landed (all shipped to prod, verified)

**Planning (TASK_01):** discovery fan-out (5 Explore agents) + grill + the sliced plan
→ [`design-experience-epic.md`](../product/black-belt-legacy/design-experience-epic.md). Corrected the
dispatch note (globe: `DirectoryProfile.location*` exists; technique carousel greenfield; profile already
blueprinted by `BBL_PARITY_SPEC`; blog two-surface). Dozen roster grounded in the BJJ Heroes canonical list.

**Galaxy** (`session-0525-galaxy`) — A0 perf (65+ per-node `<Html>` DOM labels → billboarded `<Text>` + merged
edge `LineSegments`), A1 pmndrs `postprocessing` (UnrealBloom + ACESFilmic tone-mapping + HDR emissive +
vignette), A2 parallax starfield. **Doug SHIP 9.6** (real authenticated WebGL screenshot). Pre-GA follow-up:
self-host the troika label font.

**Directory / Profile** (`session-0525-profile` + freemium branch) — deleted the dead `/me` owner arm
(−1013 lines; `LineageRankHistoryTab` preserved). Public **Profile Highlights** rails (Tuff Buffs "Spotify
carousel" parity): Featured Matches + Podcasts + Technique reels. **Placeholder (unclaimed) profiles now
render the FULL profile** + a `ProfileClaimButton` (standard Button+Dialog → person-claim funnel; custom
`ProfileClaimTeaser` deleted). Profile **lineage = basic vertical timeline** (scrollytelling relegated to
`/app/beta/lineage-journey`), **white member names** (`text-foreground`, was brand-red), real avatars.

**Blog / Dozen** (`session-0525-blog-dozen`) — Dozen roster → the **five Machado-promoted** members
(Bob Bass first per his own account); community CTA → `/posts` + a live staff-`Post` blog gallery below it;
**6 articles live, all bylined Brian Scott** (4 legacy: Bob Bass / John Will / Dave Meyer + Renato standalone;
2 authored this session: Chris Haueter + Rick Williams).

**Technique browser** (`session-0525-technique`) — single-tag belt facet (`beltLevelMinId` exact match, not
the min/max range — operator KISS), per-belt video rails, **33 real YouTube technique videos** seeded from
the operator's 3 playlists (White 10 / Blue 7 / Purple 15). The "A\*\*hole Choke" (Bob's real move name,
semi-censored) with his backstory as the description.

**Profile media** — Bob/Dave/Chris **podcasts + Bob's 2 Márcio Feitosa match wins** seeded (external YouTube),
**public** (podcasts + Featured Matches are mission/funnel content, not gated).

**Technique freemium** (`session-0525-technique-freemium`) — `Technique.isPremium` (additive migration);
**6 free previews** (Brian's first 3 White + Bob's first 3 Purple), rest premium. Locks on browse cards
(media-bearing only), watch page, and the profile technique rail — **viewer-keyed** entitlement (reuses
`canRenderRichMedia`, not the owner's tier; one shared `isTechniqueViewerEntitled` resolver). CSP `frame-src`
now allows YouTube. **Doug SHIP 9.6** (×2 passes).

**Finished Codex SESSION_0524 belt-backfill** — 33 canonical-tree beltless members → IMPORTED `RankAward` +
VERIFIED `RankEntry`. Added a fail-closed `--override-rank` flag; operator directive: **Jerry C. Smith Jr.
BR0→BK0** (his WP record is a stale Brown; operator asserted Black out-of-band). Applied on live prod in one
serializable transaction (override fingerprint `24a78dd2…50b2c`): **RankEntry-VERIFIED 51→84, regressions
33→0, membership fallback 33→0, no-award 33→0.** Closes WL-P2-46's fallback dependency.

## Decisions resolved (operator, this session)

Epic §0: D1 proceed-now (additive schema OK) · D2 pmndrs postprocessing · D3 per-video free/premium · D4
Dozen = 5 Machado (Bob first) · D5 staff-blog gallery below community CTA. Sub (§8): O1 per-attachment /
per-video gating · O2 `three-globe` · O3 globe on `/app/beta/globe` · O4 Renato standalone. Plus, in build:
technique belt = **single tag** (not range); premium gating = **freemium with 3 free previews per author +
visible locks**; **podcasts + matches PUBLIC** (not premium-gated); Jerry = **Black Belt** (operator
override); profile lineage = **basic timeline + white names**; Brian's avatar = the you+Drew "Wolchek Academy"
photo.

## Task log

| Task                                     | Status  | Notes                                                                                                 |
| ---------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| SESSION_0525_TASK_01 (plan)              | landed  | Discovery + grill + sliced epic plan (`design-experience-epic.md`).                                   |
| SESSION_0525_TASK_02 (galaxy)            | shipped | `session-0525-galaxy`; Doug 9.6; live on `/app/beta/galaxy`.                                          |
| SESSION_0525_TASK_03 (profile)           | shipped | owner-arm delete + Profile Highlights + placeholder-full + claim button + basic timeline/white names. |
| SESSION_0525_TASK_04 (blog/dozen)        | shipped | roster→5, blog gallery, 6 articles (Brian Scott byline).                                              |
| SESSION_0525_TASK_05 (technique)         | shipped | belt facet + per-belt rails + 33 videos + a\*\*hole-choke backstory.                                  |
| SESSION_0525_TASK_06 (profile media)     | shipped | podcasts + Feitosa matches (public).                                                                  |
| SESSION_0525_TASK_07 (freemium)          | shipped | `Technique.isPremium` + 6 free previews + viewer-keyed locks; Doug 9.6.                               |
| SESSION_0525_TASK_08 (Codex 0524 finish) | shipped | belt-backfill applied on prod (Jerry override); 84 RankEntry-verified, 0 fallback.                    |

## Verification

- **Doug SHIP verdicts:** galaxy 9.6 (WebGL screenshot), freemium 9.6 ×2 (browse/watch/rail locks, placeholder
  full-profile, claim dialog). All via isolated Playwright chromium (worktree can't `preview_start`).
- **Codex backfill self-proved** (cross-axis probe, independent re-query) + Jerry BK0 verified on prod.
- **Live prod checks:** `bob-bass` full profile (not teaser) + claim button; `/techniques` premium badges;
  `a-hole-choke` lock + backstory; 6 articles rendering (Brian Scott byline); `brian-scott` white names +
  real avatars (Wolchek photo, Carlos Sr/Jr `.jpg`s). Prod data verified per seed.
- Gates green on every merge (typecheck + `next build`); the 5 pre-existing env test failures (Resend /
  shared-DB hook timeouts) are unrelated.

## Push / deploy

One session but **multiple operator-authorized pushes** (the operator drove a fast iterate-on-prod loop:
"green to push to main" + per-batch "go"s). `2bf6c06b → a385f2ae`. Prod schema migration
(`add_technique_is_premium`) auto-applied via `prebuild → migrate deploy`; prod data seeded via
`bun --env-file=.env.prod` (articles, 33 technique videos, podcasts/matches, freemium free-flags, Jerry
override, Brian avatar, bylines). `docs/product/black-belt-legacy/design-experience-epic.md` is the epic SoT.

## Next session — code-quality suite, THEN technique/podcast CRUD (operator direction)

**Phase 1 — quality pass over everything this session** (the code shipped fast with Doug runtime-verification
but without the standing quality loops). Run, over the session's diff (`2bf6c06b..a385f2ae`, or per-area):

- **`/fallow-fix-loop`** — CRAP / dupes / dead-code / complexity audit + fix + re-verify.
- **`docs/protocols/hostile-close-review.md`** — hostile close review of the shipped surfaces.
- **`/code-quality`** — score against the code-quality matrix; close the Apple/Facebook-grade gap.
- (`/pr-fix-loop` skipped — this landed on `main`, not as PRs; the above cover it.)
  Focus areas (net-new, highest-churn): `server/web/directory/profile-media.ts`, `profile-view.ts`,
  `technique-access.ts`, `profile-claim-button.tsx`, the freemium card/watch/rail surfaces, the seed scripts
  (`seed-bbl-technique-videos.ts`, `seed-bbl-profile-media.ts`, `seed-dirty-dozen-articles-2.ts`), and the
  `session-0524-wp-belt-backfill.ts` override addition.

**Phase 2 — technique / podcast / media CRUD** (add/improve/refine the authoring surfaces so the operator can
add techniques, podcasts, match videos, and more without seed scripts). Everything this session was seeded by
hand — the product need is member/admin CRUD. Recommended shape: a **code-review → plan** session (audit the
existing technique author form at `/app/techniques/new` + `technique-form.tsx` + `crud-actions.ts`, the media
attach seam, the podcast/match `purpose` model, and D5 belt-picker), **then implement/build** in the follow-up
(or code-review-plan-then-build in one if scoped small). Open sub-items feeding this: D5 belt `Select` on the
author form; per-`MediaAttachment` premium toggle UI; a podcast/match author control (currently seed-only).

## Open follow-ups (routed)

- **Content (operator):** the John Wilson / Bob Bass podcast (Brian + Bob) to slot in; expand the Rick Williams
  - Chris Haueter articles.
- **Claim-system unification** (tool email-OTP vs person `PassportClaimRequest`) — kept separate; a design
  decision if the operator wants one claim UX/backend.
- **Deferred epic waves:** Globe (Stream B, `three-globe`, `/app/beta/globe`, needs geocoded coordinates) ·
  Directory map (C6, on B0) · profile depth C2–C4 (passport photo carousel, achievements/stats) · galaxy A3
  self-host font before public GA · blog E4 (populate `Post.categories`).
- **Placeholder profiles:** the "Upgrade listing" CTA is suppressed on placeholders (claim button sole CTA) —
  operator to confirm keep/both.

## Ledger

- **WL-P2-46** — cross off: the read-collapse (SESSION_0523) + the Codex 0524 belt-backfill (this session)
  together take the canonical-tree membership fallback to **zero** (84 members all RankEntry-VERIFIED). See the
  wiring-ledger flip.

## Full close evidence

| Gate                      | Result                                                                     |
| ------------------------- | -------------------------------------------------------------------------- |
| Task log                  | PASS (8 tasks)                                                             |
| Format / lint / typecheck | PASS on every merge                                                        |
| Build                     | PASS on every merge (`next build`)                                         |
| Graphify                  | refreshed — nodes=16979 edges=33021 communities=2290                       |
| Git state                 | branch=main · clean · `2bf6c06b → a385f2ae` (pushed)                       |
| Fallow delta              | 0 introduced findings (deferred to next-session quality pass per operator) |
| Prod verify               | live SSR checks passed on all shipped surfaces                             |

## Reflections

- **The operator ran a fast iterate-on-prod loop** — plan, dispatch Cody in disjoint worktrees, verify with
  Doug (isolated Playwright), push, check live, next directive. Worktree isolation + Doug's WebGL/Playwright
  harness were the enablers; `preview_start` can't serve a worktree, so Doug's own chromium was essential.
- **Seed-then-render exposed real gaps** the build alone didn't: placeholder legend profiles hid all the
  seeded highlights (loader short-circuit), and the freemium rail lock keyed off the owner not the viewer —
  both caught by Doug's runtime verify, not the gates. Runtime verification earned its keep.
- **Operator authority overrides data** (Jerry's belt; Brian's avatar; the Dozen roster) — the fail-closed
  `--override-rank` flag made a one-off operator correction auditable without weakening the no-guessing script.
- **This session skipped the standing quality loops for speed** (Doug runtime-verified, but no
  `/fallow-fix-loop` / hostile-close / `/code-quality`) — hence Phase 1 next session. A deliberate, operator-
  chosen trade: ship the visible product now, harden the code next.
