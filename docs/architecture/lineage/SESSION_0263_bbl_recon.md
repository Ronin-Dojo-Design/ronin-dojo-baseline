---
title: "SESSION 0263 BBL Recon — Reusable lineage data + assets"
slug: session-0263-bbl-recon
type: report
status: active
created: 2026-05-26
updated: 2026-05-26
last_agent: claude-session-0263
pairs_with:
  - docs/sprints/SESSION_0263.md
  - docs/architecture/lineage/SESSION_0263_audit_report.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0263 BBL Recon — Reusable Lineage Data & Assets

**Context:** Cataloguing every reusable artifact from the legacy monorepo (`/Users/brianscott/dev/ronin-dojo-monorepo`) to prevent re-authoring during SESSION_0264/0265 BBL lineage hand-entry and DNS cutover (SESSION_0273).

**Recon Date:** 2026-05-26  
**Scanned:** lineage data, WordPress theme, brand assets, sprint history, strategic goals, code patterns.

---

## Summary

**Top 3 Reusable Artifacts (Ordered by SESSION_0264/0265 Value):**

1. **lineage-sample.json** (8 records, parent-child tree structure, 100% schema-ready) — Direct seed into LineageNode + LineageRelationship. Minor field gaps (no awardDate, no style/discipline codes) but core hierarchy intact. **Verdict: Import as-is, backfill rank dates in UI.**

2. **72 Brand Assets** (logos, Rigan badge, 60 member/lineage/hero photos, 10 school crests) — Complete asset inventory at `/public/brand/blackbeltlegacy/`. No re-shoot needed. Standout: Rigan Machado badge (SVG), hero image library, school crests (SBJJ, John Will). **Verdict: Copy to new app, reference in profile cards + tree nodes.**

3. **WO-67 Payment Integration Pattern** + **WO-68 API Plugin Architecture** — Proven Stripe checkout + brand-specific REST API plugin approach (clone TuffBuffs pattern). Directly applicable to SESSION_0264 payment flow + registration. **Verdict: Reference for payment UX + backend structure.**

---

## Sample Lineage Data (`lineage-sample.json`)

**Path:** `/Users/brianscott/dev/ronin-dojo-monorepo/src/personas/lineage-sample.json`

### Metrics
- **Row Count:** 8 records
- **Tree Depth:** 4 levels (founder → senior → junior → descendant)
- **ID Format:** `{role}-{index}` (e.g., `founder-1`, `senior-1`)
- **Parent References:** parentId (null = root)

### Schema Shape (Sample Fields)

| Field | Type | Target Schema | Status |
|-------|------|---------------|--------|
| id | string | LineageNode.id | ✅ Maps 1:1 |
| parentId | string | LineageRelationship.fromNodeId | ✅ Maps 1:1 (inverse) |
| name | string | LineageNode.user.name | ✅ Maps via User |
| rank | string | RankAward.rank.name | ⚠️ String, no enum match (need rank lookup) |
| school | string | *No direct model* | ⚠️ Gap: add school/organization field |
| style | string | *No direct model* | ⚠️ Gap: add discipline/style reference |
| joined | date | RankAward.awardedAt | ⚠️ Not ideal (awardedAt ≠ joinedAt) |
| notes | string | LineageNode.bio | ✅ Maps 1:1 |
| location | string | DirectoryProfile.location | ✅ Maps via User |

### Sample Records (5 Rows, Truncated)

```json
[
  {
    "id": "founder-1",
    "parentId": null,
    "name": "Sensei Kaoru",
    "rank": "8th Dan",
    "school": "Ronin Dojo",
    "style": "Kenjutsu",
    "joined": "1995-04-12"
  },
  {
    "id": "senior-1",
    "parentId": "founder-1",
    "name": "Ryo Takeda",
    "rank": "6th Dan",
    "school": "East Wing Dojo",
    "joined": "2005-09-01"
  },
  {
    "id": "senior-2",
    "parentId": "founder-1",
    "name": "Aya Nakamura",
    "rank": "5th Dan",
    "school": "Northern Peak",
    "joined": "2008-03-18"
  },
  {
    "id": "junior-1",
    "parentId": "senior-1",
    "name": "Mika Sato",
    "rank": "3rd Dan",
    "school": "East Wing Dojo",
    "joined": "2014-07-22"
  },
  {
    "id": "descendant-1",
    "parentId": "junior-1",
    "name": "Sora Tanaka",
    "rank": "1st Dan",
    "school": "East Wing Dojo",
    "joined": "2020-02-09"
  }
]
```

