---
title: "SESSION 0244 — Baseline content waterfall (planning + scoping only; execution deferred to SESSION_0245)"
slug: session-0244
type: session--plan
status: closed-full
created: 2026-05-24
updated: 2026-05-24
last_agent: claude-session-0244
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0243.md
  - docs/knowledge/wiki/dirstarter-docs-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0244 — Baseline content waterfall (PLANNING SESSION)

> **Session was PLANNING ONLY.** Brian's session-limit budget reached 8% after the 6-round Petey grill + Plan-agent dispatch + scope approval. Zero implementation in this session — every Phase 1–6 task below is deferred to **SESSION_0245** and intended for Codex pickup. SESSION_0244 captures the complete plan, brand facts, gap-scan results, and approval-gated implementation queue so the next session can execute without re-grilling.

## Date

2026-05-24

## Operator

Brian + claude-session-0244 (Petey orchestrating; Plan-agent + authoring subagents on tap)

## Goal

Three-stage waterfall:

1. **Plan-agent gap scan** across `docs/architecture/`, `docs/runbooks/`, `docs/knowledge/wiki/` to surface missing-or-stale baseline docs (L1 + architectural + runbook lens).
2. **Brian approves gap list** → author the gaps.
3. **Seed scripts written (NOT executed)** for real Baseline Martial Arts brand data — covering Organization, Disciplines, Programs, Techniques, Courses, Curriculum, Gear, Merch (PEOPLE + LINEAGE deferred to dedicated /lineage session).
4. **Fill placeholder copy** on the 7 SESSION_0242 + SESSION_0243 uplifted listing pages with real Baseline brand knowledge — data vs prose split decided per-page during Brian grill.

**Scope explicitly carved out:** /lineage page + LineageNode records + instructor/member bios + Brian's training history → dedicated future session with deep grill.

## Bow-in

### Previous session

- SESSION_0243 (`closed`) — Vercel prod rescued (workspace rename filter drift) + /directory + /members + /techniques uplifted to public parity chrome. Browse dropdown now 11 items.
- SESSION_0242 (`closed`) — uplifted /programs, /organizations, /gear, /merch.

### Branch and worktree

- Branch: `main` (clean at bow-in)
- HEAD at bow-in: (captured below)
- Worktree: this session operates in main repo working copy

### Graphify state

- 6920 nodes / 10780 edges / 1075 communities / 1339 files tracked (carried from SESSION_0243 close)
- Bow-in query: `baseline content waterfall docs gap scan seed scripts brand copy fill listing pages` → surfaced `seed-baseline-{listings,programs,owner,platform,launch}.ts`, `seed-tuffbuffs-merch.ts`, `seed-tuffbuffs-affiliate.ts`, `seed-gear-recommendations.ts`, `seed-content-atom-proof.ts`, content-engine-baseline doc pack. Per-area baseline seed pattern confirmed.

### Failed-steps + drift register check

- failed-steps-log: no open entries; all 24 entries `mitigated` or `closed`. Pattern 5 (deploy chain drift) requires bow-out Vercel ready check — applies here at close.
- drift-register: most recent entry D-016 (Radix→@base-ui/react migration) `closed`. No open drift items in baseline-content lane.

### Dirstarter alignment (WORKFLOW 5.0)

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | **Content** (page prose) + **Prisma** (seed scripts). Possibly indirect: **Theming** if brand copy lands in components. |
| Extension or replacement | **Extension** — populates existing models with brand-specific data; no schema or auth/storage changes. |
| Why justified | Six days past May 18 launch target; Baseline is P1 brand. Public pages currently render placeholders; need real brand presence before launch announce. |
| Risk if bypassed | Brand identity diluted at launch; demo + screenshots remain "lorem-ipsum-like" for the P1 brand. |

## Baseline Martial Arts — brand facts (captured during 6-round Brian grill)

### Identity

- **Name:** Baseline Martial Arts (BMA for short)
- **Founder + sole instructor (this session):** Brian Scott
- **Founded:** 2026-04-20
- **Lineage:** Spiritual successor to Tuff Buffs programs (founded by Brian in 2014); BMA continuation expands beyond CU-only operations
- **Public web:** <https://baselinemartialarts.com> (the site under build)
- **Instagram:** @brianscottmartialarts
- **Instructor email:** `brian@baselinemartialarts.com`

