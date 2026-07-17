---
title: "ADR 0047 — Promoter-as-placeholder: recruited-coach identity, doorless until phase-2, exact-normalized dedup"
slug: 0047-promoter-as-placeholder-recruited-coach-identity
type: adr
status: accepted
created: 2026-07-15
updated: 2026-07-16
last_agent: codex-session-0542
pairs_with:
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
  - docs/architecture/decisions/0036-unified-passport-claim.md
  - docs/architecture/decisions/0043-rank-award-fact-vs-member-milestone.md
  - docs/architecture/ubiquitous-language.md
  - docs/product/black-belt-legacy/lineage-data-wiring-flow.md
  - docs/product/black-belt-legacy/rank-entry-unified-data-flow.md
  - docs/product/black-belt-legacy/rankentry-unification-epic.md
backlinks:
  - docs/sprints/SESSION_0541.md
  - docs/sprints/SESSION_0540.md
  - docs/sprints/SESSION_0542.md
  - docs/knowledge/wiki/index.md
---

# ADR 0047 — Promoter-as-placeholder: recruited-coach identity, doorless until phase-2, exact-normalized dedup

**Status:** accepted (SESSION_0541). Ratifies the identity sub-shape SESSION_0540 (PR #209) shipped ahead of
its ADR — the one condition Giddy's hostile close held the 9.0 merge on. Grill-locked with the operator at
SESSION_0541 bow-in.

## Context

SESSION_0540's backfill-verification model lets a member (or an admin) **free-type the coach who promoted
them** on a belt. That freetext is captured as two artifacts (operator model): an **identity** — a
find-or-create placeholder `Passport` set as the award's `awardedByPassportId` — and a **recruitment
`Lead`** in a CRM bucket so the coach can later be invited. This puts a person on the moat's promotion
provenance graph (ADR 0025 = Passport is the identity SoT) instead of a name buried in `notes`.

Giddy's hostile close (SESSION_0540 REVIEW_03) flagged five things this ADR must settle: the placeholder was
called **"claimable" but has no claim door** (FINDING_01/D-045); dedup used a **fuzzy** matcher over the
non-unique `Passport.displayName` → **false-merge** risk (FINDING_03); the identity+CRM emit ran **outside
the award tx** → **orphan stub** on a fail-closed write (FINDING_04/WL-P3-44); the same side-effecting
builder ran on the **admin path** silently (FINDING_02/WL-P3-47); and trust decisions write
`RankAward.verificationStatus` while reviews live on `RankEntry` → **mixed-spine** debt (FINDING_06).

## Decision

### D1 — The recruited-coach placeholder is a legitimate *doorless* identity sub-shape (not "claimable" yet)

A free-typed coach mints an **accountless** (`userId` null), **off-tree** (no `LineageNode` /
`DirectoryProfile`) `Passport` via `createPassport` (SOT-ADR D1) — the same primitive the WP-import /
admin-add-person / claim-placeholder paths use. It is **hidden from every public surface** (nothing renders
a bare Passport — the no-leak invariant). It is a recruitment/identity **artifact**, **not a claimable
identity**: a bare Passport has **no ADR 0036 claim door** (no node/tree/directoryProfile to claim) and
**no ADR 0032 email-reconcile hook**, so no claim path reaches it today. Language is binding: call it a
**"recruited-coach placeholder"**, never "claimable placeholder" — the claim door is **phase-2** (D-045/
FINDING_01). This is the ratified sub-shape: a person can exist on the graph as a promoter edge before they
have any way in.

### D2 — Identity lives on the Passport; the org is only the CRM bucket

The coach's identity is the placeholder Passport. The recruitment `Lead.organizationId` (a required FK) is
**purely a CRM bucket** — every promoter lead anchors to ONE shared, hidden `Organization` ("BBL Coach
Outreach", slug `bbl-coach-outreach`, type `AFFILIATION`, `ownerId` null), upserted on its compound-unique
slug. The lead links back to the placeholder Passport via **`meta.passportId`** (no schema churn — a
nullable `Lead.passportId` FK was deemed unnecessary). The earlier objection (the org standing in for the
coach's identity) is resolved: the org no longer carries identity, only pipeline. The lead **never sends
outreach** — "invite this coach" is an operator click.

### D3 — Exact-normalized dedup (bias to duplicates); phase-2 admin MERGE is the escape

Re-typing the same coach reuses the same placeholder, but matching is **exact on the normalized name**
(`exactNormalizedNameMatch`, shared by the Passport and Lead resolvers), not fuzzy. For a **provenance graph a
duplicate is the safe error and a false-merge is the dangerous one**: two placeholders for one coach are trivially **merged** later
(repoint edges); two distinct coaches collapsed onto one Passport must be **split** (adjudicate which
promotion edges belong to whom) — and a phase-2 claimant would inherit the wrong students. So we accept more
duplicates to eliminate fuzzy false-merges. Two coaches whose names *normalize identically* still merge —
that is inherent to name-only dedup, and the **escape is a phase-2 admin MERGE tool** (merge, the easy/safe
direction — not split). The candidate scope stays tight (accountless + off-tree + already-a-promoter) so a
match can never attach a typed name onto a real on-tree person. The `emit-school-lead` matcher is **left
fuzzy** — a school placeholder org is not provenance-critical the same way and the flywheel wants the looser
match.

### D4 — The identity + CRM capture is transactional with the award write

`ensurePromoterPlaceholder` and `emitPromoterLead` / `emitSchoolLead` **thread the award `$transaction`
client** and run **inside** it. A fill-once fail-closed (the TOCTOU race guard) throws **inside** the tx, so
the placeholder + lead roll back with the award — **no orphan recruitment stub** (FINDING_04/WL-P3-44). The
capture is correct-by-construction: resolve → award write → fail-closed throw all share one tx.

This atomicity deliberately couples award availability to identity/CRM capture: a slow or failed capture aborts
the fact save, and the interactive transaction stays open across the placeholder and Lead reads/writes. Both
identity candidates (`accountless + off-tree + already a promoter`) and open promoter leads are predicate-scoped
but currently **unbounded scans**. That is the accepted consistency-over-latency tradeoff for the current volume,
not evidence that the scans are free; growth changes the transaction-duration risk even though it does not change
the no-orphan invariant.

### D5 — Recruit on freetext, on both paths; resolver split from side-effect, honestly named

The identity **resolver** (`ensurePromoterPlaceholder`) is separate from the CRM **side-effect**
(`emitPromoterLead`); the seam that runs them is renamed `buildFactUpdateData` → **`resolveFactUpdateWithCapture`**
so the capture is intentional and named, not silent (FINDING_02/WL-P3-47). Recruitment fires **only on a
free-typed name** (a picked, registered promoter/school never recruits) and fires on **both the member and
the admin** belt-fact paths — an admin correcting a member's promoter should also recruit that coach
(operator: recruit broadly). The member/admin **reference resolution and capture semantics** stay shared
(SESSION_0501); their trust policies intentionally do not. A member edit runs the active-promoter/anchor transition
and may create a proposal, while an ordinary admin fact correction acts under admin authority and preserves the
existing trust status. A pending proposal still requires the distinct explicit override, which denies the proposal
and applies the correction atomically; the admin path does not silently rerun the member trust tree.

### D6 — Trust logic on `RankAward.verificationStatus` is net-new RankAward-retire port surface

`decideBackfillPromoterTransition` / `applyMemberPromoterTransition` and the shared
`verifyRankEntryInTransaction` core still write `RankAward.verificationStatus` while reviews live on `RankEntry`;
proposal approval/override also apply active promoter provenance to `RankAward` during compatibility. This ADDS
RankAward-keyed logic mid-migration (FINDING_06). It is logged as
**relocate-to-`RankEntry.status`** for the RankAward-retire epic ([[rankaward-retire-to-rankentry-only]]);
new trust logic must not deepen the RankAward spine beyond this.

### D7 — An established-coach replacement is an immutable proposal, not active provenance

When a member replaces an **established** active promoter A with a different established coach B, A remains the
accepted promoter while one `RankEntryReview{reason: PROMOTER_CHANGED, status: PROPOSAL_PENDING}` carries an immutable
snapshot of both the expected prior promoter A and proposed promoter B. Creating the review does not mutate the
active promoter or `RankEntry.status`. Re-submitting B is idempotent and returns the same pending proposal;
submitting a different target while it is pending is a conflict. There is never more than one actionable pending
promoter proposal for an entry. A member promoter decision freezes the full authority predicate in canonical
**Passport→Award→Review** tiers: every workflow pre-reads and locks its complete sorted Passport reference union
before any Award; member authority decisions then lock all earned Awards, while award-local admin/reviewer paths
lock the target Award; open Reviews come last. The earner Passport lock blocks new RankAward inserts through the FK
key-share check, and deterministic Award locks block eligibility/rank/delete changes before the anchor is resolved.
Every path re-reads the reference graph after locking and fails closed if an unowned identity or review appeared.
Canonical identity merge uses the same tier order, so no path can hold an Award while waiting on a Passport owned
by the merge.

Because Vercel applies migrations before the new writer becomes active, rollout is deliberately expand-only:
nullable snapshot fields/FKs accept both writer generations, and a second additive migration introduces
`PROPOSAL_PENDING` without changing the legacy `PENDING` default. The immediately previous reviewer accepts only
the exact `PENDING` value, so it cannot list or directly action a captured proposal and silently approve without
applying B. The new writer treats both legacy `PENDING` and `PROPOSAL_PENDING` as open when guarding a second
proposal; the operator queue inventories both, while captured decisions accept only `PROPOSAL_PENDING`. A mixed
rolling window can still produce legacy cleanup or make a captured compare-and-swap stale, but it fails closed
rather than corrupting provenance. The database partial-unique and captured required-field `CHECK` belong to the
later WL-P1-9 contract deploy, after old instances drain and legacy rows are resolved. A≠B remains enforced when a
proposal is created, not as a durable FK check: a later canonical identity merge may correctly collapse A and B.

Approval conditionally claims that exact `PROPOSAL_PENDING` / `PROMOTER_CHANGED` proposal, verifies that A is still active,
applies B, verifies the entry, audits the decision, and marks the review APPROVED in one transaction. Denial marks
the review DENIED and audits it in one transaction; A and its prior entry status remain unchanged. A stale,
wrong-reason, or already-decided review cannot mutate provenance.

The ordinary admin fact editor obeys the same pending-proposal block; it is not an implicit review bypass. A
separate explicit admin-override command may supersede the workflow only by atomically denying the pending proposal,
applying the override value under admin authority, and writing an audit record. This is a distinct command, not a
special case hidden inside the normal editor.

This decision is deliberately narrow: ADR 0047 D1/D5's **free-typed recruited-coach path remains unreviewed** and
stays UNVERIFIED, and `SCHOOL_CHANGED` is not pulled into this implementation by analogy. The proposal model applies
to established-coach `PROMOTER_CHANGED` reviews only. Member/reviewer surfaces may show B as a proposal; public
lineage and provenance continue to show A until approval and never expose a pending private proposal.

Passport identity merges canonicalize active `RankAward.awardedByPassportId` edges and both proposal snapshot FKs
before deleting the superseded Passport, using Passport→Award→Review locks. This identity rewrite does not decide a
belt review: even if A and B collapse to the same canonical Passport, its status and decision timestamps stay
unchanged for explicit steward resolution. Account deletion fails closed with a domain error when that Passport is
referenced by active or terminal promotion history; detaching the account would incorrectly reclassify an
account-only established coach as a recruited placeholder under D1.

## Consequences

- **Phase-2 (deferred, not built):** the claim door + confirm loop (leaded coach registers → belts bind FK
  → coach confirms → `UNVERIFIED`→`VERIFIED`) plus the **admin MERGE tool** (D3 escape). Until phase-2, a
  recruited coach's placeholder is inert identity + a demand-counted lead. The `PROMOTER_CHANGED` review queue
  is G-010, built in SESSION_0541 and integrity-hardened under D7 in SESSION_0542; it is not part of the deferred
  coach-claim loop.
- **Recruitment-flywheel consistency (follow-up):** the "add person / add user" admin surface does **not**
  emit a promoter lead today; capturing free-typed persons there as recruitment leads is a separate
  flywheel-consistency follow-up (ledgered SESSION_0541), out of this ADR's scope.
- **No-leak invariant holds:** bare placeholder Passports surface nowhere public; any future surface that
  renders promoters must exclude accountless off-tree placeholders or gate them.
- **Deployment is expand/contract, not one-shot:** prebuild-before-activation makes a same-deploy constraint unsafe
  for the old multi-transaction writer. The additive `PROPOSAL_PENDING` discriminator prevents the old reviewer
  from corrupting new proposals; WL-P1-9 owns the post-rollout inventory, constraint migration, adversarial proof,
  and deploy-order gate while preserving valid identity-collapse history.

## Alternatives considered

- **Keep it fuzzy + phase-2 SPLIT tool** — rejected: split is the hard/dangerous direction; biasing to
  duplicates + merge is safer for a provenance graph (D3).
- **Gate recruitment to the member funnel only** — rejected: the operator wants admin-typed coaches
  recruited too; the fix for the "silent" concern is the honest rename (D5), not removing the capture.
- **A nullable `Lead.passportId` FK** — rejected as churn; `meta.passportId` carries the link (D2).
- **Apply B immediately, then review the mutable value** — rejected: unreviewed provenance would replace A, and
  the reviewer could approve a value different from the one inspected (D7).
- **Mutate or supersede a pending proposal on a second edit** — rejected: an immutable proposal is the audit
  subject. Same-target resubmission is idempotent; a different target conflicts until the first review resolves.
