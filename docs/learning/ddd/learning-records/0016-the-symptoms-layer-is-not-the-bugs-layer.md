---
title: "Learning Record 0016 — The symptom's layer is not the bug's layer: the null field, the dead channel, the phantom monitor"
slug: learning-record-0016
type: learning-record
status: active
created: 2026-07-15
updated: 2026-07-15
author: "Giddy + claude-session-0539"
last_agent: claude-session-0539
pairs_with:
  - docs/learning/ddd/learning-records/0008-one-source-read-everywhere-and-the-display-dead-field.md
  - docs/learning/ddd/learning-records/0009-green-isnt-verified.md
  - docs/learning/ddd/learning-records/0004-projection-to-stored-table-without-drift.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# 0016 — The symptom's layer is not the bug's layer: the null field, the dead channel, the phantom monitor

> Giddy, to a junior dev. We spent a session making the BJJ belt render correctly. The belt looked
> wrong, so the instinct was "fix the component." The operator kept not liking the mock, so the instinct
> was "the design's off, iterate again." A subagent's build "hung," so the instinct was "wait for the
> monitor." All three instincts were aimed one layer too high. The belt was a **data** problem. The
> design wasn't rejected — it was never **seen**. The build wasn't hung — the **monitor** was lying. The
> reflex worth keeping: when a thing looks broken, walk *down* the layers before you touch the one the
> symptom is pointing at.

## The trap: the layer that shows the symptom is almost never the layer that holds the bug

The belt component rendered "silver bars" on some ranks. That reads as a component defect — go edit the
SVG. It wasn't. `Rank.degree` and (the new) `beltFamily` are what drive the bar; `degree` was added back
in 0493 *for exactly this render* and had been **null on every row ever since** — nobody populated it. The
"silver bars" were non-BJJ ranks (eskrima, kajukenbo) whose `beltFamily` is legitimately null, falling
through to a default neutral bar. **A field that exists is not a field that's filled.** The correctness
gap lived in the seed and the backfill, not in the component — the component was faithfully rendering the
absence of data. (This is [[learning-record-0008]] wearing a new coat: a field's *presence* told you
nothing about its *population*.)

The design pass had the same shape. The operator sent the mock back round after round — six of them. Read
naively, that's "the design keeps missing." It wasn't. Inline widget and image previews **did not render
in the operator's client at all**; they were reacting to blanks, not to the belt. The bug was in the
*channel*, not the *composition*. The moment the mock went out as a **published HTML artifact** the
operator could actually open, it converged in one look. And the recurring "the build subagent is stalled"
was a third instance: the build was long done; the **monitor** wrapping it was the thing that hung. The
ground truth — the OS process table and `.next/BUILD_ID` — said "finished" while the status wrapper said
"working."

## The discipline: diagnose the layer, then fix *that* one

Three moves, one reflex — descend to the layer that actually owns the fact:

- **Render wrong ⇒ suspect data before component.** Ask "is the field populated?" before "is the
  component right." Here the fix was a name-scoped, additive backfill (`Rank.beltFamily` + `degree`) plus
  making null a *designed* state — null family renders **no bar at all**, tested and live-verified — not a
  default neutral bar the operator will read as a defect. Non-BJJ ranks are a permanent population of
  nulls; the component's contract has to *name* them, not stumble into them.
- **Feedback stuck ⇒ suspect the channel before the taste.** When someone "keeps not liking it," confirm
  they can **see** it before you change it. If the preview channel is unreliable (inline widgets/images
  that silently don't render), switch to a durable, openable artifact *first* — don't spend review rounds
  reacting to a blank.
- **Subagent stalled ⇒ read the work, not the reporter.** Trust the ground-truth signal (process table,
  `BUILD_ID`, the artifact on disk) over the status monitor. A monitor is a projection of the work; when
  it disagrees with the work, the work wins.

## The quiet win: two writers of the same fact, agreeing by construction

Because the belt was a data gap, the fix had two writers — the seed (`buildBjjRanks()` sets `degree` +
`beltFamily` explicitly) and the migration backfill (derives the *same* values from the `shortName`'s
trailing digit, scoped by `RankSystem.name` so the five other systems that reuse codes like `BL`/`P`/`1D`
are untouched). Two writers of one fact is exactly where drift breeds. It doesn't here, because the
derivation *reproduces* the seed rather than restating it — `W3 → degree 3`, `BK5 → 5`, `R10 → 10`. When
you must have two writers, make one *compute* what the other *declares*, so they can't disagree. ([[learning-record-0004]].)

## What to do differently

1. **When a render is wrong, walk down the layers first.** Data populated? Resolver carrying the field?
   *Then* the component. A field added "for this render" is not proof it was ever filled.
2. **Make null the designed state, not the accident.** A permanent population of nulls (non-BJJ ranks) is
   a contract, not an edge case — name it, degrade to it deliberately, and test it. "Silver bars" is what
   an undesigned null looks like.
3. **When feedback won't converge, verify the channel before the artifact.** Confirm the reviewer can
   actually see your work; if the preview seam is flaky, move to a durable openable artifact as the
   *first* channel. Six rounds of "no" can be one broken preview.
4. **When a subagent stalls, read the ground truth, not the status wrapper.** Process table + `BUILD_ID`
   + the file on disk beat any monitor. A hung monitor is not a hung build.
5. **Two writers of one fact must agree by construction** — derive, don't restate — or they drift.
   ([[learning-record-0004]].)

## Related

- [[learning-record-0008]] — "one source read everywhere; display-dead isn't removable." Here the twin:
  a field's *presence* is not its *population* — `degree` existed for two-plus sessions and was null the
  whole time.
- [[learning-record-0009]] — "green isn't verified." The null-data gap passed every unit test (the belt
  rendered *something*); the live re-verify (zero silver bars) was the load-bearing gate that caught it.
- [[learning-record-0004]] — projection→stored without drift; the seed/backfill pair here is the same
  single-writer-of-truth discipline, satisfied by making the migration re-derive the seed's values.
- ADR 0026 + the design-system doctrine own the data-driven belt-color rule (the repo's ADR 0022 citation
  for this is stale drift — logged this session as D-044). The bar *treatment* is family-driven design; belt
  *color* stays data (`colorHex`), so ADR 0026 is honored.
