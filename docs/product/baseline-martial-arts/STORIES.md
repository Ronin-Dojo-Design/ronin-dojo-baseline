---
title: "Baseline Martial Arts Stories"
slug: baseline-martial-arts-stories
type: stories
status: active
created: 2026-05-18
updated: 2026-05-18
author: Brian + Giddy
last_agent: chatgpt-giddy
backlinks:
  - docs/product/README.md
  - docs/product/baseline-martial-arts/PRD.md
  - docs/architecture/source/Launch-OS-Baseline-Martial-Arts-.md
pairs_with:
  - docs/product/baseline-martial-arts/PRD.md
tags:
  - product
  - baseline-martial-arts
  - stories
  - school-ops
  - curriculum
  - certification
---

# Baseline Martial Arts Stories

## Story map

Baseline Martial Arts proves a school operating system through a real first program, then scales into a reusable SaaS/course-certification-affiliation model.

Core product chain:

```txt
Lead -> Trial -> Household/Member -> Waiver -> Membership -> Schedule -> Attendance -> Progress -> Rank -> Billing -> Renewal
```

## Epic 1 — Public Site + Trial Funnel

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| BMA-LEAD-001 | As a visitor, I want to submit a trial request so I can start training. | Public CTA captures name, contact, program interest, source, consent, and creates a lead/trial record. |
| BMA-LEAD-002 | As an admin, I want to review new trial requests so I can follow up quickly. | Admin dashboard shows new leads, status, source, requested program, and next-action state. |
| BMA-LEAD-003 | As a visitor, I want to browse programs without restricted university branding so the site is clear before branding approvals. | Public programs use campus-safe names such as BJJ Competition Team, Muay Thai Fight Team, Boxing Team, Eskrima Stick Fighting Team, and Campus Fight Club. |
| BMA-LEAD-004 | As a visitor, I want to preview the schedule so I can decide whether training fits my week. | Public schedule preview shows eligible public classes and clear trial CTA. |
| BMA-LEAD-005 | As a school owner, I want the public funnel to be reusable for other schools/university programs. | Program copy and CTA structure are not hardcoded to one local brand name. |

## Epic 2 — Member + Household Profiles

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| BMA-MEMBER-001 | As an admin, I want to create or approve a member profile from a lead/trial so the student can enter the school system. | Member profile links to lead/trial context and preserves source attribution. |
| BMA-MEMBER-002 | As a student, I want a profile/passport so I can see my school identity and training status. | Profile shows name, contact-safe public/private fields, program, membership status, rank summary, and attendance summary. |
| BMA-MEMBER-003 | As a guardian, I want to be linked to a student profile so I can manage required family/youth information later. | Guardian role and relationship can be recorded even if deeper youth workflows are phased. |
| BMA-MEMBER-004 | As staff, I want emergency/contact info available within permission scope so safety needs are covered. | Staff/admin can access emergency info according to role; public views never expose it. |
| BMA-MEMBER-005 | As an owner, I want households scaffolded so family membership workflows can be expanded later. | Household/member relationship exists and does not block single-adult workflows. |

## Epic 3 — Waivers + Agreements

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| BMA-WAIVER-001 | As a student, I want to complete required waivers so I can train. | Student/member can have waiver/agreement status recorded. |
| BMA-WAIVER-002 | As an admin, I want to see waiver status before class participation so the school stays protected. | Member list and profile show missing/current waiver status. |
| BMA-WAIVER-003 | As an owner, I want waiver records preserved with audit context so the school can prove compliance. | Waiver/agreement records include timestamp, version/source, and member relationship. |

## Epic 4 — Memberships + Billing

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| BMA-BILLING-001 | As an admin, I want to assign a membership plan so a member's training access is clear. | Member can be assigned active membership plan/status. |
| BMA-BILLING-002 | As a student, I want to see my membership and billing summary so I know my current status. | Student dashboard shows plan/status and safe billing summary. |
| BMA-BILLING-003 | As an owner, I want to track invoices/payment state so I can understand revenue health. | Admin view shows paid/pending/failed/canceled states where available. |
| BMA-BILLING-004 | As an admin, I want basic cancellation/refund tracking so support conversations are clear. | Admin can record or view cancellation/refund state according to available billing integration. |
| BMA-BILLING-005 | As an owner, I want advanced dunning/failure recovery planned but not blocking v1. | Advanced failed-payment recovery is marked future/hardening, not required for first demo. |

## Epic 5 — Schedule + Attendance

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| BMA-SCHEDULE-001 | As an admin, I want to create a class schedule so students know when to train. | Admin can create class/program schedule entries with instructor, program, date/time, and visibility. |
| BMA-SCHEDULE-002 | As a student, I want to see my class schedule so I can plan training. | Student dashboard shows relevant upcoming classes. |
| BMA-ATTEND-001 | As an instructor, I want to check students into class so attendance is recorded. | Instructor can record attendance for eligible members/classes. |
| BMA-ATTEND-002 | As a student, I want to see my attendance history so I can track consistency. | Dashboard shows attendance count/history. |
| BMA-ATTEND-003 | As an owner, I want attendance trends so I can identify engagement and retention risks. | Admin dashboard can surface attendance summaries or future reporting hooks. |

