---
name: seq-review-wave
description: Sequence skill — the parallel review wave (Doug + Desi + Giddy on ONE commit) followed by batched-fix resume and delta re-verify. Use after a build lands to verify it launch-safe: dispatching reviewers on a diff, folding findings back, and recording verdicts.
---

Ordered sequence for reviewing a landed build. Inputs: the commit/diff under review, the
surfaces it touches, and where verdicts get recorded (SESSION file Review log).

1. **Pick the wave roster by surface** (dispatch in ONE parallel message):
   - **Doug** always — gates re-run independently + failure-mode source review + live
     runtime UAT when a runtime surface changed (hermetic scratch DB per the 0577 recipe;
     NEVER proof data in a shared dev DB; tear down after).
   - **Desi** when member-facing or shared-primitive UI changed (doctrine conformance,
     mobile reality, contrast, one-card-family law).
   - **Giddy** when structure moved: new files/dirs, protocol/ritual edits, ADR-worthy
     decisions, merge-strategy questions.
   All reviewers review the SAME commit; reviewers verify, they do not fix.
2. **Collect findings** ranked P1 (blocks) / P2 (must-fix soon) / P3 (note), each with
   file:line and concrete evidence. A reviewer claim that fails re-verification is
   recorded as corrected, not silently dropped.
3. **Batched-fix resume.** Hand the P1+P2 list (plus elected P3s) to the ORIGINAL builder
   in one batch — resume its context (SendMessage) rather than a fresh agent when
   possible. One-file-class fixes may be applied inline by the lead.
4. **Delta re-verify.** Re-run the gates the fixes could break + the specific reviewer
   probe for each fixed finding. Refactors must prove behavior-preservation (re-run the
   original live smoke, expect identical output).
5. **Record.** SESSION file Review log entry per reviewer: reviewed tasks, verdict,
   score, follow-ups routed (ledger row or fix). Unresolved findings become Proposed
   ledger edits — never silently dropped.
6. **Gate the next step** on the verdict: GO / GO-WITH-NOTE proceeds to the push gate or
   merge sweep; NO-GO loops to step 3. The push gate always waits for the operator's
   explicit word regardless of verdict.
