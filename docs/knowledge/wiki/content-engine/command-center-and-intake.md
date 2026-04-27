---
title: Command Center and Intake
slug: content-engine-command-center-and-intake
type: concept
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + ChatGPT
last_agent: chatgpt-adoption-pass
health: 6
parent: docs/knowledge/wiki/content-engine/content-atoms.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - content-engine
  - intake
  - operations
---

## Summary

The Command Center and Intake system is the operations layer of the Ronin Dojo content engine. It defines how raw ideas, clips, and notes enter the system, get triaged, and flow through atomization, media work, publishing, and iteration. It is repo-native — designed to fit Next.js, Expo, Postgres + Prisma, the wiki, and current MDX content — rather than recreating old-stack chaos.

## Status

active, adopted SESSION_0010 (2026-04-27)

## Key Idea

One canonical content atom is the upstream reusable unit for an idea, but in this baseline repo content lives across three practical lanes — knowledge (wiki/sessions), public articles (MDX in `apps/web/content/blog/`), and emerging structured content (ContentAtom / ContentTask / variants). The command center should not force all three into one datastore on day one. Instead, it keeps each lane clean and builds an intake and orchestration lane that can feed all three. Capture better, shape once, publish many, preserve the truth, and learn from what shipped.

## Structure

### Core doctrine — one truth, many outputs

Use one canonical **content atom** as the upstream reusable unit for an idea.

In the baseline repo, content currently lives across three practical lanes:

1. **Knowledge lane** — wiki docs, sessions, architecture notes
2. **Public article lane** — MDX content in `apps/web/content/blog/`
3. **Emerging structured content lane** — schema-backed content atoms / tasks / variants

Repo-specific rule: do not force all three into one datastore on day one. Keep the knowledge lane clean, keep the public article lane working, and build the intake and orchestration lane so it can feed both.

### Command center states

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

### Command center dashboard blocks

#### A. Intake queue
New ideas not yet shaped.

Fields:
- source
- captured_at
- topic
- brand target
- urgency
- raw media present?
- requires research?

#### B. Atom queue
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

#### C. Media ops queue
Everything waiting on:
- footage
- edit
- thumbnail
- captions
- export
- upload

#### D. Publish queue
Ready variants waiting on:
- review
- channel selection
- publish slot
- live URL save-back

#### E. Iteration queue
Published things that should turn into:
- reel -> short lesson
- short -> blog
- article -> curriculum extract
- clip -> tournament recap
- article -> talk outline

### Intake system

#### Intake sources
- quick note
- wiki research page
- session file
- tournament result
- class note
- media capture
- iPhone shortcut
- voice memo / quick clip / link dump
- operator request

#### Intake record shape
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

### Intake flow

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

### Repo-native publication strategy

#### A. Article / long-form path
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

#### B. Structured app content path
```text
Atom
  |
  v
ContentAtom / ContentTask / future variant records
  |
  v
site renderers / account views / internal dashboards
```

#### C. Knowledge path
```text
Atom
  |
  v
wiki concept / SOP / training note / session follow-up
```

Rule: the command center should know which path is being used. Do not pretend every idea must ship through the same surface.

### Recommended repo-facing object model

#### ContentAtom
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

#### ContentTask
Owns:
- task type
- assignee
- due
- current status
- media dependency
- publish dependency

#### ContentVariant
Owns:
- output channel
- output surface
- copy transform
- media transform
- publish status

#### PublicationRecord
Owns:
- published channel/site
- URL
- date
- checksum or version marker
- notes for next repurpose step

### Iggy integration

Iggy's job is **not** to own the product. Iggy's job is to make repeated content workflow motion safer and easier.

Iggy should own these support layers:
- intake runner contracts
- evidence bundle structure
- media-ops task seed templates
- export checklist templates
- publish save-back contracts
- follow-on task generation for repurposing

Iggy should not own:
- final editorial truth
- brand voice
- product decisions
- creative direction

### Video shortcuts lane

Shortcut-friendly capture layer adapted for the new repo. Goal: make quick mobile capture feed the command center without bypassing canonical truth.

#### A. Capture Short — for raw clip or idea capture
```text
iPhone Shortcut
   |
   +--> save video / note / metadata
   +--> generate intake record
   +--> push to intake queue
```

Suggested fields: title, date, discipline, people involved, event, clip length, notes, desired outputs.

#### B. Atom Short — promote intake item to atom draft
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

#### C. Edit Short — create media/edit tasks
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

#### D. Publish Short — queue approved variant for publish path
```text
ready variant
   |
   +--> MDX path
   +--> social/video path
   +--> save publication record
```

### ASCII command center flow

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

### Suggested dashboard views

- **Today** — all tasks due today across writing, media, review, publish
- **Waiting on media** — items blocked by footage/edit/caption/export
- **Ready to publish** — approved variants waiting only on final channel push
- **Needs atomization** — inbox items still too raw
- **Needs repurpose** — published items worth expanding into article, lesson, curriculum block, email, tournament recap

### Operating rules

1. Keep intake fast.
2. Keep canonical truth upstream.
3. Let outputs vary by channel and brand.
4. Do not make every idea a blog post first.
5. Do not lose raw clips in camera roll chaos.
6. Do not let video capture bypass metadata capture.
7. Let Iggy automate support, not authorship.
8. Save publication history back into the system.

### Best first implementation slice

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

## Relationships

- [Content Atoms](content-atoms.md) — canonical upstream unit that the command center shapes ideas into
- [Curriculum Extract Schema](curriculum-extract-schema.md) — sibling concept for one of the downstream output paths
- [Video Shortcuts and Iggy Flow](video-shortcuts-and-iggy-flow.md) — the mobile/automation layer that feeds intake

## Sources

- `docs/_imports/baseline-systems-pack/11_CONTENT_ENGINE_COMMAND_CENTER_AND_INTAKE_BASELINE.md`

## Open Questions

- Which datastore (if any) holds the intake queue on day one — a dedicated Prisma model, a markdown queue file, or an external tool?
- How do `ContentAtom`, `ContentTask`, `ContentVariant`, and `PublicationRecord` map onto existing Prisma schema vs. new tables?
- Where does the command center UI live — internal Next.js dashboard, mobile app, or shortcut-driven only at first?
- How is brand_target reconciled with the orthogonal Brand-as-column model from Passport + Shells?
- What is the canonical atom ID format and how does it cross-link to MDX article slugs and PublicationRecord URLs?
