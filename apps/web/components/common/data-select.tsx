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
 *
 * `label` stays a required string because Base UI resolves the collapsed
 * trigger value, typeahead, and a11y name from the `items` map (see
 * {@link buildSelectItems}) — never from the dropdown row's React tree. The
 * optional `content` overrides ONLY the open dropdown row, letting a row carry
 * a belt-color swatch, school logo, person avatar, etc. while the trigger stays
 * the plain `label`.
 */
export type DataSelectOption = {
  value: string
  label: string
  disabled?: boolean
  /**
   * Optional rich dropdown-row content (e.g. swatch/logo/avatar + text). Renders
   * ONLY in the open popup row; the collapsed trigger + typeahead still use
   * `label`. Falls back to `label` when omitted.
   */
  content?: ReactNode
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

/**
 * The dropdown-row content for an option: the rich `content` when provided,
 * else the plain string `label`.
 *
 * Exported so the fallback rule is unit-tested — the open popup is portaled
 * (`SelectContent` → `SelectPrimitive.Portal`) and never renders into the SSR
 * markup, so a render test can't assert the row's ReactNode directly.
 */
export function dataSelectRowContent(option: DataSelectOption): ReactNode {
  return option.content ?? option.label
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
  /**
   * Accessible name for the trigger. Base UI's `Select.Root` renders no DOM node, so an
   * `aria-label`/`aria-labelledby` passed to the root is dropped — these are forwarded to the
   * `SelectTrigger` button instead, giving the combobox an accessible name (WL-P2 a11y fix).
   */
  "aria-label"?: string
  "aria-labelledby"?: string
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
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ...rootProps
}: DataSelectProps) {
  return (
    <Select items={buildSelectItems(options)} {...rootProps}>
      <SelectTrigger
        id={id}
        size={size}
        disabled={disabled}
        className={triggerClassName}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent align={align} className={contentClassName}>
        {options.map(option => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            // Always forward the string `label`: when `content` is a ReactNode,
            // SelectItem can't derive a typeahead/a11y label from the row's React
            // tree, so without this the item's typeahead label would be undefined.
            label={option.label}
          >
            {dataSelectRowContent(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
