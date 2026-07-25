# DRAFT — CONFIDENTIAL — NOT LEGAL ADVICE — ATTORNEY REVIEW REQUIRED

*Prepared for the exclusive review of Michael Flores (Mammoth Metal Buildings) and Collin Moriarty LLC. Not for publication or further distribution.*

---

**Brian Scott**
Senior Developer & Repository Architect
Ronin Dojo Design

**To:**
Michael Flores — Mammoth Metal Buildings
Collin Moriarty LLC — Counsel to Mammoth Metal Buildings

**Date:** 2026-07-25

**Re:** Technical assessment of the development record in the Mammoth Metal Buildings repositories (mammoth.build; mammothmb.com) — prior web developer engagement

---

## 1. Purpose, scope, and author qualifications

This letter provides a professional technical assessment of the software development record contained in the two repositories associated with Mammoth Metal Buildings ("MMB"), covering the period of work performed by Tim Dodge, who was engaged as MMB's web developer. It is written at the request of company leadership as part of my onboarding review as MMB's incoming senior developer.

I am a Senior Developer and Repository Architect with Ronin Dojo Design. MMB engaged me as incoming senior developer under a written engagement executed 2026-07-24. My professional work includes the design, review, and maintenance of production software repositories, and the assessment of development history through version-control records.

For completeness: as MMB's incoming developer I have a commercial interest in this engagement. Counsel should weigh this assessment accordingly and should rely on the independently verifiable record (Section 5) rather than on my characterizations.

This is an initial assessment based on a first review conducted 2026-07-25. The figures in this letter should be re-derived from an exported git log (Section 5) before any reliance is placed on them, and I will supplement or correct this letter as needed once that export and preservation is complete.

This letter is a technical assessment, not a legal instrument. Where I describe the record, I identify the source it comes from and the limitations that apply. Where I offer an evaluation, I label it explicitly as my professional opinion. I draw no legal conclusions; any questions concerning Mr. Dodge's obligations to MMB, and whether the record described here bears on those obligations, are matters for counsel.

## 2. Evidence basis and provenance

- Both repositories at issue (the mammoth.build site and the mammothmb.com site) reside under MMB's GitHub organization. Their ownership status, and any characterization of them as company records, is for counsel to determine; I describe only where they reside and what their histories display.
- On 2026-07-22, at Mr. Flores's invitation, I was granted access to the repositories under MMB's GitHub organization as part of my onboarding. That access was subsequently rescinded/blocked; Mr. Flores has related that the removal was effected by Mr. Dodge. I state the removal as fact and its attribution as Mr. Flores's account; the organization's audit log (Section 5) can establish independently who granted, and who removed, that access and when.
- Because my access had been removed, the review of 2026-07-25 proceeded during a live Google Meet screenshare initiated by Mr. Flores: I observed the repositories' commit histories and GitHub contribution/activity views as displayed on Mr. Flores's screen, within the organization's own repository views. I held and used no credentials of my own during that review, and no private, personal, or third-party accounts or systems were accessed.
- Every observation in this letter derives from what those organization repository views displayed during that session.

A note on the nature of this evidence: git commit records are timestamped and attributed, but commit metadata is self-reported and repository history can be rewritten. For that reason I recommend immediate export and preservation of the full logs (see Section 5), so that every figure in this letter can be independently re-derived and any subsequent change to the histories would be detectable.

## 3. Findings from the repository record

The following describes what the identified records displayed during the review described in Section 2, with limitations noted.

### 3.1 Commit volume and cadence

GitHub's contributor view displayed **147 commits attributed to Mr. Dodge** across the two repositories as of 2026-07-25, with the earliest displayed activity in **December 2025**.

Two limitations apply, and I state them here rather than leave them to be discovered later:

- The 147 figure has not yet been re-derived from an exported git log; it may include merge commits or automated commits, and its composition should be confirmed before it is used.
- The exact first-commit date — and therefore any per-week rate — should be computed from the exported log, not from the displayed views. On the displayed figures (147 commits over approximately 29–34 weeks depending on the exact start date), the average would be on the order of four to five commits per week; I treat that arithmetic as provisional until the export in Section 5 is performed.

