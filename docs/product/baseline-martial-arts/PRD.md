---
title: "Baseline Martial Arts PRD"
slug: baseline-martial-arts-prd
type: prd
status: active
created: 2026-05-18
updated: 2026-05-20
author: Brian + Giddy
last_agent: codex-pr39-intake
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/product/README.md
  - docs/knowledge/wiki/ronin-project-context.md
  - docs/architecture/source/Launch-OS-Baseline-Martial-Arts-.md
pairs_with:
  - docs/product/baseline-martial-arts/STORIES.md
  - docs/product/black-belt-legacy/PRD.md
tags:
  - product
  - baseline-martial-arts
  - prd
  - school-ops
  - curriculum
  - certification
  - saas
---

# Baseline Martial Arts PRD

## One-line product statement

Baseline Martial Arts proves the operating system through Brian's school/program first, then becomes the reusable platform model for other martial arts schools, university programs, and affiliation/certification partners.

## Product identity

Baseline Martial Arts is the school-operations and training-system brand in the Ronin platform.

It is a hybrid product:

1. A real school/program operating system for Brian's martial arts programs.
2. A public-facing martial arts school brand.
3. A turnkey SaaS/course-certification-affiliation platform for other school owners and university programs.

The PRD should be written with school-ops platform clarity so the system can scale beyond the first local implementation.

## Audience

Primary users:

- school owners and program operators
- instructors, assistant instructors, and coaches
- front desk/admin staff
- students and members
- guardians/household managers
- university club or recreation program directors
- new school owners who need a curriculum jumpstart

Secondary users:

- affiliate school owners
- certification candidates
- visiting rank/certification examiners
- Black Belt Legacy users verifying credentials later
- Ronin Dojo Design prospects evaluating the white-label system

## Core product story

Baseline Martial Arts is the operating system for modern martial arts schools, from first inquiry to black belt path.

The full lifecycle is:

```txt
Lead -> Trial -> Household/Member -> Waiver -> Membership -> Schedule -> Attendance -> Progress -> Rank -> Billing -> Renewal
```

This lifecycle is the core proof that Baseline is more than a marketing site.

## Strategic positioning

Baseline should feel student-friendly in the visible demo, but the product priority is school-owner operations.

The strongest differentiators are:

1. Martial-arts-specific rank, curriculum, and progression.
2. Course, certification, and affiliation systems that can be sold as a turnkey starter program.
3. Multi-brand/white-label architecture that supports other schools and university programs.
4. A better student experience through schedule, progress, rank, curriculum, and membership visibility.

Tournament functionality is adjacent, but WEKAF owns the deepest tournament lane.

## Program naming rule

Until full CU branding approval is secured, public/campus program language should avoid relying on the full Tuff Buffs name.

Use generic scalable program names such as:

- BJJ Competition Team
- Muay Thai Fight Team
- Boxing Team
- Eskrima Stick Fighting Team
- Campus Fight Club

This keeps the product useful for university white-label/affiliation models while approvals are pending.

## Goals

1. Support the full lead-to-renewal school lifecycle.
2. Let school owners run programs, schedules, memberships, attendance, progress, rank, and billing in one system.
3. Provide students with a clean dashboard for schedule, attendance, rank progress, curriculum, certificates, and billing.
4. Support turnkey starter curriculum and certification packages for new school owners and university programs.
5. Create a bridge from Baseline rank/certification records into Black Belt Legacy verification.
6. Keep advanced billing recovery and complex family workflows phased without blocking v1.
7. Keep the first visible demo student-friendly while proving school-owner operations.

## Non-goals for the first product slice

- Deep tournament scoring and brackets; WEKAF owns that lane.
- Fully automated advanced dunning/recovery workflows.
- Full parent/guardian youth-school complexity as a launch blocker.
- Public use of restricted university branding before approval.
- Unlimited custom curriculum marketplace.
- Drag-and-drop curriculum/rank changes without auditability.

## Product pillars

### 1. Lead + Trial Funnel

Capture interested students, track source/consent, schedule trials, and convert trials into members.

### 2. Member + Household Management

Profiles, households, guardians, waivers, agreements, emergency info, memberships, and school relationship context.

Households and guardians should be present in product planning, but advanced family workflows can be phased.

### 3. Schedule + Attendance

Programs, classes, sessions, instructors, check-ins, attendance history, capacity, and instructor view.

### 4. Membership + Billing

Plans, subscriptions, invoices, payment status, refunds, cancellations, renewal, and future failed-payment recovery.

Advanced billing recovery is not a v1 launch blocker, but the product should not ignore it.

### 5. Curriculum + Progress

