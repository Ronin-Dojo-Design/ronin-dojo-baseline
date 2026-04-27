# Ronin Shared Content Architecture

## 1. Canonical model

Use one **content atom** as the upstream source of truth for an idea.

A content atom is not a blog post and not a reel.
It is the smallest reusable unit that contains:
- teaching truth
- marketing angle
- media references
- curriculum extraction
- channel variants
- publish targets

## 2. Publishing model

### Obsidian
Use Obsidian for:
- capture
- drafting
- decomposition
- repurposing
- personal task workflow
- JETTY notes and architecture memory

### Pods
Use Pods for:
- editorial records you want WordPress editors to manage
- curriculum-facing content
- technique library items
- tournament public shells
- content atoms and distribution variants if editor-friendly management matters

### Ronin custom tables
Use custom tables for:
- content tasks
- publication log
- site/channel publish history
- review approvals
- media processing status
- anything with transactional state changes or audit needs

## 3. Recommended new Pods

### content_atoms
Purpose: canonical editorial source for reusable content.

Suggested fields:
- canonical_id
- title
- summary
- hook
- promise
- proof
- cta
- discipline_code
- style_name
- belt_range
- teaching_objective
- source_note_path
- publish_state
- public_excerpt
- site_targets
- channel_targets
- related_techniques (relationship)
- related_curriculum (relationship)
- related_tournament_content (relationship)

### distribution_variants
Purpose: site/channel-specific renderable outputs linked to one content atom.

Suggested fields:
- parent_atom (relationship)
- channel
- site_target
- public_title
- public_slug
- rendered_copy
- thumbnail_url
- video_url
- excerpt
- cta
- variant_status
- publish_date

### campaigns
Purpose: groups multiple atoms and variants around one launch or seminar.

Suggested fields:
- campaign_code
- campaign_title
- start_date
- end_date
- objective
- primary_cta
- target_sites
- target_channels

## 4. Recommended custom tables

### wp_ronin_content_tasks
One row per operational task.

Suggested columns:
- id
- canonical_id
- parent_variant_id nullable
- task_type
- title
- status
- priority
- assigned_user_id
- due_at
- completed_at
- depends_on_task_id nullable
- site_target
- channel
- notes
- created_at
- updated_at

### wp_ronin_content_publications
One row per published artifact.

Suggested columns:
- id
- canonical_id
- variant_id nullable
- site_target
- channel
- platform_post_id
- public_url
- published_at
- checksum
- created_at

## 5. Recommended site strategy

Make `ronindojodesign.local` the **content hub / admin source**.

Then let each site consume the same source differently:
- `blackbeltlegacy.local` -> heritage + curriculum + instructor authority
- `tuffbuffs.local` -> conditioning + toughness + training motivation
- `wekaf-usa.local` -> tournaments + official info + competitive media
- `ronindojodesign.local` -> design system + docs + backend proving ground

## 6. Rendering strategy

One record can have multiple site renderers:
- BlogArticleRenderer
- TechniqueLessonRenderer
- CurriculumUnitRenderer
- SocialPreviewRenderer
- VideoLessonPageRenderer
- TournamentPromoRenderer

The data stays shared. Presentation changes per site.

## 7. Do not do this

- Do not make each social post the only source of truth.
- Do not duplicate full text across four sites unless legally or operationally required.
- Do not put operational task state only in Pods if many users will update it.
- Do not expose private editorial fields publicly by accident.
