"use client"

import { CheckIcon, ChevronsUpDownIcon, PlusIcon, XIcon } from "lucide-react"
import { type ReactNode, useMemo, useState } from "react"
import { Button, type ButtonProps } from "~/components/common/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/common/command"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/common/popover"
import { cx } from "~/lib/utils"

/**
 * A registered option for {@link CreatableCombobox}. `id` is the ref persisted
 * when this option is chosen; `name` is the searchable/displayed text. Optional
 * `content` overrides ONLY the open dropdown row (e.g. a belt-color swatch from
 * `Rank.colorHex`) — the collapsed trigger always shows the plain `name`.
 */
export type CreatableOption = {
  id: string
  name: string
  content?: ReactNode
}

/**
 * The dual-shape value of a creatable combobox: store BOTH a nullable ref `id`
 * (set when a REGISTERED option is chosen) AND the human `label` (the option's
 * name, or the free-typed custom text). A consumer persists the ref when present
 * and the text otherwise — the steward review surface reads ref-when-present,
 * else text. (SESSION_0441, ADR 0036 claim wiring.)
 */
export type CreatableValue = {
  id: string | null
  label: string
}

export const EMPTY_CREATABLE_VALUE: CreatableValue = { id: null, label: "" }

// ---------------------------------------------------------------------------
// Pure decision helpers — exported for unit testing. The popover content is
// portaled out of the SSR tree (mirrors `dataSelectRowContent`), so the
// pick-vs-custom logic is tested directly here rather than through the DOM.
// ---------------------------------------------------------------------------

/** Picking a registered option: persist its ref id AND its name as the label. */
export function selectRegisteredOption(option: CreatableOption): CreatableValue {
  return { id: option.id, label: option.name }
}

/** Committing free text: clear the ref id, keep the trimmed custom text. */
export function commitCustomText(text: string): CreatableValue {
  return { id: null, label: text.trim() }
}

/** The trigger shows the current label, or the placeholder when empty. */
export function creatableTriggerLabel(value: CreatableValue, placeholder: string): string {
  const label = value.label.trim()
  return label.length > 0 ? label : placeholder
}

/** Case-insensitive, whitespace-insensitive exact name match. */
export function optionMatchesText(option: CreatableOption, text: string): boolean {
  return option.name.trim().toLowerCase() === text.trim().toLowerCase()
}

/** Substring filter over option names (own filter — `shouldFilter={false}`). */
export function filterOptions(options: CreatableOption[], search: string): CreatableOption[] {
  const needle = search.trim().toLowerCase()
  if (needle.length === 0) return options
  return options.filter(option => option.name.toLowerCase().includes(needle))
}

/**
 * Whether to offer "create custom" for the current search: only when custom is
 * allowed, the search is non-empty, and no registered option is an EXACT match
 * (a partial match still offers create — that's the whole point of a creatable).
 */
export function shouldOfferCreate(
  options: CreatableOption[],
  search: string,
  allowCustom: boolean,
): boolean {
  if (!allowCustom) return false
  if (search.trim().length === 0) return false
  return !options.some(option => optionMatchesText(option, search))
}

// ---------------------------------------------------------------------------

type CreatableComboboxProps = {
  /** Registered, selectable options (id is persisted as the ref). */
  options: CreatableOption[]
  value: CreatableValue
  onValueChange: (value: CreatableValue) => void
  /** Allow committing a free-typed value not in `options`. Defaults to `true`. */
  allowCustom?: boolean
  placeholder?: string
  searchPlaceholder?: string
  /** Shown when nothing matches and custom is NOT allowed. */
  emptyMessage?: string
  /** Renders the "create custom" row label. Defaults to `Use "<text>"`. */
  renderCreateLabel?: (text: string) => ReactNode
  clearable?: boolean
  clearLabel?: string
  /** Trigger height/radius token. Defaults to `md`; `lg` aligns with `Select`. */
  size?: ButtonProps["size"]
  disabled?: boolean
  /** Optional id forwarded to the trigger for label association. */
  id?: string
  /** Optional description id forwarded to the trigger for accessible live feedback. */
  ariaDescribedBy?: string
}

/**
 * A searchable combobox over registered {@link CreatableOption}s that ALSO
 * accepts a free-typed custom value. Selecting a registered option stores its
 * ref `id`; typing a custom value stores `{ id: null, label }` — the dual shape
 * {@link CreatableValue}. Long/searchable lives in the ComboboxSelector family
 * (not DataSelect); this is the creatable sibling of `ComboboxSelector`.
 */
export function CreatableCombobox({
  options,
  value,
  onValueChange,
  allowCustom = true,
  placeholder = "Select or type...",
  searchPlaceholder = "Search or type to add...",
  emptyMessage = "No results found.",
  renderCreateLabel,
  clearable = true,
  clearLabel = "Clear selection",
  size = "lg",
  disabled = false,
  id,
  ariaDescribedBy,
}: CreatableComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => filterOptions(options, search), [options, search])
  const offerCreate = shouldOfferCreate(options, search, allowCustom)
  const hasValue = value.label.trim().length > 0 || value.id !== null
  const showClear = clearable && hasValue

  const commit = (next: CreatableValue) => {
    onValueChange(next)
    setSearch("")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative w-full">
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="secondary"
              size={size}
              role="combobox"
              aria-expanded={open}
              aria-describedby={ariaDescribedBy}
              disabled={disabled}
              className={cx(
                "w-full justify-between font-normal",
                showClear && "pr-14",
                !hasValue && "text-muted-foreground",
              )}
              suffix={<ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />}
            />
          }
        >
          <span className="truncate">{creatableTriggerLabel(value, placeholder)}</span>
        </PopoverTrigger>

        {showClear && (
          <button
            type="button"
            aria-label={clearLabel}
            onClick={() => commit(EMPTY_CREATABLE_VALUE)}
            className="absolute inset-y-0 right-7 z-10 inline-flex items-center px-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <XIcon className="size-3.5 shrink-0" />
          </button>
        )}
      </div>

      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        {/* Own filtering (shouldFilter=false) so the create row is never filtered
            away and the match logic is the unit-tested `filterOptions`. */}
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} />
          <CommandList>
            {filtered.length === 0 && !offerCreate && <CommandEmpty>{emptyMessage}</CommandEmpty>}

            {filtered.length > 0 && (
              <CommandGroup>
                {filtered.map(option => {
                  const selected = option.id === value.id
                  return (
                    <CommandItem
                      key={option.id}
                      value={option.id}
                      onSelect={() => commit(selectRegisteredOption(option))}
                    >
                      <CheckIcon
                        className={cx("mr-2 size-4", selected ? "opacity-100" : "opacity-0")}
                      />
                      {option.content ?? option.name}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}

            {offerCreate && (
              <CommandGroup>
                <CommandItem
                  value={`__create__${search}`}
                  onSelect={() => commit(commitCustomText(search))}
                >
                  <PlusIcon className="mr-2 size-4 shrink-0" />
                  {renderCreateLabel ? (
                    renderCreateLabel(search.trim())
                  ) : (
                    <span>
                      Use &ldquo;<span className="font-medium">{search.trim()}</span>&rdquo;
                    </span>
                  )}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
