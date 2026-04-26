# Data model

Source of truth: `apps/web/prisma/schema.prisma` (authored once Dirstarter is restored into `apps/web/`). This document is the human-readable rationale.

## Brand scoping

Every brand-scoped model has a `brand: Brand` column. See [ADR 0004](decisions/0004-multi-brand-as-column.md).

## Identity

```
User (Better-Auth)
  └─ Profile (1:1)         displayName, avatar, bio
  └─ Memberships (1:N)     joins to schools, scoped by brand
```

## Organization

```
School
  ├─ brand (column)
  ├─ owner: User
  ├─ SchoolStyles (M:N to Style)
  └─ Memberships (1:N)

Style
  └─ Belts (1:N)           rank order, name (white/yellow/.../black)

Membership
  ├─ user
  ├─ school
  ├─ role: STUDENT | INSTRUCTOR | OWNER | COACH
  └─ brand (denormalized for fast filter)
```

## Curriculum & progress

```
Course
  ├─ school
  ├─ style
  ├─ certificationType: BELT_RANK | SAFETY | COACH
  └─ CurriculumItems (1:N)

CurriculumItem
  ├─ course
  ├─ order
  ├─ mediaUrl              (Mux/Cloudflare playbackId for video; S3 URL for image)
  └─ notes                 (markdown)

Progress
  ├─ user
  ├─ belt
  ├─ awardedAt
  └─ awardedBy: User       (instructor who certified)
```

## Gamification

```
GamificationEvent
  ├─ user
  ├─ eventType: enum       (CLASS_ATTENDED, BELT_AWARDED, TOURNAMENT_PLACED, ...)
  ├─ points: int
  └─ meta: Json            event-type-specific payload
```

Aggregate views (level, badges) are computed views or materialized rollups, not stored fields.

## Tournaments & certifications

```
Tournament
  ├─ brand
  ├─ host: School
  └─ Registrations (1:N)

TournamentRegistration
  ├─ tournament
  ├─ competitor: User
  └─ division/weight class

SafetyCertification, CoachCertification
  └─ scoped to school
```

## Indexes (initial)

- All brand-scoped tables: `@@index([brandId])`
- High-traffic joins: `@@index([brandId, schoolId])` on `Membership`, `School`, `Course`
- Time-series: `@@index([userId, awardedAt])` on `Progress`, `@@index([userId, createdAt])` on `GamificationEvent`

## Migration from Pods exports

Field-level reference only at `legacy-monorepo/wordpress/pods-exports/`. Re-model with proper FKs and constraints; do not import Pod definitions verbatim.
