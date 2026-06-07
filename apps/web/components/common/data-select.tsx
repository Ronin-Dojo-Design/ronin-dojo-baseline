"use client"

import type { ComponentProps, ReactNode } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"

/**
 * A single option for {@link DataSelect}. `value` is the id/slug stored in
 * state/DB/URL; `label` is what the user sees.
 */
export type DataSelectOption = {
  value: string
  label: string
  disabled?: boolean
}

/**
 * Build the Base UI `Select.Root` `items` map (value → label) from options.
 *
 * Exported for unit testing: Base UI resolves the trigger label from `items`,
 * so a DB/URL-preset value renders its label instead of the raw cuid/slug
 * (WL-P1-7). Any id-valued Select that forgets `items` shows the raw id until
 * the popup mounts — `DataSelect` makes that impossible by construction.
 */
export function buildSelectItems(options: DataSelectOption[]): Record<string, string> {
  return Object.fromEntries(options.map(option => [option.value, option.label]))
}

type SelectRootProps = ComponentProps<typeof Select>
type SelectTriggerProps = ComponentProps<typeof SelectTrigger>
type SelectContentProps = ComponentProps<typeof SelectContent>

export type DataSelectProps = Omit<SelectRootProps, "items" | "children"> & {
  /** value/label option list; `value` is the id/slug, `label` is shown. */
  options: DataSelectOption[]
  /** Placeholder shown when no value is selected. */
  placeholder?: ReactNode
  /** Trigger size variant. */
  size?: SelectTriggerProps["size"]
  /** Forwarded to the trigger for label association. */
  id?: string
  /** Disable the whole control. */
  disabled?: boolean
  triggerClassName?: string
  contentClassName?: string
  align?: SelectContentProps["align"]
}

/**
 * id/slug-aware Select. Wraps the common Base UI `Select` and always forwards
 * an `items` map so a preset value shows its label (not the raw id) — the
 * systemic fix for WL-P1-7. Use this for every Select whose `value` is a
 * cuid/slug/id rather than a human-readable enum string.
 */
export function DataSelect({
  options,
  placeholder,
  size,
  id,
  disabled,
  triggerClassName,
  contentClassName,
  align,
  ...rootProps
}: DataSelectProps) {
  return (
    <Select items={buildSelectItems(options)} {...rootProps}>
      <SelectTrigger id={id} size={size} disabled={disabled} className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent align={align} className={contentClassName}>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
