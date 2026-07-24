---
title: "SESSION 0664 — auto-claude niche-handle availability audit (Ronin * Design family, #280 F5) (overnight auto lane, wave 7/8)"
slug: session-0664
type: session--implement
status: done
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0664
sprint: S12
lane: rdd
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0664 — auto-claude niche-handle availability audit (Ronin * Design family, #280 F5) (overnight auto lane, wave 7/8)

> Staged by the SESSION_0635 orchestrator (waves 7+8 — operator-directed continuations of waves 5+6).
> Adopt at lane start: flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0664-rdd-handle-audit`
> (base: main).

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-claude niche-handle availability audit (Ronin * Design family, #280 F5).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0664_TASK_01 | done | passive niche-handle availability audit — Ronin * Design brand family (#280 F5) |

## What landed

A passive (no-account, no-registration) availability audit for #280 fork F5, covering the
confirmed Ronin niche-variant family: Ronin Dojo Design (umbrella, already live at
`ronindojodesign.com`), Ronin Building Design, Ronin Plumbing Design, Ronin Landscape Design.

**Sources / method:**
- Domains — direct HTTPS fetch of each apex `.com`; `ENOTFOUND` (no DNS record) read as
  "likely available," a resolving site or registrar parked/for-sale redirect read as "taken."
  WHOIS.com blocked automated corroboration behind a bot-check, so DNS resolution is the only
  domain signal in this audit — not an authoritative WHOIS confirmation.
- Social handles — direct fetch of the canonical profile URL per platform (Instagram, Facebook,
  YouTube `@handle`, X, TikTok) plus `site:<platform>` search-index corroboration; LinkedIn
  company pages checked via web search only (no anonymous LinkedIn fetch path).
- Trademark sanity check — public web search against USPTO-adjacent sources (Trademarkia,
  Justia Trademarks, cached USPTO case documents) for "RONIN" marks in
  construction/architecture/landscape classes; `tsdr.uspto.gov` itself is a JS SPA and returned
  no populated data to an unauthenticated fetch.

**Matrix summary** (full matrix + collision notes + trademark flag in the audit doc):
- **Domains**: `roninbuildingdesign.com`, `roninplumbingdesign.com`, `roninlandscapedesign.com`
  all resolve `ENOTFOUND` → likely available. `roninplumbing.com` is taken — parked, listed for
  sale on the GoDaddy aftermarket. `ronindojodesign.com` confirmed taken (owned, live).
- **YouTube** is the one social surface with a clean confirmed signal: `@roninbuildingdesign`,
  `@roninplumbingdesign`, `@roninlandscapedesign` all return HTTP 404 (available).
- **Instagram, Facebook, X, TikTok** are all marked **uncertain** — every one either serves a
  JS shell to an anonymous fetch or (X specifically) returns a uniform `402 Payment Required`
  regardless of real handle status. Zero exact-match hits on `site:<platform>` search is a weak
  secondary lean toward available, not a confirmation.
- **LinkedIn** company pages: no exact match for any of the four full handle forms found via
  search — "likely available," not confirmed (LinkedIn's own search requires login).
- **Collisions found** (naming-similarity, not exact-handle squats): direct same-niche
  competitors already trade as "Ronin Architects," "Ronin Plumbing (and Mechanical)," "Ronin
  Landscaping & Lawn Care," and "Ronin Landscape & Tree Service" — none holds the recommended
  `ronin<niche>design` handle form, but all reinforce **never** dropping to the bare
  `roninplumbing`/`roninlandscape`/`roninbuilding` short forms.
- **Trademark flag (not legal advice)**: USPTO application serial **87300933** for "RONIN"
  covers Class 037 (construction consulting incl. landscape/hardscape/site-design construction
  management) and Class 042 (architectural + landscape-architecture consulting re: site design) —
  overlaps Building Design and Landscape Design at the classification level. Live/dead status and
  owner could not be confirmed (TSDR is JS-rendered); flagged for a direct human TSDR pull or
  counsel review before committing marketing spend under those two niche names. No equivalent
  flag surfaced for plumbing classes or for "RONIN DOJO DESIGN"/"RONIN DESIGN" exactly.

**Recommendation**: `ronindojodesign` (existing), `roninbuildingdesign`,
`roninplumbingdesign`, `roninlandscapedesign` — full `ronin<niche>design` form, consistent across
every surface, no short forms, no hyphens.

Full matrix, collision table, trademark note, and the operator's 30-minute domain-first reservation
checklist are in `docs/architecture/research/rdd-niche-handle-audit.md`.

## Files touched

| File | Change |
| --- | --- |
| `docs/architecture/research/rdd-niche-handle-audit.md` | new — full availability matrix, collision notes, trademark sanity flag, recommended handle forms, 30-min reservation checklist |
| `docs/sprints/SESSION_0664.md` | adopted (staged → in-progress → done), task log + close-out filled in |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| N/A — docs-only research lane, no code/build/test surface touched | n/a |

## Proposed ledger edits

- **Pointer only** (this lane does not own any ledger — forbidden list excludes them): the
  future RDD-social-goals tracking row (wherever the operator lands the #280 F5 "reserve RBD
  handles" checklist item) should link to
  `docs/architecture/research/rdd-niche-handle-audit.md` as the source audit, and record the
  actual reserved handles + any fallback variants once the operator runs the checklist — this
  audit intentionally reserved nothing.

## Open decisions / blockers

- Operator still needs to run the reservation checklist itself (domains → LinkedIn → Instagram →
  Facebook → YouTube → X → TikTok) — nothing in this audit performed a reservation.
- USPTO serial 87300933 needs a direct human TSDR pull (or counsel) before Building Design /
  Landscape Design marketing spend — this audit could not confirm its live status.
- Instagram/Facebook/X/TikTok handle availability is unconfirmed; operator should have a fallback
  handle ready for each before reserving.

## Residual for AM merge

None expected — docs-only, no code/build/test surface, no forbidden paths touched. PR is
ready for review/merge at the operator's discretion (this lane does not merge its own PR).

