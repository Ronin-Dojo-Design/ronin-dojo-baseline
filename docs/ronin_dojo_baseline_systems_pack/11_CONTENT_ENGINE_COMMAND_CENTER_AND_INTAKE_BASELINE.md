# Content Engine Command Center and Intake System — Baseline Repo

## Purpose
Design a content engine that actually fits **this repo**:

- Next.js web
- Expo mobile
- Postgres + Prisma
- repo-native wiki/docs/sessions
- current public MDX content
- emerging ContentAtom / ContentTask direction
- automation support from Iggy
- mobile-first capture / shortcuts-friendly intake

---

## 1. Core doctrine

### One truth, many outputs
Use one canonical **content atom** as the upstream reusable unit for an idea.

But in the baseline repo, content currently lives across three practical lanes:

1. **Knowledge lane**  
   wiki docs, sessions, architecture notes

2. **Public article lane**  
   MDX content in `apps/web/content/blog/`

3. **Emerging structured content lane**  
   schema-backed content atoms / tasks / variants

### Repo-specific rule
Do not force all three into one datastore on day one.

Instead:

- keep the knowledge lane clean
- keep the public article lane working
- build the intake and orchestration lane so it can feed both

---

## 2. Command center states

Use these operating states:

- `INBOX`
- `TRIAGE`
- `ATOMIZING`
- `SCRIPTING`
- `RECORDING`
- `EDITING`
- `READY_REVIEW`
- `READY_PUBLISH`
- `PUBLISHED`
- `ARCHIVED`

---

## 3. Command center dashboard blocks

## A. Intake queue
New ideas not yet shaped.

Fields:
- source
- captured_at
- topic
- brand target
- urgency
- raw media present?
- requires research?

## B. Atom queue
Ideas that have passed triage and are becoming canonical atoms.

Fields:
- canonical_id
- hook
- promise
- proof
- CTA
- target outputs
- source evidence
- status

## C. Media ops queue
Everything waiting on:
- footage
- edit
- thumbnail
- captions
- export
- upload

## D. Publish queue
Ready variants waiting on:
- review
- channel selection
- publish slot
- live URL save-back

## E. Iteration queue
Published things that should turn into:
- reel -> short lesson
- short -> blog
- article -> curriculum extract
- clip -> tournament recap
- article -> talk outline

---

## 4. Intake system

## Intake sources
- quick note
- wiki research page
- session file
- tournament result
- class note
- media capture
- iPhone shortcut
- voice memo / quick clip / link dump
- operator request

## Intake record shape
```text
capture_id
captured_at
source_type
working_title
brand_target
discipline
event_or_course
raw_media_present (yes/no)
suggested_outputs
owner
status
```

---

## 5. Intake flow

```text
Capture
  |
  v
Inbox
  |
  +--> discard
  +--> archive as reference only
  +--> promote to atom candidate
                 |
                 v
           canonical atom draft
                 |
                 +--> blog/article
                 +--> reel/short
                 +--> curriculum extract
                 +--> social caption set
                 +--> tournament/event recap
```

---

## 6. Repo-native publication strategy

## A. Article / long-form path
```text
Atom
  |
  v
long-form draft
  |
  v
MDX article in apps/web/content/blog
  |
  v
public site
```

## B. Structured app content path
```text
Atom
  |
  v
ContentAtom / ContentTask / future variant records
  |
  v
site renderers / account views / internal dashboards
```

## C. Knowledge path
```text
Atom
  |
  v
wiki concept / SOP / training note / session follow-up
```

### Rule
The command center should know which path is being used.
Do not pretend every idea must ship through the same surface.

---

## 7. Recommended repo-facing object model

### ContentAtom
Owns:
- hook
- promise
- proof
- CTA
- teaching truth
- target brand(s)
- target format(s)
- source evidence
- status

### ContentTask
Owns:
- task type
- assignee
- due
- current status
- media dependency
- publish dependency

