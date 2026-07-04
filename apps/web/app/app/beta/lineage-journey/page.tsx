import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { Heading } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { LineageStorySequence } from "~/components/web/lineage/lineage-story/lineage-story-sequence"
import { bblHeadingFont } from "~/lib/fonts"
import { cx } from "~/lib/utils"
import { findStorySceneBoard } from "~/server/admin/lineage/storyboard-queries"
import { getLineageAncestryForPassport } from "~/server/web/lineage/ancestry"

/**
 * Lineage Journey beta preview (SESSION_0498 TASK_04) — the pre-GA surface.
 *
 * Renders the FULL scroll-story sequence for a chosen scened person INCLUDING
 * `enabled: false` scenes (`includeDisabledScenes` — a distinct `"use cache"`
 * entry from the public read; the public `AncestrySection` never passes the
 * flag). Disabled scenes carry a marker chip so curators can tell what's live.
 * GA model: author/seed scenes disabled-first, preview here, flip live
 * per-scene on the storyboard.
 *
 * Person picker = every person with a scene (any chain that renders a story
 * passes through at least one of them); each links to `?passport=<id>` plus
 * their public `/directory/[slug]` for the GA-view comparison.
 */

export default async function ({ searchParams }: PageProps<"/app/beta/lineage-journey">) {
  const { passport } = await searchParams
  const passportId = typeof passport === "string" ? passport : undefined

  const scenedPeople = await findStorySceneBoard()
  const selected = passportId
    ? (scenedPeople.find(person => person.passportId === passportId) ?? null)
    : null
  const entries = passportId
    ? await getLineageAncestryForPassport(passportId, { includeDisabledScenes: true })
    : []

  return (
    <Wrapper>
      <Stack direction="column" className="gap-6">
        <Stack direction="column" size="xs">
          <Heading render={props => <h1 {...props}>{props.children}</h1>} size="h3">
            Lineage Journey — beta preview
          </Heading>
          <Note>
            Pick a person with a story scene to preview their full ancestry journey, exactly as the
            public profile renders it — plus scenes that are still disabled.{" "}
            <Link href="/app/lineage/storyboard" className="underline">
              Edit scenes on the storyboard
            </Link>
            .
          </Note>
        </Stack>

        <Stack direction="column" className="w-full gap-4">
          <Heading size="h5">People with scenes</Heading>
          <Stack direction="row" wrap className="w-full gap-4">
            {scenedPeople.map(person => (
              <Card
                key={person.sceneId}
                className="max-w-xs"
                isHighlighted={person.passportId === passportId}
                render={<Link href={`/app/beta/lineage-journey?passport=${person.passportId}`} />}
              >
                <CardHeader direction="column" size="xs">
                  <Stack size="sm" direction="row" wrap className="items-center">
                    <Heading size="h5">{person.displayName}</Heading>
                    <Badge variant={person.enabled ? "success" : "outline"} size="sm">
                      {person.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </Stack>
                  <CardDescription>
                    {person.quote ? `“${person.quote}”` : "No quote yet."}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
            {scenedPeople.length === 0 && (
              <Note>No story scenes exist yet — seed or author some on the storyboard.</Note>
            )}
          </Stack>
        </Stack>

        {selected && (
          <Stack direction="column" className="w-full gap-4">
            <Stack size="sm" direction="row" wrap className="items-center">
              <Badge variant="caution" size="md">
                BETA PREVIEW — includes disabled scenes
              </Badge>
              {selected.directorySlug && (
                <Link
                  href={`/directory/${selected.directorySlug}`}
                  className="text-sm underline"
                  target="_blank"
                >
                  Public GA view: /directory/{selected.directorySlug}
                </Link>
              )}
              <Link href="/app/lineage/storyboard" className="text-sm underline">
                Edit scenes
              </Link>
            </Stack>

            {entries.length >= 2 ? (
              // The display type consumes --font-bbl-heading — same server-side
              // font-variable seam as the public AncestrySection.
              <div className={cx("w-full", bblHeadingFont.variable)}>
                <LineageStorySequence entries={entries} showDisabledMarkers />
              </div>
            ) : (
              <Note>
                {selected.displayName} has no renderable public up-chain (the journey needs at
                least two PUBLIC chain entries) — pick one of their descendants instead.
              </Note>
            )}
          </Stack>
        )}
      </Stack>
    </Wrapper>
  )
}
