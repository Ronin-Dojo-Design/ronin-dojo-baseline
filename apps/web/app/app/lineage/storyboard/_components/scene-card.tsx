"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Switch } from "~/components/common/switch"
import { client } from "~/lib/orpc-client"
import type { StorySceneBoardCard } from "~/server/admin/lineage/storyboard-queries"

/**
 * One compact storyboard row (the `/app/lineage` Card-row idiom): hero thumb,
 * person (avatar + name), truncated quote, sceneOrder + state badges, the
 * enabled kill-switch, and edit/duplicate/delete actions. The switch owns its
 * own `setEnabled` call; everything else hands up to the board's dialogs.
 */
export function SceneCard({
  scene,
  onEdit,
  onDuplicate,
  onDelete,
  onChanged,
}: {
  scene: StorySceneBoardCard
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onChanged: () => void
}) {
  const [isToggling, setIsToggling] = useState(false)

  const toggleEnabled = async (enabled: boolean) => {
    setIsToggling(true)
    try {
      await client.lineage.storyboard.setEnabled({ sceneId: scene.sceneId, enabled })
      toast.success(enabled ? "Scene enabled." : "Scene disabled.")
      onChanged()
    } catch (error) {
      // Surface the real oRPC message (SESSION_0497 — no bare catch, no blanket toast).
      toast.error(
        error instanceof Error && error.message ? error.message : "Could not update the scene.",
      )
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Card className="grid gap-3 rounded-none border-0 p-4 lg:grid-cols-[minmax(16rem,20rem)_1fr_auto] lg:items-center">
      <Stack size="sm" className="min-w-0 items-center">
        {scene.heroImageUrl && (
          <img
            src={scene.heroImageUrl}
            alt=""
            className="h-12 w-16 shrink-0 rounded-md border object-cover"
          />
        )}
        <Avatar className="size-8 shrink-0">
          {scene.avatarUrl && <AvatarImage src={scene.avatarUrl} alt={scene.displayName} />}
          <AvatarFallback>{scene.displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <Stack direction="column" size="xs" className="min-w-0">
          <span className="truncate font-medium">{scene.displayName}</span>
          <Stack size="xs" wrap>
            <Badge variant={scene.enabled ? "success" : "outline"} size="sm">
              {scene.enabled ? "Enabled" : "Disabled"}
            </Badge>
            {scene.sceneOrder !== null && (
              <Badge variant="soft" size="sm">
                #{scene.sceneOrder}
              </Badge>
            )}
            {scene.heroVideoUrl && (
              <Badge variant="info" size="sm">
                Video
              </Badge>
            )}
          </Stack>
        </Stack>
      </Stack>

      <Note className="line-clamp-2 min-w-0 text-sm">
        {scene.quote ? `“${scene.quote}”` : "No quote yet."}
      </Note>

      <Stack size="xs" className="items-center justify-end" wrap>
        <Switch
          checked={scene.enabled}
          onCheckedChange={checked => toggleEnabled(checked)}
          disabled={isToggling}
          aria-label={`Toggle the ${scene.displayName} scene`}
        />
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={onDuplicate}>
          Duplicate
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </Stack>
    </Card>
  )
}