### ContentVariant
Owns:
- output channel
- output surface
- copy transform
- media transform
- publish status

### PublicationRecord
Owns:
- published channel/site
- URL
- date
- checksum or version marker
- notes for next repurpose step

---

## 8. Iggy integration

Iggy’s job is **not** to own the product.

Iggy’s job is to make repeated content workflow motion safer and easier.

## Iggy should own these support layers
- intake runner contracts
- evidence bundle structure
- media-ops task seed templates
- export checklist templates
- publish save-back contracts
- follow-on task generation for repurposing

## Iggy should not own
- final editorial truth
- brand voice
- product decisions
- creative direction

---

## 9. Video shortcuts lane

This is the shortcut-friendly capture layer the old docs needed, but adapted for the new repo.

## Goal
Make quick mobile capture feed the command center without bypassing canonical truth.

## Shortcut classes

### A. Capture Short
For raw clip or idea capture.

```text
iPhone Shortcut
   |
   +--> save video / note / metadata
   +--> generate intake record
   +--> push to intake queue
```

Suggested fields:
- title
- date
- discipline
- people involved
- event
- clip length
- notes
- desired outputs

### B. Atom Short
Promote intake item to atom draft.

```text
selected intake item
   |
   v
generate atom shell
   |
   +--> hook
   +--> promise
   +--> proof
   +--> CTA
   +--> target outputs
```

### C. Edit Short
Create media/edit tasks.

```text
atom chosen
   |
   v
spawn tasks:
- trim short
- caption
- thumbnail
- title
- reel version
- article tie-in
```

### D. Publish Short
Queue approved variant for publish path.

```text
ready variant
   |
   +--> MDX path
   +--> social/video path
   +--> save publication record
```

---

## 10. ASCII command center flow

```text
           +-------------------+
           |  Capture sources  |
           | notes / clips /   |
           | tournament / class|
           +---------+---------+
                     |
                     v
              +-------------+
              |   INBOX     |
              +------+------+ 
                     |
                     v
              +-------------+
              |   TRIAGE    |
              +------+------+ 
                     |
          +----------+----------+
          |                     |
          v                     v
     archive/ref           atom candidate
                                 |
                                 v
                         +---------------+
                         |  ATOMIZING    |
                         +-------+-------+
                                 |
                                 v
                         +---------------+
                         |  SCRIPTING    |
                         +-------+-------+
                                 |
                                 v
                         +---------------+
                         | MEDIA / EDIT  |
                         +-------+-------+
                                 |
                                 v
                         +---------------+
                         | REVIEW/PUBLISH|
                         +-------+-------+
                                 |
                                 v
                         +---------------+
                         | ITERATE/REUSE |
                         +---------------+
```

---

## 11. Suggested dashboard views

### Today
All tasks due today across:
- writing
- media
- review
- publish

### Waiting on media
Items blocked by footage/edit/caption/export.

### Ready to publish
Approved variants waiting only on final channel push.

### Needs atomization
Inbox items still too raw.

### Needs repurpose
Published items worth expanding into:
- article
- lesson
- curriculum block
- email
- tournament recap

---

## 12. Operating rules

1. Keep intake fast.
2. Keep canonical truth upstream.
3. Let outputs vary by channel and brand.
4. Do not make every idea a blog post first.
5. Do not lose raw clips in camera roll chaos.
6. Do not let video capture bypass metadata capture.
7. Let Iggy automate support, not authorship.
8. Save publication history back into the system.

---

## 13. Best first implementation slice
Smallest real slice for this repo:

1. create intake note/record
2. promote to canonical atom
3. spawn:
   - one short-form script
   - one article draft path
   - one media task bundle
4. publish article to MDX or publish-ready draft
5. log publication record
6. generate follow-on repurpose task

That proves the lane without overbuilding.

---

## 14. Petey close

A content engine is not “post more.”

It is:
- capture better
- shape once
- publish many
- preserve the truth
- learn from what shipped

**Planned Passion Produces Purpose.**
**OSSS.**
