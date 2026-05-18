"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Input } from "~/components/common/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"

type FilterOptions = {
  organizations: { id: string; name: string }[]
  disciplines: { id: string; name: string }[]
  ranks: { id: string; name: string; sortOrder: number }[]
}

export function DirectoryFilters({ options }: { options: FilterOptions }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== "__all__") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/directory?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <Stack direction="row" className="mb-6 flex-wrap gap-3">
      <Select
        value={searchParams.get("org") ?? "__all__"}
        onValueChange={v => updateFilter("org", v)}
      >
        <SelectTrigger aria-label="Filter by organization">
          <SelectValue placeholder="All Organizations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Organizations</SelectItem>
          {options.organizations.map(o => (
            <SelectItem key={o.id} value={o.id}>
              {o.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("discipline") ?? "__all__"}
        onValueChange={v => updateFilter("discipline", v)}
      >
        <SelectTrigger aria-label="Filter by discipline">
          <SelectValue placeholder="All Disciplines" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Disciplines</SelectItem>
          {options.disciplines.map(d => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("rank") ?? "__all__"}
        onValueChange={v => updateFilter("rank", v)}
      >
        <SelectTrigger aria-label="Filter by rank">
          <SelectValue placeholder="All Ranks" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Ranks</SelectItem>
          {options.ranks.map(r => (
            <SelectItem key={r.id} value={r.id}>
              {r.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="City"
        defaultValue={searchParams.get("city") ?? ""}
        onBlur={e => updateFilter("city", e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") updateFilter("city", e.currentTarget.value)
        }}
      />

      <Input
        placeholder="State / Region"
        defaultValue={searchParams.get("region") ?? ""}
        onBlur={e => updateFilter("region", e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") updateFilter("region", e.currentTarget.value)
        }}
      />
    </Stack>
  )
}
