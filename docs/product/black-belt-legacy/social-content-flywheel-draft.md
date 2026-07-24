---
title: "BBL Social Content Flywheel — DRAFT (proposed event→content map + starter cadence)"
slug: bbl-social-content-flywheel-draft
type: draft
status: draft
created: 2026-07-24
updated: 2026-07-24
author: "Claude (Fable 5) — /rr overnight lane, wave 4"
last_agent: claude-session-0654
session: SESSION_0654
pairs_with:
  - docs/architecture/research/research-review-bbl-social-automation.md
  - docs/product/black-belt-legacy/PRD.md
  - docs/product/black-belt-legacy/BRAND_HEART_BEAT.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - black-belt-legacy
  - social
  - draft
---

# BBL Social Content Flywheel — **DRAFT**

> **DRAFT — NOT RATIFIED.** Internal proposal from `/rr` SESSION_0654. Every fork here is OPEN
> (see the research-review's F1–F6). Nothing in this document authorizes posting about any member.
> Evidence + citations: [`research-review-bbl-social-automation.md`](../../architecture/research/research-review-bbl-social-automation.md).

## Purpose

Turn platform events into social content that drives the two CTAs that matter: **claim your
profile** and **join the legacy**. Members do the sharing wherever possible (Strava/Wrapped
pattern); the brand account amplifies.

## Ground rules (proposed)

1. **Approval-queue-first.** At v1 *nothing* auto-posts. Events generate a draft (graphic +
   caption + CTA link with UTM); a human approves, edits, or kills it. Auto-posting is a later
   opt-in per content class (fork F3).
2. **Consent floor.** Person-centric posts only for **claimed + verified** profiles whose owner
   has an affirmative publicity signal (mechanism = fork F2, undecided). Unclaimed placeholder
   nodes are never the subject of a celebration post. Aggregate stats never name an unclaimed
   person.
3. **Public-data floor.** Templates may only pull fields already on the member's public profile
   at their tier. No evidence documents, no private account data, ever.
4. **80/20 mix.** ≥80% community/education/celebration, ≤20% direct promotion — per the gym-
   marketing evidence base.
5. **Reddit/X are human-only.** Participation, not automation.

## Event → content map (proposed)

| # | Platform event (source of truth) | Post type | Template inputs | Channels | Trigger mode | Consent class |
| --- | --- | --- | --- | --- | --- | --- |
| E1 | Lineage claim **verified** (`PassportClaimRequest` approved) | "Welcome to the Legacy" celebration card — name, belt, branch, position in the line | name, avatar, rank + `Rank.colorHex`, branch/lineage path | IG feed + Story, FB | Queue draft on event | Person — needs F2 signal |
| E2 | Belt promotion recorded (`RankEntry` award) | Congrats graphic — belt-color card ("New black belt in the Bob Bass line") | name, new rank, `Rank.colorHex`, promoter (if public), date | IG feed + Story, FB | Queue draft on event | Person — needs F2 signal |
| E3 | New technique published (`Technique`, free preview) | 15–35s preview clip + title card; freemium CTA ("6 free previews — the rest is Premium") | clip, technique name, author (if consented), belt level | YT Shorts, TikTok, IG Reels | Queue draft on publish | Instructor rights — fork F5 |
| E4 | Graph milestone crossed (counts: verified nodes, black belts per branch, generations) | Milestone stat card ("The 100th verified black belt in the Machado line") | aggregate numbers only | IG, FB, X (manual) | Queue draft on threshold | Aggregate — lowest risk; F3 candidate for full-auto |
| E5 | Staff blog `Post` published (`/blog`) | Link post + pull-quote card | title, excerpt, hero image | FB, IG Story, X (manual) | Queue draft on publish | Owned content — no gate |
| E6 | Member-triggered share (profile "share my legacy" affordance, existing QR/share surface) | Member's own lineage/belt card, 9:16 | member's public profile fields | member's own accounts | **Member-initiated** — not brand automation | Inherent consent (self-share) |
| E7 | Annual: "Your Legacy, Wrapped" (rank history + lineage depth + techniques viewed) | 9:16 story-set per member, member-shared | per-member yearly aggregates | member's own accounts | Seasonal batch, member-initiated | Inherent consent (self-share) |

E6/E7 are the highest-leverage rows (the Strava/Wrapped pattern: the member shares because the
artifact makes *them* look good) — but they are **product features**, not marketing ops, so they
graduate to a build lane only after the operator ratifies the direction.

## Pipeline (proposed seams — conceptual, no code committed)

1. **Detect** — nightly job (or DB trigger later) diffs new rows for E1–E5.
2. **Gate** — eligibility check: consent class, tier/publicity posture, dedupe, rate cap.
3. **Render** — templated graphic via the chosen tool (fork F4: in-house `@vercel/og`-class
   renderer favored; Placid/Bannerbear as buy-option). Brand tokens + `Rank.colorHex` from the DB.
4. **Queue** — draft (graphic + caption + UTM link) lands in the approval queue (Buffer Team
   class, or a minimal in-app AdminCollection later).
5. **Ship** — approver edits/approves; scheduler posts at the slot below.
6. **Measure** — UTM'd claim/join clicks per post class, reviewed monthly; kill classes that
   don't feed the claim loop.

## 4-week starter cadence (placeholder slots — approval-queue fills them)

Floor cadence per the evidence base (IG 3/wk, short-form 2/wk, FB 1/wk — consistency over volume).
Slots, not obligations: an empty queue means the slot is skipped, never padded with filler.

| Week | Mon | Wed | Fri | Sat |
| --- | --- | --- | --- | --- |
| 1 | IG: milestone stat card (E4) | IG Reel + TikTok/Short: technique preview #1 (E3) | IG: claim celebration (E1, if consented candidate exists; else lineage-history editorial) | FB: blog link post (E5) |
| 2 | IG: promotion congrats (E2, consented) | IG Reel + TikTok/Short: technique preview #2 (E3) | IG: "how claiming works" explainer (evergreen) | FB: milestone stat card (E4 re-cut) |
| 3 | IG: milestone stat card (E4) | IG Reel + TikTok/Short: technique preview #3 (E3) | IG: claim celebration (E1) or branch-spotlight editorial | FB: blog link post (E5) |
| 4 | IG: promotion congrats (E2) | IG Reel + TikTok/Short: technique preview #4 (E3) | IG: month recap carousel (aggregates) | FB: "join the legacy" tier post (the ≤20% promo slot) |

Weekly ops budget: one ~30-min approval session + one editorial slot. Reddit/X: participate as a
human when there's something real to say; no slots scheduled.

## Success measures (proposed)

- Primary: **claims started / verified** attributable to social (UTM), per month.
- Secondary: memberships started from social; follower growth is vanity — tracked, not optimized.
- Review at week 4: which event classes earned their slot; then decide fork F3 (auto vs queue)
  per class with real data.

## Explicitly out of scope for v1

- Any auto-posting without human approval.
- Any post about an unclaimed placeholder profile.
- Automated Reddit/X activity.
- Paid ads (separate decision, separate budget).
- Recutting technique reels before fork F5 (instructor rights posture) is decided.
