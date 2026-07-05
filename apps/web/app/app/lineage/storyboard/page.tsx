import { Suspense } from "react"
import { Heading } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { requirePermission } from "~/lib/auth-guard"
import {
  findStorySceneBoard,
  getScenePersonOptions,
} from "~/server/admin/lineage/storyboard-queries"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
import { SceneStoryboard } from "./_components/scene-storyboard"

/**
 * Lineage Journey storyboard (Epic A1 — SESSION_0498 TASK_03).
 *
 * The curation board for `LineageStoryScene`: ALL scenes (including disabled —
 * this surface manages the kill-switch) ordered by `sceneOrder` (un-ordered
 * last), with plus-button add, per-scene edit, duplicate-to-person, and the
 * enabled toggle. Drag-reorder + media-drop upload are fast-follow (grill
 * fork #2).
 *
 * Gate: `requirePermission(APP_AREA_PERMISSIONS.lineage)` — the same flat
 * `can("lineage.manage")` the storyboard oRPC procedures assert. Deliberately
 * STRICTER than the sibling pages' `requireLineageManagementAccess()`: scenes
 * are cross-tree global curation keyed by Passport, so tree-scoped
 * `LineageTreeAccess` grants don't map here; a grantee who could see the board
 * would only hit FORBIDDEN on every save.
 */

async function StoryboardContent() {
  const [scenes, personOptions] = await Promise.all([
    findStorySceneBoard(),
    getScenePersonOptions(),
  ])

  return <SceneStoryboard scenes={scenes} personOptions={personOptions} />
}

export default async () => {
  await requirePermission(APP_AREA_PERMISSIONS.lineage)

  return (
    <Wrapper>
      <Stack direction="column" className="gap-6">
        <Stack direction="column" size="xs">
          <Heading render={props => <h1 {...props}>{props.children}</h1>} size="h3">
            Story Scenes
          </Heading>
          <Note>
            The Lineage Journey storyboard — scene copy and media shown along the ancestry walk on
            public profiles. Walk order decides the sequence a visitor sees; scene order only
            arranges this board.
          </Note>
        </Stack>

        <Suspense fallback={<Note>Loading scenes…</Note>}>
          <StoryboardContent />
        </Suspense>
      </Stack>
    </Wrapper>
  )
}
