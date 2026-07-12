"use client"

import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H6 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { Switch } from "~/components/common/switch"
import { setTechniqueFeatured } from "~/server/web/techniques/crud-actions"

/**
 * SESSION_0529 Slice 3C — the staff "promote to library" control (ADR 0046 D4). Flips
 * `Technique.isFeatured`, the one lever that lifts an authored (org-null) technique onto the
 * canonical browse/rails/watch — the action is RBAC `techniques.manage` gated server-side; the
 * page only mounts this for staff. Minimal control on the existing technique editor (no admin
 * techniques data-table exists yet — flagged for the AdminCollection lane).
 */
export function TechniqueFeatureToggle({
  techniqueId,
  initialFeatured,
}: {
  techniqueId: string
  initialFeatured: boolean
}) {
  const [featured, setFeatured] = useState(initialFeatured)

  const { execute, isPending } = useAction(setTechniqueFeatured, {
    onSuccess: ({ data }) => {
      if (!data) return
      setFeatured(data.isFeatured)
      toast.success(
        data.isFeatured
          ? "Featured — now on the public technique library."
          : "Unfeatured — removed from the public technique library.",
      )
    },
    onError: ({ error: { serverError } }) => {
      toast.error(serverError ?? "Failed to update the featured state.")
    },
  })

  return (
    <Card hover={false}>
      <CardHeader direction="column" size="xs">
        <H6 render={props => <h2 {...props}>{props.children}</h2>}>
          Feature in the public library
        </H6>
        <CardDescription>
          Promote this technique to the canonical browse, rails, and watch page — including an
          authored, profile-only technique.
        </CardDescription>
      </CardHeader>

      <Stack size="sm" direction="row" className="items-center">
        <Switch
          checked={featured}
          disabled={isPending}
          onCheckedChange={checked => execute({ id: techniqueId, isFeatured: checked })}
        />
        <span className="text-sm">{featured ? "Featured in the library" : "Not featured"}</span>
      </Stack>
    </Card>
  )
}
