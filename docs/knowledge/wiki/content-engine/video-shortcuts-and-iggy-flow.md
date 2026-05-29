---
title: Video Shortcuts and Iggy Flow
slug: content-engine-video-shortcuts-and-iggy-flow
type: concept
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + ChatGPT
last_agent: chatgpt-adoption-pass
parent: docs/knowledge/wiki/content-engine/content-atoms.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - content-engine
  - automation
  - video
---

## Summary

Video Shortcuts and Iggy Flow defines the mobile/video capture and automation-support layer that feeds the content engine. It specifies four iPhone shortcut classes — Quick Clip Intake, Promote to Atom, Media Task Bundle, and Publish Save-Back — plus the Iggy automation seeds and guardrails that keep the video lane lighter without making it looser.

## Status

active, adopted SESSION_0010 (2026-04-27)

## Key Idea

Iggy exists to make repeated content operations safer, lighter, and more traceable — not to become the creative director. In the video lane that means repeated capture becomes structured intake, repeated edit prep becomes reusable task bundles, repeated publish prep becomes checklists and save-back flows, and repeated evidence capture becomes named bundles. Mobile shortcuts feed the command center without becoming a second source of truth.

## Structure

### Iggy mission in this lane

Iggy exists to make repeated content operations safer, lighter, and more traceable.

In the video lane, that means:

- repeated capture becomes structured intake
- repeated edit prep becomes reusable task bundles
- repeated publish prep becomes checklists / save-back flows
- repeated evidence capture becomes named bundles

Iggy does **not** become the creative director.

### Video shortcut classes

#### Shortcut 1 — Quick Clip Intake

Use when:

- class clip was filmed
- tournament clip was filmed
- quick talking-head idea was recorded
- voice memo should become a content seed

Output — a new intake record with:

- title
- date
- brand target
- discipline
- event
- short note
- media file link/path
- desired outputs

ASCII flow:
```text
record clip
   |
   v
run Quick Clip Intake shortcut
   |
   v
generate intake record
   |
   v
send to INBOX queue
```

#### Shortcut 2 — Promote to Atom

Use when an intake item is worth building.

Output — creates:

- atom shell
- default hook/promise/proof/CTA slots
- linked media task seed
- linked review task

ASCII flow:
```text
intake item selected
   |
   v
Promote to Atom shortcut
   |
   +--> create canonical atom shell
   +--> attach media ref
   +--> create task bundle
```

#### Shortcut 3 — Media Task Bundle

Use when one atom should become multiple media tasks.

Output — tasks like:

- cut 20 second teaser
- cut 60 second reel
- make on-screen text
- write caption
- choose thumbnail
- export final
- save publication metadata

ASCII flow:
```text
atom selected
   |
   v
Media Task Bundle shortcut
   |
   v
spawn edit/export/review tasks
```

#### Shortcut 4 — Publish Save-Back

Use when a variant has shipped.

Output — saves:

- channel
- surface
- URL
- publish date
- notes
- next repurpose idea

ASCII flow:
```text
variant published
   |
   v
Publish Save-Back shortcut
   |
   v
publication record updated
   |
   v
repurpose follow-up created
```

### Iggy automation backlog seeds

#### Seed A — intake-runner contract
Standardize what every intake artifact must include.

#### Seed B — media-evidence bundle
Each media job should be easy to verify:

- source clip
- derived exports
- captions
- thumbnail
- publish proof

#### Seed C — repurpose ladder generator
When something publishes, create the next likely outputs automatically:

- reel -> article
- article -> email
- class clip -> curriculum note
- tournament clip -> recap post

#### Seed D — dashboard task views
Support views for:

- waiting on footage
- waiting on edit
- waiting on review
- waiting on publish

### Low-fi automation map

```text
   [Clip captured]
          |
          v
 +--------------------+
 | Quick Clip Intake  |
 +---------+----------+
           |
           v
 +--------------------+
 | Intake Queue       |
 +---------+----------+
           |
           v
 +--------------------+
 | Promote to Atom    |
 +----+-----------+---+
      |           |
      v           v
+-----------+   +----------------+
| Atom note  |  | Media task set |
+-----------+   +----------------+
      |                  |
      v                  v
+-----------+      +-------------+
| Scripting | ---> | Edit/Review |
+-----------+      +-------------+
      |                  |
      +---------+--------+
                |
                v
         +-------------+
         | Publish     |
         +------+------+
                |
                v
         +-------------+
         | Save-back   |
         +-------------+
```

### Guardrails

- do not create media tasks with no atom or intake parent
- do not publish without save-back
- do not let raw clips die in inbox limbo
- do not let shortcuts create a second source of truth
- do not let Iggy own final editorial approval

### Best first real implementation

1. Quick Clip Intake
2. Promote to Atom
3. Media Task Bundle
4. Publish Save-Back

That is enough to make the video lane useful without building a giant automation religion.

## Relationships

- [Command Center and Intake](command-center-and-intake.md) — the operations system these shortcuts feed into
- [Content Atoms](content-atoms.md) — canonical unit produced by Promote to Atom
- [Curriculum Extract Schema](curriculum-extract-schema.md) — sibling concept; "class clip -> curriculum note" is one of the repurpose ladder outputs

## Sources

- `docs/_imports/baseline-systems-pack/12_VIDEO_SHORTCUTS_AND_IGGY_AUTOMATION_BASELINE.md`

## Open Questions

- What is the actual storage target for intake records produced by Quick Clip Intake — Prisma table, markdown file, or external service?
- How do iPhone Shortcuts authenticate against the repo / app to write intake records?
- Where does the media file itself live (iCloud, S3, local repo) and how is the link/path captured reliably?
- What is the contract format for the "intake-runner contract" (Seed A) — JSON schema, Zod, Prisma model?
- How does Publish Save-Back detect or receive the live URL — manual paste, channel API, or scrape?
- Which dashboard surface renders the "waiting on" task views (Seed D) — and is it shared with the command center dashboard or separate?
