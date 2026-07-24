---
title: "RDD niche-handle availability audit — Ronin * Design brand family"
slug: rdd-niche-handle-audit
type: research
status: research
created: 2026-07-24
created_at: 2026-07-24T00:00Z
updated: 2026-07-24
author: "Claude (overnight lane, wave 8)"
last_agent: claude-session-0664
session: SESSION_0664
operator: Brian
issue: "#280 F5"
pairs_with:
  - docs/sprints/SESSION_0664.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# RDD niche-handle availability audit — Ronin * Design brand family

> **What this document is.** A passive, read-only availability audit for issue #280 fork F5
> ("reserve RBD handles now, post nothing"). It checks domain + social-handle availability and a
> trademark sanity signal for the confirmed Ronin niche-variant brand family, so the operator can
> do the actual reservations in one focused sitting. **No account was created, registered, or
> reserved by this audit — every check below is a passive lookup** (DNS resolution, public page
> fetch, or search-engine indexing). Availability is point-in-time (checked 2026-07-24); re-verify
> immediately before reserving.

## Method

- **Domains** — direct HTTPS fetch of the apex domain. `getaddrinfo ENOTFOUND` (no DNS record)
  is treated as **likely available**; a resolving site or a registrar parked/for-sale redirect is
  treated as **taken**. This is a DNS signal, not an authoritative WHOIS confirmation — WHOIS.com
  blocked automated lookups behind a bot-check, so no independent WHOIS corroboration was
  possible for any domain in this audit.
- **Social profile URLs** — direct fetch of the canonical profile URL
  (`instagram.com/<handle>`, `youtube.com/@<handle>`, etc.). A clean HTTP 404 is a strong
  "handle available" signal. A JS-rendered shell, login wall, or a uniform non-200 code
  regardless of handle (X.com returned `402 Payment Required` for every handle tried, including
  ones expected to be taken) means the platform **masks status from an anonymous fetch** — those
  are marked **uncertain**, never guessed as available.
- **Search-engine corroboration** — `site:<platform>.com <handle>` searches, used as a weak
  secondary signal only (absence from Google's index leans "probably not an established profile"
  but is not proof).
- **Trademark sanity check** — public web search against USPTO records (Trademarkia, Justia
  Trademarks, cached USPTO case documents) for "RONIN" marks in construction/architecture/
  landscape classes. The USPTO's own TSDR lookup (`tsdr.uspto.gov`) is a JS single-page app that
  did not return populated data to an unauthenticated fetch — flagged findings below need a
  direct human TSDR pull before relying on them. **This is not legal advice.**

## Brand family audited

| Brand | Role | Chosen handle form(s) checked |
| --- | --- | --- |
| Ronin Dojo Design | Umbrella (RDD) | `ronindojodesign` (already held — `ronindojodesign.com` is live) |
| Ronin Building Design | First niche variant, active pitch | `roninbuildingdesign` (primary), `roninbuilding` (secondary, domain-only spot check) |
| Ronin Plumbing Design | Niche variant | `roninplumbingdesign` (primary), `roninplumbing` (secondary, domain-only spot check) |
| Ronin Landscape Design | Niche variant | `roninlandscapedesign` (primary), `roninlandscape` (secondary, domain-only spot check) |

Full "…Design" forms were carried through as the checked handle on every social surface —
see **Recommended handle form** below for why the shortened forms were dropped after the
domain-level collision check.

## Matrix — availability by surface

Legend: **available** = strong signal open · **taken** = confirmed in use/registered ·
**uncertain** = platform blocks anonymous status checks, not guessed.

### Domains (.com)

| Handle | Status | Checked URL | Accessed |
| --- | --- | --- | --- |
| ronindojodesign.com | **taken** (owned — live RDD portfolio/studio site) | https://ronindojodesign.com | 2026-07-24 |
| roninbuildingdesign.com | **available** (DNS ENOTFOUND) | https://roninbuildingdesign.com | 2026-07-24 |
| roninbuilding.com | available (DNS ENOTFOUND) | https://roninbuilding.com | 2026-07-24 |
| roninplumbingdesign.com | **available** (DNS ENOTFOUND) | https://roninplumbingdesign.com | 2026-07-24 |
| roninplumbing.com | **taken** — parked, listed for sale on GoDaddy aftermarket | https://roninplumbing.com → redirects to `forsale.godaddy.com/forsale/roninplumbing.com` | 2026-07-24 |
| roninlandscapedesign.com | **available** (DNS ENOTFOUND) | https://roninlandscapedesign.com | 2026-07-24 |
| roninlandscape.com | available (DNS ENOTFOUND) | https://roninlandscape.com | 2026-07-24 |

### Social handles (primary form per brand)

