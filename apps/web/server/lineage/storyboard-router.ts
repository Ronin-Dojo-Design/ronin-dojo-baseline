import { ORPCError } from "@orpc/server"
import type { Context } from "~/server/orpc/context"
import { authedProcedure } from "~/server/orpc/procedure"
import {
  createSceneInput,
  deleteSceneInput,
  duplicateSceneInput,
  sceneFields,
  setSceneEnabledInput,
  updateSceneInput,
} from "~/server/lineage/storyboard-schemas"
import { db } from "~/services/db"
import type { z } from "zod"

/**
 * Storyboard scene mutations (Epic A1 — SESSION_0498 TASK_03; petey-plan-0498 §A1).
 *
 * The curation write path for `LineageStoryScene` (the Lineage Journey scenes the
 * public `/directory/[slug]` scroll story reads). Joined into the flat `lineage`
 * entity router as `lineage.storyboard.*` (SOT-ADR D5).
 *
 * Authorization: `meta.permission = "lineage.manage"` — the existing lineage-editor
 * `can()` seam (`APP_AREA_PERMISSIONS.lineage`), deny-by-default. Scenes are
 * cross-tree global curation keyed by Passport, so tree-scoped `LineageTreeAccess`
 * grants don't apply; the storyboard page gates on the same permission string so
 * the page and every procedure agree.
 *
 * Cache contract (REQUIRED — Giddy A0 P3-4): `getLineageAncestryForPassport` is
 * `"use cache"` + `cacheLife("minutes")` tagged `"lineage"` +
 * `lineage-ancestry-${passportId}`. EVERY mutation here revalidates BOTH tags for
 * the affected passport, or the public page serves stale scenes for minutes — the
 * known "saves but reverts on nav" failure class.
 *
 * Id-space contract (WL-P1-8, the SESSION_0497 P2003): `passportId` inputs come
 * from the passport-keyed `getScenePersonOptions` picker. The handlers verify the
 * Passport exists BEFORE any FK write so a stale/wrong-id-space value surfaces as
 * a clean BAD_REQUEST — never a raw P2003 500, never a bare `catch {}`.
 */

const storyboardProcedure = authedProcedure.meta({
  permission: "lineage.manage",
  rateLimit: { points: 120, duration: 60 * 60 },
})

const STORYBOARD_PATH = "/app/lineage/storyboard"

/** Revalidate the public ancestry cache for one person + the storyboard itself. */
const revalidateScene = (context: Pick<Context, "revalidate">, passportId: string) => {
  context.revalidate({
    paths: [STORYBOARD_PATH],
    tags: ["lineage", `lineage-ancestry-${passportId}`],
  })
}

/** BAD_REQUEST unless `passportId` is a real Passport id (the WL-P1-8 guard). */
async function requirePassport(passportId: string): Promise<void> {
  const passport = await db.passport.findUnique({
    where: { id: passportId },
    select: { id: true },
  })
  if (!passport) {
    throw new ORPCError("BAD_REQUEST", {
      message: "That person can't be linked — pick them again from the list.",
    })
  }
}

const SCENE_EXISTS_MESSAGE = "This person already has a scene — edit their existing card instead."

/** CONFLICT when the person already has a scene (`passportId @unique` — 1:1). */
async function requireNoExistingScene(passportId: string): Promise<void> {
  const existing = await db.lineageStoryScene.findUnique({
    where: { passportId },
    select: { id: true },
  })
  if (existing) {
    throw new ORPCError("CONFLICT", { message: SCENE_EXISTS_MESSAGE })
  }
}

/**
 * Create the scene row, converting a `passportId @unique` race into the same
 * CONFLICT `requireNoExistingScene` throws. The check-then-create pair is TOCTOU
 * (Giddy pass-2 P2-4): two concurrent creates for one person both pass the check,
 * and the loser would surface Prisma's raw P2002 as INTERNAL_SERVER_ERROR. The
 * unique index is the real invariant — the check is just the friendly fast path.
 * (P2002 detection = the structural `.code` idiom, `stripe-webhook.ts:102`.)
 */
async function createSceneRow(
  data: Parameters<typeof db.lineageStoryScene.create>[0]["data"],
): Promise<{ id: string; passportId: string }> {
  try {
    return await db.lineageStoryScene.create({ data, select: { id: true, passportId: true } })
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      throw new ORPCError("CONFLICT", { message: SCENE_EXISTS_MESSAGE })
    }
    throw error
  }
}

