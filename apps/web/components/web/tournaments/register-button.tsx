"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createRegistrationCheckout } from "~/server/web/tournaments/register"

interface Division {
  id: string
  name: string
  feeCents: number
  capacity: number | null
  _count?: { entries: number }
}

interface RegisterButtonProps {
  tournamentId: string
  divisions: Division[]
  roleCode?: string
}

export function RegisterButton({
  tournamentId,
  divisions,
  roleCode = "COMPETITOR",
}: RegisterButtonProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const totalCents = divisions
    .filter((d) => selectedIds.includes(d.id))
    .reduce((sum, d) => sum + d.feeCents, 0)

  const handleRegister = async () => {
    if (selectedIds.length === 0) return
    setLoading(true)
    setError(null)

    try {
      const result = await createRegistrationCheckout({
        tournamentId,
        divisionIds: selectedIds,
        roleCode,
      })

      if (result?.data?.type === "checkout" && result.data.url) {
        window.location.href = result.data.url
      } else if (result?.data?.type === "free") {
        router.refresh()
      }
    } catch (e: any) {
      setError(e.message ?? "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Select Divisions</h3>

      <div className="space-y-2">
        {divisions.map((div) => {
          const atCapacity = div.capacity != null && (div._count?.entries ?? 0) >= div.capacity
          return (
            <label
              key={div.id}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                atCapacity
                  ? "cursor-not-allowed opacity-50"
                  : selectedIds.includes(div.id)
                    ? "border-primary bg-primary/5"
                    : "hover:border-muted-foreground/50"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(div.id)}
                disabled={atCapacity}
                onChange={() => toggle(div.id)}
                className="size-4"
              />
              <span className="flex-1">
                {div.name}
                {atCapacity && <span className="ml-2 text-xs text-destructive">(Full)</span>}
              </span>
              <span className="text-sm text-muted-foreground">
                {div.feeCents > 0 ? `$${(div.feeCents / 100).toFixed(2)}` : "Free"}
              </span>
            </label>
          )
        })}
      </div>

      {selectedIds.length > 0 && (
        <p className="text-sm font-medium">
          Total: {totalCents > 0 ? `$${(totalCents / 100).toFixed(2)}` : "Free"}
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="button"
        onClick={handleRegister}
        disabled={selectedIds.length === 0 || loading}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {loading ? "Processing…" : selectedIds.length === 0 ? "Select a division" : "Register"}
      </button>
    </div>
  )
}
