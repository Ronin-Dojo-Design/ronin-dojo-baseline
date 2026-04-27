# Video Shortcuts and Iggy Automation Flow — Baseline Repo

## Purpose
Define the mobile/video capture and automation-support layer that feeds the new content engine without recreating old-stack chaos.

---

## 1. Iggy mission in this lane
Iggy exists to make repeated content operations safer, lighter, and more traceable.

In the video lane, that means:
- repeated capture becomes structured intake
- repeated edit prep becomes reusable task bundles
- repeated publish prep becomes checklists / save-back flows
- repeated evidence capture becomes named bundles

Iggy does **not** become the creative director.

---

## 2. Video shortcut classes

## Shortcut 1 — Quick Clip Intake
Use when:
- class clip was filmed
- tournament clip was filmed
- quick talking-head idea was recorded
- voice memo should become a content seed

### Output
A new intake record with:
- title
- date
- brand target
- discipline
- event
- short note
- media file link/path
- desired outputs

### ASCII flow
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

---

## Shortcut 2 — Promote to Atom
Use when an intake item is worth building.

### Output
Creates:
- atom shell
- default hook/promise/proof/CTA slots
- linked media task seed
- linked review task

### ASCII flow
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

---

## Shortcut 3 — Media Task Bundle
Use when one atom should become multiple media tasks.

### Output
Tasks like:
- cut 20 second teaser
- cut 60 second reel
- make on-screen text
- write caption
- choose thumbnail
- export final
- save publication metadata

### ASCII flow
```text
atom selected
   |
   v
Media Task Bundle shortcut
   |
   v
spawn edit/export/review tasks
```

---

## Shortcut 4 — Publish Save-Back
Use when a variant has shipped.

### Output
Saves:
- channel
- surface
- URL
- publish date
- notes
- next repurpose idea

### ASCII flow
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

---

## 3. Iggy automation backlog seeds

## Seed A — intake-runner contract
Standardize what every intake artifact must include.

## Seed B — media-evidence bundle
Each media job should be easy to verify:
- source clip
- derived exports
- captions
- thumbnail
- publish proof

## Seed C — repurpose ladder generator
When something publishes, create the next likely outputs automatically:
- reel -> article
- article -> email
- class clip -> curriculum note
- tournament clip -> recap post

## Seed D — dashboard task views
Support views for:
- waiting on footage
- waiting on edit
- waiting on review
- waiting on publish

---

## 4. Low-fi automation map

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

---

## 5. Guardrails

- do not create media tasks with no atom or intake parent
- do not publish without save-back
- do not let raw clips die in inbox limbo
- do not let shortcuts create a second source of truth
- do not let Iggy own final editorial approval

---

## 6. Best first real implementation
1. Quick Clip Intake
2. Promote to Atom
3. Media Task Bundle
4. Publish Save-Back

That is enough to make the video lane useful without building a giant automation religion.

---

## Petey close

Make the video lane lighter.

Not looser.
Lighter.

**Planned Passion Produces Purpose.**
**OSSS.**
