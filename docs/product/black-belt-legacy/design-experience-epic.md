---
title: "BBL Epic — Design & Experience push (galaxy · globe · directory/profile · technique · blog/dozen)"
slug: design-experience-epic
type: epic-plan
status: proposed
created: 2026-07-10
last_agent: claude-session-0525
pairs_with:
  - docs/product/black-belt-legacy/BBL_PARITY_SPEC.md
  - docs/product/black-belt-legacy/GAP_MATRIX.md
  - docs/product/black-belt-legacy/BBL-Galaxy-spec.md
  - docs/protocols/page-code-review.md
  - docs/protocols/petey-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0525.md
tags:
  - bbl
  - blackbeltlegacy
  - design
  - experience
  - epic-plan
---

# BBL Epic — Design & Experience push

> **Operator ask (SESSION_0525):** a design/experience push across **five disjoint streams** — galaxy
> visual polish, a member globe, directory/profile parity vs the original BBLApp, technique video
> carousels, and a blog gallery + Dirty Dozen articles. **Parity target** for the page work is the
> original Vite/WP **BBLApp** at `ronin-dojo-monorepo/src/brands/blackbeltlegacy/` — match its **UX +
> feature-set + field-set**, NOT its data layer (new app is Next/Prisma).
>
> **Posture (operator, this session):** post-launch design push; **schema-touching work proceeds now**
> (additive columns only — `migrate deploy`, not the moat). Send stays decoupled. This is **planning
> only** — no code landed this session; every build slice below routes to Cody → Doug/Desi and **holds
> at the push gate**.

This doc is the single sliced plan. Each stream is an independent build lane; §7 gives the dependency
graph and concurrency verdict. The streams are **disjoint file sets → run as parallel build sessions**,
with two coordination points (shared `schema.prisma`; one cross-stream data dependency) called out in §7.

---

## 0. Decisions resolved (the grill)

