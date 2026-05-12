"use client"

import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/common/button"
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
}

export function ComboboxSelector({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  clearable = false,
}: ComboboxSelectorProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="md"
          role="combobox"
          aria-expanded={open}
          className={cx("w-full justify-between font-normal", !selected && "text-muted-foreground")}
          suffix={
            clearable && value ? (
              <XIcon
                className="size-3.5 shrink-0 opacity-50 hover:opacity-100"
                onClick={e => {
                  e.stopPropagation()
                  onValueChange("")
                  setOpen(false)
                }}
              />
            ) : (
              <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />
            )
          }
        >
          {selected?.name ?? placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
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
