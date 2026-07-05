import { z } from "zod"

/**
 * Storyboard oRPC in-schemas (Epic A1 — SESSION_0498 TASK_03).
 *
 * A scene is keyed by **Passport id** (`LineageStoryScene.passportId @unique`,
 * grill fork #1) — the picker option source is passport-keyed to match
 * (WL-P1-8: `getScenePersonOptions`, NEVER the node-keyed `getInstructorOptions`).
 * The handlers verify the id is a real Passport before any FK write, so a stale
 * or wrong-id-space value surfaces as BAD_REQUEST, not a raw P2003 (SESSION_0497).
 */

const cuid = z.string().min(1).max(191)

/**
 * The editable copy/media field set. Every key is optional so a partial update
 * leaves untouched columns alone (`undefined` = keep, `null` = clear — the
 * belt-router idiom). URLs are length-capped; the A5 upload path doesn't exist
 * yet, so hero/video/poster are plain URL fields (SESSION_0498 finding).
 */
export const sceneFields = z.object({
  quote: z.string().max(2000).nullish(),
  /** Sourcing/provenance note — public display renders the person's displayName. */
  quoteAttribution: z.string().max(500).nullish(),
  storyBio: z.string().max(5000).nullish(),
  heroImageUrl: z.string().url().max(2000).nullish(),
  heroVideoUrl: z.string().url().max(2000).nullish(),
  posterUrl: z.string().url().max(2000).nullish(),
  sceneOrder: z.number().int().min(0).max(100_000).nullish(),
})

export const createSceneInput = sceneFields.extend({
  /** A **Passport id** (the storyboard picker is passport-keyed — WL-P1-8). */
  passportId: cuid,
  enabled: z.boolean().optional(),
})

export const updateSceneInput = sceneFields.extend({
  sceneId: cuid,
  /** Optional so the dedicated toggle procedure stays the quick-switch path. */
  enabled: z.boolean().optional(),
})

export const setSceneEnabledInput = z.object({
  sceneId: cuid,
  enabled: z.boolean(),
})

export const duplicateSceneInput = z.object({
  /** The scene whose copy/media fields are copied. */
  sceneId: cuid,
  /** The **Passport id** of the person receiving the copy (passport-keyed picker). */
  targetPassportId: cuid,
})

export const deleteSceneInput = z.object({
  sceneId: cuid,
})