### Locations / venues

1. **University of Colorado Boulder Recreation Center** — majority of weekly classes (Rec Center Mat Room A). Registration handled by CU Rec Center. **Important constraint: text mention only, NO hyperlink permitted to the CU Rec Center page.**
2. **Wolchek Academy of Martial Arts** — GM Steve Wolk's school.
   - **Thursday 7:30 PM Eskrima** — Brian's class, $10 drop-in fee, paid via Stripe Payment Link (existing Stripe CLI setup) or Venmo (@TuffBuffs transitionally → will migrate to BMA handle later).
   - **Tuesday 7:15 PM** — Brian sometimes fills in for GM Steve Wolk (substitute role; not marketed as Brian's class).

### Disciplines (5 programs)

1. **Brazilian Jiu-Jitsu** — Ground fighting and submission grappling
2. **Muay Thai** — Art of Eight Limbs (Thai boxing)
3. **Boxing** — Western boxing fundamentals (the Sweet Science)
4. **Eskrima** — Filipino martial arts, stick/knife
5. **Self Defense** — Practical multi-discipline self-defense synthesis

### Brian Scott — full credential stack (sourced from monorepo `data/brianScottBios.js`)

- **8× World Champion + 14× National Champion** in Doce Pares Eskrima
- **5th Degree Black Belt Eskrima**, promoted by SGM Diony Cañete (2023)
- **1st Degree Black Belt BJJ** under Bob Bass (South Bay Jiu-Jitsu, Hermosa Beach, CA; Rigan Machado lineage)
- **Certified Kru Muay Thai** under Kru Suchat "Arthur" Chunton (Sak Va Roon, Bangkok)
- **USA Boxing Certified Coach** · trained under Dave Gaudette (Front Range Boxing Academy, Boulder); Golden Gloves 2003 + 2005
- **4th Degree Black Belt Sport Karate**
- **1st Degree Black Belt Kajukenbo** (John Hackleman / Chuck Liddell lineage)
- **WEKAF Rocky Mountain Regional Director** + Head Center Referee
- **Records:** MMA 2-3 amateur · Muay Thai 5-0 amateur

### Lineage strands (THIS SESSION = bio strings + stub LineageNode terminal-node trees; full deep grill = /lineage session)

- **BJJ:** Mitsuyo Maeda → Carlos Gracie → Rigan Machado → Bob Bass → Brian Scott
- **Muay Thai:** Sak Va Roon Gym (Bangkok) → Kru Suchat "Arthur" Chunton → Brian Scott
- **Boxing:** Marvin Hagler's Coach (Philadelphia) → Dave Gaudette → Brian Scott
- **Eskrima:** Doce Pares HQ (Cebu City) → SGM Diony Cañete → SGM Dong Cuesta → GM Steve Wolk → Brian Scott
- **Self Defense:** synthesis (no separate tree)

### Brand voice / hero copy

- **Headline:** "Building Champions" (inherited verbatim from TuffBuffs)
- **Subhead:** "Martial arts training at CU Boulder & Wolchek Academy — BJJ, Muay Thai, Boxing, Eskrima & Self Defense" (TuffBuffs subhead + Wolchek mention added)
- **Three "Why BMA" pillars:** World-Class Instruction · Multi-Venue Access · Multiple Arts

## Source-of-truth pointers (monorepo)

Files in `/Users/brianscott/dev/ronin-dojo-monorepo/` consulted during grill:

- `src/brands/tuffbuffs/data/brianScottBios.js` — 5 program bios + master record (~250 lines)
- `src/brands/tuffbuffs/data/classTypes.js` — 5 discipline configs (~250 lines)
- `src/brands/tuffbuffs/data/schedule.js` — Fall/Spring/Summer schedule template
- `src/brands/tuffbuffs/data/merchandise.js` — 1246 lines of merch + gear catalog
- `src/brands/tuffbuffs/data/curriculum/` — per-discipline curriculum modules (bjj.js, eskrima.js, etc.)
- `scripts/utilities/seed-data/tuffbuffs-techniques.json` — 16,391 lines
- `scripts/utilities/seed-data/tuffbuffs-pods-curriculum.json` — 28,083 lines
- `dashboard/docs/wireframes/tuffbuffs-landing-wireframe-spec.md` — page-structure source

## Petey plan (revised post-grill)

| ID | Task | Done criteria | Assignee |
| --- | --- | --- | --- |
| SESSION_0244_TASK_01 | Brian grill (6 rounds) — capture brand facts + lock scope per domain | Brand facts section above filled; scope decisions captured | Petey + Brian (done) |
| SESSION_0244_TASK_02 | Plan-agent gap scan (L1 + architectural/runbook baseline lens) | Gap list returned: 27 gaps (8 P1 / 12 P2 / 7 P3) | Plan subagent (done) |
| SESSION_0244_TASK_03 | Brian approves gap list (which to author, which to defer) | Approved gap subset captured in this file | Brian (pending) |
| SESSION_0244_TASK_04 | Author approved doc gaps | Per-gap files created/updated; JETTY frontmatter; cross-links wired | Cody/authoring subagents |
| SESSION_0244_TASK_05 | Port monorepo source data → `apps/web/prisma/data/baseline/` | JSON files copied + light rebrand pass; deterministic structure for seed-script consumption | Cody |
| SESSION_0244_TASK_06 | Seed scripts written (NOT executed) per domain | Per-domain `seed-baseline-*.ts` files; pattern matches existing seed-baseline-* family; `prisma validate` clean. Domains: Org+Venue, Discipline, Program, ClassSchedule (incl. 2 Wolchek slots), Member (Brian only), InstructorBio (5 program bios), LineageNode stubs (per-discipline terminal trees), Technique (full TuffBuffs import), Course+CurriculumItem (full import), Gear (TuffBuffs verbatim), Merch (TuffBuffs rebranded BMA, placeholder Stripe IDs) | Cody |
| SESSION_0244_TASK_07 | Light page prose pass on 7 listing pages | Per-page intro sentence + metadata fields BMA-flavored; cross-link labels reviewed; CU Rec mentioned as text-only (NO hyperlink) | Cody |
| SESSION_0244_TASK_08 | TypeScript typecheck zero errors | `pnpm --filter @ronin-dojo/web exec tsc --noEmit` exit 0 | Petey/Cody |
| SESSION_0244_TASK_09 | Stage / commit / push + bow-out (full close per closing.md) including Vercel `Ready` check + graphify update | Pushed; SESSION_0244 `closed`; graphify refreshed; Vercel green | Petey |

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0244_TASK_01 | done | Six grill rounds (org identity, locations, disciplines, schedule, reg model, bios, lineage, curriculum/gear/merch scope) completed. Brand facts section above captures all decisions. |
| SESSION_0244_TASK_02 | done | Plan-agent returned 27 gaps: 8 P1 / 12 P2 / 7 P3. Key themes: Storage/Media/Blog/Theming L1 areas doc-thin; ADR 0012 duplicate-number collision; launch doc lies about May 18 date. |
| SESSION_0244_TASK_03 | done | Approved scope: all 8 P1s + 5 P2 wiki-hygiene items + theming arch doc (P2, added via open-Q answer) + local-dev-auth-storage split (P3, added via open-Q answer) = 15 doc tasks total. P3 hygiene deferred to SESSION_0245+. |

## Gap-list approval — Brian's five open-question answers

1. **Storage L1:** AWS S3 operator runbook is intended dual-purpose — extend it with an architecture section rather than creating a separate `docs/architecture/storage.md`.
2. **Theming L1:** oversight — author `docs/architecture/theming.md` this session.
3. **`/blog` vs `/posts`:** intentional surfaces. One is for content-atoms, the other is general-purpose. Brian can't recall which is which → Petey will inspect routes and document the canonical split in the new `blog-runbook.md`.
4. **Launch doc:** update in place with "slipped to YYYY-MM-DD" banner (no new dated supersedor file).
5. **`local-dev-auth-storage.md`:** split into `local-dev-auth.md` + `local-dev-storage.md`.

## Approved gap-authoring queue (15 items, sequential)

### Phase 1 — Frontmatter / numbering fixes (cheap)

- [ ] ADR 0012 duplicate renumber → rename `0012-tier-auto-grant.md` → `0019-tier-auto-grant.md`; update its `renumbered_from`/cross-refs; sweep repo for `0012-tier-auto-grant` references
- [ ] ADR 0010 add frontmatter (status, slug, type, pairs_with, backlinks), promote `proposed` → `accepted` reflecting current shipped state
- [ ] `docs/architecture/content-engine/database-post-format.md` add JETTY frontmatter
- [ ] Wiki hygiene: add `superseded_by` to `wiki/log.md`, `baseline-docs-adoption-checklist.md`, `dirstarter-uplift-backlog.md`, `SCHEMA_NEEDS_MANIFEST.md`
- [ ] `prisma-workflow.md` add `pairs_with: [database.md, schema-migration.md, neon-advisory-lock-recovery.md]`

### Phase 2 — Doc patches

- [ ] `auth.md` D-013 align — fix the "404 vs redirect" stale claim per current code reality
- [ ] Launch doc `2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md` — in-place update with "slipped from 2026-05-18 (now 6+ days past target)" banner + status-as-of-2026-05-24 section

### Phase 3 — New / extended docs

- [ ] Extend `aws-s3-operator-runbook.md` with architecture section (Storage L1 dual-purpose lift)
- [ ] Author `docs/runbooks/media-runbook.md` (Media L1)
- [ ] Inspect `/blog` + `/posts` routes; author `docs/runbooks/blog-runbook.md` documenting canonical split
- [ ] Author `docs/architecture/theming.md` (Theming L1)
- [ ] Split `local-dev-auth-storage.md` → `local-dev-auth.md` + `local-dev-storage.md`, leave a supersession pointer

### Phase 4 — Data port + seed scripts

- [ ] Port monorepo `src/brands/tuffbuffs/data/` + `scripts/utilities/seed-data/tuffbuffs-*.json` → `apps/web/prisma/data/baseline/`
- [ ] Author `seed-baseline-{org,disciplines,programs,schedule,instructor,bios,lineage-stubs,techniques,courses,gear,merch}.ts` (no execution)
- [ ] `prisma validate` clean

### Phase 5 — Page prose pass

- [ ] Light intro + metadata + cross-link BMA-flavoring on `/programs`, `/organizations`, `/gear`, `/merch`, `/directory`, `/members`, `/techniques`
- [ ] CU Rec mentioned as **text-only**, no hyperlink (constraint per Round 5)

### Phase 6 — Verify + close

- [ ] `pnpm --filter @ronin-dojo/web exec tsc --noEmit` exit 0
- [ ] Stage + commit + push
- [ ] Bow-out full close (closing.md ritual), Vercel `Ready` check, graphify refresh

## Plan-agent gap-scan report (full, verbatim, for SESSION_0245 pickup)

> Returned by Plan subagent during SESSION_0244 (claude-session-0244). Scope lens: Dirstarter L1 alignment + architectural baseline + runbook baseline. Excluded `docs/sprints/`, `docs/_archive/`, `docs/_imports/`, `docs/protocols/`.

**Summary:** 27 gaps total · 8 P1 / 12 P2 / 7 P3.

| Area | Path | Gap | Priority | Action | Rationale |
| --- | --- | --- | --- | --- | --- |
| Auth L1 | `docs/architecture/auth.md` | Stale `updated: 2026-04-30`; `dirstarter-gap-audit.md` flags it ("`auth.md` needs correction" — D-013 says redirect-wins, doc says 404) | P1 | Update | Active doc contains known-wrong claim called out in gap audit but never patched. |
| Architecture baseline | `docs/architecture/decisions/0010-cache-strategy.md` | Status `proposed` in body, no frontmatter; load-bearing ADR; `cache-risk-register.md` notes "Backfill automated test IDs after implementation" unfilled | P1 | Update / promote to `accepted` | Caching strategy unresolved at ADR level but codebase already ships `useCache`. Launch hits prod caching with no agreed ADR. |
| Architecture baseline | `docs/architecture/decisions/0012-admin-crud-routing-pattern.md` AND `0012-tier-auto-grant.md` | Two ADRs share number 0012 | P1 | Rename/renumber one to 0019 + add `renumbered_from` field | Breaks ADR numbering invariant. Recommendation: renumber `0012-tier-auto-grant` (newer, 2026-05-11) → `0019`. |
| Architecture baseline | `docs/architecture/SCHEMA_NEEDS_MANIFEST.md` | `status: deprecated` but still referenced from `launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md` `pairs_with` | P2 | Link-fix: remove from launch pairs_with, add `superseded_by: s2-schema-additions.md` | Superseded doc still pulled into launch pairs_with. |
| Architecture baseline | `docs/architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md` | Stale `updated: 2026-04-29`; launch target 2026-05-18, today 2026-05-24 (6+ days past) | P1 | Update in-place with "slipped to YYYY-MM-DD" banner (per Brian decision) | Doc lies about date; `program-plan.md` acknowledges slip but launch doc doesn't. |
| Architecture baseline | `docs/architecture/dirstarter-baseline-index.md` | Backlinks references SESSION_0165/0203/0204; missing 0205-0244 range | P3 | Update | Non-blocking; reduces graph value. **Deferred per Brian P3 scope cut.** |
| Storage L1 | (extension target: `docs/runbooks/aws-s3-operator-runbook.md`) | No architectural doc explaining S3 vs MinIO local, NEXT_PUBLIC_MEDIA_BASE_URL, public vs private buckets, brand-scoped paths | P1 | Extend operator runbook with architecture section (per Brian dual-purpose decision) | One of 10 L1 alignment areas; no architectural answer page. |
| Payments L1 | `docs/architecture/security-privacy-payments-monitoring-plan.md` | Stale `updated: 2026-05-08`; doesn't reflect post-SESSION_0130 entitlement auto-grant (ADR 0012-tier-auto-grant) | P2 | Update with ADR reference + webhook entitlement flow | **Deferred per Brian P2 scope (wiki-hygiene only).** |
| Media L1 | (MISSING — no `docs/runbooks/media-runbook.md`) | Graphify shows `GAP 1: Media / Upload system (CRITICAL)` + `canUploadMedia()` in code but no runbook | P1 | Author `docs/runbooks/media-runbook.md` | Code has upload guards but no runbook for image lifecycle / transformations / allowed types / S3 ↔ public path resolution. |
| Media L1 | `docs/architecture/feature-data-prerequisites.md` | Hints at media-prereqs but no architectural media spec | P2 | Author `docs/architecture/media.md` OR extend AWS S3 runbook | **Deferred per Brian P2 scope.** |
| Content L1 | `docs/architecture/content-engine/database-post-format.md` | **Empty frontmatter** — file has no YAML block; load-bearing for blog/posts decision | P1 | Add frontmatter (status, slug, pairs_with, backlinks); promote `Proposed` → `active` if shipped | Foundational doc invisible to wiki-lint / graphify until it has frontmatter. |
| Content L1 | `docs/knowledge/wiki/content-engine/*.md` | 5 wiki files (content-atoms.md etc) need staleness spot-check | P2 | Audit-pass for frontmatter freshness | **Deferred per Brian P2 scope.** |
| Content L1 | `docs/architecture/decisions/0018-content-atom-canonical-relations.md` | Status `accepted` and recent; but `database-post-format.md` doesn't link to it (asymmetric) | P3 | Link-fix on database-post-format.md once it gets frontmatter | **Deferred per Brian P3 scope cut** — link-fix happens organically when frontmatter is added in P1 work above. |
| Blog L1 | (MISSING — no `docs/runbooks/blog-runbook.md`) | `/blog`, `/posts`, `/admin/posts` all exist; no runbook explains which is canonical | P1 | Author `docs/runbooks/blog-runbook.md`. **Brian: both intentional surfaces; one for content-atoms, other general-purpose. Author needs to inspect routes to confirm which is which.** | High launch risk. |
| Theming L1 | (MISSING — no theming arch doc) | Zero docs covering theming/dark mode/tailwind tokens architecturally | P2 | Author `docs/architecture/theming.md` (per Brian oversight decision) | 10 L1 areas — totally undocumented. |
| Theming L1 | `docs/architecture/legacy-conversion.md` | Stale `updated: 2026-04-25`; theming row says "Port directly. Move to Tailwind config + CSS variables" but unclear what's been actioned | P3 | Update with `wiring:` pointing to actual theme files | **Deferred per Brian P3 scope cut.** |
| Prisma L1 | `docs/runbooks/prisma-workflow.md` | Missing `pairs_with` field; 4 sister runbooks reference it but it doesn't reciprocate | P2 | Add `pairs_with: [database.md, schema-migration.md, neon-advisory-lock-recovery.md]` | Asymmetric cross-ref graph. **In Brian P2 wiki-hygiene scope.** |
| Architecture baseline | `docs/architecture/printful-pod-spec.md` | `status: draft` since 2026-05-10 (~14 days); Printful runbook exists | P2 | Update status to `active` if shipped or `deferred` | **Deferred per Brian P2 scope.** |
| Architecture baseline | `docs/architecture/s2-s4-pattern-audit.md` | Stale `updated: 2026-04-27`; schema went through Waves A-D since | P3 | Refresh audit against current schema | **Deferred per Brian P3 scope cut.** |
| Runbook baseline | (MISSING — no `docs/runbooks/wiki-lint.md`) | Sessions run `wiki-lint` but no runbook explains gates / fix patterns / CI integration | P2 | Author short runbook | **Deferred per Brian P2 scope.** |
| Runbook baseline | (MISSING — no `docs/runbooks/merge-to-main.md`) | Sessions perform merge-to-main per WORKFLOW_5.0 but no checklist-style runbook | P2 | Author runbook | **Deferred per Brian P2 scope.** |
| Runbook baseline | `docs/runbooks/local-dev-auth-storage.md` | Title says auth + storage but body is auth-dominant; MinIO storage section thin | P3 | Split into `local-dev-auth.md` + `local-dev-storage.md` (per Brian decision) | **In scope per Brian Q5 answer.** |
| Runbook baseline | `docs/runbooks/baseline-listings-runbook.md` | `pairs_with` references `docs/sprints/lanes/LANE-S040-listing-relabel.md` (one-off lane doc) | P3 | Verify lane file existence | **Deferred per Brian P3 scope cut.** |
| Runbook baseline | `docs/runbooks/adr-0014-stripe-product-policy-research.md` | Research-runbook for `accepted` ADR; should be `superseded`/`historical` | P3 | Add status + forward link | **Deferred per Brian P3 scope cut.** |
| Wiki hygiene | `docs/knowledge/wiki/log.md` | `status: superseded` but no `superseded_by` field | P2 | Add `superseded_by: docs/protocols/project-log.md` | **In Brian P2 wiki-hygiene scope.** |
| Wiki hygiene | `docs/knowledge/wiki/baseline-docs-adoption-checklist.md` | `status: deprecated`, no `superseded_by`/`replaced_by` | P2 | Add successor pointer or move to `_archive` | **In Brian P2 wiki-hygiene scope.** |
| Wiki hygiene | `docs/knowledge/wiki/dirstarter-uplift-backlog.md` | `status: superseded` since 2026-05-19 but listed in active wiki index | P2 | Add `superseded_by: docs/architecture/uplift/lane-ledger.md` + remove from active index OR unset to active | **In Brian P2 wiki-hygiene scope.** |
| Wiki hygiene | `docs/knowledge/wiki/repo-truth-index.md` | `needs_fix: "Needs backlinks added"` unresolved since 2026-04-29 | P3 | Resolve or remove needs_fix | **Deferred per Brian P3 scope cut.** |

### Cross-area observations from Plan-agent

1. L1 alignment gap concentrated in **Storage, Media, Blog, Theming** — these four L1 areas have either zero architectural docs or only operator-fragment docs.
2. **ADR numbering integrity broken** — two ADRs both numbered 0012.
3. **Frontmatter compliance regression** at `database-post-format.md` (no YAML block at all).
4. Multiple superseded/deprecated docs lack `superseded_by` pointers (`wiki/log.md`, `baseline-docs-adoption-checklist.md`, `dirstarter-uplift-backlog.md`, `SCHEMA_NEEDS_MANIFEST.md`).
5. **Launch doc lies about reality** — still presents May 18 as future; program-plan acknowledges slip.
6. Three runbooks (`database.md`, `dev-environment.md`, `prisma-workflow.md`) all have `use_count: 0` despite being foundational — tooling-instrumentation gap, not doc gap.
7. **Uplift cluster missed a deprecation pass** — SESSION_0203-0208 added 3 new docs but did not retire `dirstarter-uplift-backlog.md`.

## Hostile close review (planning session)

| Check | Verdict |
| --- | --- |
| Plan sanity | Pass — 6 grill rounds + Plan-agent dispatch produced a complete, scoped, approval-gated implementation queue. |
| Dirstarter alignment | Pass — alignment table filled (Content + Prisma touched in scope; Storage/Media/Blog/Theming touched in approved P1 doc-gap fills). |
| Security | N/A — no code touched. |
| Data integrity | N/A — no code touched. |
| Verification honesty | Pass — explicitly flagged that ZERO implementation happened this session; called the session `session--plan`. |
| WORKFLOW 5.0 compliance | Pass — SESSION file numbered; tasks numbered; bow-in inventory recorded; Petey grill protocol followed; Plan subagent dispatched per single-lane rule; Brian approval gate honored before any implementation. |

**Score cap:** None.

**Unresolved findings:** None.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | This SESSION file is the only repo file touched. Frontmatter complete with `type: session--plan`, `status: closed-full`, `pairs_with`, `backlinks`. |
| Backlinks/index sweep | Wiki index entry for SESSION_0244 to be added in commit (see git hygiene below). |
| Wiki lint | Will be run during bow-out commit step. |
| Kaizen reflection | See Reflections section below. |
| Hostile close review | See Hostile close review section above (self-review by Petey; no subagent dispatched — planning-only session with no code touched does not warrant Doug/Giddy hostile review). |
| Review & Recommend | See Next session section below. |
| Memory sweep | Memory pattern from this session: `Petey grill discipline saves implementation time when source-of-truth lives in adjacent repos`. The TuffBuffs source in `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/tuffbuffs/data/` cuts authoring time by ~80% vs ground-up grill. Worth saving. |
| Next session unblock | SESSION_0245 has zero unanswered questions. Implementation queue is sequential, approval-gated, with all 5 open questions resolved inline. |
| Git hygiene | Single commit: SESSION_0244.md only. No code touched. Wiki-lint will be run as part of commit step. |
| Graphify update | Will run post-commit (small delta — one new SESSION file). |

## Reflections

- **Petey grill discipline paid off — 6 rounds beats 1 ground-up authoring pass.** The 6-round grill (org identity → schedule/reg model → schedule scope/instructor scope → bio sources → curriculum/gear/merch scope → consolidation) progressively narrowed the implementation surface and surfaced the monorepo source-of-truth in round 4. Discovering `data/brianScottBios.js` mid-grill eliminated ~3-4 hours of would-be authoring time.
- **Source-of-truth pointer discipline matters.** All source files used during grill are now listed in the SESSION file's "Source-of-truth pointers" section. Codex pickup in SESSION_0245 doesn't need to re-discover what already exists.
- **Session-budget awareness is a real constraint, not a soft hint.** Brian's call to defer all implementation at 8% remaining budget is correct — partial Phase 1 fixes would have left the repo in an awkward halfway state requiring SESSION_0245 to re-discover what was/wasn't done. Whole-or-none atomicity wins.
- **Plan-agent dispatch in parallel with grilling = clean win.** Plan-agent ran for ~8 minutes in the background while grill rounds 3-5 happened in the foreground. Returned a 27-gap report with priority + rationale + recommended action; saved ~30 min of in-session doc inspection.
- **Word collision on "Baseline" was load-bearing to catch early.** "Dirstarter baseline" (L1 framework) vs "Baseline Martial Arts" (P1 brand) collision was clarified in Round 1; without that, Plan-agent's gap-scan would have produced wrong-lens results.

## Next session

### Goal

SESSION_0245 — **Baseline content waterfall (EXECUTION).** Codex picks up SESSION_0244's planning artifact and executes Phase 1–6 sequentially per the locked implementation queue. Zero re-grilling expected — every question is already answered in this file.

### Inputs to read (mandatory)

- `docs/sprints/SESSION_0244.md` — **THIS FILE**. Read every section: brand facts, gap-scan report, approved implementation queue, source-of-truth pointers.
- `docs/sprints/SESSION_0243.md` — prior session (Vercel rescue + listing parity uplift)
- `docs/knowledge/wiki/dirstarter-docs-inventory.md` — L1 alignment table
- The 7 uplifted listing pages (where Phase 5 prose pass lands)
- Existing seed scripts in `apps/web/prisma/` (e.g., `seed-baseline-platform.ts`, `seed-tuffbuffs-merch.ts`) for pattern reference before Phase 4 authoring

### First task

Start Phase 1 — ADR 0012 duplicate renumber:

1. `git mv docs/architecture/decisions/0012-tier-auto-grant.md docs/architecture/decisions/0019-tier-auto-grant.md`
2. Update its frontmatter: title `ADR 0012` → `ADR 0019`, add `renumbered_from: docs/architecture/decisions/0012-tier-auto-grant.md`
3. Sweep repo for `0012-tier-auto-grant` references and update to `0019-tier-auto-grant`
4. Verify `0012-admin-crud-routing-pattern.md` retains the 0012 number cleanly

Then continue down the Phase 1 list (ADR 0010, database-post-format.md, wiki hygiene, prisma-workflow.md).

### Blocker check

**Not blocked on user.** All 27 gap-list decisions made; all 5 Plan-agent open questions answered; all 11 seed-data domains scoped; all 7 pages prose-decision-deferred to per-page rendering inspection during Phase 5 (Codex makes light judgment calls per-page, falls back to "1-sentence intro + metadata" rule).

### Specific instructions for Codex / next-session agent

- **Do not re-grill Brian on brand facts.** Everything is in the `Baseline Martial Arts — brand facts` section above.
- **Do not re-run Plan-agent.** The gap-scan report is inlined above.
- **Sequential execution per Brian's dispatch decision** — no parallel subagents this session. Petey/Cody/Codex inline, one task at a time, with TodoWrite updates after each completion.
- **`/lineage` page and full lineage tree expansion remain deferred.** Only stub LineageNode rows (per-discipline terminal trees) get seeded this session per Round 5 lock.
- **Brian-as-only-person carve-out remains.** Other members defer. The instructor record + 5 program bios for Brian DO land this session per Round 4 lock.
- **CU Rec Center mentioned as TEXT ONLY, no hyperlink** — hard constraint per Round 5.
- **Stripe Payment Link for Wolchek $10 drop-in** — leave `paymentLinkUrl: "TODO"` in seed; Brian creates the Payment Link manually via the existing Stripe CLI setup.
- **Venmo handle:** `@TuffBuffs` transitionally (Brian will migrate to BMA handle post-launch).

## ADR / ubiquitous-language check

- **No new ADR needed.** Planning session captured decisions in this SESSION file; no architectural decisions were made.
- **No ubiquitous-language additions.** All domain terms (Discipline, Program, ClassSchedule, Member, InstructorBio, LineageNode, Technique, Course, CurriculumItem, Gear, Merch) already in vocabulary.

## Review log

- SESSION_0244 review: self-review by Petey (claude-session-0244). See Hostile close review section above. No subagent review dispatched — planning-only session with no code touched.

## Cross-references

- [SESSION_0243](SESSION_0243.md) — paired prior session
- [Dirstarter docs inventory](../knowledge/wiki/dirstarter-docs-inventory.md) — alignment URL table
- [TuffBuffs landing wireframe spec (monorepo)](../../../../dev/ronin-dojo-monorepo/dashboard/docs/wireframes/tuffbuffs-landing-wireframe-spec.md) — page-structure inheritance source
- [Opening ritual](../rituals/opening.md), [Closing ritual](../rituals/closing.md)
| SESSION_0244_TASK_04 | blocked-on | TASK_03 |
| SESSION_0244_TASK_05 | pending | Dispatch after TASK_03 approval. |
| SESSION_0244_TASK_06 | pending | Dispatch after TASK_05. |
| SESSION_0244_TASK_07 | pending | Dispatch with TASK_06 (parallel-safe). |
| SESSION_0244_TASK_08 | pending | After all authoring complete. |
| SESSION_0244_TASK_09 | pending | Bow-out + push. |

## Cross-references

- [SESSION_0243](SESSION_0243.md) — paired prior session
- [Dirstarter docs inventory](../knowledge/wiki/dirstarter-docs-inventory.md) — alignment URL table for the 10 L1 areas
- [Drift register](../knowledge/wiki/drift-register.md), [Failed-steps log](../protocols/failed-steps-log.md) — both clean for this lane
- [Opening ritual](../rituals/opening.md), [Closing ritual](../rituals/closing.md)