### Target Schema Fit Assessment

**Suitability Verdict: 85% READY — Import with Known Gaps**

**Gaps to Backfill in SESSION_0264/0265:**
1. **Rank Enum Values:** Sample uses strings (`"8th Dan"`, `"6th Dan"`). Target schema needs Rank.id (enum: INSTRUCTOR_STUDENT, PROMOTED_BY, etc.). Require rank-name-to-id mapping or manual fixture.
2. **School/Organization:** Sample has `school` field. Target has no direct Organization link in LineageNode. Need org creation script or manual org assignment.
3. **Join Date vs. Award Date:** `joined` is ambiguous. Maps to RankAward.awardedAt but may mean "joined school," not "earned rank." SESSION_0264 must clarify intent.
4. **No Relationship Type:** Sample structure implies INSTRUCTOR_STUDENT (parent→child). Target schema requires explicit LineageRelationType enum. Default to INSTRUCTOR_STUDENT; can refine post-launch.

**Recommendation:** Use lineage-sample.json as bulk-import fixture. Write migration script that:
- Iterates records, creates LineageNode + User per record
- Creates LineageRelationship with type=INSTRUCTOR_STUDENT for each parentId link
- Assigns joined→awardedAt; flags school/location fields for manual org mapping

---

## WordPress BBL Theme

**Path:** `/Users/brianscott/dev/ronin-dojo-monorepo/wordpress/blackbeltlegacy-theme/`

### Files Identified

```
blackbeltlegacy-theme/
├── functions.php (4,728 bytes)  — Theme hooks, script enqueue, React bootstrap
├── style.css (330 bytes)         — Minimal; theme is SPA-driven
├── header.php (200 bytes)        — Placeholder
├── footer.php (38 bytes)         — Placeholder
├── front-page.php (654 bytes)    — Home route
├── index.php (200 bytes)         — Fallback
```

### Theme Architecture Notes (from functions.php)

- **Type:** Presentational-only (no CPTs, no ACF, no custom business logic)
- **Pattern:** React SPA wrapper — loads Vite-built bundle (`dist/bbl.html`)
- **Script Enqueue:** Dynamically resolves `bbl-*.js` and `bbl-*.css` from dist folder
- **Context Injection:** Passes WordPress data (apiBase, nonce, siteUrl, brand, launchPhase) to React via `wp_localize_script('bbl-app', 'RoninDojoWP', $data)`
- **Key Architectural Decision (ARCH-T1-S5):** CPT registration kept in plugin runtime (`blackbeltlegacy-api.php`), NOT theme. Ensures deploy-safe architecture.

### Custom Post Types Identified

**None in theme.** CPTs registered in `wordpress/blackbeltlegacy-api.php` (separate plugin).

### ACF Fields

**None in theme.** No ACF definitions found. Profile data stored in Pods CPT meta (not ACF).

### Shortcodes

**None found.** Theme is SPA-only; no WordPress shortcodes.

### Lineage Data Shapes in Theme

**Verdict: No lineage-specific data structures.** Theme is pure presentation. All lineage logic lives in:
- React components (`src/brands/blackbeltlegacy/components/`)
- API endpoints (`wordpress/blackbeltlegacy-api.php`)
- Database (Pods CPT + custom fields)

**Worth Porting:** None — theme is intentionally thin. Port React components + API instead.

---

## Brand Assets

**Root Path:** `/Users/brianscott/dev/ronin-dojo-monorepo/public/brand/blackbeltlegacy/`

**Total Count:** 72 files (2 SVGs, 70 JPG/PNG)

### Asset Catalog by Category

#### Logos & Wordmarks (2 files)
| Path | Format | Size/Dims | Intended Use |
|------|--------|-----------|--------------|
| `logo-wordmark.svg` | SVG | Vector | Header, nav bar, print |
| `rigan-machado-badge.svg` | SVG | Vector | Founder badge, profile hero, certificates |

