"use client"

import { useState } from "react"
import { createRegistrationCheckout, cancelRegistration } from "~/server/web/tournaments/register"

interface Division {
  id: string
  name: string
  feeCents: number
  capacity: number | null
  _count?: { entries: number }
}

interface ExistingRegistration {
  id: string
  status: string
  paymentStatus: string
  entries: { division: { name: string } }[]
}

interface RegisterButtonProps {
  tournamentId: string
  divisions: Division[]
  roleCode?: string
  existingRegistration?: ExistingRegistration | null
}

export function RegisterButton({
  tournamentId,
  divisions,
  roleCode = "COMPETITOR",
  existingRegistration,
}: RegisterButtonProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancelled, setCancelled] = useState(false)

  // If user already has a non-cancelled registration, show status + cancel
  if (existingRegistration && existingRegistration.status !== "CANCELLED" && !cancelled) {
    const handleCancel = async () => {
      if (!confirm("Are you sure you want to cancel your registration? This cannot be undone.")) return
      setLoading(true)
      setError(null)

      try {
        await cancelRegistration({ registrationId: existingRegistration.id })
        setCancelled(true)
      } catch (e: any) {
        setError(e.message ?? "Cancellation failed")
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className="space-y-3 rounded-lg border border-green-500/30 bg-green-500/5 p-4">
        <p className="font-semibold text-green-700 dark:text-green-400">
          You are registered
        </p>
        <p className="text-sm text-muted-foreground">
          Divisions: {existingRegistration.entries.map((e) => e.division.name).join(", ")}
        </p>
        <p className="text-xs text-muted-foreground">
          Status: {existingRegistration.status} · Payment: {existingRegistration.paymentStatus}
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? "Cancelling…" : "Cancel Registration"}
        </button>
      </div>
    )
  }

  if (cancelled) {
    return (
      <div className="rounded-lg border border-muted p-4">
        <p className="text-sm text-muted-foreground">Your registration has been cancelled.</p>
      </div>
    )
  }

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
        const url = new URL(window.location.href)
        url.searchParams.set("registered", "true")
        window.location.href = url.toString()
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
