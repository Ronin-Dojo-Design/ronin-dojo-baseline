"use client"

import { useState } from "react"
import { createRegistrationCheckout, cancelRegistration } from "~/server/web/tournaments/register"
import { Button } from "~/components/common/button"
import { Badge } from "~/components/common/badge"
import { Checkbox } from "~/components/common/checkbox"
import { Note } from "~/components/common/note"

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
      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <Badge variant="success" size="lg">Registered</Badge>
        <Note>
          Divisions: {existingRegistration.entries.map((e) => e.division.name).join(", ")}
        </Note>
        <Note className="text-xs">
          Status: {existingRegistration.status} · Payment: {existingRegistration.paymentStatus}
        </Note>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          variant="destructive"
          size="md"
          onClick={handleCancel}
          disabled={loading}
          isPending={loading}
        >
          {loading ? "Cancelling…" : "Cancel Registration"}
        </Button>
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
          const isSelected = selectedIds.includes(div.id)
          return (
            <label
              key={div.id}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                atCapacity
                  ? "cursor-not-allowed opacity-50"
                  : isSelected
                    ? "border-primary bg-primary/5"
                    : "hover:border-muted-foreground/50"
              }`}
            >
              <Checkbox
                checked={isSelected}
                disabled={atCapacity}
                onCheckedChange={() => toggle(div.id)}
              />
              <span className="flex-1">
                {div.name}
                {atCapacity && <Badge variant="danger" size="sm" className="ml-2">Full</Badge>}
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

      <Button
        variant="primary"
        size="lg"
        onClick={handleRegister}
        disabled={selectedIds.length === 0 || loading}
        isPending={loading}
      >
        {loading ? "Processing…" : selectedIds.length === 0 ? "Select a division" : "Register"}
      </Button>
    </div>
  )
}