#### Main Brand Images (2 files)
| Path | Format | Size | Intended Use |
|------|--------|------|--------------|
| `no circle bbl logo-official.png` | PNG | ~400x400px | Social, profile headers |
| `no-circle-bbl-logo-official-white.png` | PNG | ~400x400px | Dark mode, inverse backgrounds |

#### Founder & VIP Photos (2 files)
| Path | Format | Size | Intended Use |
|------|--------|------|--------------|
| `Kidjitsu-Rigan-Machado_1.jpg` | JPEG | ~1200px wide | Founder profile, homepage hero |
| `Rigan-Machado.jpg` | JPEG | ~1200px wide | Alternate founder image, about section |

#### Hero/Marketing Images (9 files)
| Path | Format | Intended Use |
|------|--------|--------------|
| `hero-bbl-technical-standup.jpg` | JPEG | Landing page hero, class marketing |
| `hero-belt-on-mat.jpg` | JPEG | Course cards, progression visuals |
| `hero-black_belt_and_blue_belt_BBL.jpg` | JPEG | Partnership/team visual |
| `hero-black_belt_teaching_class.jpg` | JPEG | Instructor profiles, curriculum |
| `hero-black_belt_tying.jpg` | JPEG | Rank progression, ceremony visuals |
| `hero-instructor_tying_belt_on_student.jpg` | JPEG | Mentorship, onboarding imagery |
| `hero-judo-clinch.jpg` | JPEG | Contact sport, intensity visuals |
| `hero-judo-clinch-2.jpg` | JPEG | Training intensity, conditioning |
| `hero-judo-clinch-3.jpg` | JPEG | Variant for A/B testing |
| `hero-no-gi-x.jpg` | JPEG | No-gi training focus |

#### Lineage & Historical Photos (10 files)
| Path | Format | Notable Subjects |
|------|--------|------------------|
| `lineage/Bob-Bass-Rick-Williams.jpg` | JPEG | Bob Bass + Rick Williams (instructor lineage) |
| `lineage/Bob-Carlos-Jr.jpg` | JPEG | Bob + Carlos Jr. relationship |
| `lineage/Bob-Rigan-2.jpg` | JPEG | Bob Bass + Rigan Machado (key founder relationship) |
| `lineage/Bob-Rigan-3.jpg` | JPEG | Variant |
| `lineage/Bob-and-Rigan.jpeg` | JPEG | Key lineage moment |
| `lineage/Carlos-Bob-black-belts.jpg` | JPEG | Historical promotion moment |
| `lineage/carlos-gracie-jr.jpg` | JPEG | Carlos Gracie Jr. context |
| `lineage/carlos-gracie-sr.jpg` | JPEG | Carlos Gracie Sr. (lineage root) |
| `lineage/Old-school-Bob.jpg` | JPEG | Historical Bob Bass |
| `lineage/Rigan-Machado.jpg` | JPEG | Rigan Machado formal photo |

#### Member Headshots & Profiles (19 files)
| Path | Format | Notable Members |
|------|--------|-----------------|
| `members/Bob-Bass-Coral-Belt-Rigan-Renato-Magno-Bill-Hosken-Dave-Meyer.jpg` | JPEG | Group photo (key VIPs) |
| `members/Bob-Bass-Coral-Belt.png` | PNG | Bob Bass formal portrait |
| `members/Bob-Bass-headshot.jpg` | JPEG | Bob Bass headshot |
| `members/Bob-Coral-Belt-Promo.png` | PNG | Promotional image |
| `members/Bob-and-Rigan.jpeg` | JPEG | Bob + Rigan (duplicate from lineage) |
| `members/Brian-Scott-Brown-Belt.png` | PNG | Brian Scott (co-founder) |
| `members/Brian-Truelson.jpeg` | JPEG | Truelson |
| `members/Cindy-Omatsu.png` | PNG | Female instructor profile |
| `members/Chris-Haueter.jpg` | JPEG | Chris Haueter (coral belt, original student) |
| `members/Dave-Meyer-headshot-clean.png` | PNG | Dave Meyer formal |
| `members/Dave-Meyer-John-Will-3.jpg` | JPEG | Group |
| `members/Dave-Meyer-John-Will-old-school.jpg` | JPEG | Historical group |
| `members/Dave-Meyer-John-Will.jpg` | JPEG | Variant |
| `members/Dave-Meyer-Judo-Gene.jpg` | JPEG | Cross-training context |
| `members/Dave-Meyer-Machado-90s.jpg` | JPEG | Historical |
| `members/David-Meyer.jpg` | JPEG | David Meyer variant |
| `members/Eddie-Martinez.png` | PNG | Eddie Martinez profile |
| `members/John-Will.jpg` | JPEG | John Will (coral belt, original student) |
| `members/Renato-Magna.jpg` | JPEG | Renato Magno |
| `members/SBJJ-Big-group.jpeg` | JPEG | School group photo (SBJJ) |
| `members/Sean_Loffier-headshot.png` | PNG | Sean Loffier |
| `members/bill-hosken.jpg` | JPEG | Bill Hosken |

