---
title: "SESSION 0537 — FI-028b per-post READ freemium for community posts (no-leak gate)"
slug: session-0537
type: session--implement
status: closed
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
| SESSION_0537_TASK_01 | landed | `CommunityPost.isPremium` additive migration (default false, no backfill) — Cody `4cf1ad43`. |
| SESSION_0537_TASK_02 | landed | Viewer read-gate (`post-access.ts`) + TYPE-encoded locked payload (`post-gate.ts`) + negative-test-first — Cody `f1bc4cc1`. Doug GO 9.7 no-leak PROVEN (bypass hunt + key-absence test). |
| SESSION_0537_TASK_03 | landed | Locked-post teaser (keep excerpt) + author premium toggle at create — Cody `ccb826a0`; verify-wave polish `4cc361d2`. Desi PASS-with-fixes (applied), Giddy PASS (no ADR). |

## What landed

- **TASK_01 — `CommunityPost.isPremium` migration (`4cf1ad43`):** additive
  `20260714000000_add_community_post_is_premium` (`ADD COLUMN … BOOLEAN NOT NULL DEFAULT false`, no
  backfill, no index) + the Prisma model field. Grandfather-safe: every existing post stays free &
  public. Shadow-verified (`migrate status` → `migrate deploy` clean apply → `prisma generate` sees it).
- **TASK_02 — read gate + no-leak payload (`f1bc4cc1`):** `server/web/community/post-access.ts`
  (`resolveCommunityViewerContext` resolves the viewer-global admin/paid legs ONCE; `isCommunityPostViewerEntitled`
  = pure `!isPremium ∨ admin ∨ author(`authorId===userId`) ∨ paid `canRenderRichMedia`` — mirrors
  `isTechniqueViewerEntitled`, NO 5th authz) + `server/web/community/post-gate.ts` (`gateCommunityPost`
  → a discriminated `CommunityPostView`; the `locked:true` variant's TYPE omits
  `content`/`videoUrl`/`imageUrl`/`authorId`, keeps `excerpt`). Query stays viewer-agnostic; the gate
  runs at the page layer before any prop crosses to a client component. Adversarial negative test
  (`post-gate.test.ts`, 10/10) asserts key-ABSENCE + deep-string 0-hits.
- **TASK_03 — teaser display + author toggle (`ccb826a0`):** feed card/row + detail branch on
  `view.locked` → a teaser (title + flair + author + excerpt + lock badge + Unlock-with-Premium CTA →
  `/lineage/join`); a "Premium" badge on unlocked premium posts; an author self-serve premium toggle
  (default-off `Switch`) in the create composer (`schema` + `actions` persist `isPremium`); 6 new i18n keys.
