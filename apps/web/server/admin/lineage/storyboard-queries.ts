import "server-only"

import { Brand } from "~/.generated/prisma/client"
import { resolveDisplayAvatar } from "~/lib/media"
import { db } from "~/services/db"

/**
 * Storyboard board reads (Epic A1 — SESSION_0498 TASK_03).
 *
 * The ADMIN-side query for the `/app/lineage/storyboard` curation board. This is
 * deliberately NOT the public `LineageStorySceneView` in `ancestry.ts` — that view
 * is a trimmed PUBLIC RSC payload (Giddy A0 P3-1/2) and must never widen for admin
 * needs; the board projects its own full field set here instead.
 */

const PERSON_CAP = 300

export type ScenePersonOption = { id: string; name: string }

/**
 * Person options for the scene picker, keyed by **Passport id**.
 *
 * `LineageStoryScene.passportId` is a Passport FK, so the OPTIONS must be keyed by
 * passport id too (WL-P1-8, SESSION_0497: the Join-wizard `getInstructorOptions` is
 * keyed by NODE id for `trainedUnderNodeId` — reusing it here would write a node id
 * into the Passport FK and P2003 on save; the two sources are do-not-merge twins).
 * Mirrors the `getBeltPromoterOptions` passport-keyed precedent (belt-tab-loader):
 * public BBL lineage people, de-duped by passport (one person may hold a node in
 * more than one tree).
 */
export async function getScenePersonOptions(): Promise<ScenePersonOption[]> {
  const nodes = await db.lineageNode.findMany({
    where: {
      visibility: "PUBLIC",
      treeMembers: { some: { tree: { brand: Brand.BBL, isPublished: true } } },
    },
    select: {
      passportId: true,
      passport: { select: { displayName: true, user: { select: { name: true } } } },
    },
    orderBy: { passport: { displayName: "asc" } },
    take: PERSON_CAP,
  })

  const byPassport = new Map<string, string>()
  for (const node of nodes) {
    const name = (node.passport?.displayName ?? node.passport?.user?.name ?? "").trim()
    if (name && !byPassport.has(node.passportId)) byPassport.set(node.passportId, name)
  }
  return [...byPassport].map(([id, name]) => ({ id, name }))
}

/** Presentation-only card row for the storyboard (no Prisma types to the client). */
export type StorySceneBoardCard = {
  sceneId: string
  passportId: string
  displayName: string
  avatarUrl: string | null
  quote: string | null
  quoteAttribution: string | null
  storyBio: string | null
  heroImageUrl: string | null
  heroVideoUrl: string | null
  posterUrl: string | null
  sceneOrder: number | null
  enabled: boolean
  /**
   * Public `/directory/[slug]` slug for this person — the GA-view comparison
   * link on `/app/beta/lineage-journey` (SESSION_0498 TASK_04). Null when the
   * person has no directory profile.
   */
  directorySlug: string | null
}

/**
 * ALL scenes for the curation board — including disabled ones (this is the
 * surface that manages the `enabled` kill-switch), ordered by `sceneOrder`
 * with un-ordered scenes last.
 */
export async function findStorySceneBoard(): Promise<StorySceneBoardCard[]> {
  const scenes = await db.lineageStoryScene.findMany({
    orderBy: [{ sceneOrder: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
    select: {
      id: true,
      passportId: true,
      quote: true,
      quoteAttribution: true,
      storyBio: true,
      heroImageUrl: true,
      heroVideoUrl: true,
      posterUrl: true,
      sceneOrder: true,
      enabled: true,
      passport: {
        select: {
          displayName: true,
          avatarUrl: true,
          user: { select: { name: true, image: true } },
          directoryProfile: { select: { slug: true } },
        },
      },
    },
  })

  return scenes.map(scene => ({
    sceneId: scene.id,
    passportId: scene.passportId,
    displayName: scene.passport.displayName ?? scene.passport.user?.name ?? "Unnamed member",
    avatarUrl: resolveDisplayAvatar(
      scene.passport.avatarUrl ?? scene.passport.user?.image,
      Brand.BBL,
    ),
    quote: scene.quote,
    quoteAttribution: scene.quoteAttribution,
    storyBio: scene.storyBio,
    heroImageUrl: scene.heroImageUrl,
    heroVideoUrl: scene.heroVideoUrl,
    posterUrl: scene.posterUrl,
    sceneOrder: scene.sceneOrder,
    enabled: scene.enabled,
    directorySlug: scene.passport.directoryProfile?.slug ?? null,
  }))
}