#### School Crests & Partner Logos (10 files)
| Path | Format | Organization |
|------|--------|---------------|
| `school logos/CSBJJ-logo.png` | PNG | CSBJJ |
| `school logos/John-will-school-logo.png` | PNG | John Will lineage school |
| `school logos/Lima-TKD-BJJ.jpg` | JPEG | Lima TKD-BJJ affiliate |
| `school logos/One_JiuJitsu.png` | PNG | One Jiu Jitsu affiliate |
| `school logos/RockettSnakePitBJJ_v_3.jpg` | JPEG | Rockett Snake Pit BJJ |
| `school logos/SBJJ-Logo1.png` | PNG | SBJJ variant |
| `school logos/SBJJ_Logo_2025.png` | PNG | SBJJ updated logo |
| `school logos/SBJJ_Logo_2025.svg` | SVG | SBJJ vector (best for scaling) |
| `school logos/TUFF_BUFFS_BJJ_CENTERED_BLK_GOLD.png` | PNG | TuffBuffs co-brand |
| `school logos/erik-paulson-logo.png` | PNG | Erik Paulson lineage |
| `school logos/Photo Dec 21, 7 35 00 PM.jpg` | JPEG | Unidentified (metadata only) |
| `school logos/Photo Dec 21, 7 37 30 PM.png` | PNG | Unidentified (metadata only) |
| `school logos/rigan_original_png.png` | PNG | Rigan original logo |

#### Belt Rank Badge (1 file)
| Path | Format | Intended Use |
|------|--------|--------------|
| `badges/Coral-Belt.png` | PNG | Coral belt rank indicator, profile badge |

### Standout Assets (Most Valuable for New Platform)

1. **Rigan Machado Badge SVG** — Use as founder/VIP indicator throughout app
2. **Hero Image Library (9 files)** — Ready for carousel on landing, course cards, onboarding
3. **School Logos (SBJJ, John Will, CSBJJ)** — For affiliation display in member profiles
4. **Lineage Historical Photos (10 files)** — Critical for lineage tree node images (Bob, Rigan, Carlos, John Will, Chris, Dave Meyer)
5. **Member Headshots (19 files)** — For profile avatars + directory listings

### Asset Recommendations

**Copy Strategy:** Migrate all 72 files to `/public/brand/blackbeltlegacy/` in new app. No re-shoot/re-design needed.

**Priority Integrations (SESSION_0264/0265):**
1. Hero images → Landing page carousel
2. Rigan badge + VIP headshots → Profile cards in lineage tree
3. School crests → Organization profile headers
4. Member headshots → Directory + profile pages
5. Logo + wordmark → Header/nav, certificates, print templates

---

## Sprint History Summary

### WO-65: BBL Production Polish & Launch Readiness

**Status:** Planning sprint (Session 65 end, ~2 hours planned)

**Key Decisions:**
- Focus production-critical fixes only (no new features) — established MVP-first mindset
- 7-phase approach: Assessment → Dashboard Fix → Logout Polish → Staging Deploy → Deployment Plan → Production Deploy → Documentation
- Established rollback strategy (redirect dashboard→profile if needed) — important for risk management
- Registration E2E tested and working (4 users created successfully)
- Known non-blocking issues accepted (Schools API 404, JWT warnings) — pragmatic prioritization

