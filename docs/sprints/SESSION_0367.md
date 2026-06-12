---
title: "SESSION 0367 — BBL landing page (D8 cutover-arm landing lane)"
slug: session-0367
type: session--implement
status: closed
created: 2026-06-12
updated: 2026-06-12
last_agent: claude-session-0367
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0366.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/product/black-belt-legacy/SOT-ADR.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0367 — BBL landing page (D8 cutover-arm landing lane)

## Date

2026-06-12

## Operator

Brian + claude-session-0367

## Goal

Operator: "get the content from `ronin-dojo-monorepo/.../BlackBeltLegacyLanding.jsx` on the
bbl.local landing page now." The D8 cutover-arm **landing lane**: rebuild the legacy BBL landing
(content/IA/copy only — per the standing rule, no legacy code ported) as the brand-gated home
for `Brand.BBL`, on current primitives + semantic theme tokens. Baseline home untouched.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0366.md` (closed same day — nav lane + 2b wave 2).
- Carryover: queued next was 2b wave 3; operator redirected to the landing lane (also D8
  launch-gating). Dev server still live on bbl.local from 0366.

### Branch and worktree

- Branch: `session-0367-bbl-landing` (off `main` @ `1f3420a`)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `1f3420a`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Home page composition (brand-gated branch), content section patterns |
| Extension or replacement | Extension: `Brand.BBL` branch in `(home)/page.tsx` renders `BblLanding`; Baseline path unchanged |
| Why justified | D8 cutover-arm landing lane; legacy landing is the operator-named content source |
| Risk if bypassed | BBL flips to a generic Baseline-style home with none of the legacy positioning |

### Grill outcome

- Legacy source read for **content only** (1671-line SPA: router + landing). Regular
  (non-soft-launch) section set rebuilt; soft-launch-only duplicates skipped.
- Route mapping: register modal → `/auth/login`; More Info (email capture) → `/about`;
  profile/tree links → `/lineage` (drawer is the canonical profile surface; per-slug directory
  links deferred until the Phase-3 reseed guarantees slugs); posts → `/posts`;
  school register → `/organizations/new`; techniques → `/techniques`.
- `LineageTreeMVP` embed → link teaser to `/lineage` (real tree exists there; no embed).
- Assets: 19 images copied from the monorepo public dir into
  `apps/web/public/brand/blackbeltlegacy/` (kebab-case names; 4 multi-MB heroes downscaled via
  `sips` to ≤1920px/q70; total 2.9MB).
- Copy stays in a data module (English, brand-gated page) rather than `messages/` — BBL-only
  marketing copy, not shared UI strings.

## Petey plan

### Goal

bbl.local `/` serves the rebuilt legacy landing; Baseline home byte-identical behavior; gates +
browser proof + PR.

### Tasks

#### SESSION_0367_TASK_01 — Landing build

- **Agent:** Cody (inline)
- **What:** `bbl-landing-content.ts` (copy/data verbatim from legacy, routes mapped) +
  `bbl-landing.tsx` (15 sections on Card/Button/Badge/Carousel/Accordion/Prose + semantic
  tokens) + `Brand.BBL` branch in `(home)/page.tsx` + assets.
- **Done means:** typecheck/lint/format green; bbl.local renders all sections; localhost
  (Baseline) unchanged; PR + CI.
- **Depends on:** nothing

### Open decisions

None — operator named source and target.

### Risks

- Legacy image rights/quality assumed OK (same assets the legacy site shipped).
- Static Dirty Dozen data will be superseded when a directory-backed rail exists (post-Phase-3).

### Scope guard

- No schema, no server changes, no new shared primitives, no nav/footer changes.
- No porting of legacy components/auth/router code.

### Dirstarter implementation template

- **Docs read first:** not applicable (no L1 area; composition of existing primitives).
- **Baseline pattern to extend:** `(home)/page.tsx` brand-aware composition.
- **Custom delta:** `app/(web)/(home)/bbl/` landing module, brand-gated.
- **No-bypass proof:** Baseline home path untouched; BBL branch additive.

## Cody pre-flight

1. **Existing component scan:** Card/Button/Badge/Carousel(+Slide)/Accordion/H2-H3/Prose/Link
   all verified by direct read; no new primitives created.
2. **L1 template scan:** home composition pattern reused; no handrolled carousel/accordion
   (FS-0001 honored).
3. **Composition decision:** one data module + one section-composition file under
   `app/(web)/(home)/bbl/`.
4. **Lane docs loaded:** SESSION_0361 §Q4 landing inventory, SOT-ADR D8, SESSION_0366 close.
5. **Dev environment:** dev server already running (bbl.local:3000).
6. **FAILED_STEPS check:** FS-0002 acknowledged (no installs; server left running).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0367_TASK_01 | landed | 15-section landing live on bbl.local (hero, video, Dirty Dozen rail, heritage, value props, member/owner features, generations timeline, testimonials + group photo, FAQ accordion, final CTA, Dave Meyer celebration, tree teaser, 3 promos); brand split proven (localhost still "Train Smart…", 0 "Build Your" hits); gates green. |

## What landed

- **BBL landing live** — PR #66 all checks green (incl. Playwright ×3 + CodeRabbit) →
  squash-merged `23a5a4f`. 15 legacy sections rebuilt brand-gated on current primitives;
  19 assets; Baseline home proven untouched.

## Decisions resolved

- Profile/tree links target `/lineage` until the Phase-3 reseed guarantees directory slugs.
- Landing copy lives in a brand-gated data module, not `messages/` (BBL-only marketing copy).
- `LineageTreeMVP` embed → link teaser to the real `/lineage` tree (no canvas embed on home).

## Files touched

| File | Change |
| --- | --- |
| `app/(web)/(home)/bbl/bbl-landing-content.ts` | Legacy copy/data, routes mapped (new) |
| `app/(web)/(home)/bbl/bbl-landing.tsx` | 15-section landing on current primitives (new) |
| `app/(web)/(home)/page.tsx` | `Brand.BBL` branch → `BblLanding` |
| `public/brand/blackbeltlegacy/*` | 19 assets (2.9MB, heroes downscaled) |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | EXIT 0 |
| `bun run lint:check` / `format:check` | clean (pre-existing warnings only) |
| Browser proof bbl.local | hero/rail/heritage/celebration screenshots; 16 sections counted; FAQ + Dirty Dozen + celebration text asserted |
| Brand split | `localhost` (Baseline): 0 × "Build Your", old hero title intact; `bbl.local`: new landing |

## Open decisions / blockers

- Replace static Dirty Dozen rail with directory-backed data post-Phase-3 (slugs guaranteed).
- Landing email capture (legacy "More Info" modal) → footer subscribe exists; dedicated
  capture section can ride the cutover polish pass.

## Next session

### Goal

Resume Phase 2b wave 3 (remaining admin areas + member dashboard pages), or the next
cutover-arm item (OG + sitemap L8 essentials / stripe@22 rehearsal) per operator priority.

### First task

If 2b: apply the proven wave transform to the next area set. If cutover-arm: L8 essentials
(OG image + native sitemap for BBL).

## Review log

### SESSION_0367_REVIEW_01 — BBL landing (PR #66)

- **Reviewed tasks:** TASK_01
- **Dirstarter docs check:** not applicable (composition of existing primitives)
- **Verdict:** Content lifted faithfully (sections, copy, IA), zero legacy code ported; brand
  gating at the page level via the canonical resolution path; Baseline regression checked by
  direct curl assertion, not assumption. One mid-build fix (name truncation in the rail).
- **Score:** 9/10
- **Follow-up:** techniques promo must become "Coming Soon" when the SESSION_0368 feature
  gating lands (techniques gates off — grill decision).

## Hostile close review

- **Giddy:** pass — additive brand-gated surface; no schema/server changes; assets sized.
- **Doug:** pass — CI Playwright ×3 + live walks + brand-split curl proof.
- **Desi:** pass — legacy IA preserved on current design system; semantic tokens; brand red
  from BrandSettings; one truncation defect caught in the walk and fixed.
- **Kaizen aggregate:** 9/10 — clean single-slice session.

## ADR / ubiquitous-language check

- ADR update not required — content surface on existing architecture; brand gating via the
  canonical `getRequestBrand()` single resolution path (MB-002 honored).
- Ubiquitous language unchanged.

## Reflections

- **Content-only extraction from a 1671-line legacy SPA worked because the read was targeted:**
  data constants first (top of file), then the landing JSX, skipping the router entirely. The
  standing "UI behavior/copy only" rule made the port a transcription, not a translation.
- **Asset discipline matters at copy time:** the legacy image dir is 139MB; the landing needed
  19 files at 2.9MB after `sips` downscaling. Copying "the images folder" would have shipped
  136MB of dead weight into git history permanently.
- **The brand-split curl check (0 hits on the other brand) is a one-liner that should ride every
  brand-gated change** — cheaper than a browser walk and catches bleed-through immediately.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | status closed; last_agent claude-session-0367. |
| Backlinks/index sweep | `wiki/index.md` SESSION_0367 row added at close. |
| Wiki lint | Result in close chat. |
| Kaizen reflection | 3 entries above. |
| Hostile close review | REVIEW_01; Giddy/Doug/Desi pass, 9/10. |
| Review & Recommend | Next = SESSION_0368 feature-gating slice (grill held in-chat). |
| Memory sweep | Program memory updated at 0368 close (landing done rides the same note). |
| Next session unblock check | Unblocked — grill decisions locked. |
| Git hygiene | PR #66 → squash `23a5a4f`; close docs commit on main. |
| Graphify update | Stats in close chat. |
