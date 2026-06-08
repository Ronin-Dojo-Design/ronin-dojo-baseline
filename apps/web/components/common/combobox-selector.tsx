"use client"

import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"
import { useState } from "react"
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

type ComboboxOption = {
  id: string
  name: string
}

type ComboboxSelectorProps = {
  options: ComboboxOption[]
  value: string | null | undefined
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  clearable?: boolean
  /** Trigger height/radius token. Defaults to `md`; use `lg` to align with `Select` triggers. */
  size?: ButtonProps["size"]
  /** Accessible label for the clear button (when `clearable`). */
  clearLabel?: string
}

export function ComboboxSelector({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  clearable = false,
  size = "md",
  clearLabel = "Clear selection",
}: ComboboxSelectorProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.id === value)
  const showClear = clearable && Boolean(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative w-full">
        <PopoverTrigger
          render={
            <Button
              variant="secondary"
              size={size}
              role="combobox"
              aria-expanded={open}
              className={cx(
                "w-full justify-between font-normal",
                showClear && "pr-14",
                !selected && "text-muted-foreground",
              )}
              suffix={<ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />}
            />
          }
        >
          {selected?.name ?? placeholder}
        </PopoverTrigger>

        {showClear && (
          <button
            type="button"
            aria-label={clearLabel}
            onClick={() => {
              onValueChange("")
              setOpen(false)
            }}
            className="absolute inset-y-0 right-7 z-10 inline-flex items-center px-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <XIcon className="size-3.5 shrink-0" />
          </button>
        )}
      </div>

      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.id}
                  value={option.name}
                  onSelect={() => {
                    onValueChange(option.id === value ? "" : option.id)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cx("mr-2 size-4", option.id === value ? "opacity-100" : "opacity-0")}
                  />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