- **Verify-wave polish (`4cc361d2`):** badge `primary`→`warning` (brand parity), tier-lookup
  short-circuit when no post is premium (perf, mirrors `hasPremiumTechniqueMedia`), `isAdmin` predicate
  reuse, flair-leads badge order, excerpt-is-public toggle-hint copy; deliberate CTA weight split +
  locked-detail Save/Share stance made explicit via comments.

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
| `apps/web/prisma/schema.prisma` | `CommunityPost.isPremium Boolean @default(false)` |
| `apps/web/prisma/migrations/20260714000000_add_community_post_is_premium/migration.sql` | NEW — additive `ADD COLUMN`, no backfill/index |
| `apps/web/server/web/community/post-access.ts` | NEW — `resolveCommunityViewerContext` + pure `isCommunityPostViewerEntitled` (VIEWER-keyed) |
| `apps/web/server/web/community/post-gate.ts` | NEW — `gateCommunityPost` + type-encoded `CommunityPostView`/`CommunityPostLocked` |
| `apps/web/server/web/community/post-gate.test.ts` | NEW — adversarial negative test (key-absence + deep-string) |
| `apps/web/server/web/community/payloads.ts` | select gains `isPremium`+`authorId`; client `CommunityPostMany` gains `isPremium` (not `authorId`); `toCommunityPostRowForGate` |
| `apps/web/server/web/community/queries.ts` | use the renamed flatten; queries stay viewer-agnostic |
| `apps/web/server/web/community/queries.guard.test.ts` | sampleRow gains `isPremium`/`authorId` |
| `apps/web/server/web/community/schema.ts` | `createCommunityPostSchema` gains `isPremium` |
| `apps/web/server/web/community/actions.ts` | `createCommunityPost` persists `isPremium` |
| `apps/web/app/(web)/posts/page.tsx` | resolve viewer ctx once → gate every row → pass gated views to feed |
| `apps/web/app/(web)/posts/[slug]/page.tsx` | gate the post; locked detail = excerpt + upgrade panel (no body/media) |
| `apps/web/components/web/community/community-feed.tsx` | thread gated `views` |
| `apps/web/components/web/community/community-post-card.tsx` | branch on locked; teaser card + warning Premium badge |
| `apps/web/components/web/community/community-post-row.tsx` | same branching for list density |
| `apps/web/components/web/community/create-community-post-dialog.tsx` | default-off premium `Switch` toggle |
| `apps/web/messages/en/community.json` | +6 keys (badge / unlock CTA / locked heading+desc / toggle label+hint) |
| `docs/sprints/SESSION_0537.md` · `docs/knowledge/wiki/goals-ledger.md` (G-009) · `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md` (FI-028b LANDED) · `docs/knowledge/wiki/custom-component-inventory.md` · `docs/architecture/ubiquitous-language.md` · `docs/knowledge/wiki/wiring-ledger.md` (WL-P2-63) · `docs/knowledge/wiki/index.md` | close docs |

## Verification

| Command / check | Result |
| --- | --- |
| `bun test server/web/community/post-gate.test.ts` (single-file) | **10/10** — locked payload has `content`/`videoUrl`/`imageUrl`/`authorId` keys ABSENT; deep-string 0 hits; excerpt present; resolver matrix |
| `bun test server/web/community/queries.guard.test.ts` | **6/6** |
| `bun test server/web/community/actions.safe-action.test.ts` | **18/18** (create-action green with `isPremium`) |
| `bun test server/web/community/permissions.test.ts` | **9/9** (create gate un-regressed) |
| `bunx tsc --noEmit` (touched) | clean (fresh-worktree `PageProps` noise clears under build) |
| `bunx oxlint` (touched) | clean |
| `bun run format:check` (repo-wide) | clean |
| `next build` (real diff `origin/main..HEAD`, pre-push gate) | **exit 0** — `/posts` + `/posts/[slug]` render `ƒ` dynamic (no static snapshot of a gated payload); sitemap generated |
| Doug adversarial no-leak + bypass hunt | **GO 9.7** — every community-post consumer (feed/detail/bookmarks/MAB/RSS/sitemap/oRPC/API) gated or bodiless; NO leak |
| Giddy structure | **PASS** — no 5th authz, faithful mirror, clean layering; **ADR not required** |
| Desi UX | **PASS-with-fixes** (applied) — funnel-first, brand parity (warning badge) |
| Fallow delta (gate runner) | **0 introduced** |

## Open decisions / blockers