| # | Decision | Resolution |
|---|---|---|
| D1 | Send vs scope | **Proceed now, additive schema OK.** All 5 streams buildable now; send decoupled. |
| D2 | Galaxy postprocessing dep | **Add pmndrs `postprocessing` + `@react-three/postprocessing`** (same org as installed fiber/drei). Enables UnrealBloom + ACES tone-mapping. |
| D3 | Technique gating | **Per-video free/premium toggle**, admin-settable; metadata (existence, filters, thumbnails) always free. Watching a *premium-flagged* video needs Premium+. This is OLD BBL's `isPremium` model. Default granularity = **per-`Technique`** (each technique = one lesson video); escalate to per-`MediaAttachment` only if techniques routinely carry multiple independently-gated videos (open sub-decision O1). |
| D4 | Dirty Dozen roster | **The five Rigan-Machado–promoted members of the historical Dozen:** Bob Bass (#8), Rick Williams (#9), Chris Haueter (#10), David Meyer (#11), John Will (#12). Exclude Renato Magno (not on the official list), Cindy Omatsu, Bill Hosken, Jerry Smith. Apply BBL editorial framing (**Bob Bass first**, per his own account to the operator — conventional lists put him #8). Canonical source = BJJ Heroes "Dirty Dozen" list. |
| D5 | Two post surfaces | Confirmed both live: **Blog `Post` `/blog`** (staff: Brian + Tony Hua) vs **Community `CommunityPost` `/posts`** (members). Operator wants a **staff-blog card gallery below the community-posts CTA** on the landing. |

**Defaulted (recommended, not grilled — flip on request):**

- **Galaxy "design skill":** no `/design-skill` exists. Path = `prototype` skill to explore 2–3 looks on
  the isolated `/app/beta/galaxy` route → Cody build → **Desi** visual review + **Doug** WebGL verify via
  an isolated Playwright chromium (browser MCPs lock; WebGL needs real headless — NOT qlmanage).
  `design-an-interface` is the wrong tool (it explores API/module shape, not visual craft).
- **Galaxy palette:** keep the role palette (root/legend/instructor/student is **semantic**, not brand
  color); document it; do **not** wire to `BrandSettings` (format mismatch — galaxy hex vs SoT HSL
  triples — for near-zero visual gain).
- **Technique belt filter:** **Rank-range FKs** (`beltLevelMin/Max` bounded by `Rank.sortOrder`), not
  `Tag[]`. Schema is purpose-built for the range; `min==max` reproduces OLD's single-belt behavior; the
  Tag route would leave the FKs dead.
- **Directory scope:** keep the clean faceted listing (the "what would Apple do" answer); **add** the
  member carousels; **defer** the WP-style map behind the globe's geo data (§7 cross-stream dep); **skip**
  distance/program facets for now.

---

## 1. Stream A — Galaxy visual pass  (`galaxy-polish`)

**Target:** `/app/beta/galaxy`. Current state = competent prototype (`meshStandardMaterial`, ambient + 3
pointLights, drei `<Stars>`/`<Sparkles>`, flat bg) with **zero** bloom / EffectComposer / tone-mapping.
`three@0.182 / @react-three/fiber@9.4 / @react-three/drei@10.7 / gsap@3.13` installed; postprocessing NOT.

**Perf ceiling (fix FIRST, before postprocessing):** every node renders a drei `<Html>` DOM label button
(mock = 50 nodes; real = one per verified member, unbounded), unconditionally, each reprojecting per frame.
Layering an EffectComposer on top of 50+ compositing DOM subtrees will tank the frame rate.

| Old→New | Disposition |
|---|---|
| NASA-level "pop-off" look | **BUILD** — greenfield postprocessing stack |
| Per-node labels | **REFACTOR** — DOM `<Html>` → billboarded labels |

**Slices** (single file cluster: `components/web/lineage/galaxy/*` + `apps/web/package.json`):

- **A0 — Perf ceiling.** Replace per-node drei `<Html>` DOM labels with drei `<Billboard>` + `<Text>` (or
  zoom/selection-gated labels + LOD). Memoize/dispose the per-render `THREE.Line`/`LineBasicMaterial` edge
  allocations (`BblLineageGalaxy.tsx:203-219`). **Done:** 65-node real graph renders labels with no
  per-frame DOM layout; edge geometry allocated once. *Prereq for A1.*
- **A1 — Bloom + tone-mapping.** Add the two pmndrs deps; wrap the Canvas in `<EffectComposer>` with
  selective/emissive **UnrealBloom** + **ACESFilmic** tone-mapping + HDR-range emissive on the star nodes;
  vignette. **Done:** stars bloom; root/legend planets read as light sources; no SSR regression (route
  stays `ssr:false`).
- **A2 — Depth & atmosphere.** Denser instanced starfield + parallax; additive-blend shader glow refinement
  on node halos; optional DoF. **Done:** a visibly deeper field vs the current flat `<Stars>`.

**Route → Cody (build) → Doug (perf + WebGL screenshot via isolated Playwright chromium) + Desi (visual craft).**
Independent of every other stream.

---

## 2. Stream B — Member globe  (`globe-data+render`)

**Reference:** azmth.space (dotted-marker globe). **Greenfield** — no globe lib, no component.

**Data-first (dispatch correction):** `DirectoryProfile` (Passport's 1:1 satellite) **already carries
structured `locationCity` / `locationRegion` / `locationCountry`**, per-member and already seeded — the
lowest-friction pin source. **Zero lat/lng exists anywhere**, so a geocode step + coordinate storage is
unavoidable regardless. Realistic pin count today = tens (~25 lineage nodes / single-digit member
locations in seeds), not hundreds. The school-address path is blocked (no org addresses populated; the
prod BBL org has none).

**Slices:**

- **B0 — Geo data (schema, additive).** Add `latitude Float?` / `longitude Float?` to `DirectoryProfile`
  (member-rooted, per D1). Backfill via a **static build-time geocode** of the existing `location*` fields
  (+ `Passport.currentResidence` fallback) — commit a `city → lat/lng` lookup or a one-time geocode script
  output; **no runtime geocoding dependency / API key**. **Done:** every seeded member with a location has
  coordinates; migration hand-authored + `migrate deploy` (see §7 shared-DB rule).
- **B1 — Globe render.** Add a globe lib — **recommended `cobe`** (lightweight, matches the azmth dotted
  look, no `three` dep) *or* `three-globe` (rides the installed three, lives in an R3F canvas). Build the
  globe with member pins; pin → profile drawer/link. **Done:** globe renders real member pins from B0 data
  on a route TBD (candidate: `/app/beta/globe`, mirroring the galaxy beta gate). *(Lib choice = open
  sub-decision O2 — confirm with Desi on the look.)*

**Depends on:** B0 → B1. **Route → Cody → Doug + Desi.** Otherwise independent. **Note:** B0's coordinates
are exactly what a future Directory map (Stream C, deferred) would reuse — B0 unblocks both.

---

## 3. Stream C — Directory + Profile parity  (`directory-profile-parity`)  ← biggest

**Already blueprinted:** `BBL_PARITY_SPEC.md` (SESSION_0408) maps every legacy surface to the current
component set — **refresh + execute it**, don't restart. **Tier packaging is fully wired** (`canRenderProfile`
free / `canRenderRichMedia` premium+, applied in `profile-projection.ts`) — **no work there.**

**Topology (post-SESSION_0522):** `/me` is **dead-but-present** (pure `redirect()`); everything edits via
`PassportEditor` (dashboard Profile tab + inline `ProfileEditDrawer`). TICKET-0502-A's "two trees to merge"
is **superseded** — one public renderer (`/directory/[slug]` → `PublicProfile`) + one editor; the owner arm
gets **deleted, not merged**.

**Greenfield gaps, ranked (from the parity diff):**

| Slice | Gap | Disposition |
|---|---|---|
| **C0** | Owner-arm cleanup — delete dead `owner-profile.tsx` + `me/_components/me-profile/*` (TICKET-0502-A / SESSION_0522 TASK_04) | **DELETE** — load-bearing prerequisite; safe (`/me` already redirects) |
| **C1** | Profile media-highlights carousels (technique videos + podcasts + instructor posts rails) + a `profileMedia`-style DTO, rich-media gated | **COMPOSE** — reuse the Embla `Carousel` primitive; feature/DTO greenfield |
| **C2** | Passport depth — photo carousel (profile/promotion/certificate) + promotion details (date/location/promoter) + selected-instructor block + member-since + branch label + on-card tier badge on `BjjPassportCard` | **BUILD** on the existing thin card |
| **C3** | Public belt-history timeline parity — attributed, dated, clickable (promoter avatar + school logo) timeline on the public profile | **REUSE** — `LineageRankHistoryTab` exists but only on the dead owner arm; reconnect to public |
| **C4** | Profile stats + achievements + training sections (stat cards, achievements grid, training styles) | **COMPOSE** — flat-section additions |
| **C5** | Directory member carousels (Spotlight / Verified) | **COMPOSE** — reuse Embla carousel; no geo |
| **C6** ⏸ | Directory **map** + distance/program facets | **DEFER** — the map depends on **B0** coordinates (§7) |

**Guardrail (page-review recipe):** run the **≥2-page usage grep** before touching any profile/directory
component — most are shared (flag-only), so scope shrinks to page-owned islands + net-new feature files.
Keep public presentation components fetch-free (no private-field leak); person-rooted reads only.

**Sequencing:** C0 first (cleanup), then C1–C5 in parallel-ish slices; C6 waits on B0. This is a **2–3
session** lane. **Route → Cody per slice → Desi (design/reuse) + Doug (verify).**

---

## 4. Stream D — Technique video carousels  (`technique-browser`)

**Schema is ready** (`position` + `category` enums, `beltLevelMin/MaxId` Rank FKs, `Category[]`/`Tag[]`).
**Corrections:** the **carousel itself is fully greenfield** (the only `VideoCarousel` is discipline-scoped
+ stubbed "coming soon"); **belt is dark end-to-end** (schema→query→payload→UI); **no premium field exists**
(only `isPublished`). Parity target = OLD `BBLCurriculumRail` (per-category snap-scroll rail).

| Slice | Work | Notes |
|---|---|---|
| **D0** | **Gating field (schema, additive)** — `Technique.isPremium Boolean @default(false)` (or `accessTier`), admin-settable | Per D3 / O1; hand-authored migration (§7) |
| **D1** | **Belt facet end-to-end** — belt param in `schema.ts`, `BeltFilter` facet, **Rank-range predicate** in `queries.ts` (`beltLevelMin/Max` via `sortOrder`), select belt in `payloads.ts`, belt badge on `technique-card.tsx` | Decision resolved: range FKs |
| **D2** | **Technique video carousel/rails** — per-position (and/or per-category) snap-scroll rails w/ arrows/dots/video-indicator | Greenfield; reuse Embla `Carousel` |
| **D3** | **Gating render** — gate video playback behind Premium+ when `isPremium`; crown badge on gated cards; metadata always public | Reuse `canRenderRichMedia`/entitlement-key pattern from `lineage-tier-policy.ts` |
| **D4** ⏸ | View toggle (grid/list/rail), richer card (thumbnail/play/duration), richer watch page (YouTube/Vimeo/signed-URL) | Lower priority; can trail |

**Depends on:** D0 → D3. D1, D2 independent. **Route → Cody → Doug + Desi.** Independent of A/B/C/E.

---

## 5. Stream E — Blog gallery + Dirty Dozen  (`blog-dozen`)

Both surfaces confirmed live: **Blog `Post` `/blog`** (staff) vs **Community `CommunityPost` `/posts`**
(members). Blog `PostFeed` is already an editorial re-skin; `Post.categories` drive flair tabs but are
**unpopulated** (taxonomy renders empty).

| Slice | Work |
|---|---|
| **E0** | **Dozen roster reconciliation (D4).** Seed (`seed-baseline-lineage.ts:834`): drop `bill-hosken` + `jerry-smith` from `DIRTY_DOZEN_KEYS` (keep as lineage members, not in the Dozen group). Landing (`bbl-landing-content.ts:76`): drop Renato Magno. Both → the five Machado members. Apply Bob-Bass-first ordering. |
| **E1** | **Articles → `Post`.** Seed 3 legacy promotion articles (Bob Bass, John Will, Dave Meyer from `monorepo .../data/featuredArticles.js`); **author 2 new** (Rick Williams, Chris Haueter). Keep the existing overview Post; dedupe legacy overview #1. Renato's legacy article → unfeatured (publish standalone or skip). **(E1 authoring may need operator/editorial input.)** |
| **E2** | **Dozen card wiring.** Extend `DirtyDozenMember` (`bbl-landing-content.ts:67`) with `articleSlug?` / `teaser?`; repoint `bbl-dirty-dozen.tsx:30` cards `BBL_ROUTES.lineage` → `/blog/[slug]` (lineage fallback); render teaser. |
| **E3** | **Blog gallery entry point (D5).** Point the landing **community CTA** ("Community Feed" promo, currently mislinked to `/blog`) → `/posts`; add a **live staff-`Post` card gallery** (`findPublishedPosts(Brand.BBL)`) **directly below** it. Landing composition, not greenfield. |
| **E4** ⏸ | Populate `Post.categories` on seeded/authored posts to light the flair tabs. |

**Depends on:** E0 → E1/E2 (roster must be fixed before article-linking). E3 independent. **Route → Cody →
Doug + Desi.** Independent of A/B/C/D.

---

## 6. Agent routing

| Stream | Build | Verify |
|---|---|---|
| A galaxy | Cody | Doug (perf + WebGL isolated-Playwright screenshot) · Desi (visual) |
| B globe | Cody | Doug (data + render) · Desi (look, lib choice) |
| C directory/profile | Cody (per slice) | Desi (design/reuse — run the ≥2-page grep) · Doug (verify) |
| D technique | Cody | Doug (gate + query) · Desi (rail UX) |
| E blog/dozen | Cody | Doug (roster/seed) · Desi (landing composition) |

Architecture / worktree-slicing / migration-sequencing questions → **Giddy**. `prototype` skill available
for galaxy (A) look-exploration before committing.

---

## 7. Dependencies, concurrency & constraints

**Dependency graph:**

```
B0 (globe coords) ──► B1 (globe render)
        └───────────► C6 (directory map)      [cross-stream — the only one]
C0 (owner-arm delete) ──► C1..C5
D0 (gate field) ──► D3 (gate render)
E0 (roster) ──► E1 (articles), E2 (card wiring)
```

**Concurrency verdict:** Streams **A, B, C, D, E touch disjoint file sets → 5 parallel build sessions**
(separate worktrees). Only C6 (map) is cross-stream-blocked (waits on B0); defer it. Within C, C0 leads.

**Two coordination points (must not be ignored):**

1. **Shared `prisma/schema.prisma`.** B0 and D0 both edit it. Parallel edits **conflict on that one file**.
   Serialize the schema edits (author both additive blocks in a short prep step, or land B0's schema then
   D0's), even though the migration *files* are separate.
2. **Shared local DB (parallel-session trap).** Worktrees share ONE local Postgres. **`migrate dev` is
   BANNED** (it resets the shared DB). B0 + D0 each **hand-author an additive migration** and apply via
   `migrate deploy` (additive → safe; auto-applies to prod via `prebuild → migrate deploy`, so the file
   MUST be committed). See the `parallel-session-shared-db` + `prisma-prod-migration-flow` memories.

**Recommended wave order** (if not all 5 run at once):

- **Wave 1 (pure presentation, zero schema, highest signal):** A (galaxy), C0–C5 (profile parity), E
  (blog/dozen), D1–D2 (belt facet + rails).
- **Wave 2 (additive schema):** B0+B1 (globe), D0+D3 (gating) — coordinate the two schema.prisma edits.
- **Wave 3 (cross-stream):** C6 (directory map, on B0's coordinates).

---

## 8. Open sub-decisions (non-blocking — resolve at build)

- **O1 — Technique gate granularity:** per-`Technique` (default; each technique = one video) vs
  per-`MediaAttachment` (literal "video by video" if a technique carries multiple videos). Confirm against
  real technique→video cardinality when D0 starts.
- **O2 — Globe lib:** `cobe` (recommended — light, dotted-marker azmth look) vs `three-globe`/`react-globe.gl`
  (reuse installed three, R3F-native). Decide with Desi on the target look when B1 starts.
- **O3 — Globe route:** `/app/beta/globe` (beta-gated, mirrors galaxy) vs a public landing surface. Default
  beta while data coverage is thin (tens of pins).
- **O4 — Renato's legacy article:** publish as a standalone `/blog` Post (un-linked to a Dozen card) vs
  hold. Editorial call at E1.

---

## 9. Scope guard

Adjacent debt surfaced during discovery but **out of scope** for this epic (log, don't inline-fix):
`BBL_ROUTES.posts` key names `/blog` while community lives at `/posts` (naming drift); the "Community Feed"
landing promo is **mislinked to `/blog`** (fixed incidentally by E3); `Post.tags` fetched in the payload but
read by no UI (YAGNI). New work discovered mid-build → the SESSION `Open decisions / blockers`, not inline.
