---
title: SOP — End-to-End User Lifecycle
slug: sop-e2e-user-lifecycle
type: runbook
status: active
created: 2026-04-27
updated: 2026-04-27
author: Brian + ChatGPT
last_agent: chatgpt-adoption-pass
health: 7
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - sop
  - workflow
---

## Summary

Shows the intended user lifecycle from first visit through active membership, training, competition, and publication/state touchpoints. Low-fi by design. Maps the spine of identity, organization shell, directory, courses, ranks, tournaments, staff/admin, subscriptions, cross-brand context, and content-lifecycle touchpoints around a user.

## Status

active, adopted SESSION_0010 (2026-04-27)

## When to use

- Designing or reviewing flows that touch sign-up, identity, directory, course, rank, or tournament features
- Onboarding contributors who need a single mental model of the user spine
- Diagnosing whether a feature breakage is a shell-model leak vs. a feature bug
- Planning new features that depend on multiple lifecycle touchpoints (e.g. spotlights, recaps)
- Stress-testing edge cases (mobile auth divergence, expired subscription, hidden-but-active member)

## Steps

### 1. Visitor -> account -> identity

```text
+---------+      +-------------+      +------------------+
| Visitor | ---> | Sign up/in  | ---> | Better-Auth User |
+---------+      +-------------+      +------------------+
                                            |
                                            v
                                  +----------------------+
                                  | Passport stub        |
                                  | DirectoryProfile stub|
                                  +----------------------+
```

#### Outcome
The user now exists as:
- account
- Passport
- DirectoryProfile

---

### 2. Identity -> organization shell

```text
Passport
  |
  +-------------------------------+
  |                               |
  v                               v
Create organization         Join organization
  |                               |
  v                               v
Organization row            Invite / join path
  |                               |
  +---------------+---------------+
                  |
                  v
        Membership (Org x Discipline)
                  |
                  +--> status
                  +--> roles
                  +--> rank
```

#### Outcome
The same person now has a contextual shell inside one organization and one discipline.

---

### 3. Directory lifecycle

```text
Passport + DirectoryProfile + Membership
                 |
                 v
         Directory visibility rules
                 |
      +----------+----------+
      |                     |
      v                     v
 hidden / members-only     public
      |                     |
      +----------+----------+
                 |
                 v
          searchable directory
```

#### Visibility knobs
- show email?
- show phone?
- show orgs?
- show ranks?

---

### 4. Course / curriculum lifecycle

```text
Membership
   |
   v
Eligible for course / curriculum path
   |
   v
CourseEnrollment
   |
   v
CurriculumItemCompletion
   |
   v
Rank / certification readiness
```

#### Outcome
The user can progress in a structured training path.

---

### 5. Rank lifecycle

```text
Course / instructor / org process
               |
               v
         Rank award decision
               |
               v
           RankAward
               |
               v
Membership rank updates
               |
               v
Directory / tournament eligibility can change
```

#### Important rule
Historic tournament entries must not be rewritten by later rank changes.

---

### 6. Tournament lifecycle

```text
User
 |
 v
View tournament
 |
 v
Check eligible divisions
 |
 v
Create Registration
 |
 v
Create RegistrationEntry
 |
 +--> snapshotRankName
 +--> snapshotOrgName
 +--> representingMembership
 |
 v
Submit / approve / waitlist / cancel
```

---

### 7. Staff / admin lifecycle

```text
User
 |
 v
Membership roles / admin authority
 |
 +--> org admin
 +--> coach
 +--> judge
 +--> owner
 |
 v
TournamentStaffAssignment / admin pages
```

---

### 8. Subscription / certification lifecycle (extended platform lane)

```text
User
 |
 +--> UserBrandSubscription
 |
 +--> Certification
 |
 v
access / entitlement / proof / expiry states
```

---

### 9. Cross-brand lifecycle

```text
One user
  |
  +--> host brand = BASELINE
  +--> activeBrandId = BASELINE
  |
  +--> may later have other brand memberships
  |
  v
same account, different app context
```

#### Key rule
One human can move across brands without needing a separate backend identity.

---

### 10. Content lifecycle touchpoints around a user

```text
User journey
   |
   +--> directory profile
   +--> training history
   +--> tournament participation
   +--> possible content/story features
   |
   v
future content atom references:
- member spotlight
- tournament recap
- curriculum lesson
- lineage story
```

---

### 11. E2E happy-path ASCII journey

```text
Visit site
  |
  v
Create account
  |
  v
Passport created
  |
  v
DirectoryProfile created
  |
  v
Join or create Organization
  |
  v
Membership shell created
  |
  v
Rank / role / status established
  |
  +--> appears in directory (depending on visibility)
  |
  +--> enrolls in courses
  |
  +--> receives rank awards
  |
  +--> registers for tournament
  |
  +--> registration entries snapshot rank + org
  |
  v
long-term member / competitor / instructor / admin lifecycle
```

---

### 12. Failure / edge states to remember

- account exists but Passport stub incomplete
- Passport complete but no Membership yet
- multiple memberships across organizations/disciplines
- host brand ≠ activeBrandId
- rank changed after tournament registration
- directory hidden but membership active
- subscription expired but account still valid
- mobile auth path differs from web until final decision is locked

---

### Petey close

The user lifecycle should feel like one spine, not six disconnected features.

If the journey breaks, the shell model is probably leaking.

**Planned Passion Produces Purpose.**
**OSSS.**

## Rollback

_Not applicable — this SOP describes a process, not a destructive operation. If a step fails, halt and surface the blocker in the SESSION file._

## Last verified

2026-04-27 — adopted from raw import; not yet exercised against current repo state
