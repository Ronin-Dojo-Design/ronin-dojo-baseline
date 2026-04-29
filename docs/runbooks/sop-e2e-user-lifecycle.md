---
title: "SOP — End-to-End User Lifecycle"
slug: sop-e2e-user-lifecycle
type: runbook
status: active
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0015
health: 7
pairs_with:
  - docs/runbooks/sop-data-and-wiring-flows.md
use_count: 0backlinks:
  - docs/knowledge/wiki/index.md
  - docs/ronin_dojo_baseline_systems_pack/09_SOP_E2E_USER_LIFECYCLE_BASELINE.md
---

# SOP — End-to-End User Lifecycle

## Purpose
Show the intended lifecycle from first visit through active membership, training, competition, and publication/state touchpoints.

This is low-fi by design.

---

# 1. Visitor -> account -> identity

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

```mermaid
flowchart LR
    V[Visitor] --> S[Sign up/in] --> U[Better-Auth User]
    U --> P[Passport stub]
    U --> DP[DirectoryProfile stub]
```

## Outcome
The user now exists as:
- account
- Passport
- DirectoryProfile

---

# 2. Identity -> organization shell

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

```mermaid
flowchart TD
    PA[Passport] --> CO[Create organization]
    PA --> JO[Join organization]
    CO --> ORG[Organization row]
    JO --> INV[Invite / join path]
    ORG & INV --> M[Membership\nOrg × Discipline]
    M --> ST[status]
    M --> RL[roles]
    M --> RK[rank]
```

## Outcome
The same person now has a contextual shell inside one organization and one discipline.

---

# 3. Directory lifecycle

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

```mermaid
flowchart TD
    SRC[Passport + DirectoryProfile + Membership] --> VIS{Visibility rules}
    VIS -->|HIDDEN / MEMBERS_ONLY| PRIV[restricted]
    VIS -->|PUBLIC| PUB[public]
    PRIV & PUB --> DIR[Searchable directory]
```

### Visibility knobs
- show email?
- show phone?
- show orgs?
- show ranks?

---

# 4. Course / curriculum lifecycle

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

## Outcome
The user can progress in a structured training path.

---

# 5. Rank lifecycle

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

### Important rule
Historic tournament entries must not be rewritten by later rank changes.

---

# 6. Tournament lifecycle

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

```mermaid
flowchart TD
    U[User] --> VT[View tournament]
    VT --> CE[Check eligible divisions]
    CE --> CR[Create Registration]
    CR --> RE[Create RegistrationEntry]
    RE --> SRN[snapshotRankName]
    RE --> SON[snapshotOrgName]
    RE --> RM[representingMembership]
    RE --> ST{Submit / approve / waitlist / cancel}
```

---

# 7. Staff / admin lifecycle

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

# 8. Subscription / certification lifecycle (extended platform lane)

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

# 9. Cross-brand lifecycle

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

### Key rule
One human can move across brands without needing a separate backend identity.

---

# 10. Content lifecycle touchpoints around a user

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

# 11. E2E happy-path ASCII journey

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

```mermaid
flowchart TD
    VS[Visit site] --> CA[Create account]
    CA --> PP[Passport created]
    PP --> DP[DirectoryProfile created]
    DP --> ORG[Join or create Organization]
    ORG --> MS[Membership shell created]
    MS --> RRS[Rank / role / status established]
    RRS --> DIR[Appears in directory]
    RRS --> ENR[Enrolls in courses]
    RRS --> RA[Receives rank awards]
    RRS --> REG[Registers for tournament]
    REG --> SNAP[Registration entries snapshot rank + org]
    DIR & ENR & RA & SNAP --> LT[Long-term lifecycle:\nmember / competitor / instructor / admin]
```

---

# 12. Failure / edge states to remember

- account exists but Passport stub incomplete
- Passport complete but no Membership yet
- multiple memberships across organizations/disciplines
- host brand ≠ activeBrandId
- rank changed after tournament registration
- directory hidden but membership active
- subscription expired but account still valid
- mobile auth path differs from web until final decision is locked

---

## Petey close

The user lifecycle should feel like one spine, not six disconnected features.

If the journey breaks, the shell model is probably leaking.

**Planned Passion Produces Purpose.**
**OSSS.**
