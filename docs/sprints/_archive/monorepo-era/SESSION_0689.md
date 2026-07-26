---
session: SESSION_0689
title: "RDD handle-reservation worksheet (from niche-handle audit #291)"
status: closed
lane: build
brand: rdd
recipe: docs-only
operator: Brian
created: 2026-07-24
updated: 2026-07-24
issue: "#291"
branch: auto/session-0689-handle-reservations
posture: drafts
pairs_with:
  - docs/architecture/research/rdd-handle-reservation-worksheet.md
  - docs/architecture/research/rdd-niche-handle-audit.md
  - docs/architecture/research/research-review-rdd-social-automation.md
---

# SESSION_0689 — RDD handle-reservation worksheet

## Goal

Turn the passive niche-handle audit (#291 / #280 F5,
`rdd-niche-handle-audit.md`) into an operator-executable **reservation worksheet** — one table per
brand (RDD umbrella, Mammoth Build, and the `ronin<niche>design` pattern) × platform (Instagram, X,
TikTok, YouTube, LinkedIn, Facebook, Google Business), with desired handle, a blank status column for
the operator to confirm, priority (P1/P2/P3), fallback handles, and a short reservation checklist.
**Reservations remain the operator's action — this lane reserves nothing.**

## What landed

- **New:** `docs/architecture/research/rdd-handle-reservation-worksheet.md` — the worksheet.
  - Three brand sections: **Ronin Dojo Design** (umbrella), **Mammoth Build**, and the
    **`ronin<niche>design` pattern** (Building / Plumbing / Landscape concrete instances + a
    future-niche template).
  - Each row: platform, desired handle, audit availability signal pre-filled, **blank `Status ☐`
    column** for the operator, priority, ordered fallback handles, and the reserve-at flow.
  - Audit-flagged states carried through verbatim: `ronindojodesign` **OWNED**; the three niche
    `.com` domains **available (DNS)**; the three niche **YouTube `@handles` available (confirmed)**;
    IG/FB/TikTok/X **uncertain**; LinkedIn **likely available**.
  - Load-bearing gotchas surfaced: **X's 15-char cap** (only `ronindojodesign` and `mammothbuild`
    fit; niche forms need shortened X handles — provided), the **never-shorten rule** for
    `roninplumbing` / `roninlandscape` (real active businesses), **Google Business = profile+verify,
    not a string grab**, and the **USPTO serial 87300933** trademark gate before Building/Landscape
    spend.
  - Flagged that **Mammoth Build and all Google Business rows were not in the #291 audit** → status
    `not audited`, needs a cold check before the sitting.
  - ~35-min domain-first reservation checklist ending in a close-the-loop step back to the goals
    ledger.

## Proposed ledger edits

*(This lane touches no shared ledger. The following are routed here for the merge owner / operator —
do not apply in-lane.)*

- **`docs/knowledge/wiki/goals-ledger.md`** — the RDD social-goals row that #291 / SESSION_0664
  descends from: add a pointer to this worksheet as the executable artifact ("audit → worksheet →
  operator reserves"), and a slot to record what actually gets reserved (+ fallback handles used)
  after the operator's sitting. Uncommitted local edits already exist on this file in the canonical
  tree (pre-existing, not from this lane) — merge owner should reconcile.
- **`docs/knowledge/wiki/index.md`** — add a backlink to
  `docs/architecture/research/rdd-handle-reservation-worksheet.md` under the RDD research cluster
  (the worksheet already declares the backlink in frontmatter; index needs the reciprocal entry).
- **No new ADR / drift / FS / incident finding** surfaced this lane.

## Verification

Docs-only, no code gate. No app code, schema, or shared ledger touched; owned paths only
(`docs/architecture/research/rdd-handle-reservation-worksheet.md`,
`docs/sprints/SESSION_0689.md`). No dev server, typecheck, lint, or test applicable.
