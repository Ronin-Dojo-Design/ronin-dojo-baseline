"use client"

import { Label } from "~/components/common/label"
import { Stack } from "~/components/common/stack"
import { Switch } from "~/components/common/switch"

type ToggleRowProps = {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

/**
 * A single labelled `Switch` row — the toggle building block shared by the Profile, Notifications,
 * and Security cards. The whole row label is associated with the switch for an accessible hit target.
 */
export function ToggleRow({ id, label, checked, onCheckedChange, disabled }: ToggleRowProps) {
  return (
    <Stack size="sm" className="items-center justify-between" wrap={false}>
      <Label htmlFor={id} className="font-normal text-secondary-foreground">
        {label}
      </Label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={checked => onCheckedChange(Boolean(checked))}
        disabled={disabled}
      />
    </Stack>
  )
}