/**
 * Build a partial Prisma update from the optional field set — `undefined` keys
 * leave the column untouched; `null` clears it (the belt-router fact-edit idiom).
 * Strings are trimmed; an all-whitespace value clears the column.
 */
const scenePatch = (input: z.infer<typeof sceneFields>) => {
  const text = (value: string | null | undefined) =>
    value === undefined ? undefined : (value?.trim() ?? null) || null

  return {
    quote: text(input.quote),
    quoteAttribution: text(input.quoteAttribution),
    storyBio: text(input.storyBio),
    heroImageUrl: text(input.heroImageUrl),
    heroVideoUrl: text(input.heroVideoUrl),
    posterUrl: text(input.posterUrl),
    sceneOrder: input.sceneOrder === undefined ? undefined : input.sceneOrder,
  }
}

/** Create a scene for a person who has none (plus-button add). */
const create = storyboardProcedure.input(createSceneInput).handler(async ({ input, context }) => {
  await requirePassport(input.passportId)
  await requireNoExistingScene(input.passportId)

  const scene = await createSceneRow({
    passportId: input.passportId,
    ...scenePatch(input),
    enabled: input.enabled ?? true,
  })

  revalidateScene(context, scene.passportId)
  return { sceneId: scene.id }
})

/** Edit a scene's copy/media/order fields (per-scene edit dialog). */
const update = storyboardProcedure.input(updateSceneInput).handler(async ({ input, context }) => {
  const scene = await db.lineageStoryScene.findUnique({
    where: { id: input.sceneId },
    select: { id: true, passportId: true },
  })
  if (!scene) throw new ORPCError("NOT_FOUND", { message: "Scene not found" })

  await db.lineageStoryScene.update({
    where: { id: scene.id },
    data: {
      ...scenePatch(input),
      ...(input.enabled === undefined ? {} : { enabled: input.enabled }),
    },
  })

  revalidateScene(context, scene.passportId)
  return { sceneId: scene.id }
})

/** Curation kill-switch — enable/disable a scene without touching its copy. */
const setEnabled = storyboardProcedure
  .input(setSceneEnabledInput)
  .handler(async ({ input, context }) => {
    const scene = await db.lineageStoryScene.findUnique({
      where: { id: input.sceneId },
      select: { id: true, passportId: true },
    })
    if (!scene) throw new ORPCError("NOT_FOUND", { message: "Scene not found" })

    await db.lineageStoryScene.update({
      where: { id: scene.id },
      data: { enabled: input.enabled },
    })

    revalidateScene(context, scene.passportId)
    return { sceneId: scene.id, enabled: input.enabled }
  })

/**
 * Copy a scene's copy/media fields onto ANOTHER person. The duplicate lands
 * DISABLED with no `sceneOrder`: the copied quote/bio still belong to the SOURCE
 * person, so publishing before an edit would attribute someone else's words —
 * the operator enables it after rewriting.
 */
const duplicate = storyboardProcedure
  .input(duplicateSceneInput)
  .handler(async ({ input, context }) => {
    const source = await db.lineageStoryScene.findUnique({
      where: { id: input.sceneId },
      select: {
        quote: true,
        quoteAttribution: true,
        storyBio: true,
        heroImageUrl: true,
        heroVideoUrl: true,
        posterUrl: true,
      },
    })
    if (!source) throw new ORPCError("NOT_FOUND", { message: "Scene not found" })

    await requirePassport(input.targetPassportId)
    await requireNoExistingScene(input.targetPassportId)

    const scene = await createSceneRow({
      passportId: input.targetPassportId,
      ...source,
      sceneOrder: null,
      enabled: false,
    })

    revalidateScene(context, scene.passportId)
    return { sceneId: scene.id }
  })

/** Delete a scene (story copy only — the person's Passport/node are untouched). */
const remove = storyboardProcedure.input(deleteSceneInput).handler(async ({ input, context }) => {
  const scene = await db.lineageStoryScene.findUnique({
    where: { id: input.sceneId },
    select: { id: true, passportId: true },
  })
  if (!scene) throw new ORPCError("NOT_FOUND", { message: "Scene not found" })

  await db.lineageStoryScene.delete({ where: { id: scene.id } })

  revalidateScene(context, scene.passportId)
  return { deleted: true as const, sceneId: scene.id }
})

export const storyboard = {
  create,
  update,
  setEnabled,
  duplicate,
  remove,
}