Programs, courses, modules, lessons, techniques, student progress, completion state, and curriculum starter templates.

### 6. Rank + Certification

Rank requirements, instructor approval, promotion events, certificate issuance, and credential verification.

Baseline uses CGR for student progress and school operations. BBL can later display verified credential history.

### 7. Admin Ops Dashboard

Owner/admin command center for leads, today's classes, attendance, payments, renewals, rank progress, retention risks, and operational tasks.

### 8. Affiliate / University Starter Program

A packaged starter curriculum and operations template that other schools or university programs can use, then add/edit/tweak for higher tiers.

Potential higher tiers:

- editable curriculum template
- affiliation tools
- certification verification
- lineage/certification bridge to BBL
- live physical testing visits by Brian and/or trusted examiners such as Bob, Steve, Arthur, Jay, and Tim Mills

## Roles

Baseline should support these roles:

- Owner
- Admin
- Instructor
- Assistant Instructor
- Coach
- Assistant Coach
- Front Desk / Staff
- Student
- Guardian
- Certification Examiner
- Affiliate Operator

## Public site priorities

Baseline public launch can include:

- Home page
- Programs page
- Trial/contact CTA
- Instructor/team page
- Schedule page
- Curriculum teaser
- Pricing/membership page where appropriate
- Student login/dashboard CTA

The public site should sell the training path, but the product docs should keep school-ops operations as the core platform story.

## Member dashboard priorities

The member dashboard should eventually include:

- profile/passport
- membership
- schedule/classes
- attendance history
- rank/progress
- curriculum lessons
- certificates
- billing/subscription
- messages/notifications

The first visible demo should emphasize:

- My Path
- My Schedule
- My Attendance
- My Rank Progress
- My Membership/Billing

## MVP capabilities

### Public funnel

- Public brand home page.
- Program pages for BJJ, Muay Thai, Boxing, Eskrima, and campus-style fight team offerings.
- Trial/contact CTA.
- Schedule preview.
- Student login CTA.

### Admin operations

- Lead intake and trial status.
- Member profile creation/approval.
- Schedule/class creation.
- Attendance check-in.
- Membership plan assignment.
- Basic billing/payment status.
- Waiver/agreement tracking.

### Student experience

- View own profile/passport.
- View schedule/classes.
- View attendance history.
- View current training path/progress.
- View rank status and promotion history.
- View curriculum/certification progress.
- View membership/billing summary.

### Curriculum/certification/affiliation

- Starter curriculum template.
- Course/certification pathway.
- School/program template that can be cloned or adapted.
- Credential verification path that can later surface on Black Belt Legacy.

## Success metrics

Product health:

- trial request can become member
- member can sign/track waiver
- member can be assigned membership plan
- class schedule renders
- instructor can check member into class
- attendance appears on member profile/dashboard
- student can see training path/progress
- instructor can record rank/promotion event
- basic billing status appears in admin/member views

Business health:

- Baseline can demo as a real school operating system
- Baseline can be positioned as a SaaS/course-certification starter kit
- university program pitch does not depend on restricted Tuff Buffs branding
- BBL credential verification story remains compatible with Baseline rank/cert records

## Primary risks

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Product sprawl | School ops, SaaS, curriculum, certification, and affiliation can become too broad | Keep v1 lifecycle-centered around lead-to-renewal |
| University branding | Tuff Buffs naming cannot be fully public until approval | Use generic campus/fight-team language until approved |
| Billing complexity | Advanced dunning/recovery can consume time | Keep basic billing in v1, mark recovery as future hardening |
| Guardian/household complexity | Youth/family workflows can add many edge cases | Include role and scaffolding, phase deeper flows |
| Credential trust drift | Baseline certificates may need BBL verification later | Keep CGR records structured and auditable |
| White-label overreach | SaaS/affiliation model can distract from first proof customer | Prove through Brian's school/program first |

## Supporting architecture docs

- `docs/architecture/source/Launch-OS-Baseline-Martial-Arts-.md`
- `docs/product/baseline-martial-arts/STORIES.md`
- `docs/product/black-belt-legacy/PRD.md`
- `docs/knowledge/wiki/ronin-project-context.md`
- `docs/knowledge/wiki/repo-truth-index.md`

## Open questions

1. Which exact Baseline public program names should ship first?
2. Which school owner/admin dashboard cards are required for the first demo?
3. Which curriculum starter package is the first productized template?
4. Which certification path should be first: student rank, instructor certification, or affiliate-school credential?
5. Which pieces of billing are already safe enough for v1 and which stay phase 2?
6. What is the minimum university-program template needed to sell the Campus Fight Club model?
7. Which BBL credential surfaces should consume Baseline certification data first?