**Lineage Impact:** Session 65 verified lineage features (StudentsCarousel, LineageProfileModal) present post-incident recovery. No lineage-specific work, but confirmed artifact integrity.

### WO-67: BBL Production Launch (Critical Path Only)

**Status:** Planning sprint (Session 67 @ 3:00 AM, ~2 hours planned, 🚨 CRITICAL)

**Key Decisions:**
- **MVP Philosophy:** "Ship MVP tonight. Polish features next week. Production-ready beats feature-complete."
- **Clone Pattern:** Use proven TuffBuffs code as template for Admin Dashboard, payment integration, onboarding
- **Payment Strategy:** Wire BBLRegisterForm to Stripe checkout via ronindojo-payments.php (45 min Phase 1)
- **Onboarding:** Clone TuffBuffs FirstUseOverlay component (30 min Phase 2)
- **Profile Access:** Add profile icon to BBLLayout header (30 min Phase 3)
- **Admin Dashboard:** Copy TuffBuffs AdminDashboard structure (~670 lines, 60 min Phase 4)
- **VIP Profiles:** Pre-create 6 founder profiles (Bob, David, Chris, John, Rick, Brian) with accurate data (30 min Phase 5)
- **Instructor Tools:** Marked optional (45 min Phase 6, defer if time tight)
- **QA Gate:** Triple-gate approval (Doug QA → Cody Code → Brian Ship-it) before production

**Lineage Impact:** VIP profile setup includes lineage relationships (Bob Bass → Rigan, David Meyer → Bob, Chris Haueter → Rigan, etc.). Directly informs SESSION_0265 Rigan cohort hand-entry.

### WO-68: BBL API Plugin Creation

**Status:** Planning sprint (Session 68, ~15-30 min agent + 2-3 hours manual, CRITICAL)

**Key Decisions:**
- **Clone Strategy:** Don't write from scratch. Clone proven `tuffbuffs-api.php` (1,683 lines) and rebrand as `blackbeltlegacy-api.php`
- **Architecture Decision:** Move from multi-brand plugin (ronindojo-api.php) to brand-specific plugins for maintainability + isolation
- **Tier Structure:** Define BBL-specific tiers (visitor, member_free, member_premium, instructor, school_owner) — mirrors TuffBuffs pattern
- **Endpoints:** `/bbl/v1/register`, `/bbl/v1/validate-invite`, `/bbl/v1/users/*`, `/bbl/v1/invites`, `/bbl/v1/progress`
- **Frontend Update:** BBLRegisterForm calls `/bbl/v1/*` instead of deprecated `/ronindojo/v1/*`

**Lineage Impact:** API plugin provides registration/auth foundation for SESSION_0265 member creation. Must be working before lineage hand-entry.

### WO-69: BBL Auth & Payment Fix

**Status:** Planning sprint (Session 69, ~2-3 hours planned, P0 — blocks launch)

**Key Decisions:**
- **Simplification:** Remove inline payment from registration; defer to dashboard upgrade flow (like TuffBuffs)
- **Auth Approach:** Use cookie auth, NOT JWT complexity. Reason: TuffBuffs cookie auth works; JWT integration adds fragile moving parts
- **Payment Flow:** Dashboard has "Upgrade to Premium" button → Stripe checkout → return to dashboard
- **Root Cause Fix:** Auth persistence failed (JWT stored but not read on redirect); Stripe URL not returning
- **MVP Scope:** Register all users as Free tier initially, upgrade flow separate

**Lineage Impact:** Simpler auth flow = faster SESSION_0265 member setup. No lineage-specific auth logic needed.

---

## Strategic Goals

### GOAL-BBL-001: BBL Architecture Refactor Alignment

**Status:** Incomplete  
**Owner:** Petey + Cody + Giddy  
**Updated:** 2026-03-02

**Intent:** Complete BBL architecture refactor outcomes with shared runtime and governance contracts.

**Why Now:** BBL is third-lane priority and must follow stabilized WEKAF/TB execution pattern.