- None blocking. Manual boundary: the locked-teaser render is proven by the unit gate + Doug's
  static/build proof, not a live e2e (no `/posts` read e2e exists; the diff doesn't touch `e2e/**`, so
  FS-0031 doesn't apply). Deferred: shared `UpgradePanel` extraction → **WL-P2-63**; creator-payout
  model → goal **G-009**.
- Concurrency: sibling session 0538 (G-002 per-product DB separation) ran in `../ronin-0538` — disjoint
  from the community read path; no collision. The additive `isPremium` migration is order-independent on prod.

## Next session

### Goal

Operator's call — the top actionable board card. **FI-001 (P0) stays PARKED** (Brian Truelson real send);
**G-002 (P1) is in-flight in sibling session 0538** (`../ronin-0538`) — don't collide. So the top free
candidates are **FI-006** (claim→award rank lifecycle, P1) or the email/student-signup lane (FI-002 / FI-003).
Run `cd apps/web && bun scripts/board-backlog.ts --top=10` at bow-in and take the top non-parked/non-in-flight card.

### First task

Confirm sibling 0538 (G-002) has landed/merged before touching any shared DB/migration surface, then pick the
top board card. If continuing the community lane instead, the ready follow-up is **WL-P2-63** (extract a shared
`UpgradePanel` and refactor the community locked-detail + `technique-media.tsx` onto it — a behavior-preserving
DRY pass with a technique-surface re-verify). Merge PR for `session-0537-fi028b` first.

## Review log

### SESSION_0537_REVIEW_01 — FI-028b per-post READ freemium (verify wave)

- **Reviewed tasks:** SESSION_0537_TASK_01, TASK_02, TASK_03 (full branch diff `origin/main..HEAD`).
- **Dirstarter docs check:** not applicable — community read-model + entitlement are Ronin custom, not a
  Dirstarter L1; the change extends the established tier/entitlement seam.
- **Doug (adversarial no-leak / bypass hunt):** **GO 9.7** — enumerated every community-post consumer
  (feed, detail, bookmarks/saved, MAB, RSS, sitemap, oRPC, API); all gate or emit no body. Type-encoded
  strip + key-absence negative test proven honest. Entitlement matrix correct (anon/free lock, admin/author/
  paid unlock). Migration additive/behavior-preserving. All gates green.
- **Giddy (structure):** **PASS** — no 5th authz (composes role + `canRenderRichMedia` tier policy + owner
  field-compare), faithful mirror of `gateTechniqueMedia`/`isTechniqueViewerEntitled`, clean layering
  (query viewer-agnostic; gate at the page boundary). **ADR not required** (rides SESSION_0529 ladder +
  SESSION_0525–0529 technique-freemium precedent + ADR 0042). Recommended a glossary note (done) + inventory (done).
- **Desi (UX):** **PASS-with-fixes** (all applied) — funnel-first teaser; brand parity fixed (Premium badge
  `warning`, matching `profile-media-card`); reuse-first (no bespoke card). Flagged the shared `UpgradePanel`
  DRY win → deferred to WL-P2-63.
- **Batch-fix delta (`4cc361d2`):** 5 P3 fixes applied + 2 intentional-stance comments; re-verified green
  (post-gate 10/10, `next build` exit 0), behavior-preserving confirmed.
- **Score:** 9.6/10 (Doug 9.7 · Giddy PASS · Desi PASS-with-fixes) — a disciplined, adversarially-proven
  no-leak read gate; only P3 polish, no blockers.
- **Follow-up:** WL-P2-63 (UpgradePanel), G-009 (creator payout). No open findings ≥ medium.

## Hostile close review

- **Giddy:** pass — mirrors two shipped, reviewed patterns; no 5th authz; no god-component; the raw
  content-bearing row cannot reach a client (import-type-only client boundary; gate at the page layer).
- **Doug:** pass (GO 9.7) — the no-leak invariant is genuinely type-encoded and proven by an exhaustive
  consumer bypass hunt + a key-absence + deep-string negative test; migration additive/behavior-preserving;
  `next build` green on the real diff.
- **Desi:** pass — funnel-first teaser reuses L1 primitives; brand parity restored (warning badge); the
  deliberate CTA weight split preserved.
- **Kaizen aggregate:** 9.6/10 — the mirror pattern collapsed a "build a freemium read system" ask into a
  gate + a type + a strip; the operator's teaser/keep-excerpt + author-toggle calls shaped the product edge;
  the only debt is the named WL-P2-63 DRY + the G-009 payout gap, both ledgered.

### Findings (severity ≥ medium)

None.

## ADR / ubiquitous-language check

- **ADR update NOT required** (Giddy-confirmed). Operates under the ratified SESSION_0529 participation
  ladder + the SESSION_0525–0529 technique-freemium precedent + ADR 0042 (community posts). No new
  architectural decision — a mirror + an additive scalar.
- **Ubiquitous-language UPDATED** — added **"Premium community post"** (`docs/architecture/ubiquitous-language.md`):
  author-set, platform-monetized, visible-but-locked, no creator payout yet (→ G-009). Distinguished from a
  staff-promoted premium technique.
- **Custom-component inventory UPDATED** — `gateCommunityPost` + `isCommunityPostViewerEntitled` /
  `resolveCommunityViewerContext` added beside the `gateTechniqueMedia` entry.

## Reflections

- **The mirror pattern collapsed the build again.** Like FI-028's create gate, FI-028b read as "build a
  freemium read system" but the honest shape was: one additive scalar + one type-encoded gate + one
  entitlement resolver, both cloned from the technique surface. Verify-don't-assert (read
  `technique-media-gate.ts` first) turned a session-sized feature into a tight, reviewable diff.