## Epic 6 — Curriculum + Progress

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| BMA-CURRICULUM-001 | As a student, I want to view my training path so I know what I am learning next. | Dashboard shows current program/path and progress state. |
| BMA-CURRICULUM-002 | As an instructor, I want curriculum organized by program/rank/topic so I can teach consistently. | Curriculum items can be grouped by program, rank, module, lesson, or technique. |
| BMA-CURRICULUM-003 | As a school owner, I want a starter curriculum template so I can launch a program faster. | Baseline can package reusable curriculum/course templates for clone/adapt flows. |
| BMA-CURRICULUM-004 | As an affiliate operator, I want to edit/tweak the starter template on a higher tier so my school can adapt the curriculum. | Product supports a future tier where templates can be customized without breaking source canon. |
| BMA-CURRICULUM-005 | As an instructor, I want progress tied to attendance and curriculum completion so rank readiness is easier to evaluate. | Progress view can reference attendance, curriculum completion, and rank requirements. |

## Epic 7 — Rank + Promotion

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| BMA-RANK-001 | As an instructor, I want to record rank/promotion events so a student's path is durable. | Promotion record includes student, rank, date, instructor/promoter, and verification state. |
| BMA-RANK-002 | As a student, I want to see my current rank and next-rank progress so I know what to work on. | Dashboard shows current rank and progress toward next milestone. |
| BMA-RANK-003 | As an owner, I want promotion authority scoped to trusted instructors so rank changes stay controlled. | Only authorized roles can record/approve rank events. |
| BMA-RANK-004 | As an admin, I want Baseline rank/certification records to be compatible with BBL verification later. | Rank/cert records preserve enough structure to be surfaced as verified credentials on Black Belt Legacy. |

## Epic 8 — Certification + Affiliation

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| BMA-CERT-001 | As a student, I want certificates for completed courses/ranks so my achievements are portable. | Certificate record links student, course/rank/certification, issuer, date, and status. |
| BMA-CERT-002 | As a certification candidate, I want online progress plus live physical testing options so my credential can be meaningful. | Certification path can track online coursework and physical testing requirement/status. |
| BMA-CERT-003 | As an affiliate school owner, I want Brian or trusted examiners to visit for live physical tests so credentials have authority. | Product story supports examiner visits by Brian and/or trusted examiners such as Bob, Steve, Arthur, Jay, and Tim Mills. |
| BMA-CERT-004 | As an owner, I want certification/affiliation tiers so Baseline can sell a turnkey curriculum and verification package. | Stories distinguish starter template, editable template, certification, affiliation, and BBL verification tiers. |
| BMA-CERT-005 | As a visitor, I want to verify a credential so I can trust the certificate. | Future verification page can show credential status without exposing private student/account data. |

## Epic 9 — Admin Ops Dashboard

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| BMA-OPS-001 | As an owner, I want a daily operations dashboard so I know what needs attention today. | Dashboard shows leads, trials, today's classes, attendance, memberships, billing state, and task highlights. |
| BMA-OPS-002 | As staff, I want role-appropriate admin views so I only see what I need. | Owner/admin/instructor/assistant/front desk permissions scope dashboard access. |
| BMA-OPS-003 | As an instructor, I want a class-day view so I can run attendance and notes quickly. | Instructor view prioritizes current/upcoming classes and check-in actions. |
| BMA-OPS-004 | As an owner, I want retention signals so I can follow up with students before they disappear. | Dashboard can surface missed attendance or inactive membership indicators. |
| BMA-OPS-005 | As an admin, I want safe audit trails for sensitive actions so school operations are accountable. | Sensitive changes such as rank, billing, waiver, and role changes are auditable where applicable. |

## Epic 10 — Communications + Notifications

| ID | Story | Acceptance criteria |
| --- | --- | --- |
| BMA-COMMS-001 | As an admin, I want to message leads or members so follow-up is organized. | Lead/member records can support communication status and future message hooks. |
| BMA-COMMS-002 | As a student, I want schedule or progress notifications so I stay engaged. | Notification hooks can be added without forcing all messaging into v1. |
| BMA-COMMS-003 | As an owner, I want renewal or billing reminders planned so retention improves later. | Advanced automations are marked future feature/hardening. |

## First implementation story slice

Recommended first Baseline product slice:

1. `BMA-LEAD-001` — visitor submits trial request.
2. `BMA-MEMBER-001` — admin creates/approves member profile.
3. `BMA-SCHEDULE-001` — admin creates class schedule.
4. `BMA-ATTEND-001` — instructor checks student into class.
5. `BMA-BILLING-001` — admin assigns membership plan.
6. `BMA-CURRICULUM-001` — student sees current path/progress.
7. `BMA-RANK-001` — instructor records rank/promotion event.

## Phase notes

### Core v1

- lead/trial flow
- member profile
- schedule
- attendance
- basic membership/billing status
- curriculum path visibility
- rank/progress event
- admin dashboard shell

### Phase 2 / hardening

- advanced dunning and failed-payment recovery
- deeper household/youth workflows
- richer retention analytics
- full certification verification page
- affiliate curriculum customization tier
- BBL credential surfacing

## Four-brand relationship

| Brand | Relationship to Baseline |
| --- | --- |
| Black Belt Legacy | Can verify/display Baseline rank/certification credentials later. |
| WEKAF USA | Owns deep tournament operations; Baseline can participate in events. |
| Ronin Dojo Design | Sells/operates white-label versions of the Baseline school system. |