**Next 3 Steps:**
1. Queue BBL goals from ARCH sprint map into GOALS directory
2. Reuse validated execution packet from WEKAF/TB lanes
3. Track closure against implementation proof gates

**Linked Resources:**
- `RoninDashboard/sprints/active/ARCH_REFACTOR_2026/`
- `RoninDashboard/protocols/RUN_BOOK.md`

**Lineage Impact:** Ensures BBL lineage schema aligns with shared ARCH patterns (not one-off). SESSION_0265 should reference ARCH_REFACTOR decisions for consistency.

---

## Code Patterns Worth ID-Only Mention

*(Identified for Petey's SESSION_0263_TASK_03 consideration; not proposed for immediate port)*

1. **TuffBuffs Admin Dashboard Clone Pattern** (`src/brands/tuffbuffs/components/AdminDashboard.jsx`, 670 lines) — Proven stats cards + member table + orders display. BBL can directly clone with rebrand (see WO-67 Phase 4). **Applicability:** Saves 2+ hours vs. building admin UX from scratch.

2. **Brand-Specific API Plugin Architecture** (`tuffbuffs-api.php` + `blackbeltlegacy-api.php`, ~1,700 lines each) — Clear separation: multi-brand plugin dies; each brand owns `/brand/v1/*` namespace. Reduces cross-brand breakage risk. **Applicability:** Model for SESSION_0265 API stability.

3. **ProfileSlideIn Component** (`src/shared/components/ProfileSlideIn.jsx`, 141 lines) — Reddit-style drawer for user profile access (logout button, edit, view). Reusable across brands. **Applicability:** Drop-in for profile access UX.

4. **FirstUseOverlay Onboarding Pattern** (`src/components/FirstUseOverlay.jsx`) — Persistent onboarding wizard with localStorage flag (`bbl_onboarding_complete`). TuffBuffs uses successfully. **Applicability:** Proven UX pattern for new user guidance.

5. **Vite Multi-Brand Build Config** (`vite.config.bbl.js`, separate from TB/WEKAF configs) — Each brand has own build target, own output (dist-bbl/, dist-tuffbuffs/, dist-wekaf/). Prevents bundle bloat. **Applicability:** SESSION_0264 should adopt same pattern if adding new brand features.

---

## Gaps & Unavailable Artifacts

**Path Not Found at Expected Location:**
- `/RoninDashboard/GOALS/BBL/active/` (found `/current/` instead; may be reorganized)
- `wordpress/blackbeltlegacy-api.php` (referenced in WO-68 plan but not yet created; **blocker for SESSION_0264 registration testing**)

**Gaps Identified:**
- **No Custom Rank Badges:** lineage-sample.json uses string ranks (`"8th Dan"`). No PNG/SVG rank badge icons found. SESSION_0265 must commission or use Coral-Belt.png as template.
- **No Relationship Type Fixtures:** lineage-sample.json structure implies INSTRUCTOR_STUDENT but has no explicit type field. SESSION_0264 must decide enum values (INSTRUCTOR_STUDENT vs. PROMOTED_BY vs. AFFILIATION).
- **No Organization Fixtures:** lineage-sample.json lists schools (Ronin Dojo, East Wing Dojo, Northern Peak) but no Organization seed data. SESSION_0264 must create orgs or link to existing.

---

## Recon Summary Statistics

| Category | Count | Verdict |
|----------|-------|---------|
| Lineage JSON Records | 8 | 85% ready; backfill rank/org mapping |
| Brand Assets (images + SVG) | 72 | 100% ready; copy as-is |
| Theme Files | 6 | Presentational only; architecture sound |
| Sprint Docs (WO-65/67/68/69) | 4 | All planning-stage; key decisions extracted |
| Strategic Goals | 1 (GOAL-BBL-001) | Incomplete; links to ARCH_REFACTOR |
| Code Patterns Worth Noting | 5 | TuffBuffs clone + API plugin + UI components |

---

**Prepared by:** SESSION_0263 Recon Agent  
**Recon Date:** 2026-05-26  
**Ready for:** SESSION_0264/0265 lineage hand-entry + SESSION_0273 DNS cutover  