- **Type-encoding beats discipline for a no-leak gate.** Making the locked variant's TYPE omit
  `content`/`videoUrl`/`imageUrl` means a future careless render literally can't compile a leak — the
  invariant is enforced by the compiler, not a code comment. Doug's bypass hunt (every consumer enumerated)
  was the other half: the gate is only as safe as its coverage, and a second ungated read path would have
  leaked. Neither the type nor the hunt alone is enough.
- **The operator's product calls sharpened the edge.** "Keep the excerpt" (a bounded, intentional teaser)
  and "author self-serve toggle" (vs admin-only) moved the design from a pure security gate toward a
  conversion funnel — and surfaced the real gap: an author-set paywall with no author payout. Logging G-009
  turned that asymmetry from a silent footnote into tracked work.
- **The clean-tree gate-runner blind spot bit as documented.** `bow-out-gates.sh` read "0 touched /
  build skipped / docs-only" on a fully-committed multi-commit session (the `bow-out-gate-runner-diffs-working-tree`
  memory). Ran `next build` on `origin/main..HEAD` myself — green — before treating the push as app-code.

## Full close evidence

| Step | Proof |
| --- | --- |
| Task log | 3 TASK rows (+3 bow-in rows) all `landed`; in `## Task log` |
| Build | `next build` **exit 0** on the real diff `origin/main..HEAD` (13 app files) — gate-runner "docs-only/skipped" is the known clean-tree blind spot |
| Gates | tsc ✓ · oxlint ✓ · oxfmt/format:check ✓ (repo-wide) · unit 10+6+18+9 single-file ✓ |
| Runtime verification | Doug adversarial no-leak GO 9.7 (bypass hunt + key-absence negative test); manual boundary = live locked-teaser render (no `/posts` e2e; unit + static/build proof) |
| Hostile close review | SESSION_0537_REVIEW_01 — Doug GO 9.7 · Giddy PASS · Desi PASS-with-fixes; Kaizen 9.6; no findings ≥ medium |
| Code-quality gate | new custom code is a thin mirror of the reviewed technique gate (Class B); Giddy PASS, fallow 0-introduced — no separate `/code-quality` run needed |
| Reflections | yes — 4 (mirror-collapses-build, type-encoding-beats-discipline, operator-calls-sharpen-edge, clean-tree-blindspot) |
| Fallow delta | **0 introduced** (gate runner) |
| ADR check | not required (Giddy) — glossary + inventory updated instead |
| Finding router | FI-028b → POST_LAUNCH_SOT LANDED; UpgradePanel → WL-P2-63; creator payout → GL G-009 |
| Memory sweep | updated `bbl-membership-tier-model-0472` + `profile-media-freemium-model-0525` (FI-028b shipped) |
| Wiki lint | 0 err / 52 warn (pre-existing) |
| Graphify | refreshed by gate runner — nodes=13272 edges=29674 communities=1426 |
| Git hygiene | 6 commits on `session-0537-fi028b`; single push at close (hash in bow-out line); worktree self-clean deferred until branch merged |
| Deferral guard | run clean (WL-P2-63 + G-009 carry real ledger ids) |
