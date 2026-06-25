"use client"

import type { ComponentProps } from "react"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { useJoinModal } from "./join-modal-context"

/**
 * The "Join the Legacy" CTA. Opens the global join modal in place when the
 * provider is mounted (SESSION_0445 #7); degrades to a `/lineage/join` link when
 * it isn't (e.g. the provider was skipped for a signed-in view). `onActivate`
 * lets a host close itself first (e.g. the nav slide-in sheet) before the modal
 * opens so two overlays never fight.
 */
export function JoinCtaButton({
  onActivate,
  ...buttonProps
}: ComponentProps<typeof Button> & { onActivate?: () => void }) {
  const joinModal = useJoinModal()

  if (!joinModal) {
    return <Button {...buttonProps} render={<Link href="/lineage/join" />} />
  }

  return (
    <Button
      {...buttonProps}
      onClick={event => {
        buttonProps.onClick?.(event)
        onActivate?.()
        joinModal.open()
      }}
    />
  )
}
