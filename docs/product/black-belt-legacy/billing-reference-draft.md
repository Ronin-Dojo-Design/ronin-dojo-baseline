---
title: "BBL Billing Reference (Draft) — internal hours/valuation reference"
slug: bbl-billing-reference-draft
type: reference--internal
status: draft
created: 2026-07-24
updated: 2026-07-24
session: SESSION_0668
---

# ⚠️ INTERNAL REFERENCE ONLY — NOT FOR SENDING ⚠️

**This is not an invoice. It will not be sent to Bob Bass or anyone else.** It exists so the
operator (Brian) has a defensible, transparent, arithmetic-backed estimate of build effort for his
own personal valuation reference. Bob Bass is named only as the nominal recipient of the
hypothetical build described in the README — he is not being billed, and this document should
never leave this repo as a real invoice.

---

## 1. The README baseline (quoted, dated)

`README.md` on `main`, in the "Milestone: MVP — LIVE" section, currently reads (as of this
session):

> **What it took, from the WordPress years to launch:**
>
> | | Commits | When |
> | --- | --- | --- |
> | The monorepo — where it began | **1,610** | Dec 20, 2025 → May 6, 2026 |
> | This app — live now | **822+** | Apr 25, 2026 → present |
> | **End to end** | **2,432+** | **~1,400 hours** at the keyboard (and that's a floor) |

— `README.md` lines 33–39.

**Dating the baseline.** The hours phrase ("~1,400 hours") was introduced by commit `0797d79f`
(2026-06-19, "🥋 Black Belt Legacy LAUNCHED — milestone banner + by-the-numbers"). The exact
numbers currently in the table (1,610 / 822+ / 2,432+ / ~1,400) were last set by commit `6de6d20e2`
(2026-06-20, "docs: reposition README to Black Belt Legacy (BBLApp v4.4) + add public
FEATURES.md") and have not been touched since (`git blame` on those lines confirms no later
commit). **Baseline date: 2026-06-20.**

At that commit, the exact reproducible commit count for "this app" (`git rev-list 6de6d20e2
--count`) was **841** — consistent with the README's own "822+" floor language. The number of
distinct numbered `SESSION_NNNN.md` records under `docs/sprints/` at that commit was **422**.

---

## 2. Update methodology (transparent, shown work)

**Step 1 — the README's own implied rate.** The README states 1,400 hours across 2,432 commits
(1,610 monorepo + 822+/841 this-app). That is a blended rate of:

```
1,400 hours ÷ 2,432 commits = 0.5757 hours/commit  (≈ 34.5 min/commit)
```

This is the only rate the source document actually states — it does not state an hours-per-session
rate directly, so one is derived from it (below), per the instruction to reuse the README's implied
rate for consistency rather than inventing an unrelated one.

**Step 2 — split the baseline total between the two build phases.** The README's 1,400 hours spans
two eras: the pre-BBL monorepo (1,610 commits, frozen — that phase ended May 6, 2026 and does not
grow further) and this app (841 commits at baseline). Applying the blended rate to each:

```
Monorepo era hours  = 1,610 × 0.5757 ≈  915.8 hrs   (frozen — not updated below)
This-app era hours  =   841 × 0.5757 ≈  484.2 hrs   (422 sessions at baseline)
                                         ─────────
Baseline total                          1,400.0 hrs  (matches README, by construction)
```

**Step 3 — derive an hours-per-session rate for "this app."** Only this app's `docs/sprints/`
session count grows session-over-session (the monorepo predates this repo's session ritual), so:

```
484.2 hrs ÷ 422 sessions ≈ 1.147 hrs/session  (≈ 69 min/session)
```

**Step 4 — count sessions since baseline (2026-06-20 → today, 2026-07-24).**

| Category | Count | Source |
| --- | --- | --- |
| Numbered `SESSION_NNNN.md` files now (repo-wide, incl. `_archive`) | 620 | `find docs/sprints -name 'SESSION_[0-9][0-9][0-9][0-9].md'` |
| Same, at baseline commit `6de6d20e2` | 422 | `git ls-tree -r 6de6d20e2 -- docs/sprints` |
| **Net new merged sessions since baseline** | **198** | 620 − 422 |
| Unmerged `auto/session-*` branches tonight (not yet merged — **in review**) | **39** | `git branch -r \| grep -c auto/session` |
| **Total incremental sessions since baseline** | **237** | 198 + 39 |

**Step 5 — apply the derived rate to the incremental sessions.**

```
237 sessions × 1.147 hrs/session ≈ 271.8 hrs
```

**Step 6 — commit-count cross-check (sanity, not the headline number).** Total commits on
`origin/main` today: 1,513. Since baseline (841): **672 new commits merged to main** (this
excludes commits still sitting on the 39 unmerged branches, so it's a partial count). Applying the
same blended rate: `672 × 0.5757 ≈ 386.9 hrs`. That the commit-based cross-check (≈387 hrs) lands
*higher* than the session-based estimate (≈272 hrs) is expected and directionally reassuring —
recent sessions (parallel-lane "wave" sessions, per `docs/sprints/SESSION_0635.md` and siblings)
bundle more commits per session than the 422-session historical baseline average (≈2.0
commits/session), so a flat per-session rate under-counts them. Consistent with the README's own
"and that's a floor" framing, the session-based figure below is treated as the **conservative
floor**, not a ceiling.

---

## 3. Updated total

| Component | Hours |
| --- | --- |
| Baseline (README, as of 2026-06-20) | 1,400.0 |
| + Sessions since baseline (237 × 1.147 hrs/session) | 271.8 |
| **Updated total (floor estimate)** | **≈ 1,672 hours** |
| *(commit-based cross-check, main-only, excludes in-review branches)* | *≈ 1,787 hours* |

Headline figure used below: **~1,672 hours** (the conservative, session-derived floor — same
posture the README itself takes).

### At standard and friends-and-family rates

| Rate | Total |
| --- | --- |
| $200/hr (standard) | 1,672 × $200 = **$334,400** |
| $100/hr (F&F rate) | 1,672 × $100 = **$167,200** |

---

## 4. Itemization by era

Grouped by build phase (hundreds of individual sessions make a per-session line unreadable — this
follows the phase structure the README and sprint numbering already imply).

| Era | Window | Commits | Sessions | Hours | @ $200/hr | @ $100/hr |
| --- | --- | --- | --- | --- | --- | --- |
| **1 — Monorepo foundation** (kernel + multi-brand harness, pre-BBL-app) | Dec 20, 2025 → May 6, 2026 | 1,610 | — (pre-dates this repo's session ritual) | 915.8 | $183,160 | $91,580 |
| **2 — BBL app bootstrap → MVP launch** | Apr 25, 2026 → Jun 19/20, 2026 | 841 | 422 | 484.2 | $96,840 | $48,420 |
| **3a — Post-launch hardening/build-out (merged)** | Jun 20, 2026 → Jul 23, 2026 | ~672 (main) | 198 | 227.1 | $45,420 | $22,710 |
| **3b — Tonight's wave (in review, unmerged)** | Jul 23–24, 2026 | not yet on `main` | 39 | 44.7 | $8,940 | $4,470 |
| **Total** | | | 659 (this-app sessions) | **1,671.8** | **$334,360** | **$167,180** |

(Small rounding vs. the §3 headline total — $334,400/$167,200 — is arithmetic rounding on the
per-session rate; both are the same estimate to within a few hours.)

*Not counted:* the pre-repo **legacy WordPress/PHP** years (mentioned in the README as prior
history but not commit-tracked, so no hours are attributable from source data).

---

## 5. Honesty note

This is an estimate built for the operator's own valuation reference, not a billed-hours audit —
it extrapolates the README's own stated rate forward using session counts, not timesheets, and Era
1 (the monorepo) and Era 3 (post-launch) both include shared kernel/multi-brand work (Mammoth CRM,
Ronin Dojo Design marketing site, `packages/ui-kit`) that isn't exclusively Black Belt Legacy — a
rough title-tag scan of the 221 sessions numbered since baseline shows roughly 82% mention BBL,
~28% Mammoth, ~17% RDD (overlapping, not mutually exclusive), so the operator should apply their
own judgment on whether to haircut Era 3 for a stricter BBL-only figure; Bob Bass is named only as
the nominal recipient and this draft is not going to him or anyone else.
