"use client"

import type { Ref } from "react"
import { HslColorPicker } from "react-colorful"
import { Button } from "~/components/common/button"
import { Input } from "~/components/common/input"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/common/popover"
import { formatHslTriplet, type HslColor, parseHslTriplet } from "~/lib/brand-theme"
import { cx } from "~/lib/utils"

/**
 * HSL color field for the shared `<ThemeFieldset>` (WL-P2-36). A swatch button opens a
 * `react-colorful` HSL picker; beside it a free-form text `<Input>` stays authoritative
 * for typing/pasting a triplet.
 *
 * Value contract: the stored space-separated HSL triplet WITHOUT the `hsl()` wrapper
 * (e.g. `"234 98% 61%"`). We use the HSL (not hex) picker on purpose — the value is
 * injected as `hsl(<value>)` only if `isHslSafe(value)` passes (`~/lib/brand-theme`), and
 * a hex string would fail that CSS-injection guard. The picker writes a normalized,
 * always-`isHslSafe` triplet on drag; the text input never mutates the value while the
 * user types an intermediate/invalid string.
 *
 * The `id`/`aria-*` props that `FormControl` injects (via `slot`) are forwarded to the
 * TEXT input — it is the primary labelled control, so the enclosing `<FormLabel htmlFor>`
 * association (and existing `getByLabel(...)` e2e selectors) stay correct.
 */

// The picker UI only seeds from this when the field has no parseable value; it is NOT
// written back to the field until the user actually moves the picker.
const FALLBACK: HslColor = { h: 0, s: 0, l: 50 }

// Checkerboard fill shown on the swatch when the value isn't a safe, parseable triplet
// (the "no color" state — mirrors the standard color-input empty affordance).
const CHECKERBOARD_CLASS =
  "bg-[length:8px_8px] bg-[position:0_0,4px_4px] bg-[image:linear-gradient(45deg,var(--color-muted)_25%,transparent_25%,transparent_75%,var(--color-muted)_75%),linear-gradient(45deg,var(--color-muted)_25%,transparent_25%,transparent_75%,var(--color-muted)_75%)]"

type ColorFieldProps = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  name?: string
  id?: string
  placeholder?: string
  disabled?: boolean
  // Forwarded to the text input so react-hook-form's `field.ref` still lands here
  // (focus-on-error / scroll-to-error) — parity with the `<Input {...field}>` it replaced.
  ref?: Ref<HTMLInputElement>
  "aria-invalid"?: boolean
  "aria-describedby"?: string
}

export function ColorField({
  value,
  onChange,
  onBlur,
  name,
  id,
  placeholder,
  disabled,
  ref,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
}: ColorFieldProps) {
  const parsed = parseHslTriplet(value)
  // A non-null parse implies isHslSafe(value): HSL_TRIPLET_RE's charset (digits, ".",
  // space, "%") is a strict subset of isHslSafe's, so no extra guard is needed here.
  const hasColor = parsed !== null

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled}
              aria-label="Pick color"
              className="size-8 shrink-0 rounded-md p-0"
            />
          }
        >
          <span
            className={cx(
              "block size-full rounded-md border border-border",
              !hasColor && CHECKERBOARD_CLASS,
            )}
            style={hasColor ? { backgroundColor: `hsl(${value})` } : undefined}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto min-w-0">
          <HslColorPicker
            color={parsed ?? FALLBACK}
            onChange={c => onChange(formatHslTriplet(c))}
          />
        </PopoverContent>
      </Popover>

      <Input
        ref={ref}
        id={id}
        name={name}
        // `?? ""` keeps this a controlled input even if a future consumer passes undefined
        // (today all three coerce to ""); avoids React's controlled/uncontrolled warning.
        value={value ?? ""}
        onChange={event => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
      />
    </div>
  )
}