### 3.2 Activity-gap pattern

The GitHub contribution/activity graphs for both repositories, as displayed on 2026-07-25, showed long inactive gaps punctuated by isolated short periods of activity, rather than a sustained, regular working cadence. This is a description of the shape of the displayed activity graphs themselves; the graphs can be captured and reproduced on request. I draw no inference in this section about the cause of the gaps.

### 3.3 Account of the working relationship

I make no findings about the working relationship beyond the repository records described above. Counsel should obtain any account of the working relationship directly from company leadership.

## 4. Professional opinion (clearly labeled as such)

The following is evaluative and is offered strictly as my professional opinion as a senior developer, based solely on the records described in Section 3 and subject to the limitations stated there and here.

A limitation that bounds everything in this section: commit records capture only version-controlled work. I have no visibility into work Mr. Dodge may have performed outside these repositories — content or CMS changes, design work, hosting or DNS administration, meetings, or support — and this opinion is limited accordingly.

- **In my professional opinion**, a recorded cadence on the order of four to five commits per week across two production repositories, concentrated in isolated periods of activity separated by long gaps, is low relative to what I would expect from the version-control record of a developer responsible for two active company sites — subject to the provisional-figure and out-of-repository limitations above, and without knowledge of the scope or terms of Mr. Dodge's engagement.
- **The record is consistent with** intermittent engagement; the same pattern is equally consistent with periods of waiting on client input, out-of-repository work, or other causes I cannot assess from the record. I express no view on the cause.

I deliberately draw no conclusion about what obligations Mr. Dodge held or whether this record bears on them. I present the record in Section 3 as material counsel may wish to evaluate against Mr. Dodge's agreed obligations to MMB; that evaluation belongs to Collin Moriarty LLC, not to me.

## 5. Offer of further substantiation and recommended preservation

For any and all factual descriptions in this letter, I will on request provide:

- **A full export of both repositories' git logs**, with complete author and committer timestamps, from which every count and rate in this letter can be independently re-derived. I recommend this export be performed and preserved promptly, for the history-rewritability reason stated in Section 2.
- **Dated screenshots** of the repository views and activity graphs described, captured from the organization's own repository views.
- **Exact log entries for any individual commit** counsel wishes to review, provided verbatim from the export and without commentary.
- **Technical explanations of each finding in two registers** — senior-developer terms for technical review, and plain layman's terms for non-technical readers — so that every statement can be understood and tested by both audiences.

## 6. Closing

I remain available to Mr. Flores and to Collin Moriarty LLC to walk through the repository record live, to produce any of the materials above, or to answer technical questions arising from this assessment. Nothing in this letter should be read as a legal characterization of any person's conduct or obligations.

Respectfully,

**Brian Scott**
Senior Developer & Repository Architect
Ronin Dojo Design

---

*This document is a DRAFT prepared for review by Michael Flores and Collin Moriarty LLC only. It is a professional technical assessment, not a legal instrument, and is not for publication or further distribution. It states no legal conclusions and is subject to attorney review and revision before any use.*

---
---

# SEPARATE DOCUMENT — NOT PART OF THE LETTER

## Transmittal notes for counsel — Collin Moriarty LLC only

**CONFIDENTIAL. This memorandum must be detached from the letter and transmitted to counsel separately. It is not to accompany the letter to any other recipient.**

**Posture:** DRAFT — review-only, not ratified

