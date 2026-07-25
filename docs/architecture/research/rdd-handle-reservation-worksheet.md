---
title: "RDD handle-reservation worksheet — operator-executable reservation plan"
slug: rdd-handle-reservation-worksheet
type: research
status: research
created: 2026-07-24
created_at: 2026-07-24T00:00Z
updated: 2026-07-24
author: "Claude (overnight lane, wave — SESSION_0689)"
last_agent: claude-session-0689
session: SESSION_0689
operator: Brian
issue: "#291"
pairs_with:
  - docs/sprints/SESSION_0689.md
  - docs/architecture/research/rdd-niche-handle-audit.md
  - docs/architecture/research/research-review-rdd-social-automation.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# RDD handle-reservation worksheet

> **What this is.** A single-sitting reservation worksheet built directly from the passive
> niche-handle audit ([`rdd-niche-handle-audit.md`](rdd-niche-handle-audit.md), issue #291 / #280 F5)
> and the platform-strategy findings in
> [`research-review-rdd-social-automation.md`](research-review-rdd-social-automation.md). One table per
> brand × platform, a desired handle, the audit's availability signal pre-filled where known, a
> **blank status column for you to confirm at reservation time**, a priority, fallback handles, and a
> short checklist. **You reserve; this document does not.** Every reservation — operator, credential,
> and external action — remains yours. No account was created, registered, or reserved by producing
> this worksheet.
>
> **Read this before you start:** availability in the audit is **point-in-time (checked 2026-07-24)
> and mostly *uncertain*** because Instagram / Facebook / TikTok / X block anonymous status checks.
> Re-verify each handle inside the platform's own signup/claim flow immediately before reserving —
> do not treat any "available" here as booked.

## How to use this sheet

1. Work **top-to-bottom by brand**, and **within each brand in priority order** (P1 → P2 → P3).
2. For each row, open the "Reserve at" flow, type the **Desired handle**, and read the platform's
   own availability result.
3. Fill the **Status ☐** column with what you actually saw: `TAKEN`, `RESERVED ✓`, or the fallback
   you used (e.g. `RESERVED ✓ (fallback: roninbuilding.design)`).
4. If the desired handle is taken, walk the **Fallback** list left-to-right; keep the *first* open
   one, and use the **same** fallback shape across every platform for that brand so the family stays
   consistent.
5. When done, close the loop: record what was actually reserved back into the RDD social-goals
   ledger (see the checklist at the bottom, step 8).

### Legend (audit signal column)

| Marker | Meaning |
| --- | --- |
| **OWNED** | Already held by RDD — nothing to do except confirm it's still yours. |
| **available (confirmed)** | Strong open signal (clean HTTP 404 in the audit). Grab it — cheap win. |
| **available (DNS)** | Domain returned `ENOTFOUND` — likely open; confirm at the registrar. |
| **likely available** | Weak signal (no exact profile found in public search); confirm in-flow. |
| **uncertain** | Platform masks status from anonymous fetch — the audit could **not** tell. Confirm in-flow. |
| **TAKEN** | Confirmed in use / registered — do **not** expect to get it; go straight to fallback. |
| **not audited** | Outside the #291 audit's scope — no signal exists; you must check cold. |

### Priority definitions

- **P1** — reserve in this sitting; the platform where this brand's audience actually lives, or a
  confirmed-open cheap win. (Umbrella: LinkedIn + YouTube. Niche trades: Facebook + Instagram +
  Google Business, plus the confirmed-open YouTube handles.)
- **P2** — reserve if time allows; a secondary surface worth holding to prevent squatting.
- **P3** — option-preservation only; deprioritized platform (X is deprioritized in the research —
  lowest B2B conversion + paid API — but the handle is still free to hold).

---

## Cross-platform gotchas (read once, applies to every table)

- **X caps handles at 15 characters.** `ronindojodesign` fits **exactly** (15). Every niche form —
  `roninbuildingdesign` (19), `roninplumbingdesign` (19), `roninlandscapedesign` (20) — is **too long
  for X**, so the "Desired handle" in the X rows below is already a shortened form. `mammothbuild`
  (12) fits.
- **Character rules differ by platform:** X allows only letters/numbers/underscore (no dots, no
  hyphens); Instagram/TikTok allow dots and underscores; YouTube `@handles` allow dots, underscores
  and hyphens; Facebook page usernames need ≥5 chars, letters/numbers/dots. Pick a fallback that's
  legal on the platform you're on.
- **Google Business Profile is not a pure handle grab.** It requires a real business name + a
  physical address or service area + a verification step (postcard/phone/video). For the niche trade
  variants it's a P1 local-search asset; for the RDD umbrella (agency) it's optional. Treat the GBP
  rows as "create + verify the profile," not "reserve a string."
- **Never shorten the niche handles to the bare trade word.** `roninplumbing` and `roninlandscape`
  are already the working names of **real, active** businesses (see collision notes) and
  `roninplumbing.com` is parked-for-sale. Keep the full `…design` suffix on every surface.
- **Trademark flag before spend (not legal advice).** USPTO serial **87300933** ("RONIN") touches
  Class 037/042 (construction / landscape-architecture / site-design) — overlaps the **Building** and
  **Landscape** niches. Pull it at
  `https://tsdr.uspto.gov/#caseNumber=87300933&caseSearchType=US_APPLICATION` (or via counsel) for
  live status + owner **before** committing marketing spend under those two niche names. No such flag
  for Plumbing.

---

## Brand A — Ronin Dojo Design (umbrella / RDD)

**Desired handle: `ronindojodesign`** (already the umbrella anchor — `ronindojodesign.com` is live).
Playbook: **B2B, founder-led — LinkedIn + YouTube first** (research §1-a). Secure the umbrella name
on every surface so no one squats the parent brand.

Domain: `ronindojodesign.com` — **OWNED** (live). ✅ no action.

| Platform | Desired handle | Audit signal | Status ☐ | Priority | Fallback (in order) | Reserve at |
| --- | --- | --- | --- | --- | --- | --- |
| LinkedIn (company page) | `ronindojodesign` | likely available |  | **P1** | `ronin-dojo-design`, `ronindojodesignstudio`, `rddstudio` | linkedin.com/company/setup/new |
| YouTube (`@handle`) | `@ronindojodesign` | not audited (umbrella not checked) |  | **P1** | `@ronindojo.design`, `@ronindojodesignstudio`, `@rddstudio` | YouTube Studio → Customize channel → Handle |
| Instagram | `ronindojodesign` | uncertain (login wall) |  | P2 | `ronindojo.design`, `ronindojodesignco`, `rdd.studio` | instagram.com signup / Settings → Username |
| Facebook (page username) | `ronindojodesign` | uncertain (login wall) |  | P2 | `ronindojo.design`, `RoninDojoDesignStudio`, `RDDstudio` | facebook.com/pages/create → Username |
| TikTok | `ronindojodesign` | uncertain (JS wall) |  | P3 | `ronindojo.design`, `ronindojodesignco`, `rdd.studio` | tiktok.com signup → Edit profile → Username |
| X | `ronindojodesign` (15 — fits exactly) | uncertain (402 uniform) |  | P3 | `RoninDojoDsgn`, `RoninDojoRDD`, `RDDstudio` | x.com signup → handle |
| Google Business Profile | `Ronin Dojo Design` | not audited |  | P2 | n/a (business name + verify; service-area agency) | business.google.com |

---

## Brand B — Mammoth Build (MMB)

**Desired handle: `mammothbuild`.** ⚠️ **NOT in the #291 audit** — that audit only covered the
`ronin*design` family. Every cell below is **not audited**: treat all availability as unknown and
check each one cold in-flow. "Mammoth" is a common brand word, so expect collisions and lean on the
fallback bank. **Run a fresh availability pass for this brand before the sitting** (same passive-check
method as the #291 audit) if you want signal ahead of time.

Domain suggestion: `mammothbuild.com` (confirm at registrar; not audited). Fallback domains:
`mammoth.build`, `mammothbuildco.com`, `buildmammoth.com`.

| Platform | Desired handle | Audit signal | Status ☐ | Priority | Fallback (in order) | Reserve at |
| --- | --- | --- | --- | --- | --- | --- |
| Instagram | `mammothbuild` | not audited |  | **P1** | `mammoth.build`, `mammothbuildco`, `buildmammoth`, `mammothbuilders` | instagram.com signup |
| Facebook (page username) | `mammothbuild` | not audited |  | **P1** | `mammoth.build`, `MammothBuildCo`, `BuildMammoth` | facebook.com/pages/create |
| Google Business Profile | `Mammoth Build` | not audited |  | **P1** | n/a (business name + verify) | business.google.com |
| YouTube (`@handle`) | `@mammothbuild` | not audited |  | P2 | `@mammoth.build`, `@mammothbuildco`, `@buildmammoth` | YouTube Studio → Handle |
| LinkedIn (company page) | `mammothbuild` | not audited |  | P2 | `mammoth-build`, `mammothbuildco`, `buildmammoth` | linkedin.com/company/setup/new |
| TikTok | `mammothbuild` | not audited |  | P2 | `mammoth.build`, `mammothbuildco`, `buildmammoth` | tiktok.com signup |
| X | `mammothbuild` (12 — fits) | not audited |  | P3 | `MammothBuildCo`, `BuildMammoth`, `MammothBuilds` | x.com signup |

---

## Brand C — the `ronin<niche>design` pattern

All niche variants use the identical **`ronin<niche>design`** form — no hyphens, no abbreviations —
to stay visually and verbally consistent with `ronindojodesign`. Three concrete instances are
audited below; a **future-niche template** row shows how to extend the pattern.

Playbook (research §1-b): niche variants sell to **trade/contractor owners** who live on
**Facebook → Instagram → Google Business**, YouTube for before/after proof, LinkedIn secondary. The
audit **confirmed YouTube open (clean 404)** for all three — those are P1 cheap wins even though the
umbrella playbook rates YouTube differently. Per #280 F5 (operator rec): **reserve now, post nothing
until real work-product exists.**

### C-1 · Ronin Building Design — `roninbuildingdesign` (first / active pitch)

Domain: `roninbuildingdesign.com` — **available (DNS)**. Register alongside `ronindojodesign.com`.
⚠️ Trademark flag 87300933 touches this niche — pull it before spend.
Brand-confusion watch (not a handle collision): "Ronin Architects" (`@RoninArchitects`), "Ronin
Builders" (`@ronin_builders`).

| Platform | Desired handle | Audit signal | Status ☐ | Priority | Fallback (in order) | Reserve at |
| --- | --- | --- | --- | --- | --- | --- |
| Facebook (page username) | `roninbuildingdesign` | uncertain (login wall) |  | **P1** | `roninbuilding.design`, `RoninBuildingDesignCo`, `RoninBuildDesign` | facebook.com/pages/create |
| Instagram | `roninbuildingdesign` | uncertain (login wall) |  | **P1** | `roninbuilding.design`, `roninbuildingdesignco`, `ronin.buildingdesign` | instagram.com signup |
| Google Business Profile | `Ronin Building Design` | not audited |  | **P1** | n/a (business name + verify) | business.google.com |
| YouTube (`@handle`) | `@roninbuildingdesign` | **available (confirmed)** |  | **P1** (cheap win) | `@roninbuilding.design`, `@roninbuildingdesignco` | YouTube Studio → Handle |
| LinkedIn (company page) | `roninbuildingdesign` | likely available |  | P2 | `ronin-building-design`, `roninbuildingdesignco` | linkedin.com/company/setup/new |
| TikTok | `roninbuildingdesign` | uncertain (JS wall) |  | P2 | `roninbuilding.design`, `roninbuildingdesignco` | tiktok.com signup |
| X | `RoninBuildDsgn` (14 — full form is 19, too long) | uncertain (402) |  | P3 | `RoninBldgDesign`, `RoninBuildRDD`, `RoninBuildCo` | x.com signup |

### C-2 · Ronin Plumbing Design — `roninplumbingdesign` (later variant)

Domain: `roninplumbingdesign.com` — **available (DNS)**. ⚠️ **Never** shorten to `roninplumbing` —
that name is an active plumbing business (site + FB + IG + YouTube) and `roninplumbing.com` is parked
for sale. No trademark flag found for plumbing.
Brand-confusion watch: "Ronin Plumbing and Mechanical" (`@ronin.plumber`), "Ronin Plumbing" (Ontario).

| Platform | Desired handle | Audit signal | Status ☐ | Priority | Fallback (in order) | Reserve at |
| --- | --- | --- | --- | --- | --- | --- |
| Facebook (page username) | `roninplumbingdesign` | uncertain (login wall) |  | **P1** | `roninplumbing.design`, `RoninPlumbingDesignCo`, `RoninPlumbDesign` | facebook.com/pages/create |
| Instagram | `roninplumbingdesign` | uncertain (login wall) |  | **P1** | `roninplumbing.design`, `roninplumbingdesignco`, `ronin.plumbingdesign` | instagram.com signup |
| Google Business Profile | `Ronin Plumbing Design` | not audited |  | **P1** | n/a (business name + verify) | business.google.com |
| YouTube (`@handle`) | `@roninplumbingdesign` | **available (confirmed)** |  | **P1** (cheap win) | `@roninplumbing.design`, `@roninplumbingdesignco` | YouTube Studio → Handle |
| LinkedIn (company page) | `roninplumbingdesign` | likely available |  | P2 | `ronin-plumbing-design`, `roninplumbingdesignco` | linkedin.com/company/setup/new |
| TikTok | `roninplumbingdesign` | uncertain (JS wall) |  | P2 | `roninplumbing.design`, `roninplumbingdesignco` | tiktok.com signup |
| X | `RoninPlumbDsgn` (14 — full form is 19, too long) | uncertain (402) |  | P3 | `RoninPlmbDesign`, `RoninPlumbRDD`, `RoninPlumbCo` | x.com signup |

### C-3 · Ronin Landscape Design — `roninlandscapedesign` (later variant)

Domain: `roninlandscapedesign.com` — **available (DNS)**. ⚠️ **Never** shorten to `roninlandscape` —
two independent regional "Ronin Landscap(ing)" businesses already trade under that root.
⚠️ Trademark flag 87300933 touches this niche (landscape/site design) — pull it before spend.
Brand-confusion watch: "Ronin Landscaping & Lawn Care" (Bradley, ME), "Ronin Landscape & Tree
Service" (Middletown, OH).

| Platform | Desired handle | Audit signal | Status ☐ | Priority | Fallback (in order) | Reserve at |
| --- | --- | --- | --- | --- | --- | --- |
| Facebook (page username) | `roninlandscapedesign` | uncertain (login wall) |  | **P1** | `roninlandscape.design`, `RoninLandscapeDesignCo`, `RoninLandDesign` | facebook.com/pages/create |
| Instagram | `roninlandscapedesign` | uncertain (login wall) |  | **P1** | `roninlandscape.design`, `roninlandscapedesignco`, `ronin.landscapedesign` | instagram.com signup |
| Google Business Profile | `Ronin Landscape Design` | not audited |  | **P1** | n/a (business name + verify) | business.google.com |
| YouTube (`@handle`) | `@roninlandscapedesign` | **available (confirmed)** |  | **P1** (cheap win) | `@roninlandscape.design`, `@roninlandscapedesignco` | YouTube Studio → Handle |
| LinkedIn (company page) | `roninlandscapedesign` | likely available |  | P2 | `ronin-landscape-design`, `roninlandscapedesignco` | linkedin.com/company/setup/new |
| TikTok | `roninlandscapedesign` | uncertain (JS wall) |  | P2 | `roninlandscape.design`, `roninlandscapedesignco` | tiktok.com signup |
| X | `RoninLandDsgn` (13 — full form is 20, too long) | uncertain (402) |  | P3 | `RoninLndscpDsgn`, `RoninLandRDD`, `RoninLandCo` | x.com signup |

### C-template · future niche (`ronin<niche>design`)

When a new niche is confirmed, clone the table above and substitute `<niche>`. Standard fallback
recipe: `ronin<niche>.design` → `ronin<niche>designco` → `ronin.<niche>design` → `rdd<niche>`. For X,
truncate to ≤15 chars (`Ronin<Abbrev>Dsgn`). Run a fresh passive availability check (the #291 method)
before reserving; keep the full `…design` suffix — never the bare trade word.

---

## Fallback handle bank (quick reference)

Standard fallback shapes, most-preferred first, applied per brand root:

| Shape | Example (Building) | When to use |
| --- | --- | --- |
| dotted | `roninbuilding.design` | IG / TikTok / YouTube / FB (not X — no dots) |
| `…co` suffix | `roninbuildingdesignco` | anywhere the plain form is taken |
| split-dot | `ronin.buildingdesign` | IG / TikTok |
| hyphenated | `ronin-building-design` | LinkedIn / YouTube (not IG/X) |
| `rdd` prefix | `rddbuilding` | last resort; keeps the umbrella tie |
| X-short (≤15) | `RoninBuildDsgn` | X only — full form exceeds 15 chars |

**Rule:** once you pick a fallback shape for a brand, use it on *every* platform for that brand so
the family reads consistently. Don't mix `.design` on Instagram with `co` on Facebook.

---

## Reservation checklist (operator — ~35 min, domain-first, then socials)

> Nothing below was performed by this worksheet. Re-verify availability in-flow immediately before
> each reservation — the audit signals are point-in-time (2026-07-24).

1. **Domains first (~10 min).** At the registrar holding `ronindojodesign.com`, register
   `roninbuildingdesign.com`, `roninplumbingdesign.com`, `roninlandscapedesign.com`, and (after a
   fresh check) `mammothbuild.com`. Skip the `roninplumbing.com` for-sale aftermarket listing.
2. **Trademark gate (~5 min, do before spend on Building/Landscape).** Pull USPTO serial **87300933**
   at `https://tsdr.uspto.gov/#caseNumber=87300933&caseSearchType=US_APPLICATION` for live status +
   owner. If it's live and blocks, reconsider the Building / Landscape *names* before reserving their
   socials. (Not legal advice — counsel if in doubt.)
3. **P1 socials — niche trades (~10 min).** For each niche variant, claim **Facebook + Instagram +
   the confirmed-open YouTube `@handle`**, and create the **Google Business Profile** (business name
   + service area + start verification). YouTube was audit-confirmed open — grab those first.
4. **P1 socials — umbrella (~5 min).** RDD **LinkedIn** company page + **YouTube** `@handle`; link the
   niche LinkedIn pages back to `ronindojodesign.com` as parent studio in each About section.
5. **P1 socials — Mammoth Build (~5 min).** After a fresh availability check, claim **Instagram +
   Facebook + Google Business**; fall back per the bank if `mammothbuild` is taken.
6. **P2 sweep (~5 min).** Remaining LinkedIn / TikTok rows to prevent squatting.
7. **P3 sweep (~3 min).** X handles (use the ≤15-char short forms for the niche variants); expect to
   need a fallback since X status was unverifiable in the audit.
8. **Close the loop.** Record exactly what got reserved — and any fallback handles used — back into
   the RDD social-goals ledger (the `goals-ledger.md` row / SESSION_0664 → Proposed ledger edits
   this work descends from). Note any TAKEN handles so the next audit doesn't re-check them.

---

## Provenance & caveats

- **Availability signals** are lifted verbatim from [`rdd-niche-handle-audit.md`](rdd-niche-handle-audit.md)
  (checked 2026-07-24, passive lookups only). **Uncertain ≠ available** — Instagram / Facebook /
  TikTok / X block anonymous status checks. Confirm every cell in-flow.
- **Mammoth Build and all Google Business rows were not covered by the #291 audit** — no signal
  exists; check them cold.
- **Priorities** derive from the platform strategy in
  [`research-review-rdd-social-automation.md`](research-review-rdd-social-automation.md) (§1: B2B
  umbrella → LinkedIn/YouTube; trade variants → Facebook/Instagram/Google Business; X deprioritized).
- **This worksheet reserves nothing.** All reservations — operator, credential, and external — are
  the operator's action, per issue #291 / #280 F5 and the audit's hard constraint.
