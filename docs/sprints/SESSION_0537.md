---
title: "SESSION 0537 — FI-028b per-post READ freemium for community posts (no-leak gate)"
slug: session-0537
type: session--open
status: in-progress
created: 2026-07-14
updated: 2026-07-14
last_agent: claude-session-0537
sprint: S53
pairs_with:
  - docs/sprints/SESSION_0535.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0537 — FI-028b per-post READ freemium for community posts (no-leak gate)

## Date

2026-07-14

## Operator

Brian + claude-session-0537

## Goal

**FI-028b — the DEFERRED read-side half of FI-028** (SESSION_0535 grill Q1, split-out; spec in
`POST_LAUNCH_SOT.md` FI-028 → FI-028b). Make SOME community posts premium-to-READ with the
technique-video **no-leak** pattern: an additive `CommunityPost.isPremium` migration + a viewer-keyed
read gate + a TYPE-encoded locked payload so a gated post's `content`/`videoUrl`/`imageUrl` can NEVER
reach an unentitled viewer's client. The CREATE gate (`canCreateCommunityPostForUser`) already shipped
(SESSION_0535, PR #203) and is present at base — this lane touches only the READ path. **PLAN-FIRST /
grill lane** — 5 open forks resolved with the operator BEFORE any build.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0536.md` (RISK #2 CSP report-sink + nonce, Report-Only —
  closed + PR #204 MERGED to `main` @ `eefe069d`). Also read `SESSION_0535.md` (FI-028 create-gate —
  the direct parent of this lane).
- Carryover: SESSION_0535 shipped the FI-028 CREATE gate and **explicitly deferred FI-028b** (per-post
  READ freemium) with a named grill list. This session takes exactly that deferred half.

### Branch and worktree

- Branch: `session-0537-fi028b`
- Worktree: `/Users/brianscott/dev/ronin-0537` (off `origin/main` @ `de966faf`)
- Status at bow-in: clean (fresh worktree; bootstrapped via `/worktree-setup` — `.env` copied +
  `bun install` + `prisma generate`, exit 0).
- Current HEAD at bow-in: `de966faf`
- CONCURRENCY: siblings 0535 (`ronin-0535`) and 0536 (`ronin-0536`) are both CLOSED; no active worktree
  on the community read path. No collision. The FI-028 create-gate CODE is present at base (verified —
  `permissions.ts#canCreateCommunityPostForUser` + `actions.ts` gate wired), so FI-028b builds on it.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content/Prisma (a `CommunityPost` scalar + a read-model payload strip) + Auth/authz (viewer entitlement) — reuses the established tier/entitlement seam, no L1 baseline delta. |
| Extension or replacement | Extension: a new `isCommunityPostViewerEntitled` read-resolver mirroring `isTechniqueViewerEntitled`, + a TYPE-encoded locked payload mirroring `gateTechniqueMedia`. No new authz system; no new subsystem. |
| Why justified | Per-post READ freemium is a ratified product decision (POST_LAUNCH_SOT FI-028 "read = everyone with premium posts visible-but-locked"); it needs an additive scalar + a payload-layer strip, exactly the technique-media precedent. |
| Risk if bypassed | A read gate that strips in the CLIENT (not the server payload) leaks the gated body/video/image — the whole point is the server-side TYPE-encoded strip (LR 0015 + SESSION_0526/0529 no-leak invariant). |

Live docs checked during planning: SESSION_0535, SESSION_0536, `POST_LAUNCH_SOT.md` (FI-028/FI-028b
row), memories `profile-media-freemium-model-0525`, `bbl-membership-tier-model-0472`. Source read:
`server/web/techniques/{technique-media-gate,technique-access}.ts`,
`server/web/community/{queries,payloads,permissions,actions}.ts`, `prisma/schema.prisma`
(CommunityPost @4317, Technique.isPremium @3870, MediaAttachment.isPremium migration),
`components/web/community/{community-feed,community-post-card}.tsx`, `app/(web)/posts/{page,[slug]/page}.tsx`.

### Grill outcome

**5 forks presented to the operator and RESOLVED — build authorized.** See `## Decisions resolved`.
Summary: (Q1) whole-post `isPremium`; (Q2) teaser **keeping the excerpt** hook; (Q3) **author self-serve
toggle at create** (+ creator-payout logged as goal **G-009**); (Q4) default `false` — posts free &
**public to logged-out visitors**; (Q5) mirror `isTechniqueViewerEntitled` (read-specific resolver).

### Drift logged

- None new at bow-in. Pre-existing feed-dedup drift (D-035, D-037) is not a blocker for the read-gate lane.

## Petey plan

### Goal

Ship per-post READ freemium for community posts: `CommunityPost.isPremium` (additive migration) + a
VIEWER-keyed read gate + a TYPE-encoded locked payload (no gated field can cross to an unentitled
client) + locked-post feed/detail display, proven by an **adversarial negative test FIRST** (anon +
free fetch the feed AND a premium post's detail → gated body/video/image are 0 hits in the payload).

### Tasks

_Tasks are provisional pending the grill; the shape below assumes the recommended fork answers._

#### SESSION_0537_TASK_01 — `CommunityPost.isPremium` additive migration

- **Agent:** Cody
- **What:** hand-author `ALTER TABLE "CommunityPost" ADD COLUMN "isPremium" BOOLEAN NOT NULL DEFAULT false` (grandfather = all existing rows stay free); add the field to the Prisma model; shadow-replay on a throwaway DB; commit the migration file (prod auto-applies via `prebuild → migrate deploy`). No new index (teaser keeps premium posts IN the feed — no `where` change).
- **Done means:** migration applies cleanly on a throwaway DB; `prisma generate` sees `isPremium`; existing behavior unchanged (every post free).
- **Depends on:** grill Q1 (unit) + Q4 (default) resolved.

#### SESSION_0537_TASK_02 — viewer read-gate + TYPE-encoded locked payload (no-leak core)

- **Agent:** Cody (build + self-verify) → Doug (adversarial no-leak verify)
- **What:** `isCommunityPostViewerEntitled` (VIEWER-keyed: admin ∨ author(`authorId===userId`) ∨ paid tier via `canRenderRichMedia`) resolved ONCE per request for the viewer-global legs; a pure `gateCommunityPost(post, entitled)` returning a discriminated union where the LOCKED variant carries NO `content`/`videoUrl`/`imageUrl`/`excerpt` (type-encoded, mirroring `GatedTechniqueTile`); strip server-side in the read path before any data crosses to the client. Adversarial negative test authored FIRST.
- **Done means:** anon + free-tier payloads for a premium post contain 0 occurrences of the gated body/video/image; entitled (admin/author/paid) get the full post; technique surfaces un-regressed.
- **Depends on:** TASK_01.

#### SESSION_0537_TASK_03 — locked-post display (teaser) + author premium toggle

- **Agent:** Cody → Desi (UX) + Doug (verify)
- **What:** feed card + detail render a locked teaser (title + type flair + author + **excerpt hook** + lock badge + "Unlock with Premium" CTA → the paid funnel) for a locked post; **author self-serve premium toggle in the create composer** (`createCommunityPostSchema` gains `isPremium` default false → written by `createCommunityPost`; a default-off Switch/Checkbox in the canCreate-gated form, LockKeyhole affordance + hint); i18n keys.
- **Done means:** a locked post shows the teaser (with excerpt) + working upgrade CTA; an author can mark a post premium at create; entitled viewers (admin/author/paid) see it unlocked; no double-render / no-leak regression.
- **Depends on:** TASK_02.

### Parallelism

Strictly sequential: TASK_01 (migration) → TASK_02 (the no-leak core + negative tests — the security
crux) → TASK_03 (display + setter). Single coherent Cody per task; verify wave (Doug no-leak + Desi UX)
after the core. No fan-out (contiguous surfaces).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0537_TASK_01 | Cody | Additive, hand-authored migration + shadow-replay. |
| SESSION_0537_TASK_02 | Cody → Doug | The no-leak read gate; verify demands the adversarial payload-grep (0 gated-field hits). |
| SESSION_0537_TASK_03 | Cody → Desi + Doug | Teaser UX + admin setter; parity + no-leak-on-render. |

### Open decisions

**The grill — build HELD until the operator answers.** Recommendations grounded in code:

1. **[GATING UNIT] Whole-post `CommunityPost.isPremium` vs per-media (`MediaAttachment`-style)?** A
   community post is an ATOMIC unit — one `content` markdown body + at most one `videoUrl` + one
   `imageUrl`, inline (NOT a `MediaAttachment` collection like a technique). The per-attachment split
   (SESSION_0527) existed because a technique is a multi-clip curriculum; a post is not. Gating only the
   media would LEAK the body text (the real premium value of a written tip). **Recommend: whole-post
   `CommunityPost.isPremium`** — mirrors the ORIGINAL SESSION_0525 `Technique.isPremium` (whole-unit),
   the correct analogue for an atomic post.
2. **[LOCKED DISPLAY] Teaser (title + lock + CTA) vs full-hide (exclude from feed)?** POST_LAUNCH_SOT
   FI-028 spec says "read = everyone with premium posts **visible-but-locked**"; the 0529 ladder says
   "Free = read (locked teasers)"; the technique precedent is a locked tile + upgrade panel, not
   full-hide. **Recommend: teaser** (funnel-first, matches spec + ladder + precedent). Sub-question: for
   a locked post, strip the `excerpt` too (safest no-leak — title/type/author only) vs allow a short
   teaser excerpt hook. **Recommend: strip the excerpt** (a 200-char excerpt of a short written tip can
   leak its substance).
3. **[WHO SETS PREMIUM] Author toggle / admin-only / author-tier-gated?** Premium-gating a community
   post is a PLATFORM merchandising lever (drive upgrades), not creator monetization (no author payout
   exists). The technique precedent sets `isPremium` by seed/staff "promote", not a per-author toggle.
   **Recommend: admin/staff-only setter** (a `setCommunityPostPremium` admin action mirroring the
   existing `setCommunityPostStatus` hide/unhide) — no new toggle on the hot create path, smaller blast
   radius. Author still SEES their own premium post (owner leg). Alternative: author self-serve toggle.
4. **[GRANDFATHERING / DEFAULT] Default `false` (stay free) vs technique model (default premium + N free
   previews)?** The technique defaulted `true` because the curriculum IS the paid product. The community
   feed is the OPPOSITE base contract — the ladder says "Free = READ posts"; defaulting premium would
   wall the whole feed off from free members. **Recommend: default `false`** (grandfather all existing +
   new posts free; premium is opt-in per post). Bonus: the migration is then purely additive/behavior-
   preserving with NO backfill UPDATE (unlike the MediaAttachment inherit).
5. **[VIEWER ENTITLEMENT] Confirm mirror of `isTechniqueViewerEntitled` (VIEWER-keyed)?** Yes —
   admin ∨ owner ∨ viewer's own paid tier. One refinement: community owner = `post.authorId === userId`
   (User-keyed direct compare, NO passport lookup — techniques need `authorPassportIds`), so the
   per-post owner leg is a field compare and the paid-tier + admin legs resolve ONCE for the whole feed
   (no N queries). **Recommend: build `isCommunityPostViewerEntitled` mirroring the technique read
   resolver** (paid-tier leg = `canRenderRichMedia`), decoupled from the create gate so "who can create"
   and "who can read premium" can diverge later.

### Risks

- **Client-strip trap (the crux):** stripping gated fields in the client (or shipping them and hiding
  with CSS) leaks the body/video/image. Mitigated by the TYPE-encoded locked variant (a locked post's
  type has no `content`/`video`/`image` field) + server-side gate + adversarial payload-grep FIRST.
- **Feed `cache()` + viewer:** `findCommunityPosts` is viewer-agnostic and `cache()`d at the page. The
  gate must run AFTER the viewer resolves, on the server, before props cross to the client `CommunityFeed`
  — not inside the cached query. Mitigated by a separate pure `gateCommunityPost` at the page/detail layer.
- **Migration discipline:** worktrees share ONE local DB → `migrate dev` BANNED. Hand-author +
  shadow-replay on a throwaway DB; `migrate deploy`; commit the file.

### Scope guard

- Behavior change is INTENTIONAL and singular: SOME posts become premium-to-read (default OFF). Everything
  else behavior-preserving. No god-component. No 5th authz — compose the existing tier/role/owner seams.
- Do NOT regress the technique no-leak surfaces. Do NOT touch the CREATE gate (shipped). Do NOT touch
  middleware/security-header/`next.config` (0536's turf, now merged). FI-001 / Brian Truelson email STAYS
  PARKED. `../ronin-dojo-monorepo` READ-ONLY. Hand-authored migration only. No push/deploy without explicit
  operator "go" (build → verify → show → HOLD).

### Dirstarter implementation template

- **Docs read first:** not applicable (community read-model + entitlement are Ronin custom, not a
  Dirstarter L1 primitive).
- **Baseline pattern to extend:** `server/web/techniques/technique-media-gate.ts` (TYPE-encoded locked
  variant) + `technique-access.ts#isTechniqueViewerEntitled` (VIEWER-keyed resolver) +
  `server/web/community/{queries,payloads}.ts` (the read path).
- **Custom delta:** `CommunityPost.isPremium` + a community read-gate + locked-post teaser display.
- **No-bypass proof:** mirrors two shipped, reviewed patterns; adds no new authz; the migration is
  additive/behavior-preserving.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0537_TASK_01 | pending | `CommunityPost.isPremium` additive migration (default false) — HELD for grill Q1/Q4. |
| SESSION_0537_TASK_02 | pending | Viewer read-gate + TYPE-encoded locked payload + negative-test-first — HELD for grill Q1/Q5. |
| SESSION_0537_TASK_03 | pending | Locked-post teaser display (keep excerpt) + author premium toggle at create. |

## What landed

<!-- Filled at bow-out. -->

## Decisions resolved

- **Q1 GATING UNIT = whole-post `CommunityPost.isPremium`** (operator: first option). A post is atomic
  (body + one image + one video), not a `MediaAttachment` collection — the whole post is the gated unit.
- **Q4 DEFAULT = `false`, free & PUBLIC** (operator, reinforcing Q1): free posts are readable by
  everyone including **logged-out visitors** (current behavior — the feed/detail are already public);
  premium is deliberate opt-in. "Let people experience the free posts so they pay for the premium ones."
  Migration is additive, no backfill.
- **Q2 LOCKED DISPLAY = teaser, KEEP the excerpt** (operator). Locked variant strips
  `content`/`videoUrl`/`imageUrl` but retains the bounded server-derived `excerpt` as the conversion
  hook (title + type + author + excerpt + lock badge + Unlock CTA). No-leak invariant applies to the
  FULL body + media only.
- **Q3 SETTER = author self-serve toggle at create** (operator: second option). Any create-capable
  author marks their own post premium at create time (composer toggle, default off). **Creator-payout
  model logged as goal G-009** (operator directive) — premium currently benefits the platform, not the
  author; the payout gap is a tracked future goal.
- **Q5 VIEWER ENTITLEMENT = mirror `isTechniqueViewerEntitled`** (Petey-stated, operator did not object):
  a read-specific `isCommunityPostViewerEntitled` — admin ∨ author (`post.authorId === userId`, no
  passport lookup) ∨ viewer's own paid tier (`canRenderRichMedia`). Anon (`userId===null`) → never
  entitled → premium posts lock. Decoupled from the create gate.

## Files touched

| File | Change |
| --- | --- |
| `<pending grill>` | <pending> |

## Verification

| Command / smoke | Result |
| --- | --- |
| `<pending build>` | <pending> |

## Open decisions / blockers

- Grill resolved (see `## Decisions resolved`); build authorized. No push/deploy without explicit
  operator "go" — HOLD at the push gate after build + verify + show.

## Next session

### Goal

<Filled at bow-out.>

### First task

<Filled at bow-out.>

## Review log

<!-- Filled at bow-out. -->

## Hostile close review

<!-- Filled at bow-out. -->

## ADR / ubiquitous-language check

<!-- Filled at bow-out. -->

## Reflections

<!-- Filled at bow-out. -->

## Full close evidence

<!-- Filled at bow-out. -->