**Privilege and posture (counsel's to establish)**
- The strongest available posture is for this assessment to be re-issued **at counsel's direction and addressed to counsel alone** before any version exists outside draft; whether that framing supports work-product treatment is counsel's determination, not the drafter's. No position on privilege is taken here — the current joint addressing followed the client's instruction and can be restructured on counsel's word.
- Distribution is drafted as strictly limited; counsel should confirm the client understands that wider circulation (to Mr. Dodge, to other staff, publicly) changes the risk profile materially, particularly for the opinion section.
- Consider dating any final version only after the log export and screenshot preservation are complete, and saying so in the letter, to answer any rush-to-judgment characterization of a review conducted one day into the engagement.

**Changes made in this revision, and why**
- **All comparative figures from the drafter's own repository were removed**, along with the counting-methodology note that supported them. The comparison benchmarked the incoming (commercially interested) developer against the predecessor, the counted units were not comparable, and the drafter's throughput is materially tool-assisted — any of which would collapse the comparison and the letter's credibility under examination. The letter now states the prior record standalone; if a productivity benchmark is wanted, counsel should commission it independently.
- **The secondhand leadership-concerns paragraph was removed.** Republication of third-party characterizations carries independent exposure that attribution does not cure; §3.3 now directs counsel to source any such account directly from leadership.
- **The quoted commit-message section was removed.** The quotation could not be confirmed verbatim, and an inexact quotation is a defamation vector with no offsetting evidentiary value in the letter itself. The exact log entry can be provided verbatim from the export, without commentary, under §5.
- **The "company records" characterization was replaced** with a neutral statement of where the repositories reside; ownership is the very question counsel must decide and is now expressly reserved to counsel.
- **The access mechanism was restated and then updated on Brian's confirmation (2026-07-25):** Brian was invited to the organization's repositories by Mr. Flores on 2026-07-22; that access was subsequently rescinded/blocked, per Mr. Flores by Mr. Dodge. The letter now states the invitation and removal as fact, attributes the "by whom" strictly to Mr. Flores's account, and keeps the 2026-07-25 observations grounded in the screenshare. Counsel note: the GitHub organization audit log will independently corroborate the grant and the removal (actor + timestamp) — obtain it in the Section 5 preservation pass; an access-removal by the outgoing developer against the incoming reviewer may itself be material, and its characterization is counsel's, not the drafter's.
- **The 147 figure was recast** as what GitHub's contributor view displayed, with its unverified composition stated in the letter, and all per-week arithmetic marked provisional pending re-derivation from an exported log with an exact first-commit date.
- **Disclosures were added inside the letter** rather than held back: the drafter's commercial interest (§1); the limitation that commit records do not capture out-of-repository work (§4); the exculpatory alternative explanations for the activity-gap pattern (§4); and git history's rewritability with a preservation recommendation (§2, §5).
- **The dollar figure was removed** from the engagement description (§1) as business-confidential and irrelevant to the assessment.
- **The Section cross-reference error was corrected** (substantiation is Section 5).

**Suggested independent verification before reliance**
- Export the raw git log from both repositories (`git log` with full author/committer timestamps) rather than relying on GitHub's rendered views; re-derive the letter's counts and dates from that export.
- Pull the GitHub organization audit trail and repository access records to corroborate provenance (who had access, when the review occurred).
- Confirm the composition of the 147 figure — merge commits, automated/bot commits, other authors — before any per-week arithmetic is used anywhere adversarial.
- Capture and preserve dated screenshots of the activity graphs, and the exact log line of the commit message referenced above, now — before history could be rewritten or access change.

**Claims most in need of counsel's judgment**
- Whether any comparative-productivity framing is wanted at all, or whether the standalone record serves the intended use better. The comparison was removed from the letter for the reasons above; restoring any version of it is counsel's call and should rest on an independent benchmark.
- Mr. Dodge's employee-vs-contractor status and any IP or ownership claims over the repositories — this drives both the ownership language in §2 and the access-provenance framing.
- Whether the opinion section (§4) should survive at all for the intended use, given the drafter's disclosed commercial interest, or whether the letter should be reduced to the factual record plus the substantiation offer.
- Any fiduciary-duty, breach, or negligence framing was excluded from Brian's voice throughout; if such a theory is pursued, it must be counsel's characterization layered onto the factual record, not an edit to Brian's sections.

**Drafting choices and rationale**
- The letter's register is descriptive throughout; neutrality is shown by the drafting, not asserted in the text.
- Employment status is left uncharacterized ("engaged as web developer") — classification carries legal consequences outside a technical assessment's competence.
- §3.2 describes the shape of the activity graphs only and now expressly disclaims causal inference in the letter itself, with the alternative explanations stated in §4 rather than omitted.
- The provisional-figures posture (§1, §3.1) is deliberate: no count or rate is asserted as final until re-derived from a preserved export, so no figure in the letter can be impeached by a later, more precise derivation.

**Not legal advice — attorney review required before this is sent to or executed by any party.**