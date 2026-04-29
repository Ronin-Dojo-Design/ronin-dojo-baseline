---
title: Curriculum Extract Schema
slug: curriculum-extract-schema
type: concept
status: active
created: 2026-04-26
updated: 2026-04-26
author: Brian + Copilot (SESSION_0005)
last_agent: Copilot (SESSION_0005)
pairs_with:
  - knowledge/wiki/content-engine/content-atoms
  - knowledge/wiki/files/schema-prisma
parent: knowledge/wiki/content-engine/content-atoms
backlinks:
  - sprints/SESSION_0005
needs_fix:
  - "Not yet wired into ContentAtom.curriculumExtract JSON schema"
  - "Technique taxonomy needs validation against 12 disciplines"
wiring:
  - "apps/web/prisma/schema.prisma — ContentAtom.curriculumExtract (Json)"
  - "apps/web/prisma/schema.prisma — ContentAtom.videoExtract (Json)"
tags: [content-engine, curriculum, technique, schema]
---

# Curriculum Extract Schema

## Summary

Defines the structured JSON shapes for `ContentAtom.curriculumExtract` and `ContentAtom.videoExtract`. Extracted from the Obsidian starter vault's technique and curriculum templates, which captured real martial arts teaching metadata.

## Key Idea

A Content Atom's teaching truth is stored as markdown (`teachingTruth`), but its **structured curriculum data** lives in `curriculumExtract` as typed JSON. This lets the system query, filter, and sequence curriculum items programmatically while the prose stays human-readable.

## curriculumExtract JSON Shape

Derived from `ronin_obsidian_starter_vault/04_Techniques/` and `03_Curriculum/` frontmatter:

```typescript
interface CurriculumExtract {
  // Teaching objective
  objective: string
  summary?: string

  // Movement classification
  movementPattern?: "linear" | "circular" | "angular" | "lateral" | "rotational"
  rangeBand?: "close" | "mid" | "long" | "clinch" | "ground"
  category?: "strike" | "kick" | "throw" | "submission" | "sweep" | "block" | "form" | "drill" | "conditioning"

  // Context
  primaryUseCase?: string
  secondaryUseCase?: string
  whenToUse?: string
  whenNotToUse?: string
  targetArea?: string
  entryConditions?: string

  // Teaching
  teachingCues: string[]        // e.g. ["shoulder relaxed", "return on same line"]
  keyMovements?: string[]
  errorsToWatch?: string[]
  partnerDrill?: string
  soloDrill?: string
  safetyNote?: string
  assessmentCheck?: string

  // Sequencing
  prerequisites?: string[]
  followUpOptions?: string[]
  relatedTechniques?: string[]

  // Rank scoping
  difficultyLevel?: "beginner" | "intermediate" | "advanced" | "expert"
  safetyLevel?: "controlled" | "moderate" | "live_contact"
  beltLevelMin?: string         // References Rank.shortName
  beltLevelMax?: string
  requiresPartner?: boolean
  requiresEquipment?: boolean
  isFoundational?: boolean
  isLiveSparringAllowed?: boolean

  // Curriculum unit fields (when atom represents a full unit, not a single technique)
  module?: number
  phase?: string                // e.g. "foundations", "intermediate", "advanced"
  estimatedWeeks?: number
  isRequired?: boolean
  promotionRelevance?: "core" | "supplementary" | "elective"
}
```

## videoExtract JSON Shape

Derived from the Content Atom Template's video extraction section:

```typescript
interface VideoExtract {
  teaserLine?: string           // 10-20 second hook
  reelOutline?: string          // 60 second reel structure
  lessonOutline?: string        // 5 minute lesson structure
  interviewExcerpt?: string     // Long-form interview pull quote
  bRollNotes?: string           // What to shoot for visual support
  captionCallouts?: string[]    // On-screen text prompts
  aspectRatio?: "9:16" | "16:9" | "1:1" | "4:5"
  durationTarget?: string       // e.g. "60s", "5m", "30m"
  thumbnailNotes?: string
  altText?: string
}
```

## Sources

Extracted from:
- `ronin_obsidian_starter_vault/04_Techniques/Technique - Jab.md` — technique metadata
- `ronin_obsidian_starter_vault/03_Curriculum/Curriculum Unit - Foundations of Balance.md` — curriculum unit metadata
- `ronin_obsidian_starter_vault/98_Admin/Property Dictionary.md` — property definitions
- `ronin_obsidian_starter_vault/ronin_obsidian_content_engine_pack/12_Content_Engine/Content Atom Template.md` — video extraction fields

## Open Questions

- [ ] Should `movementPattern` and `rangeBand` become Prisma enums instead of string unions? (2026-04-26)
- [ ] Should technique-level atoms have a different `curriculumExtract` shape than curriculum-unit-level atoms? (2026-04-26)
- [ ] Should we validate `curriculumExtract` JSON against a Zod schema at write time? (2026-04-26)