| Brand handle | Instagram | Facebook | YouTube (`@handle`) | X | TikTok | LinkedIn company page |
| --- | --- | --- | --- | --- | --- | --- |
| ronindojodesign | uncertain (JS/login wall) | uncertain (JS/login wall) | not checked — umbrella already resolved to domain | uncertain (HTTP 402 uniform) | uncertain (JS wall) | no exact page found via search — **likely available** |
| roninbuildingdesign | uncertain | uncertain | **available** (HTTP 404) | uncertain | uncertain | no exact page found — **likely available** |
| roninplumbingdesign | uncertain | uncertain | **available** (HTTP 404) | uncertain | uncertain | no exact page found — **likely available** |
| roninlandscapedesign | uncertain | uncertain | **available** (HTTP 404) | uncertain | uncertain | no exact page found — **likely available** |

Secondary corroboration: `site:instagram.com`, `site:facebook.com`, `site:tiktok.com`, and
`site:x.com` searches for all four full-form handles returned **zero exact matches** — a weak
lean toward "available" on every uncertain cell above, but not upgraded to confirmed because none
of those platforms can be checked anonymously with certainty (see Caveats).

## Collision notes

These are **naming-similarity** collisions found via search — none is an exact match on the
chosen handle forms above, but each sits in the *same service niche* and is worth the operator's
eyes before committing marketing spend.

| Niche | Existing business | Where seen | Relevance |
| --- | --- | --- | --- |
| Building/architecture design | **Ronin Architects** (Edmonds, CA) | `ronin-architects.com`, X `@RoninArchitects` (177 posts) | Direct niche overlap (architecture + building design). Same core noun pair ("Ronin" + "design"/"architects") — highest brand-confusion risk for **Ronin Building Design**. |
| Building/construction | Ronin Development LLC (luxury home builder, does "Architectural Design"), Ronin Builders LLC (`@ronin_builders` on X, Facebook) | `ronindevelopment.com`, X, Facebook | Adjacent (construction, not design-specifically) but same trade + same brand word. |
| Plumbing | **Ronin Plumbing and Mechanical** (Eagle Point, OR) | `roninplumbers.com`, Facebook `/RoninPlumbing`, Instagram `@ronin.plumber`, active YouTube channel | Direct same-trade collision — an active local plumbing business already trades as "Ronin Plumbing" with a real social footprint. Does not hold the `roninplumbingdesign` form, but owns audience mindshare on the bare "Ronin Plumbing" name. |
| Plumbing (design-adjacent) | Ronin Plumbing (Ontario, Canada) — hydronic heating/in-floor design | `roninplumbing.weebly.com` | Also does *design* work (hydronic systems), narrowing the gap further. |
| Landscape | **Ronin Landscaping & Lawn Care** (Bradley, ME) | `roninlandscapinglawncare.com`, Facebook | Direct same-trade collision. |
| Landscape | **Ronin Landscape & Tree Service** (Middletown, OH) | Yelp listing | Second direct same-trade collision — two independent "Ronin Landscape[ing]" businesses already exist regionally. |
| General "Ronin Design" naming | Ronin Design Co (`ronindesignco` LinkedIn/X/Facebook, Ft Lauderdale brand agency), Ronin Design (Seattle web/dev), ronin-design.com, ronin.design, Ronin Design Studio (`@RoninDesign3D`) | LinkedIn, X | Not a niche-specific collision (general design agencies, not construction/plumbing/landscape) but confirms "Ronin Design" as a naming pattern is already crowded — reinforces sticking to the fully-qualified niche form (`roninbuildingdesign`, not `ronindesign`). |

**Do these matter?** None is an exact handle collision on the recommended forms — every check
above came back available or uncertain, not taken, for the actual `ronin<niche>design` strings.
The concern is **brand confusion in the wild**, not handle squatting: two real "Ronin Landscape…"
businesses and one real "Ronin Plumbing" business already operate in exactly the niches RDD is
about to enter under the same root word. Worth a quick sanity gut-check before the pitch goes out
under "Ronin Plumbing Design" or "Ronin Landscape Design" specifically — not a blocker, since the
full "Design" suffix and the studio-services framing differentiate from local trade businesses,
but it's the reason the recommendation below is to **never** drop to the bare `roninplumbing` /
`roninlandscape` short forms.

## Trademark sanity note (NOT legal advice)

- **Flag — USPTO serial 87300933** ("RONIN", Principal Register application): found via a cached
  USPTO case document (`tmng-al.uspto.gov/resting2/api/casedoc/ts/cd/87300933/...`) listing
  **Class 037** (construction consulting/contractor services, including *construction management
  of installations for landscape design, hardscape design, and site design*, tied to
  photovoltaic/solar-thermal installations) and **Class 042** (*architectural and landscape
  architecture consulting services relating to site design*; irrigation/sprinkler system
  monitoring and reporting). This overlaps the **Building Design** and **Landscape Design**
  niches at the classification level. Owner name, live/dead/registered status, and filing date
  could not be confirmed — `tsdr.uspto.gov` is a JS single-page app and did not return populated
  record data to an unauthenticated fetch. **Action: before committing spend to Ronin Building
  Design or Ronin Landscape Design marketing, pull serial 87300933 directly at
  `https://tsdr.uspto.gov/#caseNumber=87300933&caseSearchType=US_APPLICATION` (or have counsel
  do it) to see current status and owner.**
