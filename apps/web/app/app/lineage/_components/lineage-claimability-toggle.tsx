"use client"

import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"
import { Switch } from "~/components/common/switch"
import {
  toggleLineageTreeClaimability,
  toggleLineageTreeMemberClaimability,
} from "~/server/admin/lineage/actions"

type LineageClaimabilityToggleProps =
  | {
      target: "tree"
      treeId: string
      initialChecked: boolean
      label: string
    }
  | {
      target: "member"
      treeId: string
      memberId: string
      initialChecked: boolean
      label: string
    }

export function LineageClaimabilityToggle(props: LineageClaimabilityToggleProps) {
  const [checked, setChecked] = useState(props.initialChecked)
  const treeAction = useAction(toggleLineageTreeClaimability)
  const memberAction = useAction(toggleLineageTreeMemberClaimability)
  const isExecuting = treeAction.isExecuting || memberAction.isExecuting

  function handleCheckedChange(nextChecked: boolean) {
    const previous = checked
    setChecked(nextChecked)

    const actionPromise =
      props.target === "tree"
        ? treeAction.executeAsync({
            treeId: props.treeId,
            isClaimable: nextChecked,
          })
        : memberAction.executeAsync({
            treeId: props.treeId,
            memberId: props.memberId,
            isClaimable: nextChecked,
          })

    toast.promise(
      async () => {
        const result = await actionPromise
        if (result?.serverError) {
          setChecked(previous)
          throw new Error(result.serverError)
        }
      },
      {
        loading: "Updating claimability...",
        success: nextChecked ? "Claims enabled." : "Claims disabled.",
        error: error => `Could not update claimability: ${error.message}`,
      },
    )
  }

  return (
    <Switch
      checked={checked}
      onCheckedChange={handleCheckedChange}
      disabled={isExecuting}
      aria-label={props.label}
    />
  )
}