- No RONIN mark was found in plumbing-specific classes (037/035/042) via search — no equivalent
  flag for Ronin Plumbing Design.
- No mark matching "RONIN DOJO DESIGN" or "RONIN DESIGN" exactly was found registered.
- "RONIN" alone is a heavily-used mark across unrelated categories (DJI drone product line, Ronin
  Capital LLC securities brokerage, Ronin Sushi restaurants, Ronin Gallery art, Ronin Industries,
  vehicle covers, welding tools) — the term is diluted enough outside construction/landscape
  classes that isolated "RONIN" hits elsewhere are not a concern. The one flagged serial number is
  the only hit that lands inside the actual service classes RDD's niche variants would file or
  operate under.

## Recommended handle form (consistent across every surface)

| Brand | Recommended handle | Why |
| --- | --- | --- |
| Ronin Dojo Design | `ronindojodesign` | Already established — domain live, keep it as the umbrella anchor everywhere. |
| Ronin Building Design | `roninbuildingdesign` | Domain + every social surface checked available/uncertain-lean-available; full form separates from the direct "Ronin Architects" / "Ronin Builders" collisions. |
| Ronin Plumbing Design | `roninplumbingdesign` | **Never** shorten to `roninplumbing` — that string is already the working name of an active plumbing company (site, FB, IG, YouTube) and the bare `.com` is parked for sale. The full "Design" suffix is not optional here. |
| Ronin Landscape Design | `roninlandscapedesign` | **Never** shorten to `roninlandscape` — two independent regional "Ronin Landscap(ing)" businesses already trade under that root. Keep the full suffix everywhere. |

All four use the identical `ronin<niche>design` pattern, no hyphens, no abbreviations — matches
`ronindojodesign` and keeps the family visually/verbally consistent across every platform.

## 30-minute reservation checklist (operator — domain first, then socials; nothing below was performed by this audit)

1. **Domains (~10 min).** Register `roninbuildingdesign.com`, `roninplumbingdesign.com`,
   `roninlandscapedesign.com` at the same registrar holding `ronindojodesign.com`. Skip the
   `roninplumbing.com` aftermarket listing — not needed under the full-form strategy above, and
   it's a paid aftermarket purchase, not a plain registration.
2. **LinkedIn company pages (~5 min).** Create three company pages under the exact handles above;
   link each back to `ronindojodesign.com` as the parent studio in the About section.
3. **Instagram (~5 min).** Reserve `@roninbuildingdesign`, `@roninplumbingdesign`,
   `@roninlandscapedesign`. This audit could **not** confirm these are open (login-walled) — have
   a fallback (`_design`, `.design`, or an `rdd` prefix) ready in case one is already taken.
4. **Facebook Page names (~5 min).** Same three handles; same fallback note as Instagram.
5. **YouTube (~5 min).** `@roninbuildingdesign`, `@roninplumbingdesign`, `@roninlandscapedesign` —
   this is the one surface this audit **confirmed** open (clean HTTP 404 on all three). Reserve
   via YouTube Studio under the account that will run the channel.
6. **X (~3 min).** Same three handles — unconfirmed by this audit (X blocks anonymous status
   checks with a uniform 402); expect to hit a taken/typo-squat handle and need a fallback.
7. **TikTok (~3 min).** Same three handles — unconfirmed by this audit; same fallback caution.
8. **Close the loop.** Record what actually got reserved (and any fallback handles used) back
   into the RDD social-goals ledger row this session points to — see SESSION_0664.md → Proposed
   ledger edits.

Total: ~31 minutes, in the stated domain-first-then-socials order.

## Caveats

- **Point-in-time.** Every result above was checked 2026-07-24. A handle open today can be
  registered by anyone tomorrow — re-check immediately before reserving, don't work off this
  document a week later.
- **Login-walled platforms are marked uncertain, never guessed.** Instagram, Facebook, TikTok,
  and X all either serve a JS shell to an anonymous fetch or (X specifically) return a uniform
  `402 Payment Required` regardless of whether the handle is actually taken. None of those
  uncertain cells should be read as "probably available" beyond the weak secondary
  search-index-absence signal already noted in the matrix.
- **Domain availability is a DNS signal, not a WHOIS confirmation.** `ENOTFOUND` means no A/AAAA
  record resolves; in rare cases a domain can be registered with no DNS configured. WHOIS.com
  blocked automated lookups behind a bot-check for every domain tried, so no independent
  corroboration was possible. Registrar search at reservation time is the real confirmation.
- **LinkedIn "likely available" is inferred from public web-search indexing**, not LinkedIn's own
  (login-required) company-page search — moderately reliable, not certain.
- **The trademark flag is a sanity check, not legal advice.** Serial 87300933's live status,
  owner, and current classification scope were not confirmed (TSDR is JS-rendered and did not
  return data to this audit's fetch tooling) — pull it directly before relying on it.
- **Zero accounts were created, registered, or reserved by this audit.** Every check was a
  passive lookup (DNS resolution, public page fetch, or search-engine query) per the task's hard
  constraint — all actual reservations are the operator's, using the checklist above.
